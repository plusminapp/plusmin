import React, { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { AlertColor, FormControl, Input, InputAdornment, InputLabel, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BetalingDTO, BetalingsSoort } from '../../model/Betaling';

import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useCustomContext } from '../../context/CustomContext';
import { useAuthContext } from '@asgardeo/auth-react';
import BetalingsSoortSelect from './BetalingsSoortSelect';
import StyledSnackbar, { SnackbarMessage } from '../StyledSnackbar';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function NieuweBetalingDialoog() {

  const initialBetalingDTO = useMemo(() => ({
    id: 0,
    boekingsdatum: dayjs(),
    bedrag: 0,
    omschrijving: ' ',
    betalingsSoort: BetalingsSoort.uitgaven,
    bron: undefined,
    bestemming: undefined,
}), []);

  const initialMessage = {
    message: undefined,
    type: undefined
  }

  const [open, setOpen] = useState(false);
  const [betalingDTO, setBetalingDTO] = useState<BetalingDTO>(initialBetalingDTO);
  const [errors, setErrors] = useState<{ omschrijving?: string; bedrag?: string }>({});
  const [message, setMessage] = useState<SnackbarMessage>(initialMessage);

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gebruiker, betalingsSoorten2Rekeningen } = useCustomContext();
  const threeMonthsAgo = dayjs().subtract(3, 'month');

  const rekeningPaar = betalingsSoorten2Rekeningen.get(BetalingsSoort.uitgaven)
  useEffect(() => {
    setBetalingDTO({
      ...initialBetalingDTO,
      bron: rekeningPaar?.bron[0].naam,
      bestemming: rekeningPaar?.bestemming[0].naam
    })
  }, [rekeningPaar, initialBetalingDTO])

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]) => {
    setBetalingDTO({ ...betalingDTO, [key]: value })
  };

  const validateForm = (): boolean => {
    const newErrors: { omschrijving?: string; bedrag?: string } = {};

    let isValid = true;
    if (!betalingDTO.omschrijving || betalingDTO.omschrijving.trim() === '') {
      newErrors.omschrijving = 'Omschrijving mag niet leeg zijn.';
      setMessage({ message: 'Omschrijving is niet geldig: het mag niet leeg zijn.', type: "error" as AlertColor })
      isValid = false;
    } 
    if (betalingDTO.bedrag || isNaN(betalingDTO.bedrag) || betalingDTO.bedrag <= 0) {
      newErrors.bedrag = 'Bedrag moet een positief getal zijn.';
      setMessage({ message: 'Bedrag is niet geldig: het moet een getal, groter dan 0 zijn.', type: "error" as AlertColor })
      isValid = false;
    } 
    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const token = await getIDToken();
        const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
        const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              ...betalingDTO,
              omschrijving: betalingDTO.omschrijving?.trim(),
              boekingsdatum: betalingDTO.boekingsdatum.format('YYYYMMDD'),
            }]),
        })
        if (response.ok) {
          setBetalingDTO(initialBetalingDTO);
        } else {
          console.error("Failed to fetch data", response.status);
        }
      } catch (error) {
        console.error('Fout bij opslaan betaling:', error);
      }
    }
  }

  return (
    <React.Fragment>
      <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ mt: '10px' }}>
        Nieuwe betaling
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Nieuwe betaling
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
            <BetalingsSoortSelect
              betalingsSoort={betalingDTO.betalingsSoort}
              bron={betalingDTO.bron}
              bestemming={betalingDTO.bestemming}
              onChange={(betalingsSoort, bron, bestemming) => {
                setBetalingDTO({ ...betalingDTO, betalingsSoort, bron, bestemming })
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSubmit}>
            Bewaar betaling
          </Button>
        </DialogActions>
      </BootstrapDialog>
      <StyledSnackbar message={message.message} type={message.type} />

    </React.Fragment>
  );
}
