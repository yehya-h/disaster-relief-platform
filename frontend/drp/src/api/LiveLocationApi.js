// import axios from "axios";
// const BASE_URL = "http://10.0.2.2:3000/api/live-locations";
import api from "./Interceptor";
export const getLiveLocationsByUserId = async (userId) => {
    try {
        const response = await api.get(`/live-locations/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching live locations:", error);
        throw error;
    }
}

//locarionData should contain userId, location and deviceId
// Example: { userId: '123', location: { latitude: 12.34, longitude: 56.78 }, deviceId: 'abc123' }
export const upsertLiveLocation = async (locationData) => {
    try {
        const response = await api.post("/live-locations", locationData);
        return response.data;
    } catch (error) {
        console.error("Error upserting live location:", error);
        throw error;
    }
};

