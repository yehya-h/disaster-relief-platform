const express = require('express');
const router = express.Router();
const { addIncident, getIncidents, getIncidentById, uploadImageToImgbb } = require('../controllers/incidentController');
const upload = require('../middlewares/upload');
const analyzeIncident = require('../middlewares/analyzer.middleware');

router.post('/', upload.single('image'), analyzeIncident, addIncident);
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
// router.post('/upload-image', upload.single('image'), uploadImageToImgbb);

module.exports = router;