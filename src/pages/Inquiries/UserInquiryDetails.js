import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InquiryCard from '../../components/inquiry/InquiryCard';
import AnswerCard from '../../components/inquiry/AnswerCard';
import ReopenInquiryButton from '../../components/inquiry/ReopenInquiryButton';

// Mock data, replace with fetch based on id
const mockInquiryData = {
  inquiry: {
    id: '01',
    title: 'هل يتم تفعيل تقييد البيانات تلقائياً؟',
    body: 'هل يتم تفعيل تقييد البيانات تلقائياً عند تفعيل الباقات الإضافية ضمن عرض رمضان؟',
    status: 'Closed',
    category: 'Ramadan offers',
    date: 'yesterday 9:00 AM',
    attachments: [{ name: 'OfferDetails.pdf', url: '#' }],
  },
  answers: [
    {
      trainerName: 'Mhd Alaa AlOlab',
      trainerRole: 'Trainee',
      answerText: 'لا يتم تفعيل تقييد البيانات تلقائياً. شكراً.',
      date: 'yesterday 10:00 AM',
      rating: 5,
      attachments: [],
    },
  ],
  attachments: [{ name: 'OfferTerms.pdf', url: '#' }],
};

const UserInquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleNavigateToAdd = () => {
    navigate('/add');
  };

  const inquiryData = mockInquiryData; // Replace with fetch later

  return (
    <div className="p-6 space-y-4">
      {/* Title before Inquiry */}
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
        Inquiry:
      </h2>

      <InquiryCard {...inquiryData.inquiry} />

      {/* Title before Answer */}
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
        Answer:
      </h2>

      {inquiryData.answers.map((ans, idx) => (
        <AnswerCard key={idx} {...ans} />
      ))}

      {/* Improved Footer Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
        <span className="text-base font-medium text-[var(--color-text-primary)]">
          Didn't get a satisfying answer?
        </span>
        <button
          onClick={handleNavigateToAdd}
          className="bg-[var(--color-secondary)] text-white px-5 py-2 hover:bg-[var(--color-text-accent)] transition"
        >
          Reopen This Inquiry
        </button>
      </div>
    </div>
  );
};

export default UserInquiryDetails;
