import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {
    id: null,
    name: '',
    email: '',
    role_id: 4,
    role_name: '',
    token: null,
  },
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = {
        id: null,
        name: '',
        email: '',
        role_id: null,
        role_name: '',
      };
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
