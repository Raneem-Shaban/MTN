import React from 'react';
import { useSelector } from 'react-redux';
import Reports from '../Reports/Reports';
import TrainerReports from '../TrainerReports/TrainerReports';

const ReportsWrapper = () => {
  const role = useSelector((state) => state.auth.user.role_id);

  if (role === 3) return <TrainerReports/>;
  if (role === 1 || role === 2) return <Reports/>;
  return <div>لا تملك صلاحية الوصول للتقارير</div>;
};

export default ReportsWrapper;
