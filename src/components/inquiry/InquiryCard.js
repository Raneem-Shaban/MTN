import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import AttachmentList from './AttachmentList';

const ticketStatusColors = {
    Open: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
    Closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
    Pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

const InquiryCard = ({ id, title, body, status, category, date, attachments }) => {
    return (
        <div className="bg-[var(--color-bg)] rounded-xl shadow-sm p-5 md:p-6 space-y-4">

            <div className="flex items-start gap-3 rtl:flex-row-reverse">
                <div className="flex-shrink-0 mt-1">
                    <FiSearch className="text-[36px] text-[var(--color-text-main)]" />
                </div>

                <div className="flex flex-col space-y-4 flex-1">
                    <div className="space-y-1">
                        <div className="text-xl font-medium text-[var(--color-text-main)]">
                            # {id}
                        </div>
                        <div className="text-[17px] md:text-[18px] font-medium text-[var(--color-text-main)] leading-relaxed break-words">
                            {body}
                        </div>
                        <div className="text-sm text-[var(--color-text-muted)]">
                            {date}
                        </div>
                    </div>

                    {attachments && attachments.length > 0 && (
                        <div>
                            <AttachmentList attachments={attachments} />
                        </div>
                    )}

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
                </div>
            </div>

        </div>
    );
};

export default InquiryCard;
