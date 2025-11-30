const auth = require('../auth')

// We'll need to get the database manager instance
// This will be set up when the server starts
let dbManager = null;

// Function to set the database manager (called from server startup)
const setDatabaseManager = (manager) => {
    dbManager = manager;
}

/*
    This is the Songs Controller for the global songs catalog.
    It provides all the API endpoints for song management.
    
    NEW for Final Project - Songs Catalog functionality
    
    @author [Your Name]
*/

// Get all songs with optional search and sorting
getAllSongs = async (req, res) => {
    try {
        const { 
            search = '', 
            sortBy = 'title', 
            sortOrder = 'asc' 
        } = req.query;

        let songs;
        if (search && search.trim() !== '') {
            songs = await dbManager.searchSongs(search, sortBy, sortOrder);
        } else {
            songs = await dbManager.getAllSongs(sortBy, sortOrder);
        }

        return res.status(200).json({ 
            success: true, 
            songs: songs 
        });
        
    } catch (error) {
        console.error("Error getting songs:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

// Get a specific song by ID
getSongById = async (req, res) => {
    try {
        const song = await dbManager.findSongById(req.params.id);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }

        return res.status(200).json({ 
            success: true, 
            song: song 
        });
        
    } catch (error) {
        console.error("Error getting song:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

// Create a new song in the catalog
createSong = async (req, res) => {
    // For now, only authenticated users can add songs
    // Later we might allow guests with moderation
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED - Must be logged in to add songs'
        })
    }
    
    try {
        const { title, artist, year, youTubeId } = req.body;
        
        // Validate required fields
        if (!title || !artist || !year || !youTubeId) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Title, artist, year, and YouTube ID are required'
            });
        }

        // Create the song
        const songData = {
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year),
            youTubeId: youTubeId.trim(),
            listens: 0,
            playlistCount: 0
        };

        const song = await dbManager.createSong(songData);
        
        return res.status(201).json({
            success: true,
            song: song
        });
        
    } catch (error) {
        console.error("Error creating song:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

// Update a song in the catalog
updateSong = async (req, res) => {
    // For now, only authenticated users can edit songs
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED - Must be logged in to edit songs'
        })
    }
    
    try {
        const songId = req.params.id;
        const { title, artist, year, youTubeId } = req.body;
        
        // Build update object with only provided fields
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (artist !== undefined) updateData.artist = artist.trim();
        if (year !== undefined) updateData.year = parseInt(year);
        if (youTubeId !== undefined) updateData.youTubeId = youTubeId.trim();

        const song = await dbManager.updateSong(songId, updateData);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }

        return res.status(200).json({
            success: true,
            song: song
        });
        
    } catch (error) {
        console.error("Error updating song:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

// Delete a song from the catalog
deleteSong = async (req, res) => {
    // For now, only authenticated users can delete songs
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED - Must be logged in to delete songs'
        })
    }
    
    try {
        const songId = req.params.id;
        
        const song = await dbManager.deleteSong(songId);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Song deleted successfully'
        });
        
    } catch (error) {
        console.error("Error deleting song:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

// Increment listen count for a song (used when playing)
incrementListens = async (req, res) => {
    try {
        const songId = req.params.id;
        
        const song = await dbManager.incrementSongListens(songId);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }

        return res.status(200).json({
            success: true,
            song: song
        });
        
    } catch (error) {
        console.error("Error incrementing listens:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

// Check if a song exists by title, artist, and year
checkSongExists = async (req, res) => {
    try {
        const { title, artist, year } = req.query;
        
        if (!title || !artist || !year) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Title, artist, and year are required'
            });
        }

        const exists = await dbManager.songExists(title, artist, parseInt(year));
        
        return res.status(200).json({
            success: true,
            exists: exists
        });
        
    } catch (error) {
        console.error("Error checking song exists:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

// Get song statistics
getSongStats = async (req, res) => {
    try {
        const stats = await dbManager.getSongStats();
        
        return res.status(200).json({
            success: true,
            stats: stats
        });
        
    } catch (error) {
        console.error("Error getting song stats:", error);
        return res.status(400).json({
            success: false,
            errorMessage: error.message
        });
    }
}

module.exports = {
    getAllSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong,
    incrementListens,
    checkSongExists,
    getSongStats,
    setDatabaseManager
}