import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Box from '@mui/material/Box';

import { useCallback, useEffect, useState } from "react";
import { useCustomContext } from "../context/CustomContext";

import { Lening } from '../model/Lening'
import { ArrowDropDownIcon, DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import LeningTabel from "../components/Lening/LeningTabel";
import StyledSnackbar, { SnackbarMessage } from "../components/StyledSnackbar";
import { Min } from "../assets/Min";
import { Plus } from "../assets/Plus";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import NieuweLeningDialoog from "../components/Lening/NieuweLeningDialoog";
import { LeningenAfbouwGrafiek } from "../components/Lening/Graph/LeningenAfbouwGrafiek";
import { PeriodeSelect } from "../components/PeriodeSelect";

export default function Leningen() {

  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager } = useCustomContext();

  const [leningen, setLeningen] = useState<Lening[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [formDatum, setFormDatum] = useState<dayjs.Dayjs>(dayjs());
  const [message, setMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });


  const fetchLeningen = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const id = actieveHulpvrager!.id
      const token = await getIDToken();
      const response = await fetch(`/api/v1/lening/hulpvrager/${id}/datum/${formDatum.toISOString().slice(0, 10)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setLeningen(result);
      } else {
        console.error("Failed to fetch data", response.status);
        setMessage({
          message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
          type: "warning"})
   }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker, formDatum]);

  useEffect(() => {
    fetchLeningen();
  }, [fetchLeningen]);

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De leningen worden opgehaald.</Typography>
  }

  const onLeningBewaardChange = () => {
    fetchLeningen()
  }

  const handleInputChange = (datum: dayjs.Dayjs) => {
    setFormDatum(datum)
  }

  const berekenToestandIcoon = (lening: Lening) => {
    if (!lening.leningSaldiDTO)
      return <Min color="black" />
    else {
      const isVoorBetaaldag = lening.betaalDag > parseInt(lening.leningSaldiDTO.peilDatum.slice(8)) && parseInt(lening.leningSaldiDTO.peilDatum.slice(8)) >= 21;
      const isOpBetaaldag = lening.betaalDag == parseInt(lening.leningSaldiDTO.peilDatum.slice(8));
      const kloptSaldo = lening.leningSaldiDTO.berekendSaldo == lening.leningSaldiDTO.werkelijkSaldo;
      const heeftBetalingAchtersstand = lening.leningSaldiDTO.berekendSaldo < lening.leningSaldiDTO.werkelijkSaldo
      const isAflossingAlBetaald = (Math.round(lening.leningSaldiDTO.berekendSaldo - lening.leningSaldiDTO.werkelijkSaldo - lening.aflossingsBedrag) === 0);
      return (isVoorBetaaldag || isOpBetaaldag) && kloptSaldo ? <Plus color="grey" /> :
        (isOpBetaaldag && isAflossingAlBetaald) || kloptSaldo ? <Plus color="green" /> :
          isVoorBetaaldag && isAflossingAlBetaald ? <Plus color="lightGreen" /> :
            heeftBetalingAchtersstand ? <Min color="red" /> : <Plus color="orange" />
    }
  }

  return (
    <>
      {leningen.length === 0 &&
        <Typography variant='h4'>{actieveHulpvrager?.bijnaam} heeft geen schulden/leningen ingericht.</Typography>
      }
      {leningen.length > 0 &&
        <>
          <Typography variant='h4'>Schulden/leningen pagina</Typography>
          <Grid container spacing={2} columns={{xs:1, md: 3}} justifyContent="space-between">
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
            <Grid size={1} alignItems="start">
              <PeriodeSelect />
            </Grid>
            <Grid size={1} alignItems={{xs: 'start', md: 'end'}} sx={{ mb: '12px', display: 'flex' }}>
              <NieuweLeningDialoog onLeningBewaardChange={onLeningBewaardChange} />
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
                Verwachte afbouw van de schulden/leningen
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }} >
              <LeningenAfbouwGrafiek
                huidigePeriode="2024-12" />
            </AccordionDetails>
          </Accordion>

        </>
      }
      {leningen.map(lening =>
        <Accordion
          elevation={2}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={lening.rekening.naam}
            id={lening.rekening.naam}>
            <Typography
              sx={{ color: 'FFF' }}
              component="span">
              {berekenToestandIcoon(lening)} &nbsp; {lening.rekening.naam}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }} >
            <LeningTabel
              lening={lening} />
          </AccordionDetails>
        </Accordion>
      )}
      <StyledSnackbar message={message.message} type={message.type} />
    </>
  )
}

