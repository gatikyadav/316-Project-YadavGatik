import { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'
import CatalogSongCard from './CatalogSongCard.js' // UPDATED: Use CatalogSongCard
import AuthContext from '../auth'

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Fab from '@mui/material/Fab'
import List from '@mui/material/List';
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

/*
    This React component displays the Songs Catalog - a browsable collection
    of all songs in the global database. Users can search, sort, and add songs
    to their playlists.
    
    NEW for Final Project - Songs Catalog functionality
    
    @author [Your Name]
*/
const SongsScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    
    // State for songs data and UI controls
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');

    // Load songs when component mounts or search/sort changes
    useEffect(() => {
        loadSongs();
    }, [searchTerm, sortBy, sortOrder]);

    const loadSongs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Build query parameters
            const params = new URLSearchParams();
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);
            
            // Fetch songs from API
            const response = await fetch(`http://localhost:4000/songs?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setSongs(data.songs);
            } else {
                setError('Failed to load songs');
            }
        } catch (err) {
            console.error('Error loading songs:', err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Note: useEffect will trigger loadSongs when searchTerm changes
    };

    const handleSortByChange = (event) => {
        setSortBy(event.target.value);
    };

    const handleSortOrderChange = (event) => {
        setSortOrder(event.target.value);
    };

    const handleAddNewSong = () => {
        // Only authenticated users can add songs
        if (!auth.loggedIn) {
            // Could show a login prompt or redirect
            alert('Please log in to add songs');
            return;
        }
        
        // TODO: Open "Add Song" modal
        console.log('Add new song clicked');
        // For now, just log - we'll implement the modal later
        alert('Add Song feature coming soon!');
    };

    // Render loading state
    if (loading) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh' 
                }}
            >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading songs...</Typography>
            </Box>
        );
    }

    // Render error state
    if (error) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh',
                    flexDirection: 'column'
                }}
            >
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
                <button onClick={loadSongs} style={{ marginTop: '16px' }}>
                    Try Again
                </button>
            </Box>
        );
    }

    // Main render
    return (
        <div id="songs-catalog">
            {/* Header with title and controls */}
            <div id="songs-catalog-heading">
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    p: 2,
                    backgroundColor: 'background.paper'
                }}>
                    {/* Add Song Button (only for logged in users) */}
                    {auth.loggedIn && (
                        <Fab
                            color="primary"
                            aria-label="add song"
                            size="medium"
                            onClick={handleAddNewSong}
                        >
                            <AddIcon />
                        </Fab>
                    )}
                    
                    {/* Title */}
                    <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                        Songs Catalog ({songs.length} songs)
                    </Typography>
                    
                    {/* Search Box */}
                    <TextField
                        placeholder="Search songs..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ width: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    
                    {/* Sort Controls */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={handleSortByChange}
                        >
                            <MenuItem value="title">Title</MenuItem>
                            <MenuItem value="artist">Artist</MenuItem>
                            <MenuItem value="year">Year</MenuItem>
                            <MenuItem value="listens">Listens</MenuItem>
                            <MenuItem value="playlistCount">Playlists</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Order</InputLabel>
                        <Select
                            value={sortOrder}
                            label="Order"
                            onChange={handleSortOrderChange}
                        >
                            <MenuItem value="asc">
                                {sortBy === 'title' || sortBy === 'artist' ? 'A-Z' : 'Low-High'}
                            </MenuItem>
                            <MenuItem value="desc">
                                {sortBy === 'title' || sortBy === 'artist' ? 'Z-A' : 'High-Low'}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </div>

            {/* Songs List */}
            <Box sx={{ bgcolor: "background.paper", p: 1 }} id="songs-catalog-list">
                {songs.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        color: 'text.secondary'
                    }}>
                        <Typography variant="h6">
                            {searchTerm ? 'No songs match your search' : 'No songs in catalog'}
                        </Typography>
                        {searchTerm && (
                            <Typography variant="body2">
                                Try adjusting your search terms
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {songs.map((song) => (
                            <CatalogSongCard
                                key={song._id}
                                song={song}
                                userLoggedIn={auth.loggedIn}
                            />
                        ))}
                    </List>
                )}
            </Box>
        </div>
    );
}

export default SongsScreen;