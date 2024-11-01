// src/pages/Login.tsx
import React from 'react';

import { Container, Button, Typography } from '@mui/material';


import { useAuthContext } from "@asgardeo/auth-react";
// import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { state, signIn, signOut } = useAuthContext();
  // const navigate = useNavigate()
  const handleLogin = () => {
    signIn();
    // navigate('/dashboard');
  };
  const handleLogout = () => {
    signOut();
    // navigate('/dashboard');
  };

  return (
    <Container maxWidth="xl">
      {!state.isAuthenticated &&
        <>
          <Typography variant='h3' sx={{ mb: '25px' }}>Login pagina</Typography>
          <Button variant="contained" onClick={handleLogin}>Login</Button>
        </>
      }
      {state.isAuthenticated &&
        <>
        <Typography variant='h3' sx={{ mb: '25px' }}>Hi {state.username}, hoe is 't?</Typography>
        <Button variant="contained" onClick={handleLogout}>Logout</Button>
      </>
      }
      <p>Current state: {JSON.stringify(state)}</p>
    </Container>
  );
};

export default Login;
