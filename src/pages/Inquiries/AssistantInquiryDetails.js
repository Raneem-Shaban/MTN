import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiPaperclip, FiX } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import InquiryCard from '../../components/inquiry/InquiryCard';
import AnswerCard from '../../components/inquiry/AnswerCard';

const AssistantInquiryDetails = () => {
  const { id } = useParams();
  const reduxUser = useSelector((s) => s.auth?.user ?? null);

  const [inquiryData, setInquiryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(true);

  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [followupText, setFollowupText] = useState('');
  const [followupFiles, setFollowupFiles] = useState([]);
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // local toast state (imitates TrainerInquiryDetails logic)
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });
  const toastTimerRef = useRef(null);

  const formatDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (!Number.isNaN(dt.getTime())) return dt.toLocaleString('en-GB');
      return String(d).slice(0, 19);
    } catch {
      return String(d);
    }
  };

  const showToast = ({ type = 'info', message = '' }) => {
    // clear any existing timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToast({ show: true, type, message });
    // auto-hide after 4.5s (same as TrainerInquiryDetails)
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, type: 'info', message: '' });
      toastTimerRef.current = null;
    }, 4500);
  };

  useEffect(() => {
    return () => {
      // cleanup timer on unmount
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const getAuthToken = useCallback(() => {
    return (reduxUser && (reduxUser.token || reduxUser.accessToken)) 
      ? (reduxUser.token || reduxUser.accessToken) 
      : localStorage.getItem('token');
  }, [reduxUser]);

  const isClosed = () => {
    const name = inquiryData?.status?.name ?? inquiryData?.status_name ?? '';
    const idStatus = inquiryData?.status?.id ?? inquiryData?.status_id ?? inquiryData?.cur_status_id ?? null;
    const closedByName = typeof name === 'string' && name.trim().toLowerCase() === 'closed';
    const closedById = idStatus != null && Number(idStatus) === 3;
    return closedByName || closedById;
  };

  // fetch helpers
  const fetchSections = useCallback(async () => {
    try {
      const token = getAuthToken();
      console.log('[fetchSections] calling /api/sections');
      const resp = await axios.get(`${API_BASE_URL}/api/sections`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = resp.data;
      console.log('[fetchSections] response', data);
      if (Array.isArray(data)) setSections(data);
      else if (data && Array.isArray(data.data)) setSections(data.data);
      else setSections([]);
    } catch (err) {
      console.warn('[fetchSections] failed', err);
      setSections([]);
    }
  }, [getAuthToken]);

  const fetchFollowUps = useCallback(async () => {
    setFollowUpsLoading(true);
    try {
      const token = getAuthToken();
      console.log(`[fetchFollowUps] calling /api/followupsrequest/${id}`);
      const resp = await axios.get(`${API_BASE_URL}/api/followupsrequest/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = resp.data;
      console.log('[fetchFollowUps] response', data);
      if (Array.isArray(data)) setFollowUps(data);
      else if (data && Array.isArray(data.data)) setFollowUps(data.data);
      else setFollowUps([]);
    } catch (err) {
      console.error('[fetchFollowUps] error', err);
      setFollowUps([]);
    } finally {
      setFollowUpsLoading(false);
    }
  }, [id, getAuthToken]);

  const fetchInquiryData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      console.log(`[fetchInquiryData] calling /api/inquiries/${id}`);
      const resp = await axios.get(`${API_BASE_URL}/api/inquiries/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      console.log('[fetchInquiryData] response', resp.data);
      setInquiryData(resp.data ?? null);
    } catch (err) {
      console.error('[fetchInquiryData] error', err);
      setInquiryData(null);
    } finally {
      setLoading(false);
    }
  }, [id, getAuthToken]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      console.log('[init] fetching inquiry, followups, sections (id=', id, ')');
      await Promise.all([fetchInquiryData(), fetchFollowUps(), fetchSections()]);
      if (!mounted) return;
      console.log('[init] fetches completed');
    };
    init();
    return () => { mounted = false; };
  }, [fetchInquiryData, fetchFollowUps, fetchSections, id]);

  // followup files handlers
  const handleFollowupFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('[handleFollowupFilesChange] added files:', files.map(f => f.name));
    setFollowupFiles((prev) => [...prev, ...files]);
  };
  const removeFollowupFile = (idx) => {
    console.log('[removeFollowupFile] removing', idx, followupFiles[idx]?.name);
    setFollowupFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // submit followup (uses local showToast logic instead of react-toastify directly so UI isn't lost on navigation)
  const submitFollowup = async () => {
    console.log('[submitFollowup] attempt, selectedSectionId:', selectedSectionId, 'text len:', followupText.length, 'files:', followupFiles.map(f => f.name));

    if (isClosed()) {
      showToast({ type: 'error', message: 'This inquiry is closed. You cannot create a follow-up.' });
      return;
    }

    if (!selectedSectionId) {
      showToast({ type: 'error', message: 'Please select a section to follow up with.' });
      return;
    }

    setSubmittingFollowup(true);
    try {
      const token = getAuthToken();
      const form = new FormData();
      form.append('inquiry_id', id);
      form.append('status', 2);
      form.append('section_id', selectedSectionId);
      form.append('response', followupText);

      followupFiles.forEach((f) => {
        console.log('[submitFollowup] appending file', f.name);
        form.append('attachments[]', f, f.name);
      });

      console.log('[submitFollowup] posting to /api/followups');
      const resp = await axios.post(`${API_BASE_URL}/api/followups`, form, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      console.log('[submitFollowup] response', resp.data);
      showToast({ type: 'success', message: resp.data?.message || 'Followup created.' });

      setSelectedSectionId('');
      setFollowupText('');
      setFollowupFiles([]);
      await Promise.all([fetchFollowUps(), fetchInquiryData()]);
    } catch (err) {
      console.error('[submitFollowup] error', err);
      const msg = err?.response?.data?.message || 'Failed to create followup.';
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const followupDisabled = submittingFollowup || !selectedSectionId || isClosed();

  return (
    <div className="p-6 pt-20 space-y-6 max-w-5xl mx-auto">
      {loading ? (
        <div className="text-center py-12">Loading inquiry...</div>
      ) : (
        <>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>
            #{inquiryData?.id} Inquiry Details 
          </h2>

          {/* Inquiry */}
          <div className="space-y-4">
            {inquiryData ? (
              <InquiryCard
                id={inquiryData.id}
                title={inquiryData.title || inquiryData.subject || `#${inquiryData.id}`}
                body={inquiryData.body || inquiryData.description || ''}
                status={(inquiryData.status?.name || inquiryData.status_name || 'Unknown')}
                category={inquiryData.category?.name || inquiryData.category_name || 'No Category'}
                date={formatDate(inquiryData.created_at || inquiryData.createdAt || inquiryData.date)}
                userName={inquiryData.user?.name || inquiryData.user_name || 'Unknown User'}
                userRole={inquiryData.user?.position || inquiryData.user?.role || 'User'}
                userAvatar={inquiryData.user?.img_url || inquiryData.user?.avatar || '/assets/img/default-avatar.png'}
                attachments={inquiryData.attachments || []}
              />
            ) : (
              <div className="p-4 bg-white rounded shadow">Failed to load inquiry.</div>
            )}

            <div>
              <h3 className="text-lg font-semibold mt-2" style={{ color: 'var(--color-text-main)' }}>
                Answers & Follow-ups
              </h3>
              {followUpsLoading ? (
                <div className="mt-3">Loading answers / follow-ups...</div>
              ) : (
                <>
                  {followUps && followUps.length > 0 ? (
                    followUps.map((fu) => (
                      <div key={fu.id} className="mt-4">
                        <h4 className="font-medium text-sm mb-2">
                          {fu.status === 4 ? 'Reopen' : (fu.section?.name ? `Follow-up — ${fu.section.name}` : `Follow-up #${fu.id}`)}
                        </h4>
                        <AnswerCard
                          trainerName={fu.follower?.name || fu.section?.name || 'Unknown'}
                          trainerRole={fu.follower?.position || fu.section?.division || 'Unknown'}
                          trainerAvatar={fu.follower?.avatar || '/assets/img/default-avatar.png'}
                          answerText={fu.response ?? 'No response yet.'}
                          date={formatDate(fu.created_at || fu.createdAt)}
                          attachments={fu.attachments || []}
                          status={fu.status}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="mt-3 text-gray-600">No answers or follow-ups yet.</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* follow-up UI */}
          {isClosed() ? (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              This inquiry is closed — follow-ups are disabled.
            </div>
          ) : (
            <div className="mt-4 p-4 bg-[var(--color-bg)] rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Open a Follow-up</h4>
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
                  <input type="file" multiple className="hidden" onChange={handleFollowupFilesChange} />
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
          )}

          {/* local toast (imitates TrainerInquiryDetails) */}
          {toast.show && (
            <div
              className={`fixed right-4 top-6 z-60 px-4 py-2 rounded shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}
            >
              {toast.message}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssistantInquiryDetails;