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
    TextField,
    Button,
    Stack
} from '@mui/material';
import {
    Close as CloseIcon,
    Home as HomeIcon,
    MusicNote as MusicNoteIcon,
    Edit as EditIcon,
    FileCopy as CopyIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Undo as UndoIcon,
    Redo as RedoIcon
} from '@mui/icons-material';

/*
    Edit Playlist Modal component matching the specification exactly.
    Shows editable playlist name and song list with edit capabilities.
    
    @author Gatik Yadav
*/
export default function EditPlaylistModal({ open, onClose, playlist }) {
    const [playlistName, setPlaylistName] = useState(playlist?.name || '');
    const [songs, setSongs] = useState([
        {
            id: 1,
            title: "Come Fly With Me",
            artist: "Frank Sinatra",
            year: 1958
        },
        {
            id: 2,
            title: "Fast Train",
            artist: "Solomon Burke",
            year: 1985
        },
        {
            id: 3,
            title: "Highway Star",
            artist: "Deep Purple",
            year: 1972
        }
    ]);

    const handleEditSong = (songId) => {
        console.log("Editing song:", songId);
        // TODO: Implement song editing functionality
    };

    const handleCopySong = (songId) => {
        console.log("Copying song:", songId);
        // TODO: Implement song copying functionality
    };

    const handleDeleteSong = (songId) => {
        setSongs(songs.filter(song => song.id !== songId));
    };

    const handleAddSong = () => {
        console.log("Adding new song");
        // TODO: Implement add song functionality
    };

    const handleUndo = () => {
        console.log("Undo action");
        // TODO: Implement undo functionality
    };

    const handleRedo = () => {
        console.log("Redo action");
        // TODO: Implement redo functionality
    };

    const handleSave = () => {
        console.log("Saving playlist:", { name: playlistName, songs });
        // TODO: Implement save functionality
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                        Edit Playlist
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
                <Box sx={{ height: '600px', bgcolor: '#dcfce7' }}>
                    {/* Content Area */}
                    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Editable Playlist Name */}
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                variant="standard"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                sx={{
                                    '& .MuiInput-root': {
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        bgcolor: 'white',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 1
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton size="small">
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    )
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{
                                    bgcolor: '#8b5cf6',
                                    '&:hover': { bgcolor: '#7c3aed' },
                                    mt: 2,
                                    px: 3
                                }}
                                onClick={handleAddSong}
                            >
                                + ♪
                            </Button>
                        </Box>

                        {/* Songs List */}
                        <Box sx={{ 
                            flex: 1, 
                            bgcolor: 'white', 
                            borderRadius: 2, 
                            p: 2,
                            overflowY: 'auto'
                        }}>
                            <List dense>
                                {songs.map((song, index) => (
                                    <ListItem
                                        key={song.id}
                                        sx={{
                                            bgcolor: '#fef3c7',
                                            borderRadius: 1,
                                            mb: 1,
                                            border: 1,
                                            borderColor: '#f59e0b',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            px: 2,
                                            py: 1
                                        }}
                                    >
                                        <Typography sx={{ flex: 1 }}>
                                            {index + 1}. {song.title} by {song.artist} ({song.year})
                                        </Typography>
                                        
                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditSong(song.id)}
                                                sx={{ 
                                                    bgcolor: 'white',
                                                    '&:hover': { bgcolor: '#f3f4f6' }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCopySong(song.id)}
                                                sx={{ 
                                                    bgcolor: 'white',
                                                    '&:hover': { bgcolor: '#f3f4f6' }
                                                }}
                                            >
                                                <CopyIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteSong(song.id)}
                                                sx={{ 
                                                    bgcolor: 'white',
                                                    '&:hover': { bgcolor: '#f3f4f6' }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Bottom Controls */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mt: 3
                        }}>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    startIcon={<UndoIcon />}
                                    onClick={handleUndo}
                                    sx={{
                                        bgcolor: '#8b5cf6',
                                        '&:hover': { bgcolor: '#7c3aed' }
                                    }}
                                >
                                    Undo
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<RedoIcon />}
                                    onClick={handleRedo}
                                    sx={{
                                        bgcolor: '#8b5cf6',
                                        '&:hover': { bgcolor: '#7c3aed' }
                                    }}
                                >
                                    Redo
                                </Button>
                            </Stack>

                            <Button
                                variant="contained"
                                onClick={handleSave}
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