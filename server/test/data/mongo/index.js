/*
    MongoDB Reset Script
    
    Resets ALL collections from example-db-data.json:
    - Users (new schema: userName, email, passwordHash, avatarImage)
    - Playlists
    - Songs (global catalog)
    
    Usage: cd server && node test/data/mongo/index.js
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearCollection(collection, collectionName) {
    try {
        await collection.deleteMany({});
        console.log("    " + collectionName + " cleared");
    }
    catch (err) {
        console.log("    Error clearing " + collectionName + ":", err.message);
    }
}

async function fillCollection(collection, collectionName, data) {
    try {
        if (!data || data.length === 0) {
            console.log("   ⚠ No " + collectionName + " data to fill");
            return;
        }
        
        for (let i = 0; i < data.length; i++) {
            let doc = new collection(data[i]);
            await doc.save();
        }
        console.log("   ✓ " + collectionName + " filled with " + data.length + " documents");
    }
    catch (err) {
        console.log("   ✗ Error filling " + collectionName + ":", err.message);
    }
}

async function resetMongo() {
    // Import all models
    const Playlist = require('../../../models/playlist-model');
    const User = require("../../../models/user-model");
    const Song = require("../../../models/song-model");
    
    // Load ALL data from single JSON file
    const testData = require("../example-db-data.json");

    console.log("\n" + "=".repeat(50));
    console.log(" Resetting MongoDB Database");
    console.log("=".repeat(50));
    
    // Step 1: Clear all collections
    console.log("\n Clearing collections...");
    await clearCollection(User, "Users");
    await clearCollection(Playlist, "Playlists");
    await clearCollection(Song, "Songs");
    
    // Step 2: Fill all collections
    console.log("\n Filling collections...");
    
    // Fill Users (with new schema: userName)
    if (testData.users) {
        await fillCollection(User, "Users", testData.users);
    }
    
    // Fill Playlists
    if (testData.playlists) {
        await fillCollection(Playlist, "Playlists", testData.playlists);
    }
    
    // Fill Songs Catalog
    if (testData.songs) {
        await fillCollection(Song, "Songs", testData.songs);
    }
    
    // Step 3: Show summary
    console.log("\n" + "=".repeat(50));
    console.log(" MongoDB Reset Complete!");
    console.log("=".repeat(50));
    
    const userCount = await User.countDocuments();
    const playlistCount = await Playlist.countDocuments();
    const songCount = await Song.countDocuments();
    
    console.log("\n Summary:");
    console.log("    Users: " + userCount);
    console.log("    Playlists: " + playlistCount);
    console.log("    Songs: " + songCount);
    
    // List users
    console.log("\n👤 Test Users (password for all: see hash in data):");
    const users = await User.find({}, 'userName email');
    users.forEach(u => {
        console.log("   • " + u.userName + " (" + u.email + ")");
    });
    
    console.log("\n");
    process.exit(0);
}

const mongoose = require('mongoose');
mongoose
    .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
    .then(() => { 
        console.log(" Connected to MongoDB");
        resetMongo();
    })
    .catch(e => {
        console.error(' Connection error:', e.message);
        process.exit(1);
    });