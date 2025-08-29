import React from "react";

const InfoCard = ({ icon, label, value, lightTheme }) => (
  <div
    className="flex items-center gap-3 p-4 rounded-xl shadow-sm hover:shadow-md transition"
    style={{ background: lightTheme["--color-surface"] }}
  >
    <span style={{ color: lightTheme["--color-primary"] }}>{icon}</span>
    <div>
      <p className="text-sm" style={{ color: lightTheme["--color-text-muted"] }}>
        {label}
      </p>
      <p className="font-medium" style={{ color: lightTheme["--color-text-main"] }}>
        {value}
      </p>
    </div>
  </div>
);

export default InfoCard;
