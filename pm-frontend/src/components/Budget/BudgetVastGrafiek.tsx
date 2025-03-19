import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { InfoIcon } from '../../icons/Info';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening, RekeningSoort } from '../../model/Rekening';

type BudgetVastGrafiekProps = {
  peildatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  besteedOpPeildatum: number;
};

export const BudgetVastGrafiek = (props: BudgetVastGrafiekProps) => {

  const { setSnackbarMessage } = useCustomContext();

  if (props.rekening.budgetten.length === 0
    || props.rekening.budgetten.length > 1 ||
    props.rekening.budgetten[0].budgetType.toLowerCase() !== 'periodiek') {
    throw new Error('BudgetVastGrafiek: er moet precies 1 periodiek budget zijn.');
  }

  const budget = props.rekening.budgetten[0];

  const periodeLengte = dayjs(props.periode.periodeEindDatum).diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const maandBudget = budget.budgetPeriodiciteit.toLowerCase() === 'maand' ? budget.bedrag : periodeLengte * budget.bedrag / 7;

  const besteedBinnenBudget = {
    budgetEindeSegment: props.besteedOpPeildatum > maandBudget ? maandBudget : props.besteedOpPeildatum,
    budgetInSegment: props.besteedOpPeildatum > maandBudget ? maandBudget : props.besteedOpPeildatum,
  };
  const meerDanMaandBudget = {
    budgetEindeSegment: props.besteedOpPeildatum > maandBudget ? props.besteedOpPeildatum : 0,
    budgetInSegment: props.besteedOpPeildatum > maandBudget ? props.besteedOpPeildatum - maandBudget : 0
  };
  const restMaandBudget = {
    budgetEindeSegment: maandBudget,
    budgetInSegment: besteedBinnenBudget.budgetEindeSegment <= maandBudget && meerDanMaandBudget.budgetInSegment === 0 ? maandBudget - (besteedBinnenBudget.budgetEindeSegment) : 0
  };

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = Number(maandBudget) + Number(meerDanMaandBudget.budgetInSegment) + 5;

  const toonBudgetToelichtingMessage = () => {
    if (meerDanMaandBudget.budgetInSegment > 0) {
      return `Je hebt precies het gebudgetteerde bedrag voor ${props.peildatum.format('D MMMM')} uitgegevens, namelijk
      ${formatAmount(props.besteedOpPeildatum.toString())}.`;
    }
  }

  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  // console.log('peildatum', JSON.stringify(props.peildatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  // console.log('maandBudget', JSON.stringify(maandBudget));
  // console.log('tabelBreedte', JSON.stringify(tabelBreedte));
  // console.log('dagenInPeriode', JSON.stringify(dagenInPeriode));
  // console.log('budgetOpPeildatum', JSON.stringify(budgetOpPeildatum));
  // console.log('verschilOpPeildatumInWaarde', JSON.stringify(verschilOpPeildatumInWaarde));
  // console.log('verschilOpPeildatumInDagen', JSON.stringify(verschilOpPeildatumInDagen));
  // console.log('budgetDatum', JSON.stringify(budgetDatum));
  // console.log('start', JSON.stringify(start));
  // console.log('besteed', JSON.stringify(besteedBinnenBudget));
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
              {restMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: restMaandBudget.budgetInSegment > 0 ? '2px dotted #333' : 'none' }}
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
              {restMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(restMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: props.rekening.rekeningSoort === RekeningSoort.uitgaven ? '#1977d3' : '#cc0000',
                    borderBottom:  props.rekening.rekeningSoort === RekeningSoort.uitgaven ? '10px solid #1977d3' : '10px solid #cc0000', 
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(restMaandBudget.budgetInSegment.toString())}
                </TableCell>}
              {meerDanMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(meerDanMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: props.rekening.rekeningSoort === RekeningSoort.uitgaven ? '#cc0000' : 'green',
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
                  sx={{ p: 1, fontSize: '10px' }} >
                  {(besteedBinnenBudget.budgetInSegment > 0 && meerDanMaandBudget.budgetInSegment === 0) && props.peildatum.format('D/M')}
                </TableCell>}
              {restMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  align="right"
                  width={`${(restMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderLeft: restMaandBudget.budgetInSegment > 0 ? '2px dotted #333' : 'none' }} >
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
      {props.rekening.rekeningSoort}
    </>
  );
};

export default BudgetVastGrafiek;