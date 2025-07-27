const express = require('express');
const router = express.Router();
const { addIncident, getLatestIncidentForms, getIncidentById, getNearbyIncidents } = require('../controllers/incidentController');
const upload = require('../middlewares/upload');
const analyzeIncident = require('../middlewares/analyzer.middleware');

router.post('/', upload.single('image'), analyzeIncident, addIncident);
router.get('/', getLatestIncidentForms);
router.post('/nearby', getNearbyIncidents);
router.get('/:id', getIncidentById);
// router.post('/upload-image', upload.single('image'), uploadImageToImgbb);

module.exports = router;