import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { InfoIcon } from '../../icons/Info';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening } from '../../model/Rekening';

// type DatumWaardePunt = {
//   datum: dayjs.Dayjs;
//   budgetEindeSegment: number;
//   budgetInSegment: number;
// };

type BudgetContinuGrafiekProps = {
  peildatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  besteedOpPeildatum: number;
};

export const BudgetContinuGrafiek = (props: BudgetContinuGrafiekProps) => {

  console.log('BudgetContinuGrafiek props', JSON.stringify(props));

  const { setSnackbarMessage } = useCustomContext();

  if (props.rekening.budgetten.length === 0
    || props.rekening.budgetten.length > 1 ||
    props.rekening.budgetten[0].budgetType.toLowerCase() !== 'continu') {
    throw new Error('Er moet precies 1 continu budget zijn.');
  }

  const budget = props.rekening.budgetten[0];

  const periodeLengte = dayjs(props.periode.periodeEindDatum).diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const maandBudget = budget.budgetPeriodiciteit.toLowerCase() === 'maand' ? budget.bedrag : periodeLengte * budget.bedrag / 7;
  const dagBudget = maandBudget / periodeLengte;
  const dagenInPeriodeOpPeildatum = props.peildatum.diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const budgetOpPeildatum = maandBudget * dagenInPeriodeOpPeildatum / periodeLengte;
  const verschilOpPeildatumInWaarde = budgetOpPeildatum - props.besteedOpPeildatum;

  const besteedBinnenBudget = {
    budgetEindeSegment: props.besteedOpPeildatum >= budgetOpPeildatum + dagBudget / 2 ? budgetOpPeildatum :
      props.besteedOpPeildatum > maandBudget ? maandBudget :
        props.besteedOpPeildatum,
    budgetInSegment: props.besteedOpPeildatum >= budgetOpPeildatum + dagBudget / 2 ? budgetOpPeildatum :
      props.besteedOpPeildatum > maandBudget ? maandBudget :
        props.besteedOpPeildatum,
  };
  const minderDanBudget = {
    budgetEindeSegment: besteedBinnenBudget.budgetEindeSegment +
      ((verschilOpPeildatumInWaarde > 0 && props.peildatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum) ||
        verschilOpPeildatumInWaarde > dagBudget / 2 ? verschilOpPeildatumInWaarde : 0),
    budgetInSegment: (verschilOpPeildatumInWaarde > 0 && props.peildatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum) ||
      verschilOpPeildatumInWaarde > dagBudget / 2 ? verschilOpPeildatumInWaarde : 0
  };
  const meerDanBudget = {
    budgetEindeSegment: props.besteedOpPeildatum > maandBudget || minderDanBudget.budgetEindeSegment - verschilOpPeildatumInWaarde > maandBudget ? maandBudget :
      props.peildatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum || -verschilOpPeildatumInWaarde < dagBudget / 2 ? minderDanBudget.budgetEindeSegment :
        minderDanBudget.budgetEindeSegment - verschilOpPeildatumInWaarde,
    budgetInSegment: props.besteedOpPeildatum > maandBudget || minderDanBudget.budgetEindeSegment - verschilOpPeildatumInWaarde > maandBudget ? maandBudget - minderDanBudget.budgetEindeSegment :
      props.peildatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum || -verschilOpPeildatumInWaarde < dagBudget / 2 ? 0 :
        -verschilOpPeildatumInWaarde
  };
  const meerDanMaandBudget = {
    budgetEindeSegment: props.besteedOpPeildatum > maandBudget ? props.besteedOpPeildatum : 0,
    budgetInSegment: props.besteedOpPeildatum > maandBudget ? props.besteedOpPeildatum - maandBudget : 0
  };
  const restMaandBudget = {
    budgetEindeSegment: maandBudget,
    budgetInSegment: meerDanBudget.budgetEindeSegment <= maandBudget && meerDanMaandBudget.budgetInSegment === 0 ? maandBudget - (besteedBinnenBudget.budgetEindeSegment + minderDanBudget.budgetInSegment + meerDanBudget.budgetInSegment) : 0
  };

  if (minderDanBudget.budgetInSegment > 0 && meerDanBudget.budgetInSegment > 0) {
    throw new Error('meer en minder kunnen niet allebei > 0 zijn');
  }

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = maandBudget + meerDanMaandBudget.budgetInSegment + 5;

  const toonBudgetToelichtingMessage = () => {
    if (meerDanMaandBudget.budgetInSegment > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Je heb het maandbudget van ${formatAmount(maandBudget.toString())}
      overschreden met ${formatAmount((meerDanMaandBudget.budgetInSegment).toString())}. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(meerDanMaandBudget.budgetEindeSegment.toString())} geworden. Dat is
       ${formatAmount((meerDanBudget.budgetInSegment).toString())} + ${formatAmount((meerDanMaandBudget.budgetInSegment).toString())} = 
      ${formatAmount((meerDanMaandBudget.budgetInSegment + meerDanBudget.budgetInSegment).toString())} meer.`;
    } else if (meerDanBudget.budgetInSegment > 0) {
      return `Je hebt meer uitgegeven dan het budget toestaat. Volgens het budget had je op ${props.peildatum.format('D MMMM')}
      ${formatAmount(budgetOpPeildatum.toString())} mogen uitgeven en het is ${formatAmount(meerDanBudget.budgetEindeSegment.toString())} geworden. Dat is
      ${formatAmount((meerDanBudget.budgetInSegment).toString())} meer.`;
    } else if (minderDanBudget.budgetInSegment > 0) {
      return `Je hebt minder uitgegeven dan op basis van het budget had gekund, namelijk ${formatAmount(besteedBinnenBudget.budgetEindeSegment.toString())}
      terwijl je volgens het budget ${formatAmount(minderDanBudget.budgetEindeSegment.toString())} had kunnen uitgeven.`;
    } else {
      return `Je hebt precies het gebudgetteerde bedrag voor ${props.peildatum.format('D MMMM')} uitgegevens, namelijk
      ${formatAmount(props.besteedOpPeildatum.toString())}.`;
    }
  }

  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  // console.log('peildatum', JSON.stringify(props.peildatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  // console.log('maandBudget', JSON.stringify(maandBudget));
  // console.log('budgetOpPeildatum', JSON.stringify(budgetOpPeildatum));
  // console.log('verschilOpPeildatumInWaarde', JSON.stringify(verschilOpPeildatumInWaarde));
  // console.log('besteed', JSON.stringify(besteedBinnenBudget));
  // console.log('minder', JSON.stringify(minderDanBudget));
  // console.log('meer', JSON.stringify(meerDanBudget));
  // console.log('rest', JSON.stringify(restMaandBudget));
  // console.log('meerDanMaand', JSON.stringify(meerDanMaandBudget));

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
              <TableCell width={'5%'} />
              {besteedBinnenBudget.budgetInSegment > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px' }}
                  align="right"
                  width={`${(besteedBinnenBudget.budgetInSegment / tabelBreedte) * 90}%`}
                >
                  {formatAmount(besteedBinnenBudget.budgetEindeSegment.toString())}
                </TableCell>}
              {minderDanBudget.budgetInSegment > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: '2px dotted #333' }}
                  align="right"
                  width={`${(minderDanBudget.budgetInSegment / tabelBreedte) * 90}%`}
                >
                  {formatAmount(minderDanBudget.budgetEindeSegment.toString())}
                </TableCell>}
              {meerDanBudget.budgetInSegment > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget.budgetInSegment === 0 ? '2px dotted #333' : 'none', }}
                  align="right"
                  width={`${(meerDanBudget.budgetInSegment / tabelBreedte) * 90}%`}
                >
                  {formatAmount(meerDanBudget.budgetEindeSegment.toString())}
                </TableCell>}
              {restMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget.budgetInSegment === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(restMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                >
                  {formatAmount(restMaandBudget.budgetEindeSegment.toString())}
                </TableCell>}
              {meerDanMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                  align="right"
                  width={`${(meerDanMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                >
                  {formatAmount(meerDanMaandBudget.budgetEindeSegment.toString())}
                </TableCell>}
              {restMaandBudget.budgetInSegment === 0 && props.peildatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell />}
            </TableRow>

            <TableRow>
              <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
              {besteedBinnenBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(besteedBinnenBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(besteedBinnenBudget.budgetInSegment.toString())}
                </TableCell>}
              {minderDanBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(minderDanBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'green',
                    borderBottom: '10px solid green',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(minderDanBudget.budgetInSegment.toString())}
                </TableCell>}
              {meerDanBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(meerDanBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'red',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanBudget.budgetInSegment.toString())}
                </TableCell>}
              {restMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(restMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: '10px solid #1977d3',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(restMaandBudget.budgetInSegment.toString())}
                </TableCell>}
              {meerDanMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(meerDanMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'darkred',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanMaandBudget.budgetInSegment.toString())}
                </TableCell>}
              {restMaandBudget.budgetInSegment === 0 && props.peildatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
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
              {besteedBinnenBudget.budgetInSegment > 0 &&
                <TableCell
                  align="right"
                  width={`${(besteedBinnenBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: minderDanBudget.budgetEindeSegment === 0 ? '2px dotted #333' : 'none' }} >
                  {(minderDanBudget.budgetInSegment > 0 || (meerDanBudget.budgetInSegment === 0 && meerDanMaandBudget.budgetInSegment === 0)) && props.peildatum.format('D/M')}
                </TableCell>}
              {minderDanBudget.budgetInSegment > 0 &&
                <TableCell
                  align="right"
                  width={`${(minderDanBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderLeft: '2px dotted #333' }}>
                  {props.peildatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum && props.peildatum.format('D/M')}
                </TableCell>}
              {meerDanBudget.budgetInSegment > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget.budgetInSegment === 0 ? '2px dotted #333' : 'none', }} >
                  {meerDanMaandBudget.budgetInSegment === 0 && props.peildatum.format('D/M')}
                </TableCell>}
              {restMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  align="right"
                  width={`${(restMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget.budgetInSegment === 0 ? '2px dotted #333' : 'none' }} >
                  {dayjs(props.periode.periodeEindDatum).format('D/M')}
                </TableCell>}
              {meerDanMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }} >
                  {props.peildatum.format('D/M')}
                </TableCell>}
              {restMaandBudget.budgetInSegment === 0 && props.peildatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
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