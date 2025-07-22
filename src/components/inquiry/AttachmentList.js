import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

const AttachmentList = ({ attachments = [] }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="bg-[var(--color-bg)] rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {attachments.map((att, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-white)] shadow-sm cursor-pointer hover:bg-[var(--color-light-gray)] border border-gray-300"
          onClick={() => window.open(att.url, '_blank')}
        >
          <FaFileAlt className="text-[var(--color-secondary)]" />
          <span className="text-sm text-[var(--color-text-main)] truncate">{att.name}</span>
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
