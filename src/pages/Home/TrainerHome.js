import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import DraggableColumn from '../../components/trainerDraggableColumns/DraggableColumn';
import AnswerModal from '../../components/modals/TrainerAnswerQueryModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';

const TrainerHome = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInquiry, setModalInquiry] = useState(null);

  const ticketStatusColors = {
    opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
    closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
    pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
    reopened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  };

  // Fake data مع category
  const fakeInquiries = [
    {
      id: 201,
      title: 'Overcharged on airtime',
      body: 'I recharged ₦1000 but only ₦800 was credited to my account.',
      status: 'opened',
      sender: 'Chinedu Okafor',
      date: '2025-08-21',
      attachments: ['recharge_receipt.png'],
      category: 'Billing'
    },
    {
      id: 202,
      title: 'Poor network in my area',
      body: 'Since last week, MTN signal in Lekki Phase 1 has been very weak, I can barely make calls.',
      status: 'pending',
      sender: 'Amina Bello',
      date: '2025-08-20',
      attachments: [],
      category: 'Network'
    },
    {
      id: 203,
      title: 'Data bundle not activating',
      body: 'I purchased the 10GB data plan but it has not been activated on my line.',
      status: 'reopened',
      sender: 'Samuel Johnson',
      date: '2025-08-19',
      attachments: ['transaction_sms.jpg'],
      category: 'Data'
    },
    {
      id: 204,
      title: 'Request for eSIM activation',
      body: 'I bought a new phone that supports eSIM and I want to migrate my MTN line.',
      status: 'pending',
      sender: 'Ngozi Umeh',
      date: '2025-08-18',
      attachments: [],
      category: 'SIM'
    },
    {
      id: 205,
      title: 'Wrong tariff plan',
      body: 'I was moved to a new tariff plan without my consent. Please switch me back to Pulse.',
      status: 'closed',
      sender: 'Peter Adeyemi',
      date: '2025-08-16',
      attachments: [],
      category: 'Tariff'
    },
    {
      id: 206,
      title: 'International roaming not working',
      body: 'I travelled to the UK and my MTN SIM is not connecting to any network.',
      status: 'opened',
      sender: 'Fatima Musa',
      date: '2025-08-15',
      attachments: ['screenshot_network_error.png'],
      category: 'Roaming'
    },
    {
      id: 207,
      title: 'Blocked SIM card',
      body: 'My SIM got blocked after I entered the wrong PUK code multiple times.',
      status: 'closed',
      sender: 'Tunde Balogun',
      date: '2025-08-13',
      attachments: [],
      category: 'SIM'
    },
    {
      id: 208,
      title: 'Mobile money transaction failed',
      body: 'I tried sending ₦5000 using MoMo but the recipient never got it while I was debited.',
      status: 'pending',
      sender: 'Grace Nwankwo',
      date: '2025-08-12',
      attachments: ['momo_receipt.pdf'],
      category: 'Mobile Money'
    },
    {
      id: 209,
      title: 'Caller tunes deactivation request',
      body: 'I keep getting charged for caller tunes I did not subscribe to.',
      status: 'opened',
      sender: 'Ibrahim Lawal',
      date: '2025-08-10',
      attachments: [],
      category: 'VAS'
    },
    {
      id: 210,
      title: 'SIM swap request',
      body: 'I lost my phone and I need to perform a SIM swap for my MTN number.',
      status: 'closed',
      sender: 'Blessing Okon',
      date: '2025-08-08',
      attachments: ['id_card.jpg'],
      category: 'SIM'
    },
  ];

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/inquiries`, { headers: { Authorization: `Bearer ${token}` } });
        setInquiries(res.data);
      } catch (err) {
        console.warn('API failed, using fake data', err);
        setInquiries(fakeInquiries);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const transitions = {
    opened: {
      pending: { requiresAnswer: true },
      closed: { requiresAnswer: true },
      reopened: { allowed: false },
    },
    pending: {
      closed: { requiresAnswer: true },
      opened: { requiresAnswer: false },
      reopened: { allowed: false },
    },
    closed: {
      opened: { requiresAnswer: false },
      pending: { requiresAnswer: false },
      reopened: { allowed: false },
    },
    reopened: {
      pending: { requiresAnswer: true },
      closed: { requiresAnswer: true },
      opened: { allowed: false },
    },
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const movedInquiry = inquiries.find(i => String(i.id) === draggableId);
    if (!movedInquiry) return;

    const sourceStatus = movedInquiry.status;
    const targetStatus = destination.droppableId;

    const rule = transitions[sourceStatus]?.[targetStatus];
    if (!rule) {
      toast.error("This transition is not allowed");
      return;
    }

    if (rule.allowed === false) {
      toast.error("You cannot move inquiry to this column");
      return;
    }

    if (rule.requiresAnswer) {
      setModalInquiry({ ...movedInquiry, targetStatus });
      return;
    }

    setInquiries(prev =>
      prev.map(i => i.id === movedInquiry.id ? { ...i, status: targetStatus } : i)
    );
  };

  const handleInquiryClick = (inquiry) => {
    setModalInquiry(inquiry);
  };


  const handleModalSubmit = (answer) => {
    const { id, targetStatus } = modalInquiry;
    setInquiries(prev =>
      prev.map(i =>
        i.id === id ? { ...i, status: targetStatus, answer } : i
      )
    );
    setModalInquiry(null);
  };

  const handleModalCancel = () => setModalInquiry(null);

  const grouped = {
    opened: inquiries.filter(i => i.status === 'opened'),
    pending: inquiries.filter(i => i.status === 'pending'),
    closed: inquiries.filter(i => i.status === 'closed'),
    reopened: inquiries.filter(i => i.status === 'reopened'),
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>Home</h1>
      <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text-main)' }}>My Inquiries</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          <DraggableColumn
            status="Opened"
            inquiries={grouped.opened}
            columnId="opened"
            ticketStatusColors={ticketStatusColors}
            onInquiryClick={handleInquiryClick}
          />
          <DraggableColumn
            status="Pending"
            inquiries={grouped.pending}
            columnId="pending"
            ticketStatusColors={ticketStatusColors}
            onInquiryClick={handleInquiryClick}
          />
          <DraggableColumn
            status="Closed"
            inquiries={grouped.closed}
            columnId="closed"
            ticketStatusColors={ticketStatusColors}
            onInquiryClick={handleInquiryClick}
          />
          <DraggableColumn
            status="Reopened"
            inquiries={grouped.reopened}
            columnId="reopened"
            ticketStatusColors={ticketStatusColors}
            onInquiryClick={handleInquiryClick}
          />
        </div>
      </DragDropContext>

      {modalInquiry && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
          onClick={handleModalCancel}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-[600px] relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal on click inside
          >
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
};

export default TrainerHome;
