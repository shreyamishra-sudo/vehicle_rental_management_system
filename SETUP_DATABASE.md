# Database Setup Guide

## Important: Database Configuration

If you're seeing errors like "Table 'vehicle.vehicletypes' doesn't exist", follow these steps:

### Step 1: Check Your Database Name

The SQL file creates a database named `vehicle_rental_db`. Make sure your `.env` file in the `backend` directory matches:

```env
DB_NAME=vehicle_rental_db
```

If you're using a different database name (like `vehicle`), either:
- Update your `.env` file to use `vehicle_rental_db`, OR
- Modify the SQL file to use your database name

### Step 2: Run the SQL File

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p < vehicle_rental_mysql.sql
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script → Select `vehicle_rental_mysql.sql`
4. Execute the script

**Option C: Using MySQL Command Line (Step by Step)**
```bash
# Login to MySQL
mysql -u root -p

# Then run:
source vehicle_rental_mysql.sql;

# Or copy and paste the contents of vehicle_rental_mysql.sql into the MySQL prompt
```

### Step 3: Verify Tables Were Created

After running the SQL file, verify the tables exist:

```sql
USE vehicle_rental_db;  -- or your database name
SHOW TABLES;
```

You should see:
- VehicleTypes
- Vehicles
- Customers
- Rentals
- Payments

### Step 4: Check Your .env File

Make sure your `backend/.env` file has the correct database name:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vehicle_rental_db
PORT=5000
```

### Troubleshooting

**Error: "Table doesn't exist"**
- Make sure you ran the SQL file
- Check that the database name in `.env` matches the database you created
- Verify tables exist: `SHOW TABLES;`

**Error: "Unknown column 'color'"**
- The code now handles missing columns gracefully
- If you have a custom schema, the system will work without the color column
- To add the color column, run:
  ```sql
  ALTER TABLE Vehicles ADD COLUMN color VARCHAR(30);
  ```

**Error: "Access denied"**
- Check your MySQL username and password in `.env`
- Make sure the MySQL user has permissions to create databases and tables

