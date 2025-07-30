const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");

// Save or update FCM token
router.post("/save-fcm-token", fcmController.saveFcmToken);

// Remove FCM token
router.post("/remove-fcm-token", fcmController.removeFcmToken);

module.exports = router;
