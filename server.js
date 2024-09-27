const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const checkApiKey = require("./middleware/checkApiKey");
const authenticateJWT = require("./middleware/authenticateJWT");
const { ADMIN_API_KEY, SECRET_KEY } = require("./config");

// Initialize express
const app = express();
app.use(bodyParser.json());

// Database connection
const sequelize = new Sequelize("railway_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// Models
const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin", "user"), allowNull: false },
});

const Train = sequelize.define("Train", {
  train_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  source: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING, allowNull: false },
  total_seats: { type: DataTypes.INTEGER, allowNull: false },
  available_seats: { type: DataTypes.INTEGER, allowNull: false },
});

const Booking = sequelize.define("Booking", {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  train_id: { type: DataTypes.INTEGER, allowNull: false },
  seat_number: { type: DataTypes.INTEGER, allowNull: false },
});

// Sync database
sequelize.sync().then(() => {
  console.log("Database synced");
});

// Register User
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });
  res.json(user);
});

// Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Admin - Add New Train
app.post("/admin/add-train", checkApiKey, async (req, res) => {
  const { train_number, source, destination, total_seats } = req.body;
  const train = await Train.create({
    train_number,
    source,
    destination,
    total_seats,
    available_seats: total_seats,
  });
  res.json(train);
});

// Get Seat Availability
app.get("/trains", authenticateJWT, async (req, res) => {
  const { source, destination } = req.query;
  const trains = await Train.findAll({ where: { source, destination } });
  res.json(trains);
});

// Book a Seat
app.post("/book-seat", authenticateJWT, async (req, res) => {
  const { train_id, seat_number } = req.body;

  const t = await sequelize.transaction(); // Start a transaction

  try {
    // Lock the train row for update (pessimistic locking)
    const train = await Train.findOne({
      where: { id: train_id },
      lock: t.LOCK.UPDATE, // Lock the row to prevent race conditions
      transaction: t,
    });

    if (train && train.available_seats > 0) {
      // Check if the seat number has already been booked
      const existingBooking = await Booking.findOne({
        where: {
          train_id: train_id,
          seat_number: seat_number,
        },
        transaction: t,
      });

      if (existingBooking) {
        // Rollback the transaction if the seat is already booked
        await t.rollback();
        return res.status(400).json({ message: "Seat is already booked" });
      }

      // Proceed with booking the seat
      const booking = await Booking.create(
        {
          user_id: req.user.id,
          train_id,
          seat_number,
        },
        { transaction: t }
      );

      // Reduce the available seats and save the train
      train.available_seats -= 1;
      await train.save({ transaction: t });

      // Commit the transaction if everything is successful
      await t.commit();

      res.json(booking);
    } else {
      // Rollback if no available seats or any other issue
      await t.rollback();
      res.status(400).json({ message: "No available seats" });
    }
  } catch (error) {
    // Rollback transaction on error
    await t.rollback();
    console.error("Error during booking:", error);
    res.status(500).json({ message: "An error occurred during booking" });
  }
});

// Get Booking Details
app.get("/bookings/:id", authenticateJWT, async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (booking && booking.user_id === req.user.id) {
    res.json(booking);
  } else {
    res.status(403).json({ message: "Access denied" });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
