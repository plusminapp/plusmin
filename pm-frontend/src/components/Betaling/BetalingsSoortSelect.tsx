import { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { BetalingsSoort, betalingsSoortFormatter } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';

type BetalingsSoortSelectProps = {
    betalingsSoort: BetalingsSoort;
    bron: string | undefined;
    bestemming: string | undefined;
    onChange: (betalingsSoort: BetalingsSoort, bron: string | undefined, bestemming: string | undefined) => void;
};

const BetalingsSoortSelect = (props: BetalingsSoortSelectProps) => {
    const { betalingsSoorten2Rekeningen } = useCustomContext();

    const [selectedBetalingsSoort, setSelectedBetalingsSoort] = useState<BetalingsSoort>(props.betalingsSoort);

    const rekeningPaar = selectedBetalingsSoort
        ? betalingsSoorten2Rekeningen.get(selectedBetalingsSoort)
        : undefined;

    const [selectedBronRekening, setSelectedBronRekening] = useState<string | undefined>(props.bron);
    const [selectedBestemmingRekening, setSelectedBestemmingRekening] = useState<string | undefined>(props.bestemming);

    const handleBetalingsSoortChange = (event: SelectChangeEvent<BetalingsSoort>) => {
        const newBetalingsSoort = event.target.value as BetalingsSoort;
        const newBron = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0].naam
        const newBestemming = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam
        setSelectedBetalingsSoort(newBetalingsSoort);
        setSelectedBronRekening(newBron);
        setSelectedBestemmingRekening(betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam);
        props.onChange(newBetalingsSoort, newBron, newBestemming)
    };

    const handleBronChange = (event: SelectChangeEvent<string>) => {
        const newBron = event.target.value;
        setSelectedBronRekening(newBron);
        props.onChange(selectedBetalingsSoort, newBron, selectedBestemmingRekening)
    };

    const handleBestemmingChange = (event: SelectChangeEvent<string>) => {
        const newBestemming = event.target.value;
        setSelectedBestemmingRekening(newBestemming);
        props.onChange(selectedBetalingsSoort, selectedBronRekening, newBestemming)
    };

    return (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <FormControl fullWidth>
                <InputLabel id="betalingssoort-label">Soort betaling kiezen</InputLabel>
                <Select
                    variant="standard"
                    labelId="betalingssoort-label"
                    value={selectedBetalingsSoort}
                    onChange={handleBetalingsSoortChange}
                >
                    {Array.from(betalingsSoorten2Rekeningen.keys()).map((betalingsSoort) => (
                        <MenuItem key={betalingsSoort} value={betalingsSoort}>
                            {betalingsSoortFormatter(betalingsSoort)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {rekeningPaar && rekeningPaar.bron.length > 1 &&
                <FormControl fullWidth >
                    <InputLabel id="bron-rekening-label">Bron Rekening</InputLabel>
                    <Select
                        variant="standard"
                        labelId="bron-rekening-label"
                        value={selectedBronRekening}
                        onChange={handleBronChange}
                    >
                        {rekeningPaar?.bron
                            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                            .map((rekening) => (
                                <MenuItem key={rekening.id} value={rekening.naam}>
                                    {rekening.naam}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>}

            {rekeningPaar && rekeningPaar.bestemming.length > 1 &&
                <FormControl fullWidth >
                    <InputLabel id="bestemming-rekening-label">Bestemming Rekening</InputLabel>
                    <Select
                        variant="standard"
                        labelId="bestemming-rekening-label"
                        value={selectedBestemmingRekening}
                        onChange={handleBestemmingChange}
                    >
                        {rekeningPaar?.bestemming
                            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                            .map((rekening) => (
                                <MenuItem key={rekening.id} value={rekening.naam}>
                                    {rekening.naam}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>}
        </div>
    );
};

export default BetalingsSoortSelect;
