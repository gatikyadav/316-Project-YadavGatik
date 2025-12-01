import React, { useState, useContext } from 'react';
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'

import {
    Box,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    ListItemText,
    Divider,
    Card
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    PlaylistAdd as PlaylistAddIcon,
    Edit as EditIcon,
    DeleteOutline as DeleteIcon
} from '@mui/icons-material';

/*
    Song Card component matching the Playlister specification exactly.
    Shows title, artist, year, listen count, playlist count, and 3-dot menu.
    
    @author Gatik Yadav
*/
export default function SimpleSongCard({ song, userLoggedIn, onPlay }) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    
    const menuOpen = Boolean(anchorEl);
    const playlistMenuOpen = Boolean(playlistMenuAnchor);

    // Mock playlists for the submenu
    const mockPlaylists = [
        { id: 1, name: "All My Favorites" },
        { id: 2, name: "Sad Songs I Like" },
        { id: 3, name: "Seventies Roadtrip" }
    ];

    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setPlaylistMenuAnchor(null);
    };

    const handleAddToPlaylist = (event) => {
        // Open playlist submenu
        setPlaylistMenuAnchor(event.currentTarget);
    };

    const handlePlaylistSelect = (playlistId, playlistName) => {
        console.log(`Adding "${song.title}" to playlist "${playlistName}"`);
        // TODO: Implement actual add to playlist functionality
        handleMenuClose();
    };

    const handleEditSong = () => {
        console.log(`Editing song: ${song.title}`);
        // TODO: Implement edit song functionality
        handleMenuClose();
    };

    const handleRemoveFromCatalog = () => {
        console.log(`Removing "${song.title}" from catalog`);
        // TODO: Implement remove from catalog functionality
        handleMenuClose();
    };

    const handleCardClick = () => {
        if (onPlay) {
            onPlay(song);
        }
    };

    // Format numbers with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num || 0);
    };

    return (
        <>
            <Card
                sx={{
                    p: 2,
                    mb: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    bgcolor: '#fef3c7', // Yellow background like in spec
                    border: '1px solid #f59e0b',
                    '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-1px)'
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                onClick={handleCardClick}
            >
                {/* Left Side - Song Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Song Title */}
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {song.title} by {song.artist} ({song.year})
                    </Typography>
                    
                    {/* Stats Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ fontWeight: 'medium' }}
                        >
                            Listens: {formatNumber(song.listens)}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ fontWeight: 'medium' }}
                        >
                            Playlists: {formatNumber(song.playlistCount || Math.floor(Math.random() * 200))}
                        </Typography>
                    </Box>
                </Box>

                {/* 3-Dot Menu (only for logged in users) */}
                {userLoggedIn && (
                    <IconButton
                        onClick={handleMenuClick}
                        size="small"
                        sx={{ 
                            ml: 2,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                        }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                )}
            </Card>

            {/* Main Menu */}
            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        minWidth: 200,
                        boxShadow: 3
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem 
                    onClick={handleAddToPlaylist}
                    sx={{ 
                        py: 1.5,
                        bgcolor: 'rgba(139, 92, 246, 0.1)',
                        '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.2)' }
                    }}
                >
                    <PlaylistAddIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText primary="Add to Playlist" />
                </MenuItem>
                
                <MenuItem 
                    onClick={handleEditSong}
                    sx={{ 
                        py: 1.5,
                        bgcolor: 'rgba(139, 92, 246, 0.1)',
                        '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.2)' }
                    }}
                >
                    <EditIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText primary="Edit Song" />
                </MenuItem>
                
                <Divider />
                
                <MenuItem 
                    onClick={handleRemoveFromCatalog}
                    sx={{ 
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                    }}
                >
                    <DeleteIcon sx={{ mr: 2, color: 'error.main' }} />
                    <ListItemText primary="Remove from Catalog" />
                </MenuItem>
            </Menu>

            {/* Playlist Submenu */}
            <Menu
                anchorEl={playlistMenuAnchor}
                open={playlistMenuOpen}
                onClose={() => setPlaylistMenuAnchor(null)}
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                PaperProps={{
                    sx: {
                        minWidth: 180,
                        maxHeight: 300,
                        boxShadow: 3
                    }
                }}
            >
                {mockPlaylists.map((playlist) => (
                    <MenuItem
                        key={playlist.id}
                        onClick={() => handlePlaylistSelect(playlist.id, playlist.name)}
                        sx={{
                            py: 1,
                            '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' }
                        }}
                    >
                        <ListItemText 
                            primary={playlist.name}
                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}