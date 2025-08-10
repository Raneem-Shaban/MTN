import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({
  onClick,
  label = 'Add',
  icon: Icon = Plus,
  title = 'Add',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className="fixed bottom-2 right-6 z-50 flex flex-col items-end space-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
    >
      {isHovered && (
        <div
          className="px-3 py-1 rounded-md text-sm shadow-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-text-main)',
            color: 'var(--color-white)',
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
      )}

      <button
        title={title}
        onClick={onClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className="w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 ease-in-out shadow-xl"
        style={{
          backgroundColor: isPressed
            ? 'var(--color-primary-hover)'
            : isHovered
            ? 'var(--color-primary-hover)'
            : 'var(--color-primary)',
          color: 'var(--color-white)',
          transform: isPressed ? 'scale(0.92)' : 'scale(1)',
          boxShadow:
            '0 8px 15px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(0, 0, 0, 0.1)',
          margin: '0.5rem',
        }}
      >
        <Icon size={24} />
      </button>
    </div>
  );
};

export default FloatingActionButton;
