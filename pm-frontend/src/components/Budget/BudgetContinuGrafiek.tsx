import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { InfoIcon } from '../../icons/Info';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening } from '../../model/Rekening';

type DatumWaardePunt = {
  datum: dayjs.Dayjs;
  budgetOpDatum: number;
  bedragSegment: number;
};

type BudgetContinuGrafiekProps = {
  peildatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  besteedOpPeildatum: number;
};

export const BudgetContinuGrafiek = (props: BudgetContinuGrafiekProps) => {

  const { setSnackbarMessage } = useCustomContext();

  if (props.rekening.budgetten.length === 0
    || props.rekening.budgetten.length > 1 ||
    props.rekening.budgetten[0].budgetType.toLowerCase() !== 'continu') {
    throw new Error('Er moet precies 1 continu budget zijn.');
  }

  const budget = props.rekening.budgetten[0];

  const periodeLengte = dayjs(props.periode.periodeEindDatum).diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const maandBudget = budget.budgetPeriodiciteit.toLowerCase() === 'maand' ? budget.bedrag : periodeLengte * budget.bedrag / 7;
  const dagenInPeriodeOpPeildatum = props.peildatum.diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const budgetOpPeildatum = maandBudget * dagenInPeriodeOpPeildatum / periodeLengte;
  const verschilOpPeildatumInWaarde = budgetOpPeildatum - props.besteedOpPeildatum;
  const verschilOpPeildatumInDagen = Math.round(periodeLengte * verschilOpPeildatumInWaarde / maandBudget);
  const budgetDatum = props.peildatum.subtract(verschilOpPeildatumInDagen, 'day') <= dayjs(props.periode.periodeStartDatum) ?
    dayjs(props.periode.periodeStartDatum) :
    props.peildatum.subtract(verschilOpPeildatumInDagen, 'day');

  const start: DatumWaardePunt = { datum: dayjs(props.periode.periodeStartDatum), budgetOpDatum: 0 };
  let besteedBinnenBudget: DatumWaardePunt, meerDanBudget: DatumWaardePunt, minderDanBudget: DatumWaardePunt;
  if (verschilOpPeildatumInDagen === 0) {
    besteedBinnenBudget = { datum: props.peildatum, budgetOpDatum: props.besteedOpPeildatum };
    minderDanBudget = { datum: props.peildatum, budgetOpDatum: 0 };
    meerDanBudget = { datum: props.peildatum, budgetOpDatum: 0 };
  } else if (verschilOpPeildatumInWaarde >= 0) {
    besteedBinnenBudget = { datum: budgetDatum, budgetOpDatum: props.besteedOpPeildatum };
    minderDanBudget = { datum: props.peildatum, budgetOpDatum: props.besteedOpPeildatum + verschilOpPeildatumInWaarde };
    meerDanBudget = { datum: props.peildatum, budgetOpDatum: 0 };
  } else {
    besteedBinnenBudget = { datum: props.peildatum, budgetOpDatum: props.besteedOpPeildatum + verschilOpPeildatumInWaarde };
    minderDanBudget = { datum: props.peildatum, budgetOpDatum: 0 };
    meerDanBudget = props.besteedOpPeildatum <= maandBudget ? { datum: budgetDatum, budgetOpDatum: props.besteedOpPeildatum } :
      { datum: dayjs(props.periode.periodeEindDatum), budgetOpDatum: maandBudget };
  }
  const restMaandBudget: DatumWaardePunt = { datum: dayjs(props.periode.periodeEindDatum), budgetOpDatum: maandBudget };
  const meerDanMaandBudget: DatumWaardePunt = { datum: budgetDatum, budgetOpDatum: props.besteedOpPeildatum > maandBudget ? props.besteedOpPeildatum : 0 };

  if (minderDanBudget.budgetOpDatum > 0 && meerDanBudget.budgetOpDatum > 0) {
    throw new Error('meer en minder kunnen niet allebei > 0 zijn');
  }

  const diffDays = (date1: dayjs.Dayjs, date2: dayjs.Dayjs) => {
    return dayjs(date2).diff(dayjs(date1), 'day');
  };

  const daysBetween = [
    diffDays(start.datum, besteedBinnenBudget.datum),
    diffDays(besteedBinnenBudget.datum, minderDanBudget.datum),
    diffDays(minderDanBudget.datum, meerDanBudget.datum),
    diffDays(meerDanBudget.datum, restMaandBudget.datum),
  ];

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const besteedBedrag = besteedBinnenBudget.budgetOpDatum;
  const minderBedrag = minderDanBudget.budgetOpDatum - besteedBinnenBudget.budgetOpDatum;
  const meerBedrag = meerDanBudget.budgetOpDatum - minderDanBudget.budgetOpDatum - besteedBinnenBudget.budgetOpDatum;
  const restBedrag = restMaandBudget.budgetOpDatum - meerDanBudget.budgetOpDatum - minderDanBudget.budgetOpDatum - (minderDanBudget.budgetOpDatum === 0 && meerDanBudget.budgetOpDatum === 0 ? besteedBinnenBudget.budgetOpDatum : 0);
  const overflowBedrag = meerDanMaandBudget.budgetOpDatum - meerDanBudget.budgetOpDatum - minderDanBudget.budgetOpDatum;

  const toonBudgetToelichtingMessage = () => {
    if (meerDanMaandBudget.budgetOpDatum > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Je heb het maandbudget van ${formatAmount(maandBudget.toString())}
      overschreden met ${formatAmount((overflowBedrag).toString())}. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(meerDanMaandBudget.budgetOpDatum.toString())} geworden. Dat is
      ${formatAmount((overflowBedrag + meerBedrag).toString())} meer.`;
    } else if (meerDanBudget.budgetOpDatum > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(meerDanBudget.budgetOpDatum.toString())} geworden. Dat is
      ${formatAmount((meerBedrag).toString())} meer.`;
    } else if (minderDanBudget.budgetOpDatum > 0) {
      return `Je hebt minder uitgegeven dan op basis van het budget had gekund, namelijk ${formatAmount(besteedBinnenBudget.budgetOpDatum.toString())}
      terwijl je volgens het budget ${formatAmount(minderDanBudget.budgetOpDatum.toString())} had kunnen uitgeven.`;
    } else {
      return `Je hebt precies het gebudgetteerde bedrag voor ${props.peildatum.format('D MMMM')} uitgegevens, namelijk
      ${formatAmount(props.besteedOpPeildatum.toString())}.`;
    }
  }

  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  console.log('peildatum', JSON.stringify(props.peildatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  // console.log('maandBudget', JSON.stringify(maandBudget));
  // console.log('dagenInPeriode', JSON.stringify(dagenInPeriode));
  // console.log('budgetOpPeildatum', JSON.stringify(budgetOpPeildatum));
  // console.log('verschilOpPeildatumInWaarde', JSON.stringify(verschilOpPeildatumInWaarde));
  // console.log('verschilOpPeildatumInDagen', JSON.stringify(verschilOpPeildatumInDagen));
  // console.log('budgetDatum', JSON.stringify(budgetDatum));
  // console.log('start', JSON.stringify(start));
  console.log('besteed', JSON.stringify(besteedBinnenBudget));
  console.log('minder', JSON.stringify(minderDanBudget));
  console.log('meer', JSON.stringify(meerDanBudget));
  console.log('rest', JSON.stringify(restMaandBudget));
  // console.log('overflow', JSON.stringify(overflow));

  return (
    <>
      <TableContainer >
        <Table>
          <TableBody >
            <TableRow>
              <TableCell colSpan={4} sx={{ paddingBottom: 0, borderBottom: 'none' }}>
                <Grid display={'flex'} direction={'row'} alignItems={'center'}>
                  <Typography variant='body2'>
                    <strong>{props.rekening.naam}</strong>
                  </Typography>
                  <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer' }}
                    onClick={() => setSnackbarMessage({ message: toonBudgetToelichtingMessage(), type: 'info' })}>
                    <InfoIcon height='16' />
                  </Box>
                </Grid>

              </TableCell>
            </TableRow>
            <TableRow>
              {props.peildatum.isAfter(dayjs(props.periode.periodeStartDatum)) && besteedBinnenBudget.budgetOpDatum > 0 &&
                <TableCell
                  colSpan={minderDanBudget.budgetOpDatum === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[0] + 1) / periodeLengte) * 100}%`}
                  sx={{
                    p: 1,
                    borderRight: minderDanBudget.budgetOpDatum === 0 ? '1px dashed grey' : 'none',
                    fontSize: 10
                  }} >
                  {formatAmount(besteedBinnenBudget.budgetOpDatum.toString())}
                </TableCell>}
              {(minderDanBudget.budgetOpDatum > 0 || meerDanBudget.budgetOpDatum > 0) && (minderBedrag > 0 || meerBedrag > 0) &&
                <TableCell
                  colSpan={besteedBinnenBudget.budgetOpDatum === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[1] + daysBetween[2]) / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: 10 }} >
                  {minderDanBudget.budgetOpDatum > 0 ? formatAmount(minderDanBudget.budgetOpDatum.toString()) : formatAmount(meerDanBudget.budgetOpDatum.toString())}
                </TableCell>
              }
              {maandBudget > props.besteedOpPeildatum && restBedrag > 0 &&
                <TableCell
                  colSpan={meerDanBudget.budgetOpDatum === 0 ? 2 : 1}
                  align="right"
                  width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{ p: 1, borderLeft: meerDanBudget.budgetOpDatum === 0 ? '1px dashed grey' : 'none', fontSize: 10 }}>
                  {formatAmount(restMaandBudget.budgetOpDatum.toString())}
                </TableCell>}
              {maandBudget < props.besteedOpPeildatum &&
                <TableCell
                  align="right"
                  // width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: 10 }}>
                  {formatAmount(meerDanMaandBudget.budgetOpDatum.toString())}
                </TableCell>}
            </TableRow>
            <TableRow>
              {props.peildatum.isAfter(dayjs(props.periode.periodeStartDatum)) && besteedBinnenBudget.budgetOpDatum > 0 &&
                <TableCell
                  colSpan={minderDanBudget.budgetOpDatum === 0 ? 2 : 1}
                  width={`${((daysBetween[0] + 1) / periodeLengte) * 100}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(besteedBedrag.toString())}
                </TableCell>}
              {(minderDanBudget.budgetOpDatum > 0 || meerDanBudget.budgetOpDatum > 0) && (minderBedrag > 0 || meerBedrag > 0) &&
                <TableCell
                  colSpan={besteedBinnenBudget.budgetOpDatum === 0 ? 2 : 1}
                  width={`${((daysBetween[1] + daysBetween[2]) / periodeLengte) * 100}%`}
                  sx={{
                    backgroundColor: minderDanBudget.budgetOpDatum > 0 ? 'green' : 'red',
                    borderBottom: minderDanBudget.budgetOpDatum > 0 ? '10px solid green' : '10px solid #333',
                    color: 'white', textAlign: 'center'
                  }}>
                  {minderDanBudget.budgetOpDatum > 0 ? formatAmount(minderBedrag.toString()) : formatAmount(meerBedrag.toString())}
                  </TableCell>
              }
              {maandBudget > props.besteedOpPeildatum && restBedrag > 0 &&
                <TableCell
                  colSpan={meerDanBudget.budgetOpDatum === 0 ? 2 : 1}
                  width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{
                    backgroundColor: 'lightgrey', color: 'white',
                    borderBottom: '10px solid lightgrey',
                    textAlign: 'center'
                  }}>
                  {formatAmount(restBedrag.toString())}
                </TableCell>}
              {maandBudget < props.besteedOpPeildatum &&
                <TableCell
                  // colSpan={meer.waarde === 0 ? 2 : 1}
                  // width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{
                    backgroundColor: 'darkred',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(overflowBedrag.toString())}
                </TableCell>}
            </TableRow>
            <TableRow>
              {props.peildatum.isAfter(dayjs(props.periode.periodeStartDatum)) && besteedBinnenBudget.budgetOpDatum > 0 &&
                <TableCell
                  colSpan={minderDanBudget.budgetOpDatum === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[0] + 1) / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: minderDanBudget.budgetOpDatum === 0 ? '1px dashed grey' : 'none' }} >
                  {minderDanBudget.budgetOpDatum === 0 && dayjs(besteedBinnenBudget.datum).format('D MMM')}
                </TableCell>}
              {(minderDanBudget.budgetOpDatum > 0 || meerDanBudget.budgetOpDatum > 0) && (minderBedrag > 0 || meerBedrag > 0) &&
                <TableCell
                  colSpan={besteedBinnenBudget.budgetOpDatum === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[1] + daysBetween[2]) / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: 10 }} >
                  {minderDanBudget.budgetOpDatum > 0 && dayjs(minderDanBudget.datum).format('D MMM')}
                  {restBedrag === 0 && meerBedrag > 0 && dayjs(meerDanBudget.datum).format('D MMM')}
                </TableCell>}
              {maandBudget > props.besteedOpPeildatum && restBedrag > 0 &&
                <TableCell
                  colSpan={meerDanBudget.budgetOpDatum === 0 ? 2 : 1}
                  align="right"
                  width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{ p: 1, borderLeft: meerDanBudget.budgetOpDatum === 0 ? '1px dashed grey' : 'none', fontSize: 10 }} >
                  {dayjs(restMaandBudget.datum).format('D MMM')}
                </TableCell>}
              {maandBudget < props.besteedOpPeildatum &&
                <TableCell
                  align="right"
                  sx={{ p: 1, fontSize: 10 }} >
                  &nbsp;
                </TableCell>}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default BudgetContinuGrafiek;