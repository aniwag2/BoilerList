// client/src/api/user.js
const API_BASE_URL = 'http://localhost:8080/api/auth'; // Ensure this matches your server port

// Defines login function, makes a POST request to this endpoint sending
// username, password in JSON format
export const login = async (credentials) => { // Renamed 'user' param to 'credentials' for clarity
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Important for sending/receiving cookies if using sessions/JWTs
            body: JSON.stringify(credentials), // Use credentials
        });

        const data = await response.json(); // Always parse the JSON response

        if (!response.ok) {
            // If the HTTP status is not in the 200-299 range (e.g., 400, 500)
            // Backend should return { message: "error message" }
            return { error: true, message: data.message || "An error occurred during login." };
        }

        // If response.ok is true, login was successful.
        // Backend MUST send { message: "...", user: { ... } }
        return { success: true, user: data.user, message: data.message };
    } catch (err) {
        console.error("API Login Network/Parsing Error:", err);
        return { error: true, message: "Network error or server unreachable. Please try again." };
    }
};

// You can add other API functions here, e.g., register:
// export const register = async (userData) => { /* ... */ };