import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Transactie } from '../../model/Transactie';
import { useEffect, useState } from 'react';

// function createDate(date: string): Date {
//   return new Date(Date.parse(date))
// }


async function fetchTransacties(): Promise<Transactie[]> {
  const response = await fetch('/api/v1/transacties')
  console.log(response.status)
  const data = await response.json();
  console.log(data);
  return data;
}

export default function TransactieOverzicht() {

  const [transacties, setTransacties] = useState<Transactie[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchTransacties();
        setTransacties(data);
      } catch (error) {
        setError(JSON.stringify(error));
      }
    }
    fetchData();
  }, []);  
  
  if (error) {
    return <div>Error: {error}</div>;
  }  

  return (
    <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Boekingsdatum</TableCell>
            <TableCell>Bedrag</TableCell>
            <TableCell>Omschrijving bank</TableCell>
            <TableCell>Omschrijving</TableCell>
            <TableCell>Categorie</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transacties.map((transactie) => (
            <TableRow
              key={transactie.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="left">{transactie["boekingsdatum"]}</TableCell>
              <TableCell align="right">&euro;&nbsp;{transactie["bedrag"]}</TableCell>
              <TableCell align="left">{transactie["omschrijving_bank"]}</TableCell>
              <TableCell align="left">{transactie["omschrijving"]}</TableCell>
              <TableCell align="left">{transactie["categorie"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
