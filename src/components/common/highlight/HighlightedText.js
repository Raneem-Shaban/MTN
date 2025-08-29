import React from "react";

const HighlightedText = ({ text, query }) => {
  if (!query) return <>{text}</>;

  // regex للبحث عن الكلمة (case-insensitive)
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text?.toString().split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            style={{
              backgroundColor: "yellow",
              padding: "0 2px",
              borderRadius: "3px",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default HighlightedText;
