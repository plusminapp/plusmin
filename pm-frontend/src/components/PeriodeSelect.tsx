import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Periode } from "../model/Periode";
import { useCustomContext } from "../context/CustomContext";

export function PeriodeSelect() {

    const { periodes, gekozenPeriode, setGekozenPeriode } = useCustomContext();

    const handlegekozenPeriodeChange = (event: SelectChangeEvent<string>) => {
        const periode = periodes.find(periode => periode.periodeStartDatum.toString() === event.target.value)
        setGekozenPeriode(periode);
    };

    return (
        <>
            {gekozenPeriode &&
                <Box sx={{ my: 2 , maxWidth: '340px'}}>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel id="demo-simple-select-label">Kies de periode</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={gekozenPeriode.periodeStartDatum.toString()}
                            label="Periode"
                            onChange={handlegekozenPeriodeChange}
                        >
                            {periodes
                            .sort((a, b) => b.periodeStartDatum.toString().localeCompare(a.periodeStartDatum.toString()))
                            .map((periode: Periode) => (
                                <MenuItem key={periode.periodeStartDatum.toString()} value={periode.periodeStartDatum.toString()}>
                                    {`van ${periode.periodeStartDatum} tot ${periode.periodeEindDatum}`} ({periode.periodeStatus.toLocaleLowerCase()})
                                </MenuItem>
                            )
                            )}
                        </Select>
                    </FormControl>
                </Box>}
        </>
    )
}
