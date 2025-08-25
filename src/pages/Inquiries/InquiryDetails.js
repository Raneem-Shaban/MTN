import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../constants/constants';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import { FaUser, FaEnvelope, FaTag, FaClock, FaUserTie, FaArrowLeft } from 'react-icons/fa';

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

const InquiryDetails = () => {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInquiry = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/inquiries/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInquiry(res.data);
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        toast.error('Failed to load inquiry');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!inquiry) {
    return <div className="text-center mt-10 text-red-500">Inquiry not found.</div>;
  }

  const {
    title,
    body,
    response,
    closed_at,
    user,
    assignee_user,
    category,
    status,
  } = inquiry;

  const formatDate = (date) => {
  if (!date) return '—';

  const parsedDate = new Date(date);
  return isNaN(parsedDate) ? '—' : parsedDate.toLocaleString();
};

  const Card = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-100">
      <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{title}</h3>
      {children}
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
      <Icon className="text-gray-500 min-w-[20px]" />
      <p>
        <span className="font-semibold">{label}:</span>{' '}
        <span className="text-[var(--color-text-main)]">{value}</span>
      </p>
    </div>
  );

  const Avatar = ({ url, alt }) =>
    url ? (
      <img
        src={url}
        alt={alt}
        className="w-16 h-16 rounded-full object-cover border border-gray-300"
      />
    ) : (
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
        <FaUser size={24} />
      </div>
    );

  return (
    <div className="bg-[var(--color-background)] min-h-screen p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[var(--color-text-main)]">Inquiry Details</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Inquiry Info">
          <InfoItem icon={FaTag} label="Title" value={title} />
          <div>
            <p className="font-semibold">Body:</p>
            <p className="text-[var(--color-text-main)] whitespace-pre-wrap">{body}</p>
          </div>
          <div>
            <p className="font-semibold">Response:</p>
            <p className="text-[var(--color-text-main)]">{response || 'No response yet'}</p>
          </div>
          <InfoItem icon={FaClock} label="Closed At" value={formatDate(closed_at)} />
          <div>
            <p className="font-semibold">Status:</p>
            <StatusBadge value={status?.name} colorMap={ticketStatusColors} />
          </div>
        </Card>

        <Card title="User Info">
          <div className="flex items-center gap-4">
            <Avatar url={user?.img_url} alt={user?.name} />
            <div className="space-y-1">
              <InfoItem icon={FaUser} label="Name" value={user?.name} />
              <InfoItem icon={FaEnvelope} label="Email" value={user?.email} />
            </div>
          </div>
        </Card>

        <Card title="Assigned Trainer">
          <div className="flex items-center gap-4">
            <Avatar url={assignee_user?.img_url} alt={assignee_user?.name} />
            <div className="space-y-1">
              <InfoItem icon={FaUserTie} label="Name" value={assignee_user?.name} />
              <InfoItem icon={FaEnvelope} label="Email" value={assignee_user?.email} />
            </div>
          </div>
        </Card>

        <Card title="Category">
          <InfoItem icon={FaTag} label="Name" value={category?.name} />
          <div>
            <p className="font-semibold">Description:</p>
            <p className="text-[var(--color-text-main)]">{category?.description}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InquiryDetails;
