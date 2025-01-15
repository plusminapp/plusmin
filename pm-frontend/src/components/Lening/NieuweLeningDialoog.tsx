import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FormControl, Input, InputAdornment, InputLabel, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Lening } from '../../model/Lening';

import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useCustomContext } from '../../context/CustomContext';
import { useAuthContext } from '@asgardeo/auth-react';
import StyledSnackbar, { SnackbarMessage } from '../StyledSnackbar';
import { Rekening, RekeningSoort } from '../../model/Rekening';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type NieuweLeningDialoogProps = {
  nieuweLeningOpgeslagen: number;
  onChange: (nieuweLeningOpgeslagen: number) => void;
};

export default function NieuweLeningDialoog(props: NieuweLeningDialoogProps) {

  const initialRekening = useMemo(() => ({
    id: 0,
    naam: "",
    rekeningSoort: RekeningSoort.lening,
    nummer: "",
    sortOrder: 0,
  }), []);

  const initialLening = useMemo(() => ({
    id: 0,
    rekening: initialRekening,
    startDatum: dayjs(),
    eindDatum: dayjs(),
    eindBedrag: 0,
    aflossingsBedrag: 0,
    betaalDag: 1,
    dossierNummer: "",
    notities: "",
    leningSaldiDTO: undefined
  }), [initialRekening]);

  const initialMessage = {
    message: undefined,
    type: undefined
  }

  const [open, setOpen] = useState(false);
  const [rekening, setRekening] = useState<Rekening>(initialRekening);
  const [lening, setLening] = useState<Lening>(initialLening);
  // const [errors, setErrors] = useState<{ omschrijving?: string; bedrag?: string }>({});
  const [message, setMessage] = useState<SnackbarMessage>(initialMessage);
  const [isValid, setIsValid] = useState<boolean>(false);

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gebruiker } = useCustomContext();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    props.onChange(props.nieuweLeningOpgeslagen++)
    setOpen(false);
  };

  const handleInputLeningWijziging = <K extends keyof Lening>(key: K, value: Lening[K]) => {
    setLening({ ...lening, [key]: value })
    // const newErrors: { omschrijving?: string; bedrag?: string } = { omschrijving: undefined, bedrag: undefined };
    setIsValid(true)
    // if (key === 'naam' && (value as string).trim() === '') {
    //   newErrors.omschrijving = 'naam mag niet leeg zijn.';
    //   setIsValid(false)
    // }
    // if (key === 'bedrag' && (isNaN(value as number) || value as number <= 0)) {
    //   newErrors.bedrag = 'Bedrag moet een positief getal zijn.';
    //   setIsValid(false)
    // }
    // setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
  };
  const handleInputRekeningWijziging = <K extends keyof Rekening>(key: K, value: Rekening[K]) => {
    setRekening({ ...rekening, [key]: value })
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      try {
        const token = await getIDToken();
        const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
        const response = await fetch(`/api/v1/lening/hulpvrager/${id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              ...lening,
              rekening: rekening,
              startDatum: lening.startDatum.format('YYYY-MM-DD'),
              eindDatum: lening.eindDatum.format('YYYY-MM-DD'),
            }]),
        })
        if (response.ok) {
          setRekening({ ...initialRekening })
          setLening({
            ...initialLening,
            rekening: initialRekening,
          })
          setIsValid(false)
          setMessage({
            message: "Lening is opgeslagen.",
            type: "success"
          })
        } else {
          console.error("Failed to fetch data", response.status);
        }
      } catch (error) {
        console.error('Fout bij opslaan lening:', error);
      }
    } else {
      setMessage({
        message: "Lening is niet geldig, herstel de fouten en probeer het opnieuw.",
        type: "warning"
      })
    }
  }

  return (
    <React.Fragment>
      <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ mt: '10px', ml: 'auto' }}>
        Nieuwe lening
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="lening-titel"
        open={open}
        fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }} id="lening-titel">
          Nieuwe lening
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">De naam van de schuld/lening</InputLabel>
              <Input
                id="omschrijfing"
                // error={!!errors.naam}
                value={rekening.naam}
                type="text"
                onChange={(e) => handleInputRekeningWijziging('naam', e.target.value)}
              />
              {/* {errors.omschrijving && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.omschrijving}</Typography>
              )} */}
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                disableFuture
                slotProps={{ textField: { variant: "standard" } }}
                label="Wanneer is de schuld/lening gestart?"
                value={lening.startDatum}
                onChange={(newvalue) => handleInputLeningWijziging('startDatum', newvalue ? newvalue : dayjs())}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                minDate={dayjs()}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wanneer is de schuld/lening afgelost?"
                value={lening.eindDatum}
                onChange={(newvalue) => handleInputLeningWijziging('eindDatum', newvalue ? newvalue : dayjs())}
              />
            </LocalizationProvider>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Hoe groot is de schuld/lening?</InputLabel>
              <Input
                id="standard-adornment-amount"
                // error={!!errors.bedrag}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                value={lening.eindBedrag}
                type="number"
                onChange={(e) => handleInputLeningWijziging('eindBedrag', parseFloat(e.target.value))}
              />
              {/* {errors.eindBedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.eindBedrag}</Typography>
              )} */}
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Wat wordt er maandelijks afgelost?</InputLabel>
              <Input
                id="standard-adornment-amount"
                // error={!!errors.aflossingsBedrag}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                value={lening.aflossingsBedrag}
                type="number"
                onChange={(e) => handleInputLeningWijziging('aflossingsBedrag', parseFloat(e.target.value))}
              />
              {/* {errors.bedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.aflossingsBedrag}</Typography>
              )} */}
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Op welke dag in de maand wordt het overgemaakt?</InputLabel>
              <Input
                id="standard-adornment-amount"
                // error={!!errors.betaalDag}
                value={lening.betaalDag}
                type="number"
                onChange={(e) => handleInputLeningWijziging('betaalDag', parseFloat(e.target.value))}
              />
              {/* {errors.bedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.betaalDag}</Typography>
              )} */}
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Wat is het dossiernummer?</InputLabel>
              <Input
                id="omschrijfing"
                // error={!!errors.naam}
                value={lening.dossierNummer}
                type="text"
                onChange={(e) => handleInputLeningWijziging('dossierNummer', e.target.value)}
                />
              {/* {errors.omschrijving && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.omschrijving}</Typography>
                )} */}
            </FormControl>
            <TextField
              id="outlined-basic"
              label="Notities"
              variant="standard"
              value={lening.notities}
              fullWidth={true}
              minRows={4}
              onChange={(e) => handleInputLeningWijziging('notities', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSubmit}>
            Bewaar lening
          </Button>
        </DialogActions>
      </BootstrapDialog>
      <StyledSnackbar message={message.message} type={message.type} />
    </React.Fragment>
  );
}
