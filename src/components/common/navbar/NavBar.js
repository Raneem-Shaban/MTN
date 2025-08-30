import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { FaMoon, FaSun, FaUser, FaGlobe } from "react-icons/fa";
import { useLocation, Link, matchPath } from "react-router-dom";
import { darkTheme } from "../../../styles/dark";
import { lightTheme } from "../../../styles/light";

// تعيين theme فور تحميل الصفحة لتجنب flash
const savedTheme = localStorage.getItem("isDarkMode") === "true";
const initialTheme = savedTheme ? darkTheme : lightTheme;
Object.entries(initialTheme).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});

const NavBar = ({ onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Start with false initially
  const location = useLocation();
  const debounceTimeout = useRef(null);
  const hasInitialized = useRef(false);

  const currentPath = location.pathname;

  const excludedPaths = [
    "/",
    "/reports",
    "/profile",
    "/tasks",
    "/evaluations",
    "/trainers",
    "/categories",
  ];

  const dynamicPaths = [
    "/users/:userId",
    "/trainers/:id",
    "/sections/:id",
    "/details/:id",
  ];

  const showSearch =
    !excludedPaths.includes(currentPath) &&
    !dynamicPaths.some((path) => matchPath({ path, end: true }, currentPath));

  // تطبيق الـ theme عند تغيير isDarkMode
 useLayoutEffect(() => {
    // Only run after the first render to avoid flash
    if (!hasInitialized.current) {
      const savedTheme = localStorage.getItem("isDarkMode") === "true";
      setIsDarkMode(savedTheme);
      hasInitialized.current = true;
      return;
    }

    const theme = isDarkMode ? darkTheme : lightTheme;
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem("isDarkMode", isDarkMode);
  }, [isDarkMode]);

  // Detect scroll for header shadow animation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // تبديل الوضع بين Light/Dark
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      onSearch?.(value.trim());
    }, 500);
  };

  useEffect(
    () => () =>
      debounceTimeout.current && clearTimeout(debounceTimeout.current),
    []
  );

  const iconClasses =
    "text-[var(--color-text-main)] hover:text-[var(--color-secondary)] transition-transform transform hover:scale-110 cursor-pointer";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all bg-[var(--color-bg)] duration-300 shadow-xl ${
        scrolled
          ? "bg-[var(--color-bg)] shadow-2xl"
          : "bg-[var(--color-bg)]/90 backdrop-blur-sm"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-6 md:px-8 mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img
            src="/assets/img/mtn-logo.svg"
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-xl font-semibold text-[var(--color-text-main)] hidden sm:block">
            TrainTrack
          </span>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-6 relative">
            <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-secondary)] transition-all duration-300 hover:shadow-md">
              <FiSearch
                className="text-[var(--color-text-muted)] mr-2"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="bg-transparent outline-none w-full text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] transition-all duration-300 focus:w-full"
              />
            </div>
          </div>
        )}

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center space-x-6">
          {/* أيقونة تغيير المود */}
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

        {/* Mobile Menu */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {menuOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            >
              <div
                className="absolute top-16 right-4 bg-[var(--color-bg)] shadow-2xl rounded-xl p-5 space-y-4 w-56 animate-slide-fade"
                onClick={(e) => e.stopPropagation()}
              >
                {isDarkMode ? (
                  <FaSun onClick={toggleTheme} className={iconClasses} size={20} />
                ) : (
                  <FaMoon onClick={toggleTheme} className={iconClasses} size={20} />
                )}
                <Link to="/profile">
                  <FaUser className={iconClasses} size={20} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
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
