# Railway Management System

This project is developed as part of the **WorkIndia Internship Hiring Assignment**. The system is designed to manage railway bookings, allowing users to register, log in, view trains, check seat availability, and book seats. Admin functionalities are protected with an API key, and all users must authenticate using JWT tokens.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Postman Instructions](#postman-instructions)

## Overview

This Railway Management System is built to demonstrate backend development skills. It provides basic user management, train management, and booking functionality while ensuring the system is safe from unauthorized access and race conditions when booking seats.

## Features

- **User Registration & Authentication**: Allows users to register and log in with JWT-based authentication.
- **Admin Controls**: Admins can add trains to the system using an API key.
- **Booking Management**: Users can view trains, check seat availability, and book seats.
- **Concurrency Handling**: Prevents race conditions to ensure that a seat can only be booked once, even with multiple simultaneous requests.
- **API Security**: Admin API endpoints are protected with a unique API key, and JWT tokens are used to authorize users.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (using Sequelize ORM)
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcrypt for securing passwords

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/railway-management-system.git
   cd railway-management-system
   ```

2. Install project dependencies:

   ```bash
   npm install
   ```

3. Run the application:

   ```bash
   npm start
   ```

## Environment Variables

Set up a `.env` file in the root directory with the following values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=railway_db
SECRET_KEY=your_jwt_secret_key
ADMIN_API_KEY=your_admin_api_key
```

## Database Setup

1. Ensure MySQL is installed and running.
2. Create a database:

   ```sql
   CREATE DATABASE railway_db;
   ```

3. The application will automatically create the necessary tables when it runs for the first time.

## API Endpoints

### User Endpoints

- **Register**  
  `POST /register`  
  Request Body:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123",
    "role": "user"
  }
  ```

- **Login**  
  `POST /login`  
  Request Body:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```

  Response:
  ```json
  {
    "token": "JWT token"
  }
  ```

### Admin Endpoints (API Key Required)

- **Add New Train**  
  `POST /admin/add-train`  
  Requires `x-api-key` in headers:
  ```bash
  x-api-key: <ADMIN_API_KEY>
  ```

  Request Body:
  ```json
  {
    "train_number": "12345",
    "source": "Station A",
    "destination": "Station B",
    "total_seats": 100
  }
  ```

### Booking Endpoints (JWT Required)

- **Get Available Trains**  
  `GET /trains?source=Station%20A&destination=Station%20B`  
  Requires `Authorization` header: `Bearer <token>`

- **Book a Seat**  
  `POST /book-seat`  
  Requires `Authorization` header: `Bearer <token>`

  Request Body:
  ```json
  {
    "train_id": 1,
    "seat_number": 10
  }
  ```

- **Get Booking Details**  
  `GET /bookings/:id`  
  Requires `Authorization` header: `Bearer <token>`

## Postman Instructions

1. **Register a New User**  
   - URL: `POST http://localhost:3000/register`  
   - Body (JSON):  
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123",
       "role": "user"
     }
     ```

2. **Login User**  
   - URL: `POST http://localhost:3000/login`  
   - Body (JSON):  
     ```json
     {
       "email": "john@example.com",
       "password": "password123"
     }
     ```

   - Save the `token` from the response for future requests.

3. **Admin: Add a New Train**  
   - URL: `POST http://localhost:3000/admin/add-train`  
   - Headers:  
     ```
     x-api-key: <ADMIN_API_KEY>
     ```
   - Body (JSON):  
     ```json
     {
       "train_number": "12345",
       "source": "Station A",
       "destination": "Station B",
       "total_seats": 100
     }
     ```

4. **Get Available Trains**  
   - URL: `GET http://localhost:3000/trains?source=Station%20A&destination=Station%20B`  
   - Headers:  
     ```
     Authorization: Bearer <token>
     ```

5. **Book a Seat**  
   - URL: `POST http://localhost:3000/book-seat`  
   - Headers:  
     ```
     Authorization: Bearer <token>
     ```  
   - Body (JSON):  
     ```json
     {
       "train_id": 1,
       "seat_number": 10
     }
     ```

6. **Get Booking Details**  
   - URL: `GET http://localhost:3000/bookings/:id`  
   - Headers:  
     ```
     Authorization: Bearer <token>
     ```
