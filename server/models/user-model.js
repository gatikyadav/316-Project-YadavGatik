const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
    User Schema - Following Use Case 2.1 Create Account Specification
    
    Fields:
    - userName: User's display name (does not need to be unique)
    - email: User's email address (must be unique)
    - passwordHash: Hashed password (minimum 8 characters before hashing)
    - avatarImage: Avatar image stored as base64 string
    - playlists: Array of playlist IDs owned by user
    
    Note: firstName and lastName are removed per spec.
    Migration script should be run to convert old data.
    
    @author Gatik Yadav
*/

const UserSchema = new Schema(
    {
        // User name (does not need to be unique per spec)
        userName: { 
            type: String, 
            required: true,
            trim: true,
            validate: {
                validator: function(v) {
                    return v && v.trim().length > 0;
                },
                message: 'User name cannot be empty or only whitespace'
            }
        },
        
        // Email - must be unique
        email: { 
            type: String, 
            required: true, 
            unique: true,
            lowercase: true,
            trim: true
        },
        
        // Password hash
        passwordHash: { 
            type: String, 
            required: true 
        },
        
        // Avatar image stored as base64 string (per spec: "image should be converted into a string")
        avatarImage: { 
            type: String, 
            required: false, 
            default: null,
            // Ensure it's stored as a string
            set: function(v) {
                if (v === null || v === undefined || v === '') {
                    return null;
                }
                return String(v);
            }
        },
        
        // Playlists owned by this user
        playlists: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'Playlist' 
        }]
    },
    { 
        timestamps: true,
        // Allow flexibility during migration but enforce schema after
        strict: true
    }
)

// Index for faster email lookups
UserSchema.index({ email: 1 });

// Pre-save middleware to ensure data integrity
UserSchema.pre('save', function(next) {
    // Ensure userName is trimmed
    if (this.userName) {
        this.userName = this.userName.trim();
    }
    
    // Ensure email is lowercase and trimmed
    if (this.email) {
        this.email = this.email.toLowerCase().trim();
    }
    
    // Ensure avatarImage is a string or null
    if (this.avatarImage !== null && this.avatarImage !== undefined) {
        this.avatarImage = String(this.avatarImage);
    }
    
    next();
});

module.exports = mongoose.model('User', UserSchema)