import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../constants/constants';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import { FaUser, FaEnvelope, FaTag, FaClock, FaUserTie, FaStar, FaPaperclip } from 'react-icons/fa';

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

const InquiryDetails = () => {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiry = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/inquiries/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInquiry(res.data);
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        toast.error('Failed to load inquiry');
      } finally {
        setLoading(false);
      }
    };
    fetchInquiry();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!inquiry) {
    return <div className="text-center mt-10 text-[var(--color-danger)]">Inquiry not found.</div>;
  }

  const {
    title,
    body,
    response,
    closed_at,
    user,
    assignee_user,
    category,
    status,
    follow_ups,
    attachments,
    ratings
  } = inquiry;

  const formatDate = (date) => {
    if (!date) return '—';
    const parsedDate = new Date(date);
    return isNaN(parsedDate) ? '—' : parsedDate.toLocaleString();
  };

  const Card = ({ title, children }) => (
    <div className="bg-[var(--color-white)] rounded-xl shadow-md p-4 sm:p-6 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4 border-[var(--color-border)] w-full overflow-hidden">
      <h3 className="text-lg sm:text-xl md:text-lg lg:text-xl font-bold text-[var(--color-primary)] mb-2">{title}</h3>
      {children}
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <Icon className="text-[var(--color-text-accent)] min-w-[20px] md:min-w-[22px]" />
      <p className="text-xs sm:text-sm md:text-base break-words">
        <span className="font-semibold">{label}:</span> <span className="text-[var(--color-text-main)]">{value}</span>
      </p>
    </div>
  );

  const Avatar = ({ url, alt }) =>
    url ? (
      <img src={url} alt={alt} className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover border-[var(--color-border)]" />
    ) : (
      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-[var(--color-light-gray)] flex items-center justify-center text-[var(--color-text-muted)]">
        <FaUser size={20} />
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-5 lg:p-6 my-20 max-w-7xl mx-auto space-y-6">

      <h2 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] mb-6">Inquiry Details</h2>

      {/* Grid Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-6 lg:gap-6">

        {/* Inquiry Info */}
        <Card title="Inquiry Info">
          <InfoItem icon={FaTag} label="Title" value={title} />
          <p className="text-[var(--color-text-main)] text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words">
            <span className="font-semibold">Body:</span> {body}
          </p>
          <p className="text-[var(--color-text-main)] text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words">
            <span className="font-semibold">Response:</span> {response || 'No response yet'}
          </p>
          <InfoItem icon={FaClock} label="Closed At" value={formatDate(closed_at)} />
          <div className="mt-2">
            <p className="font-semibold text-xs sm:text-sm md:text-base">Status:</p>
            <StatusBadge value={status?.name} colorMap={ticketStatusColors} />
          </div>

          {/* Ratings List */}
          {ratings && ratings.length > 0 && (
            <div className="grid gap-4 grid-cols-1 mt-4">
              {ratings.map((rate) => (
                <div
                  key={rate.id}
                  className="bg-[var(--color-white)] rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col border border-[var(--color-border)] w-full overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-2 min-w-0">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-secondary)] font-bold text-lg overflow-hidden">
                      {rate.user_id?.toString().charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm md:text-base ${i < rate.score ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs md:text-sm text-[var(--color-text-muted)] truncate block">
                        {rate.user?.name || `User #${rate.user_id}`} • {new Date(rate.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[var(--color-text-main)] text-sm md:text-base bg-[var(--color-surface)] rounded-xl p-3 italic mt-1 flex-1 break-words whitespace-pre-wrap">
                    “{rate.feedback_text || "No feedback provided"}”
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Follow Ups */}
        <Card title="Follow Ups">
          {follow_ups && follow_ups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-4 lg:gap-5">
              {follow_ups.map((f, index) => {
                let bgColor = 'bg-[var(--color-surface)]';
                let textColor = 'text-[var(--color-text-main)]';
                switch (f.status) {
                  case 1: bgColor = 'bg-[var(--color-status-pending-bg)]'; textColor = 'text-[var(--color-status-pending)]'; break;
                  case 2: bgColor = 'bg-[var(--color-status-open-bg)]'; textColor = 'text-[var(--color-status-open)]'; break;
                  case 3: bgColor = 'bg-[var(--color-status-closed-bg)]'; textColor = 'text-[var(--color-status-closed)]'; break;
                  default: break;
                }
                return (
                  <div key={f.id} className={`${bgColor} ${textColor} rounded-lg p-3 sm:p-4 md:p-3 lg:p-4 shadow-sm hover:shadow-md transition-all duration-200 w-full overflow-hidden`}>
                    <p className="font-semibold text-xs sm:text-sm md:text-base">Follow Up #{index + 1}</p>
                    <p className="text-[var(--color-text-main)] text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words mt-1">{f.response || '—'}</p>
                    <p className="text-[var(--color-text-muted)] text-xs sm:text-sm md:text-base mt-2">Created: {formatDate(f.created_at)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[var(--color-text-muted)] text-xs sm:text-sm md:text-base">No follow ups available</p>
          )}
        </Card>

        {/* User Info */}
        <Card title="User Info">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-3 lg:gap-4 min-w-0">
            <Avatar url={user?.img_url} alt={user?.name} />
            <div className="space-y-1 flex-1 min-w-0">
              <InfoItem icon={FaUser} label="Name" value={user?.name} />
              <InfoItem icon={FaEnvelope} label="Email" value={user?.email} />
            </div>
          </div>
        </Card>

        {/* Assigned Trainer */}
        <Card title="Assigned Trainer">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-3 lg:gap-4 min-w-0">
            <Avatar url={assignee_user?.img_url} alt={assignee_user?.name} />
            <div className="space-y-1 flex-1 min-w-0">
              <InfoItem icon={FaUserTie} label="Name" value={assignee_user?.name} />
              <InfoItem icon={FaEnvelope} label="Email" value={assignee_user?.email} />
            </div>
          </div>
        </Card>

        {/* Category */}
        <Card title="Category">
          <InfoItem icon={FaTag} label="Name" value={category?.name} />
          <InfoItem icon={FaTag} label="Description" value={category?.description} />
        </Card>

        {/* Attachments */}
        <Card title="Attachments">
          {attachments && attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4 lg:gap-5">
              {attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 sm:gap-3 bg-[var(--color-surface)] rounded-lg border-[var(--color-border)] shadow-sm p-2 sm:p-3 md:p-3 lg:p-3 hover:shadow-md transition text-xs sm:text-sm md:text-base w-full overflow-hidden"
                >
                  <FaPaperclip className="text-[var(--color-primary)] text-xl sm:text-2xl md:text-xl lg:text-2xl" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-[var(--color-text-main)] truncate w-32 sm:w-40 md:w-full lg:w-40">{file.name}</span>
                    <span className="text-[var(--color-primary)] hover:underline text-xs sm:text-sm md:text-sm lg:text-sm">View / Download</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[var(--color-text-muted)] text-xs sm:text-sm md:text-base">No attachments available</p>
          )}
        </Card>

      </div>
    </div>
  );
};

export default InquiryDetails;
