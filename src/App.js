import React from 'react';
import { useEffect } from 'react';
import { lightTheme } from './styles/light';
import { darkTheme } from './styles/dark';
import { applyTheme } from './styles/GlobalStyle'
import Navbar from './components/common/navbar/NavBar';
import ThemeToggle from './components/common/themeToggle';
import Login from './pages/Auth/Login';
import Sidebar from './components/common/sidebar/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inquiries from './pages/Inquiries/Inquiries';
import Reports from './pages/Reports/Reports';
import Users from './pages/Users/Users';
import HomePage from './pages/Home/HomePage';
import AppRoutes from './routes/AppRoutes';
import Layout from './layouts/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserLandingPage from './pages/Landing/UserLandingPage';

function App() {
  useEffect(() => {
    applyTheme(lightTheme); // أو darkTheme حسب الحاجة
  }, []);

  return (
    // <div className='bg-[var(--color-surface)]'>
    //   <div className="bg-bg text-textMain min-h-screen p-8">
    //     <h1 className="text-3xl font-bold">مرحبا بك</h1>
    //     <h1 className="text-4xl font-bold">مثال على التبديل بين الثيمات</h1>
    //     <p className="text-textMuted">يمكنك التبديل بين الوضع الفاتح والغامق أدناه.</p>
    //     <ThemeToggle />
    //   </div>
    // {/* </div> */}
    <>
      <Router>
        <Layout />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>

  );
}

export default App;
