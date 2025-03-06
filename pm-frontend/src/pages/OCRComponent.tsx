import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Box, Typography, Fab, useMediaQuery, useTheme, Accordion, AccordionSummary, AccordionDetails, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Tesseract from 'tesseract.js';
import { LocalizationProvider, DatePicker, ArrowDropDownIcon } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/nl'; // Import the Dutch locale
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { BetalingDTO, BetalingOcrValidatieWrapper } from '../model/Betaling';
import { updateAfbeelding } from '../components/Ocr/UpdateAfbeelding'; // Import the updateAfbeelding function
import { parseText } from '../components/Ocr/ParseTekst';
import { RekeningSelect } from '../components/Rekening/RekeningSelect';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';
import { useNavigate } from 'react-router-dom';
import { Saldo } from '../model/Saldo';
import { Rekening } from '../model/Rekening';

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('nl'); // Set the locale to Dutch

const initialBetalingDTO = {
  id: 0,
  boekingsdatum: dayjs(),
  omschrijving: '',
  ocrOmschrijving: '',
  bedrag: 0,
  sortOrder: '',
  bestaatAl: false,
  betalingsSoort: undefined,
  bron: undefined,
  bestemming: undefined,
  budgetNaam: undefined
}

const OCRComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ocrData, setOcdData] = useState<string>('');
  const [parsedData, setParsedData] = useState<BetalingDTO[]>([]);
  const [validatedData, setValidatedData] = useState<BetalingOcrValidatieWrapper>({ betalingen: [] });
  const [confidence, setConfidence] = useState<number | null>(null); // Add state for confidence
  const [open, setOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<BetalingDTO>(initialBetalingDTO);
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Add state for image source
  const [toonUpdatedAfbeelding, setToonUpdatedAfbeelding] = useState<boolean>(localStorage.getItem('toonUpdatedAfbeelding') === 'true'); // Add state for image source
  const [updatedImageSrc, setUpdatedImageSrc] = useState<string | null>(null);
  const [ocrBankRekening, setOcrBankRekening] = useState<Rekening | undefined>(undefined);

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, setSnackbarMessage } = useCustomContext();
  const navigate = useNavigate();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleToonUpdatedAfbeelding = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonUpdatedAfbeelding', event.target.checked.toString());
    setToonUpdatedAfbeelding(event.target.checked);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setParsedData([]); // Clear parsed data
    setConfidence(null); // Clear confidence value
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageSrc(URL.createObjectURL(file)); // Set image source

      try {
        const updatedFile = await updateAfbeelding(file, ocrBankRekening?.bankNaam); // Update the image
        setUpdatedImageSrc(URL.createObjectURL(updatedFile)); // Set image source
        handleFileUpload(updatedFile); // Use the updated image for OCR
      } catch (error) {
        console.error('Error updating image:', error);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    Tesseract.recognize(
      file,
      'nld', // Change language to Dutch
      {
        // logger: (m) => console.log(m),
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // Set page segmentation mode
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-,.', // Whitelist characters
        tessedit_char_blacklist: '€', // Blacklist characters
        tessedit_preserve_interword_spaces: 1 as any, // Preserve interword spaces
      } as Partial<Tesseract.WorkerOptions> // Typecast the entire options object
    ).then(({ data: { text, confidence } }) => { // Get confidence value
      const filteredText = text.replace(/^\d{2}:\d{2}.*\n/, '').trim();
      setOcdData(text + ' <<>> ' + filteredText);
      setConfidence(confidence); // Set confidence value
      const parsedData = parseText(filteredText); // Use the pure function
      setParsedData(parsedData); // Set the parsed data
      setIsLoading(false);
    }).catch((error) => {
      console.error('OCR error:', error);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const valideerBetalingen = async () => {
      if (actieveHulpvrager && ocrBankRekening && parsedData.length > 0) {
        setIsLoading(true);
        const id = actieveHulpvrager.id
        let token = '';
        try { token = await getIDToken() }
        catch (error) {
          navigate('/login');
        }
        const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}/betalingocrvalidatie`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            'saldoOpLaatsteBetalingDatum': { 'id': 0, 'rekeningNaam': ocrBankRekening?.naam, 'bedrag': 0 } as Saldo,
            'betalingen': parsedData.map(betaling => ({
              ...betaling,
              boekingsdatum: dayjs(betaling.boekingsdatum).format('YYYY-MM-DD')
            }))
          })
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setValidatedData({
            'laatsteBetalingDatum': result.laatsteBetalingDatum,
            'saldoOpLaatsteBetalingDatum': result.saldoOpLaatsteBetalingDatum,
            'betalingen': result.betalingen.map((betaling: BetalingDTO) => ({
              ...betaling,
              boekingsdatum: dayjs(betaling.boekingsdatum)
            }))
          })
        } else {
          console.error("Failed to fetch data", response.status);
          setSnackbarMessage({
            message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
            type: "warning",
          })
        }
      }
    };
    valideerBetalingen();

  }, [ocrBankRekening, parsedData, actieveHulpvrager, getIDToken]);


  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const wijzigOcrBankRekening = (bankRekening: Rekening | undefined) => {
    setOcrBankRekening(bankRekening);
  };

  const handleEdit = (sortOrder: string) => {
    const recordToEdit = parsedData.find(item => item.sortOrder === sortOrder);
    if (recordToEdit) {
      setEditData(recordToEdit);
      setOpen(true);
    }
  };

  const handleDelete = (sortOrder: string) => {
    const newData = parsedData.filter(item => item.sortOrder !== sortOrder);
    setParsedData(newData);
  };

  const handleSave = () => {
    if (editData.sortOrder) {
      const newData = [...parsedData];
      const originalSortOrder = editData.sortOrder;
      const originalDatePart = originalSortOrder.split('.')[0];
      const newSortPart = (Number(originalSortOrder.split('.')[1]) + 1).toString();
      const newDatePart = dayjs(editData.boekingsdatum).format('YYYYMMDD');

      if (originalDatePart !== newDatePart) {
        const newSortOrder = `${newDatePart}.${newSortPart}`;
        const index = newData.findIndex(item => item.sortOrder === originalSortOrder);
        newData[index] = { ...editData, sortOrder: newSortOrder };
      } else {
        const index = newData.findIndex(item => item.sortOrder === originalSortOrder);
        newData[index] = { ...editData, sortOrder: originalSortOrder };
      }

      newData.sort((a, b) => b.sortOrder.localeCompare(a.sortOrder)); // Sort data by sortOrder descending
      setParsedData(newData);
      setOpen(false);
    } else {
      const newDatePart = dayjs(editData.boekingsdatum).format('YYYYMMDD');
      const sameDateItems = parsedData.filter(item => item.sortOrder.startsWith(newDatePart));
      const smallestSortOrder = sameDateItems.length > 0 ? Math.min(...sameDateItems.map(item => parseInt(item.sortOrder.split('.')[1]))) : 900;
      const newSortOrder = `${newDatePart}.${smallestSortOrder - 10}`;
      const newData = [...parsedData, { ...editData, sortOrder: newSortOrder }];
      newData.sort((a, b) => b.sortOrder.localeCompare(a.sortOrder)); // Sort data by sortOrder descending
      setParsedData(newData);
      setOpen(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setEditData({ ...editData, boekingsdatum: date ? date : dayjs() });
  };

  const handleAdd = () => {
    setEditData(initialBetalingDTO);
    setOpen(true);
  };

  const groupedData = validatedData.betalingen.reduce((acc, item) => {
    if (!acc[item.boekingsdatum.format('YYYY-MM-DD')]) {
      acc[item.boekingsdatum.format('YYYY-MM-DD')] = [];
    }
    acc[item.boekingsdatum.format('YYYY-MM-DD')].push(item);
    return acc;
  }, {} as { [key: string]: BetalingDTO[] });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Bank app afbeelding</Typography>
      <Grid container flexDirection='row' justifyContent="space-between" alignItems="center">
        <RekeningSelect
          wijzigOcrBankNaam={wijzigOcrBankRekening} />
        <Button
          color='success'
          variant="contained"
          component="label"
          disabled={isLoading}
        >
          {isLoading ? 'Verwerken...' : ocrData ? 'Bewaar Betalingen' : 'Selecteer afbeelding'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </Button>
      </Grid>
      <Grid container flexDirection='row' justifyContent="flex-end">
        <Typography variant="body2" sx={{ mt: 1 }}>
          {ocrBankRekening ? `Bank: ${ocrBankRekening}` : ''} {confidence ? `Vertrouwen: ${confidence.toFixed(2)}%` : ''}
        </Typography>
        <FormGroup sx={{ ml: 'auto' }} >
          <FormControlLabel control={
            <Switch
              sx={{ transform: 'scale(0.6)' }}
              checked={toonUpdatedAfbeelding}
              onChange={handleToonUpdatedAfbeelding}
              inputProps={{ 'aria-label': 'controlled' }}
            />}
            label="Toon aangepaste afbeelding" />
        </FormGroup>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: toonUpdatedAfbeelding ? 4 : 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '33vh', md: '67vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
            {imageSrc ?
              <img src={imageSrc} alt="OCR" style={{ width: '100%', height: 'auto' }} /> :
              <Typography variant={isXs ? "h5" : isSm ? "h4" : isMdUp ? "h3" : "body1"} width={'50%'} textAlign={'center'} margin='auto' fontWeight={'bold'} color='lightgrey'>
                Hier komt de afbeelding zodra je die hebt gekozen
              </Typography>}
          </Box>
        </Grid>
        {toonUpdatedAfbeelding &&
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '33vh', md: '67vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
              {updatedImageSrc ?
                <img src={updatedImageSrc} alt="OCR" style={{ width: '100%', height: 'auto' }} /> :
                <Typography variant={isXs ? "h5" : isSm ? "h4" : isMdUp ? "h3" : "body1"} width={'50%'} textAlign={'center'} margin='auto' fontWeight={'bold'} color='lightgrey'>
                  Hier komt de aangepaste afbeelding zodra is verwerkt
                </Typography>}
            </Box>
          </Grid>}
        <Grid size={{ xs: 12, md: toonUpdatedAfbeelding ? 4 : 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '33vh', md: '67vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
            {validatedData.betalingen.length === 0 && (
              <Typography variant={isXs ? "h5" : isSm ? "h4" : isMdUp ? "h3" : "body1"} width={'50%'} textAlign={'center'} margin='auto' fontWeight={'bold'} color='lightgrey'>
                Hier komen de voorgestelde betalingen zodra de afbeelding is verwerkt
              </Typography>
            )}
            {Object.keys(groupedData).length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {Object.keys(groupedData).map((date) => (
                      <React.Fragment key={date}>
                        <TableRow>
                          <TableCell colSpan={3} sx={{ fontWeight: '900', padding: '5px' }}>
                            {dayjs(date).year() === dayjs().year() ? dayjs(date).format('D MMMM') : dayjs(date).format('D MMMM YYYY')}
                          </TableCell>
                        </TableRow>
                        {groupedData[date].map((item) => (
                          <TableRow key={item.sortOrder}>
                            <TableCell sx={{ padding: '5px' }}>
                              {item.ocrOmschrijving}
                              {item.bestaatAl &&
                                <>
                                  <br />
                                  <Typography variant="caption" color="error">Bestaat al met omschrijving {item.omschrijving}</Typography>
                                </>}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }}>{formatAmount((item.bedrag.toString()))}</TableCell>
                            <TableCell sx={{ padding: '5px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => handleEdit(item.sortOrder)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(item.sortOrder)} color={item.bestaatAl ? 'error' : 'default'}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Grid>
      </Grid>
      {validatedData.betalingen.length > 0 &&
        <Fab
          color="success"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAdd}
        >
          <AddIcon />
        </Fab>}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nieuwe gegevens</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
            <DatePicker
              label="Datum"
              value={editData.boekingsdatum ? dayjs(editData.boekingsdatum) : null}
              onChange={handleDateChange}
              slotProps={{ textField: { variant: "standard" } }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            label="Omschrijving"
            type="text"
            fullWidth
            value={editData.omschrijving}
            onChange={(e) => handleChange('omschrijving', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Bedrag"
            type="text"
            fullWidth
            value={editData.bedrag}
            onChange={(e) => handleChange('bedrag', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Annuleren
          </Button>
          <Button onClick={handleSave} color="primary">
            Bewaar
          </Button>
        </DialogActions>
      </Dialog>
      {ocrData &&
        <Accordion >
          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
            <Typography variant="caption">OCR ruwe data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption">
              {ocrData}
            </Typography>
          </AccordionDetails>
        </Accordion>}
      {validatedData &&
        <Accordion >
          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
            <Typography variant="caption">OCR ruwe data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {validatedData.betalingen.map((betaling, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="caption">{betaling.boekingsdatum.format('D MMMM')} {betaling.ocrOmschrijving} {betaling.bedrag} {betaling.bestaatAl ? `bestaat al met omschrijving ${betaling.omschrijving}` : 'bestaat nog niet'}  </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>}
    </Box>
  );
};

export default OCRComponent;