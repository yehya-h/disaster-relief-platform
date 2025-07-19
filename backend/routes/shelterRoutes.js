const express = require('express');
const router = express.Router();
const { addShelter, getShelters } = require('../controllers/shelterController');

router.post('/', addShelter);
router.get('/', getShelters);

module.exports = router;