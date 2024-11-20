import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Betaling } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();
  const [betalingen, setBetalingen] = useState<Betaling[]>([])

  const fetchBetalingen = useCallback(async () => {
    const token = await getIDToken();
    const response = await fetch("/api/v1/betalingen", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      setBetalingen(result.data.content);
    } else {
      console.error("Failed to fetch data", response.status);
    }
  }, [getIDToken]);

  useEffect(() => {
    fetchBetalingen();
  }, [fetchBetalingen]);

  return (
    <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <colgroup>
          <col width="15%" />
          <col width="15%" />
          <col width="55%" />
          <col width="15%" />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell>Boekingsdatum</TableCell>
            <TableCell align="right">Bedrag (&euro;)</TableCell>
            {/* <TableCell>Omschrijving bank</TableCell> */}
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
              <TableCell align="right">{betaling["bedrag"]}</TableCell>
              {/* <TableCell align="left">{betaling["omschrijving_bank"]}</TableCell> */}
              <TableCell align="left">{betaling["omschrijving"]}</TableCell>
              <TableCell align="left">{betaling["categorie"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
