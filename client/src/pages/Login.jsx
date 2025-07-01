// client/src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/user"; // Renamed to avoid conflict with context's login
import { UserContext } from "../UserContext"; // Import UserContext
import PurdueLogo from "../assets/PurdueLogo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./Register.css"; // Assuming shared styling

const Login = () => {
    const navigate = useNavigate();
    const { login: contextLogin } = useContext(UserContext); // Get the login function from UserContext

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear any previous error messages

        try {
            const res = await apiLogin({ username, password }); // apiLogin returns { success, user, token, message, error }

            if (res.error) {
                // If API call had a server-side error (e.g., invalid credentials)
                setError(res.message || "Incorrect username or password.");
            } else if (res.user && res.token) { // <--- EXPECTING 'user' object AND 'token'
                toast.success("Login successful!");
                contextLogin(res.user, res.token); // <--- Pass user object AND token to contextLogin
                navigate("/listings"); // Redirect to dashboard
            } else {
                // This case handles a successful API call that somehow didn't return a 'user' or 'token' object
                setError("Login succeeded but user data or token was missing. Please try again.");
                console.error("Login API response missing user data or token:", res);
            }
        } catch (err) {
            // This catch block is for network errors or unhandled exceptions during the fetch
            console.error("Login process error:", err);
            setError("Something went wrong. Could not connect to the server or unexpected error.");
        }
    };

    return (
        <div className="register-container"> {/* Reusing styles from register page */}
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />

            <h2 className="form-title">Login</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="USERNAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Login</button>
            </form>

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
};

export default Login;