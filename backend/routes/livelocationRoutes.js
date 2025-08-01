const express = require('express');
const router = express.Router();
const {getLiveLocationsByUserId, upsertLiveLocation} = require('../controllers/liveLocationController');

router.get('/:userId', getLiveLocationsByUserId);
router.post('/update', upsertLiveLocation);
module.exports = router;
