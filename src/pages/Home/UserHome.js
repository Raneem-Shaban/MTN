import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaReply, FaQuestion } from 'react-icons/fa';
import StatCard from '../../components/common/cards/StatCard';
import FilterTabs from '../../components/common/filters/FilterTabs';
import DynamicTable from '../../components/common/tables/DynamicTable';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import Pagination from '../../components/common/pagination/Pagination';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import FavoriteButton from '../../components/common/buttons/FavoriteButton';
import FloatingActionButton from '../../components/common/buttons/FloatingActionButton';

const itemsPerPage = 7;

const dummyData = [
  {
    id: '01',
    title: 'هل يتم تفعيل..',
    status: 'Open',
    trainer: 'Raneem',
    category: 'ADS',
    isFavorite: false,
  },
  {
    id: '02',
    title: 'هل يتم تفعيل..',
    status: 'Closed',
    trainer: 'Nour',
    category: 'MTN Speed',
    isFavorite: true,
  },
  {
    id: '03',
    title: 'هل يتم تفعيل..',
    status: 'Pending',
    trainer: 'Mhd',
    category: 'TV',
    isFavorite: false,
  },
];

const ticketStatusColors = {
  Open: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  Closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  Pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

const UserHome = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(dummyData); // بدلًا من dummy ثابت
  const navigate = useNavigate();

  const handleShowClick = (id) => {
    navigate(`/details/${id}`);
  };

  const toggleFavorite = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const filteredData =
    selectedTab === 'All Inquiries'
      ? data
      : data.filter((item) => item.status === selectedTab);

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
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => <StatusBadge value={value} colorMap={ticketStatusColors} />,
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
          onToggle={() => toggleFavorite(row.id)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        User Home
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Open answered" count={12750} icon={FaQuestion} iconColorVar="--color-primary" />
        <StatCard title="Closed answered" count={5600} icon={FaQuestion} iconColorVar="--color-secondary" />
        <StatCard title="Response rate" count={3460} icon={FaReply} iconColorVar="--color-danger" />
        <StatCard title="Average rating" count={7920} icon={FaStar} iconColorVar="--color-primary" />
      </div>

      <FilterTabs
        tabs={['All Inquiries', 'Open', 'Closed', 'Pending']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

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

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => navigate('/add')}
        label="Add Inquiry"
      />
    </div>
  );
};

export default UserHome;
