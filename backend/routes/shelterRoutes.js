const express = require('express');
const router = express.Router();
const { addShelter, getShelters, getNearbyShelters } = require('../controllers/shelterController');

router.post('/', addShelter);
router.get('/', getShelters);
router.post('/nearby', getNearbyShelters);

module.exports = router;