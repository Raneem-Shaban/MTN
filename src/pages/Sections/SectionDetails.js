import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InquiryAnswer from "../../components/common/collabses/InquiryAnswer";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../constants/constants";

const SectionDetails = () => {
  const { id } = useParams();
  const [section, setSection] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // جلب بيانات القسم
        const sectionRes = await axios.get(`${API_BASE_URL}/api/sections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSection(sectionRes.data);

        // جلب جميع follow-ups للقسم
        const followUpsRes = await axios.get(`${API_BASE_URL}/api/followupsSection/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const followUpsData = followUpsRes.data;

        // تجميع follow-ups حسب inquiry_id
        const inquiriesMap = {};
        followUpsData.forEach(fup => {
          const inqId = fup.inquiry_id;
          if (!inquiriesMap[inqId]) inquiriesMap[inqId] = [];
          inquiriesMap[inqId].push(fup);
        });

        // جلب بيانات كل inquiry وربط follow-ups
        const inquiriesDetails = await Promise.all(
          Object.keys(inquiriesMap).map(async (inqId) => {
            try {
              const res = await axios.get(`${API_BASE_URL}/api/inquiries/${inqId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const inq = res.data;

              return {
                id: inq.id,
                title: inq.title,
                body: inq.body,
                status: inq.status.name === "opened" ? "Open" : "Closed",
                createdAt: inq.created_at,
                response: inq.response,
                closedAt: inq.closed_at,
                userName: inq.user?.name,
                assigneeName: inq.assignee_user?.name,
                categoryName: inq.category?.name,
                statusName: inq.status && inq.status.name ? inq.status.name : "N/A",
                attachments: inq.attachments || [],
                followUps: inquiriesMap[inq.id] || [],
              };
            } catch (err) {
              console.error("Failed to fetch inquiry details", err);
              return null;
            }
          })
        );

        // إزالة أي null
        setInquiries(inquiriesDetails.filter(i => i !== null));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load section details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] relative">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto py-20">
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
              inquiryId={inq.id}
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
              followUps={inq.followUps}
              showRatings={false}
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
