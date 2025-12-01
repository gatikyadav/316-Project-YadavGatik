import { useContext, useState } from 'react';
import { Link } from 'react-router-dom'
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store'

import EditToolbar from './EditToolbar'

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function AppBanner() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

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
    const loggedOutMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
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
            <MenuItem onClick={handleMenuClose}><Link to='/login/'>Login</Link></MenuItem>
            <MenuItem onClick={handleMenuClose}><Link to='/register/'>Create New Account</Link></MenuItem>
        </Menu>
    );
    
    const loggedInMenu = 
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
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
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>

    // 🔥 NEW: Guest menu
    const guestMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
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
            <MenuItem onClick={handleMenuClose}><Link to='/login/'>Login</Link></MenuItem>
            <MenuItem onClick={handleMenuClose}><Link to='/register/'>Create New Account</Link></MenuItem>
        </Menu>
    );

    let editToolbar = "";
    let menu = loggedOutMenu;
    
    // 🔥 UPDATED: Menu logic for guest mode
    if (auth.loggedIn) {
        menu = loggedInMenu;
        if (store.currentList) {
            editToolbar = <EditToolbar />;
        }
    } else if (auth.isGuest) {
        menu = guestMenu;
    }
    
    function getAccountMenu(loggedIn, isGuest) {
        if (loggedIn) {
            let userInitials = auth.getUserInitials();
            console.log("userInitials: " + userInitials);
            return <div>{userInitials}</div>;
        } else if (isGuest) {
            return <div>Guest</div>;
        } else {
            return <AccountCircle />;
        }
    }

    // 🔥 ADD THIS DEBUG CODE
    console.log("🔍 AppBanner Debug:", {
        "auth.loggedIn": auth.loggedIn,
        "auth.isGuest": auth.isGuest, 
        "should show button": (auth.loggedIn || auth.isGuest),
        "full auth object": auth
    });

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography                        
                        variant="h4"
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' } }}                        
                    >
                        <Link onClick={handleHouseClick} style={{ textDecoration: 'none', color: 'white' }} to='/'>⌂</Link>
                    </Typography>
                    
                    {/* Navigation Links */}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 3 }}>
                        {/* 🔥 TEMPORARY TEST: Show button always with red background */}
                        <Button 
                            component={Link} 
                            to="/songs/" 
                            color="inherit"
                            sx={{ 
                                mr: 2,
                                fontSize: '1rem',
                                textTransform: 'none',
                                backgroundColor: 'red', // Make it red so we can see it
                                '&:hover': {
                                    backgroundColor: 'darkred'
                                }
                            }}
                        >
                            Songs Catalog (TEST)
                        </Button>
                        
                        {/* My Playlists - Only for logged in users (NOT guests) */}
                        {auth.loggedIn && (
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
                                My Playlists
                            </Button>
                        )}
                        
                        {editToolbar}
                    </Box>
                    
                    {/* 🔥 UPDATED: Account section - Show for logged in users OR guests */}
                    {(auth.loggedIn || auth.isGuest) && (
                        <Box sx={{ height: "90px", display: { xs: 'none', md: 'flex' } }}>
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
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            {
                menu
            }
        </Box>
    );
}