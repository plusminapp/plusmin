import { Box, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";
import Resultaat from "../components/Resultaat";
import StyledSnackbar, { SnackbarMessage } from "../components/StyledSnackbar";
import type { Stand } from "../model/Stand";
import dayjs from "dayjs";
import { PeriodeSelect } from "../components/PeriodeSelect";

export default function Stand() {

  const [stand, setStand] = useState<Stand | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [message, setMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gekozenPeriode } = useCustomContext();
  const navigate = useNavigate();

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
          setMessage({
            message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
            type: "warning",
          })
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, gekozenPeriode, getIDToken]);


  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  return (
    <>
      {stand !== undefined &&
        <>
          <Typography variant='h4'>Hoe staan we ervoor?</Typography>
          <Typography sx={{ my: 2 }}>Deze pagina is (nog) heel boekhoudkundig en niet geschikt voor de hulpvrager ...</Typography>
          <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 1, md: 2 }}>
            <Grid size={1}>
              <PeriodeSelect />
            </Grid>
            <Grid size={1} alignItems={{ xs: 'start', md: 'end' }} sx={{ mb: '12px', display: 'flex' }}>
              <FormGroup sx={{ ml: 'auto' }} >
                <FormControlLabel control={
                  <Switch
                    sx={{ transform: 'scale(0.6)' }}
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />}
                  label="Toon opening & mutaties" />
              </FormGroup>
            </Grid>
          </Grid>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 4, md: 12 }}>
              <Grid size={checked ? { xs: 1, sm: 2, md: 3 } : { xs: 2, sm: 4, md: 6 }}>
                <Resultaat title={'Inkomsten en uitgaven'} datum={stand.peilDatum} saldi={stand.resultaatOpDatum} />
              </Grid>
              {checked &&
                <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                  <Resultaat title={'Opening'} datum={stand.periodeStartDatum} saldi={stand.openingsBalans!} />
                </Grid>}
              {checked &&
                <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                  <Resultaat title={'Mutaties per'} datum={stand.peilDatum} saldi={stand.mutatiesOpDatum!} />
                </Grid>}
              <Grid size={checked ? { xs: 1, sm: 2, md: 3 } : { xs: 2, sm: 4, md: 6 }}>
                <Resultaat title={'Stand'} datum={stand.peilDatum} saldi={stand.balansOpDatum!} />
              </Grid>
            </Grid>
          </Box>
        </>
      }
      <StyledSnackbar message={message.message} type={message.type} onClose={() => setMessage({ message: undefined, type: undefined })}/>
      </>
  )
}