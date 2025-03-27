import { Box, Button, FormControl, Input, InputLabel, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';

import dayjs from "dayjs";
import BudgetContinuGrafiek from "../components/Budget/BudgetContinuGrafiek";
import { BudgetDTO } from "../model/Budget";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";
import { berekenPeriodeBijPeildatum, dagenInPeriode, dagenSindsStartPeriode } from "../model/Periode";
import { InfoIcon } from "../icons/Info";
import { useCustomContext } from "../context/CustomContext";
import { BudgetType, Rekening, RekeningSoort } from "../model/Rekening";
import BudgetVastGrafiek from "../components/Budget/BudgetVastGrafiek";
import BudgetInkomstenGrafiek from "../components/Budget/BudgetInkomstenGrafiek";

const budget: BudgetDTO = {
  budgetNaam: 'budget',
  budgetPeriodiciteit: 'maand',
  bedrag: 100,
  betaalDag: 24,
  rekeningNaam: "",
  budgetSaldoDTO: undefined,
  rekeningSoort: ""
};

const rekening = {
  Id: 1,
  rekeningNaam: 'rekening',
  rekeningType: RekeningSoort.uitgaven,
  nummer: undefined,
  bankNaam: undefined,
  sortOrder: 1,
  budgetType: BudgetType.vast,
  budgetten: [budget],
} as unknown as Rekening;

export default function Login() {

  type FormField = {
    rekeningNaam: string;
    rekeningSoort: string;
    budgetType: string;
    budgetPerBudgetPeriode: number;
    besteedOpPeildatum: number;
  }

  const periode = berekenPeriodeBijPeildatum(dayjs());
  const [formFields, setFormFields] = useState<FormField>(
    {
      rekeningNaam: 'Inkomsten',
      rekeningSoort: 'inkomsten',
      budgetType: BudgetType.vast,
      budgetPerBudgetPeriode: 2300,
      besteedOpPeildatum: 2300,
    });

  const [peilDatum, setPeilDatum] = useState(dayjs());
  const [selectedVisualisatie, setSelectedVisualisatie] = useState<string | undefined>('Inkomsten');


  const { setSnackbarMessage } = useCustomContext();

  const handleInputChange = (key: string, value: any) => {
    if (key === 'peilDatum') {
      if (value.isBefore(dayjs(periode.periodeStartDatum))) {
        setPeilDatum(dayjs(periode.periodeStartDatum));
      } else if (value.isAfter(dayjs(periode.periodeEindDatum))) {
        setPeilDatum(dayjs(periode.periodeEindDatum));
      } else {
        setPeilDatum(value);
      }
    } else {
      setFormFields({ ...formFields, [key]: value });
    }
  };

  const handleVisualisatieButtonClick = (key: string) => {
    setSelectedVisualisatie(key);
    if (key === 'Inkomsten') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Inkomsten',
        rekeningSoort: 'inkomsten',
        budgetType: BudgetType.vast,
        budgetPerBudgetPeriode: 2300,
        besteedOpPeildatum: peilDatum.date() >= 24 || peilDatum.date() < 20 ? 2300 : 0
      })
    } else if (key === 'Boodschappen') {
      setFormFields({ ...formFields, 
        rekeningNaam: 'Boodschappen', 
        rekeningSoort: 'uitgaven', 
        budgetType: BudgetType.continu, 
        budgetPerBudgetPeriode: 400,
        besteedOpPeildatum:  Math.round(400 * (dagenSindsStartPeriode(periode) ?? 15) / (dagenInPeriode(periode) ?? 30))
      });
    } else if (key === 'Vaste lasten') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Vaste lasten',
        rekeningSoort: 'uitgaven',
        budgetType: BudgetType.vast,
        budgetPerBudgetPeriode: 1000,
        besteedOpPeildatum: peilDatum.date() >= 24 || peilDatum.date() < 20 ? 1000 : 0
      })
    }
  }

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
          Hier gebruik ik nu de 20ste van de maand als periode wisseldag en de 24ste als betaaldag.
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          De peildatum zal in het echte gebruik altijd de huidige datum zijn. In dit formulier kun je de peildatum aanpassen, 'tijdreizen',
          om te zien hoe de visualisatie daardoor verandert. De periode is altijd de huidige periode
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          Reacties en voorstellen voor verbetering zijn meer dan welkom!!!
        </Typography>
        <Typography variant='h6' sx={{ mb: '8px' }}>
          Vast ingestelde waarden:
        </Typography>
        <Typography variant='body2'>
          De periode loopt van {dayjs(periode.periodeStartDatum).format('D MMMM')} tot {dayjs(periode.periodeEindDatum).format('D MMMM')}<br />
          De betaaldag is de {budget.betaalDag}e van de maand<br />
        </Typography>
        <Typography variant='h6' sx={{ my: '8px' }}>
          Variabele waarden:
        </Typography>
        <Grid >
          {['Inkomsten', 'Boodschappen', 'Vaste lasten'].map(visualisatie =>
            <Button
              color='success'
              style={{ textTransform: 'none' }}
              sx={{ m: '3px' }}
              key={visualisatie}
              variant={selectedVisualisatie === visualisatie ? 'contained' : 'outlined'}
              onClick={() => handleVisualisatieButtonClick(visualisatie)}
            >
              {visualisatie}
            </Button>)}
        </Grid>
        <Grid container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
          <Grid size={1} maxWidth={'175px'}>
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
          <Grid size={1} maxWidth={'175px'}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="besteedOpPeildatum1">Wat is er {formFields.rekeningSoort === 'inkomsten' ? 'ontvangen' : 'besteed'} op de peildatum?</InputLabel>
              <Input
                id="besteedOpPeildatum1"
                value={formFields.besteedOpPeildatum}
                type="number"
                onChange={(e) => handleInputChange('besteedOpPeildatum', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" columns={6} >
          <Grid minWidth={'175px'} size={1}>
            <FormControl sx={{ m: 1 }} variant="standard" fullWidth>
              <InputLabel htmlFor="budgetPerBudgetPeriode1">Wat is het budget per maand?</InputLabel>
              <Input
                id="budgetPerBudgetPeriode1"
                value={formFields.budgetPerBudgetPeriode}
                type="number"
                onChange={(e) => handleInputChange('budgetPerBudgetPeriode', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      {periode &&
        <>
          {formFields.budgetType === BudgetType.continu &&
            <BudgetContinuGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekening,
                naam: formFields.rekeningNaam,
                rekeningSoort: formFields.rekeningSoort as RekeningSoort,
                budgetType: formFields.budgetType,
                budgetten: [{
                  ...budget, bedrag: formFields.budgetPerBudgetPeriode,
                  rekening: undefined,
                  budgetSaldo: undefined
                }]
              }}
              besteedOpPeildatum={Number(formFields.besteedOpPeildatum)} />}
          {formFields.budgetType === BudgetType.vast && formFields.rekeningSoort === 'uitgaven' &&
            <BudgetVastGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekening,
                naam: formFields.rekeningNaam,
                rekeningSoort: formFields.rekeningSoort as RekeningSoort,
                budgetType: formFields.budgetType,
                budgetten: [{
                  ...budget, bedrag: formFields.budgetPerBudgetPeriode,
                  rekening: undefined,
                  budgetSaldo: undefined
                }]
              }}
              besteedOpPeildatum={Number(formFields.besteedOpPeildatum)} />}
          {formFields.budgetType === BudgetType.vast && formFields.rekeningSoort === 'inkomsten' &&
            <BudgetInkomstenGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekening,
                naam: formFields.rekeningNaam,
                rekeningSoort: formFields.rekeningSoort as RekeningSoort,
                budgetType: formFields.budgetType,
                budgetten: [{
                  ...budget, bedrag: formFields.budgetPerBudgetPeriode,
                  rekening: undefined,
                  budgetSaldo: undefined
                }]
              }}
              ontvangenOpPeildatum={Number(formFields.besteedOpPeildatum)}
              budgetten={[budget]} />}
        </>
      }
    </>)
}