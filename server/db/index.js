/*
    DatabaseManager - Base class that defines the interface for all database operations
    This serves as the "interface" that both MongoDB and PostgreSQL implementations must follow.
    
    EXTENDED for Final Project to include Songs Catalog operations
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

class DatabaseManager {
    constructor() {
        if (this.constructor === DatabaseManager) {
            throw new Error("DatabaseManager is an abstract class and cannot be instantiated directly");
        }
    }

    // Connection and initialization
    async initialize() {
        throw new Error("initialize() method must be implemented");
    }

    async close() {
        throw new Error("close() method must be implemented");
    }

    // User operations
    async findUserById(userId) {
        throw new Error("findUserById() method must be implemented");
    }

    async findUserByEmail(email) {
        throw new Error("findUserByEmail() method must be implemented");
    }

    async createUser(userData) {
        throw new Error("createUser() method must be implemented");
    }

    async updateUser(userId, userData) {
        throw new Error("updateUser() method must be implemented");
    }

    async deleteUser(userId) {
        throw new Error("deleteUser() method must be implemented");
    }

    // Playlist operations
    async createPlaylist(playlistData) {
        throw new Error("createPlaylist() method must be implemented");
    }

    async findPlaylistById(playlistId) {
        throw new Error("findPlaylistById() method must be implemented");
    }

    async findPlaylistsByOwnerEmail(email) {
        throw new Error("findPlaylistsByOwnerEmail() method must be implemented");
    }

    async updatePlaylist(playlistId, playlistData) {
        throw new Error("updatePlaylist() method must be implemented");
    }

    async deletePlaylist(playlistId) {
        throw new Error("deletePlaylist() method must be implemented");
    }

    async getAllPlaylists() {
        throw new Error("getAllPlaylists() method must be implemented");
    }

    // Song operations for global catalog (NEW FOR FINAL PROJECT)
    async createSong(songData) {
        throw new Error("createSong() method must be implemented");
    }

    async findSongById(songId) {
        throw new Error("findSongById() method must be implemented");
    }

    async findSongByTitleArtistYear(title, artist, year) {
        throw new Error("findSongByTitleArtistYear() method must be implemented");
    }

    async searchSongs(searchTerm, sortBy = 'title', sortOrder = 'asc') {
        throw new Error("searchSongs() method must be implemented");
    }

    async getAllSongs(sortBy = 'title', sortOrder = 'asc') {
        throw new Error("getAllSongs() method must be implemented");
    }

    async updateSong(songId, songData) {
        throw new Error("updateSong() method must be implemented");
    }

    async deleteSong(songId) {
        throw new Error("deleteSong() method must be implemented");
    }

    async incrementSongListens(songId) {
        throw new Error("incrementSongListens() method must be implemented");
    }

    async updateSongPlaylistCount(songId, count) {
        throw new Error("updateSongPlaylistCount() method must be implemented");
    }

    // Song utility methods
    async songExists(title, artist, year) {
        throw new Error("songExists() method must be implemented");
    }

    async getSongStats() {
        throw new Error("getSongStats() method must be implemented");
    }

    // User-Playlist relationship operations
    async addPlaylistToUser(userId, playlistId) {
        throw new Error("addPlaylistToUser() method must be implemented");
    }

    async removePlaylistFromUser(userId, playlistId) {
        throw new Error("removePlaylistFromUser() method must be implemented");
    }

    // Utility methods
    async validateUserOwnsPlaylist(userId, playlistId) {
        throw new Error("validateUserOwnsPlaylist() method must be implemented");
    }

    // Playlist search and sorting (ENHANCED FOR FINAL PROJECT)
    async searchPlaylists(searchTerm, searchBy = 'name', sortBy = 'name', sortOrder = 'asc') {
        throw new Error("searchPlaylists() method must be implemented");
    }

    async getPlaylistsByUser(userEmail, sortBy = 'name', sortOrder = 'asc') {
        throw new Error("getPlaylistsByUser() method must be implemented");
    }

    // Guest user operations (NEW FOR FINAL PROJECT)
    async getPublicPlaylists(sortBy = 'name', sortOrder = 'asc') {
        throw new Error("getPublicPlaylists() method must be implemented");
    }
}

module.exports = DatabaseManager;