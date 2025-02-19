import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Link, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { BetalingDTO, BetalingsSoort } from '../../model/Betaling';
import dayjs from 'dayjs';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening, RekeningSoort } from '../../model/Rekening';
import { Budget } from '../../model/Budget';
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';
import { ExternalLinkIcon } from '../../icons/ExternalLink';
import EditIcon from '@mui/icons-material/Edit';
import { dagenSindsStartPeriode, isPeriodeOpen } from '../../model/Periode';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';

type BetalingTabelProps = {
  betalingen: BetalingDTO[];
  aflossingsBedrag: number;
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
};

const BetalingTabel: React.FC<BetalingTabelProps> = ({ betalingen, aflossingsBedrag, onBetalingBewaardChange, onBetalingVerwijderdChange }) => {
  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });

  const { rekeningen, gekozenPeriode } = useCustomContext();

  const [selectedBetaling, setSelectedBetaling] = useState<BetalingDTO | undefined>(undefined);

  const handleEditClick = (betaling: BetalingDTO) => {
    setSelectedBetaling(betaling);
  };


  const getFormattedBedrag = (betaling: BetalingDTO) => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente
      ? betaling.bedrag
      : -betaling.bedrag;
    return formatter.format(bedrag);
  };

  const bestemmingen = rekeningen.filter(r => r.rekeningSoort === RekeningSoort.uitgaven).map(r => r.naam);

  const totalen = {
    inkomsten: 0,
    aflossing: 0,
    bestemmingen: rekeningen.reduce((acc, rekening) => {
      acc[rekening.naam] = 0;
      return acc;
    }, {} as Record<string, number>)
  };

  betalingen.forEach(betaling => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente
      ? betaling.bedrag
      : -betaling.bedrag;

    if (betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente) {
      totalen.inkomsten += Number(bedrag);
    } else if (betaling.betalingsSoort === BetalingsSoort.uitgaven && betaling.bestemming) {
      totalen.bestemmingen[betaling.bestemming] += Number(bedrag);
    } else if (betaling.betalingsSoort === BetalingsSoort.aflossen) {
      totalen.aflossing += bedrag;
    }
  });

  const berekenBudgetBedrag = (budget: Budget): number => {
    if (budget.budgetPeriodiciteit.toLowerCase() === 'maand') {
      return budget.bedrag;
    } else {
      const dagen = dagenSindsStartPeriode(gekozenPeriode);
      return dagen !== undefined ? budget.bedrag * dagen / 7 : 0;
    }
  };

  const budgetten = rekeningen.reduce((acc: { [x: string]: number; }, rekening: Rekening) => {
    acc[rekening.naam] = rekening.budgetten.reduce((acc, budget) => acc + berekenBudgetBedrag(budget), 0)
    acc["aflossing"] = aflossingsBedrag;
    return acc;
  }, {} as Record<string, number>);

  const heeftAflossing = aflossingsBedrag > 0;
  const heeftBudgetten = Object.values(budgetten).some(bedrag => bedrag > 0);
  const isInkomsten = (betaling: BetalingDTO) => betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente;
  const isUitgaven = (betaling: BetalingDTO) => betaling.betalingsSoort === BetalingsSoort.uitgaven;
  const isAflossing = (betaling: BetalingDTO) => betaling.betalingsSoort === BetalingsSoort.aflossen;

  const berekenBudgetStatusIcoon = (verwachtHoog: number, verwachtLaag: number) => {
    if (Number(verwachtHoog) < Number(verwachtLaag)) {
      return <MinIcon color={'red'} height={15} />;
    } else {
      return <PlusIcon color={'green'} height={15} />;
    }
  };

  const afgerondOp2Decimalen = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const onUpsertBetalingClose = () => {
    setSelectedBetaling(undefined);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ padding: '5px' }}>Datum</TableCell>
              <TableCell sx={{ padding: '5px' }}>Omschrijving</TableCell>
              {heeftBudgetten &&
                <TableCell sx={{ padding: '5px' }}>Budget</TableCell>}
              <TableCell sx={{ padding: '5px' }} align="right">Inkomsten</TableCell>
              {rekeningen.filter(r => r.rekeningSoort === RekeningSoort.uitgaven).map(uitgaveRekening => (
                <TableCell key={uitgaveRekening.naam} sx={{ padding: '5px' }} align="right">{uitgaveRekening.naam}</TableCell>
              ))}
              {heeftAflossing &&
                <TableCell sx={{ padding: '5px' }} align="right">Aflossing</TableCell>
              }
              {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                <TableCell sx={{ padding: '5px' }} align="right" />
              }
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {betalingen.map((betaling) => (isInkomsten(betaling) || isUitgaven(betaling) || isAflossing(betaling)) &&
                <TableRow key={betaling.id}>
                  <TableCell sx={{ padding: '5px' }}>{dayjs(betaling.boekingsdatum).format('YYYY-MM-DD')}</TableCell>
                  <TableCell sx={{ padding: '5px' }}>{betaling.omschrijving}</TableCell>
                  {heeftBudgetten &&
                    <TableCell sx={{ padding: '5px' }}>{betaling.budgetNaam ? betaling.budgetNaam : ''}</TableCell>}
                  <TableCell sx={{ padding: '5px' }} align="right">{isInkomsten(betaling) ? getFormattedBedrag(betaling) : ''}</TableCell>
                  {bestemmingen.map(bestemming => (
                    <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                      {isUitgaven(betaling) && betaling.bestemming === bestemming ? getFormattedBedrag(betaling) : ''}
                    </TableCell>
                  ))}
                  {heeftAflossing &&
                    <TableCell sx={{ padding: '5px' }} align="right">{isAflossing(betaling) ? getFormattedBedrag(betaling) : ''}</TableCell>}
                  {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                    <TableCell size='small' sx={{ p: "5px" }}>
                      <Button onClick={() => handleEditClick(betaling)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                        <EditIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  }
                </TableRow>
              )}
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
                {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                  <TableCell sx={{ padding: '5px' }} align="right" />
                }
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
                  <TableCell sx={{ padding: '5px' }} align="right" >
                    {budgetten['Inkomsten'] != 0 ? formatter.format(budgetten['Inkomsten']) : ''}
                  </TableCell>
                  {bestemmingen.map(bestemming => (
                    <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                      {budgetten[bestemming] != 0 ? formatter.format(budgetten[bestemming]) : ''}
                    </TableCell>
                  ))}
                  <TableCell sx={{ padding: '5px' }} align="right" >
                    {budgetten["aflossing"] != 0 ? formatter.format(budgetten["aflossing"]) : ''}
                  </TableCell>
                  {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                    <TableCell sx={{ padding: '5px' }} align="right" />
                  }
                </TableRow>
                <TableRow sx={{ borderBottom: '1px' }}>
                  <TableCell sx={{ padding: '5px' }}></TableCell>
                  <TableCell sx={{ padding: '5px' }}>Overschot/tekort</TableCell>
                  <TableCell sx={{ padding: '5px' }} />
                  <TableCell key={'Inkomsten'} sx={{ padding: '5px' }} align="right">
                    {budgetten['Inkomsten'] != 0 &&
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          {berekenBudgetStatusIcoon(totalen['inkomsten'], budgetten['Inkomsten'])}
                        </Box>
                        &nbsp;
                        {formatter.format(totalen['inkomsten'] - budgetten['Inkomsten'])}
                      </Box>}
                  </TableCell>
                  {bestemmingen.map(bestemming => (
                    <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                      {budgetten[bestemming] != 0 &&
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            {berekenBudgetStatusIcoon(budgetten[bestemming], afgerondOp2Decimalen(-totalen.bestemmingen[bestemming]))}
                          </Box>
                          &nbsp;
                          {formatter.format(afgerondOp2Decimalen(budgetten[bestemming] + totalen.bestemmingen[bestemming]))}
                        </Box>}
                    </TableCell>
                  ))}
                  {heeftAflossing &&
                    <TableCell sx={{ padding: '5px' }} align="right" >
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <Link component={RouterLink} to="/schuld-aflossingen" display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                          {budgetten["aflossing"] + totalen.aflossing === 0 && <PlusIcon height={15} color='green' />}
                          {budgetten["aflossing"] + totalen.aflossing !== 0 && <MinIcon height={15} color='orange' />}
                          <ExternalLinkIcon />
                        </Link>
                        &nbsp;
                        {budgetten["aflossing"] != 0 ? formatter.format(budgetten["aflossing"] + totalen.aflossing) : ''}
                      </Box>
                    </TableCell>}
                </TableRow>
              </>}
            </>
          </TableBody>
        </Table>
      </TableContainer>
      {selectedBetaling &&
        <UpsertBetalingDialoog
          onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
          onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)}
          onUpsertBetalingClose={onUpsertBetalingClose}
          editMode={true}
          betaling={{ ...selectedBetaling, bron: selectedBetaling.bron, bestemming: selectedBetaling.bestemming }}
        />
      }
    </>
  );
};

export default BetalingTabel;