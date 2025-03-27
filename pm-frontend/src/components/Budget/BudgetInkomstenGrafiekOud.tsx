import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { InfoIcon } from '../../icons/Info';
import { useCustomContext } from '../../context/CustomContext';
import { Rekening, RekeningSoort } from '../../model/Rekening';

type BudgetInkomstenGrafiekProps = {
  peildatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  ontvangenOpPeildatum: number;
};

export const BudgetInkomstenGrafiek = (props: BudgetInkomstenGrafiekProps) => {

  const { setSnackbarMessage } = useCustomContext();

  if (props.rekening.rekeningSoort.toLowerCase() !== RekeningSoort.inkomsten.toLowerCase() ||
    props.rekening.budgetten.length === 0  ||
    props.rekening.budgetten.some(budget => budget.betaalDag === undefined) ||
    props.rekening.budgetten.some(budget => (budget?.betaalDag ?? 0) < 1) ||
    props.rekening.budgetten.some(budget => (budget?.betaalDag ?? 30) > 28)) {
    throw new Error('BudgetInkomstenGrafiek: rekeningSoort moet \'inkomsten\' zijn, er moet minimaal 1 budget zijn en alle budgetten moeten een geldige betaalDag hebben.');
  }

  const budget = props.rekening.budgetten[0];

  const maandBudget = props.rekening.budgetten.reduce((acc, budget) => (acc + budget.bedrag), 0)
  const inkomstenMoetBetaaldZijn = budget.betaalDag && (props.peildatum.date() < dayjs(props.periode.periodeStartDatum).date() ||
    props.peildatum.date() > budget.betaalDag);
  const budgetOpPeildatum = props.rekening.budgetten.reduce((acc, budget) => (acc + (inkomstenMoetBetaaldZijn ? budget.bedrag : 0)), 0);


  // const periodeLengte = dayjs(props.periode.periodeEindDatum).diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  // const maandBudget = budget.budgetPeriodiciteit.toLowerCase() === 'maand' ? budget.bedrag : periodeLengte * budget.bedrag / 7;

  const ontvangenBinnenBudget = {
    budgetEindeSegment: props.ontvangenOpPeildatum > maandBudget ? maandBudget : props.ontvangenOpPeildatum,
    budgetInSegment: props.ontvangenOpPeildatum > maandBudget ? maandBudget : props.ontvangenOpPeildatum,
  };
  const meerDanMaandBudget = {
    budgetEindeSegment: props.ontvangenOpPeildatum > maandBudget ? props.ontvangenOpPeildatum : 0,
    budgetInSegment: props.ontvangenOpPeildatum > maandBudget ? props.ontvangenOpPeildatum - maandBudget : 0
  };
  const restMaandBudget = {
    budgetEindeSegment: maandBudget,
    budgetInSegment: ontvangenBinnenBudget.budgetEindeSegment <= maandBudget && meerDanMaandBudget.budgetInSegment === 0 ? maandBudget - (ontvangenBinnenBudget.budgetEindeSegment) : 0
  };

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = Number(maandBudget) + Number(meerDanMaandBudget.budgetInSegment) + 5;

  const toonBudgetToelichtingMessage = () => {
    if (meerDanMaandBudget.budgetInSegment > 0) {
      return `Je hebt precies het gebudgetteerde bedrag voor ${props.peildatum.format('D MMMM')} uitgegevens, namelijk
      ${formatAmount(props.ontvangenOpPeildatum.toString())}.`;
    }
  }

  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  // console.log('peildatum', JSON.stringify(props.peildatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  console.log('maandBudget', JSON.stringify(maandBudget));
  console.log('budgetOpPeildatum', JSON.stringify(budgetOpPeildatum));
  // console.log('tabelBreedte', JSON.stringify(tabelBreedte));
  // console.log('dagenInPeriode', JSON.stringify(dagenInPeriode));
  // console.log('budgetOpPeildatum', JSON.stringify(budgetOpPeildatum));
  // console.log('verschilOpPeildatumInWaarde', JSON.stringify(verschilOpPeildatumInWaarde));
  // console.log('verschilOpPeildatumInDagen', JSON.stringify(verschilOpPeildatumInDagen));
  // console.log('budgetDatum', JSON.stringify(budgetDatum));
  // console.log('start', JSON.stringify(start));
  // console.log('ontvangen', JSON.stringify(ontvangenBinnenBudget));
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
              {ontvangenBinnenBudget.budgetInSegment > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px' }}
                  align="right"
                  width={`${(ontvangenBinnenBudget.budgetInSegment / tabelBreedte) * 90}%`}
                >
                  {formatAmount(ontvangenBinnenBudget.budgetEindeSegment.toString())}
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
              {ontvangenBinnenBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(ontvangenBinnenBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(ontvangenBinnenBudget.budgetInSegment.toString())}
                </TableCell>}
              {restMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(restMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: props.rekening.rekeningSoort === RekeningSoort.uitgaven.toLowerCase() || !inkomstenMoetBetaaldZijn ? '#1977d3' : '#cc0000',
                    borderBottom: props.rekening.rekeningSoort === RekeningSoort.uitgaven.toLowerCase() || !inkomstenMoetBetaaldZijn ? '10px solid #1977d3' : '10px solid #cc0000',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(restMaandBudget.budgetInSegment.toString())}
                </TableCell>}
              {meerDanMaandBudget.budgetInSegment > 0 &&
                <TableCell
                  width={`${(meerDanMaandBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: props.rekening.rekeningSoort === RekeningSoort.uitgaven.toLowerCase() ? '#cc0000' : 'green',
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
              {ontvangenBinnenBudget.budgetInSegment > 0 &&
                <TableCell
                  align="right"
                  width={`${(ontvangenBinnenBudget.budgetInSegment / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px' }} >
                  {(ontvangenBinnenBudget.budgetInSegment > 0 && meerDanMaandBudget.budgetInSegment === 0) && props.peildatum.format('D/M')}
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
    </>
  );
};

export default BudgetInkomstenGrafiek;