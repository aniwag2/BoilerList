// client/src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext'; // Path to your UserContext

// Import the BoilerList images from assets
import BoilerListIcon from '../assets/BoilerList-icon.png';
import BoilerListText from '../assets/BoilerList-text.png';

import './Navbar.css'; // Create this CSS file

function Navbar() {
    const { logout } = useContext(UserContext); // Get the logout function
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Call the logout function from UserContext
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <nav className="navbar">
            <Link to="/listings" className="navbar-brand"> {/* Brand always goes to listings */}
                <img src={BoilerListIcon} alt="BoilerList Icon" className="navbar-icon" />
                <img src={BoilerListText} alt="BoilerList Text" className="navbar-text" />
            </Link>

            <div className="navbar-links">
                <Link to="/profile" className="navbar-button">Profile</Link>
                <Link to="/listings" className="navbar-button">Dashboard</Link> {/* Text says Dashboard */}
                <Link to="/uploaditem" className="navbar-button">Upload Item</Link> {/* Text says Upload Item */}
                <button onClick={handleLogout} className="navbar-button logout-button">Log out</button> {/* Text says Log out */}
            </div>
        </nav>
    );
}

export default Navbar;