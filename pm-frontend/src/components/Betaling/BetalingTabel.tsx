import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BetalingDTO, BetalingsSoort } from '../../model/Betaling';
import dayjs from 'dayjs';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening } from '../../model/Rekening';
import { Budget } from '../../model/Budget';

type BetalingTabelProps = {
  betalingen: BetalingDTO[];
};

const BetalingTabel: React.FC<BetalingTabelProps> = ({ betalingen }) => {
  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });

  const { rekeningen } = useCustomContext();

  const getFormattedBedrag = (betaling: BetalingDTO) => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente
      ? betaling.bedrag
      : -betaling.bedrag;
    return formatter.format(bedrag);
  };

  const bestemmingen = Array.from(new Set(betalingen
    .filter(betaling => betaling.betalingsSoort === BetalingsSoort.uitgaven)
    .map(betaling => betaling.bestemming)
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
    } else if (betaling.betalingsSoort === BetalingsSoort.uitgaven && betaling.bestemming) {
      totalen.bestemmingen[betaling.bestemming] += bedrag;
    } else if (betaling.betalingsSoort === BetalingsSoort.aflossen) {
      totalen.aflossing += bedrag;
    }
  });

  const berekenBudgetBedrag = (budget: Budget): number => {
    console.log(`budget: ${budget.budgetNaam} met ${budget.budgetPeriodiciteit}`)
    if (budget.budgetPeriodiciteit.toLowerCase() === 'maand') {
      console.log(`maand budget: ${budget.budgetNaam} met ${budget.budgetPeriodiciteit}`)
      return budget.bedrag;
    } else {
      console.log(`week budget: ${budget.budgetNaam} met ${budget.budgetPeriodiciteit}`)
      const daysGoneBy = dayjs().diff(dayjs().startOf('month'), 'day') + 1;
      return budget.bedrag * daysGoneBy / 7;
    }
  };
  
  const budgetten = rekeningen.reduce((acc: { [x: string]: number; }, rekening: Rekening) => {
    acc[rekening.naam] = rekening.budgetten.reduce((acc, budget) => acc + berekenBudgetBedrag(budget), 0);
    return acc;
  }, {} as Record<string, number>);


  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: '5px' }}>Datum</TableCell>
            <TableCell sx={{ padding: '5px' }}>Omschrijving</TableCell>
            <TableCell sx={{ padding: '5px' }}>Budget</TableCell>
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
                <TableCell sx={{ padding: '5px' }}>{betaling.budgetNaam ? betaling.budgetNaam : ''}</TableCell>
                <TableCell sx={{ padding: '5px' }} align="right">{isInkomsten ? getFormattedBedrag(betaling) : ''}</TableCell>
                {bestemmingen.map(bestemming => (
                  <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                    {isUitgaven && betaling.bestemming === bestemming ? getFormattedBedrag(betaling) : ''}
                  </TableCell>
                ))}
                <TableCell sx={{ padding: '5px' }} align="right">{isAflossing ? getFormattedBedrag(betaling) : ''}</TableCell>
              </TableRow>
            );
          })}
          <TableRow sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey' }}>
            <TableCell sx={{ padding: '5px' }}></TableCell>
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }}>Totalen</TableCell>
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} />
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.inkomsten)}</TableCell>
            {bestemmingen.map(bestemming => (
              <TableCell key={bestemming} sx={{ padding: '5px', fontWeight: 'bold' }} align="right">
                {formatter.format(totalen.bestemmingen[bestemming])}
              </TableCell>
            ))}
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.aflossing)}</TableCell>
          </TableRow>
          <TableRow sx={{ borderBottom: '1px' }}>
            <TableCell sx={{ padding: '5px' }}></TableCell>
            <TableCell sx={{ padding: '5px' }}>Budgetten</TableCell>
            <TableCell sx={{ padding: '5px' }} />
            <TableCell sx={{ padding: '5px' }} align="right" />
            {bestemmingen.map(bestemming => (
              <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                {budgetten[bestemming] != 0 ? formatter.format(budgetten[bestemming]) : ''}
              </TableCell>
            ))}
            <TableCell sx={{ padding: '5px' }} align="right" />
          </TableRow>
          <TableRow sx={{ borderBottom: '1px' }}>
            <TableCell sx={{ padding: '5px' }}></TableCell>
            <TableCell sx={{ padding: '5px' }}>Overschot/tekort</TableCell>
            <TableCell sx={{ padding: '5px' }} />
            <TableCell sx={{ padding: '5px' }} align="right" />
            {bestemmingen.map(bestemming => (
              <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                {budgetten[bestemming] != 0 ? formatter.format(budgetten[bestemming]) : ''}
              </TableCell>
            ))}
            <TableCell sx={{ padding: '5px' }} align="right" />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BetalingTabel;