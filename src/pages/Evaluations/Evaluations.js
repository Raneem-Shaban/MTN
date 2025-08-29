import React, { useState } from 'react';
import InquiryAnswer from '../../components/common/collabses/InquiryAnswer';
import RatingStars from '../../components/common/ratings/RatingStars';

const dummyInquiries = [
  {
    id: 1,
    question: 'كيف يمكنني إعادة تعيين كلمة المرور؟',
    answer: 'يمكنك النقر على "نسيت كلمة المرور" في شاشة تسجيل الدخول وسيتم إرسال رابط إعادة تعيين.',
    rating: 3,
    status: 'Closed',
  },
  {
    id: 2,
    question: 'هل يمكنني تغيير الدورة التي سجلت بها؟',
    answer: 'نعم، يمكنك التواصل مع الدعم خلال 3 أيام من التسجيل لتغيير الدورة.',
    rating: 4,
    status: 'Pending',
  },
  {
    id: 3,
    question: 'ما هي سياسة الاسترداد؟',
    answer: 'يمكنك طلب استرداد خلال 7 أيام من تاريخ الشراء إذا لم تبدأ الدورة.',
    rating: 0,
    status: 'Open',
  },
];

const Evaluations = () => {
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [inquiryRatings, setInquiryRatings] = useState(
    Object.fromEntries(dummyInquiries.map((inq) => [inq.id, inq.rating]))
  );

  const toggleAnswer = (id) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRatingChange = (inquiryId, newRating) => {
    setInquiryRatings((prev) => ({
      ...prev,
      [inquiryId]: newRating,
    }));
  };

  return (
    <div className="px-6 py-20 overflow-hidden">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
        Evaluations
      </h1>

      <div className="mb-4">
      </div>

      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {dummyInquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="border border-[var(--color-border)] rounded-2xl p-4 bg-[var(--color-white)] shadow-sm"
          >
            <InquiryAnswer
              question={inquiry.question}
              answer={inquiry.answer}
              status={inquiry.status}
              expanded={expandedAnswers[inquiry.id]}
              onToggle={() => toggleAnswer(inquiry.id)}
            />

            {expandedAnswers[inquiry.id] && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[var(--color-text-muted)] text-sm">
                  تقييم الإجابة:
                </span>
                <RatingStars
                  value={inquiryRatings[inquiry.id]}
                  onChange={(val) => handleRatingChange(inquiry.id, val)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Evaluations;
