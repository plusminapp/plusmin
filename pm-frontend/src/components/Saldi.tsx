import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Typography } from '@mui/material';
import { RekeningSaldi } from '../model/Saldi';

interface SaldiProps {
  title: string;
  saldi: RekeningSaldi;
}

export default function Saldi(props: SaldiProps) {

  const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }

  return (
    <>
      <Typography>{props.title} {dateFormatter(props.saldi.datum)}</Typography>
      <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {props.saldi.saldi.map((betaling) => (
                <TableCell align="right" size='small' sx={{ p: "6px" }}>{betaling["rekening"].naam}</TableCell>))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {props.saldi.saldi.map((betaling) => (
                <TableCell align="right" size='small' sx={{ p: "6px" }}>{currencyFormatter.format(betaling["bedrag"])}</TableCell>))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
