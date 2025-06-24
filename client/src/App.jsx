import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Keep your existing App.css
import Register from './pages/Register';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;