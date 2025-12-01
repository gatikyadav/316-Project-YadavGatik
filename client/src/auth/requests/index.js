/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API.
    
    Updated for new schema: userName (no firstName/lastName)
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

const BASE_URL = 'http://localhost:4000/auth';

// Helper function to handle fetch requests with Axios-compatible response format
const fetchWithConfig = async (url, options = {}) => {
    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(`${BASE_URL}${url}`, config);
        
        // Parse response data
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            // Create Axios-compatible error object
            const error = new Error(`HTTP error! status: ${response.status}`);
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: data
            };
            throw error;
        }

        // Return Axios-compatible response object
        return {
            data: data,
            status: response.status,
            statusText: response.statusText
        };

    } catch (error) {
        // If it's already our custom error, re-throw it
        if (error.response) {
            throw error;
        }
        
        // For network errors or other fetch errors, create compatible error object
        const compatibleError = new Error(error.message);
        compatibleError.response = {
            status: 0,
            statusText: 'Network Error',
            data: null
        };
        throw compatibleError;
    }
};

// NOTE: Removed trailing slashes to match server routes exactly

export const getLoggedIn = () => {
    return fetchWithConfig('/loggedIn', {
        method: 'GET'
    });
};

export const loginUser = (email, password) => {
    return fetchWithConfig('/login', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        })
    });
};

export const logoutUser = () => {
    return fetchWithConfig('/logout', {
        method: 'GET'
    });
};

// UPDATED: Use userName instead of firstName/lastName
export const registerUser = (userName, email, password, passwordVerify, avatarImage) => {
    return fetchWithConfig('/register', {
        method: 'POST',
        body: JSON.stringify({
            userName: userName,
            email: email,
            password: password,
            passwordVerify: passwordVerify,
            avatarImage: avatarImage || null
        })
    });
};

// UPDATE USER - Use Case 2.3
export const updateUser = (updateData) => {
    return fetchWithConfig('/update', {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });
};

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateUser
}

export default apis