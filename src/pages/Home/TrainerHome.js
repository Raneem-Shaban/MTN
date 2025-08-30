import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import DraggableColumn from '../../components/trainerDraggableColumns/DraggableColumn';
import AnswerModal from '../../components/modals/TrainerAnswerQueryModal';
import { FaQuestion, FaReply, FaStar, FaHourglassHalf } from 'react-icons/fa';
import StatCard from '../../components/common/cards/StatCard';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';

export default function TrainerHome() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInquiry, setModalInquiry] = useState(null)
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate()

  const ticketStatusColors = {
    opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
    closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
    pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
    reopened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  };

  const statusIdMap = { 1: 'opened', 2: 'pending', 3: 'closed', 4: 'reopened' };

  const normalizeInquiry = (item) => {
    let statusStr = '';
    if (item.status) {
      if (typeof item.status === 'object') statusStr = (item.status.name || '').toString();
      else statusStr = item.status.toString();
    } else if (item.cur_status) {
      if (typeof item.cur_status === 'object') statusStr = (item.cur_status.name || '').toString();
      else statusStr = item.cur_status.toString();
    } else if (typeof item.cur_status_id !== 'undefined') {
      statusStr = (statusIdMap[item.cur_status_id] || '').toString();
    }
    statusStr = (statusStr || 'opened').toString().trim().toLowerCase();

    const categoryName = item.category && typeof item.category === 'object'
      ? (item.category.name || 'Uncategorized')
      : (item.category || item.category_name || 'Uncategorized');

    const senderName = item.user && typeof item.user === 'object'
      ? (item.user.name || `User ${item.user.id || item.user_id || ''}`)
      : (item.sender || `User ${item.user_id || ''}`);

    const title = item.title || item.subject || `Inquiry #${item.id}`;
    const body = item.body || item.description || '';

    let attachments = [];
    if (Array.isArray(item.attachments)) attachments = item.attachments;
    else if (typeof item.attachments === 'string' && item.attachments.length) attachments = [item.attachments];
    else if (Array.isArray(item.files)) attachments = item.files;

    let date = '';
    const rawDate = item.created_at || item.date || item.updated_at || item.createdAt;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!Number.isNaN(d.getTime())) date = d.toLocaleDateString('en-GB');
      } catch (e) {
        date = String(rawDate).slice(0, 10);
      }
    }

    return {
      id: item.id,
      title,
      body,
      status: statusStr,
      category: categoryName,
      sender: senderName,
      date,
      attachments,
      _raw: item,
    };
  };

  useEffect(() => {
    let mounted = true;
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/inquiries/myinquiries`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Raw inquiries response:", res.data);

        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        const normalized = data.map(normalizeInquiry);

        if (mounted) setInquiries(normalized);
      } catch (err) {
        console.error('Failed to fetch inquiries, using fallback fake data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInquiries();
    const fetchStatistics = async () => {
      const token = localStorage.getItem('token');
      setLoadingStats(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/inquiries/statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats({
          opened_inquiries: res.data.opened_inquiries,
          pending_inquiries: res.data.pending_inquiries,
          closed_inquiries: res.data.closed_inquiries,
          average_handling_time: res.data.average_handling_time,
          average_ratings: res.data.average_ratings,
        });
      } catch (err) {
        toast.error('فشل تحميل الإحصائيات');
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();

    return () => { mounted = false; };
  }, []);

  const transitions = {
    opened: { pending: { requiresAnswer: true }, closed: { requiresAnswer: true }, reopened: { allowed: false } },
    pending: { closed: { requiresAnswer: true }, opened: { requiresAnswer: false }, reopened: { allowed: false }, opened: { allowed: false } },
    closed: { opened: { requiresAnswer: false, allowed: false }, pending: { requiresAnswer: false, allowed: false }, reopened: { allowed: false } },
    reopened: { pending: { requiresAnswer: true }, closed: { requiresAnswer: true }, opened: { allowed: false } },
  };


  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    // find by string-safe comparison
    const movedInquiry = inquiries.find(i => String(i.id) === String(draggableId));
    if (!movedInquiry) {
      toast.error('Item not found');
      return;
    }

    const sourceStatus = movedInquiry.status;
    const targetStatus = destination.droppableId;
    const rule = transitions[sourceStatus]?.[targetStatus];

    if (!rule) {
      toast.error('This transition is not allowed');
      return;
    }

    if (rule.allowed === false) {
      toast.error('You cannot move inquiry to this column');
      return;
    }

    if (rule.requiresAnswer) {
      setModalInquiry({ ...movedInquiry, targetStatus });
      return;
    }

    // update locally (use string-safe id comparison)
    setInquiries(prev => prev.map(i => String(i.id) === String(movedInquiry.id) ? { ...i, status: targetStatus } : i));
  };

  const handleInquiryClick = (inquiry) => {
    if (!inquiry || !inquiry.id) return;
    navigate(`/details/${inquiry.id}`);
  };

  // داخل TrainerHome component
  const handleModalSubmit = async (payload = {}) => {
    // payload قد يحتوي: { type: 'reply'|'followup', answer, files, inquiry, sectionId, response }
    if (!modalInquiry && !payload.inquiry) {
      return Promise.reject(new Error('No modal inquiry'));
    }

    // use modalInquiry from state as fallback
    const workingInquiry = payload.inquiry || modalInquiry;
    const { id } = workingInquiry;
    const targetStatus = modalInquiry?.targetStatus || payload.targetStatus;

    const prevInquiries = inquiries; // snapshot for rollback

    try {
      if (payload.type === 'followup') {
        // optimistic: set status to pending locally
        setInquiries(prev => prev.map(i => String(i.id) === String(id) ? { ...i, status: 'pending' } : i));
        // close modal immediately
        setModalInquiry(null);

        // build form
        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('inquiry_id', id);
        // backend may expect status or not — we set to 2 (pending) if needed
        form.append('status', 2);
        if (payload.sectionId) form.append('section_id', payload.sectionId);
        if (payload.response) form.append('response', payload.response);
        (payload.files || []).forEach((f) => form.append('attachments[]', f, f.name));

        await axios.post(`${API_BASE_URL}/api/followups`, form, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data',
          },
        });

        toast.success('Follow-up created successfully.');
        return Promise.resolve();
      }

      // default -> reply
      if (payload.type === 'reply' || !payload.type) {
        // optimistic update: attach answer and set status to targetStatus if provided
        const optimistic = prevInquiries.map(i =>
          String(i.id) === String(id)
            ? { ...i, status: targetStatus || i.status, answer: payload.answer || payload.response || i.answer }
            : i
        );
        setInquiries(optimistic);
        setModalInquiry(null);

        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('inquiry_id', id);
        form.append('response', payload.answer || payload.response || '');
        // map targetStatus name -> id if provided
        const statusNameToId = { opened: 1, pending: 2, closed: 3, reopened: 4 };
        if (targetStatus && statusNameToId[targetStatus]) form.append('status_id', statusNameToId[targetStatus]);
        (payload.files || []).forEach((f) => form.append('attachments[]', f, f.name));

        await axios.post(`${API_BASE_URL}/api/inquiries/reply`, form, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data',
          },
        });

        toast.success('Answer saved successfully.');
        return Promise.resolve();
      }

      // unknown type
      throw new Error('Unsupported action type');
    } catch (err) {
      console.error('Failed to persist action:', err);
      // rollback
      setInquiries(prevInquiries);
      // If modal was closed optimistically, you may want to re-open it or show an error
      const msg = err?.response?.data?.message || err?.message || 'Failed to save. Change reverted.';
      toast.error(msg);
      return Promise.reject(err);
    }
  };


  const handleModalCancel = () => setModalInquiry(null);

  const grouped = {
    opened: inquiries.filter(i => i.status === 'opened'),
    pending: inquiries.filter(i => i.status === 'pending'),
    closed: inquiries.filter(i => i.status === 'closed'),
    reopened: inquiries.filter(i => i.status === 'reopened'),
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  const statsList = [
    {
      title: 'Open Inquiries',
      count: stats.opened_inquiries,
      icon: FaQuestion,
      iconColorVar: '--color-secondary',
    },
    {
      title: 'Pending Inquiries',
      count: stats.pending_inquiries,
      icon: FaHourglassHalf,
      iconColorVar: '--color-primary',
    },
    {
      title: 'Closed Inquiries',
      count: stats.closed_inquiries,
      icon: FaQuestion,
      iconColorVar: '--color-danger',
    },
    {
      title: 'Response Rate (hrs)',
      count: stats.average_handling_time,
      icon: FaReply,
      iconColorVar: '--color-secondary',
    },
    {
      title: 'Average Rating',
      count: stats.average_ratings,
      icon: FaStar,
      iconColorVar: '--color-primary',
    },
  ];

  return (
    <div className="p-6 pt-20">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>Home</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {loadingStats
          ? Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg bg-[var(--color-bg-secondary)] p-4 h-24 flex flex-col justify-center"
            >
              <div className="h-4 bg-[var(--color-border)] rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-[var(--color-border)] rounded w-1/3"></div>
            </div>
          ))
          : statsList.map((item, idx) => (
            <StatCard
              key={idx}
              title={item.title}
              count={item.count}
              icon={item.icon}
              iconColorVar={item.iconColorVar}
            />
          ))}
      </div>

      <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text-main)' }}>My Inquiries</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          <DraggableColumn status="Opened" inquiries={grouped.opened} columnId="opened" ticketStatusColors={ticketStatusColors} onInquiryClick={handleInquiryClick} />
          <DraggableColumn status="Pending" inquiries={grouped.pending} columnId="pending" ticketStatusColors={ticketStatusColors} onInquiryClick={handleInquiryClick} />
          <DraggableColumn status="Closed" inquiries={grouped.closed} columnId="closed" ticketStatusColors={ticketStatusColors} onInquiryClick={handleInquiryClick} />
          <DraggableColumn status="Reopened" inquiries={grouped.reopened} columnId="reopened" ticketStatusColors={ticketStatusColors} onInquiryClick={handleInquiryClick} />
        </div>
      </DragDropContext>

      {/* Modal overlay */}
      {modalInquiry && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex justify-center items-center"
          onClick={handleModalCancel}
        >
          {/* Stop clicks inside modal from closing */}
          <div onClick={(e) => e.stopPropagation()}>
            <AnswerModal
              inquiry={modalInquiry}
              onSubmit={handleModalSubmit}
              onCancel={handleModalCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
