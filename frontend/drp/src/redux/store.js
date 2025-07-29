import { configureStore } from '@reduxjs/toolkit';
import liveLocReducer from './LiveLocSlice';
import incidentTypesReducer from './incidentTypesSlice';
import userReducer from './UserSlice';
import signupLocationsReducer from './signupLocationsSlice';

export default configureStore({
  reducer: {
    liveLoc: liveLocReducer,
    incidentTypes: incidentTypesReducer,
    user: userReducer,
    signupLocations: signupLocationsReducer,
  },
});
