import * as React from 'react';
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

const pages = ['Stand', 'Inkomsten/uitgaven', 'Betaalregelingen', 'Budget'];

function ResponsiveAppBar() {
    const navigate = useNavigate();
    const handleNavigation = (page: string) => {
        navigate(page);
    };
    const { state, signIn, signOut } = useAuthContext();
    
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElGebruiker, setAnchorElGebruiker] = React.useState<null | HTMLElement>(null);
    
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
    const handleGotoGebruikerMenu = () => {
        setAnchorElGebruiker(null);
        handleNavigation("/profiel")
    };
    
    return (
        <AppBar position="static" sx={{ bgcolor: "white", color: '#333', boxShadow: 0 }}>
            <Toolbar disableGutters>
                <IconButton onClick={() => handleNavigation("/stand")}>
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
                                    <MenuItem key={'profile'} onClick={handleGotoGebruikerMenu}>
                                        <Typography sx={{ textAlign: 'center' }}>{state.username}</Typography>
                                    </MenuItem>
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
export default ResponsiveAppBar;
