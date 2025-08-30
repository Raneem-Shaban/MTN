import React, { useState } from "react";
import ReassignModal from "../modals/ReassignModal";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../constants/constants";

const ReassignCell = ({ row, trainers, onUpdateTrainer }) => {
  const [open, setOpen] = useState(false);
  const isClosed = row.status.toLowerCase() === "closed";

  const handleReassign = async (trainer) => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/inquiries/reassign`,
        {
          inquiry_id: row.id,
          assignee_id: trainer.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success( "Inquiry reassigned successfully");
      setOpen(false);

      if (onUpdateTrainer) onUpdateTrainer(trainer.name);
    } catch (err) {
      console.error("Failed to reassign inquiry:", err);
      toast.error(err.response?.data?.message || "Failed to reassign inquiry");
    }
  };

  return (
    <div className="relative w-full max-w-[200px]">
      <button
        disabled={isClosed}
        onClick={() => setOpen(true)}
        className={`
          w-full px-4 py-2 rounded-full text-sm font-medium 
          border border-[var(--color-border)]
          bg-[var(--color-bg)] backdrop-blur-sm
          text-[var(--color-text-main)]
          shadow-sm flex items-center justify-between
          transition-all duration-200
          ${isClosed 
            ? "cursor-not-allowed opacity-50 bg-gray-100" 
            : "hover:shadow-md hover:border-[var(--color-primary)] cursor-pointer"}
        `}
      >
        <span>Reassign</span>
      </button>

      <ReassignModal
        isOpen={open}
        trainers={trainers}
        onClose={() => setOpen(false)}
        onReassign={handleReassign}
      />
    </div>
  );
};


export default ReassignCell;
