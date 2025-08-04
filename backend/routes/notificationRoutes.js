const express = require('express');
const router = express.Router();
const { getNotificationsById } = require('../controllers/notificationController');

router.get('/:userId', getNotificationsById);
module.exports = router;