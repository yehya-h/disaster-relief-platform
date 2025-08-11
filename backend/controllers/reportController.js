const Report = require("../models/reportModel");

const getIncidentReportsByReporterId = async (req, res) => {
  try {
    const { reporterId } = req.params;
    const reports = await Report.find({ reporterId });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const submitReport = async (req, res) => {
  try {
    const { incidentId, reportType } = req.body;
    const reporterId = req.user.id; // Assuming you have user auth middleware

    // Check if user already voted on this incident
    const existingReport = await Report.findOne({ 
      incidentId, 
      reporterId 
    });

    if (existingReport) {
      // Update existing vote
      existingReport.reportType = reportType;
      await existingReport.save();
    } else {
      // Create new vote
      await Report.create({
        incidentId,
        reporterId,
        reportType
      });
    }
    console.log('Vote submitted successfully');
    res.status(200).json({ message: 'Vote submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getIncidentReportsByReporterId,
  submitReport,
};