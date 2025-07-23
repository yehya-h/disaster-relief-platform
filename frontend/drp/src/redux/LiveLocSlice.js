import { createSlice } from '@reduxjs/toolkit';

export const liveLocSlice = createSlice({
  name: 'liveLoc',
  initialState: {
    liveLoc: {},
  },
  reducers: {
    addLiveLoc: (state, action) => {
      state.liveLoc = action.payload;
    },
    removeLiveLoc: (state, action) => {
      state.liveLoc = {};
    },
  },
});

export const { addLiveLoc, removeLiveLoc } = liveLocSlice.actions;
export default liveLocSlice.reducer;
