import { Betaling } from '../model/Betaling';
import { useEffect, useState, useCallback } from 'react';

import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomContext } from '../context/CustomContext';
import InkomstenUitgavenTabel from '../components/InkomstenUitgavenTabel';
import { Rekening, resultaatRekeningSoorten } from '../model/Rekening';

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

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De betalingen worden opgehaald.</Typography>
  }

  return (
    <>
      <Typography variant='h4'>Inkomsten & uitgaven</Typography>
      {resultaatRekeningen.map(rekening =>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={rekening.naam}
            id={rekening.naam}>
          
            <Typography component="span">{rekening.naam}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <InkomstenUitgavenTabel
              filter={rekening.naam}
              betalingen={betalingen} />
          </AccordionDetails>
        </Accordion>
      )}
        <Accordion>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls='extra'
            id='extra'>
          
            <Typography component="span">Iets anders</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <InkomstenUitgavenTabel
              filter='all'
              isFilterSelectable={true}
              betalingen={betalingen} />
          </AccordionDetails>
        </Accordion>
    </>
  );
}
