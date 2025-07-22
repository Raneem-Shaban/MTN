import React from 'react';

const Select = ({ label, value, onChange, options = [], error }) => {
  return (
    <div className="w-full relative">
      <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 pr-10 rounded-lg border outline-none transition
          bg-[var(--color-white)]
          border-[var(--color-border)]
          text-sm
          appearance-none
          focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
          ${error ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)]' : ''}
        `}
      >
        <option value="">Select {label}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>
      )}
    </div>
  );
};

export default Select;
