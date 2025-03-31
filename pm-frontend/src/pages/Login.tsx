import { Box, Button, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';

import dayjs from "dayjs";
import BudgetContinuGrafiek from "../components/Budget/BudgetContinuGrafiek";
import { BudgetDTO } from "../model/Budget";
import { dagInPeriode } from '../model/Periode';

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import { berekenPeriodeBijPeildatum } from "../model/Periode";
import { BudgetType, Rekening, RekeningSoort } from "../model/Rekening";
import BudgetVastGrafiek from "../components/Budget/BudgetVastGrafiek";
import BudgetInkomstenGrafiek from "../components/Budget/BudgetInkomstenGrafiek";
import { boodschappenBudgetten, inkomstenBudgetten, vastelastenBudgetten } from "../components/BudgetData";

const rekeningTemplate = {
  Id: 1,
  nummer: undefined,
  bankNaam: undefined,
  sortOrder: 1,
  budgetten: [],
} as unknown as Rekening;

type FormField = {
  rekeningNaam: string;
  rekeningSoort: string;
  budgetType: string;
  budgetten: BudgetDTO[];
}

const initialFormFields = {
  rekeningNaam: 'Inkomsten',
  rekeningSoort: 'inkomsten',
  budgetType: BudgetType.vast,
  budgetten: inkomstenBudgetten
} as FormField;

export default function Login() {

  const periode = berekenPeriodeBijPeildatum(dayjs());
  const [formFields, setFormFields] = useState<FormField>(initialFormFields);

  const [selectedVisualisatie, setSelectedVisualisatie] = useState<string | undefined>('Inkomsten');

  const [peilDatum, setPeilDatum] = useState(dayjs(periode.periodeStartDatum));
  const [gekozenPeildatumNaam, setGekozenPeildatumNaam] = useState<string | undefined>('begin');

  const handlePeilDatumChange = (value: any) => {
    const newPeilDatum = (value.isBefore(dayjs(periode.periodeStartDatum))) ? dayjs(periode.periodeStartDatum) :
      (value.isAfter(dayjs(periode.periodeEindDatum))) ? dayjs(periode.periodeEindDatum) :
        value
    setPeilDatum(newPeilDatum);
    const newFormFields = {
      ...formFields, budgetten: formFields.budgetten.map(budget => ({
        ...budget,
        budgetSaldoPeildatum: newPeilDatum
      }))
    };
    setFormFields(newFormFields);
    setGekozenPeildatumNaam(undefined);
  }
  const handleGekozenPeilDatumNaam = (positie: string) => {
    switch (positie) {
      case 'begin':
        setPeilDatum(dayjs(periode.periodeStartDatum));
        break;
      case 'midden':
        setPeilDatum(dayjs(periode.periodeStartDatum).add(14, 'day'));
        break;
      case 'einde':
        setPeilDatum(dayjs(periode.periodeEindDatum));
    }
  }
  useEffect(() => {
    switch (peilDatum.format('YYYY-MM-DD')) {
      case periode.periodeStartDatum:
        setGekozenPeildatumNaam('begin');
        break;
      case dayjs(periode.periodeStartDatum).add(14, 'day').format('YYYY-MM-DD'):
        setGekozenPeildatumNaam('midden');
        break;
      case periode.periodeEindDatum:
        setGekozenPeildatumNaam('einde');
        break;
      default:
        setGekozenPeildatumNaam('');
    }
  }, [peilDatum]);

  const [betalingNamen, setBetalingNamen] = useState<string[]>(inkomstenBudgetten.map(_b => 'budget'));
  const handleBetalingNaamChange = (datum: dayjs.Dayjs, index: number, gekozenBetalingNaam: string) => {
    const verwachtBudgetBedrag = verwachtBudget(datum, formFields.budgetten[index].bedrag);
    switch (gekozenBetalingNaam) {
      case 'niets':
        handleInputChange(index, '0');
        break;
      case 'te weinig':
        handleInputChange(index, Math.round(0.5 * verwachtBudgetBedrag).toString());
        break;
      case 'budget':
        handleInputChange(index, Math.round(verwachtBudgetBedrag).toString());
        break;
      case 'teveel':
        handleInputChange(index, Math.round(1.1 * verwachtBudgetBedrag).toString());
    }
  }
  const verwachtBudget = (datum: dayjs.Dayjs, budget: number): number => {
    // console.log('verwachtBudget', datum.format('YYYY-MM-DD'), budget, selectedVisualisatie);
    if (selectedVisualisatie !== 'Boodschappen') {
      return budget;
    }
    const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    const dagenTotPeilDatum = datum.diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    return Math.round((dagenTotPeilDatum / periodeLengte) * budget);
  }

  useEffect(() => {
    let nieuweBetalingNamen = betalingNamen;
    formFields.budgetten.forEach((budget, index) => {
      const verwachtBudgetBedrag = verwachtBudget(peilDatum, budget.bedrag);
      // console.log('useEffect verwachtBudget', peilDatum.format('YYYY-MM-DD'), budget.bedrag, verwachtBudgetBedrag, budget.budgetSaldoBetaling);
      switch (budget.budgetSaldoBetaling) {
        case 0:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'niets' : item));
          break;
        case Math.round(0.5 * verwachtBudgetBedrag):
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'te weinig' : item));
          break;
        case verwachtBudgetBedrag:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'budget' : item));
          break;
        case Math.round(1.1 * verwachtBudgetBedrag):
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'teveel' : item));
          break;
        default:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? '' : item));
          break;
      }
    });
    setBetalingNamen(nieuweBetalingNamen);
  }, [peilDatum, formFields.budgetten]);

  const handleInputChange = (index: number, value: string) => {
    value = value === null || value === undefined || value === '' ? '0' : value;
    setFormFields({
      ...formFields,
      budgetten: [
        ...formFields.budgetten.slice(0, index),
        { ...formFields.budgetten[index], budgetSaldoBetaling: Math.round(parseFloat(value)) },
        ...formFields.budgetten.slice(index + 1)
      ]
    });
  };

  const handleVisualisatieButtonClick = (key: string) => {
    setSelectedVisualisatie(key);
    if (key === 'Inkomsten') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Inkomsten',
        rekeningSoort: 'inkomsten',
        budgetType: BudgetType.vast,
        budgetten: inkomstenBudgetten,
      })
      setBetalingNamen(inkomstenBudgetten.map(_b => 'budget'));
    } else if (key === 'Boodschappen') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Boodschappen',
        rekeningSoort: 'uitgaven',
        budgetType: BudgetType.continu,
        budgetten: boodschappenBudgetten,
      });
      setBetalingNamen(boodschappenBudgetten.map(_b => 'budget'));
    } else if (key === 'Vaste lasten') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Vaste lasten',
        rekeningSoort: 'uitgaven',
        budgetType: BudgetType.vast,
        budgetten: vastelastenBudgetten,
      })
      setBetalingNamen(vastelastenBudgetten.map(_b => 'budget'));
    }
  }
  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
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
          Met dit formulier kun je de visualisatie van de besteding van een potje, met bijbehorende budgetten, testen.
          (In de praktijk kunnen er meer potjes zijn.)
          Ik hoop met de visualisatie de besteding van een budget in 1 oogopslag inzichtelijk te maken.
          Er is bewust geen legenda, dat geeft mijns inziens meer ruis dan dat het helpt. (Eens?)
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          De app werkt op basis van periodes van een maand, waarbij voor de hulpvrager kan worden ingesteld op welke dag van de maand de periode start.
          Het is bedoeld om te starten vlak voor dat de hulpvrager zijn/haar inkomen ontvangt.
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          De peildatum zal in het echte gebruik altijd de huidige datum zijn. In dit formulier kun je de peildatum aanpassen, 'tijdreizen',
          om te zien hoe de visualisatie daardoor verandert. De periode is altijd de huidige periode
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          Reacties en voorstellen voor verbetering zijn meer dan welkom!!!
        </Typography>
        <Typography variant='h6' sx={{ mb: '8px' }}>
          Vaste waarde:
        </Typography>
        <Typography variant='body2'>
          De periode loopt van {dayjs(periode.periodeStartDatum).format('D MMMM')} tot {dayjs(periode.periodeEindDatum).format('D MMMM')}<br />
        </Typography>
        <Typography variant='h6' sx={{ my: '8px' }}>
          Variabele waarden:
        </Typography>
        <Grid container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
          <Grid size={1} >
            <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
              &nbsp;
            </Typography>
          </Grid>
          <Grid size={1} >
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
        </Grid>
        <Grid container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
          <Grid size={1} sx={{ pl: '8px' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                sx={{ color: 'success.main' }}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wat is de peildatum?"
                value={peilDatum}
                onChange={(newvalue) => handlePeilDatumChange(newvalue ? newvalue : dayjs())}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={1} >
            {['begin', 'midden', 'einde'].map(positie =>
              <Button
                color='success'
                style={{ textTransform: 'none' }}
                sx={{ p: '3px', m: '3px', fontSize: 11 }}
                size="small"
                key={positie}
                variant={gekozenPeildatumNaam === positie ? 'contained' : 'outlined'}
                onClick={() => handleGekozenPeilDatumNaam(positie)}>
                {positie}
              </Button>)}
          </Grid>
        </Grid>
        {formFields.budgetten.map((budget, index) =>
          <Grid container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
            <Grid size={1} display={'flex'} direction={'row'} alignItems={'center'}>
              <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                {budget.budgetNaam}: {formatAmount(budget.bedrag.toString())}, betaaldag {budget.betaalDag && dagInPeriode(budget.betaalDag, periode).format('D MMMM')}, waarvan er 
              </Typography>
              <TextField
                label=""
                sx={{ fontSize: '0.875rem', ml: 1, width: '95px', textAlign: 'right' }}
                variant="standard"
                slotProps={{ inputLabel: { shrink: true, } }}
                id="besteedOpPeildatum1"
                value={formFields.budgetten[index].budgetSaldoBetaling}
                type="number"
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
              <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                is {budget.rekeningSoort === 'inkomsten' ? 'ontvangen' : 'betaald'}.
              </Typography>
            </Grid>
            <Grid size={1} >
              {['niets', 'te weinig', 'budget', 'teveel'].map((betalingNaam) =>
                <Button
                  color='success'
                  style={{ textTransform: 'none' }}
                  sx={{ p: '3px', m: '3px', fontSize: 11 }}
                  size="small"
                  key={index}
                  variant={betalingNamen[index] === betalingNaam ? 'contained' : 'outlined'}
                  onClick={() => handleBetalingNaamChange(peilDatum, index, betalingNaam)}>
                  {betalingNaam}
                </Button>)}
            </Grid>
          </Grid>
        )}

      </Box>
      {periode &&
        <>
          {formFields.budgetType === BudgetType.continu &&
            <BudgetContinuGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekeningTemplate,
                naam: formFields.rekeningNaam,
                rekeningSoort: RekeningSoort.uitgaven,
                budgetType: formFields.budgetType,
              }}
              budgetten={formFields.budgetten.map((budget) => ({
                ...budget,  
                budgetSaldoBetaling: -(budget.budgetSaldoBetaling ?? 0),
              }))} />}
          {formFields.budgetType === BudgetType.vast && formFields.rekeningSoort === 'uitgaven' &&
            <BudgetVastGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekeningTemplate,
                naam: formFields.rekeningNaam,
                rekeningSoort: RekeningSoort.uitgaven,
                budgetType: formFields.budgetType,
              }}
              budgetten={formFields.budgetten.map((budget) => ({
                ...budget,  
                budgetSaldoBetaling: -(budget.budgetSaldoBetaling ?? 0),
              }))} />}
          {formFields.budgetType === BudgetType.vast && formFields.rekeningSoort === 'inkomsten' &&
            <BudgetInkomstenGrafiek
              periode={periode}
              peildatum={peilDatum}
              rekening={{
                ...rekeningTemplate,
                naam: 'Inkmosten',
                rekeningSoort: RekeningSoort.inkomsten,
                budgetType: BudgetType.vast,
              }}
              budgetten={formFields.budgetten} />}
        </>
      }
    </>)
}