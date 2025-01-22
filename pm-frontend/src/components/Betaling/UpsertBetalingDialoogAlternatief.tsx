import React, { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { FormControl, Input, InputAdornment, InputLabel, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BetalingDTO, BetalingsSoort } from '../../model/Betaling';

import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useCustomContext } from '../../context/CustomContext';
import { useAuthContext } from '@asgardeo/auth-react';
import StyledSnackbar, { SnackbarMessage } from '../StyledSnackbar';
import BetalingsSoortSelectAlternatief from './BetalingsSoortSelectAlternatief';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type NieuweBetalingDialoogProps = {
  onBetalingBewaardChange: () => void;
  editMode: boolean;
  betaling?: BetalingDTO;
};

export default function UpsertBetalingDialoogAlternatief(props: NieuweBetalingDialoogProps) {
  const initialBetalingDTO = useMemo(() => ({
    id: 0,
    boekingsdatum: dayjs(),
    bedrag: 0,
    omschrijving: ' ',
    betalingsSoort: BetalingsSoort.uitgaven,
    bron: undefined,
    bestemming: undefined,
  }), []);

  const [open, setOpen] = useState(props.editMode);
  const [betalingDTO, setBetalingDTO] = useState<BetalingDTO>(props.betaling ? { ...props.betaling, boekingsdatum: dayjs(props.betaling.boekingsdatum) } : initialBetalingDTO);
  const [errors, setErrors] = useState<{ omschrijving?: string; bedrag?: string }>({});
  const [message, setMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });
  const [isValid, setIsValid] = useState<boolean>(props.editMode ? true : false);

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gebruiker, betalingsSoorten2Rekeningen } = useCustomContext();
  const threeMonthsAgo = dayjs().subtract(3, 'month');

  const rekeningPaar = betalingsSoorten2Rekeningen.get(BetalingsSoort.uitgaven)
  useEffect(() => {
    if (!props.editMode) {
      setBetalingDTO({
        ...initialBetalingDTO,
        bron: rekeningPaar?.bron[0].naam,
        bestemming: rekeningPaar?.bestemming[0].naam
      });
    }
  }, [rekeningPaar, initialBetalingDTO, props.editMode, props.betaling]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    props.onBetalingBewaardChange()
    setOpen(false);
  };

  const handleInputChange = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]) => {
    setBetalingDTO({ ...betalingDTO, [key]: value })
    const newErrors: { omschrijving?: string; bedrag?: string } = { omschrijving: undefined, bedrag: undefined };
    setIsValid(true)
    if (key === 'omschrijving' && (value as string).trim() === '') {
      newErrors.omschrijving = 'Omschrijving mag niet leeg zijn.';
      setIsValid(false)
    }
    if (key === 'bedrag' && (isNaN(value as number) || value as number == 0)) {
      newErrors.bedrag = 'Bedrag moet een positief getal zijn.';
      setIsValid(false)
    }
    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      try {
        const token = await getIDToken();
        const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
        const url = props.editMode ? `/api/v1/betalingen/${betalingDTO.id}` : `/api/v1/betalingen/hulpvrager/${id}`
        const body = {
          ...betalingDTO,
          omschrijving: betalingDTO.omschrijving?.trim(),
          boekingsdatum: betalingDTO.boekingsdatum.format('YYYY-MM-DD'),
        }
        await fetch(url, {
          method: props.editMode ? "PUT" : "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: props.editMode ? JSON.stringify(body) : JSON.stringify([body]),
        })
        setMessage({
          message: "Betaling is opgeslagen.",
          type: "success"
        })
        if (props.editMode) {
          setIsValid(true)
          props.onBetalingBewaardChange()
          setOpen(false);
        } else {
          setIsValid(false)
          setBetalingDTO({
            ...initialBetalingDTO,
            bron: rekeningPaar?.bron[0].naam,
            bestemming: rekeningPaar?.bestemming[0].naam
          })
        }
      } catch (error) {
        console.error('Fout bij opslaan betaling:', error);
      }
    } else {
      setMessage({
        message: "Betaling is niet geldig, herstel de fouten en probeer het opnieuw.",
        type: "warning"
      })
    }
  }

  return (
    <React.Fragment>
      {!props.editMode &&
        <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ my: '10px' }}>
          Alternatief
        </Button>
      }
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {props.editMode ? "Bewerk betaling" : "Nieuwe betaling"}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Kies een betalingssoort</Typography>
            <Typography variant="subtitle1">De keuze is nu: een betaling van {betalingDTO.bron} naar {betalingDTO.bestemming}</Typography>
          <BetalingsSoortSelectAlternatief
              betalingsSoort={betalingDTO.betalingsSoort}
              bron={betalingDTO.bron}
              bestemming={betalingDTO.bestemming}
              onBetalingsSoortChange={(betalingsSoort, bron, bestemming) => {
                setBetalingDTO({ ...betalingDTO, betalingsSoort, bron, bestemming })
              }}
            />
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Geef een korte omschrijving *</InputLabel>
              <Input
                id="omschrijfing"
                error={!!errors.omschrijving}
                value={betalingDTO.omschrijving}
                type="text"
                onChange={(e) => handleInputChange('omschrijving', e.target.value)}
              />
              {errors.omschrijving && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.omschrijving}</Typography>
              )}
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                disableFuture
                minDate={threeMonthsAgo}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wanneer was de betaling?"
                value={betalingDTO.boekingsdatum}
                onChange={(newvalue) => handleInputChange('boekingsdatum', newvalue ? newvalue : dayjs())}
              />
            </LocalizationProvider>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Bedrag</InputLabel>
              <Input
                id="standard-adornment-amount"
                error={!!errors.bedrag}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                value={betalingDTO.bedrag}
                type="number"
                onChange={(e) => handleInputChange('bedrag', parseFloat(e.target.value))}
              />
              {errors.bedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.bedrag}</Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSubmit} startIcon={<SaveIcon />} />
        </DialogActions>
      </BootstrapDialog>
      <StyledSnackbar message={message.message} type={message.type} />
    </React.Fragment>
  );
}