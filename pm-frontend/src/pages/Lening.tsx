import { useAuthContext } from "@asgardeo/auth-react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";

import { useCallback, useEffect, useState } from "react";
import { useCustomContext } from "../context/CustomContext";

import { Lening } from '../model/Lening'
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import LeningTabel from "../components/LeningTabel";

export default function Leningen() {

  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager } = useCustomContext();

  const [leningen, setLeningen] = useState<Lening[]>([])
  const [isLoading, setIsLoading] = useState(false);


  const fetchLeningen = useCallback(async () => {
    if (gebruiker) {
      setIsLoading(true);
      const datum = new Date().toISOString().slice(0, 10);
      const token = await getIDToken();
      const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
      const response = await fetch(`/api/v1/lening/hulpvrager/${id}/datum/${datum}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setIsLoading(false);
      if (response.ok) {
        const result = await response.json();
        setLeningen(result);
      } else {
        console.error("Failed to fetch data", response.status);
      }
    }
  }, [getIDToken, actieveHulpvrager, gebruiker]);

  useEffect(() => {
    fetchLeningen();
  }, [fetchLeningen]);

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De leningen worden opgehaald.</Typography>
  }

  return (
    <>
    {leningen.length > 0 &&
      <Typography variant='h4'>Schulden/leningen pagina</Typography>
    }
    {leningen.length === 0 &&
      <Typography variant='h4'>{actieveHulpvrager?.bijnaam} heeft geen schulden/leningen ingericht.</Typography>
    }
    {leningen.map(lening =>
              <Accordion 
              elevation={0}
              defaultExpanded={true}>
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                  aria-controls={lening.rekeningNaam}
                  id={lening.rekeningNaam}>
                  <Typography component="span">{lening.rekeningNaam} op {lening.leningSaldiDTO.peilDatum}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <LeningTabel lening={lening}/>
                </AccordionDetails>
              </Accordion>
          )}
    </>
  )
}

