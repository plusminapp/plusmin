import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { BetalingDTO, currencyFormatter } from '../../model/Betaling';
import { useEffect, useState, Fragment } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useCustomContext } from '../../context/CustomContext';
import { berekenBedragVoorRekenining, Rekening } from '../../model/Rekening';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';
import dayjs from 'dayjs';

interface InUitTabelProps {
  actueleRekening: Rekening | undefined;
  isFilterSelectable?: boolean;
  betalingen: BetalingDTO[];
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
}

export default function InkomstenUitgavenTabel(props: InUitTabelProps) {

  const { actieveHulpvrager, gebruiker, rekeningen, gekozenPeriode } = useCustomContext();
  const betalingen = props.betalingen
  const [actueleRekening, setActueleRekening] = useState<Rekening | undefined>(props.actueleRekening)
  const [filteredBetalingen, setFilteredBetalingen] = useState<BetalingDTO[]>([])
  const [selectedBetaling, setSelectedBetaling] = useState<BetalingDTO | undefined>(undefined);

  const handleEditClick = (betaling: BetalingDTO) => {
    setSelectedBetaling(betaling);
  };

  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }
  useEffect(() => {
    const filterBetalingenOpBronBestemming = betalingen.filter((betaling) => betaling.bron === actueleRekening?.naam || betaling.bestemming === actueleRekening?.naam || actueleRekening === undefined)
    setFilteredBetalingen(filterBetalingenOpBronBestemming)
  }, [actueleRekening, betalingen, setFilteredBetalingen]);

  const handleWeergaveChange = (event: SelectChangeEvent) => {
    setActueleRekening(rekeningen.find(r => r.naam === event.target.value))
  };

  const onUpsertBetalingClose = () => {
    setSelectedBetaling(undefined);
  };

  const isPeriodeOpen = gekozenPeriode?.periodeStatus === 'OPEN' || gekozenPeriode?.periodeStatus === 'HUIDIG';

  return (
    <>
      {props.isFilterSelectable &&
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">Weergave kiezen</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={actueleRekening ? actueleRekening.naam : 'alles'}
            onChange={handleWeergaveChange}
            label="Weergave kiezen">
            <MenuItem value='alles'>Alle betalingen</MenuItem>
            {rekeningen.map((rekening) => (
              <MenuItem value={rekening.naam}>{rekening.naam}</MenuItem>
            ))}
          </Select>
        </FormControl>
      }
      {filteredBetalingen.length === 0 &&
        <Typography sx={{ mx: '25px', fontSize: '12px' }}>{actieveHulpvrager?.id !== gebruiker?.id ? `${actieveHulpvrager!.bijnaam} heeft` : "Je hebt"} nog geen betalingen geregistreerd{actueleRekening ? ` voor ${actueleRekening.naam}` : ''}.</Typography>
      }
      {filteredBetalingen.length > 0 &&
        <>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ width: "20%", p: "5px" }}>Datum</TableCell>
                  <TableCell sx={{ width: "20%", p: "0 18px 0 5px" }} align="right">Bedrag</TableCell>
                  <TableCell sx={{ width: "50%", p: "5px" }}>Omschrijving</TableCell>
                  {/* <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Betaalmethode</TableCell> */}
                  <TableCell sx={{ width: "10%", p: "5px" }}>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBetalingen
                  .sort((a, b) => dayjs(a.boekingsdatum).isAfter(dayjs(b.boekingsdatum)) ? -1 : 1)
                  .map((betaling) => (
                    <Fragment key={betaling.id}>
                      <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        aria-haspopup="true"
                      >
                        <TableCell align="left" size='small' sx={{ p: "5px" }}>{dateFormatter(betaling["boekingsdatum"]?.toString())}</TableCell>
                        <TableCell align="right" size='small' sx={{ p: "0 18px 0 0" }}>{currencyFormatter.format(berekenBedragVoorRekenining(betaling, actueleRekening))}</TableCell>
                        <TableCell align="left" size='small' sx={{
                          p: "5px", whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "50px"
                        }}>{betaling["omschrijving"]}</TableCell>
                        {/* <TableCell align="left" size='small' sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {betaling["betalingsSoort"] === 'INKOMSTEN' ? betaling["bestemming"]?.naam : betaling["bron"]?.naam}
                      </TableCell> */}
                        {isPeriodeOpen &&
                          <TableCell size='small' sx={{ p: "5px" }}>
                            <Button onClick={() => handleEditClick(betaling)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
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
              onUpsertBetalingClose={onUpsertBetalingClose}
              onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
              onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)}
              editMode={true}
              betaling={{ ...selectedBetaling, bron: selectedBetaling.bron, bestemming: selectedBetaling.bestemming }}
            />
          }
        </>
      }
    </>
  );
}