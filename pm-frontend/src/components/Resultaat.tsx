import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { RekeningSaldi } from '../model/Saldi';
import { Saldo } from '../model/Saldo';

interface SaldiProps {
  title: string;
  saldi: RekeningSaldi;
}

export default function Saldi(props: SaldiProps) {

  const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  });

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
      <TableContainer component={Paper} sx={{ mr: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="left" size='small' sx={{ p: "6px" }}>{props.title}</TableCell>
              <TableCell align="right" size='small' sx={{ p: "6px" }}>{dateFormatter(props.saldi.datum)}</TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="left" size='small' sx={{ p: "6px" }}>Totaal</TableCell>
              <TableCell align="right" size='small' sx={{ p: "6px" }}>{currencyFormatter.format(-calculateResult())}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.saldi.saldi.map((saldo) => (
              <TableRow>
                  <TableCell align="left" size='small' sx={{ p: "6px" }}>{saldo.rekening.naam}</TableCell>
                  <TableCell align="right" size='small' sx={{ p: "6px" }}>{bedragFormatter(saldo)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
