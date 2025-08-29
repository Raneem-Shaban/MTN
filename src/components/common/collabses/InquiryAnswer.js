import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, User, UserCheck, Tag, Info, List } from 'lucide-react';
import { StatusBadge } from '../badges/StatusBadge';
import { lightTheme } from '../../../styles/light';
import { FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt, FaStar } from "react-icons/fa";
import { API_BASE_URL } from "../../../constants/constants";
import axios from 'axios';
import { toast } from 'react-toastify';


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
  inquiryId,
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
  attachments = [],
  ratings = []
}) => {
  const [expanded, setExpanded] = useState(false);
  const [newScore, setNewScore] = useState(0);
  const [newFeedback, setNewFeedback] = useState("");
  const [loadingRate, setLoadingRate] = useState(false);
  const [allRatings, setAllRatings] = useState(ratings);
  

  const averageScore = useMemo(() => {
    if (allRatings.length === 0) return 0;
    const total = allRatings.reduce((sum, r) => sum + r.score, 0);
    return total / allRatings.length;
  }, [allRatings]);

  // داخل المكون InquiryAnswer
  const handleSubmitRating = async () => {
    if (!inquiryId) {
      toast.error("Inquiry ID is missing. Cannot submit rating.");
      return;
    }
    if (newScore === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    setLoadingRate(true);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId"); // احصل على ID المستخدم الحالي
      const userName = localStorage.getItem("userName" || `User #${userId}`); // اسم المستخدم الحالي

      const response = await axios.post(
        `${API_BASE_URL}/api/ratings`,
        {
          inquiry_id: inquiryId,
          score: newScore,
          feedback_text: newFeedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // إنشاء نسخة كاملة من التقييم الجديد لتظهر مباشرة
      const newRating = {
        id: response.data.id || Math.random(), // id مؤقت إذا لم يأتِ من السيرفر
        user_id: userId,
        user: { name: userName },
        score: newScore,
        feedback_text: newFeedback,
        created_at: new Date().toISOString(),
      };

      setAllRatings(prev => [...prev, newRating]); // إضافة التقييم للقائمة مباشرة
      toast.success("Rating submitted successfully!");
      setNewScore(0);
      setNewFeedback("");
    } catch (error) {
      const serverMessage = error.response?.data?.message || "Failed to submit rating";
      toast.error(serverMessage);
      console.error("Full error object:", error);
    } finally {
      setLoadingRate(false);
    }
  };

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
    <div className="bg-[var(--color-bg)] rounded-3xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Header */}
      <div
        className={`flex justify-between items-center p-6 cursor-pointer select-none transition-colors duration-300 ${expanded ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-bg)]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-semibold text-[var(--color-text-main)] text-lg">{question}</h3>
          <p className="text-[var(--color-text-accent)] text-sm mt-1 line-clamp-2">{answer}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge value={status} colorMap={ticketStatusColors} />
          {expanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </div>
      </div>

      {/* Body / Response */}
      <div className={`transition-all duration-500 ease-in-out ${expanded ? 'opacity-100 p-6' : 'max-h-0 opacity-0 p-0'} overflow-hidden bg-[var(--color-surface)] border-t border-[var(--color-border)] text-[var(--color-text-main)] rounded-b-3xl`}>

        {/* Response */}
        <div className="mb-4">
          <strong className="text-[var(--color-text-main)]">Response:</strong>
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
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <h3 className="font-semibold text-[var(--color-text-main)] flex items-center gap-2 mb-3">
              <List size={16} /> Follow Ups ({followUps.length})
            </h3>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {followUps.map((fup) => (
                <div key={fup.id} className="bg-[var(--color-bg)] rounded-xl shadow-sm p-3 border border-[var(--color-border)] hover:shadow transition text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[var(--color-dark-gray)]">#{fup.id}</span>
                    <StatusBadge value={fup.status} colorMap={ticketStatusColors} />
                  </div>
                  <p className="text-[var(--color-text-main)]"><strong>Section:</strong> {fup.section?.name || "N/A"}</p>
                  <p className="text-[var(--color-text-main)]"><strong>Follower:</strong> {fup.follower?.name || "N/A"}</p>
                  <p className="text-[var(--color-text-main)] mt-1 line-clamp-2"><strong>Response:</strong> {fup.response ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Section */}
        {attachments.length > 0 && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <h3 className="font-semibold text-[var(--color-text-main)] flex items-center gap-2 mb-3">
              <FaPaperclip className="text-[var(--color-text-accent)]" /> Attachments ({attachments.length})
            </h3>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((file, idx) => {
                const ext = file.name?.split(".").pop()?.toLowerCase();
                let Icon = FaFileAlt;
                if (["jpg", "jpeg", "png", "gif"].includes(ext)) Icon = FaFileImage;
                if (["pdf"].includes(ext)) Icon = FaFilePdf;
                if (["doc", "docx"].includes(ext)) Icon = FaFileWord;
                if (["xls", "xlsx"].includes(ext)) Icon = FaFileExcel;
                return (
                  <a key={idx} href={file.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] shadow-sm p-3 hover:shadow-md transition text-sm">
                    <Icon className="text-[var(--color-secondary)] text-2xl" />
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--color-text-main)] truncate w-40">{file.name || `Attachment ${idx + 1}`}</span>
                      <span className="text-xs text-[var(--color-secondary)] hover:underline">View / Download</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Ratings Section */}
        <div className="mt-6 border-t border-[var(--color-border)] pt-6">
          <h3 className="font-semibold text-[var(--color-text-main)] text-lg mb-4 flex items-center gap-2">Ratings ({allRatings.length})</h3>

          {/* Average Score */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={`text-2xl ${i < averageScore ? "text-[var(--color-primary)]" : "text-[var(--color-border)]"}`} />
              ))}
            </div>
            <span className="text-[var(--color-text-main)] font-medium">{averageScore.toFixed(1)} / 5</span>
          </div>

          {/* Ratings Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {allRatings.map((rate) => (
              <div key={rate.id} className="bg-[var(--color-bg)] rounded-2xl shadow-md p-4 border border-[var(--color-border)] hover:shadow-lg transition flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-secondary)] font-bold">
                    {rate.user_id?.toString().charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`text-sm ${i < rate.score ? "text-[var(--color-primary)]" : "text-[var(--color-border)]"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {rate.user?.name || `User #${rate.user_id || "You"}`} • {new Date(rate.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-[var(--color-text-main)] text-sm bg-[var(--color-surface)] rounded-xl p-3 italic flex-1">
                  “{rate.feedback_text || "No feedback provided"}”
                </p>
              </div>
            ))}
          </div>

          {/* Add Rating */}
          <div className="mt-6 border-t border-[var(--color-border)] pt-6">
            <h3 className="font-semibold text-[var(--color-text-main)] text-lg mb-4">Add Your Rating</h3>

            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-2xl cursor-pointer ${i < newScore ? "text-[var(--color-primary)]" : "text-[var(--color-border)]"}`}
                  onClick={() => setNewScore(i + 1)}
                />
              ))}
              <span className="text-sm text-[var(--color-text-muted)]">{newScore} / 5</span>
            </div>

            <textarea
              className="w-full border border-[var(--color-border)] rounded-lg p-2 mb-2 text-[var(--color-text-main)]"
              placeholder="Write your feedback..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
            />

            <button
              className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition"
              disabled={loadingRate || newScore === 0}
              onClick={handleSubmitRating} // هنا ربطنا الدالة
            >
              {loadingRate ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </div>

        {/* Footer Dates */}
        <div className="flex flex-wrap justify-between mt-4 text-xs text-[var(--color-text-muted)] gap-2">
          <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
          {closedAt && <span>Closed: {new Date(closedAt).toLocaleDateString()}</span>}
          <span className="font-semibold text-[var(--color-text-main)]">{status}</span>
        </div>

      </div>
    </div>
  );
};

export default InquiryAnswer;
