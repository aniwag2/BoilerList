// client/src/UserContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token'); // <--- NEW: Get stored token
            if (storedUser && storedToken) {
                // Return both user data and token if available
                return { ...JSON.parse(storedUser), token: storedToken };
            }
            return null;
        } catch (error) {
            console.error("Failed to parse user/token from localStorage:", error);
            // If parsing fails (e.g., malformed JSON), clear storage and return null
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    });

    // Update local storage whenever user state changes
    useEffect(() => {
        if (user && user.token) { // <--- Store token as well
            // Store user data WITHOUT the token to avoid storing sensitive data directly in user object in LS
            localStorage.setItem('user', JSON.stringify({
                _id: user._id,
                username: user.username,
                email: user.email,
            }));
            localStorage.setItem('token', user.token); // Store token separately
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user]);

    // Login function receives user data and token
    const login = (userData, token) => { // <--- NEW: Accepts token
        // Set user object with token
        setUser({ ...userData, token });
    };

    // Logout function
    const logout = () => {
        setUser(null);
        // localStorage.removeItem('user'); // Handled by useEffect
        // localStorage.removeItem('token'); // Handled by useEffect
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};