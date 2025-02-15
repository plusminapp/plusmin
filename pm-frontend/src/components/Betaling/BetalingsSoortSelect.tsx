import { useEffect, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Import Grid2
import { BetalingsSoort, betalingsSoortFormatter, inkomstenBetalingsSoorten, internBetalingsSoorten, uitgavenBetalingsSoorten } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';
import { InternIcon } from '../../icons/Intern';
import { InkomstenIcon } from '../../icons/Inkomsten';
import { UitgavenIcon } from '../../icons/Uitgaven';

type BetalingSoortSelectProps = {
    betalingsSoort: BetalingsSoort | undefined;
    bron: string | undefined;
    bestemming: string | undefined;
    onBetalingsSoortChange: (betalingsSoort: BetalingsSoort | undefined, bron: string | undefined, bestemming: string | undefined) => void;
};

const BetalingSoortSelect = (props: BetalingSoortSelectProps) => {
    const { betalingsSoorten2Rekeningen } = useCustomContext();
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

    const handleCategorieChange = (categorie: string) => {
        if (selectedCategorie === categorie) {
            setSelectedCategorie(undefined);
        } else {
            setSelectedCategorie(categorie);
        }
    };

    const handleBetalingsSoortChange = (betalingsSoort: BetalingsSoort | undefined) => {
        if (betalingsSoort === undefined || selectedBetalingsSoort?.toString() === betalingsSoort.toString()) {
            setSelectedCategorie(undefined);
            setSelectedBetalingsSoort(undefined);
            setSelectedBronRekening(undefined);
            setSelectedBestemmingRekening(undefined);
            props.onBetalingsSoortChange(undefined, undefined, undefined);
        } else {
            const newBetalingsSoort = betalingsSoort;
            const newBron = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0].naam;
            const newBestemming = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam;
            setSelectedCategorie(betalingsSoort2Categorie(newBetalingsSoort));
            setSelectedBetalingsSoort(newBetalingsSoort);
            setSelectedBronRekening(newBron);
            setSelectedBestemmingRekening(newBestemming);
            props.onBetalingsSoortChange(newBetalingsSoort, newBron, newBestemming);
        }
    };

    const handleBronButtonClick = (rekeningNaam: string) => {
        setSelectedBronRekening(rekeningNaam);
        props.onBetalingsSoortChange(selectedBetalingsSoort, rekeningNaam, selectedBestemmingRekening);
    };

    const handleBestemmingButtonClick = (rekeningNaam: string) => {
        setSelectedBestemmingRekening(rekeningNaam);
        props.onBetalingsSoortChange(selectedBetalingsSoort, selectedBronRekening, rekeningNaam);
    };


    return (
        <div>
            <Grid container spacing={2}>
                <Grid >
                    <Button
                        variant={selectedCategorie === 'INKOMSTEN' ? 'contained' : 'outlined'}
                        onClick={() => handleCategorieChange('INKOMSTEN')}
                    >
                        <InkomstenIcon color={selectedCategorie === 'INKOMSTEN' ? 'white' : '#444'} />
                    </Button>
                </Grid>
                <Grid >
                    <Button
                        variant={selectedCategorie === 'UITGAVEN' ? 'contained' : 'outlined'}
                        onClick={() => handleCategorieChange('UITGAVEN')}
                    >
                        <UitgavenIcon color={selectedCategorie === 'UITGAVEN' ? 'white' : '#444'} />
                    </Button>
                </Grid>
                <Grid >
                    <Button
                        variant={selectedCategorie === 'INTERN' ? 'contained' : 'outlined'}
                        onClick={() => handleCategorieChange('INTERN')}
                    >
                        <InternIcon color={selectedCategorie === 'INTERN' ? 'white' : '#444'} />
                    </Button>
                </Grid>
            </Grid>

            {selectedCategorie === 'INKOMSTEN' && (
                <Box mt={2}>
                    {inkomstenBetalingsSoorten.map((betalingsSoort) =>
                        betalingsSoorten2Rekeningen.get(betalingsSoort) &&
                        Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                            <Box key={betalingsSoort}>
                                {(betalingsSoorten2Rekeningen.get(betalingsSoort)!.bron.length > 1 || betalingsSoorten2Rekeningen.get(betalingsSoort)!.bestemming.length > 1) ? (
                                    <Box>
                                        <Button
                                            variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                            onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                                        >
                                            {betalingsSoortFormatter(betalingsSoort)}
                                        </Button>
                                        <Box mt={2}>
                                            <Grid container spacing={2}>
                                                {rekeningPaar && rekeningPaar.bron.length > 1 && (
                                                    <Grid>
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
                                                )}
                                                {rekeningPaar && rekeningPaar.bestemming.length > 1 && (
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
                                                )}
                                            </Grid>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Button
                                        sx={{ m: '3px', ml: '18px' }}
                                        key={betalingsSoort}
                                        variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                        onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                                    >
                                        {betalingsSoortFormatter(betalingsSoort)}
                                    </Button>
                                )}
                            </Box>
                        )
                    )}
                </Box>
            )}

            {selectedCategorie === 'UITGAVEN' && (
                <Box mt={2}>
                    {uitgavenBetalingsSoorten.map((betalingsSoort) =>
                        betalingsSoorten2Rekeningen.get(betalingsSoort) &&
                        Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                            <Box key={betalingsSoort}>
                                {(betalingsSoorten2Rekeningen.get(betalingsSoort)!.bron.length > 1 || betalingsSoorten2Rekeningen.get(betalingsSoort)!.bestemming.length > 1) ? (
                                    <Box>
                                        <Button
                                            variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                            onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                                        >
                                            {betalingsSoortFormatter(betalingsSoort)}
                                        </Button>
                                        <Box mt={2}>
                                            <Grid container spacing={2}>
                                                {rekeningPaar && rekeningPaar.bestemming.length > 1 && (
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
                                                )}
                                                {rekeningPaar && rekeningPaar.bron.length > 1 && (
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
                                                )}
                                            </Grid>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Button
                                        sx={{ m: '3px', ml: '18px' }}
                                        key={betalingsSoort}
                                        variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                        onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                                    >
                                        {betalingsSoortFormatter(betalingsSoort)}
                                    </Button>
                                )}
                            </Box>
                        )
                    )}
                </Box>
            )}

            {selectedCategorie === 'INTERN' && (
                <Box mt={2}>
                    {internBetalingsSoorten.map((betalingsSoort) =>
                        Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                            <Button
                                style={{ textTransform: 'none' }}
                                sx={{ m: '3px' }}
                                key={betalingsSoort}
                                variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                            >
                                {betalingsSoortFormatter(betalingsSoort)}
                            </Button>
                        )
                    )}
                </Box>
            )}
        </div>
    );
};

export default BetalingSoortSelect;