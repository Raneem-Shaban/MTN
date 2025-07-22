import React from 'react';

const ReopenInquiryButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white px-4 py-2 rounded-full mt-4 w-full sm:w-auto"
    >
      Reopen This Inquiry
    </button>
  );
};

export default ReopenInquiryButton;
