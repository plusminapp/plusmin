import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Box, Typography, Fab, useMediaQuery, useTheme, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Tesseract from 'tesseract.js';
import { LocalizationProvider, DatePicker, ArrowDropDownIcon } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/nl'; // Import the Dutch locale
import dayjs from 'dayjs';
import { BetalingDTO } from '../model/Betaling';

dayjs.locale('nl'); // Set the locale to Dutch

// type BetalingDTO = {
//   boekingsdatum: string;
//   omschrijving: string;
//   bedrag: string;
//   sortOrder: string;
// };

const initialBetalingDTO = {
  id: 0,
  boekingsdatum: dayjs(),
  omschrijving: '',
  ocrOmschrijving: '',
  bedrag: 0,
  sortOrder: '',
  betalingsSoort: undefined,
  bron: undefined,
  bestemming: undefined,
  budgetNaam: undefined
}

const OCRComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ocrData, setOcdData] = useState<string>('');
  const [parsedData, setParsedData] = useState<BetalingDTO[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null); // Add state for confidence
  const [open, setOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<BetalingDTO>(initialBetalingDTO);
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Add state for image source

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParsedData([]); // Clear parsed data
    setConfidence(null); // Clear confidence value
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageSrc(URL.createObjectURL(file)); // Set image source
      handleFileUpload(file);
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
      setOcdData(text);
      const filteredText = text.replace(/^\d{2}:\d{2}.*\n/, '').trim();
      setConfidence(confidence); // Set confidence value
      parseText(filteredText);
      setIsLoading(false);
    }).catch((error) => {
      console.error('OCR error:', error);
      setIsLoading(false);
    });
  };

  const formatAmount = (amount: string): string => {
    return parseFloat(amount
      .replace('.', '')
      .replace(',', '.'))
      .toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const parseText = (text: string) => {
    const dateRegex = /((vandaag|gisteren)?( - )?\d{1,2} (januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december|jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)( \d{4})?|(vandaag|gisteren)( - )?)/i;
    const amountRegex = /([+-]?\d{1,3}(?:\.\d{3})*,\d{2})/g;

    // Verwijder alle tekst vóór de eerste datum
    const firstDateMatch = text.match(dateRegex);
    if (firstDateMatch && firstDateMatch.index !== undefined) {
      text = text.substring(firstDateMatch.index);
    }

    let currentDate = dayjs();
    let sortOrderBase = 900;
    const parsed = text.split(amountRegex).reduce((acc, line, index, array) => {
      console.log('line', line);
      if (index % 2 === 0) {
        const dateMatch = line.match(dateRegex);
        const amountMatch = array[index + 1] ? array[index + 1].match(amountRegex) : null;

        if (dateMatch) {
          let dateStr = dateMatch[0].toLowerCase();
          console.log('dateStr1', dateStr);
          if (dateStr.includes('-')) {
            dateStr = dateStr.split('-')[1].trim();
          }
          console.log('dateStr2', dateStr);
          const yearMatch = dateStr.match(/\d{4}/);
          const year = yearMatch ? '' : dayjs().year();
          console.log('year', yearMatch, year);
          if (dateStr === 'vandaag') {
            currentDate = dayjs();
          } else if (dateStr === 'gisteren') {
            currentDate = dayjs().subtract(1, 'day');
          } else if (/\d{1,2} (januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/.test(dateStr)) {
            currentDate = dayjs(`${dateStr} ${year}`, 'D MMMM YYYY', 'nl');
          } else if (/\d{1,2} (jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)/.test(dateStr)) {
            currentDate = dayjs(`${dateStr} ${year}`, 'D MMM YYYY', 'nl');
          } else if (/\d{1,2}-\d{1,2}/.test(dateStr)) {
            currentDate = dayjs(`${dateStr}-${year}`, 'D-MM-YYYY');
          } else {
            currentDate = dayjs();
          }
          console.log('currentDate', currentDate.format('YYYY-MM-DD'));

          sortOrderBase = 900; // Reset sortOrderBase for a new date
        }
        if (amountMatch) {
          acc.push({
            id: 0,
            boekingsdatum: currentDate,
            omschrijving: '',
            ocrOmschrijving: line.replace(dateRegex, '').trim(),
            bedrag: Number(amountMatch[0]),
            sortOrder: `${dayjs(currentDate).format('YYYYMMDD')}.${sortOrderBase}`,
            betalingsSoort: undefined,
            bron: undefined,
            bestemming: undefined,
            budgetNaam: undefined
          });
          sortOrderBase -= 10; // Decrease sortOrderBase for the next entry
        } else {
          console.log('Geen bedrag gevonden voor regel:', line);
        }
      }
      return acc;
    }, [] as BetalingDTO[]);

    setParsedData(parsed);
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
        console.log(`Oorspronkelijke sortOrder: ${originalSortOrder}, Gewijzigde sortOrder: ${newSortOrder}`);
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
      console.log(`Nieuwe sortOrder: ${newSortOrder}`);
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

  const groupedData = parsedData.reduce((acc, item) => {
    if (!acc[item.boekingsdatum.format('YYYY-MM-DD')]) {
      acc[item.boekingsdatum.format('YYY-MM-DD')] = [];
    }
    acc[item.boekingsdatum.format('YYY-MM-DD')].push(item);
    return acc;
  }, {} as { [key: string]: BetalingDTO[] });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Bank app afbeelding</Typography>
      <Grid container flexDirection='row' justifyContent="flex-end">
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
      {confidence !== null && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Vertrouwen: {confidence.toFixed(2)}%
        </Typography>
      )}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '33vh', md: '67vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
            {imageSrc ?
              <img src={imageSrc} alt="OCR" style={{ width: '100%', height: 'auto' }} /> :
              <Typography variant={isXs ? "h5" : isSm ? "h4" : isMdUp ? "h3" : "body1"} width={'50%'} textAlign={'center'} margin='auto' fontWeight={'bold'} color='lightgrey'>
                Hier komt de afbeelding zodra je die hebt gekozen
              </Typography>}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} >
          <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '33vh', md: '67vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
            {parsedData.length === 0 && (
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
                          <TableCell colSpan={4} sx={{ fontWeight: '900', padding: '5px' }}>
                            {dayjs(date).year() === dayjs().year() ? dayjs(date).format('D MMMM') : dayjs(date).format('D MMMM YYYY')}
                          </TableCell>
                        </TableRow>
                        {groupedData[date].map((item) => (
                          <TableRow key={item.sortOrder}>
                            <TableCell sx={{ padding: '5px' }}>{item.omschrijving}</TableCell>
                            <TableCell sx={{ padding: '5px' }}>{formatAmount((item.bedrag.toString()))}</TableCell>
                            <TableCell sx={{ padding: '5px' }}>{item.sortOrder}</TableCell>
                            <TableCell sx={{ padding: '5px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => handleEdit(item.sortOrder)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(item.sortOrder)}>
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
      {parsedData.length > 0 &&
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
        <Accordion>
    <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
      <Typography variant="caption">Grouped Data Debug</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="caption">
        {JSON.stringify(groupedData, null, 2)}
      </Typography>
    </AccordionDetails>
  </Accordion>
    </Box>
  );
};

export default OCRComponent;