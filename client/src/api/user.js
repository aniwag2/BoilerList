// client/src/api/user.js
const API_BASE_URL = 'http://localhost:8080/api';

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
            credentials: "include",
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "An error occurred during login." };
        }
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
                "x-auth-token": token,
            },
            body: JSON.stringify({ itemId }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to toggle favorite." };
        }
        return { success: true, message: data.message, isFavorite: data.isFavorite };
    } catch (err) {
        console.error("API Toggle Favorite Error:", err);
        return { error: true, message: "Network error toggling favorite." };
    }
};

// Function to get listings, sending auth token if available
export const getListings = async () => {
    const token = getAuthToken();
    let headers = {};
    if (token) {
        headers['x-auth-token'] = token;
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
        return { success: true, listings: data };
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
            body: JSON.stringify(passwords),
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

// --- NEW FUNCTION: expressInterest ---
export const expressInterest = async (listingId) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listings/${listingId}/express-interest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
            },
            // No body needed as buyer info comes from token
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to express interest." };
        }
        // Return interestedBuyersCount and hasExpressedInterest from backend response
        return { success: true, message: data.message, interestedBuyersCount: data.interestedBuyersCount, hasExpressedInterest: data.hasExpressedInterest };
    } catch (err) {
        console.error("API Express Interest Error:", err);
        return { error: true, message: "Network error expressing interest." };
    }
};

// --- NEW FUNCTION: sendInterestedBuyersEmail ---
export const sendInterestedBuyersEmail = async (listingId) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listings/${listingId}/send-interested-buyers-email`, {
            method: "GET", // This is a GET request as it only retrieves and sends data via email
            headers: {
                "x-auth-token": token,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Failed to send buyers list email." };
        }
        return { success: true, message: data.message };
    } catch (err) {
        console.error("API Send Buyers List Email Error:", err);
        return { error: true, message: "Network error sending buyers list email." };
    }
};

export const ragQuery = async (query, chatId) => { // MODIFIED: Added chatId parameter
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/rag`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token, // Send token with RAG query
            },
            body: JSON.stringify({ query, chatId }), // MODIFIED: Send chatId
        });
        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.message || "Error with chatbot response." };
        }
        return { success: true, message: data.message }; // Assuming RAG controller sends { message: content }
    } catch (err) {
        console.error("API RAG Query Error:", err);
        return { error: true, message: "Network error with chatbot." };
    }
};


// --- NEW FUNCTIONS FOR CHAT MANAGEMENT ---

// Create a new chat session
export const createNewChat = async () => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/chat/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: true, message: data.message || "Failed to create new chat." };
        }
        return { success: true, chat: data.chat };
    } catch (err) {
        console.error("API Create New Chat Error:", err);
        return { error: true, message: "Network error creating chat." };
    }
};

// Get all chat sessions for the authenticated user
export const getUserChats = async () => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "GET",
            headers: {
                "x-auth-token": token,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: true, message: data.message || "Failed to fetch user chats." };
        }
        return { success: true, chats: data.chats };
    } catch (err) {
        console.error("API Get User Chats Error:", err);
        return { error: true, message: "Network error fetching chats." };
    }
};

// Get messages for a specific chat session
export const getChatMessages = async (chatId) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
            method: "GET",
            headers: {
                "x-auth-token": token,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: true, message: data.message || "Failed to fetch chat messages." };
        }
        return { success: true, messages: data.messages };
    } catch (err) {
        console.error("API Get Chat Messages Error:", err);
        return { error: true, message: "Network error fetching messages." };
    }
};

// Update the title of a chat session
export const updateChatTitle = async (chatId, newTitle) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}/title`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
            },
            body: JSON.stringify({ newTitle }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: true, message: data.message || "Failed to update chat title." };
        }
        return { success: true, message: data.message, chat: data.chat };
    } catch (err) {
        console.error("API Update Chat Title Error:", err);
        return { error: true, message: "Network error updating chat title." };
    }
};

// Delete a specific chat session
export const deleteChat = async (chatId) => {
    const token = getAuthToken();
    if (!token) {
        return { error: true, message: "User not authenticated." };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
            method: "DELETE",
            headers: {
                "x-auth-token": token,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: true, message: data.message || "Failed to delete chat." };
        }
        return { success: true, message: data.message };
    } catch (err) {
        console.error("API Delete Chat Error:", err);
        return { error: true, message: "Network error deleting chat." };
    }
};