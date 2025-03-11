import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

const initialState = {
  token: null,
  refreshToken: null,
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    clearTokens: (state) => {
      state.token = null;
      state.refreshToken = null;
    },
  },
});

// Export selectors
export const selectIdToken = (state: RootState) => state.token.token;
export const selectRefreshToken = (state: RootState) => state.token.refreshToken;

export const { setToken, setRefreshToken, clearTokens } = tokenSlice.actions;
export default tokenSlice.reducer;