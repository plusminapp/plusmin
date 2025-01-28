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

const BetalingsSoortSelect = (props: BetalingsSoortSelectProps) => {
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
            props.onBetalingsSoortChange(undefined, undefined, undefined)

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

    const checkBetaalSuperSoort = (betaalSuperSoort: string) => {
        return selectedBetalingsSoort?.split('_').length === 2 &&
            selectedBetalingsSoort?.split('_')[1].toLowerCase() === betaalSuperSoort.toLowerCase()
    };

    const betaalSuperSoort2RekeningParen = (betaalSuperSoort: string) => {
        console.log(betaalSuperSoort, Array.from(betalingsSoorten2Rekeningen.keys()).join(', '))
        return Array.from(betalingsSoorten2Rekeningen.keys())
            .filter((betalingsSoort) => betalingsSoort.split('_').length === 2 &&
                betalingsSoort.split('_')[1].toLocaleLowerCase() === betaalSuperSoort.toLowerCase())
    }

    return (
        <div>
            {Array.from(betalingsSoorten2Rekeningen.keys())
                .filter(betalingsSoort => !["opnemen", "storten"].includes(betalingsSoort.split('_')[0].toLowerCase()))
                .map((betalingsSoort) => (
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


            {["spaarrekening", "contant"].map((betaalSuperSoort) =>
                <Accordion
                    key={betaalSuperSoort}
                    expanded={checkBetaalSuperSoort(betaalSuperSoort)}
                    onChange={(expanded) => {
                        const blaat = betaalSuperSoort2RekeningParen(betaalSuperSoort)
                        if (blaat.length > 0 && expanded) { handleAccordionChange(betaalSuperSoort2RekeningParen(betaalSuperSoort)[0]) }
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon />}
                        aria-controls={betaalSuperSoort}
                        id={betaalSuperSoort}>
                        <Button
                            key={betaalSuperSoort}
                            variant={checkBetaalSuperSoort(betaalSuperSoort) ? 'contained' : 'outlined'}>
                            {betaalSuperSoort}
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
            )}
        </div>
    );
};

export default BetalingsSoortSelect;