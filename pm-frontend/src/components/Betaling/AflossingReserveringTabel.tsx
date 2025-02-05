import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { aflossenBetalingsSoorten, Betaling, BetalingsSoort, reserverenBetalingsSoorten } from '../../model/Betaling';
import {  Fragment } from 'react';

import { useCustomContext } from '../../context/CustomContext';
import { currencyFormatter } from '../../model/Betaling'
import { Typography } from '@mui/material';

interface AflossingReserveringTabelProps {
  betalingen: Betaling[];
  isAflossing: boolean;
}

export default function AflossingReserveringTabel(props: AflossingReserveringTabelProps) {

  const { actieveHulpvrager, gebruiker } = useCustomContext();
  const betalingsSoorten = props.isAflossing ? aflossenBetalingsSoorten : reserverenBetalingsSoorten
  const betalingen = props.betalingen.filter(betaling => betalingsSoorten.includes(betaling.betalingsSoort))

  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }

  return (
    <>
      {betalingen.length === 0 &&
        <Typography sx={{ mx: '25px', fontSize: '12px' }}>{actieveHulpvrager?.id !== gebruiker?.id ? `${actieveHulpvrager!.bijnaam} heeft` : "Je hebt"} nog geen betalingen geregistreerd.</Typography>
      }
      {betalingen.length > 0 &&
        <>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell align="right">Bedrag</TableCell>
                  <TableCell>Omschrijving</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{props.isAflossing ? 'Betaalmethode' : 'Reservering/betaalmethode'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {betalingen.map((betaling) => (
                  <Fragment key={betaling.id}>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      aria-haspopup="true"
                    >
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{dateFormatter(betaling["boekingsdatum"]?.toString())}</TableCell>
                      <TableCell align="right" size='small' sx={{ p: "6px" }}>
                        {betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ? currencyFormatter.format(betaling.bedrag) : currencyFormatter.format(-betaling.bedrag)}
                        </TableCell>
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{betaling["omschrijving"]}</TableCell>
                      <TableCell align="left" size='small' sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {betaling["betalingsSoort"] === 'BESTEDEN_RESERVERING' ? `${betaling.bestemming?.naam} met ${betaling.bron?.naam} `: betaling["bron"]?.naam}
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>}
    </>
  );
}
