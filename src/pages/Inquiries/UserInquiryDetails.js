import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from "../../constants/constants";
import InquiryCard from '../../components/inquiry/InquiryCard';
import AnswerCard from '../../components/inquiry/AnswerCard';
import { formatDate } from '../../../src/utils/utils';


const UserInquiryDetails = () => {
  const { id } = useParams();
  const [inquiryData, setInquiryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInquiryData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inquiries/${id}`);
        if (response.data) {
          setInquiryData(response.data);
          console.log(response.data);
        } else {
          console.error('❌ No data found for the inquiry.');
        }
      } catch (error) {
        console.error('❌ Error fetching inquiry details:', error);

        // ✅ Fallback fake data for MTN inquiries
        const fakeInquiryData = {
          id: id,
          title: "Data bundle not activating",
          body: "I purchased the 10GB data plan yesterday but it has not been activated on my line.",
          status: { name: "Opened" },
          category: { name: "Data Services" },
          created_at: "2025-08-20T10:30:00Z",
          user: {
            name: "Chinedu Okafor",
            position: "Customer",
            img_url: "/assets/img/default-avatar.png"
          },
          attachments: ["transaction_sms.jpg"],

          assignee_user: {   // ✅ added this
            name: "MTN Support Agent",
            position: "Customer Care",
            avatar: "/assets/img/mtn-support.png"
          },

          response: {
            text: "Dear customer, we are looking into your request. Kindly restart your device to refresh your bundle.",
            created_at: "2025-08-21T12:00:00Z",
            rating: 4,
            attachments: []
          },

          follow_ups: [
            {
              id: 301,
              title: "Still not working",
              body: "I restarted my phone but the bundle is still not active.",
              status: { name: "Pending" },
              category: { name: "Data Services" },
              created_at: "2025-08-21T15:00:00Z",
              user: {
                name: "Chinedu Okafor",
                position: "Customer",
                img_url: "/assets/img/default-avatar.png"
              },
              attachments: [],
              response: {
                trainer_name: "MTN Technical Team",
                trainer_role: "Engineer",
                trainer_avatar: "/assets/img/mtn-engineer.png",
                text: "We have escalated your case to the technical department. Expect resolution within 24 hours.",
                created_at: "2025-08-21T16:30:00Z",
                rating: 0,
                attachments: []
              }
            }
          ]
        };


        setInquiryData(fakeInquiryData);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryData();
  }, [id]);


  if (loading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  const handleNavigateToAdd = () => {
    navigate('/add');
  };

  const renderAnswer = () => {
    if (!inquiryData.response) {
      return <div>لا توجد إجابة حتى الآن.</div>;
    }
    return <AnswerCard
      trainerName={inquiryData.assignee_user.name || "Unknown Trainer"}
      trainerRole={inquiryData.assignee_user.position || "Trainer"}
      trainerAvatar={inquiryData.assignee_user?.avatar || "/assets/img/default-avatar.png"}
      answerText={inquiryData.response?.text || "No answer provided"}
      date={formatDate(inquiryData.response?.created_at) || "Unknown date"}
      rating={inquiryData.response?.rating || 0}
      attachments={inquiryData.response?.attachments || []}

    />;
  };

  // حالة عندما لا توجد متابعات
  const renderFollowUps = () => {
    if (!inquiryData.follow_ups || inquiryData.follow_ups.length === 0) {

    }

    return inquiryData.follow_ups.map((followup, idx) => (
      <div key={idx} className="mt-6">
        <h3 className="text-lg font-semibold">Follow Up:</h3>
        <InquiryCard
          id={followup.id}
          title={followup.title}
          body={followup.body}
          status={followup.status?.name || "Unknown Status"}
          category={followup.category?.name || "No Category"}
          date={formatDate(followup.created_at)}
          userName={followup.user?.name || "Unknown User"}
          userRole={followup.user?.position || "Unknown Role"}
          userAvatar={followup.user?.img_url || "/assets/img/default-avatar.png"}
          attachments={followup.attachments || []}
        />
        {inquiryData.follow_ups.response && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold">إجابة متابعة:</h4>
            <AnswerCard
              trainerName={followup.response.trainer_name || "Unknown Trainer"}
              trainerRole={followup.response.trainer_role || "Unknown Role"}
              trainerAvatar={followup.response.trainer_avatar || "/assets/img/default-avatar.png"}
              answerText={followup.response.text || "No answer provided"}
              date={formatDate(followup.response.created_at) || "Unknown date"}
              rating={followup.response.rating || 0}
              attachments={followup.response.attachments || []}
            />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-6 space-y-4">
      {/* Title before Inquiry */}
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
        Inquiry:
      </h2>

      {/* عرض الاستفسار الرئيسي */}
      {inquiryData && (
        <InquiryCard
          id={inquiryData.id}
          title={inquiryData.title}
          body={inquiryData.body}
          status={inquiryData.status?.name || "Unknown Status"}  // عرض اسم الحالة
          category={inquiryData.category?.name || "No Category"}  // عرض اسم الفئة
          date={formatDate(inquiryData.created_at)}
          userName={inquiryData.user?.name || "Unknown User"}  // عرض اسم المستخدم الذي أنشأ الاستفسار
          userRole={inquiryData.user?.position || "Unknown Role"}  // عرض دور المستخدم
          userAvatar={inquiryData.user?.img_url || "/assets/img/default-avatar.png"}
          attachments={inquiryData.attachments || []}
        />
      )}
      {/* Title before Answer */}
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
        Answer:
      </h2>

      {renderAnswer()}  {/* سيتم عرض الإجابة أو رسالة عدم وجود إجابة */}

      {/* عرض المتابعات إن وجدت */}
      {renderFollowUps()}

      {/* Improved Footer Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
        <span className="text-base font-medium text-[var(--color-text-primary)]">
          Didn't get a satisfying answer?
        </span>
        <button
          onClick={handleNavigateToAdd}
          className="bg-[var(--color-secondary)] text-[var(--color-bg)] px-5 py-2 hover:bg-[var(--color-text-accent)] transition"
        >
          Reopen This Inquiry
        </button>
      </div>
    </div>
  );
};

export default UserInquiryDetails;
