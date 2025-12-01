import React, { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import SimpleSongCard from './SimpleSongCard.js'

import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Stack,
    CircularProgress
} from '@mui/material'
import {
    Add as AddIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon
} from '@mui/icons-material'

/*
    This React component displays the Songs Catalog page with vertical layout
    matching the Playlister specification exactly.
    
    @author Gatik Yadav
*/
console.log("🎵 VERTICAL SONGS CATALOG LOADED!");

const SongsScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    // Filter states
    const [filters, setFilters] = useState({
        title: '',
        artist: '',
        year: ''
    });

    // Sort states
    const [sortBy, setSortBy] = useState('listens');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Data states
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Current playing song for the YouTube player
    const [currentSong, setCurrentSong] = useState(null);

    useEffect(() => {
        loadSongs();
    }, []);

    // Update filtered songs when filters change
    useEffect(() => {
        applyFilters();
    }, [allSongs, filters, sortBy, sortOrder]);

    const loadSongs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use your existing API format
            const params = new URLSearchParams();
            params.append('sortBy', sortBy);
            params.append('sortOrder', sortOrder);
            
            const response = await fetch(`http://localhost:4000/songs?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setAllSongs(data.songs);
                console.log('Songs loaded:', data.songs.length);
            } else {
                setError('Failed to load songs');
            }
        } catch (error) {
            console.error('Error loading songs:', error);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field) => (event) => {
        setFilters(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSearch = () => {
        applyFilters();
    };

    const handleClear = () => {
        setFilters({
            title: '',
            artist: '',
            year: ''
        });
    };

    const applyFilters = () => {
        if (!allSongs) {
            setFilteredSongs([]);
            return;
        }

        let filtered = [...allSongs];

        // Apply filters
        if (filters.title) {
            filtered = filtered.filter(song => 
                song.title.toLowerCase().includes(filters.title.toLowerCase())
            );
        }

        if (filters.artist) {
            filtered = filtered.filter(song => 
                song.artist.toLowerCase().includes(filters.artist.toLowerCase())
            );
        }

        if (filters.year) {
            filtered = filtered.filter(song => 
                song.year.toString().includes(filters.year)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'artist':
                    aValue = a.artist.toLowerCase();
                    bValue = b.artist.toLowerCase();
                    break;
                case 'year':
                    aValue = a.year || 0;
                    bValue = b.year || 0;
                    break;
                case 'listens':
                    aValue = a.listens || 0;
                    bValue = b.listens || 0;
                    break;
                case 'playlistCount':
                    aValue = a.playlistCount || 0;
                    bValue = b.playlistCount || 0;
                    break;
                default:
                    aValue = a.listens || 0;
                    bValue = b.listens || 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredSongs(filtered);
    };

    const getSongCount = () => {
        return filteredSongs?.length || 0;
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some(filter => filter !== '');
    };

    const handleCreateNewSong = () => {
        if (!auth.loggedIn) {
            alert('Please log in to add songs');
            return;
        }
        console.log("Creating new song...");
        alert('Add Song feature coming soon!');
    };

    const handlePlaySong = (song) => {
        setCurrentSong(song);
        console.log("Playing song:", song.title);
    };

    // Render loading state
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 'calc(100vh - 64px)',
                flexDirection: 'column'
            }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading songs...</Typography>
            </Box>
        );
    }

    // Render error state
    if (error) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 'calc(100vh - 64px)',
                flexDirection: 'column'
            }}>
                <Typography variant="h6" color="error" gutterBottom>
                    {error}
                </Typography>
                <Button onClick={loadSongs} variant="contained">
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#f5f5f5' }}>
            {/* Left Sidebar - Search Filters + YouTube Player */}
            <Box sx={{ 
                width: '350px', 
                bgcolor: 'white', 
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Top Section - Filters */}
                <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                    {/* Songs Catalog Header */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" sx={{ color: '#d946ef', fontWeight: 'bold', mb: 2 }}>
                            Songs Catalog
                        </Typography>
                    </Box>

                    {/* Search Filters */}
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="by Title"
                            value={filters.title}
                            onChange={handleFilterChange('title')}
                            InputProps={{
                                endAdornment: filters.title && (
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters(prev => ({...prev, title: ''}))}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="by Artist"
                            value={filters.artist}
                            onChange={handleFilterChange('artist')}
                            InputProps={{
                                endAdornment: filters.artist && (
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters(prev => ({...prev, artist: ''}))}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            size="small"
                            label="by Year"
                            type="number"
                            value={filters.year}
                            onChange={handleFilterChange('year')}
                            InputProps={{
                                endAdornment: filters.year && (
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters(prev => ({...prev, year: ''}))}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                )
                            }}
                        />

                        {/* Search Button */}
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            fullWidth
                            sx={{ backgroundColor: '#8b5cf6' }}
                        >
                            Search
                        </Button>
                    </Stack>

                    {/* New Song Button */}
                    {auth.loggedIn && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateNewSong}
                            fullWidth
                            sx={{ 
                                mt: 2,
                                backgroundColor: '#8b5cf6',
                                '&:hover': { backgroundColor: '#7c3aed' }
                            }}
                        >
                            New Song
                        </Button>
                    )}
                </Box>

                {/* Bottom Section - YouTube Player */}
                <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider',
                    bgcolor: '#f8fafc'
                }}>
                    {currentSong ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                {currentSong.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                {currentSong.artist} • {currentSong.year}
                            </Typography>
                            
                            {/* Mock YouTube Player */}
                            <Box sx={{
                                bgcolor: '#7f1d1d',
                                borderRadius: 1,
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                position: 'relative',
                                backgroundImage: 'linear-gradient(45deg, #7f1d1d 25%, #991b1b 25%, #991b1b 50%, #7f1d1d 50%, #7f1d1d 75%, #991b1b 75%, #991b1b)',
                                backgroundSize: '20px 20px'
                            }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        🎵 YouTube Player 🎵
                                    </Typography>
                                    <Typography variant="body2">
                                        {currentSong.title}
                                    </Typography>
                                </Box>
                                
                                {/* Mock player controls */}
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    left: 8,
                                    right: 8,
                                    height: 4,
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    borderRadius: 2
                                }}>
                                    <Box sx={{
                                        width: '30%',
                                        height: '100%',
                                        bgcolor: '#ff0000',
                                        borderRadius: 2
                                    }} />
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body2" color="text.secondary">
                                Click a song to play it here
                            </Typography>
                            <Box sx={{
                                bgcolor: '#e5e7eb',
                                borderRadius: 1,
                                height: 120,
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    🎵 No Song Playing 🎵
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Right Side - Songs Display with Sort Controls */}
            <Box sx={{ 
                flex: 1, 
                bgcolor: '#f8fafc',
                p: 3,
                overflowY: 'auto'
            }}>
                {/* Header with Sort Controls */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    bgcolor: 'white',
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                            Sort: 
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={`${sortBy}_${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('_');
                                    setSortBy(newSortBy);
                                    setSortOrder(newSortOrder);
                                }}
                                displayEmpty
                            >
                                <MenuItem value="listens_desc">Listens (Hi-Lo)</MenuItem>
                                <MenuItem value="listens_asc">Listens (Lo-Hi)</MenuItem>
                                <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                                <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                                <MenuItem value="artist_asc">Artist (A-Z)</MenuItem>
                                <MenuItem value="year_desc">Year (Newest)</MenuItem>
                                <MenuItem value="year_asc">Year (Oldest)</MenuItem>
                                <MenuItem value="playlistCount_desc">Playlists (Hi-Lo)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    
                    <Chip 
                        label={`${getSongCount()} Song${getSongCount() !== 1 ? 's' : ''}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                {/* Songs Display */}
                {filteredSongs.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        bgcolor: 'white',
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'grey.300'
                    }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {allSongs?.length === 0 ? 'No songs in catalog' : 
                             hasActiveFilters() ? 'No songs match your search' : 'No songs found'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {allSongs?.length === 0 || !hasActiveFilters() ? 
                                'Add some songs to get started!' : 
                                'Try adjusting your search filters'
                            }
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1}>
                        {filteredSongs.map((song) => (
                            <SimpleSongCard
                                key={song._id}
                                song={song}
                                userLoggedIn={auth.loggedIn}
                                onPlay={() => handlePlaySong(song)}
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}

export default SongsScreen;