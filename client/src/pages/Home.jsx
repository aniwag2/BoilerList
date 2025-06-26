import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import PurdueLogo from '../assets/PurdueLogo.png'; // <--- NEW: Import your Purdue Logo

function Home() {
    return (
        <div className="home-container">
            {/* <--- NEW: Add the logo at the top */}
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />

            {/* <--- CHANGED: Main title */}
            <h1>BOILERLIST</h1>

            {/* <--- Updated styling class and consistent structure */}
            <Link to="/register" className="home-button-link"> {/* Added a class for styling */}
                <button className="home-action-button">REGISTER</button>
            </Link>

            {/* <--- NEW: Login Button */}
            <Link to="/login" className="home-button-link"> {/* Assuming you'll create a /login route and component later */}
                <button className="home-action-button">LOGIN</button>
            </Link>
        </div>
    );
}

export default Home;