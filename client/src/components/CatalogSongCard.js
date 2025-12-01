import React, { useState, useContext } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import {
    PlayArrow as PlayArrowIcon,
    Add as AddIcon,
    Headset as HeadsetIcon,
    QueueMusic as QueueMusicIcon,
    YouTube as YouTubeIcon
} from '@mui/icons-material';

/*
    This React component represents a single song in the Songs Catalog.
    It displays song information and provides controls for playing and adding to playlists.
    
    @author Gatik Yadav
*/
export default function CatalogSongCard(props) {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [song, setSong] = useState(props.song); // 🔥 LOCAL STATE for real-time updates
    const [anchorEl, setAnchorEl] = useState(null);

    // Format year to handle different input types
    const formatYear = (year) => {
        if (!year) return 'Unknown';
        return year.toString();
    };

    // Format listen count (e.g., 1500 → "1.5K")
    const formatListens = (listens) => {
        if (listens >= 1000) {
            return (listens / 1000).toFixed(1) + 'K';
        }
        return listens.toString();
    };

    // Handle play button click
    const handlePlay = () => {
        // Open YouTube in new tab
        window.open(`https://www.youtube.com/watch?v=${song.youTubeId}`, '_blank');
        
        // Increment listen count
        incrementListenCount();
    };

    // 🔥 FIXED: Updates local state immediately for real-time updates
    const incrementListenCount = async () => {
        try {
            const response = await fetch(`http://localhost:4000/songs/${song._id}/listen`, {
                method: 'POST'
            });

            if (response.ok) {
                // Update LOCAL state immediately for real-time update
                setSong(prevSong => ({
                    ...prevSong,
                    listens: prevSong.listens + 1
                }));
                
                console.log('Listen count incremented successfully');
            }
        } catch (error) {
            console.error('Error incrementing listen count:', error);
        }
    };

    // Handle add to playlist menu
    const handleAddToPlaylist = (event) => {
        if (!auth.loggedIn) {
            alert('Please log in to add songs to playlists');
            return;
        }
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleAddToSpecificPlaylist = (playlistId) => {
        // TODO: Implement adding song to specific playlist
        console.log(`Adding song ${song._id} to playlist ${playlistId}`);
        handleCloseMenu();
    };

    return (
        <Card 
            sx={{ 
                margin: 1, 
                minWidth: 300,
                '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                }
            }}
        >
            <CardContent>
                {/* Song Title and Artist */}
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {song.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {song.artist} • {formatYear(song.year)}
                </Typography>

                {/* Stats Chips */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<HeadsetIcon />} 
                        label={formatListens(song.listens)}  
                        size="small" 
                        color="primary"
                    />
                    <Chip 
                        icon={<QueueMusicIcon />} 
                        label={song.playlistCount} 
                        size="small" 
                        color="secondary"
                    />
                    <Chip 
                        icon={<YouTubeIcon />} 
                        label="YouTube" 
                        size="small" 
                        sx={{ backgroundColor: '#FF0000', color: 'white' }}
                    />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <IconButton 
                        onClick={handlePlay}
                        sx={{ 
                            backgroundColor: 'primary.main', 
                            color: 'white',
                            '&:hover': { 
                                backgroundColor: 'primary.dark',
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        <PlayArrowIcon />
                    </IconButton>

                    {/* Only show Add to Playlist for logged in users (not guests) */}
                    {auth.loggedIn && (
                        <IconButton 
                            onClick={handleAddToPlaylist}
                            sx={{ 
                                backgroundColor: 'secondary.main', 
                                color: 'white',
                                '&:hover': { backgroundColor: 'secondary.dark' }
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    )}
                </Box>

                {/* Add to Playlist Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                >
                    {store.idNamePairs && store.idNamePairs.length > 0 ? (
                        store.idNamePairs.map((playlist) => (
                            <MenuItem 
                                key={playlist._id} 
                                onClick={() => handleAddToSpecificPlaylist(playlist._id)}
                            >
                                {playlist.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No playlists available</MenuItem>
                    )}
                </Menu>
            </CardContent>
        </Card>
    );
}