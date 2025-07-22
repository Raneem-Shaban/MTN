// src/components/ui/Button.jsx
import React from 'react';

const Button = ({ children, variant = 'primary', onClick }) => {
  const base =
    'px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 shadow-md';

  const variants = {
    primary: `${base} bg-[var(--color-primary)] text-[var(--color-text-main)] hover:bg-[var(--color-primary-hover)]`,
    secondary: `${base} border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] hover:text-[var(--color-white)]`,
  };

  return (
    <button onClick={onClick} className={variants[variant]}>
      {children}
    </button>
  );
};

export default Button;
