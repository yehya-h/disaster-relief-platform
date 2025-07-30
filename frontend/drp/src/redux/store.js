import { configureStore } from '@reduxjs/toolkit';
import liveLocReducer from './LiveLocSlice';
import incidentTypesReducer from './incidentTypesSlice';
import userReducer from './UserSlice';
import shelterReducer from './shelterSlice';
import incidentReducer from './incidentSlice';
import signupLocationsReducer from './signupLocationsSlice';

export default configureStore({
  reducer: {
    liveLoc: liveLocReducer,
    incidentTypes: incidentTypesReducer,
    user: userReducer,
    shelter: shelterReducer,
    incident: incidentReducer,
    signupLocations: signupLocationsReducer,
  },
});
