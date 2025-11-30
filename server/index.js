// THESE ARE NODE APIs WE WISH TO USE
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// CREATE OUR SERVER
dotenv.config()
const PORT = process.env.PORT || 4000;
const app = express()

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// INITIALIZE DATABASE MANAGER
async function initializeServer() {
    try {
        // Create and initialize the appropriate DatabaseManager
        const databaseType = process.env.DATABASE_TYPE || 'mongodb';
        let dbManager;
        
        switch (databaseType.toLowerCase()) {
            case 'mongodb':
                const MongoDBManager = require('./db/mongodb');
                dbManager = new MongoDBManager();
                break;
                
            case 'postgresql':
            case 'postgres':
                const PostgreSQLManager = require('./db/postgresql');
                dbManager = new PostgreSQLManager();
                break;
                
            default:
                throw new Error(`Unsupported database type: ${databaseType}`);
        }
        
        // Initialize the database connection
        await dbManager.initialize();
        console.log(`Database initialized: ${databaseType}`);
        
        // Pass the database manager to controllers
        const authController = require('./controllers/auth-controller');
        const storeController = require('./controllers/store-controller');
        const songsController = require('./controllers/songs-controller');
        
        authController.setDatabaseManager(dbManager);
        storeController.setDatabaseManager(dbManager);
        songsController.setDatabaseManager(dbManager);
        
        console.log('Controllers initialized with DatabaseManager');
        
        // SETUP OUR OWN ROUTERS AS MIDDLEWARE
        const authRouter = require('./routes/auth-router')
        app.use('/auth', authRouter)
        const storeRouter = require('./routes/store-router')
        app.use('/store', storeRouter)
        const songsRouter = require('./routes/songs-router')
        app.use('/songs', songsRouter)
        
        // PUT THE SERVER IN LISTENING MODE
        app.listen(PORT, () => {
            console.log(`Playlister Server running on port ${PORT}`);
            console.log(`Using database: ${databaseType}`);
            console.log('Available routes:');
            console.log('  Auth: /auth/*');
            console.log('  Store: /store/*');
            console.log('  Songs: /songs/*');
        });
        
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

// Start the server
initializeServer();