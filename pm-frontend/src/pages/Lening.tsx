import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  TextField,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BetalingDTO, BetalingsSoort } from '../model/Betaling';
import BetalingsSoortSelect from '../components/Betaling/BetalingsSoortSelect';
import { useCustomContext } from '../context/CustomContext';
import { useAuthContext } from '@asgardeo/auth-react';

const SaveBetaling = () => {
  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gebruiker, betalingsSoorten2Rekeningen } = useCustomContext();

  const rekeningPaar = betalingsSoorten2Rekeningen.get(BetalingsSoort.uitgaven)

  const initialBetalingDTO = {
    id: 0,
    boekingsdatum: dayjs(),
    bedrag: 0,
    omschrijving: '',
    betalingsSoort: BetalingsSoort.uitgaven,
    bron: rekeningPaar?.bron.sort((a,b) => a.sortOrder > b.sortOrder ? 1 : -1)[0].naam,
    bestemming: rekeningPaar?.bestemming.sort((a,b) => a.sortOrder > b.sortOrder ? 1 : -1)[0].naam
  }

  const [betalingDTO, setBetalingDTO] = useState<BetalingDTO>(initialBetalingDTO);

  const handleInputChange = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]) => {
    setBetalingDTO({ ...betalingDTO, [key]: value })
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    try {
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            ...betalingDTO,
            boekingsdatum: betalingDTO.boekingsdatum.format('YYYYMMDD'),
          }]),
      })
      if (response.ok) {
        setBetalingDTO(initialBetalingDTO);
      } else {
        console.error("Failed to fetch data", response.status);
      }
    } catch (error) {
      console.error('Fout bij opslaan betaling:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container component="div" spacing={2}>
        <Grid>
          <TextField
            fullWidth
            type="date"
            label="Boekingsdatum"
            value={betalingDTO.boekingsdatum.format('YYYY-MM-DD')}
            onChange={(e) => handleInputChange('boekingsdatum', dayjs(e.target.value))}
          />
        </Grid>
        <Grid >
          <TextField
            fullWidth
            type="number"
            label="Bedrag"
            value={betalingDTO.bedrag}
            onChange={(e) => handleInputChange('bedrag', parseFloat(e.target.value))}
          />
        </Grid>
        <Grid >
          <TextField
            fullWidth
            type="text"
            label="Omschrijving"
            value={betalingDTO.omschrijving || ''}
            onChange={(e) => handleInputChange('omschrijving', e.target.value)}
          />
        </Grid>
        <Grid >
          <BetalingsSoortSelect
            betalingsSoort={betalingDTO.betalingsSoort}
            bron={betalingDTO.bron}
            bestemming={betalingDTO.bestemming}
            onChange={(betalingsSoort, bron, bestemming) => {
              console.log(`in SaveBetaling setbetaling ${betalingsSoort}, ${bron}, ${bestemming}`)
              setBetalingDTO({ ...betalingDTO, betalingsSoort, bron, bestemming })
            }}
          />
        </Grid>
        <Grid >
          <Button type="submit" variant="contained" color="primary">
            Opslaan
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default SaveBetaling;
