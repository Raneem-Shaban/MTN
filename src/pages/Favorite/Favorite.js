import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  opened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
  closed: { bg: 'var(--color-status-closed-bg)', text: 'var(--color-status-closed)' },
  pending: { bg: 'var(--color-status-pending-bg)', text: 'var(--color-status-pending)' },
  reopened: { bg: 'var(--color-status-open-bg)', text: 'var(--color-status-open)' },
};

const truncate = (text, maxLength = 20) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const Favorite = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]); // table rows
  const [rawFavourites, setRawFavourites] = useState([]); // raw favourites response
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavoritesAndInquiries = async () => {
      const token = localStorage.getItem('token');
      if (!token) console.warn('No token in localStorage while fetching favorites');

      try {
        setLoading(true);

        // fetch favourites (raw)
        const favRes = await axios.get(`${API_BASE_URL}/api/myFavourites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favs = Array.isArray(favRes.data) ? favRes.data : [];
        console.log('✅ API Response (favourites):', favs);
        setRawFavourites(favs);

        // fetch inquiries (all) to join with favourites
        const inqRes = await axios.get(`${API_BASE_URL}/api/inquiries`, {
          headers: { Authorization: `Bearer ${token}` }, // include token if endpoint requires
        });
        const inquiries = Array.isArray(inqRes.data) ? inqRes.data : [];
        console.log('✅ API Response (inquiries):', inquiries);

        // build map from inquiry.id -> inquiry object (original shape from /api/inquiries)
        const inqMap = {};
        inquiries.forEach(item => {
          const iid = item?.inquiry?.id ?? null;
          if (iid != null) inqMap[iid] = item;
        });

        // build formatted favorites rows by joining favourite -> inquiry
        const formatted = favs.map(fav => {
          const inquiryId = fav.inquiry_id;
          const inqItem = inqMap[inquiryId];
          if (!inqItem) {
            console.warn('⚠️ Inquiry not found for favourite:', fav);
          }

          return {
            // show inquiry id as ID column (fallback to null)
            id: inquiryId,
            title: truncate(inqItem?.inquiry?.title ?? `Inquiry #${inquiryId}`, 25),
            body: truncate(inqItem?.inquiry?.body ?? '', 40),
            status: inqItem?.status?.name || 'Unknown',
            trainer: truncate(inqItem?.assigneeUser?.name || 'Unassigned', 20),
            category: truncate(inqItem?.category?.name || 'N/A', 15),
            user: truncate(inqItem?.user?.name || 'Unknown', 20),
            createdAt: formatDate(inqItem?.inquiry?.created_at),
            isFavorite: true,
            favouriteId: fav.id, // IMPORTANT: favourite record id for DELETE
            rawFavourite: fav, // keep full raw object if needed for debugging
            rawInquiry: inqItem, // keep original inquiry object
          };
        });

        console.log('📦 Formatted Favorites:', formatted);
        setData(formatted);
      } catch (err) {
        console.error('❌ Error fetching favorites or inquiries:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritesAndInquiries();
  }, []);

  // filtered data based on tab
  const filteredData =
    selectedTab === 'All Inquiries'
      ? data.filter(item => item.isFavorite)
      : data.filter(item => item.isFavorite && item.status && String(item.status).toLowerCase() === String(selectedTab).toLowerCase());

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // remove from favourites using favouriteId (not inquiry id)
  const removeFromFavorite = async (inquiryId, favouriteId) => {
    const token = localStorage.getItem('token');
    console.log('🚫 removeFromFavorite clicked:', { inquiryId, favouriteId, tokenPresent: !!token });

    if (!favouriteId) {
      console.error('❌ favouriteId missing — cannot DELETE. favouriteId:', favouriteId);
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/favourites/${favouriteId}`;
      console.log('🗑 Sending DELETE to:', url);

      const res = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ DELETE response:', res.data);

      // update local rawFavourites and data
      setRawFavourites(prev => prev.filter(f => f.id !== favouriteId));
      setData(prev => prev.filter(row => row.favouriteId !== favouriteId));

      // keep pagination sensible
      setCurrentPage(1);
    } catch (err) {
      console.error('❌ Error removing favourite:', err.response?.data || err.message);
    }
  };

  // keep pagination when changing tab
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  // columns — match UserHome columns order (except Favorite column) + keep Show/Remove buttons
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
      cell: (value) => <StatusBadge value={value} colorMap={ticketStatusColors} />
    },
    { header: 'Created At', accessor: 'createdAt' },
    {
      header: 'Details',
      accessor: 'show',
      cell: (_, row) => (
        <OutlineButton
          title="Show"
          color="primary"
          onClick={() => navigate(`/inquirydetails/${row.id}`)}
        />
      )
    },
    {
      header: 'Remove',
      accessor: 'remove',
      cell: (_, row) => (
        <OutlineButton
          title="Remove"
          color="danger"
          onClick={() => removeFromFavorite(row.id, row.favouriteId)}
        />
      )
    }
  ];

  return (
    <div className="px-6 pt-6 overflow-hidden" dir="ltr">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">Favorite Inquiries</h1>

      <FilterTabs
        tabs={['All Inquiries', 'opened', 'closed', 'pending', 'reopened']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

      {loading ? (
        <div className="p-4">Loading favorites...</div>
      ) : (
        <>
          <DynamicTable
            columns={columns}
            data={paginatedData}
            rowClassName="hover:bg-[var(--color-white)] cursor-pointer transition duration-200 rounded"
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Favorite;
