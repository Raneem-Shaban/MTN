import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import UserHome from '../Home/UserHome';
import HomePage from '../Home/HomePage';
import TrainerHome from '../Home/TrainerHome';
import AssistantPage from '../Home/AssistantPage';

const HomeWrapper = () => {
  const role = useSelector((state) => state.auth.user?.role_id);

  if (!role) return <Navigate to="/login" replace />;

  if (role === 1 || role === 2) return <HomePage/>;
  if (role === 3) return <TrainerHome/>;
  if (role === 5) return <UserHome/>;
  if (role === 4) return <AssistantPage/>;

  return <Navigate to="/login" replace />; 
};

export default HomeWrapper;
