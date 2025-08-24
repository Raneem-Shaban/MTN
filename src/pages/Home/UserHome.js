import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterTabs from '../../components/common/filters/FilterTabs';
import DynamicTable from '../../components/common/tables/DynamicTable';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import Pagination from '../../components/common/pagination/Pagination';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import FavoriteButton from '../../components/common/buttons/FavoriteButton';
import FloatingActionButton from '../../components/common/buttons/FloatingActionButton';
import { formatDate } from '../../../src/utils/utils';
import { API_BASE_URL } from "../../constants/constants";
import axios from "axios";
import Skeleton from 'react-loading-skeleton'; // استيراد مكتبة Skeleton

const itemsPerPage = 4;

const ticketStatusColors = {
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
};

// دالة لتقصير النصوص
const truncate = (text, maxLength = 20) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const UserHome = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // جلب الاستفسارات
        const res = await axios.get(`${API_BASE_URL}/api/inquiries`);
        const inquiries = Array.isArray(res.data) ? res.data : [];
        console.log("✅ API Response:", inquiries);

        // جلب المفضلة الخاصة بالمستخدم
        const favRes = await axios.get(`${API_BASE_URL}/api/myFavourites`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFavourites(favRes.data); // تحديث المفضلات

        const formatted = inquiries.map((inq) => ({
          id: inq.inquiry.id,
          title: truncate(inq.inquiry.title, 25),
          body: truncate(inq.inquiry.body, 40),
          status: inq.status?.name || 'Unknown',
          trainer: truncate(inq.assigneeUser?.name || 'Unassigned', 20),
          category: truncate(inq.category?.name || 'N/A', 15),
          user: truncate(inq.user.name || 'Unknown', 20),
          createdAt: formatDate(inq.inquiry.created_at),
          isFavorite: favRes.data.some(fav => fav.inquiry_id === inq.inquiry.id), // تحقق من المفضلة
        }));

        console.log("📦 Formatted Data:", formatted);
        setData(formatted);
      } catch (err) {
        console.error("❌ Error fetching inquiries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // زر Show
  const handleShowClick = (id) => {
    console.log("👁 Show clicked for ID:", id);
    navigate(`/details/${id}`);
  };

  // Toggle Favorite
  const toggleFavorite = async (id, isFavorite) => {
    console.log("⭐ Toggle favorite for ID:", id);

    const requestBody = { inquiry_id: id };
    console.log("📬 Sending request body:", requestBody);

    const token = localStorage.getItem('token');
    try {
      let response;
      if (isFavorite) {
        // إذا كان مضاف للمفضلة نزيله
        response = await axios.delete(`${API_BASE_URL}/api/favourites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // إذا لم يكن مضاف للمفضلة نضيفه
        response = await axios.post(`${API_BASE_URL}/api/favourites`, requestBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      console.log("✅ API Response for Favourite:", response.data);

      // تحديث البيانات المحلية
      setData(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isFavorite: !isFavorite } : item
        )
      );
    } catch (err) {
      console.error("❌ Error favouriting inquiry:", err);
    }
  };

  // تصفية البيانات حسب التبويب
  const filteredData = useMemo(() => {
    const result = selectedTab === 'All Inquiries'
      ? data
      : data.filter((item) => item.status === selectedTab);

    console.log("🔎 Filtered Data:", result);
    return result;
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
    { header: 'Trainer', accessor: 'trainer' },
    { header: 'Category', accessor: 'category' },
    { header: 'Sender', accessor: 'user' },
    { header: 'Title', accessor: 'title' },
    { header: 'Body', accessor: 'body' },
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
    {
      header: 'Favorite',
      accessor: 'favorite',
      cell: (_, row) => (
        <FavoriteButton
          isFavorite={row.isFavorite}
          onToggle={() => toggleFavorite(row.id, row.isFavorite)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        User Home
      </h1>

      <FilterTabs
        tabs={['All Inquiries', 'opened', 'closed', 'pending', 'reopened']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

      <div className="relative w-full">
        {loading ? (
          <div>
            {/* عرض الخيالات أثناء التحميل */}
            <Skeleton count={5} height={40} />
          </div>
        ) : (
          <DynamicTable columns={columns} data={paginatedData} />
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          navigate('/add');
        }}
        label="Add Inquiry"
      />
    </div>
  );
};

export default UserHome;
