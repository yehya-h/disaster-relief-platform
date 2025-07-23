const AnalyzerService = require('../services/analyzer.service');

async function analyzeIncident(req, res, next) {
  console.log("received file:" , req.file);
  if (!req.file) {
    return res.status(400).json({ error: 'Image file required' });
  }

  try {
    const incidentData = JSON.parse(req.body.incident);
    const analysis = await AnalyzerService.analyzeIncident({
      file: req.file,
      type: incidentData.type,
      severity: incidentData.severity,
      description: incidentData.description
    });

    req.incidentAnalysis = analysis; // Attach to request object
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = analyzeIncident;