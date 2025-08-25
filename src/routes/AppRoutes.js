import { Routes, Route, Navigate } from 'react-router-dom';
import routes from './routeConfig';
import { useSelector } from 'react-redux';

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <Routes>
      {routes.map((route, idx) => {
        const { path, element, roles } = route;

        const isAllowed = isAuthenticated && roles.includes(user?.role_id);

        return (
          <Route
            key={idx}
            path={path}
            element={isAllowed ? element : <Navigate to="/login" replace />}
          />
        );
      })}

      <Route path="*" element={<div>الصفحة غير موجودة</div>} />
    </Routes>
  );
};

export default AppRoutes;
