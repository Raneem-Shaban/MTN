import React, { useState } from 'react';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import { UserCircle } from 'lucide-react';
import RatingStars from '../../components/common/ratings/RatingStars';
import InquiryAnswer from '../../components/common/collabses/InquiryAnswer';

const dummyTrainers = [
  { name: 'Raneem', inquiries: 5, rating: '12%' },
  { name: 'Salma', inquiries: 4, rating: '10%' },
  { name: 'Solaf', inquiries: 6, rating: '15%' },
  { name: 'Nour', inquiries: 3, rating: '7%' },
  { name: 'Alaa', inquiries: 8, rating: '16%' },
  { name: 'Mhd', inquiries: 5, rating: '11%' },
  { name: 'Raneem', inquiries: 5, rating: '12%' },
  { name: 'Salma', inquiries: 4, rating: '10%' },
  { name: 'Solaf', inquiries: 6, rating: '15%' },
];

const dummyInquiries = [
  {
    id: 1,
    question: 'How do I reset my password?',
    answer: 'Click on forgot password on the login screen.',
    rating: 3,
    status: 'Closed',
  },
  {
    id: 2,
    question: 'Can I change my course?',
    answer: 'Yes, contact support within 3 days of enrollment.',
    rating: 4,
    status: 'Pending',
  },
  {
    id: 3,
    question: 'What is the refund policy?',
    answer: 'Refunds are available within 7 days of purchase.',
    rating: 0,
    status: 'Open',
  },
];

const Trainers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [inquiryRatings, setInquiryRatings] = useState(
    Object.fromEntries(dummyInquiries.map((inq) => [inq.id, inq.rating]))
  );
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const handleRatingChange = (inquiryId, newRating) => {
    setInquiryRatings((prev) => ({
      ...prev,
      [inquiryId]: newRating,
    }));
  };

  const toggleAnswer = (id) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const pageSize = 7;
  const trainerPage = dummyTrainers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    { header: 'Trainer', accessor: 'name' },
    { header: 'Inquiries', accessor: 'inquiries' },
    { header: 'Avg Rating', accessor: 'rating' },
  ];

  return (
    <div className="px-6 pt-6 overflow-hidden" dir="ltr">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
        Trainers Overview
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col max-h-[calc(100vh-160px)] overflow-auto rounded-2xl">
          <DynamicTable
            columns={columns}
            data={trainerPage}
            onRowClick={setSelectedTrainer}
            rowClassName="hover:bg-[var(--color-white)] cursor-pointer transition duration-200 rounded"
          />
          <div className="mt-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(dummyTrainers.length / pageSize)}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <div className="bg-[var(--color-white)] rounded-2xl shadow-md flex flex-col max-h-[calc(100vh-210px)]">
          {selectedTrainer ? (
            <>
              <div className="sticky top-0 z-10 bg-[var(--color-white)] px-6 py-4 border-b rounded-t-2xl border-[var(--color-border)]">
                <h2 className="text-xl font-semibold text-[var(--color-text-accent)]">
                  {selectedTrainer.name}'s Inquiries
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {dummyInquiries.length > 0 ? (
                  dummyInquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="border border-[var(--color-border)] rounded-xl p-4 mb-4 bg-[var(--color-bg)]"
                    >
                      <InquiryAnswer
                        question={inquiry.question}
                        answer={inquiry.answer}
                        status={inquiry.status}
                        expanded={expandedAnswers[inquiry.id]}
                        onToggle={() => toggleAnswer(inquiry.id)}
                      />
                      {expandedAnswers[inquiry.id] && (
                        <div className="mt-2">
                          <span className="text-[var(--color-text-muted)] mr-2">
                            Rate this answer:
                          </span>
                          <RatingStars
                            value={inquiryRatings[inquiry.id]}
                            onChange={(val) =>
                              handleRatingChange(inquiry.id, val)
                            }
                            color="var(--color-primary)"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--color-text-secondary)]">
                    No inquiries yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-[var(--color-text-muted)] py-12 flex flex-col items-center justify-center h-full">
              <UserCircle size={42} className="mb-2 text-[var(--color-text-muted)]" />
              <p className="text-lg">Select a trainer to view inquiries</p>
              <p className="text-sm mt-1">Click on any trainer row</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trainers;