const express = require('express');
const router = express.Router();
const { addShelter, getShelters, getNearbyShelters, updateShelter, deleteShelter } = require('../controllers/shelterController');

router.post('/', addShelter);
router.get('/', getShelters);
router.post('/nearby', getNearbyShelters);
router.put('/:id', updateShelter);
router.delete('/:id', deleteShelter);

module.exports = router;