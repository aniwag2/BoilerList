import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; 
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import Listings from './pages/Listings';
import { UserProvider } from './UserContext'; 

//sets up routing 
function App() {
  return (
    <UserProvider> 
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/listings" element={<Listings />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;