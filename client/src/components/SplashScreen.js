import { useContext } from 'react';
import AuthContext from '../auth';
import { Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

/*
    This React component represents the Splash Screen that welcomes 
    users to the application. Matches Figure 3.1 from specification.
    
    @author Gatik Yadav
*/
export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    
    return (
        <Box 
            sx={{
                width: '100%',
                height: '100vh',
                backgroundColor: '#f8e0f0', // Light pink background
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 4
            }}
        >
            {/* Main Container */}
            <Box 
                sx={{
                    width: '100%',
                    maxWidth: 700,
                    backgroundColor: '#f8e0f0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3
                }}
            >
                {/* Header Bar - Magenta */}
                <Box 
                    sx={{
                        backgroundColor: '#e020a0', // Magenta
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1
                    }}
                >
                    <IconButton sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
                        <HomeIcon />
                    </IconButton>
                    <IconButton sx={{ color: 'white' }}>
                        <AccountCircleIcon fontSize="large" />
                    </IconButton>
                </Box>

                {/* Content Area - Cream/Beige */}
                <Box 
                    sx={{
                        backgroundColor: '#f5f5dc', // Cream/beige
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        px: 4,
                        minHeight: 400
                    }}
                >
                    {/* Title */}
                    <Box 
                        sx={{ 
                            fontSize: '2.5rem', 
                            fontWeight: 400,
                            color: '#555',
                            mb: 3,
                            fontFamily: 'serif'
                        }}
                    >
                        The Playlister
                    </Box>

                    {/* Music Note Logo */}
                    <Box sx={{ mb: 6 }}>
                        <QueueMusicIcon sx={{ fontSize: 120, color: '#333' }} />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            onClick={auth.loginGuest}
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#333',
                                color: 'white',
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: '#555'
                                }
                            }}
                        >
                            Continue as Guest
                        </Button>

                        <Button
                            component={Link}
                            to="/login/"
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#555',
                                color: 'white',
                                textTransform: 'none',
                                px: 4,
                                py: 1,
                                fontSize: '0.9rem',
                                borderRadius: 1,
                                border: '2px solid #333',
                                '&:hover': {
                                    backgroundColor: '#666'
                                }
                            }}
                        >
                            Login
                        </Button>

                        <Button
                            component={Link}
                            to="/register/"
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#333',
                                color: 'white',
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: '#555'
                                }
                            }}
                        >
                            Create Account
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}