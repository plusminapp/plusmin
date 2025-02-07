import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Periode } from '../model/Periode';
import { Saldo } from '../model/Saldo';
import { currencyFormatter } from '../model/Betaling'

interface PeriodeProps {
  title: string;
  periode: Periode;
}

export default function Saldi(props: PeriodeProps) {

  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }

  const calculateResult = (): number => {
    const saldoLijst: Saldo[] = props.periode.saldoLijst
    return saldoLijst.reduce((acc, saldo) => (acc + saldo.bedrag), 0)
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mr: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="left" size='small' sx={{ p: "6px" }}>{props.title}</TableCell>
              <TableCell align="right" size='small' sx={{ p: "6px" }}>{dateFormatter(props.periode.periodeStartDatum)}</TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="left" size='small' sx={{ p: "6px" }}>Totaal</TableCell>
              <TableCell align="right" size='small' sx={{ p: "6px" }}>{currencyFormatter.format(calculateResult())}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.periode.saldoLijst.map((saldo) => (
              <TableRow>
                  <TableCell align="left" size='small' sx={{ p: "6px" }}>{saldo.rekeningNaam}</TableCell>
                  <TableCell align="right" size='small' sx={{ p: "6px" }}>{currencyFormatter.format(saldo.bedrag)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
