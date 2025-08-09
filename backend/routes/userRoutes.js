const express = require('express');
const router = express.Router();
const {getUserById, updateUserInfo, updateUserPassword, updateUserLocations} = require('../controllers/userController');

router.get('/', getUserById);
router.put('/userInfo', updateUserInfo);
router.put('/userPassword', updateUserPassword);
router.put('/userLocations', updateUserLocations);

module.exports = router;