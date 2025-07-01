// client/src/api/user.js
const API_BASE_URL = 'http://localhost:8080/api'; // Base URL for your API endpoints

// Helper to get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Defines login function, makes a POST request to this endpoint sending
// username, password in JSON format
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Important for sending/receiving cookies if using sessions/JWTs
            body: JSON.stringify(credentials),
        });

        const data = await response.json(); // Always parse the JSON response

        if (!response.ok) {
            // If the HTTP status is not in the 200-299 range (e.g., 400, 500)
            return { error: true, message: data.message || "An error occurred during login." };
        }

        // If response.ok is true, login was successful.
        // Backend MUST send { message: "...", user: { ... }, token: "..." }
        return { success: true, user: data.user, token: data.token, message: data.message };
    } catch (err) {
        console.error("API Login Network/Parsing Error:", err);
        return { error: true, message: "Network error or server unreachable. Please try again." };
    }
};

// <--- NEW: Function to toggle favorite status
export const toggleFavorite = async (itemId) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/favorites/toggle`, { // Corrected endpoint
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token, // <--- Send JWT token in header
            },
            body: JSON.stringify({ itemId }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to toggle favorite." };
        }
        return { success: true, message: data.message, isFavorite: data.isFavorite }; // isFavorite confirms new status
    } catch (err) {
        console.error("API Toggle Favorite Error:", err);
        return { error: true, message: "Network error toggling favorite." };
    }
};

// <--- NEW: Function to get listings, sending auth token if available
export const getListings = async () => {
    const token = getAuthToken(); // Get token. It might be null if not logged in.
    let headers = {};
    if (token) {
        headers['x-auth-token'] = token; // Add token to header if available
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listings/getListings`, {
            method: "GET",
            headers: headers,
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to fetch listings." };
        }
        return { success: true, listings: data }; // Backend directly sends listings array
    } catch (err) {
        console.error("API Get Listings Error:", err);
        return { error: true, message: "Network error fetching listings." };
    }
};