import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Box from '@mui/material/Box';

import { useCallback, useEffect, useState } from "react";
import { useCustomContext } from "../context/CustomContext";

import { Aflossing } from '../model/Aflossing'
import { ArrowDropDownIcon, DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import AflossingTabel from "../components/Aflossing/AflossingTabel";
import StyledSnackbar, { SnackbarMessage } from "../components/StyledSnackbar";
import { Min } from "../assets/Min";
import { Plus } from "../assets/Plus";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import NieuweAflossingDialoog from "../components/Aflossing/NieuweAflossingDialoog";
import { AflossingenAfbouwGrafiek } from "../components/Aflossing/Graph/AflossingenAfbouwGrafiek";
import { PeriodeSelect } from "../components/PeriodeSelect";

export default function Aflossingen() {

  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager } = useCustomContext();

  const [aflossingen, setAflossingen] = useState<Aflossing[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [formDatum, setFormDatum] = useState<dayjs.Dayjs>(dayjs());
  const [message, setMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });

  const fetchAflossingen = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const id = actieveHulpvrager!.id
      const token = await getIDToken();
      const response = await fetch(`/api/v1/aflossing/hulpvrager/${id}/datum/${formDatum.toISOString().slice(0, 10)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setAflossingen(result);
      } else {
        console.error("Failed to fetch data", response.status);
        setMessage({
          message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
          type: "warning"
        })
      }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker, formDatum]);

  useEffect(() => {
    fetchAflossingen();
  }, [fetchAflossingen]);

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De aflossingen worden opgehaald.</Typography>
  }

  const onAflossingBewaardChange = () => {
    fetchAflossingen()
  }

  const handleInputChange = (datum: dayjs.Dayjs) => {
    setFormDatum(datum)
  }

  const berekenToestandIcoon = (aflossing: Aflossing) => {
    if (!aflossing.aflossingSaldiDTO)
      return <Min color="black" />
    else {
      const isVoorBetaaldag = aflossing.betaalDag > parseInt(aflossing.aflossingSaldiDTO.peilDatum.slice(8)) && parseInt(aflossing.aflossingSaldiDTO.peilDatum.slice(8)) >= 21;
      const isOpBetaaldag = aflossing.betaalDag == parseInt(aflossing.aflossingSaldiDTO.peilDatum.slice(8));
      const kloptSaldo = aflossing.aflossingSaldiDTO.berekendSaldo == aflossing.aflossingSaldiDTO.werkelijkSaldo;
      const heeftBetalingAchtersstand = aflossing.aflossingSaldiDTO.berekendSaldo < aflossing.aflossingSaldiDTO.werkelijkSaldo
      const isAflossingAlBetaald = (Math.round(aflossing.aflossingSaldiDTO.berekendSaldo - aflossing.aflossingSaldiDTO.werkelijkSaldo - aflossing.aflossingsBedrag) === 0);
      return (isVoorBetaaldag || isOpBetaaldag) && kloptSaldo ? <Plus color="grey" /> :
        (isOpBetaaldag && isAflossingAlBetaald) || kloptSaldo ? <Plus color="green" /> :
          isVoorBetaaldag && isAflossingAlBetaald ? <Plus color="lightGreen" /> :
            heeftBetalingAchtersstand ? <Min color="red" /> : <Plus color="orange" />
    }
  }

  return (
    <>
      {aflossingen.length === 0 &&
        <Typography variant='h4'>{actieveHulpvrager?.bijnaam} heeft geen schulden/aflossingen ingericht.</Typography>
      }
      {aflossingen.length > 0 &&
        <>
          <Typography variant='h4'>Schulden/aflossingen pagina</Typography>
          <Grid container spacing={2} columns={{ xs: 1, md: 3 }} justifyContent="space-between">
            <Grid size={1} alignItems="start">
              <PeriodeSelect />
            </Grid>
            <Grid size={1} alignItems="start">
              <Box sx={{ my: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
                  <DatePicker
                    slotProps={{ textField: { variant: "standard" } }}
                    label="Tijdreizen"
                    value={formDatum}
                    onChange={(newvalue) => handleInputChange(newvalue ? newvalue : dayjs())}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            <Grid size={1} alignItems={{ xs: 'start', md: 'end' }} sx={{ mb: '12px', display: 'flex' }}>
              <NieuweAflossingDialoog onAflossingBewaardChange={onAflossingBewaardChange} />
            </Grid>
          </Grid>
          <Accordion
            elevation={2}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls={"afbouwgrafiek"}
              id={"afbouwgrafiek"}>
              <Typography
                sx={{ color: 'FFF' }}
                component="span">
                Verwachte afbouw van de schulden/aflossingen
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }} >
              <AflossingenAfbouwGrafiek
                gekozenPeriode="2024-12" />
            </AccordionDetails>
          </Accordion>

        </>
      }
      {aflossingen.map(aflossing =>
        <Accordion
          elevation={2}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={aflossing.rekening.naam}
            id={aflossing.rekening.naam}>
            <Typography
              sx={{ color: 'FFF' }}
              component="span">
              {berekenToestandIcoon(aflossing)} &nbsp; {aflossing.rekening.naam}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }} >
            <AflossingTabel
              aflossing={aflossing} />
          </AccordionDetails>
        </Accordion>
      )}
      <StyledSnackbar message={message.message} type={message.type} />
    </>
  )
}

