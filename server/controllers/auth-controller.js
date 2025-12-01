const auth = require('../auth')
const bcrypt = require('bcryptjs')

/*
    Auth Controller - Following Use Case 2.1 Create Account Specification
    
    Registration requires:
    - userName (does not need to be unique)
    - email (must be unique)
    - password (minimum 8 characters)
    - passwordVerify (must match password)
    - avatarImage (optional, stored as base64 string)
    
    Note: Registration does NOT auto-login the user (per spec)
    
    @author Gatik Yadav
*/

let dbManager = null;

const setDatabaseManager = (manager) => {
    dbManager = manager;
}

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await dbManager.findUserById(userId);
        console.log("loggedInUser: " + loggedInUser);

        // Handle both old schema (firstName/lastName) and new schema (userName)
        let userName = loggedInUser.userName;
        if (!userName && loggedInUser.firstName) {
            // Old schema - combine firstName and lastName
            userName = loggedInUser.firstName + (loggedInUser.lastName || '');
        }

        return res.status(200).json({
            loggedIn: true,
            user: {
                userName: userName,
                email: loggedInUser.email,
                avatarImage: loggedInUser.avatarImage || null
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await dbManager.findUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        // LOGIN THE USER
        const userId = existingUser._id || existingUser.id;
        const token = auth.signToken(userId);
        console.log(token);

        // Handle both old schema (firstName/lastName) and new schema (userName)
        let userName = existingUser.userName;
        if (!userName && existingUser.firstName) {
            // Old schema - combine firstName and lastName
            userName = existingUser.firstName + (existingUser.lastName || '');
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                userName: userName,
                email: existingUser.email,
                avatarImage: existingUser.avatarImage || null
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

/*
    Update User - Use Case 2.3
    
    Per specification:
    - User can change userName, password, avatar
    - User cannot change email
    - Password change requires password and passwordVerify to match
    - Avatar stored as base64 string
*/
updateUser = async (req, res) => {
    console.log("UPDATE USER");
    try {
        // Verify user is logged in
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: "Not authenticated"
            });
        }

        const { userName, password, passwordVerify, avatarImage } = req.body;
        
        // Get current user
        const currentUser = await dbManager.findUserById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                errorMessage: "User not found"
            });
        }

        // Build update object
        const updates = {};

        // Update userName if provided
        if (userName !== undefined) {
            if (userName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    errorMessage: "User name cannot be empty or only whitespace"
                });
            }
            updates.userName = userName.trim();
        }

        // Update password if provided
        if (password) {
            // Validate password length
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    errorMessage: "Password must be at least 8 characters"
                });
            }

            // Validate passwords match
            if (password !== passwordVerify) {
                return res.status(400).json({
                    success: false,
                    errorMessage: "Passwords do not match"
                });
            }

            // Hash the new password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            updates.passwordHash = await bcrypt.hash(password, salt);
        }

        // Update avatar if provided
        if (avatarImage !== undefined) {
            updates.avatarImage = avatarImage;
        }

        // Perform the update
        const updatedUser = await dbManager.updateUser(userId, updates);

        console.log("User updated successfully");
        
        return res.status(200).json({
            success: true,
            user: {
                userName: updatedUser.userName,
                email: updatedUser.email,
                avatarImage: updatedUser.avatarImage || null
            }
        });

    } catch (err) {
        console.error("Update user error:", err);
        return res.status(500).json({
            success: false,
            errorMessage: "Failed to update user"
        });
    }
}

/*
    Register User - Use Case 2.1
    
    Per specification:
    - Email must be unique
    - User name does NOT need to be unique
    - Password must be at least 8 characters
    - Avatar image converted to string (base64)
    - Does NOT auto-login user after registration
    - User is taken to login screen after successful registration
*/
registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { userName, email, password, passwordVerify, avatarImage } = req.body;
        console.log("create user: " + userName + " " + email);

        // Validate required fields
        if (!userName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");

        // Validate userName is not just whitespace
        if (userName.trim() === '') {
            return res
                .status(400)
                .json({ errorMessage: "User name cannot be empty or only whitespace." });
        }
        console.log("userName valid");

        // Validate password length (minimum 8 characters per spec)
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");

        // Validate passwords match
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");

        // Check if email already exists (email must be unique per spec)
        const existingUser = await dbManager.findUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        // Hash the password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash created");

        // Create the user
        const savedUser = await dbManager.createUser({
            userName: userName.trim(),
            email,
            passwordHash,
            avatarImage: avatarImage || null
        });
        console.log("new user saved: " + (savedUser._id || savedUser.id));

        // Per spec: Registration does NOT log the user in
        // User must login separately after creating account
        // Return success - frontend will redirect to login screen
        return res.status(200).json({
            success: true,
            user: {
                userName: savedUser.userName,
                email: savedUser.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    setDatabaseManager
}