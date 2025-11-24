import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Booking from './components/Booking';
import Admin from './components/Admin';

function App() {

  // Load user from localStorage initially
  const [loggedInUser, setLoggedInUser] = useState(
    JSON.parse(localStorage.getItem("customer"))
  );

  // Listen for login updates (custom event fired from Login.js)
  useEffect(() => {
    const updateUser = () => {
      const stored = localStorage.getItem("customer");
      setLoggedInUser(stored ? JSON.parse(stored) : null);
    };

    window.addEventListener("customer-updated", updateUser);

    return () => window.removeEventListener("customer-updated", updateUser);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("customer");
    window.dispatchEvent(new Event("customer-updated"));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">

        {/* NAVBAR */}
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

                {/* Show Login + Register only when NOT logged in */}
                {!loggedInUser ? (
                  <>
                    <Link to="/register" className="hover:text-blue-200 transition">
                      Register
                    </Link>

                    <Link to="/login" className="hover:text-blue-200 transition">
                      Login
                    </Link>
                  </>
                ) : (
                  /* Show Logout when logged in */
                  <button
                    onClick={handleLogout}
                    className="hover:text-blue-200 transition"
                  >
                    Logout
                  </button>
                )}

                <Link to="/admin" className="hover:text-blue-200 transition">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Logged-in User Display */}
        {loggedInUser && (
          <div className="bg-gray-100 p-3 text-right text-sm text-gray-700">
            Logged in as:{" "}
            <span className="font-semibold">
              {loggedInUser.first_name} {loggedInUser.last_name}
            </span>
          </div>
        )}

        {/* ROUTES */}
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
