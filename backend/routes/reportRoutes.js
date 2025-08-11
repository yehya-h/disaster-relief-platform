const express = require("express");
const router = express.Router();
const { getIncidentReportsByReporterId, submitReport } = require("../controllers/reportController");

router.get("/:reporterId", getIncidentReportsByReporterId);
router.post("/", submitReport);

module.exports = router;