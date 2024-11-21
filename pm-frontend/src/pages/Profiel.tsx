import React from 'react';

import { Container, Typography } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";

import { useCustomContext } from '../context/CustomContext';

const Profiel: React.FC = () => {
  const { state } = useAuthContext();
  
  const { gebruiker, actieveHulpvrager, hulpvragers } = useCustomContext();


  return (
    <Container maxWidth="xl">
      {!state.isAuthenticated &&
        <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
      }
      {state.isAuthenticated &&
        <>
          <Typography variant='h4' sx={{ mb: '25px' }}>Hi {gebruiker?.bijnaam}, hoe is 't?</Typography>
          <Typography sx={{ my: '25px' }}>Je bent ingelogd met email "{state.username}".<br/>
            Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen.<br/> 
            Je {gebruiker?.roles.length && gebruiker?.roles.length > 1 ? " rollen zijn " : " rol is "}
            {gebruiker?.roles.map(x => x.split('_')[1].toLowerCase()).join(', ')}.
          </Typography>
          {gebruiker?.roles.includes("ROLE_HULPVRAGER") &&
            <Typography sx={{ my: '25px' }}>Je wordt begeleid door "{gebruiker?.vrijwilligerbijnaam}".
            </Typography>
          }
          {gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
            <Typography sx={{ my: '25px' }}>Je begeleidt
            {hulpvragers.length === 0 ? " (nog) niemand " : hulpvragers.length > 1 ? " de hulpvragers " : " de hulpvrager "}
            "{hulpvragers.map(x => x.bijnaam+' ('+x.pseudoniem+')').join(', ')}".
            <br/>
            De huidige actieve hulpvrager is {actieveHulpvrager ? actieveHulpvrager.pseudoniem : "nog niet gekozen"}.
          
          </Typography>
      }
        </>
      }
    </Container>
  );
};

export default Profiel;
