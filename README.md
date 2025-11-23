# Vehicle Rental Management System MVP

A complete, functional Minimum Viable Product (MVP) for a Vehicle Rental Management System built with React, Express.js, and MySQL.

## Technology Stack

- **Frontend**: React (functional components) with Tailwind CSS
- **Backend**: Express.js / Node.js
- **Database**: MySQL
- **Integration**: mysql2 package for database connectivity

## Project Structure

```
vehicle/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── routes/
│   │   ├── vehicles.js          # Vehicle search endpoint
│   │   ├── customer.js          # Customer registration/login
│   │   └── rental.js            # Rental booking and return
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js          # Vehicle search page
│   │   │   ├── Register.js      # Customer registration
│   │   │   ├── Login.js         # Customer login
│   │   │   ├── Booking.js       # Booking confirmation
│   │   │   └── Admin.js         # Admin return processing
│   │   ├── config/
│   │   │   └── api.js           # API configuration
│   │   ├── App.js               # Main app with routing
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── vehicle_rental_mysql.sql     # Database schema
└── README.md
```

## Setup Instructions

### 1. Database Setup

1. Make sure MySQL is installed and running on your system.

2. Create the database and tables by running the SQL file:
   ```bash
   mysql -u root -p < vehicle_rental_mysql.sql
   ```
   Or import it using MySQL Workbench or your preferred MySQL client.

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=vehicle_rental_db
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` directory (optional, defaults to localhost:5000):
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

   The app will open in your browser at `http://localhost:3000`

## API Endpoints

### 1. Vehicle Search & Availability
- **GET** `/api/vehicles/search`
- **Query Params**: `startDate`, `endDate`, `type_id` (optional)
- Returns available vehicles for the specified date range

### 2. Customer Registration
- **POST** `/api/customer/register`
- **Body**: `first_name`, `last_name`, `email`, `phone`, `password`, `address`
- Registers a new customer with hashed password

### 3. Customer Login
- **POST** `/api/customer/login`
- **Body**: `email`, `password`
- Returns customer information on successful login

### 4. Rental Booking
- **POST** `/api/rental/book`
- **Body**: `customer_id`, `vehicle_id`, `startDate`, `endDate`
- Creates a rental booking and updates vehicle status to 'Rented'

### 5. Vehicle Return
- **PUT** `/api/rental/return/:rentalId`
- Processes vehicle return, updates rental status, and creates payment record

## Features

### Frontend Pages

1. **Home/Search View** (`/`)
   - Date range selection for vehicle search
   - Optional vehicle type filter
   - Displays available vehicles in a responsive card layout
   - "Book Now" button on each vehicle card

2. **Customer Registration** (`/register`)
   - Registration form with validation
   - Password hashing on backend
   - Redirects to login after successful registration

3. **Customer Login** (`/login`)
   - Simple login form
   - Stores customer info in localStorage

4. **Booking Confirmation** (`/booking/:vehicleId`)
   - Displays selected vehicle details
   - Shows calculated cost based on dates
   - Final booking confirmation

5. **Admin Panel** (`/admin`)
   - Simple form to process vehicle returns
   - Updates rental and vehicle status
   - Processes final payment

## Database Schema

The system uses the following main tables:
- `VehicleTypes` - Vehicle categories
- `Vehicles` - Vehicle inventory
- `Customers` - Customer information
- `Rentals` - Rental bookings
- `Payments` - Payment records

## Code Quality

- Clean, modular code structure
- Modern React practices (functional components, hooks)
- Async/await for database operations
- Transaction support for critical operations
- Responsive Tailwind CSS styling
- Error handling and validation

## Environment Variables

### Backend (.env)
- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (default: vehicle_rental_db)
- `PORT` - Server port (default: 5000)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Notes

- The system uses bcrypt for password hashing
- Database transactions ensure data consistency for bookings and returns
- Vehicle availability is checked using complex SQL queries to prevent overlapping rentals
- The UI is fully responsive and uses Tailwind CSS for modern styling

