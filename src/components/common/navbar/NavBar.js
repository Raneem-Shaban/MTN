import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { FaMoon, FaUser, FaGlobe } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const NavBar = ({ onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const debounceTimeout = useRef(null);

  const currentPath = location.pathname;
  const showSearch = currentPath !== "/" && currentPath !== "/reports";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      onSearch?.(value.trim());
    }, 500);
  };

  useEffect(() => () => debounceTimeout.current && clearTimeout(debounceTimeout.current), []);

  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-10 bg-[var(--color-bg)] shadow-xl">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <img
          src="/assets/img/mtn-logo.svg"
          alt="Logo"
          className="w-12 h-12 object-contain"
        />
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary)] transition">
            <FiSearch className="text-[var(--color-text-accent)] mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={
                currentPath === "/tasks" ? "Search for task" :
                currentPath === "/sections" ? "Search for section" :
                currentPath === "/categories" ? "Search for category" :
                currentPath === "/users" ? "Search for user" :
                currentPath === "/trainers" ? "Search for trainer" :
                currentPath === "/inquiries" ? "Search for inquiry" :
                "Search..."
              }
              className="bg-transparent outline-none w-full text-[var(--color-text-main)] placeholder-[var(--color-text-accent)]"
            />
          </div>
        </div>
      )}

      {/* Icons */}
      <div className="hidden md:flex items-center space-x-6">
        {[FaMoon, FaUser, FaGlobe].map((Icon, idx) => (
          <Icon
            key={idx}
            className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
          />
        ))}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden relative">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {menuOpen && (
          <div className="absolute top-16 right-0 bg-[var(--color-white)] shadow-md rounded-lg p-4 space-y-3 w-48">
            {[FaMoon, FaUser, FaGlobe].map((Icon, idx) => (
              <Icon
                key={idx}
                className="text-[var(--color-dark-gray)] hover:text-[var(--color-primary)] cursor-pointer transition-colors"
              />
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
