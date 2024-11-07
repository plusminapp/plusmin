// src/pages/Login.tsx
import React, { useState, useEffect, useCallback } from 'react';

import { Container, Button, Typography, Stack } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";
// import { useNavigate } from 'react-router-dom';

import { Gebruiker } from '../model/Gebruiker';

const Login: React.FC = () => {
  const { state, signIn, signOut, getIDToken } = useAuthContext();

  const [idT, setIdT] = useState<string | null>(null)
  const [gebruiker, setGebruiker] = useState<Gebruiker>()
  const [ss, setSs] = useState<string | null>("")

  const fetchGebruiker = useCallback(async (idT: string) => {
    console.log("in fetchgebruiker " + idT)
    const response = await fetch('/api/v1/gebruiker', {
      headers: {
        "Authorization": `Bearer ${idT}`,
        "Content-Type": "application/json",
      }
    })
    const data = await response.json();
    console.log("In fetchgebruiker " + data);
    setGebruiker(data);
  }, [])

  const handleIdToken = useCallback(async () => {
    console.log("voor in handle token idT: " + idT)
    const idToken = await getIDToken()
    setIdT(idToken)
    console.log("na in handle token idT: " + idT + ' \nidToken:  ' + idToken)
  }, [getIDToken, idT])

  const handlePostSignIn = useCallback(async () => {
    if (state.isAuthenticated) {
      console.log("Gebruiker authenticated " + idT);
      await handleIdToken();
      console.log("na handleToken " + idT);
      if (idT) { await fetchGebruiker(idT); }
      console.log("na afloop " + idT);
    }
  }, [fetchGebruiker, handleIdToken, idT, state.isAuthenticated]);

  const readSessionStorage = () => {
    const raw = window.sessionStorage.getItem("id_token")
    console.log("ss "+ raw)
    setSs(raw)
  }

  useEffect(() => {
    handlePostSignIn();
  }, [handlePostSignIn]);

  return (
    <Container maxWidth="xl">
      {!state.isAuthenticated &&
        <>
          <Typography variant='h3' sx={{ mb: '25px' }}>Login pagina</Typography>
          <Button variant="contained" onClick={() => signIn()}>Login</Button>
        </>
      }
      {state.isAuthenticated &&
        <>
          <Typography variant='h3' sx={{ mb: '25px' }}>Hi {gebruiker?.bijnaam}, hoe is 't?</Typography>
          <Stack spacing={2} direction="row">
            <Button variant="contained" onClick={() => signOut()}>Logout</Button>
            <Button variant="contained" onClick={handleIdToken}>IdToken</Button>
            <Button variant="contained" onClick={() => { if (idT) fetchGebruiker(idT) }}>Gebruiker</Button>
            <Button variant="contained" onClick={() => { handlePostSignIn() }}>idToken + Gebrbruiker</Button>
            <Button variant="contained" onClick={() => { readSessionStorage() }}>sessionStorage</Button>
          </Stack >
        </>
      }
      <Typography sx={{ my: '25px' }}>Current state: {JSON.stringify(state)}</Typography>
      <Typography sx={{ my: '25px' }}>Current idToken: {JSON.stringify(idT)}</Typography>
      <Typography sx={{ my: '25px' }}>Current gebruker: {JSON.stringify(gebruiker)}</Typography>
      <Typography sx={{ my: '25px' }}>Session storage id_token: {JSON.stringify(ss)}</Typography>
    </Container>
  );
};

export default Login;
