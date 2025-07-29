import { createSlice } from '@reduxjs/toolkit';

//used for signup process (save locations and user data back and forth)
const initialState = {
  locations: [],
  userData: null
};

const signupLocationsSlice = createSlice({
  name: 'signupLocations',
  initialState,
  reducers: {
    addLocation: (state, action) => {
      if (state.locations.length < 3) {
        state.locations.push(action.payload);
      }
    },
    removeLocation: (state, action) => {
      state.locations = state.locations.filter((_, index) => index !== action.payload);
    },
    updateLocation: (state, action) => {
      const { index, location } = action.payload;
      if (index >= 0 && index < state.locations.length) {
        state.locations[index] = location;
      }
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    clearSignupData: (state) => {
      state.locations = [];
      state.userData = null;
    }
  }
});

export const { 
  addLocation, 
  removeLocation, 
  updateLocation, 
  setUserData, 
  clearSignupData 
} = signupLocationsSlice.actions;

export default signupLocationsSlice.reducer;