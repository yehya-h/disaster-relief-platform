const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const typeRoutes = require('./routes/typeRoutes');
const guestController = require('./controllers/guestController');
const authToken = require('./controllers/authController').authToken;
const authRole = require('./controllers/authController').authRole;
const authController = require('./controllers/authController');
const connectDB = require('./config/dbConfig');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authToken, authRole(1), authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/types', typeRoutes);
app.post('/guestToken', guestController.guestToken);
app.post('/api/logout', authToken, authRole(0), authController.logout);
app.use('/api/user', authToken, authRole(0), userRoutes);

// Database connection
connectDB();

module.exports = app;