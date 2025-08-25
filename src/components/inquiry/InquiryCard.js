import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import AttachmentList from './AttachmentList';

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
};

const InquiryCard = ({
    id,
    title,
    body,
    status,
    category,
    date,
    attachments = [],
    userName,
    userRole,
    userAvatar = '/assets/img/default-avatar.png',
    finalResponse, 
}) => {
    return (
        <div className="bg-[var(--color-bg)] rounded-xl shadow-sm p-5 md:p-6 space-y-4">
            {/* Profile Header */}
            <div className="flex items-center gap-3">
                <img
                    src={userAvatar}
                    alt={`${userName} Avatar`}
                    className="w-14 h-14 rounded-full border-2 object-cover flex-shrink-0"
                />
                <div className="flex flex-col">
                    <span className="text-l font-medium text-[var(--color-secondary)] leading-tight">
                        {userName}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">{userRole}</span>
                </div>
            </div>

            {/* Question Section */}
            <div className="pl-16 space-y-4">
                <div className="flex items-start gap-3 rtl:flex-row-reverse">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                        <FiSearch className="text-[32px] text-[var(--color-text-main)]" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 space-y-3">
                        {/* Title */}
                        <div className="text-xl font-semibold text-[var(--color-text-main)]">
                            {title}
                        </div>

                        {/* Body */}
                        <div className="text-[17px] md:text-[18px] font-medium text-[var(--color-text-main)] leading-relaxed break-words">
                            {body}
                        </div>

                        {/* Date */}
                        <div className="text-sm text-[var(--color-text-muted)]">
                            {date}
                        </div>

                        {/* Attachments */}
                        {attachments.length > 0 && (
                            <AttachmentList attachments={attachments} />
                        )}

                        {/* Status and Category */}
                        <div className="flex flex-wrap items-center text-[14px] text-[var(--color-text-muted)] gap-x-6 gap-y-2">
                            <div className="flex items-center gap-1">
                                <span>Status:</span>
                                <StatusBadge value={status} colorMap={ticketStatusColors} />
                            </div>
                            <div className="flex items-center gap-1">
                                <span>Category:</span>
                                <span className="text-[var(--color-text-main)]">{category}</span>
                            </div>
                        </div>

                        {/* Final Response */}
                        {finalResponse && (
                            <div className="mt-4 py-4 border-t border-[var(--color-text-muted)] text-[var(--color-text-main)]">
                                <div className="font-semibold text-[var(--color-secondary)] text-lg">Final Response:</div>
                                <div className="text-[17px] font-medium text-[var(--color-text-main)] break-words leading-relaxed mt-2">{finalResponse}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InquiryCard;
