import React from 'react';
import InquiryCard from './InquiryCard';
import AnswerCard from './AnswerCard';
import AttachmentList from './AttachmentList';
import ReopenInquiryButton from './ReopenInquiryButton';

const InquiryDetailsPage = ({ inquiryData, onReopen }) => {
  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <InquiryCard {...inquiryData.inquiry} />

      {inquiryData.attachments && (
        <AttachmentList attachments={inquiryData.attachments} />
      )}

      {inquiryData.answers.map((ans, idx) => (
        <AnswerCard key={idx} {...ans} />
      ))}

      <ReopenInquiryButton onClick={onReopen} />
    </div>
  );
};

export default InquiryDetailsPage;
