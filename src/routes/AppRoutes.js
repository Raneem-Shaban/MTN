import { Routes, Route } from 'react-router-dom';
import routes from './routeConfig';
import ProtectedRoute from './ProtectedRoute';
import { useSelector } from 'react-redux';
import UserLandingPage from '../pages/Landing/UserLandingPage';

const AppRoutes = () => {
  const userRole = useSelector((state) => state.auth.user?.role_id); // افترضنا إنه موجود بالـ Redux

  return (
    <Routes>
      
      {routes.map((route, idx) => (
        <Route
          key={idx}
          path={route.path}
          element={
            <ProtectedRoute allowedRoles={route.roles} userRole={userRole}>
              {route.element}
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="/unauthorized" element={<div>لا تملك صلاحية</div>} />
      <Route path="*" element={<div>الصفحة غير موجودة</div>} />
    </Routes>
  );
};

export default AppRoutes;

