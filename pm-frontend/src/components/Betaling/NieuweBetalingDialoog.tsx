import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FormControl, Input, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Skeleton, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { betalingsSoortFormatter } from '../../model/Betaling';

import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/nl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useCustomContext } from '../../context/CustomContext';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function CustomizedDialogs() {
  const [open, setOpen] = React.useState(false);
  const [datum, setDatum] = React.useState<Dayjs | null>(dayjs());
  const [betalingsSoort, setbetalingsSoort] = React.useState<string | undefined>(undefined);
  // const [betaalMethode, setBetaalMethode] = React.useState<string>("");
  const [omschrijving, setOmschrijving] = React.useState<string>("");

  const { betalingsSoorten } = useCustomContext();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleBetalingsSoortChange = (event: SelectChangeEvent) => {
    setbetalingsSoort(event.target.value);
  };


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
            <TextField
              variant="standard"
              id="outlined-controlled"
              label="Omschrijving?"
              value={omschrijving}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setOmschrijving(event.target.value);
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                slotProps={{ textField: { variant: "standard" } }}
                label="Wanneer was de betaling?"
                value={datum}
                onChange={(newValue) => setDatum(newValue)}
              />
            </LocalizationProvider>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Bedrag</InputLabel>
              <Input
                id="standard-adornment-amount"
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="demo-simple-select-standard-label">Soort betaling kiezen</InputLabel>
              <Select
                variant="standard"
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={betalingsSoort}
                onChange={handleBetalingsSoortChange}
                label="Soort betaling kiezen">
                {betalingsSoorten.map((bs) => (
                  <MenuItem value={bs}>{betalingsSoortFormatter(bs)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {betalingsSoort === undefined &&
              <>
                <Skeleton sx={{ my: '5px' }} variant="rectangular" width='100%' height={50} />
                <Skeleton sx={{ my: '5px' }} variant="rectangular" width='100%' height={50} />
              </>
            }
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Bewaar betaling
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
