const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class AnalyzerService {
  static async analyzeIncident({ imagePath, type, severity, description }) {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('type', type);
    formData.append('severity', severity);
    formData.append('description', description);

    try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        is_incident: response.data.is_incident,
        probability: response.data.probability,
        reasoning: response.data.reasoning,
        reformulated_description: response.data.reformulated_description,
        severity: response.data.severity,
        type: response.data.type
      };
    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error('Incident analysis service unavailable');
    }
  }
}

module.exports = AnalyzerService;