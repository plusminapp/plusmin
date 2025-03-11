import { Accordion, AccordionDetails, AccordionSummary, FormControl, Input, InputLabel, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';

import dayjs from "dayjs";
import ChartExample from "../components/Budget/ChartExample";
import { Budget } from "../model/Budget";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";
import { ExpandMore } from "@mui/icons-material";

// experimenteer
const budget = {
  budgetNaam: 'budget',
  budgetType: 'continu',
  budgetPeriodiciteit: 'week',
  bedrag: 100,
  budgetten: [],
} as unknown as Budget;

export default function Login() {

  type Blaat = {
    peilDatum: dayjs.Dayjs;
    besteedOpPeildatum: number;
    budgetPerWeek: number;
  }
  const [blaat, setBlaat] = useState<Blaat>({
    peilDatum: dayjs(), besteedOpPeildatum: 200, budgetPerWeek: 100
  });

  const handleInputChange = (key: string, value: any) => {
    setBlaat({ ...blaat, [key]: value });
  };

  return (
    <>
      <Typography variant='h4'>Dit is de App van de PlusMin gereedschapskist.</Typography>
      <Typography sx={{ my: '25px' }}>
        Deze App is een demo app en dus NIET de uiteindelijke app voor de gebruiker. Het is bedoeld om de werking van de toekomstige app uit te kunnen leggen.
      </Typography>
      <Typography sx={{ my: '25px' }}>
        Op <a href="https://plusmingereedschapskist.nl">https://plusmingereedschapskist.nl</a> kun je meer informatie vinden.
      </Typography>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <Typography variant='body2'>Experimenteren met de visualisatie van uitputting van budgetten?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} alignItems="center">
            <Grid >
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
                <DatePicker
                  sx={{ color: 'success.main' }}
                  slotProps={{ textField: { variant: "standard" } }}
                  label="Wat is de peildatum?"
                  value={blaat.peilDatum}
                  onChange={(newvalue) => handleInputChange('peilDatum', newvalue ? newvalue : dayjs())}
                />
              </LocalizationProvider>
            </Grid>
            <Grid minWidth={'240px'}>
              <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
                <InputLabel htmlFor="betaling-omschrijving">Wat is er besteed op de peildatum?</InputLabel>
                <Input
                  id="betaling-omschrijving"
                  value={blaat.besteedOpPeildatum}
                  type="number"
                  onChange={(e) => handleInputChange('besteedOpPeildatum', e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid minWidth={'240px'}>
              <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
                <InputLabel htmlFor="betaling-omschrijving">Wat is het budget per week?</InputLabel>
                <Input
                  id="betaling-omschrijving"
                  value={blaat.budgetPerWeek}
                  type="number"
                  onChange={(e) => handleInputChange('budgetPerWeek', e.target.value)}
                />
              </FormControl>
            </Grid>
          </Grid>
          <ChartExample peildatum={blaat.peilDatum} budget={{ ...budget, bedrag: blaat.budgetPerWeek }} besteedOpPeildatum={Number(blaat.besteedOpPeildatum)} />
        </AccordionDetails>
      </Accordion >
    </>
  )
}