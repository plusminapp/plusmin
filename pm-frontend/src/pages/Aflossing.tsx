import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Box from '@mui/material/Box';

import { useCallback, useEffect, useState } from "react";
import { useCustomContext } from "../context/CustomContext";

import { Aflossing } from '../model/Aflossing'
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import AflossingTabel from "../components/Aflossing/AflossingTabel";
import StyledSnackbar, { SnackbarMessage } from "../components/StyledSnackbar";
import { MinIcon } from "../icons/Min";
import { PlusIcon } from "../icons/Plus";
import dayjs from "dayjs";
import NieuweAflossingDialoog from "../components/Aflossing/NieuweAflossingDialoog";
import { AflossingenAfbouwGrafiek } from "../components/Aflossing/Graph/AflossingenAfbouwGrafiek";
import { PeriodeSelect } from "../components/PeriodeSelect";

export default function Aflossingen() {

  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, gekozenPeriode } = useCustomContext();

  const [aflossingen, setAflossingen] = useState<Aflossing[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [formDatum, setFormDatum] = useState<dayjs.Dayjs>(dayjs());
  const [message, setMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });

  useEffect(() => {
    if (gekozenPeriode) {
      if (dayjs().isBefore(dayjs(gekozenPeriode.periodeEindDatum))) {
        setFormDatum(dayjs());
      } else {
        setFormDatum(dayjs(gekozenPeriode.periodeEindDatum));
      }
    }
  }, [gekozenPeriode]);

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

  const berekenToestandAflossingIcoon = (aflossing: Aflossing): JSX.Element => {
    if (!aflossing.aflossingSaldiDTO)
      return <MinIcon color="black" />
    else {
      const isVoorBetaaldag = aflossing.betaalDag > parseInt(aflossing.aflossingSaldiDTO.peilDatum.slice(8)) && gebruiker?.periodeDag && parseInt(aflossing.aflossingSaldiDTO.peilDatum.slice(8)) >= gebruiker?.periodeDag;
      const isOpBetaaldag = aflossing.betaalDag == parseInt(aflossing.aflossingSaldiDTO.peilDatum.slice(8));
      const kloptSaldo = aflossing.aflossingSaldiDTO.berekendSaldo == aflossing.aflossingSaldiDTO.werkelijkSaldo;
      const heeftBetalingAchtersstand = aflossing.aflossingSaldiDTO.berekendSaldo < aflossing.aflossingSaldiDTO.werkelijkSaldo
      const isAflossingAlBetaald = (Math.round(aflossing.aflossingSaldiDTO.berekendSaldo - aflossing.aflossingSaldiDTO.werkelijkSaldo - aflossing.aflossingsBedrag) === 0);
      return (isVoorBetaaldag || isOpBetaaldag) && kloptSaldo ? <PlusIcon color="grey" /> :
        (isOpBetaaldag && isAflossingAlBetaald) || kloptSaldo ? <PlusIcon color="green" /> :
          isVoorBetaaldag && isAflossingAlBetaald ? <PlusIcon color="lightGreen" /> :
            heeftBetalingAchtersstand ? <MinIcon color="red" /> : <PlusIcon color="orange" />
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
              <AflossingenAfbouwGrafiek />
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {berekenToestandAflossingIcoon(aflossing)}
              <Typography
                sx={{ color: 'FFF', ml: 1, whiteSpace: 'nowrap' }}
                component="span"
                align="left">
                {aflossing.rekening.naam}
              </Typography>
            </Box>
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

