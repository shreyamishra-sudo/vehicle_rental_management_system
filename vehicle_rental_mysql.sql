-- Vehicle Rental Management System Database Schema

CREATE DATABASE IF NOT EXISTS vehicle_rental_db;
USE vehicle_rental_db;

-- Vehicle Types Table
CREATE TABLE IF NOT EXISTS VehicleTypes (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS Vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    status ENUM('Available', 'Rented', 'Maintenance') DEFAULT 'Available',
    type_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES VehicleTypes(type_id) ON DELETE SET NULL
);

-- Customers Table
CREATE TABLE IF NOT EXISTS Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rentals Table
CREATE TABLE IF NOT EXISTS Rentals (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_return_date DATETIME NULL,
    calculated_cost DECIMAL(10, 2) NOT NULL,
    status ENUM('Reserved', 'Active', 'Completed', 'Cancelled') DEFAULT 'Reserved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    rental_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Completed',
    FOREIGN KEY (rental_id) REFERENCES Rentals(rental_id) ON DELETE CASCADE
);

-- Insert Sample Vehicle Types
INSERT INTO VehicleTypes (type_name, description) VALUES
('Sedan', '4-door passenger car'),
('SUV', 'Sport Utility Vehicle'),
('Truck', 'Pickup truck'),
('Coupe', '2-door sports car'),
('Van', 'Passenger van');

-- Insert Sample Vehicles
INSERT INTO Vehicles (make, model, year, color, license_plate, daily_rate, status, type_id) VALUES
('Toyota', 'Camry', 2022, 'Silver', 'ABC-1234', 45.00, 'Available', 1),
('Honda', 'Civic', 2023, 'Blue', 'XYZ-5678', 40.00, 'Available', 1),
('Ford', 'Explorer', 2022, 'Black', 'DEF-9012', 65.00, 'Available', 2),
('Chevrolet', 'Silverado', 2021, 'White', 'GHI-3456', 75.00, 'Available', 3),
('BMW', '3 Series', 2023, 'Red', 'JKL-7890', 85.00, 'Available', 4),
('Mercedes', 'Sprinter', 2022, 'Gray', 'MNO-2468', 90.00, 'Available', 5),
('Nissan', 'Altima', 2022, 'Silver', 'PQR-1357', 42.00, 'Available', 1),
('Jeep', 'Grand Cherokee', 2023, 'Green', 'STU-8024', 70.00, 'Available', 2);

