import api from "./Interceptor";

export const getShelters = async () => {
    try {
        const response = await api.get('/shelters');
        return response.data;
    } catch (error) {
        console.error("Error fetching shelters:", error);
        throw error;
    }
};