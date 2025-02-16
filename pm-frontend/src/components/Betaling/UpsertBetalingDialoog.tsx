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
import BetalingsSoortSelect from '../Betaling/BetalingsSoortSelect';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type UpsertBetalingDialoogProps = {
  onBetalingBewaardChange: () => void;
  editMode: boolean;
  betaling?: BetalingDTO;
};

export default function UpsertBetalingDialoog(props: UpsertBetalingDialoogProps) {
  const initialBetalingDTO = useMemo(() => ({
    id: 0,
    boekingsdatum: dayjs(), 
    bedrag: 0,
    omschrijving: ' ',
    betalingsSoort: undefined,
    bron: undefined,
    bestemming: undefined,
    budgetNaam: undefined
  }), []);

  type BetalingDtoErrors = { betalingsSoort?: String, omschrijving?: string; bedrag?: string; boekingsdatum?: string }
  const initialBetalingDtoErrors = { betalingsSoort: undefined, omschrijving: undefined, bedrag: undefined, boekingsdatum: undefined }
  const [open, setOpen] = useState(props.editMode);
  const [betalingDTO, setBetalingDTO] = useState<BetalingDTO>(props.betaling ? { ...props.betaling, boekingsdatum: dayjs(props.betaling.boekingsdatum) } : initialBetalingDTO);
  const [errors, setErrors] = useState<BetalingDtoErrors>(initialBetalingDtoErrors);
  const [message, setMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gebruiker, betalingsSoorten2Rekeningen, gekozenPeriode } = useCustomContext();

  const rekeningPaar = betalingsSoorten2Rekeningen.get(BetalingsSoort.uitgaven)
  useEffect(() => {
    if (!props.editMode) {
      setBetalingDTO({
        ...initialBetalingDTO,
        boekingsdatum: gekozenPeriode?.periodeEindDatum && dayjs().toISOString().slice(0,10) > gekozenPeriode?.periodeEindDatum  ? dayjs(gekozenPeriode?.periodeEindDatum) : dayjs(),
        // bron: rekeningPaar?.bron[0].naam,
        // bestemming: rekeningPaar?.bestemming[0].naam
      });
    }
  }, [rekeningPaar, initialBetalingDTO, props.editMode, props.betaling, gekozenPeriode]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    props.onBetalingBewaardChange()
    setOpen(false);
  };

  const validateKeyValue = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]): string | undefined => {
    if (key === 'betalingsSoort' && !value) {
      return 'Kies een betalingscategorie.';
    }
    if (key === 'omschrijving' && (value as string).trim() === '') {
      return 'Omschrijving mag niet leeg zijn.';
    }
    if (key === 'bedrag' && (isNaN(value as number) || value as number == 0)) {
      return 'Bedrag moet een positief getal zijn.';
    }
    if (key === 'boekingsdatum' && (dayjs(value as dayjs.Dayjs).isBefore(gekozenPeriode?.periodeStartDatum) || dayjs(value as dayjs.Dayjs).isAfter(gekozenPeriode?.periodeEindDatum))) {
      return `De boekingsdatum moet in de gekozen periode liggen (van ${gekozenPeriode?.periodeStartDatum} t/m ${gekozenPeriode?.periodeEindDatum}).`;
    }
    return undefined;
  };

  const handleInputChange = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]) => {
    setBetalingDTO({ ...betalingDTO, [key]: value })
    const error = validateKeyValue(key, value)
    if (error) {
      setErrors({ ...errors, [key]: error });
    } else {  
      setErrors({ ...errors, [key]: undefined }); 
    }
  }

  const validateBetalingDTO = () => {
    const newErrors: BetalingDtoErrors = initialBetalingDtoErrors;
    (Object.keys(initialBetalingDtoErrors) as (keyof BetalingDtoErrors)[]).forEach((key) => {
      const error = validateKeyValue(key, betalingDTO[key]);
      if (error) {
        newErrors[key as keyof BetalingDtoErrors] = error;
      }  
    });  
    setErrors(newErrors);
    return newErrors;
  }  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMessages = Object.values(validateBetalingDTO()).filter(error => error !== undefined).join(' ');
    console.log('errorMessages:', errorMessages)
    if (errorMessages.length == 0) {
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
          props.onBetalingBewaardChange()
          setOpen(false);
        } else {
          setBetalingDTO(initialBetalingDTO)
        }
      } catch (error) {
        console.error('Fout bij opslaan betaling:', error);
      }
    } else {
      setMessage({
        message: `Betaling is niet geldig, herstel de fouten en probeer het opnieuw. ${errorMessages}`,
        type: "error"
      })
    }
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <React.Fragment>
      {!props.editMode &&
        <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ mt: '10px', ml: { md: 'auto', xs: 0 }, mr: { md: 0, xs: 'auto' } }}>
          Nieuwe betaling
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
            {/* <Typography variant="subtitle1">Kies een betalingscategorie</Typography>
            <Typography variant="subtitle1">{betalingDTO.betalingsSoort ? `De keuze is nu een '${betalingsSoortFormatter(betalingDTO.betalingsSoort)}' betaling van '${betalingDTO.bron}' naar '${betalingDTO.bestemming}'` : "Er is nog niet gekozen."}</Typography> */}
            <BetalingsSoortSelect
              betalingsSoort={betalingDTO.betalingsSoort}
              bron={betalingDTO.bron}
              bestemming={betalingDTO.bestemming}
              budget={betalingDTO.budgetNaam}
              onBetalingsSoortChange={(betalingsSoort, bron, bestemming, budgetNaam) => {
                handleInputChange('betalingsSoort', betalingsSoort)
                setBetalingDTO({ ...betalingDTO, betalingsSoort, bron, bestemming, budgetNaam })
              }}
            />
            {errors.betalingsSoort && (
              <Typography style={{ marginTop: '0px', color: 'red', fontSize: '0.75rem' }}>{errors.betalingsSoort}</Typography>
            )}
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Bedrag</InputLabel>
              <Input
                id="standard-adornment-amount"
                error={!!errors.bedrag}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                value={betalingDTO.bedrag}
                type="number"
                onChange={(e) => handleInputChange('bedrag', parseFloat(e.target.value))}
                onFocus={handleFocus}
              />
              {errors.bedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.bedrag}</Typography>
              )}
            </FormControl>
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
                maxDate={dayjs(gekozenPeriode?.periodeEindDatum)}
                minDate={dayjs(gekozenPeriode?.periodeStartDatum)}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wanneer was de betaling?"
                value={betalingDTO.boekingsdatum}
                onChange={(newvalue) => handleInputChange('boekingsdatum', newvalue ? newvalue : dayjs())}
                />
                {errors.boekingsdatum && (
                  <Typography style={{ marginTop: '0px', color: 'red', fontSize: '0.75rem' }}>{errors.boekingsdatum}</Typography>
                )}
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSubmit} startIcon={<SaveIcon sx={{ fontSize: '35px' }} />} >BEWAAR</Button>
        </DialogActions>
      </BootstrapDialog>
      <StyledSnackbar message={message.message} type={message.type} />
    </React.Fragment>
  );
}