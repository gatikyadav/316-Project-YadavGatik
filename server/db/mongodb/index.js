/*
    MongoDB DatabaseManager Implementation - EXTENDED FOR FINAL PROJECT
    Contains ALL Mongoose-specific code for the application.
    Implements the DatabaseManager interface using MongoDB/Mongoose.
    
    NEW: Includes Songs Catalog operations for final project
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

const DatabaseManager = require('../index');
const mongoose = require('mongoose');

// Import Mongoose models
const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');
const Song = require('../../models/song-model'); // NEW: Song model

class MongoDBManager extends DatabaseManager {
    constructor() {
        super();
        this.connection = null;
    }

    async initialize() {
        try {
            this.connection = await mongoose.connect(process.env.DB_CONNECT, { 
                useNewUrlParser: true 
            });
            console.log('MongoDB connected successfully');
            return this.connection;
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.connection) {
            await mongoose.connection.close();
            this.connection = null;
        }
    }

    // User operations (unchanged from HW4)
    async findUserById(userId) {
        try {
            return await User.findOne({ _id: userId });
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    async findUserByEmail(email) {
        try {
            return await User.findOne({ email: email });
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            const newUser = new User(userData);
            return await newUser.save();
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async updateUser(userId, userData) {
        try {
            return await User.findByIdAndUpdate(userId, userData, { new: true });
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            return await User.findByIdAndDelete(userId);
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Playlist operations (unchanged from HW4)
    async createPlaylist(playlistData) {
        try {
            const playlist = new Playlist(playlistData);
            return await playlist.save();
        } catch (error) {
            throw new Error(`Error creating playlist: ${error.message}`);
        }
    }

    async findPlaylistById(playlistId) {
        try {
            return await Playlist.findById({ _id: playlistId });
        } catch (error) {
            throw new Error(`Error finding playlist by ID: ${error.message}`);
        }
    }

    async findPlaylistsByOwnerEmail(email) {
        try {
            return await Playlist.find({ ownerEmail: email });
        } catch (error) {
            throw new Error(`Error finding playlists by owner email: ${error.message}`);
        }
    }

    async updatePlaylist(playlistId, playlistData) {
        try {
            const playlist = await Playlist.findOne({ _id: playlistId });
            if (!playlist) {
                throw new Error('Playlist not found');
            }
            
            // Update playlist fields
            if (playlistData.name !== undefined) playlist.name = playlistData.name;
            if (playlistData.songs !== undefined) playlist.songs = playlistData.songs;
            if (playlistData.ownerEmail !== undefined) playlist.ownerEmail = playlistData.ownerEmail;
            
            return await playlist.save();
        } catch (error) {
            throw new Error(`Error updating playlist: ${error.message}`);
        }
    }

    async deletePlaylist(playlistId) {
        try {
            return await Playlist.findOneAndDelete({ _id: playlistId });
        } catch (error) {
            throw new Error(`Error deleting playlist: ${error.message}`);
        }
    }

    async getAllPlaylists() {
        try {
            return await Playlist.find({});
        } catch (error) {
            throw new Error(`Error getting all playlists: ${error.message}`);
        }
    }

    // Song operations (NEW FOR FINAL PROJECT)
    async createSong(songData) {
        try {
            // Check if song already exists
            const existing = await this.songExists(songData.title, songData.artist, songData.year);
            if (existing) {
                throw new Error(`Song "${songData.title}" by ${songData.artist} (${songData.year}) already exists`);
            }
            
            const song = new Song(songData);
            return await song.save();
        } catch (error) {
            throw new Error(`Error creating song: ${error.message}`);
        }
    }

    async findSongById(songId) {
        try {
            return await Song.findById(songId);
        } catch (error) {
            throw new Error(`Error finding song by ID: ${error.message}`);
        }
    }

    async findSongByTitleArtistYear(title, artist, year) {
        try {
            return await Song.findOne({ 
                title: { $regex: new RegExp(`^${title}$`, 'i') },
                artist: { $regex: new RegExp(`^${artist}$`, 'i') },
                year: year 
            });
        } catch (error) {
            throw new Error(`Error finding song by title/artist/year: ${error.message}`);
        }
    }

    async searchSongs(searchTerm, sortBy = 'title', sortOrder = 'asc') {
        try {
            let query = {};
            
            if (searchTerm && searchTerm.trim() !== '') {
                query = {
                    $or: [
                        { title: { $regex: searchTerm, $options: 'i' } },
                        { artist: { $regex: searchTerm, $options: 'i' } }
                    ]
                };
            }
            
            const sortObj = {};
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            return await Song.find(query).sort(sortObj);
        } catch (error) {
            throw new Error(`Error searching songs: ${error.message}`);
        }
    }

    async getAllSongs(sortBy = 'title', sortOrder = 'asc') {
        try {
            const sortObj = {};
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            return await Song.find({}).sort(sortObj);
        } catch (error) {
            throw new Error(`Error getting all songs: ${error.message}`);
        }
    }

    async updateSong(songId, songData) {
        try {
            // If updating title, artist, or year, check for duplicates
            if (songData.title || songData.artist || songData.year) {
                const currentSong = await Song.findById(songId);
                if (!currentSong) {
                    throw new Error('Song not found');
                }
                
                const newTitle = songData.title || currentSong.title;
                const newArtist = songData.artist || currentSong.artist;
                const newYear = songData.year || currentSong.year;
                
                const existing = await this.findSongByTitleArtistYear(newTitle, newArtist, newYear);
                if (existing && existing._id.toString() !== songId) {
                    throw new Error(`Song "${newTitle}" by ${newArtist} (${newYear}) already exists`);
                }
            }
            
            return await Song.findByIdAndUpdate(songId, songData, { new: true });
        } catch (error) {
            throw new Error(`Error updating song: ${error.message}`);
        }
    }

    async deleteSong(songId) {
        try {
            return await Song.findByIdAndDelete(songId);
        } catch (error) {
            throw new Error(`Error deleting song: ${error.message}`);
        }
    }

    async incrementSongListens(songId) {
        try {
            return await Song.findByIdAndUpdate(
                songId, 
                { $inc: { listens: 1 } }, 
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error incrementing song listens: ${error.message}`);
        }
    }

    async updateSongPlaylistCount(songId, count) {
        try {
            return await Song.findByIdAndUpdate(
                songId, 
                { playlistCount: count }, 
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating song playlist count: ${error.message}`);
        }
    }

    async songExists(title, artist, year) {
        try {
            const song = await this.findSongByTitleArtistYear(title, artist, year);
            return song !== null;
        } catch (error) {
            throw new Error(`Error checking if song exists: ${error.message}`);
        }
    }

    async getSongStats() {
        try {
            const totalSongs = await Song.countDocuments();
            const mostListened = await Song.findOne().sort({ listens: -1 });
            const mostInPlaylists = await Song.findOne().sort({ playlistCount: -1 });
            
            return {
                totalSongs,
                mostListened,
                mostInPlaylists
            };
        } catch (error) {
            throw new Error(`Error getting song stats: ${error.message}`);
        }
    }

    // Enhanced Playlist operations (NEW FOR FINAL PROJECT)
    async searchPlaylists(searchTerm, searchBy = 'name', sortBy = 'name', sortOrder = 'asc') {
        try {
            let query = {};
            
            if (searchTerm && searchTerm.trim() !== '') {
                if (searchBy === 'name') {
                    query.name = { $regex: searchTerm, $options: 'i' };
                } else if (searchBy === 'user') {
                    query.ownerEmail = { $regex: searchTerm, $options: 'i' };
                }
            }
            
            const sortObj = {};
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            return await Playlist.find(query).sort(sortObj);
        } catch (error) {
            throw new Error(`Error searching playlists: ${error.message}`);
        }
    }

    async getPlaylistsByUser(userEmail, sortBy = 'name', sortOrder = 'asc') {
        try {
            const sortObj = {};
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            return await Playlist.find({ ownerEmail: userEmail }).sort(sortObj);
        } catch (error) {
            throw new Error(`Error getting playlists by user: ${error.message}`);
        }
    }

    async getPublicPlaylists(sortBy = 'name', sortOrder = 'asc') {
        try {
            const sortObj = {};
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            // For now, return all playlists as "public" - can add privacy settings later
            return await Playlist.find({}).sort(sortObj);
        } catch (error) {
            throw new Error(`Error getting public playlists: ${error.message}`);
        }
    }

    // User-Playlist relationship operations (unchanged from HW4)
    async addPlaylistToUser(userId, playlistId) {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) {
                throw new Error('User not found');
            }
            
            user.playlists.push(playlistId);
            return await user.save();
        } catch (error) {
            throw new Error(`Error adding playlist to user: ${error.message}`);
        }
    }

    async removePlaylistFromUser(userId, playlistId) {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) {
                throw new Error('User not found');
            }
            
            user.playlists = user.playlists.filter(id => id.toString() !== playlistId.toString());
            return await user.save();
        } catch (error) {
            throw new Error(`Error removing playlist from user: ${error.message}`);
        }
    }

    // Utility methods (unchanged from HW4)
    async validateUserOwnsPlaylist(userId, playlistId) {
        try {
            const playlist = await this.findPlaylistById(playlistId);
            if (!playlist) {
                return false;
            }
            
            const user = await this.findUserById(userId);
            if (!user) {
                return false;
            }
            
            // In MongoDB, we check if the playlist's ownerEmail matches the user's email
            return playlist.ownerEmail === user.email;
        } catch (error) {
            throw new Error(`Error validating user owns playlist: ${error.message}`);
        }
    }
}

module.exports = MongoDBManager;