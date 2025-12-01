import { createContext, useContext, useState } from "react"
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
    LOGIN_GUEST: "LOGIN_GUEST"  //  ADD THIS
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        isGuest: false  //  ADD THIS
    });
    const history = useHistory();

    useContext(AuthContext);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false  //  Reset guest mode on regular login
                });
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    isGuest: false
                })
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    isGuest: false
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: false  // Reset guest mode on logout
                })
            }
            case AuthActionType.LOGIN_GUEST: {  //  ADD THIS ENTIRE CASE
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: true
                })
            }
            default:
                return auth;
        }
    }

    const authAPI = {  //  RENAMED to avoid conflict
        user: auth.user,
        loggedIn: auth.loggedIn,
        isGuest: auth.isGuest,  //  ADD THIS
        getLoggedIn() {
            api.getLoggedIn().then(function (response) {
                if (response.status === 200) {
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
        registerUser(userData, store) {
            //  FIXED: Extract individual fields from userData object
            api.registerUser(
                userData.firstName, 
                userData.lastName, 
                userData.email, 
                userData.password, 
                userData.passwordVerify
            ).then(function (response) {
                if (response.status === 200) {
                    authReducer({
                        type: AuthActionType.REGISTER_USER,
                        payload: {
                            user: response.data.user
                        }
                    })
                    history.push("/");
                    store.loadIdNamePairs();
                }
            }).catch(function (error) {
                console.error('Registration error:', error);
                if (error.response) {
                    console.error('Error response:', error.response);
                }
            });
        },
        loginUser(userData, store) {    //  FIXED: Removed extra "l" from "lloginUser"
            // DEBUG: Log what we're sending
            console.log("🔍 SENDING LOGIN DATA:", userData);
            console.log("🔍 Email:", userData.email);
            console.log("🔍 Password:", userData.password ? "***" : "MISSING");
            
            api.loginUser(userData.email, userData.password).then(function (response) {
                console.log(" LOGIN SUCCESS:", response);
                if (response.status === 200) {
                    authReducer({
                        type: AuthActionType.LOGIN_USER,
                        payload: {
                            user: response.data.user
                        }
                    })
                    history.push("/");
                    store.loadIdNamePairs();
                }
            }).catch(function (error) {
                console.error('❌ LOGIN FAILED:', error);
                if (error.response) {
                    console.error('🚨 SERVER ERROR:', JSON.stringify(error.response.data, null, 2));
                }
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
        //  ADD THIS ENTIRE NEW FUNCTION
        loginGuest() {
            authReducer({
                type: AuthActionType.LOGIN_GUEST,
                payload: null
            });
            history.push("/");
        },
        getUserInitials() {
            let initials = "";
            if (auth.user) {
                initials += auth.user.firstName.charAt(0);
                initials += auth.user.lastName.charAt(0);
            }
            console.log("user initials: " + initials);
            return initials;
        }
    }

    return (
        <AuthContext.Provider value={{
            auth: authAPI  //  FIXED - use authAPI
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider }