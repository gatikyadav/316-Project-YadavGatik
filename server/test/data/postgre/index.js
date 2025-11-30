const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearTable(model, tableName) {
    try {
        await model.destroy({ where: {} });
        console.log(tableName + " cleared");
    }
    catch (err) {
        console.log(err);
    }
}

async function fillTable(model, tableName, data, userMap = null) {
    try {
        if (tableName === "User") {
            for (let i = 0; i < data.length; i++) {
                await model.create(data[i]);
            }
        } else if (tableName === "Playlist") {
            for (let i = 0; i < data.length; i++) {
                const playlistData = { ...data[i] };
                const userId = userMap[playlistData.ownerEmail];
                delete playlistData._id; // Remove MongoDB _id
                // Keep ownerEmail AND add userId
                playlistData.userId = userId;
                await model.create(playlistData);
            }
        }
        console.log(tableName + " filled");
    }
    catch (err) {
        console.log(err);
    }
}

async function resetPostgres() {
    const { Sequelize, DataTypes } = require('sequelize');
    
    // First connect to default postgres database to create our database
    const defaultSequelize = new Sequelize(
        'postgres', // Connect to default database
        process.env.POSTGRES_USER || 'postgres',
        process.env.POSTGRES_PASSWORD || '',
        {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || 5432,
            dialect: 'postgres',
            logging: false
        }
    );

    try {
        // Create database if it doesn't exist
        const dbName = process.env.POSTGRES_DB || 'playlister';
        await defaultSequelize.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database "${dbName}" created`);
    } catch (err) {
        // Database likely already exists, that's fine
        if (!err.message.includes('already exists')) {
            console.log('Database creation note:', err.message);
        }
    }
    await defaultSequelize.close();

    // Now connect to our actual database
    const sequelize = new Sequelize(
        process.env.POSTGRES_DB || 'playlister',
        process.env.POSTGRES_USER || 'postgres',
        process.env.POSTGRES_PASSWORD || '',
        {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || 5432,
            dialect: 'postgres',
            logging: false
        }
    );

    // Define models - MAKE SURE ownerEmail is included
    const User = sequelize.define('User', {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false }
    }, { tableName: 'users' });

    const Playlist = sequelize.define('Playlist', {
        name: { type: DataTypes.STRING, allowNull: false },
        songs: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
        ownerEmail: { type: DataTypes.STRING, allowNull: false }, // CRITICAL: Keep this column
        userId: { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            references: { model: User, key: 'id' }
        }
    }, { tableName: 'playlists' });

    // Define associations
    User.hasMany(Playlist, { foreignKey: 'userId' });
    Playlist.belongsTo(User, { foreignKey: 'userId' });

    const testData = require("../example-db-data.json");

    console.log("Resetting the Postgres DB");
    
    // Sync database (create tables) - force: true drops and recreates
    await sequelize.sync({ force: true });
    console.log("Database synced with ownerEmail column");
    
    await clearTable(Playlist, "Playlist");
    await clearTable(User, "User");
    
    // Fill users first
    await fillTable(User, "User", testData.users);
    
    // Create user mapping for playlists
    const users = await User.findAll();
    const userMap = {};
    users.forEach(user => {
        userMap[user.email] = user.id;
    });
    
    await fillTable(Playlist, "Playlist", testData.playlists, userMap);
    
    await sequelize.close();
}

// Simple connection and run (just like MongoDB version)
const { Sequelize } = require('sequelize');
const tempConnection = new Sequelize(
    'postgres',
    process.env.POSTGRES_USER || 'postgres',
    process.env.POSTGRES_PASSWORD || '',
    {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        logging: false
    }
);

tempConnection
    .authenticate()
    .then(() => { 
        tempConnection.close();
        return resetPostgres();
    })
    .catch(e => {
        console.error('Connection error', e.message);
    });