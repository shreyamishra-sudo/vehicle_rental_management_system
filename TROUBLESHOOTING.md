# Troubleshooting Guide

## Internal Server Error

If you're getting an "Internal server error", follow these steps:

### Step 1: Check Server Console Logs

The server now logs detailed error information. Look at your terminal/console where the backend server is running. You should see:
- The exact error message
- SQL error codes (if it's a database error)
- Stack traces (in development mode)

### Step 2: Common Issues and Solutions

#### Database Connection Issues

**Error: "ER_ACCESS_DENIED_ERROR" or "ECONNREFUSED"**
- Check your `.env` file in the `backend` directory
- Verify database credentials:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_password
  DB_NAME=vehicle_rental_db
  ```
- Make sure MySQL is running
- Test connection: `mysql -u root -p`

#### Missing Tables

**Error: "ER_NO_SUCH_TABLE"**
- Run the SQL file to create tables:
  ```bash
  mysql -u root -p < vehicle_rental_mysql.sql
  ```
- Or verify tables exist:
  ```sql
  USE vehicle_rental_db;
  SHOW TABLES;
  ```

#### Missing Columns

**Error: "ER_BAD_FIELD_ERROR"**
- The code now handles missing columns automatically
- If you have a custom schema, the system will adapt
- Check that your database schema matches the expected structure

#### Port Already in Use

**Error: "EADDRINUSE"**
- Another process is using port 5000
- Change the port in `.env`:
  ```env
  PORT=5001
  ```
- Or stop the other process using port 5000

### Step 3: Enable Development Mode

For more detailed error messages, set in your `backend/.env`:
```env
NODE_ENV=development
```

This will show:
- Full error messages in API responses
- Stack traces
- SQL error details

### Step 4: Test Database Connection

Create a test file `backend/test-db.js`:
```javascript
const pool = require('./config/database');

pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected!');
    conn.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
```

Run: `node test-db.js`

### Step 5: Check Request Logs

The server now logs all requests. Look for:
```
2024-01-01T12:00:00.000Z - GET /api/vehicles/search
```

This helps identify which endpoint is failing.

### Step 6: Verify Environment Variables

Make sure your `backend/.env` file exists and has all required variables:
```bash
cd backend
cat .env
```

Should show:
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- PORT

### Common Error Codes

- **ER_NO_SUCH_TABLE (1146)**: Table doesn't exist - run SQL file
- **ER_BAD_FIELD_ERROR (1054)**: Column doesn't exist - check schema
- **ER_ACCESS_DENIED_ERROR (1045)**: Wrong credentials - check .env
- **ECONNREFUSED**: MySQL not running - start MySQL service

### Still Having Issues?

1. Check the server console for the exact error message
2. Verify database is running: `mysql -u root -p`
3. Verify tables exist: `SHOW TABLES;` in MySQL
4. Check `.env` file configuration
5. Restart the backend server after making changes

