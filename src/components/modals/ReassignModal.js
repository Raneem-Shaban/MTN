import React from "react";

const ReassignModal = ({ isOpen, trainers, onClose, onReassign }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4 text-[var(--color-text-main)]">
          Reassign to Trainer
        </h2>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="px-4 py-2 rounded-lg border hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] cursor-pointer transition"
              onClick={() => {
                onReassign(trainer);
                onClose();
              }}
            >
              👤 {trainer.name}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignModal;
