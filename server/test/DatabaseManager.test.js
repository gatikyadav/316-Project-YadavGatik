import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import the database manager initialization logic (similar to server startup)
let dbManager = null;

beforeAll(async () => {
    // Verify environment variables are loaded
    console.log('DATABASE_TYPE:', process.env.DATABASE_TYPE);
    console.log('DB_CONNECT available:', !!process.env.DB_CONNECT);
    console.log('POSTGRES_DB available:', !!process.env.POSTGRES_DB);
    
    // Initialize the appropriate DatabaseManager based on DATABASE_TYPE in .env
    const databaseType = process.env.DATABASE_TYPE || 'mongodb';
    
    switch (databaseType.toLowerCase()) {
        case 'mongodb':
            const MongoDBManager = (await import('../db/mongodb/index.js')).default;
            dbManager = new MongoDBManager();
            break;
            
        case 'postgresql':
        case 'postgres':
            const PostgreSQLManager = (await import('../db/postgresql/index.js')).default;
            dbManager = new PostgreSQLManager();
            break;
            
        default:
            throw new Error(`Unsupported database type: ${databaseType}`);
    }
    
    // Initialize the database connection
    await dbManager.initialize();
    console.log(`DatabaseManager tests initialized with: ${databaseType}`);
});

afterAll(async () => {
    // Clean up database connection
    if (dbManager) {
        await dbManager.close();
    }
});

