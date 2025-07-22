import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaReply, FaQuestion } from 'react-icons/fa';
import { FiChevronDown } from "react-icons/fi";
import StatCard from '../../components/common/cards/StatCard';
import FilterTabs from '../../components/common/filters/FilterTabs';
import DynamicTable from '../../components/common/tables/DynamicTable';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import Pagination from '../../components/common/pagination/Pagination';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';

const itemsPerPage = 7;

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

const HomePage = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    opened_inquiries: 0,
    closed_inquiries: 0,
    average_handling_time: 0,
    average_ratings: 0,
  });

  const navigate = useNavigate();

  
  useEffect(() => {
  const handleSearch = (e) => {
    setSearchQuery(e.detail);
  };

  window.addEventListener("sectionSearch", handleSearch);

  return () => {
    window.removeEventListener("sectionSearch", handleSearch);
  };
}, []);


 useEffect(() => {
  fetchInquiries();
}, [selectedTab, searchQuery]);


  const fetchInquiries = async () => {
  const token = localStorage.getItem('token');
  const isTrashed = selectedTab === 'Trashed Inquiries';

  try {
    setLoading(true);

    let url = '';
    if (searchQuery) {
      url = `${API_BASE_URL}/api/inquiries/search?query=${searchQuery}`;
    } else {
      url = isTrashed
        ? `${API_BASE_URL}/api/inquiries/indexOnlyTrashed`
        : `${API_BASE_URL}/api/inquiries`;
    }

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

   let data = Array.isArray(res.data) ? res.data : [];
setInquiries(data);

// ✅ عرض التوست بعد التحقق من البيانات، سواء كانت مصفوفة أم لا
if (searchQuery && data.length === 0) {
  toast.info('No matching results found');
}
  } catch (err) {
    console.error('Failed to fetch inquiries:', err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoadingStats(true);
        const res = await axios.get(`${API_BASE_URL}/api/inquiries/Statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/api/inquiries/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      toast.success('Inquiry deleted successfully');
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      toast.error('Failed to delete the inquiry');
    } finally {
      setShowDeleteModal(false);
      setSelectedId(null);
    }
  };

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      handleDelete(selectedId);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const handleRestore = async (id) => {
  const token = localStorage.getItem('token');
  try {
    await axios.get(`${API_BASE_URL}/api/inquiries/restore/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success('Inquiry restored successfully');
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  } catch (err) {
    console.error('Failed to restore inquiry:', err);
    toast.error('Failed to restore the inquiry');
  }
};

  const transformedData = Array.isArray(inquiries)
  ? inquiries.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      response: item.response || '—',
      status: item.status?.name || 'Unknown',
      trainer: item.assignee_user?.name || 'Unknown',
      category: item.category?.name || 'Unknown',
    }))
  : [];

  const filteredData =
  selectedTab === 'All Inquiries' || selectedTab === 'Trashed Inquiries'
    ? transformedData
    : transformedData.filter(
        (item) => item.status.toLowerCase() === selectedTab.toLowerCase()
      );


  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  const columns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Title', accessor: 'title' },
  { header: 'Body', accessor: 'body' },
  { header: 'Response', accessor: 'response' },
  {
    header: 'Status',
    accessor: 'status',
    cell: (value) => (
      <StatusBadge value={value} colorMap={ticketStatusColors} />
    ),
  },
  { header: 'Trainer Name', accessor: 'trainer' },
  { header: 'Category', accessor: 'category' },
  // ✅ فقط أضف هذا الشرط لمنع ظهور عمود "Reassign" عندما يكون التبويب Trashed
  ...(selectedTab !== 'Trashed Inquiries'
    ? [
        {
          header: 'Reassign',
          accessor: 'reassign',
          cell: (_, row) => {
            const isClosed = row.status.toLowerCase() === 'closed';
            return (
              <div className="relative w-full max-w-[150px]">
                <select
                  disabled={isClosed}
                  className={`appearance-none min-w-[110px] w-full pl-4 py-1.5 pr-8 rounded-full text-sm border border-[var(--color-border)] text-[var(--color-text-main)] bg-[var(--color-bg)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-primary)] ${isClosed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                >
                  <option>Reassign</option>
                  <option>Trainer 1</option>
                  <option>Trainer 2</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-main)]">
                  <FiChevronDown className="w-4 h-4" />
                </div>
              </div>
            );
          },
        },
      ]
    : []),
  {
    header: selectedTab === 'Trashed Inquiries' ? 'Restore' : 'Delete',
    accessor: 'delete',
    cell: (_, row) => (
      <OutlineButton
        title={selectedTab === 'Trashed Inquiries' ? 'Restore' : 'Move to trash'}
        color={selectedTab === 'Trashed Inquiries' ? 'success' : 'danger'}
        onClick={(e) => {
          e.stopPropagation();
          if (selectedTab === 'Trashed Inquiries') {
            handleRestore(row.id);
          } else {
            openDeleteModal(row.id);
          }
        }}
      />
    ),
  },
];

  const handleRowClick = (row) => {
    navigate(`/details/${row.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center w-full">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Home
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg bg-[var(--color-bg-secondary)] p-4 h-24 flex flex-col justify-center"
            >
              <div className="h-4 bg-[var(--color-border)] rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-[var(--color-border)] rounded w-1/3"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard title="Open answered" count={stats.opened_inquiries} icon={FaQuestion} iconColorVar="--color-primary" />
            <StatCard title="Closed answered" count={stats.closed_inquiries} icon={FaQuestion} iconColorVar="--color-secondary" />
            <StatCard title="Response rate" count={stats.average_handling_time} icon={FaReply} iconColorVar="--color-danger" />
            <StatCard title="Average rating" count={stats.average_ratings} icon={FaStar} iconColorVar="--color-primary" />
          </>
        )}
      </div>

      <FilterTabs
        tabs={['All Inquiries', 'opened', 'closed', 'pending', 'reopened', 'Trashed Inquiries']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

      <div className="relative w-full">
        <DynamicTable
          columns={columns}
          data={paginatedData}
          onRowClick={handleRowClick}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}


    </div>
  );
};

export default HomePage;
