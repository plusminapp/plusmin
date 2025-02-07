import { useNavigate } from 'react-router-dom';

import { useAuthContext } from "@asgardeo/auth-react";
import { Typography } from "@mui/material";

export default function LoginPagina() {

  const { state } = useAuthContext();
  const navigate = useNavigate();

  if (state.isAuthenticated) {
    navigate('/');
  } else {
    return (
      <Typography variant='h4'>Je moet inloggen om de app te kunnen gebruiken.</Typography>
    )
  }
}