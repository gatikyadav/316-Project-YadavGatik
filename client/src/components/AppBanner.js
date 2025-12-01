import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store'

import EditToolbar from './EditToolbar'

import AccountCircle from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

export default function AppBanner() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const location = useLocation();

    // HIDE BANNER ON SPLASH SCREEN, LOGIN, REGISTER, and EDIT ACCOUNT pages (when not logged in/guest)
    const hideBannerPaths = ['/', '/login/', '/register/', '/edit-account/'];
    if (hideBannerPaths.includes(location.pathname) && !auth.loggedIn && !auth.isGuest) {
        return null;
    }

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    }

    const handleHouseClick = () => {
        store.closeCurrentList();
    }

    const menuId = 'primary-search-account-menu';
    
    // Menu for logged in users - includes Edit Account option per spec
    const loggedInMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem component={Link} to='/edit-account/' onClick={handleMenuClose}>
                Edit Account
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    // Menu for guests - can login or create account
    const guestMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem component={Link} to='/login/' onClick={handleMenuClose}>
                Login
            </MenuItem>
            <MenuItem component={Link} to='/register/' onClick={handleMenuClose}>
                Create Account
            </MenuItem>
        </Menu>
    );

    let editToolbar = "";
    let menu = guestMenu;
    
    if (auth.loggedIn) {
        menu = loggedInMenu;
        if (store.currentList) {
            editToolbar = <EditToolbar />;
        }
    }
    
    function getAccountMenu(loggedIn, isGuest) {
        if (loggedIn) {
            // Check if user has an avatar image
            const avatarImage = auth.getUserAvatar ? auth.getUserAvatar() : null;
            
            if (avatarImage) {
                // Show avatar image
                return (
                    <Avatar
                        src={avatarImage}
                        sx={{ 
                            width: 36, 
                            height: 36
                        }}
                    />
                );
            } else {
                // Show initials from userName
                let userInitials = auth.getUserInitials();
                return (
                    <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                    }}>
                        {userInitials}
                    </Box>
                );
            }
        } else if (isGuest) {
            return <AccountCircle sx={{ fontSize: 36 }} />;
        } else {
            return <AccountCircle sx={{ fontSize: 36 }} />;
        }
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar 
                position="static" 
                sx={{ 
                    backgroundColor: '#e020a0', // Magenta to match spec
                    boxShadow: 'none'
                }}
            >
                <Toolbar>
                    {/* Home Button */}
                    <IconButton
                        component={Link}
                        to="/"
                        onClick={handleHouseClick}
                        sx={{ 
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            mr: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.3)'
                            }
                        }}
                    >
                        <HomeIcon />
                    </IconButton>
                    
                    {/* Navigation Links */}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        {/* Playlists - Available to all users */}
                        {(auth.loggedIn || auth.isGuest) && (
                            <Button 
                                component={Link} 
                                to="/" 
                                color="inherit"
                                sx={{ 
                                    mr: 2,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Playlists
                            </Button>
                        )}

                        {/* Songs Catalog - Available to all users */}
                        {(auth.loggedIn || auth.isGuest) && (
                            <Button 
                                component={Link} 
                                to="/songs/" 
                                color="inherit"
                                sx={{ 
                                    mr: 2,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Songs Catalog
                            </Button>
                        )}
                        
                        {editToolbar}
                    </Box>
                    
                    {/* Account section */}
                    {(auth.loggedIn || auth.isGuest) && (
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            { getAccountMenu(auth.loggedIn, auth.isGuest) }
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>
            {menu}
        </Box>
    );
}