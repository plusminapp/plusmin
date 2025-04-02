import { Box, FormControlLabel, FormGroup, Switch, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { dagInPeriode, Periode } from '../../model/Periode';
import { useState } from 'react';
import { AflossingDTO, ExtendedAflossingDTO } from '../../model/Aflossing';
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';

type AflossingGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  aflossingen: AflossingDTO[];
};

export const AflossingGrafiek = (props: AflossingGrafiekProps) => {

  const [toonaflossingVastDetails, setToonaflossingVastDetails] = useState<boolean>(localStorage.getItem('toonaflossingDetails') === 'true');
  const handleToonaflossingVastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonaflossingDetails', event.target.checked.toString());
    setToonaflossingVastDetails(event.target.checked);
  };

  if (props.aflossingen.length === 0 ||
    props.aflossingen.some(aflossing => aflossing.betaalDag === undefined) ||
    props.aflossingen.some(aflossing => (aflossing?.betaalDag ?? 0) < 1) ||
    props.aflossingen.some(aflossing => (aflossing?.betaalDag ?? 30) > 28)) {
    throw new Error('aflossingVastGrafiek: rekeningSoort moet \'aflossing\' zijn, er moet minimaal 1 aflossing zijn en alle aflossingen moeten een geldige betaalDag hebben.');
  }

  const aflossingMoetBetaaldZijn = (betaalDag: number | undefined) => {
    if (betaalDag === undefined) return true;
    const betaalDagInPeriode = dagInPeriode(betaalDag, props.periode);
    return betaalDagInPeriode.isBefore(props.peilDatum) || betaalDagInPeriode.isSame(props.peilDatum);
  }
  const extendedAflossingDTO = props.aflossingen.map((aflossing) => (
    {
      ...aflossing,
      aflossingMoetBetaaldZijn: aflossingMoetBetaaldZijn(aflossing.betaalDag),
      actueleStand: aflossing.saldoStartPeriode ?? 0 + (aflossing.aflossingBetaling ?? 0),
      actueleAchterstand: (aflossing.deltaStartPeriode ?? 0) + (aflossing.aflossingBetaling ?? 0) - (aflossingMoetBetaaldZijn(aflossing.betaalDag) ?  (aflossing.aflossingsBedrag ?? 0) : 0),
      meerDanVerwacht: aflossingMoetBetaaldZijn(aflossing.betaalDag) ? 0 : Math.min((aflossing.aflossingBetaling ?? 0), aflossing.aflossingsBedrag),
      minderDanVerwacht: aflossingMoetBetaaldZijn(aflossing.betaalDag) ? Math.max(0, aflossing.aflossingsBedrag - (aflossing.aflossingBetaling ?? 0)) : 0,
      meerDanMaandAflossing: Math.max(0, (aflossing.aflossingBetaling ?? 0) - aflossing.aflossingsBedrag)
    } as ExtendedAflossingDTO));

  const maandaflossing = extendedAflossingDTO.reduce((acc, aflossing) => (acc + Number(aflossing.aflossingsBedrag)), 0)

  const betaaldOpPeilDatum = extendedAflossingDTO.reduce((acc, aflossing) => (acc + (aflossing.aflossingBetaling ?? 0)), 0);

  const betaaldBinnenaflossing = extendedAflossingDTO.reduce((acc, aflossing) =>
    (acc + (aflossingMoetBetaaldZijn(aflossing.betaalDag) ? Math.min(aflossing.aflossingsBedrag, aflossing.aflossingBetaling ?? 0) : 0)), 0);

  const minderDanVerwacht = extendedAflossingDTO.reduce((acc, aflossing) => {
    const verschil = aflossingMoetBetaaldZijn(aflossing.betaalDag) ? Math.max(0, aflossing.aflossingsBedrag - (aflossing.aflossingBetaling ?? 0)) : 0;
    console.log(`Verwerk aflossing: ${JSON.stringify(aflossing.rekening.naam)}, aflossingsBedrag : ${aflossing.aflossingsBedrag }, betaling : ${aflossing.aflossingBetaling}, verschil : ${verschil}`);
    return acc + verschil;
  }, 0);

  const meerDanVerwacht = extendedAflossingDTO.reduce((acc, aflossing) =>
    acc + (aflossingMoetBetaaldZijn(aflossing.betaalDag) ? 0 : Math.min(aflossing.aflossingBetaling ?? 0, aflossing.aflossingsBedrag)), 0);

  const meerDanMaandaflossing = extendedAflossingDTO.reduce((acc, aflossing) =>
    (acc + Math.max(0, (aflossing.aflossingBetaling ?? 0) - aflossing.aflossingsBedrag)), 0);

  const restMaandaflossing = extendedAflossingDTO.reduce((acc, aflossing) =>
    (acc + (aflossingMoetBetaaldZijn(aflossing.betaalDag) ? 0 : Math.max(0, aflossing.aflossingsBedrag - (aflossing.aflossingBetaling ?? 0)))), 0);


  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = maandaflossing + meerDanMaandaflossing + 5;

  const berekenToestandVastIcoon = (aflossing: ExtendedAflossingDTO): JSX.Element => {
    if (aflossing.meerDanVerwacht === 0 && aflossing.minderDanVerwacht === 0 && aflossing.meerDanMaandAflossing === 0) {
      if (!aflossing.aflossingMoetBetaaldZijn)
        return <PlusIcon color="#1977d3" height={18} />
      else return <PlusIcon color="#green" height={18} />
    }
    if (aflossing.minderDanVerwacht > 0) return <MinIcon color="red" height={18} />
    if (aflossing.meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={18} />
    if (aflossing.meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={18} />
    return <PlusIcon color="black" />
  }

  console.log('----------------------------------------------');
  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  // console.log('peilDatum', JSON.stringify(props.peilDatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  console.log('aflossingen', JSON.stringify(extendedAflossingDTO));
  console.log('maandaflossing', JSON.stringify(maandaflossing));
  console.log('betaaldOpPeilDatum', JSON.stringify(betaaldOpPeilDatum));
  console.log('betaaldBinnenaflossing', JSON.stringify(betaaldBinnenaflossing));
  console.log('minderDanVerwacht', JSON.stringify(minderDanVerwacht));
  console.log('meerDanVerwacht', JSON.stringify(meerDanVerwacht));
  console.log('restMaandaflossing', JSON.stringify(restMaandaflossing));
  console.log('meerDanMaandaflossing', JSON.stringify(meerDanMaandaflossing));

  return (
    <>
      <Grid display={'flex'} direction={'row'} alignItems={'center'}>
        <Typography variant='body2'>
          <strong>Alossingen</strong>
        </Typography>
        {extendedAflossingDTO.length >= 1 &&
          <FormGroup >
            <FormControlLabel control={
              <Switch
                sx={{ transform: 'scale(0.6)' }}
                checked={toonaflossingVastDetails}
                onChange={handleToonaflossingVastChange}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />}
              sx={{ mr: 0 }}
              label={
                <Box display="flex" fontSize={'0.875rem'} >
                  Toon aflossing details
                </Box>
              } />
          </FormGroup>}
      </Grid>
      {toonaflossingVastDetails &&
        <Grid alignItems={'center'}>
          {extendedAflossingDTO.map((aflossing, index) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {berekenToestandVastIcoon(aflossing)}
              <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                {aflossing.rekening.naam}: {formatAmount(aflossing.aflossingsBedrag.toString())}, betaaldag {aflossing.betaalDag && dagInPeriode(aflossing.betaalDag, props.periode).format('D MMMM')},&nbsp;
                waarvan {formatAmount(aflossing.aflossingBetaling?.toString() ?? "nvt")} is betaald; dit is
                {aflossing.meerDanVerwacht === 0 && aflossing.minderDanVerwacht === 0 && aflossing.meerDanMaandAflossing === 0 && ' zoals verwacht'}
                {[aflossing.meerDanVerwacht > 0 && ' eerder dan verwacht',
                aflossing.minderDanVerwacht > 0 && ` ${formatAmount(aflossing.minderDanVerwacht.toString())} minder dan verwacht`,
                aflossing.meerDanMaandAflossing > 0 && ` ${formatAmount(aflossing.meerDanMaandAflossing.toString())} meer dan verwacht`
                ].filter(Boolean).join(' en ')}.
              </Typography>
            </Box>
          ))}
        </Grid>}
      <TableContainer >
        <Table>
          <TableBody>

            <TableRow>
              <TableCell width={'5%'} />
              {betaaldBinnenaflossing > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanVerwacht === 0 && meerDanMaandaflossing === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(betaaldBinnenaflossing / tabelBreedte) * 90}%`}
                />}
              {meerDanVerwacht > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandaflossing === 0 ? '2px dotted #333' : 'none', }}
                  align="right"
                  width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenaflossing + meerDanVerwacht).toString())}
                </TableCell>}
              {meerDanMaandaflossing > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                  align="right"
                  width={`${(meerDanMaandaflossing / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenaflossing + meerDanVerwacht + meerDanMaandaflossing).toString())}
                </TableCell>}
              {minderDanVerwacht > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px' }}
                  align="right"
                  width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenaflossing + meerDanVerwacht + meerDanMaandaflossing + minderDanVerwacht).toString())}
                </TableCell>}
              {restMaandaflossing > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanVerwacht === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(restMaandaflossing / tabelBreedte) * 90}%`}
                >
                  {formatAmount((betaaldBinnenaflossing + meerDanVerwacht + minderDanVerwacht + meerDanMaandaflossing + restMaandaflossing).toString())}
                </TableCell>}
              {restMaandaflossing === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell />}
            </TableRow>

            <TableRow>
              <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
              {betaaldBinnenaflossing > 0 &&
                <TableCell
                  width={`${(betaaldBinnenaflossing / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(betaaldBinnenaflossing.toString())}
                </TableCell>}
              {meerDanVerwacht > 0 &&
                <TableCell
                  width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'lightGreen',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanVerwacht.toString())}
                </TableCell>}
              {meerDanMaandaflossing > 0 &&
                <TableCell
                  width={`${(meerDanMaandaflossing / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'orange',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanMaandaflossing.toString())}
                </TableCell>}
              {minderDanVerwacht > 0 &&
                <TableCell
                  width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'red',
                    borderBottom: '10px solid red',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(minderDanVerwacht.toString())}
                </TableCell>}
              {restMaandaflossing > 0 &&
                <TableCell
                  width={`${(restMaandaflossing / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: '10px solid #1977d3',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(restMaandaflossing.toString())}
                </TableCell>}
              {restMaandaflossing === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
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
              {betaaldBinnenaflossing > 0 &&
                <TableCell
                  align="right"
                  width={`${(betaaldBinnenaflossing / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanVerwacht === 0 && meerDanMaandaflossing === 0 ? '2px dotted #333' : 'none' }} >
                  {meerDanVerwacht === 0 && meerDanMaandaflossing === 0 && props.peilDatum.format('D/M')}
                </TableCell>}
              {meerDanVerwacht > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandaflossing === 0 ? '2px dotted #333' : 'none', }} >
                  {meerDanMaandaflossing === 0 && props.peilDatum.format('D/M')}
                </TableCell>}
              {meerDanMaandaflossing > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanMaandaflossing / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }} >
                  {props.peilDatum.format('D/M')}
                </TableCell>}
              {minderDanVerwacht > 0 &&
                <TableCell
                  align="right"
                  width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px' }}>
                  {props.peilDatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum && props.peilDatum.format('D/M')}
                </TableCell>}
              {restMaandaflossing > 0 &&
                <TableCell
                  align="right"
                  width={`${(restMaandaflossing / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanVerwacht === 0 ? '2px dotted #333' : 'none' }} >
                  {dayjs(props.periode.periodeEindDatum).format('D/M')}
                </TableCell>}
              {restMaandaflossing === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
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

export default AflossingGrafiek;