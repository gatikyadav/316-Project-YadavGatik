import { useContext } from 'react';
import AuthContext from '../auth';
import { Button, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

/*
    This React component represents the Splash Screen that welcomes 
    users to the application.
    
    @author Gatik Yadav
*/
export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    
    return (
        <div id="splash-screen">
            <Box 
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    padding: 2,
                    backgroundColor: '#1976d2',  // Blue background
                    color: 'white'
                }}
            >
                {/* App Title */}
                <Typography variant="h1" sx={{ mb: 2, fontWeight: 'bold', fontSize: '4rem' }}>
                    Playlister
                </Typography>
                
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                    Create and manage your music playlists
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    <Button
                        component={Link}
                        to="/login/"
                        variant="contained"
                        size="large"
                        sx={{ 
                            minWidth: 250,
                            fontSize: '1.2rem',
                            py: 1.5,
                            backgroundColor: 'white',
                            color: 'primary.main',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        Login
                    </Button>

                    <Button
                        component={Link}
                        to="/register/"
                        variant="outlined"
                        size="large"
                        sx={{ 
                            minWidth: 250,
                            fontSize: '1.2rem',
                            py: 1.5,
                            borderColor: 'white',
                            color: 'white',
                            '&:hover': {
                                borderColor: '#f5f5f5',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        Create Account
                    </Button>

                    {/* 🔥 NEW GUEST BUTTON */}
                    <Button
                        onClick={auth.loginGuest}
                        variant="text"
                        size="large"
                        sx={{ 
                            minWidth: 250,
                            fontSize: '1.1rem',
                            py: 1.5,
                            color: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        Continue as Guest
                    </Button>
                </Box>

                <Typography variant="body2" sx={{ mt: 3, opacity: 0.7, maxWidth: 400 }}>
                    Guests can browse the songs catalog but cannot create or manage playlists
                </Typography>
            </Box>
        </div>
    );
}