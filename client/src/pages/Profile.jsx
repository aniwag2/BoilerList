// client/src/pages/Profile.jsx
import React, { useContext } from 'react';
import { UserContext } from '../UserContext'; // Import your UserContext
import './Profile.css'; // Create this CSS file for styling

function Profile() {
    const { user } = useContext(UserContext); // Access the user object from context

    return (
        <div className="profile-container">
            <h2 className="profile-title">User Profile</h2>

            {user ? ( // Conditionally render content if user is logged in
                <div className="profile-details">
                    <p className="profile-item">
                        <span className="profile-label">Username:</span> {user.username}
                    </p>
                    <p className="profile-item">
                        <span className="profile-label">Email:</span> {user.email}
                    </p>
                    {/* You can add more profile details here if your user object contains them */}
                </div>
            ) : (
                <p className="profile-not-logged-in">
                    Please log in to view your profile.
                </p>
            )}
        </div>
    );
}

export default Profile;