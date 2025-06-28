// client/src/UserContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    // Initialize user state from local storage on first load
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            // Parse storedUser only if it exists, otherwise it's null
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            // If parsing fails (e.g., malformed JSON), clear storage and return null
            localStorage.removeItem('user');
            return null;
        }
    });

    // Update local storage whenever user state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Function to handle login: sets the user state with provided data
    const login = (userData) => {
        // userData should be an object containing user details from successful login
        setUser(userData);
    };

    // Function to handle logout: clears the user state
    const logout = () => {
        setUser(null);
        // In a real app, you might also want to clear any specific tokens
        // or session data from cookies if you were using them.
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};