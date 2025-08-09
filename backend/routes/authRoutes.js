const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/increment-resend', authController.incrementResend);
router.post('/check-resend-limit', authController.checkResendLimit)

module.exports = router;