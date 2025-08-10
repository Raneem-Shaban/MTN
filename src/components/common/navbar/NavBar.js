import React, { useState,useEffect,useRef  } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { FaMoon, FaUser, FaGlobe } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const NavBar = ({ onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const debounceTimeout = useRef(null);

  const currentPath = location.pathname;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      onSearch?.(value.trim());
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

const showSearch = currentPath !== "/" && currentPath !== "/reports";

  return (
    <header className="h-16 flex items-center justify-between px-7 py-1 bg-[var(--color-bg)] shadow-md w-full">
      {/* Logo */}
      <div className="flex items-center space-x-6">
        <img
          src="/assets/img/mtn-logo.svg"
          alt="Logo"
          className="w-12 h-14 object-contain"
        />
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center bg-[#f5f7fa] rounded-full px-4 py-2">
            <FiSearch className="text-[#5f6e94] mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={
                currentPath === "/tasks"
                  ? "Search for task"
                  : currentPath === "/sections"
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
              className="bg-transparent outline-none w-full text-sm text-[#5f6e94]"
            />
          </div>
        </div>
      )}

      {/* Icons */}
      <div className="hidden md:flex items-center space-x-6">
        <FaMoon className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer" />
        <FaUser className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer" />
        <FaGlobe className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer" />
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {menuOpen && (
          <div className="absolute top-16 right-7 bg-white shadow-md rounded-md p-4 space-y-4">
            <FaMoon className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer" />
            <FaUser className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer" />
            <FaGlobe className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer" />
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
