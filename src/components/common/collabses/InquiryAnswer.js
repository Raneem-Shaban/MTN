import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, UserCheck, Tag, Info, List } from 'lucide-react';
import { StatusBadge } from '../badges/StatusBadge';
import { lightTheme } from '../../../styles/light';
import { FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt } from "react-icons/fa";


const ticketStatusColors = {
  Open: { bg: lightTheme['--color-status-open-bg'], text: lightTheme['--color-status-open'] },
  Closed: { bg: lightTheme['--color-status-closed-bg'], text: lightTheme['--color-status-closed'] },
  Pending: { bg: lightTheme['--color-status-pending-bg'], text: lightTheme['--color-status-pending'] },
};

const infoBadgeColors = {
  user: { bg: lightTheme['--color-trainer-task'], text: lightTheme['--color-text-main'], icon: <User size={14} /> },
  assignee: { bg: lightTheme['--color-category-one'], text: lightTheme['--color-white'], icon: <UserCheck size={14} /> },
  category: { bg: lightTheme['--color-category-two'], text: lightTheme['--color-text-main'], icon: <Tag size={14} /> },
  statusName: { bg: lightTheme['--color-category-three'], text: lightTheme['--color-text-main'], icon: <Info size={14} /> },
};

const InquiryAnswer = ({
  question,
  answer,
  status,
  response,
  createdAt,
  closedAt,
  userName,
  assigneeName,
  categoryName,
  statusName,
  followUps = [],
  attachments = []
}) => {
  const [expanded, setExpanded] = useState(false);

  const renderBadge = (label, value, colorType) => (
    <span
      style={{ backgroundColor: infoBadgeColors[colorType].bg, color: infoBadgeColors[colorType].text }}
      className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
    >
      {infoBadgeColors[colorType].icon}
      <strong>{label}:</strong> {value || "N/A"}
    </span>
  );

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Header */}
      <div
        className={`flex justify-between items-center p-6 cursor-pointer select-none transition-colors duration-300 ${expanded ? 'bg-indigo-50' : 'bg-white'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{question}</h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{answer}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge value={status} colorMap={ticketStatusColors} />
          {expanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </div>
      </div>

      {/* Body / Response */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[1000px] opacity-100 p-6' : 'max-h-0 opacity-0 p-0'} bg-gray-50 border-t border-gray-200 text-gray-700 rounded-b-3xl`}
      >
        {/* Response */}
        <div className="mb-4">
          <strong className="text-gray-800">Response:</strong>
          <p className="mt-2">{response || "No answer yet"}</p>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {renderBadge("User", userName, "user")}
          {renderBadge("Assignee", assigneeName, "assignee")}
          {renderBadge("Category", categoryName, "category")}
          {renderBadge("Status", statusName, "statusName")}
        </div>

        {/* FollowUps Cards */}
{followUps.length > 0 && (
  <div className="mt-4 border-t pt-4">
    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
      <List size={16} /> Follow Ups ({followUps.length})
    </h3>
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {followUps.map((fup) => (
        <div
          key={fup.id}
          className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 hover:shadow transition text-xs"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-gray-600">#{fup.id}</span>
            <StatusBadge value={fup.status} colorMap={ticketStatusColors} />
          </div>
          <p className="text-gray-700">
            <strong>Section:</strong> {fup.section?.name || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong>Follower:</strong> {fup.follower?.name || "N/A"}
          </p>
          <p className="text-gray-700 mt-1 line-clamp-2">
            <strong>Response:</strong> {fup.response ?? "—"}
          </p>
        </div>
      ))}
    </div>
  </div>
)}


        {/* Attachments Section */}
        {attachments.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <FaPaperclip className="text-gray-600" /> Attachments ({attachments.length})
            </h3>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((file, idx) => {
                // تحديد الأيقونة حسب الامتداد
                const ext = file.name?.split(".").pop()?.toLowerCase();
                let Icon = FaFileAlt; // default
                if (["jpg", "jpeg", "png", "gif"].includes(ext)) Icon = FaFileImage;
                if (["pdf"].includes(ext)) Icon = FaFilePdf;
                if (["doc", "docx"].includes(ext)) Icon = FaFileWord;
                if (["xls", "xlsx"].includes(ext)) Icon = FaFileExcel;

                return (
                  <a
                    key={idx}
                    href={file.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover:shadow-md transition text-sm"
                  >
                    <Icon className="text-indigo-600 text-2xl" />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 truncate w-40">
                        {file.name || `Attachment ${idx + 1}`}
                      </span>
                      <span className="text-xs text-blue-600 hover:underline">
                        View / Download
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}



        {/* Footer Dates */}
        <div className="flex flex-wrap justify-between mt-4 text-xs text-gray-500 gap-2">
          <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
          {closedAt && <span>Closed: {new Date(closedAt).toLocaleDateString()}</span>}
          <span className="font-semibold">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default InquiryAnswer;
