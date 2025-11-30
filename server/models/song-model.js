const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
    This defines the Song model for the global songs catalog.
    Songs in the catalog are separate from songs in playlists.
    
    Key constraints from the specification:
    - No two songs may have the same title, artist, and year combination
    - Songs track how many times they've been listened to
    - Songs track how many playlists they appear in
    
    @author Gatik Yadav
*/

const songSchema = new Schema(
    {
        title: { 
            type: String, 
            required: true,
            trim: true
        },
        artist: { 
            type: String, 
            required: true,
            trim: true
        },
        year: { 
            type: Number, 
            required: true,
            min: 1900,
            max: new Date().getFullYear() + 1 // Allow next year for unreleased songs
        },
        youTubeId: { 
            type: String, 
            required: true,
            trim: true
        },
        // Tracking fields for sorting and statistics
        listens: {
            type: Number,
            default: 0,
            min: 0
        },
        playlistCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { 
        timestamps: true // Adds createdAt and updatedAt
    }
)

// Create compound unique index for title + artist + year
// This enforces the constraint: no two songs with same title, artist, and year
songSchema.index({ title: 1, artist: 1, year: 1 }, { unique: true })

// Index for efficient searching
songSchema.index({ title: 'text', artist: 'text' })

// Instance method to increment listen count
songSchema.methods.incrementListens = function() {
    this.listens += 1;
    return this.save();
}

// Instance method to update playlist count
songSchema.methods.updatePlaylistCount = function(count) {
    this.playlistCount = count;
    return this.save();
}

// Static method to find songs by search criteria
songSchema.statics.searchSongs = function(searchTerm) {
    if (!searchTerm) {
        return this.find({});
    }
    
    return this.find({
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { artist: { $regex: searchTerm, $options: 'i' } }
        ]
    });
}

// Static method to check if song exists (for duplicate prevention)
songSchema.statics.songExists = function(title, artist, year) {
    return this.findOne({ 
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        artist: { $regex: new RegExp(`^${artist}$`, 'i') },
        year: year 
    });
}

module.exports = mongoose.model('Song', songSchema)