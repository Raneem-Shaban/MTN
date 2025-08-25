import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sectionReducer from './slices/sectionSlice';
import searchReducer from './slices/searchSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'auth',
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    sections: sectionReducer,
    search: searchReducer,
  },
});

export const persistor = persistStore(store);

export default store;
