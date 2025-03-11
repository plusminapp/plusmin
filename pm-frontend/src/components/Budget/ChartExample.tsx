import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { Budget } from '../../model/Budget';
import { berekenPeriodeBijPeildatum } from '../../model/Periode';

type DataPoint = {
  datum: dayjs.Dayjs;
  waarde: number;
};

type ChartExampleProps = {
  peildatum: dayjs.Dayjs;
  budget: Budget;
  besteedOpPeildatum: number;
};

export const ChartExample = (props: ChartExampleProps) => {

const periode = berekenPeriodeBijPeildatum(props.peildatum);

  const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
  const maandBudget = props.budget.budgetPeriodiciteit === 'maand' ? props.budget.bedrag : periodeLengte * props.budget.bedrag / 7;
  const dagenInPeriode = props.peildatum.diff(dayjs(periode.periodeStartDatum), 'day') + 1;
  const budgetOpPeildatum = maandBudget * dagenInPeriode / periodeLengte;
  const verschilOpPeildatumInWaarde = budgetOpPeildatum - props.besteedOpPeildatum;
  const verschilOpPeildatumInDagen = Math.round(periodeLengte * verschilOpPeildatumInWaarde / maandBudget);
  const budgetDatum = props.peildatum.subtract(verschilOpPeildatumInDagen, 'day');

  const start: DataPoint = { datum: dayjs(periode.periodeStartDatum), waarde: 0 };
  let besteed: DataPoint, meer: DataPoint, minder: DataPoint;
  if (verschilOpPeildatumInDagen === 0) {
    besteed = { datum: props.peildatum, waarde: props.besteedOpPeildatum };
    minder = { datum: props.peildatum, waarde: 0 };
    meer = { datum: props.peildatum, waarde: 0 };
  } else  if (verschilOpPeildatumInWaarde >= 0) {
    besteed = { datum: budgetDatum, waarde: props.besteedOpPeildatum };
    minder = { datum: props.peildatum, waarde: props.besteedOpPeildatum + verschilOpPeildatumInWaarde };
    meer = { datum: props.peildatum, waarde: 0 };
  } else {
    besteed = { datum: props.peildatum, waarde: props.besteedOpPeildatum + verschilOpPeildatumInWaarde};
    minder = { datum: props.peildatum, waarde: 0 };
    meer = { datum: budgetDatum, waarde: props.besteedOpPeildatum };
  }
  const rest: DataPoint = { datum: dayjs(periode.periodeEindDatum), waarde: maandBudget };


  console.log('periode.periodeStartDatum.', JSON.stringify(periode.periodeStartDatum));
  console.log('periode.periodeEindDatum.', JSON.stringify(periode.periodeEindDatum));
  console.log('peildatum', JSON.stringify(props.peildatum));
  console.log('periodeLengte', JSON.stringify(periodeLengte));
  console.log('maandBudget', JSON.stringify(maandBudget));
  console.log('dagenInPeriode', JSON.stringify(dagenInPeriode));
  console.log('budgetOpPeildatum', JSON.stringify(budgetOpPeildatum));
  console.log('verschilOpPeildatumInWaarde', JSON.stringify(verschilOpPeildatumInWaarde));
  console.log('verschilOpPeildatumInDagen', JSON.stringify(verschilOpPeildatumInDagen));
  console.log('budgetDatum', JSON.stringify(budgetDatum));
  console.log('start', JSON.stringify(start));
  console.log('besteed', JSON.stringify(besteed));
  console.log('minder', JSON.stringify(minder));
  console.log('meer', JSON.stringify(meer));
  console.log('rest', JSON.stringify(rest));

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

  return (
    <TableContainer >
      <Table>
        <TableBody >
          <TableRow>
            {props.peildatum.isAfter(dayjs(periode.periodeStartDatum)) &&
              <TableCell
              align="right"
              width={`${((daysBetween[0] + 1) / periodeLengte) * 100}%`}
              sx={{ p: 1, fontSize: '10px' }} >
              {dayjs(besteed.datum).format('D MMM')}
            </TableCell>}
            {(minder.waarde > 0 || meer.waarde > 0) &&
              <TableCell
                align="right"
                width={`${((daysBetween[1] + daysBetween[2]) / periodeLengte) * 100}%`}
                sx={{
                  p: 1,
                  fontSize: 10,
                  borderRight: minder.waarde > 0 ? '1px dashed grey' : 'none',
                  borderLeft: meer.waarde > 0 ? '1px dashed grey' : 'none'
                }} >
                {minder.waarde > 0 ? dayjs(minder.datum).format('D MMM') : dayjs(meer.datum).format('D MMM')}
              </TableCell>}
            {maandBudget > props.besteedOpPeildatum &&
              <TableCell align="right" width={`${(daysBetween[3] / periodeLengte) * 100}%`} sx={{ p: 1, fontSize: 10 }} >
              {dayjs(rest.datum).format('D MMM')}
            </TableCell>}
          </TableRow>
          <TableRow>
            {props.peildatum.isAfter(dayjs(periode.periodeStartDatum)) &&
              <TableCell width={daysBetween[0] + 1} style={{ backgroundColor: '#1977d3' }}>
              &nbsp;
            </TableCell>}
            {(minder.waarde > 0 || meer.waarde > 0) &&
              <TableCell width={daysBetween[1] + daysBetween[2]} style={{ backgroundColor: minder.waarde > 0 ? 'green' : 'red' }}>
                &nbsp;
              </TableCell>
            }
            {maandBudget > props.besteedOpPeildatum &&
              <TableCell width={daysBetween[3]} style={{ backgroundColor: 'lightgrey' }}>
              &nbsp;
            </TableCell>}
          </TableRow>
          <TableRow>
            {props.peildatum.isAfter(dayjs(periode.periodeStartDatum)) &&
              <TableCell align="right" width={daysBetween[0] + 1} sx={{ p: 1, fontSize: 10 }} >
              {formatAmount(besteed.waarde.toString())}
            </TableCell>}
            {(minder.waarde > 0 || meer.waarde > 0) &&
              <TableCell
                align="right"
                width={daysBetween[1] + daysBetween[2]}
                sx={{
                  p: 1,
                  fontSize: 10,
                  borderRight: minder.waarde > 0 ? '1px dashed grey' : 'none',
                  borderLeft: meer.waarde > 0 ? '1px dashed grey' : 'none'
                }} >
                {minder.waarde > 0 ? formatAmount(minder.waarde.toString()) : formatAmount(meer.waarde.toString())}
              </TableCell>
            }
            {maandBudget > props.besteedOpPeildatum &&
              <TableCell align="right" width={daysBetween[3]} sx={{ p: 1, fontSize: 10 }}>
              {formatAmount(rest.waarde.toString())}
            </TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChartExample;