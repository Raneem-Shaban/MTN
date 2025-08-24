import React, { useState } from "react";
import { FiSearch, FiPaperclip, FiX } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import CategoryDropdown from "../../components/common/dropdown/CategoryDropdown";
import { API_BASE_URL } from "../../constants/constants";

const UserAddInquiry = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !body || !category) {
      toast.error("Please fill all required fields (Category, Title, Body).");
      return;
    }

    console.log("Submitting Inquiry:", { title, body, category, attachments });

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("category_id", category);
    formData.append("title", title);
    formData.append("body", body);
    attachments.forEach((file) => formData.append("attachments[]", file));

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/inquiries`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      console.log("API Response:", res.data);
      toast.success(res.data.message || "Inquiry submitted successfully!");

      // Reset form
      setTitle("");
      setBody("");
      setCategory("");
      setAttachments([]);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong while submitting inquiry.");
    } finally {
      setLoading(false);
    }
  };

  // زر Submit يكون disabled إذا أي حقل إلزامي فارغ
  const isSubmitDisabled = !title || !body || !category || loading;

  return (
    <div className="px-6 md:px-10">
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 rtl:flex-row-reverse">
          <FiSearch className="text-[32px] text-[var(--color-text-primary)]" />
          <h1 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">
            Create New Inquiry
          </h1>
        </div>

        {/* Category Selector */}
        <div className="flex flex-col space-y-3">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Category <span className="text-red-500">*</span>
          </label>
          <CategoryDropdown value={category} onChange={setCategory} />
        </div>

        {/* Title Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter a concise title..."
            className="w-full bg-white border border-gray-200 rounded-xl shadow-md p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[15px]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Inquiry Body */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Inquiry <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full bg-white border border-gray-200 rounded-xl shadow-md p-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[15px] leading-relaxed resize-none"
            placeholder="Write your inquiry here..."
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {/* Attachments */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Attachments (Optional)
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition">
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

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full bg-[var(--color-primary)] text-white rounded-xl px-5 py-3 hover:opacity-90 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAddInquiry;
