const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminauthController');

router.post('/login', adminAuthController.adminLogin);
router.get('/verify', adminAuthController.verifyAdminToken);

module.exports = router;
