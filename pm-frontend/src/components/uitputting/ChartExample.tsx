import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import dayjs from 'dayjs';

type DataPoint = {
  datum: Date;
  waarde: number;
};

export const ChartExample = () => {
  const start: DataPoint = { datum: new Date(2025, 1, 20), waarde: 0 };
  const besteed: DataPoint = { datum: new Date(2025, 1, 22), waarde: 40 };
  const minder: DataPoint = { datum: new Date(2025, 1, 23), waarde: 50 };
  const meer: DataPoint = { datum: new Date(2025, 1, 23), waarde: 0 };
  const rest: DataPoint = { datum: new Date(2025, 2, 19), waarde: 300 };

  if (minder.waarde > 0 && meer.waarde > 0) {
    throw new Error('meer en minder kunnen niet allebei > 0 zijn');
  }

  const diffDays = (date1: Date, date2: Date) => {
    return dayjs(date2).diff(dayjs(date1), 'day');
  };

  const daysBetween = [
    diffDays(start.datum, besteed.datum),
    diffDays(besteed.datum, minder.datum),
    diffDays(minder.datum, meer.datum),
    diffDays(meer.datum, rest.datum),
  ];

  const fullWidth = diffDays(start.datum, rest.datum);

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  return (
    <TableContainer >
      <Table>
        <TableBody >
          <TableRow>
            <TableCell
              align="right"
              width={`${((daysBetween[0] + 1) / fullWidth) * 100}%`}
              sx={{ p: 1, fontSize: 10 }} >
              {dayjs(besteed.datum).format('D MMM')}
            </TableCell>
            {(minder.waarde > 0 || meer.waarde > 0) &&
              <TableCell
                align="right"
                width={`${((daysBetween[1] + daysBetween[2]) / fullWidth) * 100}%`}
                sx={{
                  p: 1,
                  fontSize: 10,
                  borderRight: minder.waarde > 0 ? '1px dashed grey' : 'none',
                  borderLeft: meer.waarde > 0 ? '1px dashed grey' : 'none'
                }} >
                {minder.waarde > 0 ? dayjs(minder.datum).format('D MMM') : dayjs(meer.datum).format('D MMM')}
              </TableCell>
            }
            <TableCell align="right" width={`${(daysBetween[3] / fullWidth) * 100}%`} sx={{ p: 1, fontSize: 10 }} >
              {dayjs(rest.datum).format('D MMM')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell width={daysBetween[0] + 1} style={{ backgroundColor: '#757ce8' }}>
              &nbsp;
            </TableCell>
            {(minder.waarde > 0 || meer.waarde > 0) &&
              <TableCell width={daysBetween[1] + daysBetween[2]} style={{ backgroundColor: minder.waarde > 0 ? 'green' : 'red' }}>
                &nbsp;
              </TableCell>
            }
            <TableCell width={daysBetween[3]} style={{ backgroundColor: 'lightgrey' }}>
              &nbsp;
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="right" width={daysBetween[0] + 1} sx={{ p: 1, fontSize: 10 }} >
              {formatAmount(besteed.waarde.toString())}
            </TableCell>
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
            <TableCell align="right" width={daysBetween[3]} sx={{ p: 1, fontSize: 10 }}>
              {formatAmount(rest.waarde.toString())}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChartExample;