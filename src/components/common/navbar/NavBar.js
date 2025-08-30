import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { FaMoon, FaUser, FaGlobe } from "react-icons/fa";
import { useLocation, Link,matchPath } from "react-router-dom";


const NavBar = ({ onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const debounceTimeout = useRef(null);

  const currentPath = location.pathname;

  const excludedPaths = [
  "/",
  "/reports",
  "/profile",
  "/tasks",
  "/evaluations",
  "/profile",
  "/trainers",
  "/categories",
];

const dynamicPaths = [
  "/users/:userId",
  "/trainers/:id",
  "/sections/:id",
  "/details/:id"
];


const showSearch =
  !excludedPaths.includes(currentPath) &&
  !dynamicPaths.some((path) => matchPath({ path, end: true }, currentPath));

  // Detect scroll for header shadow animation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      onSearch?.(value.trim());
    }, 500);
  };

  useEffect(
    () => () => debounceTimeout.current && clearTimeout(debounceTimeout.current),
    []
  );

  const iconClasses =
    "text-gray-600 hover:text-blue-600 transition-transform transform hover:scale-110 cursor-pointer";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-xl ${
        scrolled ? "bg-white shadow-2xl" : "bg-white/90 backdrop-blur-sm"
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
          <span className="text-xl font-semibold text-gray-800 hidden sm:block">
            TrainTrack
          </span>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-6 relative">
            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-300 hover:shadow-md">
              <FiSearch className="text-gray-400 mr-2" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={
                  currentPath === "/sections"
                    ? "Search for section"
                    : currentPath === "/categories"
                    ? "Search for category"
                    : currentPath === "/users"
                    ? "Search for user"
                    : currentPath === "/trainers"
                    ? "Search for trainer"
                    : currentPath === "/inquiries"
                    ? "Search for inquiry"
                    : "Search..."
                }
                className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400 transition-all duration-300 focus:w-full"
              />
            </div>
          </div>
        )}

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center space-x-6">
          <FaMoon className={iconClasses} size={20} />
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
                className="absolute top-16 right-4 bg-white shadow-2xl rounded-xl p-5 space-y-4 w-56 animate-slide-fade"
                onClick={(e) => e.stopPropagation()}
              >
                <FaMoon className={iconClasses} size={20} />
                <FaGlobe className={iconClasses} size={20} />
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
