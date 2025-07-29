const express = require("express");
const router = express.Router();
const {
  addIncident,
  getLatestIncidentForms,
  getIncidentById,
  getNearbyIncidents,
} = require("../controllers/incidentController");
const upload = require("../middlewares/upload");
const analyzeIncident = require("../middlewares/analyzer.middleware");
const authRole = require("../controllers/authController").authRole;

router.post(
  "/",
  authRole(0),
  upload.single("image"),
  analyzeIncident,
  addIncident
);
router.get("/", getLatestIncidentForms);
router.get("/:id", getIncidentById);
router.post("/nearby", getNearbyIncidents);
// router.post('/upload-image', upload.single('image'), uploadImageToImgbb);

module.exports = router;
