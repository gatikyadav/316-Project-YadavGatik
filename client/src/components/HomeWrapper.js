import { useContext } from 'react'
import HomeScreen from './HomeScreen'
import SplashScreen from './SplashScreen'
import AuthContext from '../auth'

export default function HomeWrapper() {
    const { auth } = useContext(AuthContext);
    console.log("HomeWrapper auth.loggedIn: " + auth.loggedIn);
    console.log("HomeWrapper auth.isGuest: " + auth.isGuest);
    
    // Show splash screen only if neither logged in nor guest
    if (!auth.loggedIn && !auth.isGuest) {
        return <SplashScreen />
    }
    
    // Both logged in users AND guests go to HomeScreen (Playlists view)
    // Guests can browse/search/play playlists but cannot create/edit
    return <HomeScreen />
}