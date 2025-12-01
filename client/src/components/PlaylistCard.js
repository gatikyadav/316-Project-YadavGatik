import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import PlayPlaylistModal from './PlayPlaylistModal'
import EditPlaylistModal from './EditPlaylistModal'

import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Avatar,
    Stack,
    IconButton
} from '@mui/material'
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    FileCopy as CopyIcon,
    PlayArrow as PlayIcon,
    MusicNote as MusicNoteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material'

/*
    This React component represents a single playlist card in the list.
    Matches the Playlister specification exactly with proper button functionality.
    
    @author Gatik Yadav
*/
export default function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const { idNamePair, selected } = props;
    const [expanded, setExpanded] = useState(false);
    const [showPlayModal, setShowPlayModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Mock data for demo - in real app this would come from the playlist details
    const mockListeners = Math.floor(Math.random() * 200) + 1; // Random number 1-200
    const mockLikes = Math.floor(Math.random() * 50);
    const mockDislikes = Math.floor(Math.random() * 10);
    const mockSongCount = Math.floor(Math.random() * 20) + 1;

    // Action handlers
    const handleDelete = (event) => {
        event.stopPropagation();
        store.markListForDeletion(idNamePair._id);
    };

    const handleEdit = (event) => {
        event.stopPropagation();
        console.log("🎵 Opening Edit Modal for:", idNamePair.name);
        setShowEditModal(true);
    };

    const handleCopy = (event) => {
        event.stopPropagation();
        store.duplicateList(idNamePair._id);
    };

    const handlePlay = (event) => {
        event.stopPropagation();
        console.log("🎶 Opening Play Modal for:", idNamePair.name);
        setShowPlayModal(true);
    };

    const handleExpand = (event) => {
        event.stopPropagation();
        setExpanded(!expanded);
    };

    // Get owner name from email
    const getOwnerName = () => {
        if (idNamePair.ownerEmail) {
            return idNamePair.ownerEmail.split('@')[0];
        }
        return auth.user?.firstName || 'Unknown';
    };

    // Generate avatar color based on playlist name
    const getAvatarColor = () => {
        const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'];
        const index = idNamePair.name.length % colors.length;
        return colors[index];
    };

    let selectClass = "unselected-list-card";
    if (selected) {
        selectClass = "selected-list-card";
    }

    return (
        <>
            <Card
                id={idNamePair._id}
                className={selectClass}
                sx={{
                    mb: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-1px)'
                    },
                    bgcolor: selected ? '#e0e7ff' : 'white'
                }}
                //  REMOVED: onClick handler - no more clicking on playlist card
            >
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Avatar */}
                        <Avatar
                            sx={{
                                bgcolor: getAvatarColor(),
                                width: 48,
                                height: 48,
                                fontSize: '1.2rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <MusicNoteIcon />
                        </Avatar>

                        {/* Playlist Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
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
                                {idNamePair.name}
                            </Typography>
                            
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                            >
                                {getOwnerName()}
                            </Typography>
                            
                            <Typography
                                variant="body2"
                                sx={{ color: '#6366f1', fontWeight: 'medium' }}
                            >
                                {mockListeners} Listener{mockListeners !== 1 ? 's' : ''}
                            </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={0.5}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleDelete}
                                sx={{
                                    bgcolor: '#ef4444',
                                    minWidth: 40,
                                    px: 1,
                                    '&:hover': { bgcolor: '#dc2626' }
                                }}
                            >
                                Delete
                            </Button>
                            
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleEdit}
                                sx={{
                                    bgcolor: '#3b82f6',
                                    minWidth: 40,
                                    px: 1,
                                    '&:hover': { bgcolor: '#2563eb' }
                                }}
                            >
                                Edit
                            </Button>
                            
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleCopy}
                                sx={{
                                    bgcolor: '#10b981',
                                    minWidth: 40,
                                    px: 1,
                                    '&:hover': { bgcolor: '#059669' }
                                }}
                            >
                                Copy
                            </Button>
                            
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handlePlay}
                                sx={{
                                    bgcolor: '#8b5cf6',
                                    minWidth: 40,
                                    px: 1,
                                    '&:hover': { bgcolor: '#7c3aed' }
                                }}
                            >
                                Play
                            </Button>
                        </Stack>

                        {/* Expand/Collapse Button */}
                        <IconButton
                            size="small"
                            onClick={handleExpand}
                            sx={{ ml: 1 }}
                        >
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>

                    {/* Expanded Details */}
                    {expanded && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={3}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Songs:</strong> {mockSongCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Likes:</strong> {mockLikes}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Dislikes:</strong> {mockDislikes}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Created:</strong> {new Date(idNamePair.createdAt || Date.now()).toLocaleDateString()}
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/*  NEW: Play Playlist Modal */}
            <PlayPlaylistModal 
                open={showPlayModal}
                onClose={() => setShowPlayModal(false)}
                playlist={idNamePair}
            />

            {/*  NEW: Edit Playlist Modal */}
            <EditPlaylistModal 
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                playlist={idNamePair}
            />
        </>
    );
}