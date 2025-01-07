import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { useAuthContext } from "@asgardeo/auth-react";

import { PlusMinLogo } from "../assets/PlusMinLogo";
import { useCustomContext } from '../context/CustomContext';
import { betaalmethodeRekeningSoorten, Rekening, RekeningPaar } from '../model/Rekening';
import { BetalingsSoort, betalingsSoorten2RekeningenSoorten } from '../model/Betaling';

const pages = ['Stand', 'Inkomsten/uitgaven', 'Lening'];

function Header() {
    const navigate = useNavigate();
    const handleNavigation = (page: string) => {
        setAnchorElNav(null);
        navigate(page);
    };
    const { state, signIn, signOut, getIDToken } = useAuthContext();

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElGebruiker, setAnchorElGebruiker] = React.useState<null | HTMLElement>(null);

    const { gebruiker, setGebruiker,
        hulpvragers, setHulpvragers,
        actieveHulpvrager, setActieveHulpvrager,
        setRekeningen, setBetalingsSoorten, setBetaalMethoden, setBetalingsSoorten2Rekeningen } = useCustomContext();

    const formatRoute = (page: string): string => { return page.toLowerCase().replace('/', '-') }

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenGebruikerMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElGebruiker(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    const handleCloseGebruikerMenu = () => {
        setAnchorElGebruiker(null);
    };

    const transformRekeningen2BetalingsSoorten = (rekeningen: Rekening[]) => {
        const betalingsSoortValues = Object.values(BetalingsSoort);
        const rekeningSoortValues = rekeningen.map((rekening: Rekening) => rekening.rekeningSoort.toLowerCase())
        const filteredBetalingsSoorten = rekeningSoortValues.flatMap((rekeningSoort) =>
            betalingsSoortValues.filter((betalingsSoort) =>
                betalingsSoort.toLowerCase().includes(rekeningSoort.toLowerCase())
            )
        );
        return filteredBetalingsSoorten.filter((value, index, self) => self.indexOf(value) === index); //deduplication ...
    }

    const transformRekeningen2Betaalmethoden = (rekeningen: Rekening[]) => {
        return rekeningen.filter((rekening) =>
            betaalmethodeRekeningSoorten.includes(rekening.rekeningSoort)
        )
    }

    const transformRekeningenToBetalingsSoorten = (rekeningen: Rekening[]): Map<BetalingsSoort, RekeningPaar> => {
        const result = new Map<BetalingsSoort, RekeningPaar>();
        betalingsSoorten2RekeningenSoorten.forEach((rekeningSoortPaar, betalingsSoort) => {
            const bronRekeningen = rekeningen.filter(rekening =>
                rekeningSoortPaar.bron.includes(rekening.rekeningSoort)
            );
            const BestemmingRekeningen = rekeningen.filter(rekening =>
                rekeningSoortPaar.bestemming.includes(rekening.rekeningSoort)
            );
            if (bronRekeningen.length > 0 && BestemmingRekeningen.length > 0) {
                result.set(betalingsSoort, {
                    bron: bronRekeningen,
                    bestemming: BestemmingRekeningen
                });
            }
        });
        return result;
    }

    const handleActieveHulpvrager = (id: number) => {
        let ahv = hulpvragers.find(hv => hv.id === id)
        ahv = ahv ? ahv : gebruiker
        setActieveHulpvrager(ahv);
        setRekeningen(ahv!.rekeningen)
        setBetalingsSoorten(transformRekeningen2BetalingsSoorten(ahv!.rekeningen))
        setBetaalMethoden(transformRekeningen2Betaalmethoden(ahv!.rekeningen))
        setBetalingsSoorten2Rekeningen(transformRekeningenToBetalingsSoorten(ahv!.rekeningen))
        setAnchorElGebruiker(null);
        navigate('/profiel')
    };

    const fetchGebruikerMetHulpvragers = useCallback(async () => {
        const token = await getIDToken();
        const response = await fetch('/api/v1/gebruiker/zelf', {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
        const data = await response.json();
        setGebruiker(data.gebruiker);
        setHulpvragers(data.hulpvragers);
        if (data.gebruiker.roles.includes('ROLE_VRIJWILLIGER') && data.hulpvragers.length > 0) {
            setActieveHulpvrager(data.hulpvragers[0])
            setRekeningen(data.hulpvragers[0].rekeningen)
            setBetalingsSoorten(transformRekeningen2BetalingsSoorten(data.hulpvragers[0].rekeningen))
            setBetaalMethoden(transformRekeningen2Betaalmethoden(data.hulpvragers[0].rekeningen))
            setBetalingsSoorten2Rekeningen(transformRekeningenToBetalingsSoorten(data.hulpvragers[0].rekeningen))

        } else {
            setActieveHulpvrager(data.gebruiker)
            setRekeningen(data.gebruiker.rekeningen)
            setBetalingsSoorten(transformRekeningen2BetalingsSoorten(data.gebruiker.rekeningen))
            setBetaalMethoden(transformRekeningen2Betaalmethoden(data.gebruiker.rekeningen))
            setBetalingsSoorten2Rekeningen(transformRekeningenToBetalingsSoorten(data.gebruiker.rekeningen))

        }
    }, [getIDToken, setGebruiker, setHulpvragers, setActieveHulpvrager, setRekeningen, setBetalingsSoorten, setBetaalMethoden, setBetalingsSoorten2Rekeningen])

    useEffect(() => {
        fetchGebruikerMetHulpvragers();
    }, [fetchGebruikerMetHulpvragers]);

    return (
        <AppBar position="static" sx={{ bgcolor: "white", color: '#333', boxShadow: 0 }}>
            <Toolbar disableGutters>
                <IconButton onClick={() => handleNavigation("/")}>
                    <PlusMinLogo />
                </IconButton>


                {state.isAuthenticated &&
                    <>
                        {/* menuitems bij md+ */}
                        <Box sx={{ my: 2, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Button
                                    key={page}
                                    onClick={() => handleNavigation(formatRoute(page))}
                                    sx={{ mx: 2, color: '#222', display: 'block' }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>

                        {/* profiel & settings */}
                        <Box sx={{ ml: 'auto', display: 'flex' }}>
                            <Typography sx={{ my: 'auto', mr: { xs: '3px', md: '10px' } }}>{actieveHulpvrager?.bijnaam}</Typography>
                            <Box sx={{ flexDirection: 'row' }}>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenGebruikerMenu} sx={{ p: 0 }}>
                                        <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElGebruiker}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElGebruiker)}
                                    onClose={handleCloseGebruikerMenu}
                                >
                                    <MenuItem key={'profile'} onClick={() => handleActieveHulpvrager(gebruiker!.id)}>
                                        <Typography sx={{ textAlign: 'center' }}>
                                            {actieveHulpvrager?.id === gebruiker?.id ? '> ' : ''}
                                            {gebruiker?.bijnaam}</Typography>
                                    </MenuItem>
                                    {hulpvragers.map(hulpvrager =>
                                        <MenuItem key={hulpvrager.id} onClick={() => handleActieveHulpvrager(hulpvrager.id)}>
                                            <Typography sx={{ textAlign: 'center' }}>
                                                {hulpvrager.id === actieveHulpvrager?.id ? '> ' : ''}
                                                {hulpvrager.bijnaam}</Typography>
                                        </MenuItem>)}
                                    <MenuItem key={'logout'} onClick={() => signOut()}>
                                        <Typography sx={{ textAlign: 'center' }}>Uitloggen</Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>

                            {/* Hambuger menu */}
                            <Box sx={{ flexGrow: 1, ml: 0, display: { xs: 'flex', md: 'none' } }}>
                                <IconButton
                                    size="large"
                                    aria-label="account of current gebruiker"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenNavMenu}
                                    color="inherit"
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                    sx={{ display: { xs: 'block', md: 'none' } }}
                                >
                                    {pages.map((page) => (
                                        <MenuItem key={page}
                                            onClick={() => handleNavigation(formatRoute(page))}>
                                            <Typography sx={{ textAlign: 'center', color: '#222' }}>{page}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>

                            </Box>
                        </Box>
                    </>
                }

                {!state.isAuthenticated &&
                    <Button variant="contained" sx={{ ml: 'auto' }} onClick={() => signIn()}>Login</Button>
                }
            </Toolbar>
        </AppBar>
    );
}
export default Header;
