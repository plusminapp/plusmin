import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { InfoIcon } from '../../icons/Info';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening } from '../../model/Rekening';

type DatumWaardePunt = {
  datum: dayjs.Dayjs;
  waarde: number;
};

type BudgetVasteLastenGrafiekProps = {
  peildatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  besteedOpPeildatum: number;
};

export const BudgetVasteLastenGrafiek = (props: BudgetVasteLastenGrafiekProps) => {

  const { setSnackbarMessage } = useCustomContext();

  if (props.rekening.budgetten.length === 0
    || props.rekening.budgetten.length > 1 ||
    props.rekening.budgetten[0].budgetType.toLowerCase() !== 'continu') {
    throw new Error('Er moet precies 1 continu budget zijn.');
  }

  const budget = props.rekening.budgetten[0];

  const periodeLengte = dayjs(props.periode.periodeEindDatum).diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const maandBudget = budget.budgetPeriodiciteit.toLowerCase() === 'maand' ? budget.bedrag : periodeLengte * budget.bedrag / 7;
  const dagenInPeriode = props.peildatum.diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const budgetOpPeildatum = maandBudget * dagenInPeriode / periodeLengte;
  const verschilOpPeildatumInWaarde = budgetOpPeildatum - props.besteedOpPeildatum;
  const verschilOpPeildatumInDagen = Math.round(periodeLengte * verschilOpPeildatumInWaarde / maandBudget);
  const budgetDatum = props.peildatum.subtract(verschilOpPeildatumInDagen, 'day') <= dayjs(props.periode.periodeStartDatum) ?
    dayjs(props.periode.periodeStartDatum) :
    props.peildatum.subtract(verschilOpPeildatumInDagen, 'day');

  const start: DatumWaardePunt = { datum: dayjs(props.periode.periodeStartDatum), waarde: 0 };
  let besteed: DatumWaardePunt, meer: DatumWaardePunt, minder: DatumWaardePunt;
  if (verschilOpPeildatumInDagen === 0) {
    besteed = { datum: props.peildatum, waarde: props.besteedOpPeildatum };
    minder = { datum: props.peildatum, waarde: 0 };
    meer = { datum: props.peildatum, waarde: 0 };
  } else if (verschilOpPeildatumInWaarde >= 0) {
    besteed = { datum: budgetDatum, waarde: props.besteedOpPeildatum };
    minder = { datum: props.peildatum, waarde: props.besteedOpPeildatum + verschilOpPeildatumInWaarde };
    meer = { datum: props.peildatum, waarde: 0 };
  } else {
    besteed = { datum: props.peildatum, waarde: props.besteedOpPeildatum + verschilOpPeildatumInWaarde };
    minder = { datum: props.peildatum, waarde: 0 };
    meer = props.besteedOpPeildatum <= maandBudget ? { datum: budgetDatum, waarde: props.besteedOpPeildatum } :
      { datum: dayjs(props.periode.periodeEindDatum), waarde: maandBudget };
  }
  const rest: DatumWaardePunt = { datum: dayjs(props.periode.periodeEindDatum), waarde: maandBudget };
  const overflow: DatumWaardePunt = { datum: budgetDatum, waarde: props.besteedOpPeildatum > maandBudget ? props.besteedOpPeildatum : 0 };

  if (minder.waarde > 0 && meer.waarde > 0) {
    throw new Error('meer en minder kunnen niet allebei > 0 zijn');
  }

  const diffDays = (date1: dayjs.Dayjs, date2: dayjs.Dayjs) => {
    return dayjs(date2).diff(dayjs(date1), 'day');
  };

  const daysBetween = [
    diffDays(start.datum, besteed.datum),
    diffDays(besteed.datum, minder.datum),
    diffDays(minder.datum, meer.datum),
    diffDays(meer.datum, rest.datum),
  ];

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const besteedBedrag = besteed.waarde;
  const minderBedrag = minder.waarde - besteed.waarde;
  const meerBedrag = meer.waarde - minder.waarde - besteed.waarde;
  const restBedrag = rest.waarde - meer.waarde - minder.waarde - (minder.waarde === 0 && meer.waarde === 0 ? besteed.waarde : 0);
  const overflowBedrag = overflow.waarde - meer.waarde - minder.waarde;

  const toonBudgetToelichtingMessage = () => {
    if (overflow.waarde > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Je heb het maandbudget van ${formatAmount(maandBudget.toString())}
      overschreden met ${formatAmount((overflowBedrag).toString())}. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(overflow.waarde.toString())} geworden. Dat is
      ${formatAmount((overflowBedrag + meerBedrag).toString())} meer.`;
    } else if (meer.waarde > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(meer.waarde.toString())} geworden. Dat is
      ${formatAmount((meerBedrag).toString())} meer.`;
    } else if (minder.waarde > 0) {
      return `Je hebt minder uitgegeven dan op basis van het budget had gekund, namelijk ${formatAmount(besteed.waarde.toString())}
      terwijl je volgens het budget ${formatAmount(minder.waarde.toString())} had kunnen uitgeven.`;
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
  console.log('besteed', JSON.stringify(besteed));
  console.log('minder', JSON.stringify(minder));
  console.log('meer', JSON.stringify(meer));
  console.log('rest', JSON.stringify(rest));
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
              {props.peildatum.isAfter(dayjs(props.periode.periodeStartDatum)) && besteed.waarde > 0 &&
                <TableCell
                  colSpan={minder.waarde === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[0] + 1) / periodeLengte) * 100}%`}
                  sx={{
                    p: 1,
                    borderRight: minder.waarde === 0 ? '1px dashed grey' : 'none',
                    fontSize: 10
                  }} >
                  {formatAmount(besteed.waarde.toString())}
                </TableCell>}
              {(minder.waarde > 0 || meer.waarde > 0) && (minderBedrag > 0 || meerBedrag > 0) &&
                <TableCell
                  colSpan={besteed.waarde === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[1] + daysBetween[2]) / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: 10 }} >
                  {minder.waarde > 0 ? formatAmount(minder.waarde.toString()) : formatAmount(meer.waarde.toString())}
                </TableCell>
              }
              {maandBudget > props.besteedOpPeildatum && restBedrag > 0 &&
                <TableCell
                  colSpan={meer.waarde === 0 ? 2 : 1}
                  align="right"
                  width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{ p: 1, borderLeft: meer.waarde === 0 ? '1px dashed grey' : 'none', fontSize: 10 }}>
                  {formatAmount(rest.waarde.toString())}
                </TableCell>}
              {maandBudget < props.besteedOpPeildatum &&
                <TableCell
                  align="right"
                  // width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: 10 }}>
                  {formatAmount(overflow.waarde.toString())}
                </TableCell>}
            </TableRow>
            <TableRow>
              {props.peildatum.isAfter(dayjs(props.periode.periodeStartDatum)) && besteed.waarde > 0 &&
                <TableCell
                  colSpan={minder.waarde === 0 ? 2 : 1}
                  width={`${((daysBetween[0] + 1) / periodeLengte) * 100}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(besteedBedrag.toString())}
                </TableCell>}
              {(minder.waarde > 0 || meer.waarde > 0) && (minderBedrag > 0 || meerBedrag > 0) &&
                <TableCell
                  colSpan={besteed.waarde === 0 ? 2 : 1}
                  width={`${((daysBetween[1] + daysBetween[2]) / periodeLengte) * 100}%`}
                  sx={{
                    backgroundColor: minder.waarde > 0 ? 'green' : 'red',
                    borderBottom: minder.waarde > 0 ? '10px solid green' : '10px solid #333',
                    color: 'white', textAlign: 'center'
                  }}>
                  {minder.waarde > 0 ? formatAmount(minderBedrag.toString()) : formatAmount(meerBedrag.toString())}
                  </TableCell>
              }
              {maandBudget > props.besteedOpPeildatum && restBedrag > 0 &&
                <TableCell
                  colSpan={meer.waarde === 0 ? 2 : 1}
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
              {props.peildatum.isAfter(dayjs(props.periode.periodeStartDatum)) && besteed.waarde > 0 &&
                <TableCell
                  colSpan={minder.waarde === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[0] + 1) / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: minder.waarde === 0 ? '1px dashed grey' : 'none' }} >
                  {minder.waarde === 0 && dayjs(besteed.datum).format('D MMM')}
                </TableCell>}
              {(minder.waarde > 0 || meer.waarde > 0) && (minderBedrag > 0 || meerBedrag > 0) &&
                <TableCell
                  colSpan={besteed.waarde === 0 ? 2 : 1}
                  align="right"
                  width={`${((daysBetween[1] + daysBetween[2]) / periodeLengte) * 100}%`}
                  sx={{ p: 1, fontSize: 10 }} >
                  {minder.waarde > 0 && dayjs(minder.datum).format('D MMM')}
                  {restBedrag === 0 && meerBedrag > 0 && dayjs(meer.datum).format('D MMM')}
                </TableCell>}
              {maandBudget > props.besteedOpPeildatum && restBedrag > 0 &&
                <TableCell
                  colSpan={meer.waarde === 0 ? 2 : 1}
                  align="right"
                  width={`${(daysBetween[3] / periodeLengte) * 100}%`}
                  sx={{ p: 1, borderLeft: meer.waarde === 0 ? '1px dashed grey' : 'none', fontSize: 10 }} >
                  {dayjs(rest.datum).format('D MMM')}
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

export default BudgetVasteLastenGrafiek;