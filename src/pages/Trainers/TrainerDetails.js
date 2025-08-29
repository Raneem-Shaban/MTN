import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../constants/constants";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner";
import InquiryAnswer from "../../components/common/collabses/InquiryAnswer";

const TrainerDetails = () => {
  const { id } = useParams();
  const trainerId = parseInt(id, 10);

  const [trainer, setTrainer] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/inquiries/Trainer/${trainerId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { inqs, totalResponded, opened, closed, pending, reopened } = response.data;

        setTrainer({ id: trainerId, totalResponded, opened, closed, pending, reopened });

        // جلب التفاصيل لكل استعلام مع الـ ratings
        const detailedInqs = await Promise.all(
          inqs.map(async (inq) => {
            try {
              const detailRes = await axios.get(
                `${API_BASE_URL}/api/inquiries/${inq.id}`,
                {
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const detail = detailRes.data;

              return {
                id: inq.id,
                title: inq.title,
                body: inq.body,
                response: inq.response,
                createdAt: inq.created_at,
                closedAt: inq.closed_at,
                deletedAt: inq.deleted_at,
                userName: inq.user?.name,
                assigneeName: inq.assignee_user?.name,
                categoryName: inq.category?.name,
                statusName: inq.status?.name,
                followUps: inq.follow_ups,
                attachments: inq.attachments || [],
                ratings: detail.ratings || []   // 👈 ناخدها من التفاصيل
              };
            } catch (err) {
              console.error("Failed to fetch inquiry details", err);
              return inq;
            }
          })
        );

        setInquiries(detailedInqs);
      } catch (error) {
        console.error("Error fetching trainer inquiries:", error);
        toast.error("Failed to load trainer details");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [trainerId]);

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
      {/* Trainer Info Card */}
      <div
        className="shadow-lg rounded-3xl p-8 mb-8 border border-[var(--color-border)]"
        style={{
          background:
            "linear-gradient(135deg, var(--color-category-one) 0%, var(--color-category-two) 50%, var(--color-category-three) 100%)",
          color: "var(--color-white)",
        }}
      >
        <h1 className="text-3xl font-extrabold mb-3">
          Trainer #{trainer?.id}
        </h1>
        <p className="text-md mb-1">
          <span className="font-semibold">Total Responded:</span>{" "}
          {trainer?.totalResponded}
        </p>
        <p className="text-md mb-1">
          <span className="font-semibold">Opened:</span> {trainer?.opened}
        </p>
        <p className="text-md mb-1">
          <span className="font-semibold">Closed:</span> {trainer?.closed}
        </p>
        <p className="text-md mb-1">
          <span className="font-semibold">Pending:</span> {trainer?.pending}
        </p>
        <p className="text-md">
          <span className="font-semibold">Reopened:</span> {trainer?.reopened}
        </p>
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
              response={inq.response}
              createdAt={inq.createdAt}
              closedAt={inq.closedAt}
              deletedAt={inq.deletedAt}
              expanded={expandedId === inq.id}
              allowOnlyOne={true}
              onExpand={(isExpanding) =>
                setExpandedId(isExpanding ? inq.id : null)
              }
              userName={inq.userName}
              assigneeName={inq.assigneeName}
              categoryName={inq.categoryName}
              statusName={inq.statusName}
              followUps={inq.followUps}
              attachments={inq.attachments}
              ratings={inq.ratings}
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

export default TrainerDetails;
