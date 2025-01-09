import { aflossenBetalingsSoorten, aflossenReserverenBetalingsSoorten, Betaling, currencyFormatter, reserverenBetalingsSoorten } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomContext } from '../context/CustomContext';
import InkomstenUitgavenTabel from '../components/Betaling/InkomstenUitgavenTabel';
import { berekenBedragVoorRekenining, Rekening, RekeningSoort } from '../model/Rekening';
import NieuweBetalingDialoog from '../components/Betaling/NieuweBetalingDialoog';
import AflossingReserveringTabel from '../components/Betaling/AflossingReserveringTabel';

export default function InkomstenUitgaven() {
  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager, rekeningen } = useCustomContext();

  const [betalingen, setBetalingen] = useState<Betaling[]>([])
  const [isLoading, setIsLoading] = useState(false);

  const uitgaveRekeningen: Rekening[] = rekeningen.filter(rekening => rekening.rekeningSoort == RekeningSoort.uitgaven)
  const inkomstenRekeningen: Rekening[] = rekeningen.filter(rekening => rekening.rekeningSoort == RekeningSoort.inkomsten)

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

  const berekenAflossingReserveringTotaal = () => {
    return betalingen
      .filter((betaling) => aflossenReserverenBetalingsSoorten.includes(betaling.betalingsSoort))
      .reduce((acc, betaling) => (acc - betaling.bedrag), 0)
  }

  const heeftAflossenBetalingen = () => {
    return betalingen.find((betaling) => aflossenBetalingsSoorten.includes(betaling.betalingsSoort))
  }

  const heeftReserverenBetalingen = () => {
    return betalingen.find((betaling) => reserverenBetalingsSoorten.includes(betaling.betalingsSoort))
  }

  const aflossenReserverenLabel = () => {
    const words = new Array<string | undefined>();
    words[0] = heeftAflossenBetalingen() ? "aflossen" : undefined
    words[1] = heeftReserverenBetalingen() ? "reserveren" : undefined
    const label = words.filter(Boolean).join('/')
    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De betalingen worden opgehaald.</Typography>
  }

  const onChange = () => {
    fetchBetalingen()
  }

  return (
    <>
      <Typography variant='h4'>Inkomsten & uitgaven</Typography>
      <NieuweBetalingDialoog
        nieuweBetalingOpgeslagen={0}
        onChange={onChange} />
      <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
        <Grid size={{ xs: 1, lg: 6 }}>
          {inkomstenRekeningen.map(rekening =>
            <Grid >
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

        </Grid>
        <Grid size={{ xs: 1, lg: 6 }}>
          {uitgaveRekeningen.map(rekening =>
            <Grid >
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
          {(heeftReserverenBetalingen() || heeftAflossenBetalingen()) &&
            <Grid >
              <Accordion >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls='extra'
                  id='extra'>
                  <Typography component="span">{aflossenReserverenLabel()} {currencyFormatter.format(berekenAflossingReserveringTotaal())}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <AflossingReserveringTabel
                    betalingen={betalingen} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          }
        </Grid>

        <Grid size={{ xs: 1, lg: 6 }}>
          <Grid >
            <Accordion >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls='extra'
                id='extra'>
                <Typography component="span">Kies een eigen weergave </Typography>
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
      </Grid>
    </>
  );
}
