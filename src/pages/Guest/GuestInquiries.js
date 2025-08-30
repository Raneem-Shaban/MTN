import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';

export default function GuestInquiries() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 10;
    const debounceTimeout = useRef(null);

    // جلب البيانات من API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // تفعيل الـ loading قبل الطلب
            try {
                const res = await axios.get(`${API_BASE_URL}/api/inquiries/Status/3`);
                setData(res.data);
                setFilteredData(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch inquiries.');
            } finally {
                setLoading(false); // إيقاف الـ loading بعد الانتهاء
            }
        };
        fetchData();
    }, []);


    // البحث مع debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            const lowerSearch = value.toLowerCase();
            const filtered = data.filter(item =>
                item.title.toLowerCase().includes(lowerSearch) ||
                item.body.toLowerCase().includes(lowerSearch) ||
                item.user.name.toLowerCase().includes(lowerSearch) ||
                item.assignee_user.name.toLowerCase().includes(lowerSearch) ||
                item.category.name.toLowerCase().includes(lowerSearch)
            );
            setFilteredData(filtered);
            setCurrentPage(1);
        }, 500);
    };

    useEffect(() => {
        return () => debounceTimeout.current && clearTimeout(debounceTimeout.current);
    }, []);

    // إعداد الأعمدة للجدول
    const columns = useMemo(() => [
        { header: 'ID', accessor: 'id' },
        { header: 'Title', accessor: 'title' },
        { header: 'Body', accessor: 'body' },
        { header: 'Response', accessor: 'response' },
        { header: 'Closed At', accessor: 'closed_at' },
        { header: 'User', accessor: 'user', cell: (val) => val.name },
        { header: 'Assignee', accessor: 'assignee_user', cell: (val) => val.name },
        { header: 'Category', accessor: 'category', cell: (val) => val.name },
    ], []);

    // تقسيم الصفوف حسب الصفحة
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage]);

    return (
        <div className="p-6 bg-[var(--color-surface)] min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* عنوان الصفحة */}
                <h1 className="text-3xl font-bold text-[var(--color-text-main)] mb-6">Closed Inquiries</h1>

                {/* حقل البحث */}
                <div className="flex-1 max-w-md mb-6 relative">
                    <div className="flex items-center bg-[var(--color-light-gray)] border border-[var(--color-border)] rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary-hover)] transition-all duration-300 hover:shadow-md">
                        <FiSearch className="text-[var(--color-text-accent)] mr-2" size={20} />
                        <input
                            type="text"
                            placeholder="Search for inquiry"
                            value={search}
                            onChange={handleSearchChange}
                            className="bg-transparent outline-none w-full text-[var(--color-text-main)] placeholder-[var(--color-text-accent)] transition-all duration-300 focus:w-full"
                        />
                    </div>
                </div>

                {/* بطاقة الجدول */}
                <div className="bg-[var(--color-white)] rounded-lg shadow-md p-6">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="loader"></div>
                        </div>
                    )}
                    {paginatedData.length > 0 ? (
                        <>
                            <DynamicTable
                                columns={columns}
                                data={paginatedData}
                                onRowClick={(row) => alert(`Clicked on inquiry ID: ${row.id}`)}
                                className="min-w-full"
                                rowClassName="hover:bg-[var(--color-secondary-hover)] cursor-pointer transition-colors duration-200"
                                headerClassName="bg-[var(--color-primary)] text-[var(--color-white)]"
                            />

                            {/* الترقيم */}
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                                    onPageChange={setCurrentPage}
                                    className="flex space-x-2"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 text-[var(--color-text-accent)]">
                            No inquiries found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}