// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import tokenReducer from './tokenSlice';

export const store = configureStore({
  reducer: {
    token: tokenReducer
  }
});

// Infer the `RootState` type from the store
export type RootState = ReturnType<typeof store.getState>;

// Infer the dispatch type
export type AppDispatch = typeof store.dispatch;