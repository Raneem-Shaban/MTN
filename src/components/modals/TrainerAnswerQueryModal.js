import { useState } from 'react';

const AnswerModal = ({ inquiry, onSubmit, onCancel }) => {
  const [answer, setAnswer] = useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[var(--color-bg)] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-2">{inquiry.title}</h2>
        <p className="mb-2">{inquiry.body}</p>
        <div className="mb-2">
          <strong>From:</strong> {inquiry.sender} <br/>
          <strong>Date:</strong> {inquiry.date}
        </div>
        {inquiry.attachments?.length > 0 && (
          <div className="mb-2 text-sm">
            <strong>Attachments:</strong> {inquiry.attachments.map(a => a.name).join(', ')}
          </div>
        )}
        <textarea
          placeholder="Write your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => answer.trim() && onSubmit(answer)}
            disabled={!answer.trim()}
            className="px-4 py-2 rounded bg-[var(--color-primary)] text-white disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerModal;
