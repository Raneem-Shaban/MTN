import React, { useState, useEffect } from 'react';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import FilterTabs from '../../components/common/filters/FilterTabs';
import { StatusBadge } from '../../components/common/badges/StatusBadge';
import OutlineButton from '../../components/common/buttons/OutlineButton';

const itemsPerPage = 5;

const dummyData = [
  { id: '01', title: 'طلب تفعيل خدمة الإنترنت', status: 'Open', trainer: 'Raneem', category: 'Internet', isFavorite: true },
  { id: '02', title: 'مشكلة في سرعة النت', status: 'Closed', trainer: 'Nour', category: 'MTN Speed', isFavorite: true },
  { id: '03', title: 'كيفية إعادة ضبط الراوتر', status: 'Pending', trainer: 'Mhd', category: 'Router', isFavorite: true },
  { id: '04', title: 'سؤال حول الفاتورة', status: 'Open', trainer: 'Salma', category: 'Billing', isFavorite: true },
  { id: '05', title: 'إلغاء خدمة الإعلانات', status: 'Closed', trainer: 'Ahmad', category: 'ADS', isFavorite: true },
  { id: '06', title: 'مشكلة في الكابل الضوئي', status: 'Pending', trainer: 'Lina', category: 'Fiber', isFavorite: true },
  { id: '07', title: 'هل يتم استرجاع البيانات؟', status: 'Open', trainer: 'Omar', category: 'Data Recovery', isFavorite: true },
  { id: '08', title: 'مشاكل في بث التلفاز', status: 'Closed', trainer: 'Yasmin', category: 'TV', isFavorite: true },
  { id: '09', title: 'طلب الاشتراك في باقة جديدة', status: 'Pending', trainer: 'Hassan', category: 'Packages', isFavorite: true },
  { id: '10', title: 'تغيير كلمة مرور الحساب', status: 'Open', trainer: 'Tala', category: 'Account', isFavorite: true },
  { id: '11', title: 'مشكلة في تسجيل الدخول', status: 'Closed', trainer: 'Rami', category: 'Account', isFavorite: true },
  { id: '12', title: 'طلب معلومات إضافية', status: 'Pending', trainer: 'Mona', category: 'Support', isFavorite: true },
  { id: '13', title: 'إلغاء خدمة سابقة', status: 'Open', trainer: 'Khaled', category: 'Services', isFavorite: true },
  { id: '14', title: 'الاستفسار عن عروض الصيف', status: 'Closed', trainer: 'Sami', category: 'Offers', isFavorite: true },
  { id: '15', title: 'كيفية استبدال الجهاز', status: 'Pending', trainer: 'Dana', category: 'Devices', isFavorite: true },
];


const ticketStatusColors = {
  Open: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  Closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  Pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
};

const Favorite = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(dummyData);

  const handleShowClick = (id) => {
    console.log('Show details for:', id);
  };

  const removeFromFavorite = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: false } : item
      )
    );
  };

  const filteredData =
    selectedTab === 'All Inquiries'
      ? data.filter((item) => item.isFavorite)
      : data.filter((item) => item.isFavorite && item.status === selectedTab);

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
          onClick={() => handleShowClick(row.id)}
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
