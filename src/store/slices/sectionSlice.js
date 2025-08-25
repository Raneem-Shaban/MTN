import { createSlice } from '@reduxjs/toolkit';

const sectionSlice = createSlice({
  name: 'sections',
  initialState: [],
  reducers: {
    setSections: (state, action) => action.payload,
    addSection: (state, action) => {
      state.unshift(action.payload);
    },
    removeSection: (state, action) => {
      return state.filter(section => section.id !== action.payload);
    },
    removeSection: (state, action) => {
  state.splice(
    state.findIndex((section) => section.id === action.payload),
    1
  );
},
  }
});

export const { setSections, addSection, removeSection } = sectionSlice.actions;
export default sectionSlice.reducer;
