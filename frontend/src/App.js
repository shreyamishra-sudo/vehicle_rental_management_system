import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Booking from './components/Booking';
import Admin from './components/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold">
                🚗 Vehicle Rental System
              </Link>
              <div className="space-x-4">
                <Link to="/" className="hover:text-blue-200 transition">
                  Home
                </Link>
                <Link to="/register" className="hover:text-blue-200 transition">
                  Register
                </Link>
                <Link to="/login" className="hover:text-blue-200 transition">
                  Login
                </Link>
                <Link to="/admin" className="hover:text-blue-200 transition">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booking/:vehicleId" element={<Booking />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;