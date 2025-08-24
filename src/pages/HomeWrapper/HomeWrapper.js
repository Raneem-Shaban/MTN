// src/pages/Home/HomeWrapper.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import UserHome from '../Home/UserHome';
import HomePage from '../Home/HomePage';
import TrainerHome from '../Home/TrainerHome';

const HomeWrapper = () => {
  const role = useSelector((state) => state.auth.user.role_id);

  if (role === 1 || role === 2) return <HomePage/>;
  if (role === 3) return <TrainerHome/>;
  if (role === 4 || role === 5) return <UserHome/>;

  return <div>لا تملك صلاحية الوصول للصفحة</div>;
};

export default HomeWrapper;
