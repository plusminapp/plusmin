import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Periode } from "../model/Periode";
import { useCustomContext } from "../context/CustomContext";

export function PeriodeSelect() {

    const { periodes, huidigePeriode, setHuidigePeriode } = useCustomContext();

    const handleHuidigePeriodeChange = (event: SelectChangeEvent<string>) => {
        const periode = periodes.find(periode => periode.periodeStartDatum.toString() === event.target.value)
        setHuidigePeriode(periode);
    };

    return (
        <>
            {huidigePeriode &&
                <Box sx={{ my: 2 , maxWidth: '340px'}}>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel id="demo-simple-select-label">Kies de periode</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={huidigePeriode.periodeStartDatum.toString()}
                            label="Periode"
                            onChange={handleHuidigePeriodeChange}
                        >
                            {periodes.map((periode: Periode) => (
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
