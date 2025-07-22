import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: "-50%", scale: 0.8 },
  visible: { opacity: 1, y: "0%", scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: "50%", scale: 0.8, transition: { duration: 0.2 } },
};

const DeleteConfirmationModal = ({ onConfirm, onCancel, message }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="bg-[var(--color-surface)] rounded-xl p-6 w-full max-w-md shadow-xl border border-[var(--color-border)]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-center mb-4 space-x-3">
            <FiTrash2 className="text-[var(--color-danger)] w-6 h-6" />
            <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-text-main)]">
              Confirm Deletion
            </h2>
          </div>

          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            {message || 'Are you sure you want to delete this inquiry? This action cannot be undone.'}
          </p>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-full text-sm font-medium text-[var(--color-cancel-back-btn-txt)] bg-[var(--color-border)] hover:bg-[var(--color-cancel-back-btn-hover)] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-full text-sm font-medium text-white bg-[var(--color-danger)] hover:bg-red-700 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
