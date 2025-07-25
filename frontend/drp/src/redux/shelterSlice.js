import { createSlice } from "@reduxjs/toolkit";
import { getShelters } from "../api/shelterApi";

const shelterSlice = createSlice({
    name: "shelter",
    initialState: {
        shelters: [],
    },
    reducers: {
        setShelters: (state, action) => {
            state.shelters = action.payload;
        },
    },
});

export const fetchShelters = () => async (dispatch) => {
    try {
        const shelters = await getShelters();
        dispatch(setShelters(shelters));
    } catch (error) {
        console.error("Error fetching shelters:", error);
    }
};

export const { setShelters } = shelterSlice.actions;
export default shelterSlice.reducer;