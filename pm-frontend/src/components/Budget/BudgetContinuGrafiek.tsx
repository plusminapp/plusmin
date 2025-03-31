import { Box, FormControlLabel, FormGroup, Switch, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { dagInPeriode, Periode } from '../../model/Periode';
import { InfoIcon } from '../../icons/Info';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening, RekeningSoort } from '../../model/Rekening';
import { useState } from 'react';
import { BudgetDTO } from '../../model/Budget';

type BudgetContinuGrafiekProps = {
  peildatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  budgetten: BudgetDTO[];
};

export const BudgetContinuGrafiek = (props: BudgetContinuGrafiekProps) => {

  const { setSnackbarMessage } = useCustomContext();

  const [toonBudgetVastDetails, setToonBudgetVastDetails] = useState<boolean>(false);
  const handleToonBudgetVastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToonBudgetVastDetails(event.target.checked);
  };

  if (props.rekening.rekeningSoort.toLowerCase() !== RekeningSoort.uitgaven.toLowerCase() ||
    props.rekening.budgetType?.toLowerCase() !== 'continu' ||
    props.budgetten.length === 0) {
    throw new Error('BudgetContinuGrafiek: rekeningSoort moet \'uitgaven\' zijn, er moet minimaal 1 budget zijn en het BudgetType moet \'continu\' zijn.');
  }
  const periodeLengte = dayjs(props.periode.periodeEindDatum).diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const dagenTotPeilDatum = props.peildatum.diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;

  const berekenBudgetBedragOpPeildatum = (bedrag: number) => {
    return Math.round((dagenTotPeilDatum / periodeLengte) * bedrag);
  }
  const berekenMaandBedrag = (periodiciteit: string, bedrag: number) => {
    if (periodiciteit.toLowerCase() === 'maand') {
      return bedrag;
    } else {
      return periodeLengte * bedrag / 7;
    }
  }
  const budgettenMetUitbreidingen = props.budgetten.map((budget) => (
    {
      ...budget,
      budgetOpPeilDatum: berekenBudgetBedragOpPeildatum(berekenMaandBedrag(budget.budgetPeriodiciteit, budget.bedrag)),
      budgetSaldoBetaling: -(budget.budgetSaldoBetaling ?? 0),
    }));

  const maandBudget = budgettenMetUitbreidingen.reduce((acc, budget) => (acc + berekenMaandBedrag(budget.budgetPeriodiciteit, budget.bedrag)), 0);

  const budgetOpPeildatum = budgettenMetUitbreidingen.reduce((acc, budget) => (acc + budget.budgetOpPeilDatum), 0);

  const besteedOpPeildatum = budgettenMetUitbreidingen.reduce((acc, budget) => (acc + (budget.budgetSaldoBetaling ?? 0)), 0);

  const verschilOpPeildatumInWaarde = budgetOpPeildatum - besteedOpPeildatum;

  const besteedBinnenBudget = budgettenMetUitbreidingen.reduce((acc, budget) =>
    (acc + (Math.min(budget.budgetSaldoBetaling ?? 0, budget.budgetOpPeilDatum ?? 0))), 0);

  const meerDanMaandBudget = Math.max(besteedOpPeildatum - maandBudget, 0);

  const meerDanBudget = Math.max(budgettenMetUitbreidingen.reduce((acc, budget) =>
    (acc + (Math.max((budget.budgetSaldoBetaling ?? 0) - budget.budgetOpPeilDatum, 0))), 0) - meerDanMaandBudget, 0);

  const minderDanBudget = Math.max(budgetOpPeildatum - besteedOpPeildatum - meerDanMaandBudget, 0);

  const restMaandBudget = Math.max(maandBudget - besteedOpPeildatum - minderDanBudget - meerDanMaandBudget, 0);

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = maandBudget + meerDanMaandBudget + 5;

  const toonBudgetToelichtingMessage = () => {
    if (meerDanMaandBudget > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Je heb het maandbudget van ${formatAmount(maandBudget.toString())}
      overschreden met ${formatAmount((meerDanMaandBudget).toString())}. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(meerDanMaandBudget.toString())} geworden. Dat is
       ${formatAmount((meerDanBudget).toString())} + ${formatAmount((meerDanMaandBudget).toString())} = 
      ${formatAmount((meerDanMaandBudget + meerDanBudget).toString())} meer.`;
    } else if (meerDanBudget > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(meerDanBudget.toString())} geworden. Dat is
      ${formatAmount((meerDanBudget).toString())} meer.`;
    } else if (minderDanBudget > 0) {
      return `Je hebt minder uitgegeven dan op basis van het budget had gekund, namelijk ${formatAmount(besteedBinnenBudget.toString())}
      terwijl je volgens het budget ${formatAmount(minderDanBudget.toString())} had kunnen uitgeven.`;
    } else {
      return `Je hebt precies het gebudgetteerde bedrag voor ${props.peildatum.format('D MMMM')} uitgegevens, namelijk
      ${formatAmount(besteedOpPeildatum.toString())}.`;
    }
  }

  console.log('------------------------------------------');
  console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  console.log('peildatum', JSON.stringify(props.peildatum.format('YYYY-MM-DD')));
  console.log('budgetten', JSON.stringify(budgettenMetUitbreidingen));
  console.log('budgetOpPeildatum', JSON.stringify(budgetOpPeildatum));
  console.log('besteedOpPeildatum', JSON.stringify(besteedOpPeildatum));
  console.log('verschilOpPeildatumInWaarde', JSON.stringify(verschilOpPeildatumInWaarde));
  console.log('periodeLengte', JSON.stringify(periodeLengte));
  console.log('maandBudget', JSON.stringify(maandBudget));
  console.log('besteed', JSON.stringify(besteedBinnenBudget));
  console.log('minder', JSON.stringify(minderDanBudget));
  console.log('meer', JSON.stringify(meerDanBudget));
  console.log('rest', JSON.stringify(restMaandBudget));
  console.log('meerDanMaand', JSON.stringify(meerDanMaandBudget));

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
        {budgettenMetUitbreidingen.length >= 1 &&
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
          {budgettenMetUitbreidingen.map((budget, index) => (
            <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
              {budget.budgetNaam}: {formatAmount(budget.bedrag.toString())} op {budget.betaalDag && dagInPeriode(budget.betaalDag, props.periode).format('D MMMM')} waar
              van op {dayjs(props.peildatum).format('D MMMM')} {formatAmount(budget.budgetSaldoBetaling?.toString() ?? "nvt")} is uitgegeven.
            </Typography>
          ))}
        </Grid>}
      <TableContainer >
        <Table>
          <TableBody>

            <TableRow>
              <TableCell width={'5%'} />
              {besteedBinnenBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(besteedBinnenBudget / tabelBreedte) * 90}%`}
                />}
              {meerDanBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget === 0 ? '2px dotted #333' : 'none', }}
                  align="right"
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget).toString())}
                </TableCell>}
              {meerDanMaandBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                  align="right"
                  width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget + meerDanMaandBudget).toString())}
                </TableCell>}
              {minderDanBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: '2px dotted #333' }}
                  align="right"
                  width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget + meerDanMaandBudget + minderDanBudget).toString())}
                </TableCell>}
              {restMaandBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget + meerDanMaandBudget + minderDanBudget + restMaandBudget).toString())}
                </TableCell>}
              {restMaandBudget === 0 && props.peildatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell />}
            </TableRow>

            <TableRow>
              <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
              {besteedBinnenBudget > 0 &&
                <TableCell
                  width={`${(besteedBinnenBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(besteedBinnenBudget.toString())}
                </TableCell>}
              {meerDanBudget > 0 &&
                <TableCell
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'red',
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
                    backgroundColor: '#cc0000',
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
                    backgroundColor: 'green',
                    borderBottom: '10px solid green',
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
              {besteedBinnenBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(besteedBinnenBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: minderDanBudget === 0 && meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }} >
                  {(minderDanBudget === 0 && meerDanBudget === 0 && meerDanMaandBudget === 0) && props.peildatum.format('D/M')}
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
                  sx={{ p: 1, fontSize: '10px', borderLeft: '2px dotted #333' }}>
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
      </TableContainer>
    </>
  );
};

export default BudgetContinuGrafiek;