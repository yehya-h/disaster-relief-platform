import { createSlice } from "@reduxjs/toolkit";
import { getLatestIncidents } from "../api/incidentApi";

const incidentSlice = createSlice({
    name: "incident",
    initialState: {
        incidents: [],
    },
    reducers: {
        setIncidents: (state, action) => {
            state.incidents = action.payload;
        },
    },
});

export const fetchLatestIncidents = () => async (dispatch) => {
    try {
        const incidents = await getLatestIncidents();
        dispatch(setIncidents(incidents));
    } catch (error) {
        console.error("Error fetching incidents:", error);
    }
};

export const { setIncidents } = incidentSlice.actions;
export default incidentSlice.reducer;