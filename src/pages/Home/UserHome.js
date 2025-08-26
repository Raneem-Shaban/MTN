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

const UserHome = () => {
  const [selectedTab, setSelectedTab] = useState('All Inquiries');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);          // صفوف الجدول
  const [favourites, setFavourites] = useState([]); // المفضلات الخام من API
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // يبني خريطة inquiry_id -> قائمة مفضلات (مرتبة) + آخر id
  const favIndex = useMemo(() => {
    const byInquiry = new Map();
    favourites.forEach(f => {
      if (!byInquiry.has(f.inquiry_id)) byInquiry.set(f.inquiry_id, []);
      byInquiry.get(f.inquiry_id).push(f);
    });
    // رتب حسب created_at ثم id، وخذ الأخير كـ "الأحدث"
    for (const arr of byInquiry.values()) {
      arr.sort((a, b) => {
        const ta = new Date(a.created_at).getTime();
        const tb = new Date(b.created_at).getTime();
        if (ta !== tb) return ta - tb;
        return a.id - b.id;
      });
    }
    const latestId = (inquiryId) => {
      const arr = byInquiry.get(inquiryId);
      return arr && arr.length ? arr[arr.length - 1].id : null;
    };
    return { byInquiry, latestId };
  }, [favourites]);

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);

        // 1) جلب الاستفسارات
        const inqRes = await axios.get(`${API_BASE_URL}/api/inquiries`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const inquiries = Array.isArray(inqRes.data) ? inqRes.data : [];
        console.log("✅ API Response (inquiries):", inquiries);

        // 2) جلب مفضلتي
        const favRes = await axios.get(`${API_BASE_URL}/api/myFavourites`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const favs = Array.isArray(favRes.data) ? favRes.data : [];
        console.log("✅ API Response (myFavourites):", favs);
        setFavourites(favs);

        // 3) مزج الاستفسارات مع حالة المفضلة و favouriteId الأحدث
        // نبني خريطة سريعة inquiry_id -> أحدث favourite
        const latestFavByInquiry = new Map();
        favs.forEach(f => {
          const prev = latestFavByInquiry.get(f.inquiry_id);
          if (!prev || f.id > prev.id) latestFavByInquiry.set(f.inquiry_id, f);
        });

        const formatted = inquiries.map((inq) => {
          const iid = inq?.inquiry?.id;
          const fav = latestFavByInquiry.get(iid) || null;
          return {
            id: iid,
            title: truncate(inq?.inquiry?.title, 25),
            body: truncate(inq?.inquiry?.body, 40),
            status: inq?.status?.name || 'Unknown',
            trainer: truncate(inq?.assigneeUser?.name || 'Unassigned', 20),
            category: truncate(inq?.category?.name || 'N/A', 15),
            user: truncate(inq?.user?.name || 'Unknown', 20),
            createdAt: formatDate(inq?.inquiry?.created_at),
            isFavorite: !!fav,
            favouriteId: fav?.id ?? null, // مهم للحذف
          };
        });

        console.log("📦 Formatted Data:", formatted);
        setData(formatted);
      } catch (err) {
        console.error("❌ Error fetching data:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // زر Show
const handleShowClick = (id) => {
  console.log('Show button clicked with ID:', id); // تحقق من قيمة الـ id هنا
  navigate(`/inquirydetails/${id}`);
};

  // استخراج أحدث favouriteId لعنصر ما من الحالة الحالية
  const resolveFavouriteId = async (inquiryId, headers) => {
    // 1) من الفهرس الحالي
    let favId = favIndex.latestId(inquiryId);
    if (favId) return favId;

    // 2) إعادة الجلب كحلّ أخير
    console.log('🔄 Refetching /api/myFavourites to resolve favouriteId…');
    const ref = await axios.get(`${API_BASE_URL}/api/myFavourites`, { headers });
    const list = Array.isArray(ref.data) ? ref.data : [];
    setFavourites(list);
    // اختر الأحدث لنفس الاستفسار
    const latest = list
      .filter(f => f.inquiry_id === inquiryId)
      .sort((a, b) => {
        const ta = new Date(a.created_at).getTime();
        const tb = new Date(b.created_at).getTime();
        if (ta !== tb) return ta - tb;
        return a.id - b.id;
      })
      .pop();
    return latest?.id ?? null;
  };

  // Toggle Favorite (يدعم add/remove مع حفظ/استرجاع favouriteId)
  const toggleFavorite = async (inquiryId, isFavorite, favouriteIdFromRow) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    console.log("⭐ toggleFavorite called:", { inquiryId, isFavorite, favouriteId: favouriteIdFromRow, tokenPresent: !!token });

    if (!token) {
      console.error("❌ No token found in localStorage");
      return;
    }

    try {
      if (isFavorite) {
        // DELETE — نحتاج favouriteId
        let favId = favouriteIdFromRow || favIndex.latestId(inquiryId);

        if (!favId) {
          console.warn('⚠️ favouriteId missing in row/state. Trying to resolve via refetch…');
          favId = await resolveFavouriteId(inquiryId, headers);
        }

        if (!favId) {
          console.error("❌ favouriteId is missing for deletion. Cannot call DELETE without the favourites record id.");
          return;
        }

        const url = `${API_BASE_URL}/api/favourites/${favId}`;
        console.log('🗑 Sending DELETE to:', url);
        const res = await axios.delete(url, { headers });
        console.log('✅ DELETE response:', res.data);

        // حدّث favourites (أزل السجل) + حدّث صف الجدول
        setFavourites(prev => prev.filter(f => f.id !== favId));
        setData(prev =>
          prev.map(item =>
            item.id === inquiryId ? { ...item, isFavorite: false, favouriteId: null } : item
          )
        );
      } else {
        // POST — أضف للمفضلة
        const url = `${API_BASE_URL}/api/favourites`;
        console.log('➕ Sending POST to:', url, { inquiry_id: inquiryId });

        const res = await axios.post(url, { inquiry_id: inquiryId }, { headers });
        console.log('✅ POST response:', res.data);

        // حاول استخراج الـ id من الاستجابة
        const created = (res?.data && typeof res.data === 'object') ? (res.data.data || res.data) : null;
        let newFavId = created?.id ?? null;

        if (!newFavId) {
          // fallback: refetch لمعرفة id المُضاف
          console.warn('⚠️ Could not read new favourite id from POST response, refetching myFavourites…');
          const ref = await axios.get(`${API_BASE_URL}/api/myFavourites`, { headers });
          const list = Array.isArray(ref.data) ? ref.data : [];
          setFavourites(list);
          newFavId = list
            .filter(f => f.inquiry_id === inquiryId)
            .sort((a, b) => {
              const ta = new Date(a.created_at).getTime();
              const tb = new Date(b.created_at).getTime();
              if (ta !== tb) return ta - tb;
              return a.id - b.id;
            })
            .pop()?.id ?? null;
        } else {
          // نضيف السجل إلى الحالة بدون انتظار refetch
          const newFavRecord = created?.inquiry_id
            ? created
            : { id: newFavId, inquiry_id: inquiryId, created_at: new Date().toISOString() };
          setFavourites(prev => [...prev, newFavRecord]);
        }

        // حدّث صف الجدول
        setData(prev =>
          prev.map(item =>
            item.id === inquiryId ? { ...item, isFavorite: true, favouriteId: newFavId } : item
          )
        );
      }
    } catch (err) {
      console.error("❌ Error toggling favourite:", err.response?.data || err.message);
    }
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
          onToggle={() => toggleFavorite(row.id, row.isFavorite, row.favouriteId)}
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
        <DynamicTable columns={columns} data={paginatedData} />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      <FloatingActionButton
        onClick={() => navigate('/add')}
        label="Add Inquiry"
      />
    </div>
  );
};

export default UserHome;
