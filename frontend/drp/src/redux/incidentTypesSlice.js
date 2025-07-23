import { createSlice } from '@reduxjs/toolkit';
import { getAllIncidentTypes } from '../api/incidentTypes';

const incidentTypesSlice = createSlice({
  name: 'incidentTypes',
  initialState: {
    incidentTypes: [],
  },
  reducers: {
    setTypes: (state, action) => {
      state.incidentTypes = action.payload;
    },
    removeTypes: state => {
      state.incidentTypes = [];
    },
  },
});

export const fetchIncidentTypes = () => async dispatch => {
  try {
    const data = await getAllIncidentTypes();
    dispatch(setTypes(data));
  } catch (error) {
    console.error('Failed to fetch incident types:', error.message);
  }
};

export const { setTypes, removeTypes } = incidentTypesSlice.actions;
export default incidentTypesSlice.reducer;
