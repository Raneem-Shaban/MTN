import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../components/common/navbar/NavBar';
import Sidebar from '..//components/common/sidebar/Sidebar';
import Login from '../pages/Auth/Login';
import AppRoutes from '../routes/AppRoutes';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import VerifyCode from '../pages/Auth/VerifyCode';
import ResetPassword from '../pages/Auth/ResetPassword';
import UserLandingPage from '../pages/Landing/UserLandingPage';
import ProtectedRoute from '../routes/ProtectedRoute';


const Layout = () => {
    const location = useLocation();
    const hideLayoutRoutes = ['/login', '/forgot-password','/verify-code','/reset-password','/landing'];

    const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

    return (
        <div className="flex flex-col h-screen bg-[var(--color-surface)]">
            {!shouldHideLayout && <Navbar onSearch={(query) => {
                const event = new CustomEvent("sectionSearch", { detail: query });
                window.dispatchEvent(event);
            }} />}
            <div className="flex flex-1 overflow-hidden">
                {!shouldHideLayout && <Sidebar />}
                <main className={`flex-1 overflow-auto ${shouldHideLayout ? '' : 'p-6'}`}>
                    <Routes>
                        <Route path="/landing" element={<UserLandingPage/>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/verify-code" element={<VerifyCode />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <AppRoutes />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default Layout;
