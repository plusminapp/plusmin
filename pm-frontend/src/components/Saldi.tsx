import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Typography } from '@mui/material';
import { RekeningSaldi } from '../model/Saldi';
import { Saldo } from '../model/Saldo';
import { currencyFormatter } from '../model/Betaling'


interface SaldiProps {
  title: string;
  saldi: RekeningSaldi;
}

export default function Saldi(props: SaldiProps) {

  const bedragFormatter = (saldo: Saldo) => {
    if (saldo.rekening.rekeningSoort === 'INKOMSTEN') {
      return currencyFormatter.format(-saldo.bedrag)
      } else {
      return currencyFormatter.format(saldo.bedrag)
    }
  }
  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }

  const calculateResult = (): string => {
    const saldi: Saldo[] = props.saldi.saldi
    console.log(saldi)
    const blaat: number = saldi.reduce((acc, saldo) => (acc + saldo.bedrag), 0)
    console.log(blaat)
    return blaat.toString()
  }

  return (
    <>
      <Typography>{props.title} {dateFormatter(props.saldi.datum)} Resultaat: {calculateResult()}</Typography>
      <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {props.saldi.saldi.map((saldo) => (
                <TableCell align="right" size='small' sx={{ p: "6px" }}>{saldo["rekening"].naam}</TableCell>))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {props.saldi.saldi.map((saldo) => (
                <TableCell align="right" size='small' sx={{ p: "6px" }}>{bedragFormatter(saldo)}</TableCell>))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
