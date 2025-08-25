import React from 'react';
import { FaPaperclip } from 'react-icons/fa';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import AttachmentList from './AttachmentList';

// تزويدك بالكلمات المناسبة لكل رقم
const statusMapping = {
  4: 'reopened',
  3: 'closed',
  2: 'pending',
  1: 'opened',
};

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
};

const AnswerCard = ({
  trainerName,
  trainerRole = 'Trainee',
  trainerAvatar = '/assets/img/default-avatar.png',
  answerText,
  date,
  attachments = [],
  status,
}) => {
  const statusText = statusMapping[status]; // تحويل الرقم إلى النص المقابل
  return (
    <div className="bg-white rounded-lg shadow p-5 md:p-6 space-y-4">
      {/* Header: avatar, name & role */}
      <div className="flex items-center gap-4 md:gap-6">
        <img
          src={trainerAvatar}
          alt={`${trainerName} Avatar`}
          className="w-16 h-16 rounded-full border-2 object-cover flex-shrink-0"
        />
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-[var(--color-secondary)] leading-tight">
            {trainerName}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">{trainerRole}</span>
        </div>
      </div>

      {/* Answer and details section */}
      <div className="pl-16 space-y-4">
        {/* Answer text */}
        <div className="text-[18px] md:text-[19px] font-medium text-[var(--color-text-main)] leading-relaxed break-words">
          {answerText}
        </div>

        {/* Date (small, muted) */}
        {date && (
          <div className="text-sm text-[var(--color-text-muted)] mt-2">
            {date}
          </div>
        )}

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="mt-4">
            <AttachmentList attachments={attachments} />
          </div>
        )}

        {/* Status Badge */}
        {statusText && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[14px] text-sm text-[var(--color-text-muted)]">Status:</span>
            <StatusBadge value={statusText} colorMap={ticketStatusColors} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerCard;
