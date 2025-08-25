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

        // لتخزين بعض الإحصائيات عن المدرّب
        setTrainer({
          id: trainerId,
          totalResponded,
          opened,
          closed,
          pending,
          reopened,
        });

        // تهيئة الاستعلامات بنفس أسلوب SectionDetails
        const formatted = inqs.map((inq) => ({
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
          attachments: inq.attachments || [] 
        }));

        setInquiries(formatted);
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
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
