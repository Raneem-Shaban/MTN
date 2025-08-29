import React from "react";

const InputField = ({ label, lightTheme, ...props }) => (
  <div>
    <label
      className="block text-sm font-medium"
      style={{ color: lightTheme["--color-text-main"] }}
    >
      {label}
    </label>
    <input
      {...props}
      className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2"
      style={{
        borderColor: lightTheme["--color-border"],
        background: lightTheme["--color-surface"],
        color: lightTheme["--color-text-main"],
      }}
    />
  </div>
);

export default InputField;
