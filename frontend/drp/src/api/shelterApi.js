import axios from "axios";
const BASE_URL = "http://10.0.2.2:3000/api/shelters";

export const getShelters = async () => {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching shelters:", error);
        throw error;
    }
};