describe('DatabaseManager Integration Tests', () => {
    // Test data that works with both databases
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@vitest.com',
        passwordHash: '$2a$10$testHashForVitestUser123456789'
    };

    const testPlaylist = {
        name: 'Vitest Playlist',
        songs: [
            {
                title: 'Test Song',
                artist: 'Test Artist',
                year: 2024,
                youTubeId: 'testYouTubeId'
            }
        ],
        ownerEmail: 'test@vitest.com'
    };

    let createdUserId = null;
    let createdPlaylistId = null;

    describe('User Operations', () => {
        
        it('should create a user successfully', async () => {
            const result = await dbManager.createUser(testUser);
            
            expect(result).toBeDefined();
            expect(result.firstName).toBe(testUser.firstName);
            expect(result.lastName).toBe(testUser.lastName);
            expect(result.email).toBe(testUser.email);
            expect(result.passwordHash).toBe(testUser.passwordHash);
            
            // Store the ID for subsequent tests (handle both _id and id)
            createdUserId = result._id || result.id;
            expect(createdUserId).toBeDefined();
        });

        it('should find user by ID', async () => {
            expect(createdUserId).toBeDefined();
            
            const result = await dbManager.findUserById(createdUserId);
            
            expect(result).toBeDefined();
            expect(result.firstName).toBe(testUser.firstName);
            expect(result.email).toBe(testUser.email);
        });

        it('should find user by email', async () => {
            const result = await dbManager.findUserByEmail(testUser.email);
            
            expect(result).toBeDefined();
            expect(result.firstName).toBe(testUser.firstName);
            expect(result.email).toBe(testUser.email);
        });

        it('should update user successfully', async () => {
            expect(createdUserId).toBeDefined();
            
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };
            
            const result = await dbManager.updateUser(createdUserId, updateData);
            
            expect(result).toBeDefined();
            expect(result.firstName).toBe('Updated');
            expect(result.lastName).toBe('Name');
            expect(result.email).toBe(testUser.email); // Should remain unchanged
        });
    });

    describe('Playlist Operations', () => {
        
        it('should create a playlist successfully', async () => {
            const result = await dbManager.createPlaylist(testPlaylist);
            
            expect(result).toBeDefined();
            expect(result.name).toBe(testPlaylist.name);
            expect(result.ownerEmail).toBe(testPlaylist.ownerEmail);
            
            // For songs, just check the structure rather than exact match
            // because MongoDB might add _id to nested objects
            expect(Array.isArray(result.songs)).toBe(true);
            expect(result.songs.length).toBe(1);
            expect(result.songs[0].title).toBe(testPlaylist.songs[0].title);
            expect(result.songs[0].artist).toBe(testPlaylist.songs[0].artist);
            expect(result.songs[0].year).toBe(testPlaylist.songs[0].year);
            expect(result.songs[0].youTubeId).toBe(testPlaylist.songs[0].youTubeId);
            
            // Store the ID for subsequent tests (handle both _id and id)
            createdPlaylistId = result._id || result.id;
            expect(createdPlaylistId).toBeDefined();
            
            // Convert to string for consistent comparisons
            createdPlaylistId = String(createdPlaylistId);
        });

        it('should find playlist by ID', async () => {
            expect(createdPlaylistId).toBeDefined();
            
            const result = await dbManager.findPlaylistById(createdPlaylistId);
            
            expect(result).toBeDefined();
            expect(result.name).toBe(testPlaylist.name);
            expect(result.ownerEmail).toBe(testPlaylist.ownerEmail);
        });

        it('should find playlists by owner email', async () => {
            const result = await dbManager.findPlaylistsByOwnerEmail(testUser.email);
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            
            const ourPlaylist = result.find(p => p.name === testPlaylist.name);
            expect(ourPlaylist).toBeDefined();
            expect(ourPlaylist.ownerEmail).toBe(testUser.email);
        });

        it('should get all playlists', async () => {
            const result = await dbManager.getAllPlaylists();
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            
            // Should include our test playlist
            const ourPlaylist = result.find(p => p.name === testPlaylist.name);
            expect(ourPlaylist).toBeDefined();
        });

        it('should update playlist successfully', async () => {
            expect(createdPlaylistId).toBeDefined();
            
            const updateData = {
                name: 'Updated Vitest Playlist',
                songs: [
                    {
                        title: 'Updated Song',
                        artist: 'Updated Artist', 
                        year: 2025,
                        youTubeId: 'updatedYouTubeId'
                    }
                ]
            };
            
            const result = await dbManager.updatePlaylist(createdPlaylistId, updateData);
            
            expect(result).toBeDefined();
            expect(result.name).toBe('Updated Vitest Playlist');
            // Check song content rather than exact structure
            expect(result.songs[0].title).toBe('Updated Song');
            expect(result.songs[0].artist).toBe('Updated Artist');
        });
    });

    describe('User-Playlist Relationship Operations', () => {
        
        it('should add playlist to user', async () => {
            expect(createdUserId).toBeDefined();
            expect(createdPlaylistId).toBeDefined();
            
            const result = await dbManager.addPlaylistToUser(createdUserId, createdPlaylistId);
            
            expect(result).toBeDefined();
            // The exact structure may vary between MongoDB and PostgreSQL
            // but the operation should succeed
        });

        it('should validate user owns playlist', async () => {
            expect(createdUserId).toBeDefined();
            expect(createdPlaylistId).toBeDefined();
            
            const result = await dbManager.validateUserOwnsPlaylist(createdUserId, createdPlaylistId);
            
            expect(result).toBe(true);
        });

        it('should validate user does not own non-existent playlist', async () => {
            expect(createdUserId).toBeDefined();
            
            // Use a clearly non-existent ID that works for both database types
            const fakePlaylistId = process.env.DATABASE_TYPE === 'mongodb' ? 
                '507f1f77bcf86cd799439999' : 99999;
            
            const result = await dbManager.validateUserOwnsPlaylist(createdUserId, fakePlaylistId);
            
            expect(result).toBe(false);
        });
    });

    describe('Cleanup Operations', () => {
        
        it('should remove playlist from user', async () => {
            expect(createdUserId).toBeDefined();
            expect(createdPlaylistId).toBeDefined();
            
            const result = await dbManager.removePlaylistFromUser(createdUserId, createdPlaylistId);
            
            expect(result).toBeDefined();
        });

        it('should delete playlist successfully', async () => {
            expect(createdPlaylistId).toBeDefined();
            
            const result = await dbManager.deletePlaylist(createdPlaylistId);
            
            expect(result).toBeDefined();
            
            // Verify playlist is actually deleted
            const deletedPlaylist = await dbManager.findPlaylistById(createdPlaylistId);
            expect(deletedPlaylist).toBe(null);
        });

        it('should delete user successfully', async () => {
            expect(createdUserId).toBeDefined();
            
            const result = await dbManager.deleteUser(createdUserId);
            
            expect(result).toBeDefined();
            
            // Verify user is actually deleted
            const deletedUser = await dbManager.findUserById(createdUserId);
            expect(deletedUser).toBe(null);
        });
    });
});