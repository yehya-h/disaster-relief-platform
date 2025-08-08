const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const typeRoutes = require("./routes/typeRoutes");
const guestController = require("./controllers/guestController");
const fcmRoutes = require("./routes/fcmRoutes");
const authToken = require("./controllers/authController").authToken;
const authRole = require("./controllers/authController").authRole;
const authController = require("./controllers/authController");
const adminAuthController = require("./controllers/adminauthController");
const connectDB = require("./config/dbConfig");
const userRoutes = require("./routes/userRoutes");
const liveLocationRoutes = require("./routes/livelocationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/auth", authToken, authRole(1), authRoutes);
app.use("/api/incidents", authToken, incidentRoutes);
app.use("/api/shelters", authToken, shelterRoutes);
app.use("/api/types", typeRoutes);
app.post("/guestToken", guestController.guestToken);
app.use("/api/fcm", authToken, fcmRoutes);
app.use("/api/live-locations", authToken, liveLocationRoutes);
app.use("/api/notifications", authToken, notificationRoutes);
app.post("/api/logout", authToken, authRole(0), authController.logout);
app.post("/api/admin/logout", authToken, authRole(2), adminAuthController.adminLogout);
app.use("/api/user", authToken, authRole(0), userRoutes);


// Database connection
connectDB();

module.exports = app;
