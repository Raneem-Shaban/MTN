import React, { useEffect, useState } from 'react';

function StatCard({ title, count, icon: Icon, iconColorVar }) {
  const [iconBgColor, setIconBgColor] = useState('rgba(0,0,0,0.05)');
  const iconColor = `var(${iconColorVar || '--color-primary'})`;

  useEffect(() => {
    if (!iconColorVar) return;
    const hex = getComputedStyle(document.documentElement).getPropertyValue(iconColorVar)?.trim();
    if (hex?.startsWith('#')) {
      const rgb = hexToRgb(hex);
      if (rgb) setIconBgColor(`rgba(${rgb}, 0.15)`);
    }
  }, [iconColorVar]);

  return (
    <div className="bg-[var(--color-bg)] rounded-xl shadow-sm p-3 flex items-center gap-3 w-full transition transform hover:-translate-y-1 hover:shadow-md">
      <div
        className="rounded-full p-2 flex items-center justify-center"
        style={{
          backgroundColor: iconBgColor,
          color: iconColor,
        }}
      >
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <p className="text-xs text-[var(--color-text-accent)] font-medium">{title}</p>
        <h2 className="text-lg font-semibold text-[var(--color-text-main)]">
          {typeof count === "number" ? count.toLocaleString() : (count ?? "—")}
        </h2>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return null;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default StatCard;
