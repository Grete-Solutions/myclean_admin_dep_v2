// src/redux/features/tokenSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store'; // You'll create this type

// Define the state type
interface TokenState {
  idToken: string | null;
}

// Define the initial state with the correct type
const initialState: TokenState = {
  idToken: null
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken: (state: TokenState, action: PayloadAction<string>) => {
      state.idToken = action.payload;
    },
    clearToken: (state: TokenState) => {
      state.idToken = null;
    }
  }
});

export const { setToken, clearToken } = tokenSlice.actions;

// Typed selector
export const selectIdToken = (state: RootState) => state.token.idToken;

export default tokenSlice.reducer;