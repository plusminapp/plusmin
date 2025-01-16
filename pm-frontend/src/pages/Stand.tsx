import { Box, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import { RekeningSaldi } from "../model/Saldi";
import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";
import Resultaat from "../components/Resultaat";

export default function Stand() {

  const [openingsBalans, setOpeningsBalans] = useState<RekeningSaldi | undefined>(undefined)
  const [mutatiesOpDatum, setMutatiesOpDatum] = useState<RekeningSaldi | undefined>(undefined)
  const [balansOpDatum, setBalansOpDatum] = useState<RekeningSaldi | undefined>(undefined)
  const [resultaatOpDatum, setResultaatOpDatum] = useState<RekeningSaldi | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager } = useCustomContext();


  useEffect(() => {
    const fetchSaldi = async () => {
      if (actieveHulpvrager) {
        setIsLoading(true);
        const datum = new Date().toISOString().slice(0, 10);
        const id = actieveHulpvrager.id 
        const token = await getIDToken();
        const response = await fetch(`/api/v1/saldi/hulpvrager/${id}/stand/${datum}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setOpeningsBalans(result.openingsBalans)
          setMutatiesOpDatum(result.mutatiesOpDatum)
          setBalansOpDatum(result.balansOpDatum)
          setResultaatOpDatum(result.resultaatOpDatum)
        } else {
          console.error("Failed to fetch data", response.status);
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, getIDToken]);


  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  return (
    <>
      {balansOpDatum !== undefined &&
        <>
          <Typography variant='h4'>Hoe staan we ervoor?</Typography>
          <Typography sx={{my: 2 }}>Deze pagina is (nog) heel boekhoudkundig en niet geschikt voor de hulpvrager ...</Typography>
          <FormGroup>
            <FormControlLabel control={
              <Switch
                checked={checked}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />}
              label="Toon opening & mutaties" />
          </FormGroup>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 4, md: 12 }}>
              <Grid size={checked ? { xs: 1, sm: 2, md: 3 } : { xs: 2, sm: 4, md: 6 }}>
                <Resultaat title={'Inkomsten en uitgaven'} saldi={resultaatOpDatum!} />
              </Grid>
              {checked &&
                <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                  <Resultaat title={'Opening'} saldi={openingsBalans!} />
                </Grid>}
              {checked &&
                <Grid size={{ xs: 1, sm: 2, md: 3 }}>
                  <Resultaat title={'Mutaties per'} saldi={mutatiesOpDatum!} />
                </Grid>}
              <Grid size={checked ? { xs: 1, sm: 2, md: 3 } : { xs: 2, sm: 4, md: 6 }}>
                <Resultaat title={'Stand'} saldi={balansOpDatum!} />
              </Grid>
            </Grid>
          </Box>
        </>
      }
    </>
  )
}