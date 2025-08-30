import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Reports from '../Reports/Reports';
import TrainerReports from '../TrainerReports/TrainerReports';

const ReportsWrapper = () => {
  const role = useSelector((state) => state.auth.user.role_id);

  if (role === 3) return <TrainerReports />;
  if (role === 1 || role === 2) return <Reports />;
  return <Navigate to="/landing" replace />;
};

export default ReportsWrapper;
