import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sectionReducer from './slices/sectionSlice';
import searchReducer from './slices/searchSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    sections: sectionReducer,
    search: searchReducer,
  },
});

export default store;
