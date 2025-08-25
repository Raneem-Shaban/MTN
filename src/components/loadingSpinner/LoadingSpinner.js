import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="relative w-12 h-12 animate-spin">
        <div
          className="absolute w-12 h-12 border-2 rounded-full border-t-[var(--color-primary)] border-r-transparent border-b-transparent border-l-transparent"
        ></div>

        <div
          className="absolute w-12 h-12 border-2 rounded-full border-r-[var(--color-secondary)] border-t-transparent border-b-transparent border-l-transparent"
        ></div>

        <div
          className="absolute w-12 h-12 border-2 rounded-full border-b-[var(--color-danger)] border-t-transparent border-r-transparent border-l-transparent"
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
