import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Betaling, BetalingsSoort } from '../../model/Betaling';
import dayjs from 'dayjs';

type BetalingTabelProps = {
  betalingen: Betaling[];
};

const BetalingTabel: React.FC<BetalingTabelProps> = ({ betalingen }) => {
  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });

  const getFormattedBedrag = (betaling: Betaling) => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente
      ? betaling.bedrag
      : -betaling.bedrag;
    return formatter.format(bedrag);
  };

  const bestemmingen = Array.from(new Set(betalingen
    .filter(betaling => betaling.betalingsSoort === BetalingsSoort.uitgaven)
    .map(betaling => betaling.bestemming?.naam)
    .filter(naam => naam !== undefined))) as string[];

  const totalen = {
    inkomsten: 0,
    aflossing: 0,
    bestemmingen: bestemmingen.reduce((acc, bestemming) => {
      acc[bestemming] = 0;
      return acc;
    }, {} as Record<string, number>)
  };

  betalingen.forEach(betaling => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente
      ? betaling.bedrag
      : -betaling.bedrag;

    if (betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente) {
      totalen.inkomsten += bedrag;
    } else if (betaling.betalingsSoort === BetalingsSoort.uitgaven && betaling.bestemming?.naam) {
      totalen.bestemmingen[betaling.bestemming.naam] += bedrag;
    } else if (betaling.betalingsSoort === BetalingsSoort.aflossen) {
      totalen.aflossing += bedrag;
    }
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: '5px' }}>Datum</TableCell>
            <TableCell sx={{ padding: '5px' }}>Omschrijving</TableCell>
            <TableCell sx={{ padding: '5px' }} align="right">Inkomsten</TableCell>
            {bestemmingen.map(bestemming => (
              <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">{bestemming}</TableCell>
            ))}
            <TableCell sx={{ padding: '5px' }} align="right">Aflossing</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {betalingen.map((betaling) => {
            const isInkomsten = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente;
            const isUitgaven = betaling.betalingsSoort === BetalingsSoort.uitgaven;
            const isAflossing = betaling.betalingsSoort === BetalingsSoort.aflossen;

            if (!isInkomsten && !isUitgaven && !isAflossing) return null;

            return (
              <TableRow key={betaling.id}>
                <TableCell sx={{ padding: '5px' }}>{dayjs(betaling.boekingsdatum).format('YYYY-MM-DD')}</TableCell>
                <TableCell sx={{ padding: '5px' }}>{betaling.omschrijving}</TableCell>
                <TableCell sx={{ padding: '5px' }} align="right">{isInkomsten ? getFormattedBedrag(betaling) : ''}</TableCell>
                {bestemmingen.map(bestemming => (
                  <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                    {isUitgaven && betaling.bestemming?.naam === bestemming ? getFormattedBedrag(betaling) : ''}
                  </TableCell>
                ))}
                <TableCell sx={{ padding: '5px' }} align="right">{isAflossing ? getFormattedBedrag(betaling) : ''}</TableCell>
              </TableRow>
            );
          })}
          <TableRow sx={{ borderTop: '2px solid grey' }}>
            <TableCell sx={{ padding: '5px' }}></TableCell>
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }}>Totalen</TableCell>
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.inkomsten)}</TableCell>
            {bestemmingen.map(bestemming => (
              <TableCell key={bestemming} sx={{ padding: '5px', fontWeight: 'bold' }} align="right">
                {formatter.format(totalen.bestemmingen[bestemming])}
              </TableCell>
            ))}
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.aflossing)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BetalingTabel;