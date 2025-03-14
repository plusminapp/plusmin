import { Box, FormControl, Input, InputLabel, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';

import dayjs from "dayjs";
import BudgetContinuGrafiek from "../components/Budget/BudgetContinuGrafiek";
import { Budget } from "../model/Budget";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import { berekenPeriodeBijPeildatum, dagenSindsStartPeriode, Periode } from "../model/Periode";
import { InfoIcon } from "../icons/Info";
import { useCustomContext } from "../context/CustomContext";
import { Rekening, RekeningSoort } from "../model/Rekening";

const budget = {
  budgetNaam: 'budget',
  budgetType: 'continu',
  budgetPeriodiciteit: 'week',
  bedrag: 100,
  budgetten: [],
} as unknown as Budget;

const rekening = {
  Id: 1,
  rekeningNaam: 'rekening',
  rekeningType: RekeningSoort.uitgaven,
  nummer: undefined,
  bankNaam: undefined,
  sortOrder: 1,
  budgetten: [budget],
} as unknown as Rekening;

export default function Login() {

  type FormFields = {
    rekeningNaam1: string;
    budgetPerWeek1: number;
    besteedOpPeildatum1: number;
    rekeningNaam2: string;
    budgetPerWeek2: number;
    besteedOpPeildatum2: number;
  }
  const [formFields, setFormFields] = useState<FormFields>({
    rekeningNaam1: 'Boodschappen', 
    besteedOpPeildatum1: (() => {
      const dagen = dagenSindsStartPeriode(berekenPeriodeBijPeildatum(dayjs()));
      return dagen ? dagen * 11 : 0;
    })(), 
    budgetPerWeek1: 70,
    rekeningNaam2: 'Andere uitgaven', 
    besteedOpPeildatum2: (() => {
      const dagen = dagenSindsStartPeriode(berekenPeriodeBijPeildatum(dayjs()));
      return dagen ? dagen * 18 : 0;
    })(), 
    budgetPerWeek2: 140,
  });
  const [peilDatum, setPeilDatum] = useState(dayjs());
  const [periode, setPeriode] = useState<Periode | undefined>(undefined);

  const { setSnackbarMessage } = useCustomContext();

  useEffect(() => {
    setPeriode(berekenPeriodeBijPeildatum(peilDatum));
  }, [peilDatum]);

  const handleInputChange = (key: string, value: any) => {
    if (key === 'peilDatum') {
      setPeilDatum(value);
    } else {
      setFormFields({ ...formFields, [key]: value });
    }
  };

  return (
    <>
      <Typography variant='h4'>Dit is de App van de PlusMin gereedschapskist.</Typography>
      <Typography sx={{ my: '25px' }}>
        Om de app te kunnen gebruiken moet je zijn ingelogd. Op dit moment is er wel een visualisatie experiment voor potjes en budgetten
        op deze pagina waar je niet voor hoeft te zijn ingelogd.
      </Typography>
      <Typography sx={{ my: '25px' }}>
        Deze App is een demo app en dus NIET de uiteindelijke app voor de gebruiker. Het is bedoeld om de werking van de toekomstige app uit te kunnen leggen.
      </Typography>
      <Typography sx={{ mb: '50px' }}>
        Op <a href="https://plusmingereedschapskist.nl">https://plusmingereedschapskist.nl</a> kun je meer informatie vinden.
      </Typography>

      <Box border={1} borderRadius={2} p={2} mb={5} boxShadow={2} >
        <Typography variant='h6'>Visualisatie experiment voor potjes en budgetten</Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          Met dit formulier kun je de visualisatie van de besteding van 2 potjes, met bijbehorende budgetten, testen.
          (In de praktijk kunnen er meer potjes zijn.)
          Ik hoop met de visualisatie de besteding van een budget in 1 oogopslag inzichtelijk te maken.
          Er is bewust geen legenda, dat geeft mijns inziens meer ruis dan dat het helpt. (Eens?)
          Ik heb wel een <span onClick={() => setSnackbarMessage({ message: 'Duh, deze doet nix ...', type: 'error' })}><InfoIcon height='14' /></span>
          toegevoegd waar wordt uitgelegd hoe het er voor staat; die teksten mogen ook worden verbeterd &#128513;.
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          De app werkt op basis van periodes van een maand, waarbij voor de hulpvrager kan worden ingesteld op welke dag van de maand de periode start.
          Het is bedoeld om te starten vlak voor dat de hulpvrager zijn/haar inkomen ontvangt.
          Hier gebruik ik nu de 20ste van de maand als periode wisseldag omdat het er voor de visualisatie niet toe doet.
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          De peildatum zal in het echte gebruik altijd de huidige datum zijn. In dit formulier kun je de peildatum aanpassen, 'tijdreizen',
          om te zien hoe de visualisatie daardoor verandert. Op basis van de peildatum bereken ik de periode.
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          Reacties en voorstellen voor verbetering zijn meer dan welkom!!!
        </Typography>
        <Grid container spacing={2} alignItems="center" columns={3} >
          <Grid minWidth={'240px'} size={1}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                sx={{ color: 'success.main' }}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wat is de peildatum?"
                value={peilDatum}
                onChange={(newvalue) => handleInputChange('peilDatum', newvalue ? newvalue : dayjs())}
              />
            </LocalizationProvider>
          </Grid>
          {periode &&
            <Typography sx={{ pt: '18px' }}>
              Periode van {periode.periodeStartDatum} tot {periode.periodeEindDatum}
            </Typography>}
        </Grid>
        <Grid container spacing={2} alignItems="center" columns={3} >
          <Grid minWidth={'240px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetNaam1">Hoe heet het eerste potje?</InputLabel>
              <Input
                id="budgetNaam1"
                value={formFields.rekeningNaam1}
                type="text"
                onChange={(e) => handleInputChange('budgetNaam1', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'240px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="besteedOpPeildatum1">Wat is er besteed op de peildatum?</InputLabel>
              <Input
                id="besteedOpPeildatum1"
                value={formFields.besteedOpPeildatum1}
                type="number"
                onChange={(e) => handleInputChange('besteedOpPeildatum1', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'240px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetPerWeek1">Wat is het budget per week?</InputLabel>
              <Input
                id="budgetPerWeek1"
                value={formFields.budgetPerWeek1}
                type="number"
                onChange={(e) => handleInputChange('budgetPerWeek1', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'240px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetNaam2">Hoe heet het tweede potje?</InputLabel>
              <Input
                id="budgetNaam2"
                value={formFields.rekeningNaam2}
                type="text"
                onChange={(e) => handleInputChange('budgetNaam2', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'240px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="besteedOpPeildatum2">Wat is er besteed op de peildatum?</InputLabel>
              <Input
                id="besteedOpPeildatum2"
                value={formFields.besteedOpPeildatum2}
                type="number"
                onChange={(e) => handleInputChange('besteedOpPeildatum2', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'240px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetPerWeek2">Wat is het budget per week?</InputLabel>
              <Input
                id="budgetPerWeek2"
                value={formFields.budgetPerWeek2}
                type="number"
                onChange={(e) => handleInputChange('budgetPerWeek2', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      {periode &&
        <BudgetContinuGrafiek
          periode={periode}
          peildatum={peilDatum}
          rekening={{ ...rekening, naam: formFields.rekeningNaam1, budgetten: [{ ...budget, bedrag: formFields.budgetPerWeek1 }] }}
          besteedOpPeildatum={Number(formFields.besteedOpPeildatum1)} />}
      {periode &&
        <BudgetContinuGrafiek
          periode={periode}
          peildatum={peilDatum}
          rekening={{ ...rekening, naam: formFields.rekeningNaam2, budgetten: [{ ...budget, bedrag: formFields.budgetPerWeek2 }] }}
          besteedOpPeildatum={Number(formFields.besteedOpPeildatum2)} />}
      <Typography variant='h6' sx={{ my: 2 }}>Geaggregeerde visualisatie</Typography>
      <Typography variant='body2' >Hierbij worden beide bovenstaande visualisatie 'opgeteld', waardoor een tekort op de een wordt gecompenseerd door een overschot op de ander.</Typography>
      {periode &&
        <BudgetContinuGrafiek
          periode={periode}
          peildatum={peilDatum}
          rekening={{ ...rekening, naam: 'Geaggregeerd', budgetten: [{ ...budget, bedrag: Number(formFields.budgetPerWeek1) + Number(formFields.budgetPerWeek2) }] }}
          besteedOpPeildatum={Number(formFields.besteedOpPeildatum1) + Number(formFields.besteedOpPeildatum2)} />}
    </>)
}