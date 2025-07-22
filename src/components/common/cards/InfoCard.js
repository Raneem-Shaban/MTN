// src/components/common/cards/InfoCard.js
import React from 'react';

const InfoCard = ({ icon, title, description, linkText, linkHref, color = 'var(--color-primary)' }) => {
  const showLink = linkText && linkHref;

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md w-64 min-h-[18rem] flex flex-col items-center text-center gap-4 transition hover:shadow-lg">
      <div
        className="w-16 h-16 flex items-center justify-center rounded-full text-[var(--color-white)] text-xl"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm font-medium text-[var(--color-text-muted)]">{description}</p>

      {showLink && (
        <a href={linkHref} className="text-[var(--color-secondary)] font-semibold mt-auto hover:underline">
          {linkText} →
        </a>
      )}
    </div>
  );
};

export default InfoCard;
