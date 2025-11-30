const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearSongsCollection(Song) {
    try {
        await Song.deleteMany({});
        console.log("Songs collection cleared");
    }
    catch (err) {
        console.log("Error clearing songs:", err);
    }
}

async function fillSongsCollection(Song, songsData) {
    try {
        for (let i = 0; i < songsData.length; i++) {
            // Check if song already exists (prevent duplicates)
            const existingSong = await Song.findOne({
                title: { $regex: new RegExp(`^${songsData[i].title}$`, 'i') },
                artist: { $regex: new RegExp(`^${songsData[i].artist}$`, 'i') },
                year: songsData[i].year
            });
            
            if (!existingSong) {
                let doc = new Song(songsData[i]);
                await doc.save();
                console.log(`Added song: ${songsData[i].title} by ${songsData[i].artist}`);
            } else {
                console.log(`Song already exists: ${songsData[i].title} by ${songsData[i].artist}`);
            }
        }
        console.log("Songs collection filled");
    }
    catch (err) {
        console.log("Error filling songs:", err);
    }
}

async function resetSongsData() {
    try {
        const Song = require('../../../models/song-model');
        const songsTestData = require("../songs-data.json");

        console.log("Resetting Songs collection in Mongo DB");
        
        // Clear existing songs
        await clearSongsCollection(Song);
        
        // Fill with new songs data
        await fillSongsCollection(Song, songsTestData.songs);
        
        console.log("Songs database reset complete!");
        
        // Close the database connection
        process.exit(0);
        
    } catch (error) {
        console.error("Error resetting songs data:", error);
        process.exit(1);
    }
}

const mongoose = require('mongoose')
mongoose
    .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
    .then(() => { 
        console.log("Connected to MongoDB");
        resetSongsData();
    })
    .catch(e => {
        console.error('MongoDB connection error', e.message);
        process.exit(1);
    });