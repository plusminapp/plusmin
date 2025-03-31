import { Box, FormControlLabel, FormGroup, Switch, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { dagInPeriode, Periode } from '../../model/Periode';
import { InfoIcon } from '../../icons/Info';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening, RekeningSoort } from '../../model/Rekening';
import { useState } from 'react';
import { BudgetDTO } from '../../model/Budget';

type BudgetVastGrafiekProps = {
  peildatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  budgetten: BudgetDTO[];
};

export const BudgetVastGrafiek = (props: BudgetVastGrafiekProps) => {

  const { setSnackbarMessage } = useCustomContext();

  const [toonBudgetVastDetails, setToonBudgetVastDetails] = useState<boolean>(localStorage.getItem('toonIntern') === 'true');
  const handleToonBudgetVastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonIntern', event.target.checked.toString());
    setToonBudgetVastDetails(event.target.checked);
  };


  if (props.rekening.rekeningSoort.toLowerCase() !== RekeningSoort.uitgaven.toLowerCase() ||
    props.budgetten.length === 0 ||
    props.budgetten.some(budget => budget.betaalDag === undefined) ||
    props.budgetten.some(budget => (budget?.betaalDag ?? 0) < 1) ||
    props.budgetten.some(budget => (budget?.betaalDag ?? 30) > 28)) {
    throw new Error('BudgetVastGrafiek: rekeningSoort moet \'inkomsten\' zijn, er moet minimaal 1 budget zijn en alle budgetten moeten een geldige betaalDag hebben.');
  }

  const budgettenMetPositieveBetaling = props.budgetten.map((budget) => (
    {
      ...budget,
      budgetSaldoBetaling: -(budget.budgetSaldoBetaling ?? 0),
    }));


  const maandBudget = budgettenMetPositieveBetaling.reduce((acc, budget) => (acc + budget.bedrag), 0)

  const inkomstenMoetBetaaldZijn = (betaalDag: number | undefined) => {
    if (betaalDag === undefined) return true;
    const betaalDagInPeriode = dagInPeriode(betaalDag, props.periode);
    return betaalDagInPeriode.isBefore(props.peildatum) || betaalDagInPeriode.isSame(props.peildatum);
  }
  const betaaldOpPeildatum = budgettenMetPositieveBetaling.reduce((acc, budget) => (acc + (budget.budgetSaldoBetaling ?? 0)), 0);

  const betaaldBinnenBudget = budgettenMetPositieveBetaling.reduce((acc, budget) =>
    (acc + (inkomstenMoetBetaaldZijn(budget.betaalDag) ? Math.min(budget.bedrag, budget.budgetSaldoBetaling ?? 0) : 0)), 0);

  const minderDanBudget = budgettenMetPositieveBetaling.reduce((acc, budget) =>
    (acc + (inkomstenMoetBetaaldZijn(budget.betaalDag) ? Math.max(0, budget.bedrag - (budget.budgetSaldoBetaling ?? 0)) : 0)), 0);

  const meerDanBudget = budgettenMetPositieveBetaling.reduce((acc, budget) =>
    acc + (inkomstenMoetBetaaldZijn(budget.betaalDag) ? 0 : Math.min(budget.budgetSaldoBetaling ?? 0, budget.bedrag)), 0);

  // const blaatToiTnuToe = betaaldBinnenBudget + minderDanBudget + meerDanBudget;
  const meerDanMaandBudget = budgettenMetPositieveBetaling.reduce((acc, budget) =>
    (acc + Math.max(0, (budget.budgetSaldoBetaling ?? 0) - budget.bedrag)), 0);

  const restMaandBudget = budgettenMetPositieveBetaling.reduce((acc, budget) =>
    (acc + (inkomstenMoetBetaaldZijn(budget.betaalDag) ? 0 : Math.max(0, budget.bedrag - (budget.budgetSaldoBetaling ?? 0)))), 0);


  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = maandBudget + meerDanMaandBudget + 5;

  const toonBudgetToelichtingMessage = () => {
    return 'Todo'
  }

  console.log('----------------------------------------------');
  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  // console.log('peildatum', JSON.stringify(props.peildatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  console.log('budgetten', JSON.stringify(budgettenMetPositieveBetaling));
  console.log('maandBudget', JSON.stringify(maandBudget));
  console.log('betaaldOpPeildatum', JSON.stringify(betaaldOpPeildatum));
  console.log('betaaldBinnenBudget', JSON.stringify(betaaldBinnenBudget));
  console.log('minderDanBudget', JSON.stringify(minderDanBudget));
  console.log('meerDanBudget', JSON.stringify(meerDanBudget));
  console.log('restMaandBudget', JSON.stringify(restMaandBudget));
  console.log('meerDanMaandBudget', JSON.stringify(meerDanMaandBudget));

  return (
    <>
      <Grid display={'flex'} direction={'row'} alignItems={'center'}>
        <Typography variant='body2'>
          <strong>{props.rekening.naam}</strong>
        </Typography>
        <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer' }}
          onClick={() => setSnackbarMessage({ message: toonBudgetToelichtingMessage(), type: 'info' })}>
          <InfoIcon height='16' />
        </Box>
        {budgettenMetPositieveBetaling.length >= 1 &&
          <FormGroup >
            <FormControlLabel control={
              <Switch
                sx={{ transform: 'scale(0.6)' }}
                checked={toonBudgetVastDetails}
                onChange={handleToonBudgetVastChange}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />}
              sx={{ mr: 0 }}
              label={
                <Box display="flex" fontSize={'0.875rem'} >
                  Toon budget details
                </Box>
              } />
          </FormGroup>}
      </Grid>
      {toonBudgetVastDetails &&
        <Grid display={'flex'} direction={'row'} flexWrap={'wrap'} alignItems={'center'}>
          {budgettenMetPositieveBetaling.map((budget, index) => (
            <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
              {budget.budgetNaam}: {formatAmount(budget.bedrag.toString())} op {budget.betaalDag && dagInPeriode(budget.betaalDag, props.periode).format('D MMMM')} waarvan
              {formatAmount(budget.budgetSaldoBetaling?.toString() ?? "nvt")} is betaald.
            </Typography>
          ))}
        </Grid>}
      <TableContainer >
        <Table>
          <TableBody>

            <TableRow>
              <TableCell width={'5%'} />
              {betaaldBinnenBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
                />}
              {meerDanBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget === 0 ? '2px dotted #333' : 'none', }}
                  align="right"
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenBudget + meerDanBudget).toString())}
                </TableCell>}
              {meerDanMaandBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                  align="right"
                  width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenBudget + meerDanBudget + meerDanMaandBudget).toString())}
                </TableCell>}
              {minderDanBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px' }}
                  align="right"
                  width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenBudget + meerDanBudget + meerDanMaandBudget + minderDanBudget).toString())}
                </TableCell>}
              {restMaandBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenBudget + meerDanBudget + minderDanBudget + meerDanMaandBudget + restMaandBudget).toString())}
                </TableCell>}
              {restMaandBudget === 0 && props.peildatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell />}
            </TableRow>

            <TableRow>
              <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
              {betaaldBinnenBudget > 0 &&
                <TableCell
                  width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(betaaldBinnenBudget.toString())}
                </TableCell>}
              {meerDanBudget > 0 &&
                <TableCell
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'lightGreen',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanBudget.toString())}
                </TableCell>}
              {meerDanMaandBudget > 0 &&
                <TableCell
                  width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'orange',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanMaandBudget.toString())}
                </TableCell>}
              {minderDanBudget > 0 &&
                <TableCell
                  width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'red',
                    borderBottom: '10px solid red',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(minderDanBudget.toString())}
                </TableCell>}
              {restMaandBudget > 0 &&
                <TableCell
                  width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: '10px solid #1977d3',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(restMaandBudget.toString())}
                </TableCell>}
              {restMaandBudget === 0 && props.peildatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell
                  sx={{
                    backgroundColor: '#333',
                    borderBottom: '10px solid #333',
                  }} />}
            </TableRow>

            <TableRow>
              <TableCell
                align="right"
                width={'5%'}
                sx={{ p: 1, fontSize: '10px' }} >
                {dayjs(props.periode.periodeStartDatum).format('D/M')}
              </TableCell>
              {betaaldBinnenBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }} >
                  {meerDanBudget === 0 && meerDanMaandBudget === 0 && props.peildatum.format('D/M')}
                </TableCell>}
              {meerDanBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget === 0 ? '2px dotted #333' : 'none', }} >
                  {meerDanMaandBudget === 0 && props.peildatum.format('D/M')}
                </TableCell>}
              {meerDanMaandBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }} >
                  {props.peildatum.format('D/M')}
                </TableCell>}
              {minderDanBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px' }}>
                  {props.peildatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum && props.peildatum.format('D/M')}
                </TableCell>}
              {restMaandBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget === 0 ? '2px dotted #333' : 'none' }} >
                  {dayjs(props.periode.periodeEindDatum).format('D/M')}
                </TableCell>}
              {restMaandBudget === 0 && props.peildatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell
                  align="right"
                  sx={{ p: 1, fontSize: '10px' }} >
                  {dayjs(props.periode.periodeEindDatum).format('D/M')}
                </TableCell>}
            </TableRow>

          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
};

export default BudgetVastGrafiek;