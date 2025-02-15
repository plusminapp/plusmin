import { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { BetalingsSoort, betalingsSoortFormatter, inkomstenBetalingsSoorten, internBetalingsSoorten, uitgavenBetalingsSoorten } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';
import { RekeningSoort } from '../../model/Rekening';

type BetalingSoortSelectProps = {
    betalingsSoort: BetalingsSoort | undefined;
    bron: string | undefined;
    bestemming: string | undefined;
    onBetalingsSoortChange: (betalingsSoort: BetalingsSoort | undefined, bron: string | undefined, bestemming: string | undefined) => void;
};

const BetalingSoortSelect = (props: BetalingSoortSelectProps) => {
    const { betalingsSoorten2Rekeningen, rekeningen } = useCustomContext();
    const rekeningPaar = props.betalingsSoort ? betalingsSoorten2Rekeningen.get(props.betalingsSoort) : undefined;

    const betalingsSoort2Categorie = (betalingsSoort: BetalingsSoort | undefined): string | undefined => {
        if (!betalingsSoort) return undefined;
        if (inkomstenBetalingsSoorten.includes(betalingsSoort)) return 'INKOMSTEN';
        if (uitgavenBetalingsSoorten.includes(betalingsSoort)) return 'UITGAVEN';
        if (internBetalingsSoorten.includes(betalingsSoort)) return 'INTERN';
        return undefined;
    };
    const [selectedCategorie, setSelectedCategorie] = useState<string | undefined>(betalingsSoort2Categorie(props.betalingsSoort));
    const [selectedBetalingsSoort, setSelectedBetalingsSoort] = useState<BetalingsSoort | undefined>(props.betalingsSoort);
    const [selectedBronRekening, setSelectedBronRekening] = useState<string | undefined>(props.bron);
    const [selectedBestemmingRekening, setSelectedBestemmingRekening] = useState<string | undefined>(props.bestemming);

    useEffect(() => {
        setSelectedCategorie(betalingsSoort2Categorie(props.betalingsSoort));
        setSelectedBetalingsSoort(props.betalingsSoort);
        setSelectedBronRekening(props.bron);
        setSelectedBestemmingRekening(props.bestemming);
    }, [props.betalingsSoort, props.bron, props.bestemming]);

    const handleAccordionChange = (betalingsSoort: BetalingsSoort | undefined) => {
        console.log("in handleBetalingsSoortChange: selectedBetalingsSoort: ", selectedBetalingsSoort, " betalingsSoort: ", betalingsSoort, " selectedBetalingsSoort === betalingsSoort: ", selectedBetalingsSoort === betalingsSoort)
        if (betalingsSoort === undefined || selectedBetalingsSoort?.toString() === betalingsSoort.toString()) {
            console.log("in handleBetalingsSoortChange selectedBetalingsSoort === betalingsSoort")
            setSelectedCategorie(undefined);
            setSelectedBetalingsSoort(undefined);
            setSelectedBronRekening(undefined);
            setSelectedBestemmingRekening(undefined);
            props.onBetalingsSoortChange(undefined, undefined, undefined)
        } else {
            const newBetalingsSoort = betalingsSoort;
            const newBron = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0].naam
            const newBestemming = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam
            setSelectedCategorie(betalingsSoort2Categorie(newBetalingsSoort));
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

    const categorie2BetalingsSoort = (categorie: string ): BetalingsSoort | undefined => {
        if (categorie === 'INKOMSTEN') return BetalingsSoort.inkomsten;
        if (categorie === 'UITGAVEN') return BetalingsSoort.uitgaven;
        if (categorie === 'INTERN' && arrayContainsObjectWithAttribute(rekeningen, 'rekeningSoort', RekeningSoort.creditcard)) return BetalingsSoort.incasso_creditcard;
        if (categorie === 'INTERN' && arrayContainsObjectWithAttribute(rekeningen, 'rekeningSoort', RekeningSoort.spaarrekening)) return BetalingsSoort.opnemen_spaarrekening;
        if (categorie === 'INTERN' && arrayContainsObjectWithAttribute(rekeningen, 'rekeningSoort', RekeningSoort.contant)) return BetalingsSoort.opnemen_contant;
        return undefined;
    }
    const handleCategorieChange = (categorie: string ) => {
        if (selectedCategorie === categorie) {
            setSelectedCategorie(undefined);
            handleAccordionChange(undefined);
        } else {
            setSelectedCategorie(categorie);
            handleAccordionChange(categorie2BetalingsSoort(categorie));
        }
    };

    const arrayContainsObjectWithAttribute = <T, K extends keyof T>(array: T[], attribute: K, value: T[K]): boolean => {
        return array.some(obj => obj[attribute] === value);
    };

    const hasIntersection = <T,>(arr1: T[], arr2: T[]) =>
        arr2.some(item => new Set(arr1).has(item));

    return (
        <div>
            <Accordion
                key={'INKOMSTEN'}
                expanded={'INKOMSTEN' === selectedCategorie}
                onChange={() => handleCategorieChange('INKOMSTEN')}>
                <AccordionSummary>
                    <Typography sx={{ ...('INKOMSTEN' === selectedCategorie && { fontWeight: 'bold' }) }}>INKOMSTEN</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {inkomstenBetalingsSoorten.map((betalingsSoort) =>
                        betalingsSoorten2Rekeningen.get(betalingsSoort) &&
                        Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) &&
                        <>
                            {(betalingsSoorten2Rekeningen.get(betalingsSoort)!.bron.length > 1 || betalingsSoorten2Rekeningen.get(betalingsSoort)!.bestemming.length > 1) &&
                                <Accordion
                                    elevation={0}
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
                                        >
                                            {betalingsSoortFormatter(betalingsSoort)}
                                        </Button>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {rekeningPaar && rekeningPaar.bron.length > 1 &&
                                                <Grid >
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
                                                    <Typography sx={{ m: '3px', fontSize: 12 }}>Ik heb 't ontvangen:</Typography>
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
                                </Accordion>}
                            {(betalingsSoorten2Rekeningen.get(betalingsSoort)!.bron.length <= 1 && betalingsSoorten2Rekeningen.get(betalingsSoort)!.bestemming.length <= 1) &&
                                <Button
                                    sx={{ m: '3px', ml: '18px' }}
                                    key={betalingsSoort}
                                    variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                    onClick={() => handleAccordionChange(betalingsSoort)}
                                >
                                    {betalingsSoortFormatter(betalingsSoort)}
                                </Button>}
                        </>
                    )}
                </AccordionDetails>
            </Accordion>

            <Accordion
                key={'UITGAVEN'}
                expanded={'UITGAVEN' === selectedCategorie}
                onChange={() => handleCategorieChange('UITGAVEN')}>
                <AccordionSummary>
                    <Typography sx={{ ...('UITGAVEN' === selectedCategorie && { fontWeight: 'bold' }) }}>UITGAVEN</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {uitgavenBetalingsSoorten.map((betalingsSoort) =>
                        betalingsSoorten2Rekeningen.get(betalingsSoort) &&
                        Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) &&
                        <>
                            {(betalingsSoorten2Rekeningen.get(betalingsSoort)!.bron.length > 1 || betalingsSoorten2Rekeningen.get(betalingsSoort)!.bestemming.length > 1) &&
                                <Accordion
                                    elevation={0}
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
                                        >
                                            {betalingsSoortFormatter(betalingsSoort)}
                                        </Button>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {rekeningPaar && rekeningPaar.bestemming.length > 1 &&
                                                <Grid >
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
                                            {rekeningPaar && rekeningPaar.bron.length > 1 &&
                                                <Grid >
                                                    <Typography sx={{ m: '3px', fontSize: 12 }}>Ik heb 't betaald met:</Typography>
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
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>}
                            {(betalingsSoorten2Rekeningen.get(betalingsSoort)!.bron.length <= 1 && betalingsSoorten2Rekeningen.get(betalingsSoort)!.bestemming.length <= 1) &&
                                <Button
                                    sx={{ m: '3px', ml: 'px' }}
                                    key={betalingsSoort}
                                    variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                    onClick={() => handleAccordionChange(betalingsSoort)}
                                >
                                    {betalingsSoortFormatter(betalingsSoort)}
                                </Button>}
                        </>
                    )}
                </AccordionDetails>
            </Accordion>
            {hasIntersection(internBetalingsSoorten, Array.from(betalingsSoorten2Rekeningen.keys())) &&
                <Accordion
                    key={'INTERN'}
                    expanded={'INTERN' === selectedCategorie}
                    onChange={() => handleCategorieChange('INTERN')}>
                    <AccordionSummary>
                        <Typography sx={{ ...('INTERN' === selectedCategorie && { fontWeight: 'bold' }) }}>INTERN</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {internBetalingsSoorten.map((betalingsSoort) => Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                            <Button
                                style={{ textTransform: 'none' }}
                                sx={{ m: '3px' }}
                                key={betalingsSoort}
                                variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                onClick={() => handleAccordionChange(betalingsSoort)}
                            >
                                {betalingsSoortFormatter(betalingsSoort)}
                            </Button>
                        ))}
                    </AccordionDetails>
                </Accordion>}
        </div>
    );
};

export default BetalingSoortSelect;