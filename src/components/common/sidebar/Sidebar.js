import React, { useMemo, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import axios from '../../../utils/axiosConfig';
import { API_BASE_URL } from '../../../constants/constants';
import { toast } from 'react-toastify';
import {
  FaHome, FaUsers, FaChartBar, FaQuestionCircle, FaChalkboardTeacher,
  FaListAlt, FaFolderOpen, FaClipboardCheck, FaTasks, FaStar, FaSignOutAlt
} from 'react-icons/fa';

const allNavItems = [
  { label: 'Home', icon: <FaHome />, path: '/', roles: [1, 2, 3, 4, 5] },
  { label: 'Inquiries', icon: <FaQuestionCircle />, path: '/inquiries', roles: [1, 2, 3, 4] },
  { label: 'Users', icon: <FaUsers />, path: '/users', roles: [1, 2] },
  { label: 'Reports', icon: <FaChartBar />, path: '/reports', roles: [1, 2, 3] },
  { label: 'Trainers', icon: <FaChalkboardTeacher />, path: '/trainers', roles: [1, 2] },
  { label: 'Sections', icon: <FaListAlt />, path: '/sections', roles: [1, 2] },
  { label: 'Categories', icon: <FaFolderOpen />, path: '/categories', roles: [1, 2] },
  { label: 'Evaluations', icon: <FaClipboardCheck />, path: '/evaluations', roles: [1, 2] },
  { label: 'Tasks', icon: <FaTasks />, path: '/tasks', roles: [1, 2] },
  { label: 'Favorite', icon: <FaStar />, path: '/favorite', roles: [5] },
  { label: 'My Inquiries', icon: <FaStar />, path: '/myInquiries', roles: [5] },
  { label: 'Logout', icon: <FaSignOutAlt />, path: '/#', roles: [1, 2, 3, 4, 5], isLogout: true },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, role_id: roleId } = useSelector(state => state.auth.user || {});

  const filteredNavItems = useMemo(() => allNavItems.filter(item => item.roles.includes(roleId)), [roleId]);

  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, {}, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      dispatch(logout());
      localStorage.removeItem('token');
      toast.success("Logout successful");
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  }, [dispatch, navigate, token]);

  return (
<div className="h-full bg-[var(--color-bg)] border-r border-[var(--color-border)] w-16 sm:w-64 py-10 shadow-xl transition-all relative z-50 mt-[64px]">
      <nav className="space-y-2">
        {filteredNavItems.map((item, idx) =>
          item.isLogout ? (
            <button
              key={idx}
              onClick={handleLogout}
              className="flex items-center gap-3 text-[var(--color-text-muted)] font-medium transition-all duration-200 pl-3 sm:pl-6 pr-3 sm:pr-4 py-2 w-full border-l-4 border-transparent hover:text-[var(--color-dark-gray)] hover:bg-[var(--color-light-gray)] rounded-md"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 text-[var(--color-text-muted)] font-medium transition-all duration-200 pl-3 sm:pl-6 pr-3 sm:pr-4 py-2 w-full border-l-4 ${
                  isActive
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-status-pending-bg)] rounded-md'
                    : 'border-transparent hover:text-[var(--color-dark-gray)] hover:bg-[var(--color-light-gray)] rounded-md'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
