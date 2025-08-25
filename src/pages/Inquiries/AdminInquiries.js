import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown } from "react-icons/fi";
import FilterTabs from '../../components/common/filters/FilterTabs';
import DynamicTable from '../../components/common/tables/DynamicTable';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import Pagination from '../../components/common/pagination/Pagination';
import ReassignCell from '../../components/reassignCell/ReassignCell';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';

const itemsPerPage = 10;

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

const AdminInquiries = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trainers, setTrainers] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener("sectionSearch", handleSearch);
    return () => window.removeEventListener("sectionSearch", handleSearch);
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [selectedTab, searchQuery]);

  useEffect(() => {
    const fetchTrainers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/userRoles/3`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrainers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch trainers:", err);
      }
    };
    fetchTrainers();
  }, []);


  const fetchInquiries = async () => {
    const token = localStorage.getItem('token');
    const isTrashed = selectedTab === 'Trashed Inquiries';
    try {
      setLoading(true);
      let url = searchQuery
        ? `${API_BASE_URL}/api/inquiries/search?query=${searchQuery}`
        : isTrashed
          ? `${API_BASE_URL}/api/inquiries/indexOnlyTrashed`
          : `${API_BASE_URL}/api/inquiries`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setInquiries(data);

      if (searchQuery && data.length === 0) {
        toast.info('No matching results found');
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    // حذف مباشر من الواجهة فوراً
    setInquiries((prev) => prev.filter((inq) => {
      const inquiryId = inq.inquiry?.id || inq.id;
      return inquiryId !== id;
    }));

    try {
      await axios.delete(`${API_BASE_URL}/api/inquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Inquiry deleted successfully');
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      toast.error('Failed to delete the inquiry');

      // إذا فشل الحذف من السيرفر، استرجع العنصر
      fetchInquiries();
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
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Inquiry restored successfully');
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    } catch (err) {
      console.error('Failed to restore inquiry:', err);
      toast.error('Failed to restore the inquiry');
    }
  };

  const transformedData = Array.isArray(inquiries)
    ? inquiries.map((item) => {
      const inquiry = item.inquiry || item;

      const statusObj = item.status || inquiry.status || {};
      const assigneeObj = item.assigneeUser || inquiry.assignee_user || {};
      const categoryObj = item.category || inquiry.category || {};

      return {
        id: inquiry.id || item.id || '—',
        title: inquiry.title || item.title || '—',
        body: inquiry.body || item.body || '—',
        response: inquiry.response || item.response || '—',
        status: statusObj.name || 'Unknown',
        trainer: assigneeObj.name || item.trainer || 'Unknown',
        category: categoryObj.name || item.category?.name || 'Unknown',
      };
    })
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

    {
      header: 'Details',
      accessor: 'details',
      cell: (_, row) => (
        <OutlineButton
          title="Show Details"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/details/${row.id}`);
          }}
        />
      ),
    },

    ...(selectedTab !== 'Trashed Inquiries'
      ? [
        {
          header: 'Reassign',
          accessor: 'reassign',
          cell: (_, row) => (
            <ReassignCell
              row={row}
              trainers={trainers}
              onUpdateTrainer={(trainerName) => {
                setInquiries(prev =>
                  prev.map(inq => {
                    const inquiryId = inq.inquiry?.id || inq.id;
                    if (inquiryId === row.id) {
                      return {
                        ...inq,
                        assigneeUser: { ...inq.assigneeUser, name: trainerName },
                        assignee_user: { ...inq.assignee_user, name: trainerName },
                        trainer: trainerName,
                      };
                    }
                    return inq;
                  })
                );
              }}
            />
          ),
        }

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
            selectedTab === 'Trashed Inquiries'
              ? handleRestore(row.id)
              : openDeleteModal(row.id);
          }}
        />
      ),
    },
  ];


  // if (loading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center w-full">
  //       <div className="loader"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Inquiries Management
      </h1>

      <FilterTabs
        tabs={['All Inquiries', 'opened', 'closed', 'pending', 'reopened', 'Trashed Inquiries']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />
      <div className="flex flex-col h-[calc(100vh-120px)] relative">

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="loader"></div>
          </div>
        )}
        <div className="relative w-full">
          <DynamicTable
            columns={columns}
            data={paginatedData}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
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

export default AdminInquiries;
