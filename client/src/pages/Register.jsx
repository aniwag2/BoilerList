import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import PurdueLogo from '../assets/PurdueLogo.png';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // --- Client-side Validation ---

        // 1. Check for @purdue.edu email extension
        if (!email.toLowerCase().endsWith('@purdue.edu')) {
            setError('Please use an email address with the @purdue.edu extension.');
            return; // Stop form submission
        }

        // 2. Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match. Please re-enter your password.');
            // Optionally, clear password fields for security:
            // setPassword('');
            // setConfirmPassword('');
            return; // Stop form submission
        }

        // You can add more password complexity rules here if desired (e.g., min length, characters)
        if (password.length < 6) { // Example: Already in your backend model, good to have client-side too
            setError('Password must be at least 6 characters long.');
            return;
        }

        // --- End Client-side Validation ---


        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Registration successful:', data.message);
                navigate('/'); // Redirect to the home page (or /login)
            } else {
                // Server-side error handling
                console.error('Registration failed:', data.message || 'Unknown error from server');
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Network or unexpected error during registration:', err);
            setError('Could not connect to the server. Please try again later.');
        }
    };

    return (
        <div className="register-container">
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />
            <h2>REGISTER</h2>

            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>} {/* Display error message here */}

                <div className="form-group">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="PURDUE EMAIL"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="USERNAME"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="PASSWORD"
                        required
                    />
                </div>
                {/* <--- NEW INPUT FIELD FOR CONFIRM PASSWORD --- */}
                <div className="form-group">
                    <input
                        type="password"
                        id="confirmPassword" // Unique ID
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="RE-ENTER PASSWORD" // Placeholder text
                        required
                    />
                </div>
                {/* <--- END NEW INPUT FIELD --- */}

                <button type="submit">REGISTER</button>
            </form>
        </div>
    );
}

export default Register;