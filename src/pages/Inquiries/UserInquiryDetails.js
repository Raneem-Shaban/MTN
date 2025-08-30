import React, { useState, useEffect, useCallback } from 'react';
import { FiPaperclip, FiX } from "react-icons/fi";
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
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

  // rating states
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);

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
    return (reduxUser && (reduxUser.token || reduxUser.accessToken)) ? (reduxUser.token || reduxUser.accessToken) : localStorage.getItem('token');
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

      const data = resp.data;
      if (Array.isArray(data)) {
        setFollowUps(data);
      } else if (data && Array.isArray(data.data)) {
        setFollowUps(data.data);
      } else {
        setFollowUps([]);
      }
    } catch (err) {
      console.error('Error fetching followups:', err);
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
    } catch (error) {
      console.error('Error fetching inquiry details:', error);
      setInquiryData(null);
    } finally {
      setLoading(false);
    }
  }, [id, getAuthToken]);

  // --------------------------
  // helpers that use reduxUser
  // --------------------------
  const isStatusClosed = (dataParam) => {
    const data = dataParam ?? inquiryData;
    const name = data?.status?.name ?? data?.status_name ?? null;
    const closed = !!name && String(name).toLowerCase() === 'closed';
    return closed;
  };

  const isAuthor = (dataParam) => {
    const data = dataParam ?? inquiryData;
    const cu = reduxUser;

    if (!cu) return false;

    const inquiryUserId = data?.user?.id ?? data?.user_id ?? data?.userId ?? null;
    if (inquiryUserId != null && cu.id != null) {
      return String(inquiryUserId) === String(cu.id);
    }
    return false;
  };

  // --------------------------
  // Effects (always declared before any return)
  // --------------------------
  useEffect(() => { }, [reduxUser]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await Promise.all([fetchInquiryData(), fetchFollowUps()]);
      if (!mounted) return;
    };
    init();
    return () => { mounted = false; };
  }, [fetchInquiryData, fetchFollowUps, reduxUser]);

  // --------------------------
  // Ratings helpers
  // --------------------------
  const getRatingsArray = () => {
    if (!inquiryData) return [];
    const r = inquiryData.ratings ?? inquiryData.rating ?? inquiryData.rates ?? [];
    return Array.isArray(r) ? r : [];
  };

  const ratings = getRatingsArray();
  const ratingCount = ratings.length;
  const avgRating = ratingCount > 0
    ? Math.round((ratings.reduce((sum, it) => sum + (Number(it.score) || 0), 0) / ratingCount) * 10) / 10
    : null;

  const hasCurrentUserRated = () => {
    if (!reduxUser) return false;
    const uid = reduxUser.id ?? reduxUser.user_id ?? null;
    if (!uid) return false;
    return ratings.some(r => String(r.user_id ?? r.user?.id ?? r.reviewer_id ?? '') === String(uid));
  };

  const canUserRate = () => {
    // only the inquiry author can add a rating
    return isAuthor() && !hasCurrentUserRated();
  };

  const renderStaticStars = (value, max = 5) => {
    const filled = Math.round(value || 0);
    const stars = [];
    for (let i = 1; i <= max; i++) {
      stars.push(i <= filled ? <AiFillStar key={i} className="inline-block mr-0.5 text-yellow-500" /> : <AiOutlineStar key={i} className="inline-block mr-0.5 text-yellow-500" />);
    }
    return <div className="inline-flex items-center">{stars}</div>;
  };

  const renderInteractiveStars = (max = 5) => {
    const stars = [];
    for (let i = 1; i <= max; i++) {
      const filled = i <= (hoverRating || ratingScore);
      stars.push(
        <button
          key={i}
          type="button"
          className={`p-1 rounded ${filled ? 'transform scale-105' : 'hover:scale-105'}`}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          onFocus={() => setHoverRating(i)}
          onBlur={() => setHoverRating(0)}
          onClick={() => setRatingScore(i)}
          aria-label={`Rate ${i} star`}
        >
          {filled ? <AiFillStar className="text-yellow-500 text-2xl" /> : <AiOutlineStar className="text-yellow-500 text-2xl" />}
        </button>
      );
    }
    return <div className="inline-flex items-center gap-1">{stars}</div>;
  };

  const submitRating = async () => {
    if (!ratingScore || ratingScore < 1 || ratingScore > 5) {
      setToast({ show: true, type: 'error', message: 'Please choose a rating between 1 and 5.' });
      setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);
      return;
    }

    setSubmittingRating(true);
    const token = getAuthToken();

    try {
      const payload = {
        inquiry_id: Number(id),
        score: Number(ratingScore),
        feedback_text: ratingFeedback || '',
      };

      const resp = await axios.post(`${API_BASE_URL}/api/ratings`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });

      setToast({ show: true, type: 'success', message: resp.data?.message || 'The rating has been sent successfully.' });
      setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);

      // refresh inquiry data to get updated avg
      await fetchInquiryData();

      // hide form after success
      setShowRatingForm(false);
      setRatingScore(0);
      setRatingFeedback('');
    } catch (err) {
      console.error('Error submitting rating:', err);
      const msg = err?.response?.data?.message || 'Failed to submit rating.';
      setToast({ show: true, type: 'error', message: msg });
      setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);
    } finally {
      setSubmittingRating(false);
    }
  };

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

  const submitReopen = async () => {
    if (!reopenText.trim() && reopenFiles.length === 0) {
      setToast({ show: true, type: 'error', message: 'Please add a message or attach a file to reopen.' });
      setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);
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

      setToast({ show: true, type: 'success', message: resp.data?.message || 'Inquiry reopened successfully.' });
      setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);

      await Promise.all([fetchInquiryData(), fetchFollowUps()]);

      setReopenOpen(false);
    } catch (err) {
      console.error('Error reopening inquiry:', err);
      const msg = err?.response?.data?.message || 'Failed to reopen inquiry.';
      setToast({ show: true, type: 'error', message: msg });
      setTimeout(() => setToast({ show: false, type: 'info', message: '' }), 4500);
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
    <div className="p-6 pt-20 space-y-4">
      {loading ? (
        <div>Loading data...</div>
      ) : (
        <>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
            #{inquiryData?.id} Inquiry:
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

          {/* Modern avg rating card + inline form */}
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4 max-w">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avg visual */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{avgRating ?? '-'}</div>
                    <div className="text-xs text-white/90">Avg</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Overall rating</div>
                  <div className="flex items-center gap-3 mt-1">
                    {renderStaticStars(avgRating || 0)}
                    <div className="text-sm text-gray-500">{ratingCount} review{ratingCount > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              {/* Inline rating form area (appears only for author who hasn't rated) */}
              <div className="ml-auto w-full sm:w-auto">
                {canUserRate() ? (
                  <div className="mt-3 sm:mt-0">
                    {!showRatingForm ? (
                      <button onClick={() => setShowRatingForm(true)} className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:brightness-105 transition">Add your rating</button>
                    ) : (
                      <div className="mt-2 bg-gray-50 p-4 rounded-md border">
                        <div className="mb-2 font-medium">How was the response?</div>
                        <div className="mb-3">{renderInteractiveStars(5)}</div>

                        <textarea
                          value={ratingFeedback}
                          onChange={(e) => setRatingFeedback(e.target.value)}
                          placeholder="Optional feedback (helps us improve)"
                          className="w-full p-3 border rounded-md mb-3 resize-none"
                          rows={3}
                        />

                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => { setShowRatingForm(false); setRatingScore(0); setRatingFeedback(''); }} className="px-3 py-1 border rounded-md">Cancel</button>
                          <button onClick={submitRating} disabled={submittingRating} className={`px-4 py-2 rounded-md text-white ${submittingRating ? 'bg-gray-400' : 'bg-[var(--color-secondary)]'}`}>
                            {submittingRating ? 'Sending...' : 'Send Rating'}
                          </button>
                        </div>

                        <div className="text-xs text-gray-400 mt-2">You can rate once. Your feedback is visible.</div>
                      </div>
                    )}
                  </div>
                ) : (
                  // if user is not allowed, show small hint if they already rated or not author
                  isAuthor() ? (
                    <div className="text-sm text-gray-500">You have already rated this inquiry.</div>
                  ) : null
                )}
              </div>
            </div>
          </div>

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

export default UserInquiryDetails;
