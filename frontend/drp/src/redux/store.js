import { configureStore } from '@reduxjs/toolkit';
import liveLocReducer from './LiveLocSlice';
import incidentTypesReducer from './incidentTypesSlice';
import userReducer from './UserSlice';

export default configureStore({
  reducer: {
    liveLoc: liveLocReducer,
    incidentTypes: incidentTypesReducer,
    user: userReducer,
  },
});
