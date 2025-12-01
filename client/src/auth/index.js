import React, { createContext, useState, useEffect } from "react";
import { useHistory } from 'react-router-dom'
import api from './requests'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    REGISTER_USER: "REGISTER_USER",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    LOGIN_GUEST: "LOGIN_GUEST",
    SET_ERROR: "SET_ERROR"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        isGuest: false,
        errorMessage: null
    });
    const history = useHistory();

    useEffect(() => {
        api.getLoggedIn().then(response => {
            if (response.data.loggedIn) {
                authReducer({
                    type: AuthActionType.GET_LOGGED_IN,
                    payload: {
                        loggedIn: response.data.loggedIn,
                        user: response.data.user
                    }
                });
            }
        }).catch(err => {
            console.log("Not logged in");
        });
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false,
                    errorMessage: null
                });
            }
            case AuthActionType.REGISTER_USER: {
                // Per spec: Registration does NOT log user in
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: false,
                    errorMessage: null
                })
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    isGuest: false,
                    errorMessage: null
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: false,
                    errorMessage: null
                })
            }
            case AuthActionType.LOGIN_GUEST: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: true,
                    errorMessage: null
                })
            }
            case AuthActionType.SET_ERROR: {
                return setAuth({
                    ...auth,
                    errorMessage: payload.errorMessage
                })
            }
            default:
                return auth;
        }
    }

    // Create the auth API object
    const authAPI = {
        user: auth.user,
        loggedIn: auth.loggedIn,
        isGuest: auth.isGuest,
        errorMessage: auth.errorMessage,

        getLoggedIn() {
            api.getLoggedIn().then(response => {
                if (response.data.loggedIn) {
                    authReducer({
                        type: AuthActionType.GET_LOGGED_IN,
                        payload: {
                            loggedIn: response.data.loggedIn,
                            user: response.data.user
                        }
                    });
                }
            });
        },

        /*
            Register User - Use Case 2.1
            
            Per specification:
            - Takes userName, email, password, passwordVerify, avatarImage
            - Does NOT auto-login after registration
            - Returns success/failure for frontend to handle redirect to login
        */
        async registerUser(userName, email, password, passwordVerify, avatarImage) {
            try {
                const response = await api.registerUser(
                    userName,
                    email,
                    password,
                    passwordVerify,
                    avatarImage
                );
                
                if (response.status === 200) {
                    authReducer({
                        type: AuthActionType.REGISTER_USER,
                        payload: {}
                    });
                    return { success: true };
                }
            } catch (error) {
                console.error('Registration error:', error);
                const errorMessage = error.errorMessage || 'Registration failed';
                return { success: false, error: errorMessage };
            }
        },

        loginUser(userData, store) {
            console.log("🔍 SENDING LOGIN DATA:", userData);
            
            api.loginUser(userData.email, userData.password).then(function (response) {
                console.log("✅ LOGIN SUCCESS:", response);
                if (response.status === 200) {
                    authReducer({
                        type: AuthActionType.LOGIN_USER,
                        payload: {
                            user: response.data.user
                        }
                    })
                    history.push("/");
                    if (store) store.loadIdNamePairs();
                }
            }).catch(function (error) {
                console.error('❌ LOGIN FAILED:', error);
                // Extract error message from response data
                let errorMsg = 'Login failed';
                if (error.response && error.response.data && error.response.data.errorMessage) {
                    errorMsg = error.response.data.errorMessage;
                } else if (error.errorMessage) {
                    errorMsg = error.errorMessage;
                }
                authReducer({
                    type: AuthActionType.SET_ERROR,
                    payload: { errorMessage: errorMsg }
                });
            });
        },

        logoutUser() {
            api.logoutUser().then(function (response) {
                if (response.status === 200) {
                    authReducer({
                        type: AuthActionType.LOGOUT_USER,
                        payload: null
                    })
                    history.push("/");
                }
            });
        },

        loginGuest() {
            authReducer({
                type: AuthActionType.LOGIN_GUEST,
                payload: null
            });
            history.push("/");
        },

        // Get user initials from userName for avatar display
        getUserInitials() {
            let initials = "";
            if (auth.user && auth.user.userName) {
                // Get first two characters of userName, uppercase
                initials = auth.user.userName.substring(0, 2).toUpperCase();
            }
            console.log("user initials: " + initials);
            return initials;
        },

        // Get the user's avatar image (base64 string or null)
        getUserAvatar() {
            if (auth.user && auth.user.avatarImage) {
                return auth.user.avatarImage;
            }
            return null;
        },

        /*
            Update User - Use Case 2.3
            
            Per specification:
            - User can change userName, password, avatar
            - User cannot change email
            - Returns to previous screen after completion
        */
        async updateUser(updateData) {
            try {
                const response = await api.updateUser(updateData);
                
                if (response.status === 200) {
                    // Update local auth state with new user data
                    authReducer({
                        type: AuthActionType.LOGIN_USER,
                        payload: {
                            user: response.data.user
                        }
                    });
                    return { success: true };
                }
            } catch (error) {
                console.error('Update user error:', error);
                let errorMsg = 'Update failed';
                if (error.response && error.response.data && error.response.data.errorMessage) {
                    errorMsg = error.response.data.errorMessage;
                }
                return { success: false, error: errorMsg };
            }
        },

        clearError() {
            setAuth({
                ...auth,
                errorMessage: null
            });
        }
    }

    return (
        <AuthContext.Provider value={{
            auth: authAPI
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };