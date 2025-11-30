/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we're 
    using the native Fetch API, which is a browser standard for 
    making HTTP requests. Fetch is Promise-based and provides 
    good control over request configuration.
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

const BASE_URL = 'http://localhost:4000/auth';

// Helper function to handle fetch requests with Axios-compatible response format
const fetchWithConfig = async (url, options = {}) => {
    const config = {
        credentials: 'include', // This replaces axios.defaults.withCredentials = true
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

// THESE ARE ALL THE REQUESTS WE'LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

export const getLoggedIn = () => {
    return fetchWithConfig('/loggedIn/', {
        method: 'GET'
    });
};

export const loginUser = (email, password) => {
    return fetchWithConfig('/login/', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        })
    });
};

export const logoutUser = () => {
    return fetchWithConfig('/logout/', {
        method: 'GET'
    });
};

export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
    return fetchWithConfig('/register/', {
        method: 'POST',
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            passwordVerify: passwordVerify
        })
    });
};

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis