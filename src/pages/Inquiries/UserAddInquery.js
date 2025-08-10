import React, { useState } from 'react';
import { FiSearch, FiPaperclip, FiX } from 'react-icons/fi';

const categories = ['General', 'Technical', 'Offers', 'Billing'];

const UserAddInquiry = () => {
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log({
      body,
      category,
      attachments,
    });
  };

  return (
    <div className="px-6 md:px-10">
      <div className="max-w-2xl space-y-6">

        <div className="flex items-center gap-3 rtl:flex-row-reverse">
          <FiSearch className="text-[32px] text-[var(--color-text-primary)]" />
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">
            Create New Inquiry
          </h1>
        </div>

        <textarea
          className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-4 focus:outline-none focus:ring focus:border-blue-300 text-[15px] leading-relaxed resize-none"
          placeholder="Write your inquiry here..."
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Category</label>
          <select
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 focus:outline-none focus:ring focus:border-blue-300"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Attachments</label>
          <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--color-secondary)]">
            <FiPaperclip className="text-lg" />
            <span>Add Attachments</span>
            <input
              type="file"
              multiple
              onChange={handleAttachmentChange}
              className="hidden"
            />
          </label>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                >
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="ml-2 text-gray-500 hover:text-[var(--color-danger)]"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={handleSubmit}
            disabled={!body || !category}
            className="bg-[var(--color-primary)] text-white rounded-xl px-5 py-3 hover:bg-[var(--color-primary)] transition disabled:opacity-50"
          >
            Submit Inquiry
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserAddInquiry;
