import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Box, Typography, Grid, Fab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Tesseract from 'tesseract.js';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/nl'; // Import the Dutch locale
import dayjs from 'dayjs';

dayjs.locale('nl'); // Set the locale to Dutch

const OCRComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<{ date: string, text: string, amount: string }[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null); // Add state for confidence
  const [open, setOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ date: string, text: string, amount: string }>({ date: '', text: '', amount: '' });
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Add state for image source

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        logger: (m) => console.log(m),
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // Set page segmentation mode
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-,.', // Whitelist characters
        tessedit_preserve_interword_spaces: 1 as any, // Preserve interword spaces
      } as Partial<Tesseract.WorkerOptions> // Typecast the entire options object
    ).then(({ data: { text, confidence } }) => { // Get confidence value
      // Filter the OCR text to remove unwanted information
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

    let currentDate = '';
    const parsed = text.split(amountRegex).reduce((acc, line, index, array) => {
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
          if (dateStr === 'vandaag') {
            currentDate = dayjs().format('YYYY-MM-DD');
          } else if (dateStr === 'gisteren') {
            currentDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
          } else if (/\d{1,2} (januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/.test(dateStr)) {
            currentDate = dayjs(`${dateStr} ${year}`, 'D MMMM YYYY', 'nl').format('YYYY-MM-DD');
          } else if (/\d{1,2} (jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)/.test(dateStr)) {
            currentDate = dayjs(`${dateStr} ${year}`, 'D MMM YYYY', 'nl').format('YYYY-MM-DD');
          } else if (/\d{1,2}-\d{1,2}/.test(dateStr)) {
            currentDate = dayjs(`${dateStr}-${year}`, 'D-MM-YYYY').format('YYYY-MM-DD');
          } else {
            currentDate = dateStr;
          }
        }
        if (amountMatch) {
          acc.push({
            date: currentDate,
            text: line.replace(dateRegex, '').trim(),
            amount: amountMatch[0]
          });
        }
      }
      return acc;
    }, [] as { date: string, text: string, amount: string }[]);

    setParsedData(parsed);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditData(parsedData[index]);
    setOpen(true);
  };

  const handleDelete = (index: number) => {
    const newData = [...parsedData];
    newData.splice(index, 1);
    setParsedData(newData);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const newData = [...parsedData];
      newData[editIndex] = editData;
      newData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort data by date
      setParsedData(newData);
      setOpen(false);
    } else {
      const newData = [...parsedData, editData];
      newData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort data by date
      setParsedData(newData);
      setOpen(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setEditData({ ...editData, date: date ? date.format('YYYY-MM-DD') : '' });
  };

  const handleAdd = () => {
    setEditData({ date: '', text: '', amount: '' });
    setEditIndex(null);
    setOpen(true);
  };

  const groupedData = parsedData.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as { [key: string]: { date: string, text: string, amount: string }[] });

  return (
    <Box>
      <Button
        variant="contained"
        component="label"
        disabled={isLoading}
      >
        {isLoading ? 'Verwerken...' : 'Selecteer afbeelding'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </Button>
      {confidence !== null && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Vertrouwen: {confidence.toFixed(2)}%
        </Typography>
      )}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {imageSrc && (
          <Grid item xs={12} md={6}>
            <Box sx={{ height: { xs: '33vh', md: '67vh' }, overflow: 'auto',  border: '1px solid grey', borderRadius: '5px' }}>
              <img src={imageSrc} alt="OCR" style={{ width: '100%', height: 'auto' }} />
            </Box>
          </Grid>
        )}
        <Grid item xs={12} md={imageSrc ? 6 : 12}>
          <Box sx={{ height: { xs: '33vh', md: '67vh' }, overflow: 'auto', border: '1px solid grey', borderRadius: '5px' }}>
            {Object.keys(groupedData).length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ padding: '5px' }}>Tekst</TableCell>
                      <TableCell sx={{ padding: '5px' }}>Bedrag</TableCell>
                      <TableCell sx={{ padding: '5px' }}>Acties</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(groupedData).map((date) => (
                      <React.Fragment key={date}>
                        <TableRow>
                          <TableCell colSpan={3} sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                            {dayjs(date).format('D MMMM')}
                          </TableCell>
                        </TableRow>
                        {groupedData[date].map((item, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ padding: '5px' }}>{item.text}</TableCell>
                            <TableCell sx={{ padding: '5px' }}>{formatAmount(item.amount)}</TableCell>
                            <TableCell sx={{ padding: '5px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => handleEdit(index)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(index)}>
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
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAdd}
      >
        <AddIcon />
      </Fab>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nieuwe gegevens</DialogTitle>
        <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
            <DatePicker
              label="Datum"
              value={editData.date ? dayjs(editData.date) : null}
              onChange={handleDateChange}
              slotProps={{ textField: { variant: "standard" } }}
              />
          </LocalizationProvider>
          <TextField
            margin="dense"
            label="Tekst"
            type="text"
            fullWidth
            value={editData.text}
            onChange={(e) => handleChange('text', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Bedrag"
            type="text"
            fullWidth
            value={editData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
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
    </Box>
  );
};

export default OCRComponent;