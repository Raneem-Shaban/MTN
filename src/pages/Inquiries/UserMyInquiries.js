import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterTabs from '../../components/common/filters/FilterTabs';
import DynamicTable from '../../components/common/tables/DynamicTable';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import Pagination from '../../components/common/pagination/Pagination';
import HighlightedText from '../../components/common/highlight/HighlightedText';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import { formatDate } from '../../../src/utils/utils';
import { API_BASE_URL } from "../../constants/constants";
import axios from "axios";
import { toast } from 'react-toastify';    

const itemsPerPage = 4;

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
};

// قص النص
const truncate = (text, maxLength = 20) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const UserMyInquiries = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener("sectionSearch", handleSearch);
    return () => window.removeEventListener("sectionSearch", handleSearch);
  }, []);

  // جلب بيانات الاستفسارات الخاصة بالمستخدم الحالي
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);

        // إذا كان هناك استعلام بحث نستخدم مسار البحث العام (أو يمكنك تعديل الـ API ليعالج البحث محلياً)
        let url = searchQuery
          ? `${API_BASE_URL}/api/inquiries/myinquiries?query=${encodeURIComponent(searchQuery)}`
          : `${API_BASE_URL}/api/inquiries/myinquiries`;

        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const inquiries = Array.isArray(res.data) ? res.data : [];

        const formatted = inquiries.map((inq) => {
          return {
            id: inq.id,
            title: truncate(inq.title || inq.inquiry?.title || '', 25),
            body: truncate(inq.body || inq.inquiry?.body || '', 40),
            status: inq.status?.name || inq.status || 'Unknown',
            trainer: truncate(inq.assignee_user?.name || inq.trainer || 'Unassigned', 20),
            category: truncate((inq.category && (inq.category.name || inq.category)) || 'N/A', 15),
            user: truncate(inq.user?.name || (inq.user_id ? `#${inq.user_id}` : 'Unknown'), 20),
            createdAt: formatDate(inq.created_at || inq.inquiry?.created_at || inq.createdAt),
          };
        });

        setData(formatted);

        if (searchQuery && formatted.length === 0) {
          toast.info("No matching results found");
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err.response?.data || err.message);
        toast.error('Failed to load inquiries.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [searchQuery]);  

  // زر Show
  const handleShowClick = (id) => {
    navigate(`/details/${id}`);
  };

  // تصفية البيانات حسب التبويب
  const filteredData = useMemo(() => {
    return selectedTab === 'All Inquiries'
      ? data
      : data.filter((item) => item.status === selectedTab);
  }, [selectedTab, data]);

  // تقسيم الصفحات
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  // أعمدة الجدول
  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Trainer',
      accessor: 'trainer',
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    {
      header: 'Sender',
      accessor: 'user',
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    {
      header: 'Title',
      accessor: 'title',
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    {
      header: 'Body',
      accessor: 'body',
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => (
        <StatusBadge value={value} colorMap={ticketStatusColors} />
      ),
    },
    { header: 'Created At', accessor: 'createdAt' },
    {
      header: 'Show',
      accessor: 'show',
      cell: (_, row) => (
        <OutlineButton
          title="Show"
          color="primary"
          onClick={() => handleShowClick(row.id)}
        />
      ),
    },
  ];

  return (
    <div className="p-6 pt-20">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        My Inquiries
      </h1>

      <FilterTabs
        tabs={['All Inquiries', 'opened', 'closed', 'pending', 'reopened']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

      <div className="relative w-full">
        <DynamicTable columns={columns} data={paginatedData} loading={loading} />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
};

export default UserMyInquiries;
