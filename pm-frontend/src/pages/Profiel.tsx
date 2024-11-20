import React, { useState, useEffect, useCallback } from 'react';

import { Container, Typography } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";

import { Gebruiker } from '../model/Gebruiker';

const Profiel: React.FC = () => {
  const { state, getIDToken } = useAuthContext();

  const [gebruiker, setGebruiker] = useState<Gebruiker>()
  const [hulpvragers, setHulpvragers] = useState<Gebruiker[]>([])

  const fetchGebruiker = useCallback(async () => {
    const token = await getIDToken();
    const response = await fetch('/api/v1/gebruiker/jwt', {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
    const data = await response.json();
    setGebruiker(data);
  }, [state.isAuthenticated])

  useEffect(() => {
    fetchGebruiker();
  }, [fetchGebruiker]);

  const fetchHulpvragers = useCallback(async () => {
    if (gebruiker?.roles.includes("ROLE_VRIJWILLIGER")) {
      const token = await getIDToken();
      const response = await fetch('/api/v1/gebruiker/hulpvrager', {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
      const data = await response.json();
      setHulpvragers(data);
    }
  }, [gebruiker])

  useEffect(() => {
    fetchHulpvragers();
  }, [fetchHulpvragers]);

  return (
    <Container maxWidth="xl">
      {!state.isAuthenticated &&
        <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
      }
      {state.isAuthenticated &&
        <>
          <Typography variant='h4' sx={{ mb: '25px' }}>Hi {gebruiker?.bijnaam}, hoe is 't?</Typography>
          <Typography sx={{ my: '25px' }}>Je bent ingelogd met email "{state.username}".
            Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen. Je
            {gebruiker?.roles.length && gebruiker?.roles.length > 1 ? " rollen zijn " : " rol is "}
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
        </>
      }
    </Container>
  );
};

export default Profiel;
