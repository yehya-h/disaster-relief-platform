import { configureStore } from '@reduxjs/toolkit';
import liveLocReducer from './LiveLocSlice';
import incidentTypesReducer from './incidentTypesSlice';
import userReducer from './UserSlice';
import themeReducer from './ThemeSlice'
import shelterReducer from './shelterSlice';
import incidentReducer from './incidentSlice';
import signupLocationsReducer from './signupLocationsSlice';

export  const store = configureStore({
  reducer: {
    liveLoc: liveLocReducer,
    incidentTypes: incidentTypesReducer,
    user: userReducer,
    theme: themeReducer,
    shelter: shelterReducer,
    incident: incidentReducer,
    signupLocations: signupLocationsReducer,
  },
});

export default store;
