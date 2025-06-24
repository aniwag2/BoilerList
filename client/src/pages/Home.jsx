import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to BoilerList!</h1>
            <p>This is your home page.</p>
            <Link to="/register">
                <button className="register-button">Register Now</button>
            </Link>
        </div>
    );
}

export default Home;