// client/src/App.jsx
import React, { useContext } from 'react'; // <--- NEW: Import useContext
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import Listings from './pages/Listings';
import Profile from './pages/Profile'; // Assuming you'll create this page
import Navbar from './components/Navbar'; // <--- NEW: Import Navbar
import { UserContext, UserProvider } from './UserContext'; // <--- Ensure UserContext is imported

// Helper component to wrap routes that need the Navbar
const LayoutWithNavbar = ({ children }) => {
    const { user } = useContext(UserContext);
    return (
        <>
            {user && <Navbar />} {/* Only render Navbar if user is logged in */}
            {children}
        </>
    );
};

// Sets up routing
function App() {
    return (
        <UserProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Routes that do NOT have the Navbar (e.g., Home, Register, Login) */}
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />

                        {/* Routes that DO have the Navbar (e.g., Listings, Profile) */}
                        {/* Wrap these routes with LayoutWithNavbar */}
                        <Route
                            path="/listings"
                            element={
                                <LayoutWithNavbar>
                                    <Listings />
                                </LayoutWithNavbar>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <LayoutWithNavbar>
                                    <Profile />
                                </LayoutWithNavbar>
                            }
                        />
                        {/* Add more protected routes here, wrapped by LayoutWithNavbar */}
                    </Routes>
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;