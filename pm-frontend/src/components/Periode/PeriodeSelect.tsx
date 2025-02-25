import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { eersteOpenPeriode, Periode } from "../../model/Periode";
import { useCustomContext } from "../../context/CustomContext";
import { saveToLocalStorage } from "../Header";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useNavigate } from "react-router-dom";

interface PeriodeSelectProps {
    isProfiel?: boolean;
}

export function PeriodeSelect({ isProfiel = false }: PeriodeSelectProps) {

    const { periodes, gekozenPeriode, setGekozenPeriode } = useCustomContext();

    const handlegekozenPeriodeChange = (event: SelectChangeEvent<string>) => {
        const periode = periodes.find(periode => periode.periodeStartDatum.toString() === event.target.value)
        setGekozenPeriode(periode);
        saveToLocalStorage('gekozenPeriode', periode?.id + '');

    };
    const navigate = useNavigate();

    const openPeriodes = periodes.filter(periode => periode.periodeStatus === 'OPEN' || periode.periodeStatus === 'HUIDIG')

    return (
        <>
            {!isProfiel && openPeriodes.length === 1 && gekozenPeriode &&
                <Box sx={{ mt: '37px', maxWidth: '340px' }}>
                    <Typography >
                        Periode: {gekozenPeriode.periodeStartDatum} - {gekozenPeriode.periodeEindDatum} ({gekozenPeriode.periodeStatus.toLocaleLowerCase()})
                    </Typography>
                </Box>}

            {!isProfiel && openPeriodes.length > 1 && gekozenPeriode &&
                <Box sx={{ my: 2, maxWidth: '340px' }}>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel id="demo-simple-select-label">Kies de periode</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={gekozenPeriode.periodeStartDatum.toString()}
                            label="Periode"
                            onChange={handlegekozenPeriodeChange}>
                            {openPeriodes
                                .map((periode: Periode) => (
                                    <MenuItem key={periode.periodeStartDatum.toString()} value={periode.periodeStartDatum.toString()}>
                                        {`van ${periode.periodeStartDatum} tot ${periode.periodeEindDatum}`} ({periode.periodeStatus.toLocaleLowerCase()})
                                    </MenuItem>))}
                        </Select>
                    </FormControl>
                </Box>}

            {isProfiel &&
                <Box sx={{ maxWidth: '340px' }}>
                    {periodes
                        .filter(periode => periode.periodeStartDatum !== periode.periodeEindDatum)
                        .map((periode: Periode) => (
                            <>
                                <Grid display="flex" flexDirection="row" alignItems={'center'} justifyContent="flex-start" >
                                    <Typography key={periode.periodeStartDatum}>
                                        Periode: {periode.periodeStartDatum} - {periode.periodeEindDatum} ({periode.periodeStatus.toLocaleLowerCase()})
                                    </Typography>
                                    <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer', mr: 0, pr: 0 }}>
                                        {periode === eersteOpenPeriode(periodes) &&
                                            <Button onClick={() => navigate('/periode-sluiten')} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                                                <LockOutlinedIcon fontSize="small" />
                                            </Button>}
                                    </Box>
                                </Grid>
                            </>))}
                </Box>}
        </>)
}
