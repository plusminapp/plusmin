import React, { Fragment } from 'react';

import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";

import { useCustomContext } from '../context/CustomContext';
import { betalingsSoortFormatter } from '../model/Betaling';
import { formatPeriode } from '../model/Periode';

const Profiel: React.FC = () => {
  const { state } = useAuthContext();

  const { gebruiker, actieveHulpvrager, hulpvragers, rekeningen, betaalMethoden, betalingsSoorten2Rekeningen, periodes, huidigePeriode } = useCustomContext();

  return (
    <Container maxWidth="xl">
      {!state.isAuthenticated &&
        <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
      }
      {state.isAuthenticated && actieveHulpvrager?.id === gebruiker?.id &&
        <>
          <Typography variant='h4' sx={{ mb: '25px' }}>Hi {gebruiker?.bijnaam}, hoe is 't?</Typography>
          <Typography sx={{ my: '25px' }}>Je bent ingelogd met email "{state.username}".<br />
            Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen.<br />
            Je {gebruiker?.roles.length && gebruiker?.roles.length > 1 ? " rollen zijn " : " rol is "}
            "{gebruiker?.roles.map(x => x.split('_')[1].toLowerCase()).join('", "')}".
          </Typography>
          {gebruiker?.roles.includes("ROLE_HULPVRAGER") &&
            <Typography sx={{ my: '25px' }}>Je wordt begeleid door "{gebruiker?.vrijwilligerEmail}".
            </Typography>
          }
          {gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
            <Typography sx={{ my: '25px' }}>Je begeleidt
              {hulpvragers.length === 0 ? " (nog) niemand " : hulpvragers.length > 1 ? " de hulpvragers " : " de hulpvrager "}
              "{hulpvragers.map(x => x.bijnaam).join('", "')}".
            </Typography>
          }
        </>
      }
      <>
        {!rekeningen || rekeningen.length == 0 &&
          <Typography variant='h4' sx={{ my: '25px' }}>
            De huidige actieve hulpvrager {actieveHulpvrager?.bijnaam} heeft geen rekeningen.
          </Typography>
        }
        {rekeningen && rekeningen.length > 0 &&
          <>
            <Typography variant='h4' sx={{ my: '25px' }}>
              De huidige actieve hulpvrager is {actieveHulpvrager ? actieveHulpvrager.bijnaam : "nog niet gekozen"}.<br />
            </Typography>
            <Typography sx={{ my: '25px' }}>
              De huidige periode loopt van {huidigePeriode?.periodeStartDatum?.toString()} tot {huidigePeriode?.periodeEindDatum?.toString()}.<br/>
              De periodes voor {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn: {periodes.map(periode => formatPeriode(periode)).join(', ')}.
            </Typography>
            <Typography sx={{ my: '25px' }}>De rekeningen van {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn:
            </Typography>
            <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
              <Table sx={{ width: "100%" }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Soort rekening</TableCell>
                    <TableCell>Gekozen naam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from(rekeningen.map((rekening) => (
                    <Fragment key={rekening.naam}>
                      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                        <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekening.rekeningSoort}</TableCell>
                        <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekening.naam}</TableCell>
                      </TableRow>
                    </Fragment>
                  )))}
                </TableBody>
              </Table>
            </TableContainer>
          </>}
        {betaalMethoden && betaalMethoden.length > 0 &&
          <>
            <Typography sx={{ my: '25px' }}>
              De betaalMethoden van {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn:
            </Typography>
            {betaalMethoden
              .map(b =>
                <Typography sx={{ my: '3px' }}>{b.naam}</Typography>
              )}
          </>}
        {betalingsSoorten2Rekeningen && (Array.from(betalingsSoorten2Rekeningen.entries())).length > 0 &&
          <>
            <Typography sx={{ my: '25px' }}>
              De betalingsSoorten2Rekeningen van {actieveHulpvrager ? actieveHulpvrager.bijnaam : "jou"} zijn:
            </Typography>
            <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
              <Table sx={{ width: "100%" }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Soort betaling</TableCell>
                    <TableCell>Bron (debet)</TableCell>
                    <TableCell>Bestemming (credit)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from(betalingsSoorten2Rekeningen.entries()).map((entry) => (
                    <Fragment key={entry[0]}>
                      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                        <TableCell align="left" size='small' sx={{ p: "6px" }}>{betalingsSoortFormatter(entry[0])}</TableCell>
                        <TableCell align="left" size='small' sx={{ p: "6px" }}>{entry[1].bron.map(c => c.naam).join(', ')}</TableCell>
                        <TableCell align="left" size='small' sx={{ p: "6px" }}>{entry[1].bestemming.map(c => c.naam).join(', ')}</TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>}
      </>
    </Container >
  );
};

export default Profiel;
