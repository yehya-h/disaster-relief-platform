const express = require("express");
const router = express.Router();
const {
  analyzeIncidentController,
  addIncident,
  getLatestIncidentForms,
  getIncidentById,
  getNearbyIncidents,
  getMoreIncidents,
} = require("../controllers/incidentController");
const upload = require("../middlewares/upload");
const analyzeIncident = require("../middlewares/analyzer.middleware");
const authRole = require("../controllers/authController").authRole;

// Route 1: Analyze incident (returns analysis for approval)
router.post(
  "/analyze",
  authRole(0),
  upload.single("image"),
  analyzeIncident,
  analyzeIncidentController
);

// Route 2: Add incident (after user approval)
router.post("/add", authRole(0), addIncident);

// router.post(
//   "/",
//   authRole(0),
//   upload.single("image"),
//   analyzeIncident,
//   addIncident
// );
router.get("/latest", getLatestIncidentForms);
router.get("/nearby", getNearbyIncidents);
router.get("/load-more", getMoreIncidents);
router.get("/:id", getIncidentById);

// router.post('/upload-image', upload.single('image'), uploadImageToImgbb);

module.exports = router;
