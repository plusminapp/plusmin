import React from 'react';

import { Container, Typography } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";

import { useCustomContext } from '../context/CustomContext';

const Profiel: React.FC = () => {
  const { state } = useAuthContext();

  const { gebruiker, actieveHulpvrager, hulpvragers, rekeningen, betalingsSoorten, betaalMethoden, betalingsSoorten2Rekeningen } = useCustomContext();


  return (
    <Container maxWidth="xl">
      {!state.isAuthenticated &&
        <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
      }
      {state.isAuthenticated &&
        <>
          <Typography variant='h4' sx={{ mb: '25px' }}>Hi {gebruiker?.bijnaam}, hoe is 't?</Typography>
          <Typography sx={{ my: '25px' }}>Je bent ingelogd met email "{state.username}".<br />
            Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen.<br />
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
              "{hulpvragers.map(x => x.bijnaam).join(', ')}".
            </Typography>
          }
          {rekeningen &&
            <>
              <Typography variant='h4' sx={{ my: '25px' }}>
                De huidige actieve hulpvrager is {actieveHulpvrager ? actieveHulpvrager.bijnaam : "nog niet gekozen"}.
              </Typography>
              <Typography sx={{ my: '25px' }}>De rekeningen van {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn:
              </Typography>
              {rekeningen
                .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                .map(r =>
                  <Typography sx={{ my: '3px' }}>{r.rekeningSoort + ': ' + r.naam}
                  </Typography>
                )}
            </>}
          {betalingsSoorten &&
            <>
              <Typography sx={{ my: '25px' }}>
                De betalingsSoorten van {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn:
              </Typography>
              {betalingsSoorten
                .map(b =>
                  <Typography sx={{ my: '3px' }}>{b.toString()}</Typography>
                )}
            </>}
          {betaalMethoden &&
            <>
              <Typography sx={{ my: '25px' }}>
                De betaalMethoden van {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn:
              </Typography>
              {betaalMethoden
                .map(b =>
                  <Typography sx={{ my: '3px' }}>{b.naam}</Typography>
                )}
            </>}
          {betalingsSoorten2Rekeningen &&
            <>
              <Typography sx={{ my: '25px' }}>
                De betalingsSoorten2Rekeningen van {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn:
              </Typography>
                  <Typography sx={{ my: '3px' }}>{JSON.stringify(Array.from(betalingsSoorten2Rekeningen.entries()))}</Typography>
            </>}
        </>
      }
    </Container>
  );
};

export default Profiel;
