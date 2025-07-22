import React from 'react';

const Input = ({ label, type = 'text', value, onChange, error }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-lg border outline-none transition
          bg-[var(--color-white)]
          border-[var(--color-border)]
          focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
          text-sm
          ${
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)]'
              : ''
          }`}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
