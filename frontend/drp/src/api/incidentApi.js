// import axios from 'axios';
import api from './Interceptor';

// Step 1: Submit form for analysis
export const submitForAnalysis = async (formData) => {
  const data = new FormData();
  data.append('image', {
    uri: formData.image.uri,
    type: formData.image.type,
    name: formData.image.name,
  });
  data.append('incident', JSON.stringify({
    type: formData.type,
    severity: formData.severity,
    description: formData.description,
    location: formData.location,
    timestamp: formData.timestamp
  }));

  try {
    const response = await api.post('/incidents/analyze', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

// Step 2: Submit after user approval (passing analysis back)
export const submitIncidentWithApproval = async (formData, analysis, approved) => {
  try {
    const response = await api.post('/incidents/add', {
      formData: formData,
      analysis: analysis,
      approved: approved
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Incident submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Submission failed:', error);
    throw error;
  }
};

// export const submitIncidentApi = async (incidentData, imageData) => {
//   const formData = new FormData();

//   // 1. Incident data (as string)
//   formData.append('incident', JSON.stringify(incidentData));

//   // 2. Image file
//   formData.append('image', {
//     uri: imageData.uri,
//     type: imageData.type,
//     name: imageData.name,
//   });

//   // 3. Axios POST
//   const response = await api.post(`/incidents`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });

//   return response.data;
// };

export const getLatestIncidents = async () => {
  try {
    const response = await api.get(`/incidents/latest`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest incidents:', error);
    throw error;
  }
};

export const getNearbyIncidents = async (latitude, longitude) => {
  try {
    const response = await api.get(`/incidents/nearby`, {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby incidents:', error);
    throw error;
  }
};