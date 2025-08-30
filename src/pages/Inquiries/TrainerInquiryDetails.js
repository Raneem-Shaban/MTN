import React, { useState, useEffect, useCallback } from 'react';
import { FiPaperclip, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import InquiryCard from '../../components/inquiry/InquiryCard';
import AnswerCard from '../../components/inquiry/AnswerCard';

const TrainerInquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const reduxUser = useSelector((s) => s.auth?.user ?? null);

  const [inquiryData, setInquiryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(true);

  // reply state
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [submittingReply, setSubmittingReply] = useState(false);

  // followup state
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [followupText, setFollowupText] = useState('');
  const [followupFiles, setFollowupFiles] = useState([]);
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // ratings collapse state
  const [ratingsExpanded, setRatingsExpanded] = useState(false); // collapsed by default

  // toast
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

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
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);
  };

  const getAuthToken = useCallback(() => {
    return (reduxUser && (reduxUser.token || reduxUser.accessToken)) ? (reduxUser.token || reduxUser.accessToken) : localStorage.getItem('token');
  }, [reduxUser]);

  // هل الاستفسار مغلق؟
  const isClosed = () => {
    const name = inquiryData?.status?.name ?? inquiryData?.status_name ?? '';
    const idStatus = inquiryData?.status?.id ?? inquiryData?.status_id ?? inquiryData?.cur_status_id ?? null;
    const closedByName = typeof name === 'string' && name.trim().toLowerCase() === 'closed';
    const closedById = idStatus != null && Number(idStatus) === 3;
    const closed = closedByName || closedById;
    console.log('[isClosed] name:', name, 'idStatus:', idStatus, 'closed:', closed);
    return closed;
  };

  // صلاحية الرد: فقط إذا كان current user هو assignee (مقارنة مع assignee_id)
  const hasReplyPermission = () => {
    if (!reduxUser) {
      console.log('[hasReplyPermission] no reduxUser');
      return false;
    }
    const currentUserId = reduxUser.id ?? reduxUser.user_id ?? reduxUser.userId ?? null;
    if (!currentUserId) {
      console.log('[hasReplyPermission] reduxUser has no id field, reduxUser:', reduxUser);
      return false;
    }

    const assigneeId =
      inquiryData?.assignee_user?.id ??
      inquiryData?.assignee_id ??
      inquiryData?.assigneeId ??
      null;

    console.log('[hasReplyPermission] currentUserId:', currentUserId, 'assigneeId:', assigneeId);

    if (assigneeId != null && String(currentUserId) === String(assigneeId)) {
      return true;
    }
    return false;
  };

  // --- Fetch helpers with console logs ---
  const fetchSections = useCallback(async () => {
    try {
      const token = getAuthToken();
      console.log('[fetchSections] calling /api/sections');
      const resp = await axios.get(`${API_BASE_URL}/api/sections`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      console.log('[fetchSections] response:', resp.data);
      const data = resp.data;
      if (Array.isArray(data)) setSections(data);
      else if (data && Array.isArray(data.data)) setSections(data.data);
      else setSections([]);
    } catch (err) {
      console.warn('Failed to fetch sections, leaving empty', err);
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
      console.log('[fetchFollowUps] response:', resp.data);
      const data = resp.data;
      if (Array.isArray(data)) setFollowUps(data);
      else if (data && Array.isArray(data.data)) setFollowUps(data.data);
      else setFollowUps([]);
    } catch (err) {
      console.error('Error fetching followups:', err);
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
      console.log('[fetchInquiryData] response:', resp.data);
      setInquiryData(resp.data ?? null);
    } catch (err) {
      console.error('Error fetching inquiry:', err);
      setInquiryData(null);
    } finally {
      setLoading(false);
    }
  }, [id, getAuthToken]);

  useEffect(() => {
    console.log('[useEffect] reduxUser changed:', reduxUser);
  }, [reduxUser]);

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

  // log whenever inquiryData/followUps/sections change (helps debugging)
  useEffect(() => {
    console.log('[debug] inquiryData updated:', inquiryData);
  }, [inquiryData]);

  useEffect(() => {
    console.log('[debug] followUps updated:', followUps);
  }, [followUps]);

  useEffect(() => {
    console.log('[debug] sections updated:', sections);
  }, [sections]);

  useEffect(() => {
    console.log('[debug] replyFiles:', replyFiles.map(f => f.name));
  }, [replyFiles]);

  useEffect(() => {
    console.log('[debug] followupFiles:', followupFiles.map(f => f.name));
  }, [followupFiles]);

  // Rating helpers
  const getRatings = () => {
    if (!inquiryData) return [];
    // normalise different payload shapes
    const r = inquiryData.ratings ?? inquiryData.rating ?? inquiryData.rates ?? [];
    return Array.isArray(r) ? r : [];
  };

  const ratings = getRatings();
  const ratingCount = ratings.length;
  const avgRating = ratingCount > 0
    ? Math.round((ratings.reduce((sum, it) => sum + (Number(it.score) || 0), 0) / ratingCount) * 10) / 10
    : null; // 1 decimal

  const renderStars = (value, max = 5) => {
    const filled = Math.round(value || 0);
    const stars = [];
    for (let i = 1; i <= max; i++) {
      if (i <= filled) stars.push(<AiFillStar key={i} className="inline-block mr-0.5" />);
      else stars.push(<AiOutlineStar key={i} className="inline-block mr-0.5" />);
    }
    return <span className="inline-flex items-center text-yellow-500">{stars}</span>;
  };

  // Reply attachments handlers
  const handleReplyFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('[handleReplyFilesChange] added files:', files.map(f => f.name));
    setReplyFiles((prev) => [...prev, ...files]);
  };
  const removeReplyFile = (idx) => {
    console.log('[removeReplyFile] removing index', idx, 'file', replyFiles[idx]?.name);
    setReplyFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Follow-up attachments handlers
  const handleFollowupFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('[handleFollowupFilesChange] added files:', files.map(f => f.name));
    setFollowupFiles((prev) => [...prev, ...files]);
  };
  const removeFollowupFile = (idx) => {
    console.log('[removeFollowupFile] removing index', idx, 'file', followupFiles[idx]?.name);
    setFollowupFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // submit reply
  const submitReply = async () => {
    console.log('[submitReply] attempt, replyText length:', replyText.length, 'replyFiles:', replyFiles.map(f => f.name));

    if (isClosed()) {
      showToast({ type: 'error', message: 'This inquiry is closed. You cannot submit a reply.' });
      console.log('[submitReply] blocked: inquiry is closed');
      return;
    }

    if (!hasReplyPermission()) {
      showToast({ type: 'error', message: 'You do not have permission to submit a reply.' });
      console.log('[submitReply] denied by hasReplyPermission');
      return;
    }

    if (!replyText.trim() && replyFiles.length === 0) {
      showToast({ type: 'error', message: 'Please write a response or attach a file.' });
      console.log('[submitReply] nothing to send');
      return;
    }

    setSubmittingReply(true);
    try {
      const token = getAuthToken();
      const form = new FormData();
      form.append('inquiry_id', id);
      form.append('response', replyText);
      form.append('status_id', 3); // default: closed

      replyFiles.forEach((f) => {
        console.log('[submitReply] appending file:', f.name);
        form.append('attachments[]', f, f.name);
      });

      console.log('[submitReply] posting to /api/inquiries/reply');
      const resp = await axios.post(`${API_BASE_URL}/api/inquiries/reply`, form, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[submitReply] response:', resp.data);
      showToast({ type: 'success', message: resp.data?.message || 'Reply submitted.' });

      setReplyText('');
      setReplyFiles([]);
      await Promise.all([fetchInquiryData(), fetchFollowUps()]);
    } catch (err) {
      console.error('Error submitting reply:', err);
      const msg = err?.response?.data?.message || 'Failed to submit reply.';
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmittingReply(false);
    }
  };

  // submit followup (supports files + text)
  const submitFollowup = async () => {
    console.log('[submitFollowup] attempt, selectedSectionId:', selectedSectionId, 'followupText len:', followupText.length, 'files:', followupFiles.map(f => f.name));

    if (isClosed()) {
      showToast({ type: 'error', message: 'This inquiry is closed. You cannot create a follow-up.' });
      console.log('[submitFollowup] blocked: inquiry is closed');
      return;
    }

    if (!hasReplyPermission()) {
      showToast({ type: 'error', message: 'You do not have permission to create a follow-up.' });
      console.log('[submitFollowup] denied by hasReplyPermission');
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
      form.append('status', 2); // default: pending
      form.append('section_id', selectedSectionId);
      form.append('response', followupText);

      followupFiles.forEach((f) => {
        console.log('[submitFollowup] appending file:', f.name);
        form.append('attachments[]', f, f.name);
      });

      console.log('[submitFollowup] posting multipart to /api/followups');
      const resp = await axios.post(`${API_BASE_URL}/api/followups`, form, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      console.log('[submitFollowup] response:', resp.data);
      showToast({ type: 'success', message: resp.data?.message || 'Followup created.' });

      setSelectedSectionId('');
      setFollowupText('');
      setFollowupFiles([]);
      await Promise.all([fetchFollowUps(), fetchInquiryData()]);
    } catch (err) {
      console.error('Error creating followup:', err);
      const msg = err?.response?.data?.message || 'Failed to create followup.';
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmittingFollowup(false);
    }
  };

  // small helpers for UI
  const canSendReply = hasReplyPermission();
  const replyDisabled = submittingReply || !canSendReply || isClosed();
  const followupDisabled = submittingFollowup || !selectedSectionId || isClosed() || !hasReplyPermission();

  return (
    <div className="p-6 pt-20 space-y-6 max-w-5xl mx-auto">
      {loading ? (
        <div className="text-center py-12">Loading inquiry...</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>#{inquiryData?.id} Inquiry Details </h2>
          </div>

          {/* content column: inquiry + answers */}
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
                finalResponse={inquiryData.response ?? null}
              />
            ) : (
              <div className="p-4 bg-white rounded shadow">Failed to load inquiry.</div>
            )}

            {/* Ratings compact block: show avg + toggle */}
            {ratings && ratings.length > 0 && (
              <div className="mt-4 bg-white rounded shadow-sm border">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Average rating</div>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-semibold">{avgRating}</div>
                      <div>{renderStars(avgRating || 0)}</div>
                      <div className="text-sm text-gray-500">({ratingCount} review{ratingCount > 1 ? 's' : ''})</div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setRatingsExpanded((v) => !v)}
                      aria-expanded={ratingsExpanded}
                      className="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
                    >
                      {ratingsExpanded ? (
                        <>
                          <FiChevronUp />
                          <span className="text-sm">Hide reviews</span>
                        </>
                      ) : (
                        <>
                          <FiChevronDown />
                          <span className="text-sm">Show reviews</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* collapsible content */}
                <div className={`overflow-hidden transition-all duration-300 ${ratingsExpanded ? 'max-h-[2000px] p-4' : 'max-h-0 p-0'}`}>
                  <div className="space-y-3">
                    {ratings.map((r) => (
                      <div key={r.id || `${r.user_id}-${r.score}-${Math.random()}`} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{r.user?.name || r.reviewer_name || `User #${r.user_id || r.userId || '??'}`}</div>
                            <div className="text-sm text-gray-500">{formatDate(r.created_at || r.createdAt || r.date)}</div>
                          </div>
                          <div>{renderStars(r.score || 0)}</div>
                        </div>

                        {r.feedback_text && (
                          <div className="mt-2 text-sm text-gray-700">{r.feedback_text}</div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mt-2" style={{ color: 'var(--color-text-main)' }}>Answers & Follow-ups</h3>

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
                    (inquiryData && inquiryData.response) ? (
                      <div className="mt-3">
                        <AnswerCard
                          trainerName={inquiryData.assignee_user?.name || 'Assigned Trainer'}
                          trainerRole={inquiryData.assignee_user?.position || 'Trainer'}
                          trainerAvatar={inquiryData.assignee_user?.avatar || '/assets/img/default-avatar.png'}
                          answerText={inquiryData.response ?? 'No response yet.'}
                          date={formatDate(inquiryData.created_at || inquiryData.createdAt)}
                          attachments={inquiryData.response?.attachments || []}
                          status={inquiryData.status?.id}
                        />
                      </div>
                    ) : (
                      <div className="mt-3 text-gray-600">No answers or follow-ups yet.</div>
                    )
                  )}
                </>
              )}
            </div>
          </div>

          {/* If inquiry is closed, show a banner and DON'T render reply/followup controls */}
          {isClosed() ? (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              This inquiry is closed — replies and follow-ups are disabled.
            </div>
          ) : (
            <>
              {/* reply box (under content) */}
              <div className="mt-6 p-4 bg-[var(--color-bg)] rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Write an Answer</h4>
                  {!canSendReply && (
                    <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Only assignee can submit</div>
                  )}
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response to the inquiry..."
                  className="w-full min-h-[110px] p-3 border rounded mb-3 resize-none bg-white"
                />

                <div className="flex items-center gap-3 mb-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
                    <FiPaperclip />
                    <span className="text-sm">Add attachments</span>
                    <input type="file" multiple className="hidden" onChange={handleReplyFilesChange} />
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

              {/* follow-up box (under reply) */}
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
            </>
          )}

          {/* toast */}
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

export default TrainerInquiryDetails;
