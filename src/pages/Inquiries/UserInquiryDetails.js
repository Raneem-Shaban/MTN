import React, { useState, useEffect, useCallback } from 'react';
import { FiPaperclip, FiX } from "react-icons/fi";
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from "../../constants/constants";
import InquiryCard from '../../components/inquiry/InquiryCard';
import AnswerCard from '../../components/inquiry/AnswerCard';
import { formatDate } from '../../../src/utils/utils';

const UserInquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // state
  const [inquiryData, setInquiryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);


  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(true);

  // current user from redux (ensure your slice name is "auth")
  const reduxUser = useSelector((state) => state.auth?.user ?? null);

  // Reopen modal state
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenText, setReopenText] = useState('');
  const [reopenFiles, setReopenFiles] = useState([]);
  const [submittingReopen, setSubmittingReopen] = useState(false);

  // Simple toast
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // --------------------------
  // getAuthToken as useCallback (depends on reduxUser)
  // --------------------------
  const getAuthToken = useCallback(() => {
    // prefer token in redux user, fallback to localStorage
    return (reduxUser && reduxUser.token) ? reduxUser.token : localStorage.getItem('token');
  }, [reduxUser]);

  // --------------------------
  // fetch functions (depend on getAuthToken)
  // --------------------------
  const fetchFollowUps = useCallback(async () => {
    setFollowUpsLoading(true);
    const token = getAuthToken();

    try {
      const resp = await axios.get(`${API_BASE_URL}/api/followupsrequest/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      console.log('✅ Followups response:', resp.data);

      const data = resp.data;
      if (Array.isArray(data)) {
        setFollowUps(data);
      } else if (data && Array.isArray(data.data)) {
        setFollowUps(data.data);
      } else {
        setFollowUps([]);
        console.warn('⚠️ Unexpected followups shape, set as empty array.');
      }
    } catch (err) {
      console.error('❌ Error fetching followups:', err);
      setFollowUps([]);
    } finally {
      setFollowUpsLoading(false);
    }
  }, [id, getAuthToken]);

  const fetchInquiryData = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    try {
      const response = await axios.get(`${API_BASE_URL}/api/inquiries/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      const data = response.data || null;
      setInquiryData(data);
      console.log('✅ Inquiry data fetched:', data);

      // Immediately debug author/status using the freshly fetched data
      console.log('🔍 After fetch -> reduxUser (current):', reduxUser);
      // Evaluate author/status passing `data` explicitly (safer)
      const authorCheck = isAuthor(data);
      const closedCheck = isStatusClosed(data);
      console.log('🔍 After fetch -> isAuthor:', authorCheck, 'isStatusClosed:', closedCheck);

      // If authorCheck false and fields missing -> print full shapes
      if (!authorCheck) {
        const inquiryUserId = data?.user?.id ?? data?.user_id ?? null;
        const inquiryUserEmail = data?.user?.email ?? data?.user_email ?? null;
        if (inquiryUserId == null && !inquiryUserEmail) {
          console.warn('⚠️ inquiry user fields missing. inquiryData object shape:', data);
          console.warn('⚠️ reduxUser shape:', reduxUser);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching inquiry details:', error);
      setInquiryData(null);
    } finally {
      setLoading(false);
    }
  }, [id, getAuthToken, reduxUser]);

  // --------------------------
  // helpers that use reduxUser
  // --------------------------
  const isStatusClosed = (dataParam) => {
    const data = dataParam ?? inquiryData;
    const name = data?.status?.name ?? data?.status_name ?? null;
    const closed = !!name && String(name).toLowerCase() === 'closed';
    console.log('🔁 isStatusClosed ->', { name, closed });
    return closed;
  };

  const isAuthor = (dataParam) => {
    const data = dataParam ?? inquiryData;
    const cu = reduxUser;

    if (!cu) {
      console.log('🔁 isAuthor -> no reduxUser (null)');
      return false;
    }

    // check possible shapes
    const inquiryUserId = data?.user?.id ?? data?.user_id ?? data?.userId ?? null;

    console.log('🔁 isAuthor -> reduxUser.id:', cu.id, 'inquiryUserId:', inquiryUserId);

    if (inquiryUserId != null && cu.id != null) {
      const same = String(inquiryUserId) === String(cu.id);
      console.log('🔁 isAuthor by id ->', same);
      return same;
    }

    console.log('🔁 isAuthor -> could not determine author (missing fields)');
    return false;
  };

  // --------------------------
  // Effects (always declared before any return)
  // --------------------------
  useEffect(() => {
    console.log('🔁 reduxUser (from store) updated:', reduxUser);
  }, [reduxUser]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      console.log('▶️ init: fetching inquiry & followups (reduxUser present?)', !!reduxUser);
      await Promise.all([fetchInquiryData(), fetchFollowUps()]);
      if (!mounted) return;
    };
    init();
    return () => { mounted = false; };
  }, [fetchInquiryData, fetchFollowUps, reduxUser]);

  useEffect(() => {
    console.log('🔁 followUps state updated:', followUps);
  }, [followUps]);

  useEffect(() => {
    const canShow = isAuthor() && isStatusClosed();
    console.log('🔔 canShowReopenButton:', canShow, 'isAuthor:', isAuthor(), 'isStatusClosed:', isStatusClosed());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxUser, inquiryData, followUps, loading]);

  // --------------------------
  // Reopen modal handlers & submit
  // --------------------------
  const openReopenModal = () => {
    setReopenText('');
    setReopenFiles([]);
    setReopenOpen(true);
  };

  const closeReopenModal = () => {
    if (submittingReopen) return;
    setReopenOpen(false);
  };

  const showToast = ({ type = 'info', message = '' }) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);
  };

  const submitReopen = async () => {
    if (!reopenText.trim() && reopenFiles.length === 0) {
      showToast({ type: 'error', message: 'Please add a message or attach a file to reopen.' });
      return;
    }

    setSubmittingReopen(true);
    const token = getAuthToken();

    try {
      const formData = new FormData();
      formData.append('inquiry_id', id);
      formData.append('response', reopenText);
      reopenFiles.forEach((f) => {
      formData.append('attachments[]', f, f.name);
      });
      formData.append('status', '4');

      const resp = await axios.post(
        `${API_BASE_URL}/api/inquiries/reopen`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Reopen response:', resp.data);

      showToast({ type: 'success', message: resp.data?.message || 'Inquiry reopened successfully.' });

      await Promise.all([fetchInquiryData(), fetchFollowUps()]);

      setReopenOpen(false);
    } catch (err) {
      console.error('❌ Error reopening inquiry:', err);
      const msg = err?.response?.data?.message || 'Failed to reopen inquiry.';
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmittingReopen(false);
    }
  };

  // UI decision
  const canShowReopenButton = isAuthor() && isStatusClosed();

  const handleNavigateToAdd = () => navigate('/add');

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="p-6 space-y-4">
      {loading ? (
        <div>Loading data...</div>
      ) : (
        <>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
            Inquiry:
          </h2>

          {inquiryData ? (
            <InquiryCard
              id={inquiryData.id}
              title={inquiryData.title}
              body={inquiryData.body}
              status={inquiryData.status?.name || 'Unknown Status'}
              category={inquiryData.category?.name || 'No Category'}
              date={formatDate(inquiryData.created_at)}
              userName={inquiryData.user?.name || 'Unknown User'}
              userRole={inquiryData.user?.position || 'Unknown Role'}
              userAvatar={inquiryData.user?.img_url || '/assets/img/default-avatar.png'}
              attachments={inquiryData.attachments || []}
              finalResponse={inquiryData.response ?? null}
            />
          ) : (
            <div>Failed to fetch inquiry details.</div>
          )}

          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>Answer:</h2>

          {followUpsLoading ? (
            <div className="mt-4">Fetching follow-ups...</div>
          ) : (
            (followUps && followUps.length > 0) ? (
              followUps.map((fu) => {
                const follower = fu.follower || {};
                const section = fu.section || {};
                const resp = fu.response;
                return (
                  <div key={fu.id} className="mt-6">
                    <h3 className="text-lg font-semibold">
                      {fu.status === 4 ? 'Reopen Inquiry' : `Follow-up — ${section.name || `#${fu.id}`}`}
                    </h3>

                    <AnswerCard
                      trainerName={follower.name || section.name || 'Unknown Follower'}
                      trainerRole={follower.position || section.division || 'Unknown Role'}
                      trainerAvatar={follower.avatar || '/assets/img/default-avatar.png'}
                      answerText={resp ?? 'No answer yet.'}
                      date={formatDate(fu.created_at)}
                      attachments={resp?.attachments || []}
                      status={fu.status}
                    />
                  </div>
                );
              })
            ) : (
              (inquiryData && inquiryData.response) ? (
                <AnswerCard
                  trainerName={inquiryData.assignee_user?.name || 'Unknown Trainer'}
                  trainerRole={inquiryData.assignee_user?.position || 'Trainer'}
                  trainerAvatar={inquiryData.assignee_user?.avatar || '/assets/img/default-avatar.png'}
                  answerText={inquiryData.response ?? 'No answer provided yet.'}
                  date={formatDate(inquiryData.created_at) || formatDate(inquiryData.created_at)}
                  attachments={inquiryData.response?.attachments || []}
                  status={inquiryData.status?.id}
                />
              ) : (
                <div>No answer yet.</div>
              )
            )
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
            <span className="text-base font-medium text-[var(--color-text-primary)]">
              Didn't get a satisfying answer?
            </span>

            {canShowReopenButton ? (
              <button
                onClick={openReopenModal}
                className="bg-[var(--color-secondary)] text-[var(--color-bg)] px-5 py-2 hover:bg-[var(--color-text-accent)] transition"
              >
                Reopen This Inquiry
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2 border border-[var(--color-text-muted)] bg-transparent text-[var(--color-text-muted)] cursor-not-allowed"
                title={!isAuthor() ? 'Only the inquiry creator can reopen it.' : 'Reopen is available only when status is Closed.'}
              >
                Reopen This Inquiry
              </button>
            )}

            <button
              onClick={handleNavigateToAdd}
              className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-bg)] rounded"
            >
              Add new
            </button>
          </div>

          {reopenOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-50" onClick={closeReopenModal} />

              <div className="relative w-full max-w-2xl bg-[var(--color-white)] rounded-2xl shadow-lg p-6 z-10">
                <h3 className="text-lg font-semibold mb-3">Reopen This Inquiry</h3>

                <textarea
                  value={reopenText}
                  onChange={(e) => setReopenText(e.target.value)}
                  placeholder="Write your message to reopen the inquiry"
                  className="w-full min-h-[120px] p-3 border rounded mb-3"
                />

                <div className="mb-3">
                  {/* Attachments */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Attachments (Optional)
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition">
                      <FiPaperclip className="text-lg" />
                      <span>Add Attachments</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleAttachmentChange}
                        className="hidden"
                      />
                    </label>

                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                          >
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <button
                              onClick={() => removeAttachment(idx)}
                              className="ml-2 text-gray-500 hover:text-[var(--color-danger)]"
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={closeReopenModal}
                    disabled={submittingReopen}
                    className="px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReopen}
                    disabled={submittingReopen}
                    className="px-4 py-2 rounded bg-[var(--color-secondary)] text-[var(--color-bg)]"
                  >
                    {submittingReopen ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {toast.show && (
            <div
              className={`fixed right-4 top-6 z-60 px-4 py-2 rounded shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
                }`}
            >
              {toast.message}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserInquiryDetails;
