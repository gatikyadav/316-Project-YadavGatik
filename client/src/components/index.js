import AppBanner from './AppBanner'
import CatalogSongCard from './CatalogSongCard' // NEW: Catalog song card
import EditToolbar from './EditToolbar'
import HomeScreen from './HomeScreen'
import HomeWrapper from './HomeWrapper'
import ListCard from './PlaylistCard'
import LoginScreen from './LoginScreen'
import MUIDeleteModal from './MUIDeleteModal'
import MUIEditSongModal from './MUIEditSongModal'
import MUIErrorModal from './MUIErrorModal'
//import MUIRemoveSongModal from './MUIRemoveSongModal'
import RegisterScreen from './RegisterScreen'
import SongCard from './SongCard' // EXISTING: Playlist song card (from HW4)
import SongsScreen from './SongsScreen' // NEW: Songs Catalog Screen
import SplashScreen from './SplashScreen'
import Statusbar from './Statusbar'
import WorkspaceScreen from './WorkspaceScreen'
/*
    This serves as a module so that we can import
    all the other components as we wish.
    
    @author McKilla Gorilla
*/
export { 
    AppBanner,
    CatalogSongCard, // NEW: For songs catalog
    EditToolbar, 
    HomeScreen,
    HomeWrapper,
    ListCard, 
    LoginScreen,
    MUIDeleteModal,
    MUIEditSongModal,
    MUIErrorModal,
    //MUIRemoveSongModal,
    SongCard, // EXISTING: For playlist songs
    SongsScreen, // NEW: Songs Catalog Screen
    RegisterScreen,
    SplashScreen,
    Statusbar, 
    WorkspaceScreen }