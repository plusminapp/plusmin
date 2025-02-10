import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';

import { aflossenBetalingsSoorten, Betaling, BetalingsSoort, reserverenBetalingsSoorten } from '../../model/Betaling';
import { Fragment, useState } from 'react';

import { useCustomContext } from '../../context/CustomContext';
import { currencyFormatter } from '../../model/Betaling'
import { Button, Typography } from '@mui/material';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';

interface AflossingReserveringTabelProps {
  betalingen: Betaling[];
  isAflossing: boolean;
  onBetalingBewaardChange: () => void;
}

export default function AflossingReserveringTabel(props: AflossingReserveringTabelProps) {

  const { actieveHulpvrager, gebruiker, huidigePeriode } = useCustomContext();
  const betalingsSoorten = props.isAflossing ? aflossenBetalingsSoorten : reserverenBetalingsSoorten
  const betalingen = props.betalingen.filter(betaling => betalingsSoorten.includes(betaling.betalingsSoort))
  const [selectedBetaling, setSelectedBetaling] = useState<Betaling | null>(null);

  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }

  const handleEditClick = (betaling: Betaling) => {
    setSelectedBetaling(betaling);
  };

  const isPeriodeOpen = huidigePeriode?.periodeStatus === 'OPEN' || huidigePeriode?.periodeStatus === 'HUIDIG';

  return (
    <>
      {betalingen.length === 0 &&
        <Typography sx={{ mx: '25px', fontSize: '12px' }}>{actieveHulpvrager?.id !== gebruiker?.id ? `${actieveHulpvrager!.bijnaam} heeft` : "Je hebt"} nog geen betalingen geregistreerd.</Typography>
      }
      {betalingen.length > 0 &&
        <>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ p: "0px" }}>Datum</TableCell>
                  <TableCell sx={{ p: "0 18px 0 0" }} align="right">Bedrag</TableCell>
                  <TableCell sx={{ p: "0px" }}>Omschrijving</TableCell>
                  <TableCell sx={{ p: "0px" }}>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {betalingen.map((betaling) => (
                  <Fragment key={betaling.id}>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      aria-haspopup="true"
                    >
                      <TableCell align="left" size='small' sx={{ p: "0px" }}>{dateFormatter(betaling["boekingsdatum"]?.toString())}</TableCell>
                      <TableCell align="right" size='small' sx={{ p: "0 18px 0 0" }}>
                        {betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ? currencyFormatter.format(betaling.bedrag) : currencyFormatter.format(-betaling.bedrag)}
                      </TableCell>
                      <TableCell align="left" size='small' sx={{ p: "0px" }}>{betaling["omschrijving"]}</TableCell>
                      {/* <TableCell align="left" size='small' sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {betaling["betalingsSoort"] === 'BESTEDEN_RESERVERING' ? `${betaling.bestemming?.naam} met ${betaling.bron?.naam} `: betaling["bron"]?.naam}
                      </TableCell> */}
                      {isPeriodeOpen &&
                        <TableCell>
                          <Button onClick={() => handleEditClick(betaling)} sx={{ minWidth: '24px', color: 'grey' }}>
                            <EditIcon fontSize="small" />
                          </Button>
                        </TableCell>
                      }
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {selectedBetaling &&
            <UpsertBetalingDialoog
              onBetalingBewaardChange={props.onBetalingBewaardChange}
              editMode={true}
              betaling={{ ...selectedBetaling, bron: selectedBetaling.bron?.naam, bestemming: selectedBetaling.bestemming?.naam }}
            />
          }
        </>}
    </>
  );
}
