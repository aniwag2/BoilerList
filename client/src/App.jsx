// client/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import Listings from './pages/Listings';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { UserContext, UserProvider } from './UserContext';
import UploadItem from './pages/UploadItem';
import Contact from './pages/Contact';
import EditItem from './pages/EditItem'; // NEW: Import EditItem
import Chatbot from './components/Chatbot';


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
            <Chatbot />
            <Router>
                <div className="App">
                    <Routes>
                        {/* Routes that do NOT have the Navbar (e.g., Home, Register, Login) */}
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />

                        {/* Routes that DO have the Navbar (e.g., Listings, Profile, UploadItem, Contact, EditItem) */}
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
                        <Route
                            path="/uploaditem"
                            element={
                                <LayoutWithNavbar>
                                    <UploadItem />
                                </LayoutWithNavbar>
                            }
                        />
                        <Route
                            path="/contact"
                            element={
                                <LayoutWithNavbar>
                                    <Contact />
                                </LayoutWithNavbar>
                            }
                        />
                        {/* NEW ROUTE FOR EDITING */}
                        <Route
                            path="/edit-item/:id" // Notice the :id for dynamic routing
                            element={
                                <LayoutWithNavbar>
                                    <EditItem />
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