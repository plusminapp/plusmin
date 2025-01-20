import { aflossenBetalingsSoorten, Betaling, BetalingsSoort, currencyFormatter, reserverenBetalingsSoorten, stortenOpnemenBetalingsSoorten } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomContext } from '../context/CustomContext';
import InkomstenUitgavenTabel from '../components/Betaling/InkomstenUitgavenTabel';
import { berekenBedragVoorRekenining, cashflowRekeningSoorten, Rekening, RekeningSoort } from '../model/Rekening';
import NieuweBetalingDialoog from '../components/Betaling/NieuweBetalingDialoog';
import AflossingReserveringTabel from '../components/Betaling/AflossingReserveringTabel';

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, rekeningen } = useCustomContext();

  const [betalingen, setBetalingen] = useState<Betaling[]>([])
  const [aflossingsBedrag, setAflossingsBedrag] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false);
  // const [checked, setChecked] = useState(false);

  const uitgaveRekeningen: Rekening[] = rekeningen.filter(rekening => rekening.rekeningSoort == RekeningSoort.uitgaven)
  const inkomstenRekeningen: Rekening[] = rekeningen.filter(rekening => rekening.rekeningSoort == RekeningSoort.inkomsten)

  const fetchBetalingen = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}?size=-1`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setBetalingen(result.data.content);
      } else {
        console.error("Failed to fetch data", response.status);
      }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker]);

  useEffect(() => {
    fetchBetalingen();
  }, [fetchBetalingen]);

  const fetchAflossingsBedrag = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/lening/hulpvrager/${id}/aflossingsbedrag`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setAflossingsBedrag(result);
      } else {
        console.error("Ophalen van het aflossingsBedrag is mislukt.", response.status);
      }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker]);

  useEffect(() => {
    fetchAflossingsBedrag();
  }, [fetchAflossingsBedrag]);

  const berekenRekeningTotaal = (rekening: Rekening) => {
    return betalingen.reduce((acc, betaling) => (acc + berekenBedragVoorRekenining(betaling, rekening)), 0)
  }

  const berekenAflossingTotaal = () => {
    return betalingen
      .filter((betaling) => aflossenBetalingsSoorten.includes(betaling.betalingsSoort))
      .reduce((acc, betaling) => (acc - betaling.bedrag), 0)
    // .reduce((acc, betaling) => (acc + (betaling.betalingsSoort === BetalingsSoort.aangaan_lening ? betaling.bedrag : -betaling.bedrag)), 0)
  }

  const berekenReserveringTotaal = () => {
    return betalingen
      .filter((betaling) => reserverenBetalingsSoorten.includes(betaling.betalingsSoort))
      .reduce((acc, betaling) => (acc + (betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ? betaling.bedrag : -betaling.bedrag)), 0)
  }

  const berekenInkomstenTotaal = () => {
    return betalingen
      .filter((betaling) => betaling.betalingsSoort === BetalingsSoort.inkomsten)
      .reduce((acc, betaling) => (acc + betaling.bedrag), 0)
  }

  const berekenUitgavenTotaal = () => {
    return betalingen
      .filter((betaling) => (betaling.betalingsSoort === BetalingsSoort.uitgaven || betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering))
      .reduce((acc, betaling) => (acc - betaling.bedrag), 0)
  }

  const berekenCashFlowTotaal = () => {
    return betalingen
      .filter((betaling) =>
      (!stortenOpnemenBetalingsSoorten.includes(betaling.betalingsSoort) &&
        (cashflowRekeningSoorten.includes(betaling.bron!.rekeningSoort) ||
          cashflowRekeningSoorten.includes(betaling.bestemming!.rekeningSoort))))
      .reduce((acc, betaling) => (acc + (cashflowRekeningSoorten.includes(betaling.bron!.rekeningSoort) ? -betaling.bedrag : betaling.bedrag)), 0)
  }

  const heeftAflossenBetalingen = () => {
    return betalingen.find((betaling) => aflossenBetalingsSoorten.includes(betaling.betalingsSoort))
  }

  const heeftReserverenBetalingen = () => {
    return betalingen.find((betaling) => reserverenBetalingsSoorten.includes(betaling.betalingsSoort))
  }

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De betalingen worden opgehaald.</Typography>
  }

  const onBetalingBewaardChange = () => {
    fetchBetalingen()
  }

  return (
    <>
      <Typography variant='h4'>Inkomsten & uitgaven</Typography>
      <Grid size={1} alignItems="end" sx={{ mb: '12px', display: 'flex' }}>
        <NieuweBetalingDialoog
          editMode={false}
          onBetalingBewaardChange={onBetalingBewaardChange} />
      </Grid>
      <Typography sx={{ py: '18px', mx: '18px' }}>Inkomend - uitgaand geld: {currencyFormatter.format(berekenCashFlowTotaal())}</Typography>
      <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
        <Grid size={{ xs: 1, lg: 4 }}>
          {inkomstenRekeningen.length > 1 &&
            <Typography sx={{ py: '18px', mx: '18px' }}>Uitgaven totaal: {currencyFormatter.format(berekenInkomstenTotaal())}</Typography>
          }
          {inkomstenRekeningen.map(rekening =>
            <Grid >
              <Accordion >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls={rekening.naam}
                  id={rekening.naam}>
                  <Typography component="span">{rekening.naam}: {currencyFormatter.format(berekenRekeningTotaal(rekening))}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <InkomstenUitgavenTabel
                    actueleRekening={rekening}
                    betalingen={betalingen}
                    onBetalingBewaardChange={onBetalingBewaardChange} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
        <Grid size={{ xs: 1, lg: 4 }}>
          {uitgaveRekeningen.length > 1 &&
            <Typography sx={{ py: '18px', mx: '18px' }}>Uitgaven totaal: {currencyFormatter.format(berekenUitgavenTotaal())}</Typography>
          }
          {uitgaveRekeningen.map(rekening =>
            <Grid >
              <Accordion >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls={rekening.naam}
                  id={rekening.naam}>
                  <Typography component="span">{rekening.naam}: {currencyFormatter.format(berekenRekeningTotaal(rekening))}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <InkomstenUitgavenTabel
                    actueleRekening={rekening}
                    onBetalingBewaardChange={onBetalingBewaardChange}
                    betalingen={betalingen} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
        <Grid size={{ xs: 1, lg: 4 }}>
          {heeftReserverenBetalingen() && heeftAflossenBetalingen() &&
            <Typography sx={{ py: '18px', mx: '18px' }}>
              Aflossingen/Reserveringen totaal: {currencyFormatter.format(berekenAflossingTotaal() + berekenReserveringTotaal())}
            </Typography>}
          {heeftAflossenBetalingen() &&
            <Grid >
              <Accordion >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls='extra'
                  id='extra'>
                  <Typography component="span">Aflossingen: {currencyFormatter.format(berekenAflossingTotaal())} (van {currencyFormatter.format(-aflossingsBedrag)})</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <AflossingReserveringTabel
                    betalingen={betalingen}
                    isAflossing={true} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          }
          {heeftReserverenBetalingen() &&
            <Grid >
              <Accordion >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls='extra'
                  id='extra'>
                  <Typography component="span">Reserveringen: {currencyFormatter.format(berekenReserveringTotaal())}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <AflossingReserveringTabel
                    betalingen={betalingen}
                    isAflossing={false} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          }
        </Grid>
      </Grid>
    </>
  );
}
