import { aflossenBetalingsSoorten, BetalingDTO, BetalingsSoort, betalingsSoortFormatter, currencyFormatter, inkomstenBetalingsSoorten, internBetalingsSoorten, reserverenBetalingsSoorten } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomContext } from '../context/CustomContext';
import InkomstenUitgavenTabel from '../components/Betaling/InkomstenUitgavenTabel';
import BetaalTabel from '../components/Betaling/BetalingTabel';
import { berekenBedragVoorRekenining, Rekening, RekeningSoort } from '../model/Rekening';
import UpsertBetalingDialoog from '../components/Betaling/UpsertBetalingDialoog';
import { useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { inkomstenRekeningSoorten, interneRekeningSoorten } from '../model/Rekening';
import AflossingReserveringTabel from '../components/Betaling/AflossingReserveringTabel';
import { PeriodeSelect } from '../components/PeriodeSelect';
import { InkomstenIcon } from '../icons/Inkomsten';
import { UitgavenIcon } from '../icons/Uitgaven';
import { InternIcon } from '../icons/Intern';
import { PlusIcon } from '../icons/Plus';
import { MinIcon } from '../icons/Min';
import { ExternalLinkIcon } from '../icons/ExternalLink';
import dayjs from 'dayjs';

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, rekeningen, gekozenPeriode } = useCustomContext();

  const [betalingen, setBetalingen] = useState<BetalingDTO[]>([])
  const [aflossingsBedrag, setAflossingsBedrag] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false);

  const inkomstenRekeningen: Rekening[] = rekeningen.filter(rekening => inkomstenRekeningSoorten.includes(rekening.rekeningSoort))
  const uitgaveRekeningen: Rekening[] = rekeningen.filter(rekening => rekening.rekeningSoort === RekeningSoort.uitgaven)
  const interneRekeningen: Rekening[] = rekeningen.filter(rekening => interneRekeningSoorten.includes(rekening.rekeningSoort))
  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

  const [expanded, setExpanded] = useState<string | false>(isMdOrLarger ? 'tabel' : 'kolommen');
  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

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

  const onBetalingBewaardChange = (betaling: BetalingDTO): void => {
    console.log('in onBetalingBewaardChange met betaling', betaling.omschrijving);
    setBetalingen([...betalingen.filter(b => b.id !== betaling.id), betaling]);
  }

  const onBetalingVerwijderdChange = (betaling: BetalingDTO): void => {
    console.log('in onBetalingVerwijderdChange met betaling', betaling.omschrijving);
    setBetalingen(betalingen.filter(b => b.id !== betaling.id));
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
              onUpsertBetalingClose={() => { }}
              onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
              onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)} />
          </Grid>}
      </Grid>
      {isMdOrLarger &&
        <Grid sx={{ mb: '25px' }}>
          <Accordion expanded={expanded === 'tabel'} onChange={handleChange('tabel')}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls={'BetalingTabel'}
              id={'BetalingTabel'}>
              <Typography component="span">Weergave als tabel</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <BetaalTabel
                aflossingsBedrag={aflossingsBedrag}
                betalingen={betalingen.sort((a, b) => dayjs(a.boekingsdatum).isBefore(dayjs(b.boekingsdatum)) ? -1 : 1)}
                onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      }
      <Grid sx={{ mb: '25px' }}>
        <Accordion expanded={expanded === 'kolommen'} onChange={handleChange('kolommen')}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={'BetalingTabel'}
            id={'BetalingTabel'}>
            <Typography component="span">Weergave als 3 kolommen</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
              <Grid size={{ xs: 1, lg: 4 }} justifyContent={'center'}>
                {inkomstenRekeningen.length > 0 &&
                  <Box display="flex" alignItems="center" justifyContent="flex-start" ml={2}>
                    <Box display="flex" alignItems="center" justifyContent="flex-start">
                      <InkomstenIcon />
                    </Box>
                    &nbsp;
                    <Typography>{currencyFormatter.format(berekenInkomstenTotaal())}</Typography>
                  </Box>
                }
                {inkomstenRekeningen.map(rekening =>
                  <Grid >
                    <Accordion >
                      <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls={rekening.naam}
                        id={rekening.naam}>
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <PlusIcon color={'green'} height={15} />
                          </Box>
                          &nbsp;
                          <Typography sx={{ fontSize: '15px' }} component="span">{rekening.naam}: {currencyFormatter.format(berekenRekeningTotaal(rekening))}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <InkomstenUitgavenTabel
                          actueleRekening={rekening}
                          betalingen={betalingen
                            .sort((a, b) => dayjs(a.boekingsdatum).isBefore(dayjs(b.boekingsdatum)) ? -1 : 1)
                            .filter(betaling => betaling.betalingsSoort && inkomstenBetalingsSoorten.includes(betaling.betalingsSoort))}
                          onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                          onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)} />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
              </Grid>
              <Grid size={{ xs: 1, lg: 4 }}>
                {uitgaveRekeningen.length > 1 &&
                  <Box display="flex" alignItems="center" justifyContent="flex-start" ml={2}>
                    <Box display="flex" alignItems="center" justifyContent="flex-start">
                      <UitgavenIcon />
                    </Box>
                    &nbsp;
                    <Typography>{currencyFormatter.format(berekenUitgavenTotaal())}</Typography>
                  </Box>
                }
                {uitgaveRekeningen.map(rekening =>
                  <Grid >
                    <Accordion >
                      <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls={rekening.naam}
                        id={rekening.naam}>
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <PlusIcon color={'green'} height={15} />
                          </Box>
                          &nbsp;
                          <Typography sx={{ fontSize: '15px' }} component="span">{rekening.naam}: {currencyFormatter.format(berekenRekeningTotaal(rekening))}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <InkomstenUitgavenTabel
                          actueleRekening={rekening}
                          onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                          onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)}
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
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <Link component={RouterLink} to="/schuld-aflossingen" display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                              {berekenAflossingTotaal() - aflossingsBedrag === 0 && <PlusIcon height={15} color='green' />}
                              {berekenAflossingTotaal() - aflossingsBedrag !== 0 && <MinIcon height={15} color='orange' />}
                              <ExternalLinkIcon />
                            </Link>
                          </Box>
                          &nbsp;
                          <Typography sx={{ fontSize: '15px' }} component="span">Aflossingen: {currencyFormatter.format(berekenAflossingTotaal())} (van {currencyFormatter.format(-aflossingsBedrag)})</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <AflossingReserveringTabel
                          onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                          onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)}
                          betalingen={betalingen
                            .sort((a, b) => dayjs(a.boekingsdatum).isBefore(dayjs(b.boekingsdatum)) ? -1 : 1)
                            .filter(betaling => betaling.betalingsSoort && aflossenBetalingsSoorten.includes(betaling.betalingsSoort))}
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
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <PlusIcon color={'green'} height={15} />
                          </Box>
                          &nbsp;
                          <Typography sx={{ fontSize: '15px' }} component="span">Reserveringen: {currencyFormatter.format(berekenReserveringTotaal())}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <AflossingReserveringTabel
                          onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                          onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)}
                          betalingen={betalingen
                            .sort((a, b) => dayjs(a.boekingsdatum).isBefore(dayjs(b.boekingsdatum)) ? -1 : 1)
                            .filter(betaling => betaling.betalingsSoort && reserverenBetalingsSoorten.includes(betaling.betalingsSoort))}
                          isAflossing={false} />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                }
              </Grid>
              <Grid size={{ xs: 1, lg: 4 }}>
                {interneRekeningen.length > 0 &&
                  <Box display="flex" alignItems="center" justifyContent="flex-start" ml={2}>
                    <InternIcon />
                  </Box>
                }
                {interneRekeningen.map(rekening =>
                  <Grid >
                    <Accordion >
                      <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls={rekening.naam}
                        id={rekening.naam}>
                        {(rekening.rekeningSoort === RekeningSoort.contant || rekening.rekeningSoort === RekeningSoort.spaarrekening) &&
                          <Typography sx={{ fontSize: '15px' }} component="span">{betalingsSoortFormatter(rekening.naam)} opname/storting</Typography>}
                        {rekening.rekeningSoort === RekeningSoort.creditcard &&
                          <Typography sx={{ fontSize: '15px' }} component="span">{betalingsSoortFormatter(rekening.naam)} incasso</Typography>}
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <InkomstenUitgavenTabel
                          actueleRekening={rekening}
                          onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                          onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)}
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
          <Accordion expanded={expanded === 'rekening'} onChange={handleChange('rekening')}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="blaat"
              id={"blaat"}>
              <Typography sx={{ fontSize: '15px' }} >Betalingen per rekening
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <InkomstenUitgavenTabel
                isFilterSelectable={true}
                actueleRekening={undefined}
                onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)}
                betalingen={betalingen.sort((a, b) => dayjs(a.boekingsdatum).isBefore(dayjs(b.boekingsdatum)) ? -1 : 1)} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
}
