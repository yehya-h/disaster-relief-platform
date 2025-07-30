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

export const fetchIncidentTypes = (forceRefresh = false) => async (dispatch, getState) => {
  const { incidentTypes } = getState().incidentTypes;

  if (!forceRefresh && incidentTypes.length > 0) {
    return;
  }

  try {
    const data = await getAllIncidentTypes();
    dispatch(setTypes(data));
  } catch (error) {
    console.error('Failed to fetch incident types:', error.message);
  }
};

export const { setTypes, removeTypes } = incidentTypesSlice.actions;
export default incidentTypesSlice.reducer;
