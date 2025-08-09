import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userId: '',
    role: '',
    fcmToken: '',
    deviceId: '',
    fname: '',
    lname: '',
    email: '',
    locations: []
  },
  reducers: {
    addUser: (state, action) => {
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.fcmToken = action.payload.fcmToken;
      state.deviceId = action.payload.deviceId;
    },
    updateUserDetails: (state, action) => {
      state.fname = action.payload.fname;
      state.lname = action.payload.lname;
      state.email = action.payload.email;
      state.locations = action.payload.locations || [];
    },
    removeUser: (state) => {
      state.userId = '';
      state.role = '';
      state.fcmToken = '';
      state.deviceId = '';
      state.fname = '';
      state.lname = '';
      state.email = '';
      state.locations = [];
    },
  },
});

export const { addUser, updateUserDetails, removeUser } = userSlice.actions;
export default userSlice.reducer;
