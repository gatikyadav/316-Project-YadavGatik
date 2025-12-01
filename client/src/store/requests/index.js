/*
    This is our http api, which we use to send requests to
    our back-end API for store operations (playlists, songs, etc.)
    
    @author McKilla Gorilla
    @author Gatik Yadav
*/

const BASE_URL = 'http://localhost:4000/store';

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

export const createPlaylist = (newListName, newSongs, userEmail) => {
    return fetchWithConfig('/playlist', {
        method: 'POST',
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail
        })
    });
};

export const deletePlaylistById = (id) => {
    return fetchWithConfig(`/playlist/${id}`, {
        method: 'DELETE'
    });
};

export const getPlaylistById = (id) => {
    return fetchWithConfig(`/playlist/${id}`, {
        method: 'GET'
    });
};

export const getPlaylistPairs = () => {
    return fetchWithConfig('/playlistpairs', {
        method: 'GET'
    });
};

export const updatePlaylistById = (id, playlist) => {
    console.log("Client updatePlaylistById called with id:", id, "playlist:", playlist);
    return fetchWithConfig(`/playlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            playlist: playlist
        })
    });
};

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis