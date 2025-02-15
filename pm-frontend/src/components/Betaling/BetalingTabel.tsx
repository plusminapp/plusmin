import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { BetalingDTO, BetalingsSoort } from '../../model/Betaling';
import dayjs from 'dayjs';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening } from '../../model/Rekening';
import { Budget } from '../../model/Budget';
import { PlusIcon } from '../../icons/Plus';
import { Min } from '../../icons/Min';
import { ExternalLinkIcon } from '../../icons/ExternalLink';

type BetalingTabelProps = {
  betalingen: BetalingDTO[];
  aflossingsBedrag: number;
};

const BetalingTabel: React.FC<BetalingTabelProps> = ({ betalingen, aflossingsBedrag }) => {
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

  const bestemmingSortOrderMap = rekeningen.reduce((acc, rekening) => {
    acc[rekening.naam] = rekening.sortOrder;
    return acc;
  }, {} as Record<string, number>);

  const bestemmingen = Array.from(new Set(betalingen
    .filter(betaling => betaling.betalingsSoort === BetalingsSoort.uitgaven)
    .sort((a, b) => (bestemmingSortOrderMap[a.bestemming!!] || 0) - (bestemmingSortOrderMap[b.bestemming!!] || 0))
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
    if (budget.budgetPeriodiciteit.toLowerCase() === 'maand') {
      return budget.bedrag;
    } else {
      const daysGoneBy = dayjs().diff(dayjs().startOf('month'), 'day') + 1;
      return budget.bedrag * daysGoneBy / 7;
    }
  };

  const budgetten = rekeningen.reduce((acc: { [x: string]: number; }, rekening: Rekening) => {
    acc[rekening.naam] = rekening.budgetten.reduce((acc, budget) => acc + berekenBudgetBedrag(budget), 0)
    acc["aflossing"] = aflossingsBedrag;
    return acc;

  }, {} as Record<string, number>);

  const heeftAflossing = aflossingsBedrag > 0;
  const heeftBudgetten = Object.values(budgetten).some(bedrag => bedrag > 0);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: '5px' }}>Datum</TableCell>
            <TableCell sx={{ padding: '5px' }}>Omschrijving</TableCell>
            {heeftBudgetten &&
              <TableCell sx={{ padding: '5px' }}>Budget</TableCell>}
            <TableCell sx={{ padding: '5px' }} align="right">Inkomsten</TableCell>
            {bestemmingen.map(bestemming => (
              <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">{bestemming}</TableCell>
            ))}
            {heeftAflossing &&
              <TableCell sx={{ padding: '5px' }} align="right">Aflossing</TableCell>
            }
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
                {heeftBudgetten &&
                  <TableCell sx={{ padding: '5px' }}>{betaling.budgetNaam ? betaling.budgetNaam : ''}</TableCell>}
                <TableCell sx={{ padding: '5px' }} align="right">{isInkomsten ? getFormattedBedrag(betaling) : ''}</TableCell>
                {bestemmingen.map(bestemming => (
                  <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                    {isUitgaven && betaling.bestemming === bestemming ? getFormattedBedrag(betaling) : ''}
                  </TableCell>
                ))}
                {heeftAflossing &&
                  <TableCell sx={{ padding: '5px' }} align="right">{isAflossing ? getFormattedBedrag(betaling) : ''}</TableCell>}
              </TableRow>
            );
          })}
          <TableRow sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey' }}>
            <TableCell sx={{ padding: '5px' }}></TableCell>
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }}>Totalen</TableCell>
            {(heeftAflossing || heeftBudgetten) &&
              <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} />}
            <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.inkomsten)}</TableCell>
            {bestemmingen.map(bestemming => (
              <TableCell key={bestemming} sx={{ padding: '5px', fontWeight: 'bold' }} align="right">
                {formatter.format(totalen.bestemmingen[bestemming])}
              </TableCell>
            ))}
            {heeftAflossing &&
              <TableCell sx={{ padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.aflossing)}</TableCell>}
          </TableRow>
          {(heeftBudgetten || heeftAflossing) &&
            <>
              <TableRow sx={{ borderBottom: '1px' }}>
                <TableCell sx={{ padding: '5px' }}></TableCell>
                {heeftBudgetten &&
                  <TableCell sx={{ padding: '5px' }}>Budgetten</TableCell>}
                {!heeftBudgetten && heeftAflossing &&
                  <TableCell sx={{ padding: '5px' }}>Aflossing</TableCell>}
                <TableCell sx={{ padding: '5px' }} />
                <TableCell sx={{ padding: '5px' }} align="right" />
                {bestemmingen.map(bestemming => (
                  <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                    {budgetten[bestemming] != 0 ? formatter.format(budgetten[bestemming]) : ''}
                  </TableCell>
                ))}
                <TableCell sx={{ padding: '5px' }} align="right" >
                  {budgetten["aflossing"] != 0 ? formatter.format(budgetten["aflossing"]) : ''}
                </TableCell>
              </TableRow>
              <TableRow sx={{ borderBottom: '1px' }}>
                <TableCell sx={{ padding: '5px' }}></TableCell>
                <TableCell sx={{ padding: '5px' }}>Overschot/tekort</TableCell>
                <TableCell sx={{ padding: '5px' }} />
                <TableCell sx={{ padding: '5px' }} align="right" />
                {bestemmingen.map(bestemming => (
                  <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        {budgetten[bestemming] != 0 && <PlusIcon color={'green'} height={15} />}
                      </Box>
                      &nbsp;
                      {budgetten[bestemming] != 0 ? formatter.format(budgetten[bestemming] + totalen.bestemmingen[bestemming]) : ''}
                    </Box>
                  </TableCell>
                ))}
                {heeftAflossing &&
                  <TableCell sx={{ padding: '5px' }} align="right" >
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <Link component={RouterLink} to="/schuld-aflossingen" display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                        <Min height={15} color='orange' />
                        <ExternalLinkIcon />
                      </Link>
                      &nbsp;
                      {budgetten["aflossing"] != 0 ? formatter.format(budgetten["aflossing"] + totalen.aflossing) : ''}
                    </Box>
                  </TableCell>}
              </TableRow>
            </>
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BetalingTabel;