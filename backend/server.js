require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const configureSocket = require('./config/socket');
// const authRoutes = require('./routes/api');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
// app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
console.log(`Server running on port ${PORT}`)
);

// WebSocket Setup
configureSocket(server);