const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Rental Booking
router.post('/book', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { customer_id, vehicle_id, startDate, endDate } = req.body;

    // Validation
    if (!customer_id || !vehicle_id || !startDate || !endDate) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      await connection.rollback();
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Get vehicle details
    const [vehicles] = await connection.execute(
      'SELECT daily_rate, status FROM Vehicles WHERE vehicle_id = ?',
      [vehicle_id]
    );

    if (vehicles.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = vehicles[0];

    // Check if vehicle is available
    if (vehicle.status !== 'Available') {
      await connection.rollback();
      return res.status(400).json({ error: 'Vehicle is not available' });
    }

    // Check for overlapping rentals
    // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
    const [overlapping] = await connection.execute(
      `SELECT rental_id FROM Rentals 
       WHERE vehicle_id = ? 
         AND status IN ('Reserved', 'Active')
         AND start_date <= ?
         AND end_date >= ?`,
      [vehicle_id, endDate, startDate]
    );

    if (overlapping.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Vehicle is already booked for this period' });
    }

    // Calculate cost
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const calculated_cost = days * parseFloat(vehicle.daily_rate);

    // Insert rental
    const [rentalResult] = await connection.execute(
      `INSERT INTO Rentals (customer_id, vehicle_id, start_date, end_date, calculated_cost, status)
       VALUES (?, ?, ?, ?, ?, 'Reserved')`,
      [customer_id, vehicle_id, startDate, endDate, calculated_cost]
    );

    // Update vehicle status to 'Rented'
    await connection.execute(
      'UPDATE Vehicles SET status = ? WHERE vehicle_id = ?',
      ['Rented', vehicle_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Rental booked successfully',
      rental_id: rentalResult.insertId,
      calculated_cost: calculated_cost,
      days: days
    });
  } catch (error) {
    await connection.rollback().catch(rollbackErr => {
      console.error('Error during rollback:', rollbackErr);
    });
    console.error('Error booking rental:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlState: error.sqlState
      } : undefined
    });
  } finally {
    connection.release();
  }
});

// Vehicle Return
router.put('/return/:rentalId', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { rentalId } = req.params;

    // Get rental details
    const [rentals] = await connection.execute(
      `SELECT r.*, v.vehicle_id, v.daily_rate 
       FROM Rentals r 
       JOIN Vehicles v ON r.vehicle_id = v.vehicle_id 
       WHERE r.rental_id = ?`,
      [rentalId]
    );

    if (rentals.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Rental not found' });
    }

    const rental = rentals[0];

    if (rental.status === 'Completed') {
      await connection.rollback();
      return res.status(400).json({ error: 'Rental already completed' });
    }

    // Update rental: set actual_return_date and status
    const actualReturnDate = new Date();
    await connection.execute(
      `UPDATE Rentals 
       SET actual_return_date = ?, status = 'Completed' 
       WHERE rental_id = ?`,
      [actualReturnDate, rentalId]
    );

    // Update vehicle status to 'Available'
    await connection.execute(
      'UPDATE Vehicles SET status = ? WHERE vehicle_id = ?',
      ['Available', rental.vehicle_id]
    );

    // Calculate any additional charges (late return, etc.)
    // For simplicity, we'll just use the calculated_cost
    // In a real system, you'd calculate late fees here
    const finalAmount = parseFloat(rental.calculated_cost);

    // Insert payment record
    await connection.execute(
      `INSERT INTO Payments (rental_id, amount, payment_method, status)
       VALUES (?, ?, 'Credit Card', 'Completed')`,
      [rentalId, finalAmount]
    );

    await connection.commit();

    res.json({
      message: 'Vehicle returned successfully',
      rental_id: rentalId,
      final_amount: finalAmount,
      return_date: actualReturnDate
    });
  } catch (error) {
    await connection.rollback().catch(rollbackErr => {
      console.error('Error during rollback:', rollbackErr);
    });
    console.error('Error processing return:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlState: error.sqlState
      } : undefined
    });
  } finally {
    connection.release();
  }
});

// Get rental by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rentals] = await pool.execute(
      `SELECT r.*, 
              v.make, v.model, v.license_plate,
              c.first_name, c.last_name, c.email
       FROM Rentals r
       JOIN Vehicles v ON r.vehicle_id = v.vehicle_id
       JOIN Customers c ON r.customer_id = c.customer_id
       WHERE r.rental_id = ?`,
      [id]
    );

    if (rentals.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    res.json({ rental: rentals[0] });
  } catch (error) {
    console.error('Error fetching rental:', error);
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

module.exports = router;

