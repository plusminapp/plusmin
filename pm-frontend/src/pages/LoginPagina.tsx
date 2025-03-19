import { Box, FormControl, Input, InputLabel, MenuItem, Select, Typography } from "@mui/material";
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
import { Rekening, RekeningSoort, resultaatRekeningSoorten } from "../model/Rekening";
import BudgetVastGrafiek from "../components/Budget/BudgetVastGrafiek";
import { useAuthContext } from "@asgardeo/auth-react";


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

  const { state } = useAuthContext();

  type FormFields = {
    rekeningNaam: string;
    rekeningSoort: string;
    budgetSoort: string;
    budgetPeriode: string;
    budgetPerBudgetPeriode: number;
    besteedOpPeildatum: number;
  }
  const [formFields, setFormFields] = useState<FormFields[]>([
    {
      rekeningNaam: 'Boodschappen',
      rekeningSoort: 'uitgaven',
      budgetSoort: 'continu',
      budgetPeriode: 'week',
      besteedOpPeildatum: (() => {
        const dagen = dagenSindsStartPeriode(berekenPeriodeBijPeildatum(dayjs()));
        return dagen ? dagen * 11 : 0;
      })(),
      budgetPerBudgetPeriode: 70
    }, {
      rekeningNaam: 'Vaste lasten',
      rekeningSoort: 'inkomsten',
      budgetSoort: 'periodiek',
      budgetPeriode: 'maand',
      besteedOpPeildatum: (() => {
        const dagen = dagenSindsStartPeriode(berekenPeriodeBijPeildatum(dayjs()));
        return dagen ? dagen * 38 : 0;
      })(),
      budgetPerBudgetPeriode: 1200,
    }]);

  const [peilDatum, setPeilDatum] = useState(dayjs());
  const [periode, setPeriode] = useState<Periode | undefined>(undefined);

  const { setSnackbarMessage } = useCustomContext();

  useEffect(() => {
    setPeriode(berekenPeriodeBijPeildatum(peilDatum));
  }, [peilDatum]);

  const handleInputChange = (index: number, key: string, value: any) => {
    if (key === 'peilDatum') {
      setPeilDatum(value);
    } else {
      setFormFields(formFields.map((field, i) => i === index ? { ...field, [key]: value } : field));
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
        <Grid container spacing={2} alignItems="center" columns={5} >
          <Grid minWidth={'175px'} size={1}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                sx={{ color: 'success.main' }}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wat is de peildatum?"
                value={peilDatum}
                onChange={(newvalue) => handleInputChange(0, 'peilDatum', newvalue ? newvalue : dayjs())}
              />
            </LocalizationProvider>
          </Grid>
          {periode &&
            <Typography sx={{ pt: '18px' }}>
              Periode van {periode.periodeStartDatum} tot {periode.periodeEindDatum}
            </Typography>}
        </Grid>
        <Grid container spacing={2} alignItems="center" columns={6} >
          <Grid minWidth={'175px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="rekeningNaam1">Hoe heet het eerste potje?</InputLabel>
              <Input
                id="rekeningNaam1"
                value={formFields[0].rekeningNaam}
                type="text"
                onChange={(e) => handleInputChange(0, 'budgetNaam', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'100px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetSoort1">rekeningSoort1</InputLabel>
              <Select
                sx={{ fontSize: '0.875rem' }}
                labelId="rekeningSoort1-select-label"
                id="rekeningSoort1-select"
                value={formFields[0].rekeningSoort.toString().toLowerCase()}
                label="Periode"
                onChange={(e) => handleInputChange(0, 'rekeningSoort', e.target.value)}>
                {resultaatRekeningSoorten.map(rekeningSoort =>
                  <MenuItem key={rekeningSoort} value={rekeningSoort.toString().toLowerCase()} sx={{ fontSize: '0.875rem' }} >{rekeningSoort.toString().toLowerCase()}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid minWidth={'100px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetSoort1">budgetSoort1</InputLabel>
              <Select
                sx={{ fontSize: '0.875rem' }}
                labelId="budgetSoort1-select-label"
                id="budgetSoort1-select"
                value={formFields[0].budgetSoort}
                label="Periode"
                onChange={(e) => handleInputChange(0, 'budgetSoort', e.target.value)}>
                <MenuItem key={'continu'} value={'continu'} sx={{ fontSize: '0.875rem' }} >continu</MenuItem>
                <MenuItem key={'periodiek'} value={'periodiek'} sx={{ fontSize: '0.875rem' }} >periodiek</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid minWidth={'100px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetPeriode1">budgetPeriode1</InputLabel>
              <Select
                sx={{ fontSize: '0.875rem' }}
                labelId="budgetPeriode1-select-label"
                id="budgetPeriode1-select"
                value={formFields[0].budgetPeriode}
                label="Periode"
                onChange={(e) => handleInputChange(0, 'budgetPeriode', e.target.value)}>
                <MenuItem key={'week'} value={'week'} sx={{ fontSize: '0.875rem' }} >week</MenuItem>
                <MenuItem key={'maand'} value={'maand'} sx={{ fontSize: '0.875rem' }} >maand</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid minWidth={'175px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="besteedOpPeildatum1">Wat is er {formFields[0].rekeningSoort === 'inkomsten' ? 'ontvangen' : 'besteed'} op de peildatum?</InputLabel>
              <Input
                id="besteedOpPeildatum1"
                value={formFields[0].besteedOpPeildatum}
                type="number"
                onChange={(e) => handleInputChange(0, 'besteedOpPeildatum', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'175px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetPerBudgetPeriode1">Wat is het budget per {formFields[0].budgetPeriode}?</InputLabel>
              <Input
                id="budgetPerBudgetPeriode1"
                value={formFields[0].budgetPerBudgetPeriode}
                type="number"
                onChange={(e) => handleInputChange(0, 'budgetPerBudgetPeriode', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'175px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetNaam2">Hoe heet het tweede potje?</InputLabel>
              <Input
                id="budgetNaam2"
                value={formFields[1].rekeningNaam}
                type="text"
                onChange={(e) => handleInputChange(1, 'budgetNaam', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'100px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetSoort1">rekeningSoort2</InputLabel>
              <Select
                sx={{ fontSize: '0.875rem' }}
                labelId="rekeningSoort2-select-label"
                id="rekeningSoort2-select"
                value={formFields[1].rekeningSoort.toString().toLowerCase()}
                label="Periode"
                onChange={(e) => handleInputChange(1, 'rekeningSoort', e.target.value)}>
                {resultaatRekeningSoorten.map(rekeningSoort =>
                  <MenuItem key={rekeningSoort} value={rekeningSoort.toString().toLowerCase()} sx={{ fontSize: '0.875rem' }} >{rekeningSoort.toString().toLowerCase()}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid minWidth={'100px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetSoort2">budgetSoort2</InputLabel>
              <Select
                sx={{ fontSize: '0.875rem' }}
                labelId="budgetSoort2-select-label"
                id="budgetSoort2-select"
                value={formFields[1].budgetSoort}
                label="Periode"
                onChange={(e) => handleInputChange(1, 'budgetSoort', e.target.value)}>
                <MenuItem key={'continu'} value={'continu'} sx={{ fontSize: '0.875rem' }} >continu</MenuItem>
                <MenuItem key={'periodiek'} value={'periodiek'} sx={{ fontSize: '0.875rem' }} >periodiek</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid minWidth={'100px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetPeriode2">budgetPeriode2</InputLabel>
              <Select
                sx={{ fontSize: '0.875rem' }}
                labelId="budgetPeriode2-select-label"
                id="budgetPeriode2-select"
                value={formFields[1].budgetPeriode}
                label="Periode"
                onChange={(e) => handleInputChange(1, 'budgetPeriode', e.target.value)}>
                <MenuItem key={'week'} value={'week'} sx={{ fontSize: '0.875rem' }} >week</MenuItem>
                <MenuItem key={'maand'} value={'maand'} sx={{ fontSize: '0.875rem' }} >maand</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid minWidth={'175px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="besteedOpPeildatum2">Wat is er {formFields[1].rekeningSoort === 'inkomsten' ? 'ontvangen' : 'besteed'} op de peildatum?</InputLabel>
              <Input
                id="besteedOpPeildatum2"
                value={formFields[1].besteedOpPeildatum}
                type="number"
                onChange={(e) => handleInputChange(1, 'besteedOpPeildatum', e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid minWidth={'175px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetPerBudgetPeriode2">Wat is het budget per {formFields[1].budgetPeriode}?</InputLabel>
              <Input
                id="budgetPerBudgetPeriode2"
                value={formFields[1].budgetPerBudgetPeriode}
                type="number"
                onChange={(e) => handleInputChange(1, 'budgetPerBudgetPeriode', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      {periode && formFields.map((formField) =>
        <>
          {formField.budgetSoort === 'continu' &&
            <BudgetContinuGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekening,
                naam: formField.rekeningNaam,
                rekeningSoort: formField.rekeningSoort as RekeningSoort,
                budgetten: [{ ...budget, bedrag: formField.budgetPerBudgetPeriode, budgetPeriodiciteit: formField.budgetPeriode, budgetType: formField.budgetSoort }]
              }}
              besteedOpPeildatum={Number(formField.besteedOpPeildatum)} />}
          {formField.budgetSoort === 'periodiek' &&
            <BudgetVastGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekening,
                naam: formField.rekeningNaam,
                rekeningSoort: formField.rekeningSoort as RekeningSoort,
                budgetten: [{ ...budget, bedrag: formField.budgetPerBudgetPeriode, budgetPeriodiciteit: formField.budgetPeriode, budgetType: formField.budgetSoort }]
              }}
              besteedOpPeildatum={Number(formField.besteedOpPeildatum)} />}
        </>
      )}
      {<Typography variant='caption'>State: {state.isAuthenticated ? 'true' : 'false'}</Typography>}
    </>)
}