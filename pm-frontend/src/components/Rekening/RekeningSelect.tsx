import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useCustomContext } from "../../context/CustomContext";
import { saveToLocalStorage } from "../Header";

import { Rekening } from "../../model/Rekening";
import { useState } from "react";
export function RekeningSelect() {

    const { rekeningen } = useCustomContext();
    const [gekozenRekening, setGekozenRekening] = useState<Rekening>(rekeningen[0]);

    const handlegekozenRekeningChange = (event: SelectChangeEvent<string>) => {
        const rekening = rekeningen.find(rekening => rekening.naam === event.target.value)
        if (rekening) {
            setGekozenRekening(rekening);
            saveToLocalStorage('gekozenRekening', rekening?.id + '');
        }
    };

    return (
        <Box sx={{ my: 2, maxWidth: '340px' }}>
            <FormControl variant="standard" fullWidth>
                <InputLabel id="demo-simple-select-label">Kies de rekening</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={gekozenRekening.naam}
                    label="Rekening"
                    onChange={handlegekozenRekeningChange}>
                    {rekeningen
                        .map((rekening: Rekening) => (
                            <MenuItem key={rekening.naam} value={rekening.naam}>
                                {rekening.naam} )
                            </MenuItem>))}
                </Select>
            </FormControl>
        </Box>
    )
}
