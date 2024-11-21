import { Container, Typography } from "@mui/material";
import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";

export default function Stand() {
  const { gebruiker, hulpvragers } = useCustomContext();
  const { state } = useAuthContext();


  return (
    <>
      <Typography variant='h4'>Deze 'Stand van zaken' pagina is door jou te zien omdat je bent ingelogd</Typography>

      <Container maxWidth="xl">
        {!state.isAuthenticated &&
          <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
        }
        {state.isAuthenticated &&
          <>
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
                "{hulpvragers.map(x => x.bijnaam + ' (' + x.pseudoniem + ')').join(', ')}".
              </Typography>
            }
          </>
        }
      </Container>
    </>
  )
}