import { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { BetalingsSoort, betalingsSoortFormatter } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';

type BetalingsSoortSelectProps = {
    betalingsSoort: BetalingsSoort;
    bron: string | undefined;
    bestemming: string | undefined;
    onBetalingsSoortChange: (betalingsSoort: BetalingsSoort, bron: string | undefined, bestemming: string | undefined) => void;
};

const BetalingsSoortSelectAlternatief = (props: BetalingsSoortSelectProps) => {
    const { betalingsSoorten2Rekeningen } = useCustomContext();
    const rekeningPaar = betalingsSoorten2Rekeningen.get(props.betalingsSoort);

    const [selectedBetalingsSoort, setSelectedBetalingsSoort] = useState<BetalingsSoort>(props.betalingsSoort);
    const [selectedBronRekening, setSelectedBronRekening] = useState<string | undefined>(props.bron);
    const [selectedBestemmingRekening, setSelectedBestemmingRekening] = useState<string | undefined>(props.bestemming);

    const handleAccordionChange = (panel: BetalingsSoort) => {
        console.log("in handleBetalingsSoortChange")
        const newBetalingsSoort = panel;
        const newBron = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0].naam
        const newBestemming = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam
        setSelectedBetalingsSoort(newBetalingsSoort);
        setSelectedBronRekening(newBron);
        setSelectedBestemmingRekening(betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam);
        props.onBetalingsSoortChange(newBetalingsSoort, newBron, newBestemming)
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
                                        sx={{ m: "3px"}}
                                        key={betalingsSoort}
                                        variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                        // onClick={() => handleBestemmingButtonClick(rekening.naam)}
                                    >
                                        {betalingsSoortFormatter(betalingsSoort)}
                                    </Button>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {rekeningPaar && rekeningPaar.bron.length > 1 &&
                                <Grid >
                                    <Typography variant="subtitle1">Bron:</Typography>
                                    {rekeningPaar?.bron.map((rekening) => (
                                        <Button
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
                                    <Typography variant="subtitle1">Bestemming:</Typography>
                                    {rekeningPaar?.bestemming.map((rekening) => (
                                        <Button
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