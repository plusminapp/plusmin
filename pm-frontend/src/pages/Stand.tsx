import { Typography } from "@mui/material";
import Saldi from "../components/Saldi";
import { useEffect, useState } from 'react';

import { RekeningSaldi } from "../model/Saldi";
import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";

export default function Stand() {

  const [openingsBalans, setOpeningsBalans] = useState<RekeningSaldi | undefined>(undefined)
  const [balansOpDatum, setBalansOpDatum] = useState<RekeningSaldi | undefined>(undefined)
  const [resultaatOpDatum, setResultaatOpDatum] = useState<RekeningSaldi | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);

  const { getIDToken } = useAuthContext();
  const { gebruiker, actieveHulpvrager } = useCustomContext();


  useEffect(() => {
    const fetchSaldi = async () => {
      if (gebruiker) {
        setIsLoading(true);
        const datum = new Date().toISOString().slice(0, 10);
        const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
        const token = await getIDToken();
        const response = await fetch(`/api/v1/saldi/hulpvrager/${id}/stand/${datum}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setOpeningsBalans(result.openingsBalans)
          setBalansOpDatum(result.balansOpDatum)
          setResultaatOpDatum(result.resultaatOpDatum)
        } else {
          console.error("Failed to fetch data", response.status);
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, gebruiker, getIDToken]);


  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  }

  return (
    <>
      { openingsBalans !== undefined &&
        <>
          <Typography variant='h4'>Hoe staan we ervoor?</Typography>
          <Saldi title={'Opening'} saldi={openingsBalans!} />
          <Saldi title={'Stand per'} saldi={balansOpDatum!} />
          <Saldi title={'Resultaat per'} saldi={resultaatOpDatum!} />
        </>
        }
    </>
  )
}