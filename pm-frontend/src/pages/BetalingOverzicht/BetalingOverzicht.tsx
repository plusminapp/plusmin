import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useFetchClient } from '../../api/fetchClient';
import { Betaling } from '../../model/Betaling';
import { useCallback, useEffect, useState } from 'react';

// function createDate(date: string): Date {
//   return new Date(Date.parse(date))
// }

export default function BetalingOverzicht() {
  const fetcWithAuth = useFetchClient();

  const fetchBetalingen  = useCallback(async () => {
    const response = await fetcWithAuth('/api/v1/betalingen')
    console.log(response.status)
    const data = await response.json();
    console.log(data);
    return data;
  }, [fetcWithAuth])

  const [betalingen, setBetalingen] = useState<Betaling[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchBetalingen();
        setBetalingen(data);
      } catch (error) {
        setError(JSON.stringify(error));
      }
    }
    fetchData();
  });

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
          {betalingen.map((betaling) => (
            <TableRow
              key={betaling.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="left">{betaling["boekingsdatum"]}</TableCell>
              <TableCell align="right">&euro;&nbsp;{betaling["bedrag"]}</TableCell>
              <TableCell align="left">{betaling["omschrijving_bank"]}</TableCell>
              <TableCell align="left">{betaling["omschrijving"]}</TableCell>
              <TableCell align="left">{betaling["categorie"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
