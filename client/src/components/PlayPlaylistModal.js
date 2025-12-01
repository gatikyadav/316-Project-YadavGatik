import React, { useState, useContext } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Avatar,
    List,
    ListItem,
    ListItemText,
    Button
} from '@mui/material';
import {
    Close as CloseIcon,
    Home as HomeIcon,
    MusicNote as MusicNoteIcon,
    PlayArrow as PlayIcon,
    SkipPrevious as SkipPreviousIcon,
    SkipNext as SkipNextIcon
} from '@mui/icons-material';

/*
    Play Playlist Modal component matching the specification exactly.
    Shows playlist info, song list, and YouTube player.
    
    @author Gatik Yadav
*/
export default function PlayPlaylistModal({ open, onClose, playlist }) {
    const [currentSongIndex, setCurrentSongIndex] = useState(0);

    // Mock songs data - in real app this would come from playlist details
    const mockSongs = [
        {
            id: 1,
            title: "Come Fly With Me",
            artist: "Frank Sinatra",
            year: 1958,
            youtubeId: "HmQq6yLe2ww" // Example YouTube ID
        },
        {
            id: 2,
            title: "Fast Train",
            artist: "Solomon Burke",
            year: 1985,
            youtubeId: "dQw4w9WgXcQ" // Example YouTube ID
        },
        {
            id: 3,
            title: "Highway Star",
            artist: "Deep Purple",
            year: 1972,
            youtubeId: "Wr9ie2J2690" // Example YouTube ID
        }
    ];

    const currentSong = mockSongs[currentSongIndex];

    const handlePreviousSong = () => {
        setCurrentSongIndex((prev) => 
            prev > 0 ? prev - 1 : mockSongs.length - 1
        );
    };

    const handleNextSong = () => {
        setCurrentSongIndex((prev) => 
            prev < mockSongs.length - 1 ? prev + 1 : 0
        );
    };

    const getPlaylistOwner = () => {
        if (playlist?.ownerEmail) {
            return playlist.ownerEmail.split('@')[0];
        }
        return 'Unknown';
    };

    const getAvatarColor = () => {
        const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'];
        const index = (playlist?.name?.length || 0) % colors.length;
        return colors[index];
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#f3f4f6',
                    borderRadius: 2,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header */}
            <Box sx={{ 
                bgcolor: '#10b981', 
                color: 'white', 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HomeIcon />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Play Playlist
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                        <MusicNoteIcon />
                    </Avatar>
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', height: '600px' }}>
                    {/* Left Side - Playlist Info and Songs */}
                    <Box sx={{ 
                        width: '50%', 
                        bgcolor: 'white',
                        borderRight: 1,
                        borderColor: 'divider'
                    }}>
                        {/* Playlist Header */}
                        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: getAvatarColor(), width: 48, height: 48 }}>
                                    <MusicNoteIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {playlist?.name || 'Unknown Playlist'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {getPlaylistOwner()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Songs List */}
                        <Box sx={{ height: 'calc(100% - 120px)', overflowY: 'auto' }}>
                            <List dense>
                                {mockSongs.map((song, index) => (
                                    <ListItem
                                        key={song.id}
                                        sx={{
                                            bgcolor: index === currentSongIndex ? '#fef3c7' : 'transparent',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#f3f4f6' },
                                            borderRadius: 1,
                                            mx: 1,
                                            my: 0.5
                                        }}
                                        onClick={() => setCurrentSongIndex(index)}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ fontWeight: index === currentSongIndex ? 'bold' : 'normal' }}>
                                                    {index + 1}. {song.title} by {song.artist} ({song.year})
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Right Side - YouTube Player */}
                    <Box sx={{ 
                        width: '50%', 
                        bgcolor: '#dcfce7',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* YouTube Player */}
                        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{
                                bgcolor: '#7f1d1d',
                                borderRadius: 2,
                                height: 250,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                mb: 3
                            }}>
                                {/* Mock YouTube Player */}
                                <Typography variant="h6">
                                    🎵 {currentSong?.title} 🎵
                                </Typography>
                            </Box>

                            {/* Controls */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                gap: 2,
                                mb: 3
                            }}>
                                <IconButton 
                                    onClick={handlePreviousSong}
                                    sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f3f4f6' } }}
                                >
                                    <SkipPreviousIcon />
                                </IconButton>
                                <IconButton 
                                    sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f3f4f6' } }}
                                >
                                    <PlayIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={handleNextSong}
                                    sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f3f4f6' } }}
                                >
                                    <SkipNextIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Close Button */}
                        <Box sx={{ p: 3, textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                onClick={onClose}
                                sx={{
                                    bgcolor: '#10b981',
                                    '&:hover': { bgcolor: '#059669' },
                                    px: 4
                                }}
                            >
                                Close
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}