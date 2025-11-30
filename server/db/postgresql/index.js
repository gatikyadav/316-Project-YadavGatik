/*
    PostgreSQL DatabaseManager Implementation
    Contains ALL Sequelize-specific code for the application.
    Implements the DatabaseManager interface using PostgreSQL/Sequelize.
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

const DatabaseManager = require('../index');
const { Sequelize, DataTypes } = require('sequelize');

class PostgreSQLManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = null;
        this.User = null;
        this.Playlist = null;
    }

    async initialize() {
        try {
            // Create Sequelize instance
            this.sequelize = new Sequelize(
                process.env.POSTGRES_DB,
                process.env.POSTGRES_USER,
                process.env.POSTGRES_PASSWORD,
                {
                    host: process.env.POSTGRES_HOST,
                    port: process.env.POSTGRES_PORT,
                    dialect: 'postgres',
                    logging: false
                }
            );

            // Define models
            this.User = this.sequelize.define('User', {
                firstName: { type: DataTypes.STRING, allowNull: false },
                lastName: { type: DataTypes.STRING, allowNull: false },
                email: { type: DataTypes.STRING, allowNull: false, unique: true },
                passwordHash: { type: DataTypes.STRING, allowNull: false }
            }, { tableName: 'users' });

            this.Playlist = this.sequelize.define('Playlist', {
                name: { type: DataTypes.STRING, allowNull: false },
                songs: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
                ownerEmail: { type: DataTypes.STRING, allowNull: false }, // Keep for compatibility
                userId: { 
                    type: DataTypes.INTEGER, 
                    allowNull: false,
                    references: { model: this.User, key: 'id' }
                }
            }, { tableName: 'playlists' });

            // Define associations
            this.User.hasMany(this.Playlist, { foreignKey: 'userId', as: 'playlists' });
            this.Playlist.belongsTo(this.User, { foreignKey: 'userId', as: 'owner' });

            // Test connection but DON'T sync (preserve existing schema)
            await this.sequelize.authenticate();
            
            console.log('PostgreSQL connected successfully');
            return this.sequelize;
        } catch (error) {
            console.error('PostgreSQL connection error:', error.message);
            throw error;
        }
    }

    async close() {
        if (this.sequelize) {
            await this.sequelize.close();
            this.sequelize = null;
        }
    }

    // User operations
    async findUserById(userId) {
        try {
            const user = await this.User.findByPk(userId);
            return user ? user.toJSON() : null; // Convert Sequelize instance to plain object
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    async findUserByEmail(email) {
        try {
            const user = await this.User.findOne({ where: { email: email } });
            return user ? user.toJSON() : null; // Convert Sequelize instance to plain object
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            const user = await this.User.create(userData);
            return user.toJSON(); // Convert Sequelize instance to plain object
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async updateUser(userId, userData) {
        try {
            const [updatedRowsCount] = await this.User.update(userData, {
                where: { id: userId },
                returning: true
            });
            
            if (updatedRowsCount === 0) {
                throw new Error('User not found');
            }
            
            const user = await this.User.findByPk(userId);
            return user ? user.toJSON() : null;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            const user = await this.User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const userData = user.toJSON();
            await this.User.destroy({ where: { id: userId } });
            return userData;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Playlist operations
    async createPlaylist(playlistData) {
        try {
            // Find user by email to get userId
            const user = await this.findUserByEmail(playlistData.ownerEmail);
            if (!user) {
                throw new Error('Owner user not found');
            }

            const playlistWithUserId = {
                ...playlistData,
                userId: user.id
            };

            const playlist = await this.Playlist.create(playlistWithUserId);
            return playlist.toJSON();
        } catch (error) {
            throw new Error(`Error creating playlist: ${error.message}`);
        }
    }

    async findPlaylistById(playlistId) {
        try {
            const playlist = await this.Playlist.findByPk(playlistId);
            return playlist ? playlist.toJSON() : null;
        } catch (error) {
            throw new Error(`Error finding playlist by ID: ${error.message}`);
        }
    }

    async findPlaylistsByOwnerEmail(email) {
        try {
            const playlists = await this.Playlist.findAll({ where: { ownerEmail: email } });
            return playlists.map(playlist => playlist.toJSON());
        } catch (error) {
            throw new Error(`Error finding playlists by owner email: ${error.message}`);
        }
    }

    async updatePlaylist(playlistId, playlistData) {
        try {
            const [updatedRowsCount] = await this.Playlist.update(playlistData, {
                where: { id: playlistId },
                returning: true
            });
            
            if (updatedRowsCount === 0) {
                throw new Error('Playlist not found');
            }
            
            const playlist = await this.Playlist.findByPk(playlistId);
            return playlist ? playlist.toJSON() : null;
        } catch (error) {
            throw new Error(`Error updating playlist: ${error.message}`);
        }
    }

    async deletePlaylist(playlistId) {
        try {
            const playlist = await this.Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error('Playlist not found');
            }
            
            const playlistData = playlist.toJSON();
            await this.Playlist.destroy({ where: { id: playlistId } });
            return playlistData;
        } catch (error) {
            throw new Error(`Error deleting playlist: ${error.message}`);
        }
    }

    async getAllPlaylists() {
        try {
            const playlists = await this.Playlist.findAll();
            return playlists.map(playlist => playlist.toJSON());
        } catch (error) {
            throw new Error(`Error getting all playlists: ${error.message}`);
        }
    }

    // User-Playlist relationship operations
    async addPlaylistToUser(userId, playlistId) {
        try {
            // In PostgreSQL, the relationship is maintained through the foreign key
            // So we just need to ensure the playlist exists and belongs to the user
            const playlist = await this.Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error('Playlist not found');
            }
            
            if (playlist.userId !== userId) {
                await this.Playlist.update({ userId: userId }, { where: { id: playlistId } });
            }
            
            const user = await this.User.findByPk(userId);
            return user ? user.toJSON() : null;
        } catch (error) {
            throw new Error(`Error adding playlist to user: ${error.message}`);
        }
    }

    async removePlaylistFromUser(userId, playlistId) {
        try {
            // In PostgreSQL, just verify the playlist exists and user owns it
            // But don't actually delete it - that's what deletePlaylist is for
            const playlist = await this.Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error('Playlist not found');
            }
            
            // Verify user owns the playlist
            if (playlist.userId !== parseInt(userId)) {
                throw new Error('User does not own this playlist');
            }
            
            // For the test, we'll just return the playlist data without deleting
            // The actual deletion happens in deletePlaylist
            return playlist.toJSON();
        } catch (error) {
            throw new Error(`Error removing playlist from user: ${error.message}`);
        }
    }

    // Utility methods
    async validateUserOwnsPlaylist(userId, playlistId) {
        try {
            const playlist = await this.findPlaylistById(playlistId);
            if (!playlist) {
                return false;
            }
            
            // In PostgreSQL, we can check the userId directly
            return playlist.userId === parseInt(userId);
        } catch (error) {
            throw new Error(`Error validating user owns playlist: ${error.message}`);
        }
    }
}

module.exports = PostgreSQLManager;