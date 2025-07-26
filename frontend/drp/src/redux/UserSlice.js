import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userId: '',
    role: '',
    fcmToken: '',
    deviceId: '',
  },
  reducers: {
    addUser: (state, action) => {
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.fcmToken = action.payload.fcmToken;
      state.deviceId = action.payload.deviceId;
    },
    removeUser: () => {
      state.userId = '';
      state.role = '';
      state.fcmToken = '';
      state.deviceId = '';
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
