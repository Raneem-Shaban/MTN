import React, { useState, useEffect, useCallback } from 'react';
import { FiPaperclip, FiX } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';

// Props:
// - inquiry
// - onSubmit: optional function(payload) => Promise OR void
// - onAction: alias for onSubmit (kept for compatibility)
// - onCancel: close modal
export default function TrainerAnswerQueryModal({ inquiry, onSubmit, onAction, onCancel }) {
  const submitHandler = onSubmit || onAction;

  // reply
  const [answer, setAnswer] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [submittingReply, setSubmittingReply] = useState(false);

  // followup
  const [followupText, setFollowupText] = useState('');
  const [followupFiles, setFollowupFiles] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  useEffect(() => {
    // reset on inquiry change
    setAnswer('');
    setReplyFiles([]);
    setFollowupText('');
    setFollowupFiles([]);
    setSelectedSectionId('');
  }, [inquiry?.id]);

  // get token helper
  const getAuthToken = useCallback(() => {
    const tokenFromStorage = localStorage.getItem('token');
    if (tokenFromStorage) return tokenFromStorage;
    try {
      const redux = JSON.parse(localStorage.getItem('reduxState') || localStorage.getItem('redux') || '{}');
      const user = redux?.auth?.user || {};
      return user?.token || user?.accessToken || null;
    } catch {
      return null;
    }
  }, []);

  const isClosed = useCallback(() => {
    const name = inquiry?.status?.name ?? inquiry?.status_name ?? '';
    const idStatus = inquiry?.status?.id ?? inquiry?.status_id ?? inquiry?.cur_status_id ?? null;
    const closedByName = typeof name === 'string' && name.trim().toLowerCase() === 'closed';
    const closedById = idStatus != null && Number(idStatus) === 3;
    return closedByName || closedById;
  }, [inquiry]);

  // fetch sections (best-effort)
  const fetchSections = useCallback(async () => {
    try {
      const token = getAuthToken();
      const resp = await axios.get(`${API_BASE_URL}/api/sections`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = resp.data;
      if (Array.isArray(data)) setSections(data);
      else if (data && Array.isArray(data.data)) setSections(data.data);
      else setSections([]);
    } catch (err) {
      console.warn('Modal: failed to fetch sections', err);
      setSections([]);
    }
  }, [getAuthToken]);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  // file helpers
  const handleReplyFiles = (e) => setReplyFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
  const removeReplyFile = (idx) => setReplyFiles(prev => prev.filter((_, i) => i !== idx));

  const handleFollowupFiles = (e) => setFollowupFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
  const removeFollowupFile = (idx) => setFollowupFiles(prev => prev.filter((_, i) => i !== idx));

  // Submit reply
  const submitReply = async () => {
    if (isClosed()) {
      toast.error('This inquiry is closed. You cannot submit a reply.');
      return;
    }
    if (!answer.trim() && replyFiles.length === 0) {
      toast.error('Please write an answer or add attachments.');
      return;
    }

    setSubmittingReply(true);

    // Delegate to parent if provided
    if (typeof submitHandler === 'function') {
      try {
        // Pass a payload; parent is expected to do optimistic update & close modal
        submitHandler({ type: 'reply', inquiry, answer: answer.trim(), files: replyFiles });
        // show immediate success toast (optional — parent may also toast)
        toast.success('Reply submitted.');
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to submit answer.';
        toast.error(msg);
        setSubmittingReply(false);
        return;
      } finally {
        setSubmittingReply(false);
      }
      return;
    }

    // Default: modal performs network request itself and closes on success
    try {
      const token = getAuthToken();
      const form = new FormData();
      form.append('inquiry_id', inquiry.id);
      form.append('response', answer);
      form.append('status_id', 3); // default to close
      replyFiles.forEach((f) => form.append('attachments[]', f, f.name));

      const resp = await axios.post(`${API_BASE_URL}/api/inquiries/reply`, form, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(resp?.data?.message || 'Reply submitted.');
      setAnswer('');
      setReplyFiles([]);
      if (typeof onCancel === 'function') onCancel();
    } catch (err) {
      console.error('[modal submitReply] error', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit answer.';
      toast.error(msg);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Submit followup
  const submitFollowup = async () => {
    if (isClosed()) {
      toast.error('This inquiry is closed. You cannot create a follow-up.');
      return;
    }
    if (!selectedSectionId) {
      toast.error('Please select a section for follow-up.');
      return;
    }

    setSubmittingFollowup(true);

    // Delegate to parent if provided
 if (typeof submitHandler === 'function') {
  try {
    // لا تعرض toast هنا — الأب سيتحكم في الاغلاق والـ toast بعد نجاح الطلب.
    await Promise.resolve(submitHandler({
      type: 'followup',
      inquiry: inquiry,
      sectionId: selectedSectionId,
      response: followupText.trim(),
      files: followupFiles,
    }));
    // optionally clear form locally
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to create follow-up.';
    toast.error(msg);
  } finally {
    setSubmittingFollowup(false);
  }
  return;
}


    // Default network call for followup
    try {
      const token = getAuthToken();
      const form = new FormData();
      form.append('inquiry_id', inquiry.id);
      form.append('status', 2); // pending
      form.append('section_id', selectedSectionId);
      form.append('response', followupText);
      followupFiles.forEach((f) => form.append('attachments[]', f, f.name));

      const resp = await axios.post(`${API_BASE_URL}/api/followups`, form, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      toast.success(resp?.data?.message || 'Follow-up created.');
      setSelectedSectionId('');
      setFollowupText('');
      setFollowupFiles([]);
      if (typeof onCancel === 'function') onCancel();
    } catch (err) {
      console.error('[modal submitFollowup] error', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to create follow-up.';
      toast.error(msg);
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const replyDisabled = submittingReply || isClosed() || (!answer.trim() && replyFiles.length === 0);
  const followupDisabled = submittingFollowup || !selectedSectionId || isClosed();

  return (
    <div className="bg-[var(--color-bg)] p-6 rounded-lg w-full max-w-3xl shadow-lg max-h-[75vh] overflow-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
            #{inquiry?.id} Inquiry Details
          </h3>
          <div className="text-sm text-gray-500">{inquiry?.category || ''} • {inquiry?.date || ''}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100">
            <FiX />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Inquiry summary */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h4 className="font-medium mb-2">{inquiry?.title}</h4>
          <p className="text-sm text-gray-700 mb-2">{inquiry?.body}</p>
          <div className="text-xs text-gray-500">From: {inquiry?.sender} • Date: {inquiry?.date}</div>
          {inquiry?.attachments?.length > 0 && (
            <div className="mt-2 text-sm">
              <div className="text-xs mb-1">
                <span className="font-medium mr-1">Attachments:</span>
                <span className="inline-flex items-center gap-1 flex-wrap">
                  {inquiry.attachments.map((att, i) => {
                    const fileName = (att.url || att.path || att.filename || att.name || '').split('/').pop();
                    const fileUrl = `/${att.url || att.path || ''}`;

                    return (
                      <a
                        key={att.id || i}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={fileName}
                        className="inline-block max-w-[140px] truncate text-blue-600 hover:underline"
                      >
                        {fileName}{i < inquiry.attachments.length - 1 ? ',' : ''}
                      </a>
                    );
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reply block */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h5 className="font-medium mb-2">Write an Answer</h5>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your response to the inquiry..."
            className="w-full min-h-[110px] p-3 border rounded mb-3 resize-none bg-white"
          />

          <div className="flex items-center gap-3 mb-3">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
              <FiPaperclip />
              <span className="text-sm">Add attachments</span>
              <input type="file" multiple className="hidden" onChange={handleReplyFiles} />
            </label>

            <button
              onClick={submitReply}
              disabled={replyDisabled}
              className={`px-4 py-2 rounded ${replyDisabled ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[var(--color-primary)] text-[var(--color-bg)]'}`}
            >
              {submittingReply ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>

          {replyFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {replyFiles.map((f, idx) => (
                <div key={idx} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span className="truncate max-w-[160px]">{f.name}</span>
                  <button onClick={() => removeReplyFile(idx)} className="ml-2 text-gray-500 hover:text-[var(--color-danger)]">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up block (موجود الآن) */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium">Open a Follow-up</h5>
            <div className="text-xs text-gray-500">Choose section & optional note</div>
          </div>

          <textarea
            value={followupText}
            onChange={(e) => setFollowupText(e.target.value)}
            placeholder="Write a short note / instruction for the follow-up (optional)..."
            className="w-full min-h-[80px] p-3 border rounded mb-3 resize-none bg-white"
          />

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select a section...</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name || s.title || `#${s.id}`}</option>
              ))}
            </select>

            <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
              <FiPaperclip />
              <span className="text-sm">Add attachments</span>
              <input type="file" multiple className="hidden" onChange={handleFollowupFiles} />
            </label>

            <button
              onClick={submitFollowup}
              disabled={followupDisabled}
              className={`px-4 py-2 rounded ${followupDisabled ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[var(--color-primary)] text-[var(--color-bg)]'}`}
            >
              {submittingFollowup ? 'Sending...' : 'Create Follow-up'}
            </button>

            <div className="text-sm text-[var(--color-secondary)] ml-auto">
              <button onClick={() => { setSelectedSectionId(''); setFollowupText(''); setFollowupFiles([]); }} className="underline">Clear</button>
            </div>
          </div>

          {followupFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {followupFiles.map((f, idx) => (
                <div key={idx} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                  <span className="truncate max-w-[160px]">{f.name}</span>
                  <button onClick={() => removeFollowupFile(idx)} className="ml-2 text-gray-500 hover:text-[var(--color-danger)]">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
