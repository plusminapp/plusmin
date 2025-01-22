import { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { BetalingsSoort, betalingsSoortFormatter } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';

type BetalingsSoortSelectProps = {
    betalingsSoort: BetalingsSoort | undefined;
    bron: string | undefined;
    bestemming: string | undefined;
    onBetalingsSoortChange: (betalingsSoort: BetalingsSoort | undefined, bron: string | undefined, bestemming: string | undefined) => void;
};

const BetalingsSoortSelectAlternatief = (props: BetalingsSoortSelectProps) => {
    const { betalingsSoorten2Rekeningen } = useCustomContext();
    const rekeningPaar = props.betalingsSoort ? betalingsSoorten2Rekeningen.get(props.betalingsSoort) : undefined;

    const [selectedBetalingsSoort, setSelectedBetalingsSoort] = useState<BetalingsSoort | undefined>(props.betalingsSoort);
    const [selectedBronRekening, setSelectedBronRekening] = useState<string | undefined>(props.bron);
    const [selectedBestemmingRekening, setSelectedBestemmingRekening] = useState<string | undefined>(props.bestemming);

    useEffect(() => {
        setSelectedBetalingsSoort(props.betalingsSoort);
        setSelectedBronRekening(props.bron);
        setSelectedBestemmingRekening(props.bestemming);
    }, [props.betalingsSoort, props.bron, props.bestemming]);

    const handleAccordionChange = (betalingsSoort: BetalingsSoort) => {
        console.log("in handleBetalingsSoortChange: selectedBetalingsSoort: ", selectedBetalingsSoort, " betalingsSoort: ", betalingsSoort, " selectedBetalingsSoort === betalingsSoort: ", selectedBetalingsSoort === betalingsSoort)
        if (selectedBetalingsSoort?.toString() === betalingsSoort.toString()) {
            console.log("in handleBetalingsSoortChange selectedBetalingsSoort === betalingsSoort")
            setSelectedBetalingsSoort(undefined);
        } else {
            const newBetalingsSoort = betalingsSoort;
            const newBron = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0].naam
            const newBestemming = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam
            setSelectedBetalingsSoort(newBetalingsSoort);
            setSelectedBronRekening(newBron);
            setSelectedBestemmingRekening(betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam);
            props.onBetalingsSoortChange(newBetalingsSoort, newBron, newBestemming)
        }
    };

    const handleBronButtonClick = (rekeningNaam: string) => {
        setSelectedBronRekening(rekeningNaam);
        props.onBetalingsSoortChange(selectedBetalingsSoort, rekeningNaam, selectedBestemmingRekening)
    };

    const handleBestemmingButtonClick = (rekeningNaam: string) => {
        setSelectedBestemmingRekening(rekeningNaam);
        props.onBetalingsSoortChange(selectedBetalingsSoort, selectedBronRekening, rekeningNaam)
    };

    return (
        <div>
            {Array.from(betalingsSoorten2Rekeningen.keys()).map((betalingsSoort) => (
                <Accordion
                    key={betalingsSoort}
                    expanded={betalingsSoort === selectedBetalingsSoort}
                    onChange={(expanded) => {
                        if (expanded) { handleAccordionChange(betalingsSoort) }
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls={betalingsSoort}
                        id={betalingsSoort}
                    >
                        <Button
                            key={betalingsSoort}
                            variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                            // onClick={() => handleBetalingSoortButtonClick(betalingsSoort)}
                        >
                            {betalingsSoortFormatter(betalingsSoort)}
                        </Button>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {rekeningPaar && rekeningPaar.bron.length > 1 &&
                                <Grid >
                                    {/* <Typography variant="subtitle1">Bron:</Typography> */}
                                    {rekeningPaar?.bron.map((rekening) => (
                                        <Button
                                            style={{ textTransform: 'none' }}
                                            sx={{ m: '3px' }}
                                            key={rekening.id}
                                            variant={selectedBronRekening === rekening.naam ? 'contained' : 'outlined'}
                                            onClick={() => handleBronButtonClick(rekening.naam)}
                                        >
                                            {rekening.naam}
                                        </Button>
                                    ))}
                                </Grid>
                            }
                            {rekeningPaar && rekeningPaar.bestemming.length > 1 &&
                                <Grid >
                                    {/* <Typography variant="subtitle1">Bestemming:</Typography> */}
                                    {rekeningPaar?.bestemming.map((rekening) => (
                                        <Button
                                            style={{ textTransform: 'none' }}
                                            sx={{ m: '3px' }}
                                            key={rekening.id}
                                            variant={selectedBestemmingRekening === rekening.naam ? 'contained' : 'outlined'}
                                            onClick={() => handleBestemmingButtonClick(rekening.naam)}
                                        >
                                            {rekening.naam}
                                        </Button>
                                    ))}
                                </Grid>
                            }
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default BetalingsSoortSelectAlternatief;