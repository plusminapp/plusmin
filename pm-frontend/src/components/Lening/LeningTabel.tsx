import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

import { Lening } from '../../model/Lening';
import { currencyFormatter } from '../../model/Betaling'


interface LeningProps {
  lening: Lening;
}

export default function LeningTabel(props: LeningProps) {

  return (
    <>
      <TableContainer sx={{ mr: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="left" size='small'>Startdatum</TableCell>
              <TableCell align="left" size='small'>Einddatum</TableCell>
              <TableCell align="right" size='small'>Bedrag totaal</TableCell>
              <TableCell align="right" size='small'>Bedrag/maand</TableCell>
              <TableCell align="right" size='small'>Betaaldag</TableCell>
              <TableCell align="left" size='small'>Dossiernummer</TableCell>
              <TableCell align="right" size='small'>Verwachte saldo</TableCell>
              <TableCell align="right" size='small'>Werkelijk saldo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              <TableRow>
                  <TableCell align="left" size='small'>{props.lening.startDatum.toString()}</TableCell>
                  <TableCell align="left" size='small'>{props.lening.eindDatum.toString()}</TableCell>
                  <TableCell align="right" size='small'>{currencyFormatter.format(props.lening.eindBedrag)}</TableCell>
                  <TableCell align="right" size='small'>{currencyFormatter.format(props.lening.aflossingsBedrag)}</TableCell>
                  <TableCell align="right" size='small'>{props.lening.betaalDag}</TableCell>
                  <TableCell align="left" size='small'>{props.lening.dossierNummer}</TableCell>
                  <TableCell align="right" size='small'>{currencyFormatter.format(props.lening.leningSaldiDTO!.berekendSaldo)}</TableCell>
                  <TableCell align="right" size='small'>{currencyFormatter.format(props.lening.leningSaldiDTO!.werkelijkSaldo)}</TableCell>
              </TableRow>
              <TableRow>
                  <TableCell align="left" size='small' colSpan={8}>Notities<br/>{props.lening.notities}</TableCell>
              </TableRow>
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
