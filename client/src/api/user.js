// client/src/api/user.js
const API_BASE_URL = 'https://api.aniwaghray.com/api'; // Base URL for your API endpoints

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

// Function to toggle favorite status
export const toggleFavorite = async (itemId) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/favorites/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token, // Send JWT token in header
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

// Function to get listings, sending auth token if available
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

// Function to delete listing
export const deleteListing = async (itemId) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listings/deleteListing/${itemId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to mark item as sold." };
        }
        return { success: true, message: data.message };
    } catch (err) {
        console.error("API Delete Listing Error:", err);
        return { error: true, message: "Network error marking item as sold." };
    }
};

// Function to update listing
export const updateListing = async (itemId, listingData, imageFile = null) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    let headers = {
        "x-auth-token": token,
    };
    let body;

    if (imageFile) {
        const formData = new FormData();
        for (const key in listingData) {
            formData.append(key, listingData[key]);
        }
        formData.append("image", imageFile);
        body = formData;
    } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(listingData);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listings/updateListing/${itemId}`, {
            method: "PUT",
            headers: headers,
            body: body,
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to update listing." };
        }
        return { success: true, message: data.message, listing: data.listing };
    } catch (err) {
        console.error("API Update Listing Error:", err);
        return { error: true, message: "Network error updating listing." };
    }
};

export const searchItems = async (query) => {
    const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data;
};

// --- NEW FUNCTION: Change Password ---
export const changePassword = async (passwords) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
            },
            body: JSON.stringify(passwords), // { currentPassword, newPassword }
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to change password." };
        }
        return { success: true, message: data.message };
    } catch (err) {
        console.error("API Change Password Error:", err);
        return { error: true, message: "Network error changing password." };
    }
};

// --- NEW FUNCTION: Delete Account ---
export const deleteAccount = async () => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/delete-account`, {
            method: "DELETE",
            headers: {
                "x-auth-token": token,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to delete account." };
        }
        return { success: true, message: data.message };
    } catch (err) {
        console.error("API Delete Account Error:", err);
        return { error: true, message: "Network error deleting account." };
    }
};