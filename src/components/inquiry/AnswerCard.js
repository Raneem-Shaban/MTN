import React from 'react';
import { FaPaperclip } from 'react-icons/fa';
import RatingStars from '../common/ratings/RatingStars';

const AnswerCard = ({
    trainerName,
    trainerRole = 'Trainee',
    trainerAvatar = '/assets/img/default-avatar.png',
    answerText,
    date,
    rating = 0,
    attachments = [],
    onRatingChange,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-5 md:p-6 space-y-4">

            <div className="flex items-center gap-3">
                <img
                    src={trainerAvatar}
                    alt={`${trainerName} Avatar`}
                    className="w-14 h-14 rounded-full border-2 object-cover flex-shrink-0"
                />
                <div className="flex flex-col">
                    <span className="text-l font-medium text-[var(--color-secondary)] leading-tight">
                        {trainerName}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">{trainerRole}</span>
                </div>
            </div>

            <div className="pl-16 space-y-4">
                <p className="text-[17px] md:text-[18px] font-medium text-[var(--color-text-main)] leading-relaxed break-words">
                    {answerText}
                    <div className="text-xs text-[var(--color-text-muted)]">{date}</div>
                </p>

                {attachments.length > 0 && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                        <FaPaperclip className="text-[var(--color-text-accent)]" />
                        <span>{attachments.length} Attachment{attachments.length > 1 ? 's' : ''}</span>
                    </div>
                )}

                <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-accent)]">
                    <span>Rate this answer:</span>
                    <RatingStars value={rating} onChange={onRatingChange} />
                </div>
            </div>
        </div>
    );
};

export default AnswerCard;
