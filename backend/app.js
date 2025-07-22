const express = require('express');
// const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const typeRoutes = require('./routes/typeRoutes');
const connectDB = require('./config/dbConfig');
const app = express();

// Middleware
app.use(express.json());
// app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/types', typeRoutes);

// Database connection
connectDB();

module.exports = app;