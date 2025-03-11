import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";
import Resultaat from "../components/Resultaat";
import type { Stand } from "../model/Stand";
import dayjs from "dayjs";
import { PeriodeSelect } from "../components/Periode/PeriodeSelect";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import ChartExample from "../components/Budget/ChartExample";
import { bankRekeningSoorten, Rekening } from "../model/Rekening";

export default function Stand() {

  const [stand, setStand] = useState<Stand | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);
  const [toonMutaties, setToonMutaties] = useState(localStorage.getItem('toonMutaties') === 'true');
  const [budgetRekeningen, setBudgetRekeningen] = useState<Rekening[]>([]);
  const handleToonMutatiesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonMutaties', event.target.checked.toString());
    setToonMutaties(event.target.checked);
  };

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gekozenPeriode, rekeningen, setSnackbarMessage } = useCustomContext();
  const navigate = useNavigate();

  console.log('rekeningen filtered', budgetRekeningen.map(rekening => rekening.naam));

  useEffect(() => {
    console.log('gekozenPeriode', gekozenPeriode, 'rekeningen useEffect', JSON.stringify(rekeningen.filter(rekening =>
      rekening.budgetten.length === 1 && rekening.budgetten[0].budgetType.toLowerCase() === 'continu')
      .map(rekening => rekening.naam)));
    if (rekeningen) {
      setBudgetRekeningen(rekeningen.filter(rekening =>
        rekening.budgetten.length === 1 && rekening.budgetten[0].budgetType.toLowerCase() === 'continu'));
    }
  }, [rekeningen])

  useEffect(() => {
    const fetchSaldi = async () => {
      if (actieveHulpvrager && gekozenPeriode) {
        setIsLoading(true);
        const vandaag = dayjs().format('YYYY-MM-DD');
        const datum = gekozenPeriode.periodeEindDatum > vandaag ? vandaag : gekozenPeriode.periodeEindDatum;
        const id = actieveHulpvrager.id
        let token = '';
        try { token = await getIDToken() }
        catch (error) {
          navigate('/login');
        }
        const response = await fetch(`/api/v1/saldo/hulpvrager/${id}/stand/${datum}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setStand(result)
        } else {
          console.error("Failed to fetch data", response.status);
          setSnackbarMessage({
            message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
            type: "warning",
          })
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, gekozenPeriode, getIDToken]);

  const findStandVanRekening = (rekeningNaam: string) => {
    const saldo = stand?.resultaatOpDatum.find(saldo => saldo.rekeningNaam === rekeningNaam);
    return saldo?.bedrag ?? 0;
  };

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  };

  return (
    <>
      {stand !== undefined &&
        <>
          <Typography variant='h4'>Hoe staan we er vandaag voor?</Typography>

          <Typography variant='h6'>De stand van de bankrekeningen</Typography>
          {rekeningen.filter(rekening => bankRekeningSoorten.includes(rekening.rekeningSoort)).map(rekening =>
            <Resultaat
              key={rekening.naam}
              title={rekening.naam}
              datum={stand.peilDatum}
              saldi={stand.balansOpDatum.filter(saldo => saldo.rekeningNaam === rekening.naam)}
            />
          )}

          <Typography variant='h6'>Potjes en bijbehorende budgetten</Typography>

          {gekozenPeriode && budgetRekeningen.map(rekening =>
            <ChartExample
              rekening={rekening}
              peildatum={dayjs()}
              periode={gekozenPeriode}
              besteedOpPeildatum={rekening.rekeningSoort.toLowerCase() === 'uitgaven' ?
                -findStandVanRekening(rekening.naam) : findStandVanRekening(rekening.naam)}
            />
          )}

          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Saldo's op {dayjs(stand.peilDatum).format('D MMMM')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 1, md: 2 }}>
                <Grid size={1}>
                  <PeriodeSelect />
                </Grid>
                <Grid size={1} alignItems={{ xs: 'start', md: 'end' }} sx={{ mb: '12px', display: 'flex' }}>
                  <FormGroup sx={{ ml: 'auto' }} >
                    <FormControlLabel control={
                      <Switch
                        sx={{ transform: 'scale(0.6)' }}
                        checked={toonMutaties}
                        onChange={handleToonMutatiesChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />}
                      label="Toon mutaties" />
                  </FormGroup>
                </Grid>
              </Grid>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={toonMutaties ? { xs: 1, sm: 2, md: 4 } : { xs: 1, sm: 3, md: 3 }}>
                  <Grid size={1}>
                    <Resultaat title={'Opening'} datum={stand.periodeStartDatum} saldi={stand.openingsBalans!} />
                  </Grid>
                  <Grid size={1}>
                    <Resultaat title={'Inkomsten en uitgaven'} datum={stand.peilDatum} saldi={stand.resultaatOpDatum} />
                  </Grid>
                  {toonMutaties &&
                    <Grid size={1}>
                      <Resultaat title={'Mutaties per'} datum={stand.peilDatum} saldi={stand.mutatiesOpDatum!} />
                    </Grid>}
                  <Grid size={1}>
                    <Resultaat title={'Stand'} datum={stand.peilDatum} saldi={stand.balansOpDatum!} />
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        </>
      }
    </>
  )
}