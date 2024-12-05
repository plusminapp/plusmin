import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Typography } from '@mui/material';
import { useCustomContext } from '../context/CustomContext';
import { Saldo } from '../model/Saldo';

interface SaldiProps {
  title: string;
  datum: string;
}

export default function Saldi(props: SaldiProps) {
  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager } = useCustomContext();

  const [saldi, setSaldi] = useState<Saldo[]>([])
  const [isLoading, setIsLoading] = useState(false);

  const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  });

  const fetchSaldi = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const token = await getIDToken();
      const response = await fetch(`/api/v1/saldi/${props.datum}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setSaldi(result.saldi.sort((a: Saldo, b: Saldo) => a.rekening > b.rekening ));
      } else {
        console.error("Failed to fetch data", response.status);
      }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker]);

  useEffect(() => {
    fetchSaldi();
  }, [fetchSaldi]);

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  }

  // const balans = ["betaalrekening", "spaarrekening", "contant geld", "creditcad", "betaalregeling1", "betaalregeling2", "reserveringen"]
  // const resultaat = ["inkomsten", "boodschappen", "vaste lasten", "andere uitgaven"]

  return (
    <>
      {!isLoading && saldi &&
        <>
          <Typography>{props.title}</Typography>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', my: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {saldi.map((betaling) => (
                    <TableCell align="right" size='small' sx={{ p: "6px" }}>{betaling["rekening"]}</TableCell>))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {saldi.map((betaling) => (
                    <TableCell align="right" size='small' sx={{ p: "6px" }}>{currencyFormatter.format(betaling["bedrag"])}</TableCell>))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer >
        </>
      }
    </>
  );
}
