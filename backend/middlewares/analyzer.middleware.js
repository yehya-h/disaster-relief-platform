const AnalyzerService = require('../services/analyzer.service');

async function analyzeIncident(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file required' });
  }

  try {
    //type,severity,description are in  formData.append('incident', JSON.stringify(incidentData));
    const incidentData = JSON.parse(req.body.incident);
    const analysis = await AnalyzerService.analyzeIncident({
      imagePath: req.file.path,
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