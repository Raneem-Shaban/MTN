import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InquiryAnswer from "../../components/common/collabses/InquiryAnswer";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../constants/constants";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";

const SectionDetails = () => {
  const { id } = useParams();
  const [section, setSection] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true); // حالة التحميل

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // بدء التحميل
        const token = localStorage.getItem("token");

        const sectionRes = await axios.get(`${API_BASE_URL}/api/sections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSection(sectionRes.data);

        const inqRes = await axios.get(`${API_BASE_URL}/api/followupsSection/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formatted = inqRes.data.map((f) => ({
          id: f.inquiry.id,
          title: f.inquiry.title,
          body: f.inquiry.body,
          status: f.status === 1 ? "Open" : "Closed",
          createdAt: f.inquiry.created_at,
          response: f.inquiry.response,
          closedAt: f.inquiry.closed_at,
          userName: f.inquiry.user?.name,              // صاحب الاستفسار
          assigneeName: f.inquiry.assignee_user?.name, // المكلّف
          categoryName: f.inquiry.category?.name,      // التصنيف
          statusName: f.inquiry.status?.name,
          attachments: f.inquiry.attachments || [] 
        }));

        setInquiries(formatted);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load section details");
      } finally {
        setLoading(false); // انتهى التحميل
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />; // عرض مؤشر التحميل أثناء الانتظار
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Section Info */}
      <div
        className="shadow-lg rounded-3xl p-8 mb-8 border border-[var(--color-border)]"
        style={{
          background: 'linear-gradient(135deg, var(--color-category-one) 0%, var(--color-category-two) 50%, var(--color-category-three) 100%)',
          color: 'var(--color-white)',
        }}
      >
        <h1 className="text-3xl font-extrabold mb-3">{section?.name}</h1>
        <p className="text-md mb-1"><span className="font-semibold">Division:</span> {section?.division}</p>
        <p className="text-md mb-1"><span className="font-semibold">Email:</span> {section?.email}</p>
        <p className="text-md"><span className="font-semibold">Users:</span> {section?.users_count}</p>
      </div>

      {/* Inquiries List */}
      {inquiries.length > 0 ? (
        <div className="space-y-6">
          {inquiries.map((inq) => (
            <InquiryAnswer
              key={inq.id}
              question={inq.title}
              answer={inq.body}
              status={inq.status}
              response={inq.response}
              createdAt={inq.createdAt}
              closedAt={inq.closedAt}
              expanded={expandedId === inq.id}
              allowOnlyOne={true}
              onExpand={(isExpanding) => setExpandedId(isExpanding ? inq.id : null)}
              userName={inq.userName}
              assigneeName={inq.assigneeName}
              categoryName={inq.categoryName}
              statusName={inq.statusName}
              attachments={inq.attachments}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[var(--color-text-accent)] text-center">
          No inquiries found.
        </p>
      )}
    </div>
  );
};

export default SectionDetails;
