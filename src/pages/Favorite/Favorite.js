import React, { useState, useEffect } from 'react';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import FilterTabs from '../../components/common/filters/FilterTabs';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { formatDate } from '../../../src/utils/utils';

const itemsPerPage = 5;

const ticketStatusColors = {
  Open: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  Closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  Pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

// 🔹 دالة لتقصير النصوص
const truncate = (text, maxLength = 20) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const Favorite = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);

  // 🔹 جلب البيانات المفضلة
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      console.log("🚀 Token: ", token); // طباعة التوكن للتحقق

      try {
        const response = await axios.get(`${API_BASE_URL}/api/myFavourites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📝 API Response: ", response.data); // طباعة البيانات المستلمة من الـ API

        const favorites = Array.isArray(response.data) ? response.data : [];

        const formattedFavorites = favorites.map((inq) => ({
          id: inq.inquiry.id,
          title: truncate(inq.inquiry.title, 25),
          body: truncate(inq.inquiry.body, 40),
          status: inq.status?.name || 'Unknown',
          trainer: truncate(inq.assigneeUser?.name || 'Unassigned', 20),
          category: truncate(inq.category?.name || 'N/A', 15),
          user: truncate(inq.user.name || 'Unknown', 20),
          createdAt: formatDate(inq.inquiry.created_at),
          isFavorite: true,
        }));

        console.log("🧩 Formatted Favorites: ", formattedFavorites); // طباعة البيانات بعد التنسيق

        setData(formattedFavorites);
      } catch (err) {
        console.error("❌ Error fetching favorites:", err);
      }
    };

    fetchFavorites();
  }, []);

  // 🔹 التعامل مع الفلاتر
  const filteredData =
    selectedTab === 'All Inquiries'
      ? data.filter((item) => item.isFavorite)
      : data.filter((item) => item.isFavorite && item.status === selectedTab);

  console.log("🔍 Filtered Data: ", filteredData); // طباعة البيانات المفلترة

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  // 🔹 إزالة من المفضلة
  const removeFromFavorite = (id) => {
    console.log(`🚫 Removing from favorites: ID ${id}`); // طباعة ID عند إزالة من المفضلة
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: false } : item
      )
    );
  };

  // 🔹 أعمدة الجدول
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
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
      header: 'Show Details',
      accessor: 'show',
      cell: (_, row) => (
        <OutlineButton
          title="Show"
          color="primary"
          onClick={() => console.log('Show details for:', row.id)}
        />
      ),
    },
    {
      header: 'Remove from favourite',
      accessor: 'remove',
      cell: (_, row) => (
        <OutlineButton
          title="Remove"
          color="danger"
          onClick={() => removeFromFavorite(row.id)}
        />
      ),
    },
  ];

  return (
    <div className="px-6 pt-6 overflow-hidden" dir="ltr">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
        Favorite Inquiries
      </h1>

      <FilterTabs
        tabs={['All Inquiries', 'Open', 'Closed', 'Pending']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

      <DynamicTable
        columns={columns}
        data={paginatedData}
        rowClassName="hover:bg-[var(--color-white)] cursor-pointer transition duration-200 rounded"
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Favorite;
