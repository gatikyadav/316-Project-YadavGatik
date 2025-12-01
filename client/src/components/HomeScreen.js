import React, { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import PlaylistCard from './PlaylistCard.js'
import MUIDeleteModal from './MUIDeleteModal'

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
    Stack
} from '@mui/material'
import {
    Add as AddIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material'

/*
    This React component displays the Playlists page with vertical layout
    matching the Playlister specification exactly.
    
    @author Gatik Yadav
*/
console.log("🔥 VERTICAL LAYOUT LOADED SUCCESSFULLY!");

const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    // Filter states
    const [filters, setFilters] = useState({
        playlistName: '',
        userName: '',
        songTitle: '',
        songArtist: '',
        songYear: ''
    });

    // Sort states
    const [sortBy, setSortBy] = useState('listens');
    const [sortOrder, setSortOrder] = useState('desc'); // Default to Hi-Lo like in spec
    
    // Filtered results
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    // Update filtered playlists when store or filters change
    useEffect(() => {
        if (store.idNamePairs) {
            applyFilters();
        }
    }, [store.idNamePairs, filters, sortBy, sortOrder]);

    const handleCreateNewList = () => {
        store.createNewList();
    }

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
            playlistName: '',
            userName: '',
            songTitle: '',
            songArtist: '',
            songYear: ''
        });
    };

    const applyFilters = () => {
        if (!store.idNamePairs) {
            setFilteredPlaylists([]);
            return;
        }

        let filtered = [...store.idNamePairs];

        // Apply filters
        if (filters.playlistName) {
            filtered = filtered.filter(playlist => 
                playlist.name.toLowerCase().includes(filters.playlistName.toLowerCase())
            );
        }

        if (filters.userName) {
            filtered = filtered.filter(playlist => 
                playlist.ownerEmail?.toLowerCase().includes(filters.userName.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'owner':
                    aValue = (a.ownerEmail || '').toLowerCase();
                    bValue = (b.ownerEmail || '').toLowerCase();
                    break;
                case 'listens':
                    aValue = a.listens || 0;
                    bValue = b.listens || 0;
                    break;
                case 'likes':
                    aValue = a.likes || 0;
                    bValue = b.likes || 0;
                    break;
                case 'dislikes':
                    aValue = a.dislikes || 0;
                    bValue = b.dislikes || 0;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredPlaylists(filtered);
    };

    const getPlaylistCount = () => {
        return filteredPlaylists?.length || 0;
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some(filter => filter !== '');
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#f5f5f5' }}>
            {/* Left Sidebar - Search Filters (Vertical) */}
            <Box sx={{ 
                width: '350px', 
                bgcolor: 'white', 
                p: 3,
                borderRight: 1,
                borderColor: 'divider',
                overflowY: 'auto'
            }}>
                {/* Playlists Header (No Sort Here) */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ color: '#d946ef', fontWeight: 'bold', mb: 2 }}>
                        Playlists
                    </Typography>
                </Box>

                {/* Vertical Search Filters */}
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="by Playlist Name"
                        value={filters.playlistName}
                        onChange={handleFilterChange('playlistName')}
                        InputProps={{
                            endAdornment: filters.playlistName && (
                                <IconButton
                                    size="small"
                                    onClick={() => setFilters(prev => ({...prev, playlistName: ''}))}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        label="by User Name"
                        value={filters.userName}
                        onChange={handleFilterChange('userName')}
                        InputProps={{
                            endAdornment: filters.userName && (
                                <IconButton
                                    size="small"
                                    onClick={() => setFilters(prev => ({...prev, userName: ''}))}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        label="by Song Title"
                        value={filters.songTitle}
                        onChange={handleFilterChange('songTitle')}
                        InputProps={{
                            endAdornment: filters.songTitle && (
                                <IconButton
                                    size="small"
                                    onClick={() => setFilters(prev => ({...prev, songTitle: ''}))}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        label="by Song Artist"
                        value={filters.songArtist}
                        onChange={handleFilterChange('songArtist')}
                        InputProps={{
                            endAdornment: filters.songArtist && (
                                <IconButton
                                    size="small"
                                    onClick={() => setFilters(prev => ({...prev, songArtist: ''}))}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        label="by Song Year"
                        type="number"
                        value={filters.songYear}
                        onChange={handleFilterChange('songYear')}
                        InputProps={{
                            endAdornment: filters.songYear && (
                                <IconButton
                                    size="small"
                                    onClick={() => setFilters(prev => ({...prev, songYear: ''}))}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />

                    {/* Search and Clear Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            fullWidth
                            sx={{ backgroundColor: '#8b5cf6' }}
                        >
                            Search
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClear}
                            fullWidth
                            sx={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}
                        >
                            Clear
                        </Button>
                    </Box>
                </Stack>

                {/* New Playlist Button */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNewList}
                    fullWidth
                    sx={{ 
                        mt: 3,
                        backgroundColor: '#8b5cf6',
                        '&:hover': { backgroundColor: '#7c3aed' }
                    }}
                >
                    New Playlist
                </Button>
            </Box>

            {/* Right Side - Playlists Display with Sort Controls */}
            <Box sx={{ 
                flex: 1, 
                bgcolor: '#f8fafc',
                p: 3,
                overflowY: 'auto'
            }}>
                {/* Header with Sort Controls - NOW ON RIGHT SIDE */}
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
                                <MenuItem value="listens_desc">Listeners (Hi-Lo)</MenuItem>
                                <MenuItem value="listens_asc">Listeners (Lo-Hi)</MenuItem>
                                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                                <MenuItem value="owner_asc">Owner (A-Z)</MenuItem>
                                <MenuItem value="likes_desc">Likes (Hi-Lo)</MenuItem>
                                <MenuItem value="dislikes_desc">Dislikes (Hi-Lo)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    
                    <Chip 
                        label={`${getPlaylistCount()} Playlist${getPlaylistCount() !== 1 ? 's' : ''}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                {/* Playlists Display */}
                {filteredPlaylists.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        bgcolor: 'white',
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'grey.300'
                    }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {store.idNamePairs?.length === 0 ? 'No playlists found' : 
                             hasActiveFilters() ? 'No playlists match your search' : 'No playlists found'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {store.idNamePairs?.length === 0 || !hasActiveFilters() ? 
                                'Create your first playlist to get started!' : 
                                'Try adjusting your search filters'
                            }
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1}>
                        {filteredPlaylists.map((pair) => (
                            <PlaylistCard
                                key={pair._id}
                                idNamePair={pair}
                                selected={false}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            <MUIDeleteModal />
        </Box>
    );
}

export default HomeScreen;