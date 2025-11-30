/*
    This is where we'll route all of the received http requests
    for Songs Catalog functionality into controller response functions.
    
    NEW for Final Project - Songs Catalog routes
    
    @author Gatik Yadav
*/
const express = require('express')
const SongsController = require('../controllers/songs-controller')
const router = express.Router()
const auth = require('../auth')

// GET /songs - Get all songs with optional search and sorting
// Query params: search, sortBy, sortOrder
// Public route - no auth required for browsing
router.get('/', SongsController.getAllSongs)

// IMPORTANT: Put specific routes BEFORE parameterized routes to avoid conflicts

// GET /songs/stats - Get song catalog statistics
// Public route - general stats
router.get('/stats', SongsController.getSongStats)

// GET /songs/check/exists - Check if song exists by title/artist/year
// Query params: title, artist, year
// Public route - useful for preventing duplicates
router.get('/check/exists', SongsController.checkSongExists)

// GET /songs/:id - Get specific song by ID
// Public route - no auth required for viewing
router.get('/:id', SongsController.getSongById)

// POST /songs - Create a new song in catalog
// Protected route - requires authentication
router.post('/', auth.verify, SongsController.createSong)

// PUT /songs/:id - Update a song in catalog
// Protected route - requires authentication
router.put('/:id', auth.verify, SongsController.updateSong)

// DELETE /songs/:id - Delete a song from catalog
// Protected route - requires authentication  
router.delete('/:id', auth.verify, SongsController.deleteSong)

// POST /songs/:id/listen - Increment listen count
// Public route - guests can "play" songs too
router.post('/:id/listen', SongsController.incrementListens)

module.exports = router