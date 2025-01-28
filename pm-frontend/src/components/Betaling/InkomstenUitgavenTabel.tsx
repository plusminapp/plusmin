import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Betaling } from '../../model/Betaling';
import { useEffect, useState, Fragment } from 'react';

import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useCustomContext } from '../../context/CustomContext';
import { currencyFormatter } from '../../model/Betaling'
import { berekenBedragVoorRekenining, Rekening } from '../../model/Rekening';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';

interface InUitTabelProps {
  actueleRekening: Rekening | undefined;
  isFilterSelectable?: boolean;
  betalingen: Betaling[];
  onBetalingBewaardChange: () => void;
}

export default function InkomstenUitgavenTabel(props: InUitTabelProps) {

  const { actieveHulpvrager, gebruiker, rekeningen } = useCustomContext();
  const betalingen = props.betalingen
  const [actueleRekening, setActueleRekening] = useState<Rekening | undefined>(props.actueleRekening)
  const [filteredBetalingen, setFilteredBetalingen] = useState<Betaling[]>([])
  const [selectedBetaling, setSelectedBetaling] = useState<Betaling | null>(null);

  const handleEditClick = (betaling: Betaling) => {
    setSelectedBetaling(betaling);
  };

  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }
  useEffect(() => {
    const filterBetalingenOpBronBestemming = betalingen.filter((betaling) => betaling.bron?.id === actueleRekening?.id || betaling.bestemming?.id == actueleRekening?.id || actueleRekening === undefined)
    setFilteredBetalingen(filterBetalingenOpBronBestemming)
  }, [actueleRekening, betalingen, setFilteredBetalingen]);

  const handleWeergaveChange = (event: SelectChangeEvent) => {
    setActueleRekening(rekeningen.find(r => r.naam === event.target.value))
  };

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
            <MenuItem value='alles'>Alles</MenuItem>
            {rekeningen.map((rekening) => (
              <MenuItem value={rekening.naam}>{rekening.naam}</MenuItem>
            ))}
          </Select>
        </FormControl>
      }
      {filteredBetalingen.length === 0 &&
        <Typography sx={{ mb: '25px' }}>{actieveHulpvrager?.id !== gebruiker?.id ? `${actieveHulpvrager!.bijnaam} heeft` : "Je hebt"} nog geen betalingen geregistreerd{actueleRekening ? ` voor ${actueleRekening.naam}` : ''}.</Typography>
      }
      {filteredBetalingen.length > 0 &&
        <>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "20%" }}>Datum</TableCell>
                  <TableCell sx={{ width: "20%" }} align="right">Bedrag</TableCell>
                  <TableCell sx={{ width: "50%" }}>Omschrijving</TableCell>
                  {/* <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Betaalmethode</TableCell> */}
                  <TableCell sx={{ width: "10%" }}>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBetalingen.map((betaling) => (
                  <Fragment key={betaling.id}>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      aria-haspopup="true"
                    >
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{dateFormatter(betaling["boekingsdatum"]?.toString())}</TableCell>
                      <TableCell align="right" size='small' sx={{ p: "6px" }}>{currencyFormatter.format(berekenBedragVoorRekenining(betaling, actueleRekening))}</TableCell>
                      <TableCell align="left" size='small' sx={{
                        p: "6px", whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "50px"
                      }}>{betaling["omschrijving"]}</TableCell>
                      {/* <TableCell align="left" size='small' sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {betaling["betalingsSoort"] === 'INKOMSTEN' ? betaling["bestemming"]?.naam : betaling["bron"]?.naam}
                      </TableCell> */}
                      <TableCell>
                        <Button onClick={() => handleEditClick(betaling)} sx={{ minWidth: '24px', color: 'grey' }}>
                          <EditIcon fontSize="small" />
                        </Button>
                      </TableCell>
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
        </>
      }
    </>
  );
}