import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { Periode } from "../model/Periode";
import { useCustomContext } from "../context/CustomContext";
import { useEffect } from "react";

interface PeriodeSelectProps {
  isProfiel?: boolean;
}


export function PeriodeSelect({isProfiel = false}: PeriodeSelectProps) {

    const { periodes, gekozenPeriode, setGekozenPeriode } = useCustomContext();

    const handlegekozenPeriodeChange = (event: SelectChangeEvent<string>) => {
        const periode = periodes.find(periode => periode.periodeStartDatum.toString() === event.target.value)
        setGekozenPeriode(periode);
    };

    useEffect(() => {
        if (periodes.length === 1) {
            setGekozenPeriode(periodes[0])
        }
    }, [periodes, setGekozenPeriode])

    const openPeriodes = periodes.filter(periode => periode.periodeStatus === 'OPEN' || periode.periodeStatus === 'HUIDIG')

    return (
        <>
            {!isProfiel && openPeriodes.length === 1 && gekozenPeriode &&
                <Box sx={{ mt: '37px', maxWidth: '340px' }}>
                    <Typography >
                        Periode: {gekozenPeriode.periodeStartDatum} - {gekozenPeriode.periodeEindDatum} ({gekozenPeriode.periodeStatus.toLocaleLowerCase()})
                    </Typography>
                </Box>
            }
            {!isProfiel && openPeriodes.length > 1 && gekozenPeriode &&
                <Box sx={{ my: 2, maxWidth: '340px' }}>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel id="demo-simple-select-label">Kies de periode</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={gekozenPeriode.periodeStartDatum.toString()}
                            label="Periode"
                            onChange={handlegekozenPeriodeChange}
                        >
                            {openPeriodes
                                .map((periode: Periode) => (
                                    <MenuItem key={periode.periodeStartDatum.toString()} value={periode.periodeStartDatum.toString()}>
                                        {`van ${periode.periodeStartDatum} tot ${periode.periodeEindDatum}`} ({periode.periodeStatus.toLocaleLowerCase()})
                                    </MenuItem>
                                )
                                )}
                        </Select>
                    </FormControl>
                </Box>}
                {isProfiel &&
                <Box sx={{ mt: '37px', maxWidth: '340px' }}>
                    {periodes.map((periode: Periode) => (
                        <Typography key={periode.periodeStartDatum}>
                            Periode: {periode.periodeStartDatum} - {periode.periodeEindDatum} ({periode.periodeStatus.toLocaleLowerCase()})
                        </Typography>
                    ))}
                </Box>
            }
        </>
    )
}
