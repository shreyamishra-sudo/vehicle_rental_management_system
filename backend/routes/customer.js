const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, address, driver_license_number } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !driver_license_number) {
    return res.status(400).json({ error: 'Missing required fields' });
}


    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT customer_id FROM Customers WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert customer
    const [result] = await pool.execute(
  `INSERT INTO Customers (first_name, last_name, email, phone, password_hash, address, driver_license_number)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    first_name,
    last_name,
    email,
    phone || null,
    password_hash,
    address || null,
    driver_license_number
  ]
);

    res.status(201).json({
      message: 'Customer registered successfully',
      customer_id: result.insertId
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Customer Login (simple version)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find customer
    const [customers] = await pool.execute(
      'SELECT customer_id, first_name, last_name, email, password_hash FROM Customers WHERE email = ?',
      [email]
    );

    if (customers.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const customer = customers[0];

    // Verify password
    const isValid = await bcrypt.compare(password, customer.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return customer info (without password)
    res.json({
      message: 'Login successful',
      customer: {
        customer_id: customer.customer_id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;