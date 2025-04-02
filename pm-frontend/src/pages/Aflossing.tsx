import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Box from '@mui/material/Box';

import { useCallback, useEffect, useState } from "react";
import { useCustomContext } from "../context/CustomContext";

import { AflossingDTO, ExtendedAflossingDTO } from '../model/Aflossing'
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import AflossingTabel from "../components/Aflossing/AflossingTabel";
import { MinIcon } from "../icons/Min";
import { PlusIcon } from "../icons/Plus";
import dayjs from "dayjs";
import { AflossingenAfbouwGrafiek } from "../components/Aflossing/Graph/AflossingenAfbouwGrafiek";
import { PeriodeSelect } from "../components/Periode/PeriodeSelect";
import { useNavigate } from "react-router-dom";
import { dagInPeriode } from "../model/Periode";

export default function Aflossingen() {

  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, gekozenPeriode, setSnackbarMessage } = useCustomContext();

  const [aflossingen, setAflossingen] = useState<ExtendedAflossingDTO[]>([])
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const fetchAflossingen = useCallback(async () => {
    if (actieveHulpvrager && gekozenPeriode) {
      setIsLoading(true);
      const id = actieveHulpvrager!.id
      let token
      try {
        token = await getIDToken();
      } catch (error) {
        setIsLoading(false);
        navigate('/login');
      }
      const formDatum = dayjs().isAfter(dayjs(gekozenPeriode.periodeEindDatum)) ? dayjs(gekozenPeriode.periodeEindDatum) : dayjs();
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
        setAflossingen(result.map((aflossing: AflossingDTO) => toExtendedAflossingDTO(aflossing)));
      } else {
        console.error("Failed to fetch data", response.status);
        setSnackbarMessage({
          message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
          type: "warning"
        })
      }
    }
  }, [getIDToken, actieveHulpvrager, gekozenPeriode]);

  useEffect(() => {
    fetchAflossingen();
  }, [fetchAflossingen]);

  const aflossingMoetBetaaldZijn = (betaalDag: number | undefined) => {
    if (betaalDag === undefined) return true;
    const betaalDagInPeriode = dagInPeriode(betaalDag, gekozenPeriode);
    return betaalDagInPeriode.isBefore(peilDatum) || betaalDagInPeriode.isSame(props.peilDatum);
  }
  const toExtendedAflossingDTO = (aflossing: AflossingDTO): ExtendedAflossingDTO =>{
    return {
      ...aflossing,
      aflossingMoetBetaaldZijn: aflossingMoetBetaaldZijn(aflossing.betaalDag),
      actueleStand: aflossing.saldoStartPeriode ?? 0 + (aflossing.aflossingBetaling ?? 0),
      actueleAchterstand: (aflossing.deltaStartPeriode ?? 0) + (aflossing.aflossingBetaling ?? 0) - (aflossingMoetBetaaldZijn(aflossing.betaalDag) ?  (aflossing.aflossingsBedrag ?? 0) : 0),
      meerDanVerwacht: aflossingMoetBetaaldZijn(aflossing.betaalDag) ? 0 : Math.min((aflossing.aflossingBetaling ?? 0), aflossing.aflossingsBedrag),
      minderDanVerwacht: aflossingMoetBetaaldZijn(aflossing.betaalDag) ? Math.max(0, aflossing.aflossingsBedrag - (aflossing.aflossingBetaling ?? 0)) : 0,
      meerDanMaandAflossing: Math.max(0, (aflossing.aflossingBetaling ?? 0) - aflossing.aflossingsBedrag)
    } as ExtendedAflossingDTO;}

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De aflossingen worden opgehaald.</Typography>
  }

  const berekenToestandAflossingIcoon = (aflossing: AflossingDTO): JSX.Element => {
    if (!aflossing)
      return <MinIcon color="black" />
    else {
      const isVoorBetaaldag = aflossing.betaalDag > parseInt(aflossing.aflossingPeilDatum?.slice(8) ?? '0') && gebruiker?.periodeDag && parseInt(aflossing.aflossingPeilDatum?.slice(8) ?? '0') >= gebruiker?.periodeDag;
      const isOpBetaaldag = aflossing.betaalDag == parseInt(aflossing.aflossingPeilDatum?.slice(8) ?? '0');
      const kloptSaldo = aflossing.deltaStartPeriode == aflossing.saldoStartPeriode;
      const heeftBetalingAchtersstand = (aflossing.deltaStartPeriode ?? 0) < (aflossing.saldoStartPeriode ?? 0);
      const isAflossingAlBetaald = (Math.round((aflossing.deltaStartPeriode ?? 0) - (aflossing.saldoStartPeriode ?? 0) - aflossing.aflossingsBedrag) === 0);
      return (isVoorBetaaldag || isOpBetaaldag) && kloptSaldo ? <PlusIcon color="#bdbdbd" /> :
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
                aflossingen={aflossingen} />
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
    </>
  )
}

