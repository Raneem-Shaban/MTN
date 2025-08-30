import React from 'react';
import { IoClose } from 'react-icons/io5';
import { Users } from 'lucide-react';

const TrainerSelectModal = ({ allTrainers, selected, onSelect, onClose }) => {
  if (!allTrainers || !Array.isArray(allTrainers)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--color-bg)] rounded-lg w-full max-w-md md:max-w-lg lg:max-w-xl relative max-h-[90vh] flex flex-col">
        <div className="flex justify-center mt-5">
          <div className="bg-[var(--color-trainer-task)] p-4 rounded-full border-4 border-white shadow-md -mt-12">
            <Users size={24} className="text-[var(--color-secondary)]" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-2xl"
          >
            <IoClose />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pt-4 pb-2 space-y-3">
          <h2 className="text-xl font-semibold text-[var(--color-text-main)] mb-2 text-center">
            Select Trainer
          </h2>
          <ul className="space-y-2">
            {allTrainers.map((trainer) => (
              <li
                key={trainer.id}
                onClick={() => {
                  onSelect(trainer); // ⚡ الآن نرسل الكائن كامل
                  onClose();
                }}
                className={`px-4 py-2 rounded-md cursor-pointer border flex justify-between items-center hover:bg-[var(--color-hover)] text-[var(--color-text-main)] transition ${selected?.id === trainer.id ? 'bg-[var(--color-hover)] font-semibold' : ''
                  }`}
              >
                <span>{trainer.name}</span>
                {selected?.id === trainer.id && (
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-4 mt-auto border-t bg-[var(--color-bg)] rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerSelectModal;
