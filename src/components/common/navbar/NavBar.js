import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FiSearch, FiMenu, FiX, FiBell } from "react-icons/fi";
import { FaMoon, FaSun, FaUser, FaGlobe } from "react-icons/fa";
import { useLocation, Link, matchPath, useNavigate } from "react-router-dom";
import { darkTheme } from "../../../styles/dark";
import { lightTheme } from "../../../styles/light";
import Notifications from "../notifications/Notifications"; // عدل المسار إذا لزم

// تعيين theme عند أول تحميل
const savedTheme = localStorage.getItem("isDarkMode") === "true";
const initialTheme = savedTheme ? darkTheme : lightTheme;
Object.entries(initialTheme).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});

const NavBar = ({ onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  const hasInitialized = useRef(false);

  const currentPath = location.pathname;

  const excludedPaths = ["/", "/reports", "/profile", "/tasks", "/evaluations", "/trainers", "/categories"];
  const dynamicPaths = ["/users/:userId", "/trainers/:id", "/sections/:id", "/details/:id"];

  const showSearch =
    !excludedPaths.includes(currentPath) &&
    !dynamicPaths.some((path) => matchPath({ path, end: true }, currentPath));

  // Theme toggle
  useLayoutEffect(() => {
    if (!hasInitialized.current) {
      const saved = localStorage.getItem("isDarkMode") === "true";
      setIsDarkMode(saved);
      hasInitialized.current = true;
      return;
    }
    const theme = isDarkMode ? darkTheme : lightTheme;
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem("isDarkMode", isDarkMode);
  }, [isDarkMode]);

  // scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // listen for notifications count
  useEffect(() => {
    const handler = (e) => {
      console.log("📩 NavBar: received notificationsCount =", e.detail);
      setUnreadCount(Number(e.detail) || 0);
    };
    window.addEventListener("notificationsCount", handler);
    return () => window.removeEventListener("notificationsCount", handler);
  }, []);

  // listen for openInquiry events
  useEffect(() => {
    const onOpen = (e) => {
      const inquiryId = e.detail;
      console.log("➡️ NavBar: navigate to inquiry", inquiryId);
      if (inquiryId) navigate(`/details/${inquiryId}`);
    };
    window.addEventListener("openInquiry", onOpen);
    return () => window.removeEventListener("openInquiry", onOpen);
  }, [navigate]);

  // theme toggle handler
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // search debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      console.log("🔍 NavBar: dispatch sectionSearch", value.trim());
      window.dispatchEvent(new CustomEvent("sectionSearch", { detail: value.trim() }));
      onSearch?.(value.trim());
    }, 500);
  };

  useEffect(() => {
    return () => debounceTimeout.current && clearTimeout(debounceTimeout.current);
  }, []);

  const iconClasses =
    "text-[var(--color-text-main)] hover:text-[var(--color-secondary)] transition-transform transform hover:scale-110 cursor-pointer";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-xl ${scrolled ? "bg-[var(--color-bg)] shadow-2xl" : "bg-[var(--color-bg)]/90 backdrop-blur-sm"
        }`}
    >
      <div className="h-16 flex items-center justify-between px-6 md:px-8 mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img src="/assets/img/mtn-logo.svg" alt="Logo" className="w-12 h-12 object-contain" />
          <span className="text-xl font-semibold text-[var(--color-text-main)] hidden sm:block">TrainTrack</span>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-6 relative">
            <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2 shadow-sm">
              <FiSearch className="text-[var(--color-text-muted)] mr-2" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="bg-transparent outline-none w-full text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]"
              />
            </div>
          </div>
        )}

        {/* Desktop icons */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Notifications with dropdown */}
          <div className="relative">
            <FiBell
              onClick={(e) => {
                e.stopPropagation(); // <-- مهم
                console.log("🔔 NavBar: clicked bell");
                window.dispatchEvent(new CustomEvent("toggleNotifications"));
              }}
              className={iconClasses}
              size={20}
            />

            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
            <Notifications />
          </div>

          {/* Theme */}
          {isDarkMode ? (
            <FaSun onClick={toggleTheme} className={iconClasses} size={20} />
          ) : (
            <FaMoon onClick={toggleTheme} className={iconClasses} size={20} />
          )}

          <FaGlobe className={iconClasses} size={20} />
          <Link to="/profile">
            <FaUser className={iconClasses} size={20} />
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden relative">
          <button onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          {menuOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setMenuOpen(false)}>
              <div
                className="absolute top-16 right-4 bg-[var(--color-bg)] shadow-2xl rounded-xl p-5 space-y-4 w-56 animate-slide-fade"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  {isDarkMode ? (
                    <FaSun onClick={toggleTheme} className={iconClasses} size={20} />
                  ) : (
                    <FaMoon onClick={toggleTheme} className={iconClasses} size={20} />
                  )}
                  <div className="relative">
                    <FiBell
                      onClick={() => {
                        console.log("🔔 NavBar: clicked bell (mobile)");
                        window.dispatchEvent(new CustomEvent("toggleNotifications"));
                        setMenuOpen(false);
                      }}
                      className={iconClasses}
                      size={20}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <Link to="/profile">
                  <FaUser className={iconClasses} size={20} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideFade {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-fade {
          animation: slideFade 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default NavBar;
