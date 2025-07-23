import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000/api';

export const submitIncidentApi = async (incidentData, imageData) => {
  const formData = new FormData();

  // 1. Incident data (as string)
  formData.append('incident', JSON.stringify(incidentData));

  // 2. Image file
  formData.append('image', {
    uri: imageData.uri,
    type: imageData.type,
    name: imageData.name,
  });

  // 3. Axios POST
  const response = await axios.post(`${BASE_URL}/incidents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
