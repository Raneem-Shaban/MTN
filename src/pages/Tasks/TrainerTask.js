import React, { useState, useEffect, useMemo } from 'react';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import HighlightedText from '../../components/common/highlight/HighlightedText';
import { formatDate } from '../../../src/utils/utils';
import { API_BASE_URL } from "../../constants/constants";
import axios from "axios";
import { toast } from 'react-toastify';

const itemsPerPage = 6;

const truncate = (text, maxLength = 20) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const TrainerTask = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener("sectionSearch", handleSearch);
    return () => window.removeEventListener("sectionSearch", handleSearch);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/api/myTasks`;
        console.log("📡 Fetching trainer tasks from:", url);

        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        console.log("✅ Raw response:", res.data);

        let tasks = [];
        if (Array.isArray(res.data) && res.data.length === 2) {
          const taskArray = res.data[0]; // 👈 مصفوفة التاسكات
          const delegationObj = res.data[1]; // 👈 كائن الـ delegation

          tasks = taskArray.map((t) => ({
            id: t.id,
            name: truncate(t.name || '', 30),
            description: truncate(t.description || '', 60),
            weight: t.weight ?? '-',
            delegation: delegationObj?.name || '-', // 👈 نضيف اسم الـ delegation
            createdAt: formatDate(t.created_at || t.createdAt),
          }));
        }

        console.log("✨ Formatted tasks:", tasks);
        setData(tasks);

        if (tasks.length === 0) {
          toast.info('لا توجد التاسكات لعرضها.');
        }
      } catch (err) {
        console.error('❌ Error fetching trainer tasks:', err.response?.data || err.message);
        toast.error('فشل تحميل التاسكات.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // فلترة البحث
  const searched = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(d => (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (String(d.id).includes(q)) ||
      (d.delegation && d.delegation.toLowerCase().includes(q))
    ));
  }, [searchQuery, data]);

  // Pagination
  const totalPages = Math.ceil(searched.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return searched.slice(start, end);
  }, [searched, currentPage]);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name', cell: (value) => <HighlightedText text={value} query={searchQuery} /> },
    { header: 'Description', accessor: 'description', cell: (value) => <HighlightedText text={value} query={searchQuery} /> },
    { header: 'Weight', accessor: 'weight' },
    { header: 'Delegation', accessor: 'delegation', cell: (value) => <HighlightedText text={value} query={searchQuery} /> },
    { header: 'Created At', accessor: 'createdAt' },
  ];

  return (
    <div className="p-6 pt-20">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Trainer Tasks
      </h1>

      <div className="relative w-full">
        <DynamicTable columns={columns} data={paginatedData} loading={loading} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default TrainerTask;
