import api from "./Interceptor";

export const getAllIncidentTypes = async () => {
  try {
    const response = await api.get('/types');
    return response.data;
  } catch (error) {
    console.error("Error fetching incident types:", error);
    throw error;
  }
};
