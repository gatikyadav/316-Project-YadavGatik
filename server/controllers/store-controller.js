const auth = require('../auth')

// We'll need to get the database manager instance
// This will be set up when the server starts
let dbManager = null;

// Function to set the database manager (called from server startup)
const setDatabaseManager = (manager) => {
    dbManager = manager;
}

/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

createPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        const body = req.body;
        console.log("createPlaylist body: " + JSON.stringify(body));
        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a Playlist',
            })
        }
        
        // Create the playlist using DatabaseManager
        const playlist = await dbManager.createPlaylist(body);
        console.log("playlist: " + JSON.stringify(playlist));
        
        // Get playlist ID (handle both MongoDB and PostgreSQL)
        const playlistId = playlist._id || playlist.id;
        
        // Add playlist to user
        await dbManager.addPlaylistToUser(req.userId, playlistId);
        
        return res.status(201).json({
            playlist: playlist
        });
        
    } catch (error) {
        console.error("Error creating playlist:", error);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        });
    }
}

deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
        console.log("delete " + req.params.id);
        
        // Check if playlist exists
        const playlist = await dbManager.findPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            });
        }
        
        console.log("playlist found: " + JSON.stringify(playlist));
        
        // Validate user owns this playlist
        const userOwnsPlaylist = await dbManager.validateUserOwnsPlaylist(req.userId, req.params.id);
        if (!userOwnsPlaylist) {
            console.log("incorrect user!");
            return res.status(400).json({ 
                errorMessage: "authentication error" 
            });
        }
        
        console.log("correct user!");
        
        // Delete the playlist
        await dbManager.deletePlaylist(req.params.id);
        return res.status(200).json({});
        
    } catch (error) {
        console.error("Error deleting playlist:", error);
        return res.status(400).json({
            errorMessage: 'Error deleting playlist'
        });
    }
}

getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        console.log("Find Playlist with id: " + JSON.stringify(req.params.id));
        
        const playlist = await dbManager.findPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(400).json({ success: false, error: "Playlist not found" });
        }
        
        console.log("Found list: " + JSON.stringify(playlist));
        
        // Validate user owns this playlist
        const userOwnsPlaylist = await dbManager.validateUserOwnsPlaylist(req.userId, req.params.id);
        if (!userOwnsPlaylist) {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
        
        console.log("correct user!");
        return res.status(200).json({ success: true, playlist: playlist });
        
    } catch (error) {
        console.error("Error getting playlist:", error);
        return res.status(400).json({ success: false, error: error.message });
    }
}

getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        console.log("getPlaylistPairs");
        console.log("find user with id " + req.userId);
        
        // Find user to get their email
        const user = await dbManager.findUserById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, error: "User not found" });
        }
        
        console.log("find all Playlists owned by " + user.email);
        
        // Find all playlists owned by this user
        const playlists = await dbManager.findPlaylistsByOwnerEmail(user.email);
        console.log("found Playlists: " + JSON.stringify(playlists));
        
        if (!playlists || playlists.length === 0) {
            console.log("!playlists.length");
            return res.status(404).json({ success: false, error: 'Playlists not found' });
        }
        
        console.log("Send the Playlist pairs");
        // PUT ALL THE LISTS INTO ID, NAME PAIRS
        let pairs = [];
        for (let playlist of playlists) {
            let pair = {
                _id: playlist._id || playlist.id, // Handle both MongoDB and PostgreSQL
                name: playlist.name
            };
            pairs.push(pair);
        }
        return res.status(200).json({ success: true, idNamePairs: pairs });
        
    } catch (error) {
        console.error("Error getting playlist pairs:", error);
        return res.status(400).json({ success: false, error: error.message });
    }
}

getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        const playlists = await dbManager.getAllPlaylists();
        
        if (!playlists || playlists.length === 0) {
            return res.status(404).json({ success: false, error: `Playlists not found` });
        }
        
        return res.status(200).json({ success: true, data: playlists });
        
    } catch (error) {
        console.error("Error getting all playlists:", error);
        return res.status(400).json({ success: false, error: error.message });
    }
}

updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        const body = req.body;
        console.log("updatePlaylist: " + JSON.stringify(body));
        
        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a body to update',
            });
        }

        // Find the playlist
        const playlist = await dbManager.findPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            });
        }
        
        console.log("playlist found: " + JSON.stringify(playlist));
        
        // Validate user owns this playlist
        const userOwnsPlaylist = await dbManager.validateUserOwnsPlaylist(req.userId, req.params.id);
        if (!userOwnsPlaylist) {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
        
        console.log("correct user!");

        // Handle the update data - check if it's nested under 'playlist' or directly in body
        let updateData;
        if (body.playlist) {
            // Data is nested under playlist key
            updateData = {
                name: body.playlist.name,
                songs: body.playlist.songs
            };
            console.log("Using nested playlist data - name: " + body.playlist.name);
        } else {
            // Data is directly in body
            updateData = {
                name: body.name,
                songs: body.songs
            };
            console.log("Using direct body data - name: " + body.name);
        }
        
        console.log("Final updateData: " + JSON.stringify(updateData));
        
        // Update the playlist
        const updatedPlaylist = await dbManager.updatePlaylist(req.params.id, updateData);
        
        console.log("SUCCESS!!! Updated playlist: " + JSON.stringify(updatedPlaylist));
        return res.status(200).json({
            success: true,
            id: updatedPlaylist._id || updatedPlaylist.id,
            message: 'Playlist updated!',
        });
        
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        console.log("Error message: " + error.message);
        console.log("Error stack: " + error.stack);
        return res.status(404).json({
            error: error.message,
            message: 'Playlist not updated!',
        });
    }
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist,
    setDatabaseManager
}