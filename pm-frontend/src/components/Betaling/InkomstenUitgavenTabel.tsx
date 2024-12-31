import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Betaling, betalingsSoortFormatter } from '../../model/Betaling';
import { useEffect, useState, Fragment } from 'react';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useCustomContext } from '../../context/CustomContext';
// import { RekeningSoort } from '../../model/Rekening';

interface InUitTabelProps {
  filter: string;
  isFilterSelectable?: boolean ;
  betalingen: Betaling[];
}

export default function InkomstenUitgavenTabel(props: InUitTabelProps) {
  
  const { gebruiker, actieveHulpvrager, rekeningen } = useCustomContext();
  const betalingen = props.betalingen
  const [filter, setFilter] = useState<string>(props.filter)
  const [filteredBetalingen, setFilteredBetalingen] = useState<Betaling[]>([])

  const bedragFormatter = (betaling: Betaling): string => {
    const bedrag = currencyFormatter.format(betaling.bedrag)
    if (betaling.bron?.naam === filter) {
      return '-' + bedrag
    } else {
      return bedrag
    }
  }
  const currencyFormatter = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }
  useEffect(() => {
    const filterBronBestemmingVanBetalingen = betalingen.filter((betaling) => betaling.bron?.naam === filter || betaling.bestemming?.naam == filter || filter === 'all')
    setFilteredBetalingen(filterBronBestemmingVanBetalingen)
  }, [filter, betalingen, setFilteredBetalingen]);

  const handleWeergaveChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  return (
    <>
    { props.isFilterSelectable &&
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Weergave kiezen</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={filter}
          onChange={handleWeergaveChange}
          label="Weergave kiezen">
          <MenuItem value='all'>Alles</MenuItem>
          {rekeningen.map((rekening) => (
            <MenuItem value={rekening.naam}>{rekening.naam}</MenuItem>
          ))}
        </Select>
      </FormControl>
        }
      {filteredBetalingen.length === 0 &&
        <Typography sx={{ mb: '25px' }}>Je ({actieveHulpvrager ? actieveHulpvrager.bijnaam : gebruiker?.bijnaam}) hebt nog geen betalingen geregistreerd.</Typography>
      }
      {filteredBetalingen.length > 0 &&
        <>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell align="right">Bedrag</TableCell>
                  <TableCell>Omschrijving</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Betalingssoort</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Rekening</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Betaalmethode</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBetalingen.map((betaling) => (
                  <Fragment key={betaling.id}>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      aria-haspopup="true"
                    >
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{dateFormatter(betaling["boekingsdatum"])}</TableCell>
                      <TableCell align="right" size='small' sx={{ p: "6px" }}>{bedragFormatter(betaling)}</TableCell>
                      <TableCell align="left" size='small' sx={{ p: "6px" }}>{betaling["omschrijving"]}</TableCell>
                      <TableCell align="left" size='small'  sx={{ display: { xs: 'none', md: 'table-cell' } }}>{betalingsSoortFormatter(betaling["betalingsSoort"]!)}</TableCell>
                      <TableCell align="left" size='small'  sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {betaling["betalingsSoort"] === 'INKOMSTEN' ? betaling["bron"]?.naam : betaling["bestemming"]?.naam}
                      </TableCell>
                      <TableCell align="left" size='small' sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {betaling["betalingsSoort"] === 'INKOMSTEN' ? betaling["bestemming"]?.naam : betaling["bron"]?.naam}
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>}
    </>
  );
}
