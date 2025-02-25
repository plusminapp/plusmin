import { Fragment, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAuthContext } from '@asgardeo/auth-react';
import { Stand } from '../model/Stand';
import { useCustomContext } from '../context/CustomContext';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { eersteOpenPeriode, formateerNlDatum } from '../model/Periode';
import Resultaat from '../components/Resultaat';
const PeriodeSluiten = () => {
    const { actieveHulpvrager, setSnackbarMessage, periodes } = useCustomContext();
    const periode = eersteOpenPeriode(periodes);

    if (!periode) {
        return <Typography variant='h4' sx={{ mb: '25px' }}>Er is geen periode die kan worden afgesloten...</Typography>
    }
    const [stand, setStand] = useState<Stand | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false);
    const { getIDToken } = useAuthContext();

    const navigate = useNavigate();
    useEffect(() => {
        const fetchSaldi = async () => {
            if (actieveHulpvrager && periode) {
                setIsLoading(true);
                const vandaag = dayjs().format('YYYY-MM-DD');
                const datum = periode.periodeEindDatum > vandaag ? vandaag : periode.periodeEindDatum;
                const id = actieveHulpvrager.id
                let token = '';
                try { token = await getIDToken() }
                catch (error) {
                    navigate('/login');
                }
                const response = await fetch(`/api/v1/saldo/hulpvrager/${id}/stand/${datum}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setIsLoading(false);
                if (response.ok) {
                    const result = await response.json();
                    setStand(result)
                } else {
                    console.error("Failed to fetch data", response.status);
                    setSnackbarMessage({
                        message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
                        type: "warning",
                    })
                }
            }
        };
        fetchSaldi();
    }, [actieveHulpvrager, periode, getIDToken]);

    if (isLoading) {
        return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
    };

    return (
        <Fragment>
            <Grid>
                <Typography variant='h4'>Periode sluiten</Typography>
                <Typography fontSize={'0.875rem'}>
                    van {formateerNlDatum(periode.periodeStartDatum)} t/m {formateerNlDatum(periode.periodeEindDatum)}
                </Typography>
            </Grid>

            <Grid>
                {stand &&
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2} columns={1}>
                            <Grid size={2}>
                                <Resultaat title={'Inkomsten en uitgaven'} datum={stand.peilDatum} saldi={stand.resultaatOpDatum} />
                            </Grid>
                            <Grid size={2}>
                                <Resultaat title={'Stand'} datum={stand.peilDatum} saldi={stand.balansOpDatum!} />
                            </Grid>
                        </Grid>
                    </Box>
                }
            </Grid >
            <Grid display="flex" flexDirection="row" alignItems={'center'} justifyContent="flex-end" >
                <Button startIcon={<LockOutlinedIcon sx={{ fontSize: '35px' }} />} >Sluit periode</Button>
            </Grid>
        </Fragment>
    );
}
export default PeriodeSluiten;