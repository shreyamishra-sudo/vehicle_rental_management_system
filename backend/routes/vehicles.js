const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Vehicle Search & Availability
router.get('/search', async (req, res) => {
  try {
    const { startDate, endDate, type_id } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Check if color column exists in Vehicles table
    let hasColorColumn = false;
    try {
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'Vehicles' 
           AND COLUMN_NAME = 'color'`
      );
      hasColorColumn = columns.length > 0;
    } catch (err) {
      // If we can't check, assume it doesn't exist
      hasColorColumn = false;
    }

    // Complex query: Get vehicles that are Available and don't have overlapping rentals
    // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
    const colorSelect = hasColorColumn ? 'v.color,' : '';
    let query = `
      SELECT DISTINCT 
        v.vehicle_id,
        v.make,
        v.model,
        v.year,
        ${colorSelect}
        v.license_plate,
        v.daily_rate,
        v.status,
        vt.type_name,
        vt.type_id
      FROM Vehicles v
      LEFT JOIN VehicleTypes vt ON v.type_id = vt.type_id
      WHERE v.status = 'Available'
        AND v.vehicle_id NOT IN (
          SELECT DISTINCT r.vehicle_id
          FROM Rentals r
          WHERE r.status IN ('Reserved', 'Active')
            AND r.start_date <= ?
            AND r.end_date >= ?
        )
    `;

    const params = [endDate, startDate];

    // Add type filter if provided
    if (type_id) {
      query += ' AND v.type_id = ?';
      params.push(type_id);
    }

    query += ' ORDER BY v.daily_rate ASC';

    const [vehicles] = await pool.execute(query, params);

    // Add default color if column doesn't exist
    if (!hasColorColumn) {
      vehicles.forEach(vehicle => {
        vehicle.color = 'N/A';
      });
    }

    res.json({ vehicles });
  } catch (error) {
    console.error('Error searching vehicles:', error);
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
  }
});

// Get all vehicle types
router.get('/types', async (req, res) => {
  try {
    const [types] = await pool.execute('SELECT * FROM VehicleTypes ORDER BY type_name');
    res.json({ types });
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if color column exists
    let hasColorColumn = false;
    try {
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'Vehicles' 
           AND COLUMN_NAME = 'color'`
      );
      hasColorColumn = columns.length > 0;
    } catch (err) {
      hasColorColumn = false;
    }

    const [vehicles] = await pool.execute(
      `SELECT v.*, vt.type_name 
       FROM Vehicles v 
       LEFT JOIN VehicleTypes vt ON v.type_id = vt.type_id 
       WHERE v.vehicle_id = ?`,
      [id]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Add default color if column doesn't exist
    if (!hasColorColumn && !vehicles[0].color) {
      vehicles[0].color = 'N/A';
    }

    res.json({ vehicle: vehicles[0] });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
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