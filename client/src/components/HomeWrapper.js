import { useContext } from 'react'
import HomeScreen from './HomeScreen'
import SplashScreen from './SplashScreen'
import AuthContext from '../auth'
import { Box, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'

export default function HomeWrapper() {
    const { auth } = useContext(AuthContext);
    console.log("HomeWrapper auth.loggedIn: " + auth.loggedIn);
    console.log("HomeWrapper auth.isGuest: " + auth.isGuest);
    
    // 🔥 NEW LOGIC: Only show splash screen if neither logged in nor guest
    if (!auth.loggedIn && !auth.isGuest) {
        return <SplashScreen />
    }
    
    // 🔥 Show HomeScreen for logged in users
    if (auth.loggedIn) {
        return <HomeScreen />
    }
    
    // 🔥 NEW: Guest Welcome Screen
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            textAlign: 'center',
            padding: 3,
            backgroundColor: '#f5f5f5'
        }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                Welcome, Guest! 🎵
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 3, maxWidth: 600, color: 'text.secondary' }}>
                You're browsing as a guest. You can explore our Songs Catalog and discover new music, 
                but you cannot create or manage playlists.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button
                    component={Link}
                    to="/songs/"
                    variant="contained"
                    size="large"
                    sx={{ 
                        minWidth: 250,
                        fontSize: '1.1rem',
                        py: 1.5
                    }}
                >
                    Browse Songs Catalog
                </Button>
                
                <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                    Want to create playlists?
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        component={Link}
                        to="/login/"
                        variant="outlined"
                        size="medium"
                    >
                        Login
                    </Button>
                    
                    <Button
                        component={Link}
                        to="/register/"
                        variant="outlined"
                        size="medium"
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}