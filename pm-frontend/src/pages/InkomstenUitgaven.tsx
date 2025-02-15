import { aflossenBetalingsSoorten, BetalingDTO, BetalingsSoort, betalingsSoortFormatter, currencyFormatter, inkomstenBetalingsSoorten, internBetalingsSoorten, reserverenBetalingsSoorten } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomContext } from '../context/CustomContext';
import InkomstenUitgavenTabel from '../components/Betaling/InkomstenUitgavenTabel';
import BetaalTabel from '../components/Betaling/BetalingTabel';
import { berekenBedragVoorRekenining, Rekening, RekeningSoort } from '../model/Rekening';
import UpsertBetalingDialoog from '../components/Betaling/UpsertBetalingDialoog';

import { inkomstenRekeningSoorten, interneRekeningSoorten } from '../model/Rekening';
import AflossingReserveringTabel from '../components/Betaling/AflossingReserveringTabel';
import { PeriodeSelect } from '../components/PeriodeSelect';
import { InkomstenIcon } from '../icons/Inkomsten';
import { UitgavenIcon } from '../icons/Uitgaven';
import { InternIcon } from '../icons/Intern';

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, rekeningen, gekozenPeriode } = useCustomContext();

  const [betalingen, setBetalingen] = useState<BetalingDTO[]>([])
  const [aflossingsBedrag, setAflossingsBedrag] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false);

  const inkomstenRekeningen: Rekening[] = rekeningen.filter(rekening => inkomstenRekeningSoorten.includes(rekening.rekeningSoort))
  const uitgaveRekeningen: Rekening[] = rekeningen.filter(rekening => rekening.rekeningSoort === RekeningSoort.uitgaven)
  const interneRekeningen: Rekening[] = rekeningen.filter(rekening => interneRekeningSoorten.includes(rekening.rekeningSoort))

  const fetchBetalingen = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}?fromDate=${gekozenPeriode?.periodeStartDatum}&toDate=${gekozenPeriode?.periodeEindDatum}&size=-1`, {
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
  }, [getIDToken, actieveHulpvrager, gebruiker, gekozenPeriode]);

  useEffect(() => {
    fetchBetalingen();
  }, [fetchBetalingen]);

  const fetchAflossingsBedrag = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/aflossing/hulpvrager/${id}/aflossingsbedrag`, {
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
      .filter((betaling) => betaling.betalingsSoort && aflossenBetalingsSoorten.includes(betaling.betalingsSoort))
      .reduce((acc, betaling) => (acc - betaling.bedrag), 0)
  }

  const berekenReserveringTotaal = () => {
    return betalingen
      .filter((betaling) => betaling.betalingsSoort && reserverenBetalingsSoorten.includes(betaling.betalingsSoort))
      .reduce((acc, betaling) => (acc + Number((betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ? betaling.bedrag : -betaling.bedrag))), 0)
  }

  const berekenInkomstenTotaal = (): number => {
    return betalingen
      .filter((betaling) => betaling.betalingsSoort === BetalingsSoort.inkomsten)
      .reduce((acc, betaling) => (acc + Number(betaling.bedrag)), 0)
  }

  const berekenUitgavenTotaal = (): number => {
    return betalingen
      .filter((betaling) => (betaling.betalingsSoort === BetalingsSoort.uitgaven ||
        betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ||
        betaling.betalingsSoort === BetalingsSoort.aflossen
      ))
      .reduce((acc, betaling) => (acc - betaling.bedrag), 0)
  }

  const berekenCashFlowTotaal = (): number => {
    return Number(berekenInkomstenTotaal()) + Number(berekenUitgavenTotaal())

  }

  const heeftAflossenBetalingen = () => {
    return betalingen.find((betaling) => betaling.betalingsSoort && aflossenBetalingsSoorten.includes(betaling.betalingsSoort))
  }

  const heeftReserverenBetalingen = () => {
    return betalingen.find((betaling) => betaling.betalingsSoort && reserverenBetalingsSoorten.includes(betaling.betalingsSoort))
  }

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De betalingen worden opgehaald.</Typography>
  }

  const onBetalingBewaardChange = (): void => {
    fetchBetalingen()
  }

  const isPeriodeOpen = gekozenPeriode?.periodeStatus === 'OPEN' || gekozenPeriode?.periodeStatus === 'HUIDIG';

  return (
    <>
      <Typography variant='h4'>Inkomsten & uitgaven</Typography>
      <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, md: 3 }}>
        <Grid size={1}>
          <PeriodeSelect />
        </Grid>
        <Grid size={1}>
          <Typography sx={{ mt: { xs: '0px', md: '35px' } }}>
            Inkomend ({currencyFormatter.format(Number(berekenInkomstenTotaal()))}) 
            - uitgaand ({currencyFormatter.format(Number(berekenUitgavenTotaal()))}) geld
            = {currencyFormatter.format(berekenCashFlowTotaal())}
          </Typography>
        </Grid>
        {isPeriodeOpen &&
          <Grid size={1} alignItems={{ xs: 'start', md: 'end' }} sx={{ mb: '12px', display: 'flex' }}>
            <UpsertBetalingDialoog
              editMode={false}
              betaling={undefined}
              onBetalingBewaardChange={onBetalingBewaardChange} />
          </Grid>}
      </Grid>
      <Grid sx={{ mb: '25px' }}>
        <Accordion >
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={'BetalingTabel'}
            id={'BetalingTabel'}>
            <Typography component="span">Weergave als tabel</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <BetaalTabel
            aflossingsBedrag={aflossingsBedrag}
              betalingen={betalingen} />
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid sx={{ mb: '25px' }}>
        <Accordion >
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={'BetalingTabel'}
            id={'BetalingTabel'}>
            <Typography component="span">Weergave als 3 kolommen</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
              <Grid size={{ xs: 1, lg: 4 }}>
                {inkomstenRekeningen.length > 0 &&
                  <div>
                    <Typography ><InkomstenIcon /> totaal: {currencyFormatter.format(berekenInkomstenTotaal())}</Typography>
                  </div>
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
                          betalingen={betalingen.filter(betaling => betaling.betalingsSoort && inkomstenBetalingsSoorten.includes(betaling.betalingsSoort))}
                          onBetalingBewaardChange={onBetalingBewaardChange} />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
              </Grid>
              <Grid size={{ xs: 1, lg: 4 }}>
                {uitgaveRekeningen.length > 1 &&
                  <div>
                    <Typography ><UitgavenIcon /> totaal: {currencyFormatter.format(berekenUitgavenTotaal())}</Typography>
                  </div>
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
                          betalingen={betalingen.filter(betaling => betaling.betalingsSoort === BetalingsSoort.uitgaven)} />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
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
                          onBetalingBewaardChange={onBetalingBewaardChange}
                          betalingen={betalingen.filter(betaling => betaling.betalingsSoort && aflossenBetalingsSoorten.includes(betaling.betalingsSoort))}
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
                          onBetalingBewaardChange={onBetalingBewaardChange}
                          betalingen={betalingen.filter(betaling => betaling.betalingsSoort && reserverenBetalingsSoorten.includes(betaling.betalingsSoort))}
                          isAflossing={false} />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                }
              </Grid>
              <Grid size={{ xs: 1, lg: 4 }}>
                {interneRekeningen.length > 0 &&
                  <div>
                    <Typography ><InternIcon/></Typography>
                  </div>
                }
                {interneRekeningen.map(rekening =>
                  <Grid >
                    <Accordion >
                      <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls={rekening.naam}
                        id={rekening.naam}>
                        <Typography component="span">{betalingsSoortFormatter(rekening.naam)} betalingen</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <InkomstenUitgavenTabel
                          actueleRekening={rekening}
                          onBetalingBewaardChange={onBetalingBewaardChange}
                          betalingen={betalingen.filter(betaling => betaling.betalingsSoort && internBetalingsSoorten.includes(betaling.betalingsSoort))} />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
        <Grid size={{ xs: 1, lg: 4 }}>
          <Accordion >
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="blaat"
              id={"blaat"}>
              <Typography >Betalingen per rekening
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <InkomstenUitgavenTabel
                isFilterSelectable={true}
                actueleRekening={undefined}
                onBetalingBewaardChange={onBetalingBewaardChange}
                betalingen={betalingen} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
}
