import { Betaling, currencyFormatter } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomContext } from '../context/CustomContext';
import InkomstenUitgavenTabel from '../components/Betaling/InkomstenUitgavenTabel';
import { Rekening, resultaatRekeningSoorten } from '../model/Rekening';
import NieuweBetalingDialoog from '../components/Betaling/NieuweBetalingDialoog';

export const berekenBedragVoorRekenining = (betaling: Betaling, rekening: Rekening | undefined) => {
  if (rekening === undefined) return betaling.bedrag // filter = 'all'
  const factor = resultaatRekeningSoorten.includes(rekening.rekeningSoort) ? -1 : 1
  if (betaling.bron?.id === rekening.id) return -betaling.bedrag * factor
  if (betaling.bestemming?.id === rekening.id) return betaling.bedrag * factor
  return 0
}

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, rekeningen } = useCustomContext();

  const [betalingen, setBetalingen] = useState<Betaling[]>([])
  const [isLoading, setIsLoading] = useState(false);

  const resultaatRekeningen: Rekening[] = rekeningen.filter(rekening => resultaatRekeningSoorten.includes(rekening.rekeningSoort))

  const fetchBetalingen = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}?size=-1`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setBetalingen(result.data.content);
      } else {
        console.error("Failed to fetch data", response.status);
      }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker]);

  useEffect(() => {
    fetchBetalingen();
  }, [fetchBetalingen]);


  const berekenRekeningTotaal = (rekening: Rekening) => {
    return betalingen.reduce((acc, betaling) => (acc + berekenBedragVoorRekenining(betaling, rekening)), 0)
  }

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De betalingen worden opgehaald.</Typography>
  }

  return (
    <>
      <Typography variant='h4'>Inkomsten & uitgaven</Typography>
      <NieuweBetalingDialoog />
      <Grid container spacing={{ xs: 0, md: 3 }} columns={{ xs: 1, lg: 6 }}>
        {resultaatRekeningen.map(rekening =>
          <Grid size={{ xs: 1, lg: 3 }}>
            <Accordion >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={rekening.naam}
                id={rekening.naam}>
                <Typography component="span">{rekening.naam}: {currencyFormatter.format(berekenRekeningTotaal(rekening))}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <InkomstenUitgavenTabel
                  actueleRekening={rekening}
                  betalingen={betalingen} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
        <Grid size={{ xs: 1, lg: 3 }}>

          <Accordion >
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls='extra'
              id='extra'>
              <Typography component="span">Iets anders</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <InkomstenUitgavenTabel
                actueleRekening={undefined}
                isFilterSelectable={true}
                betalingen={betalingen} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
}
