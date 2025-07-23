import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userId: '',
    role: '',
  },
  reducers: {
    addUser: (state, action) => {
      state.userId = action.payload.userId;
      state.role = action.payload.role;
    },
    removeUser: (state, action) => {
      state.userId = '';
      state.role = '';
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
