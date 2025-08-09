const express = require('express');
const router = express.Router();
const { getAllTypes, addType, updateType, deleteType } = require('../controllers/typeController');

router.get('/', getAllTypes);
router.post('/', addType);
router.put('/:id', updateType);
router.delete('/:id', deleteType);

module.exports = router;
