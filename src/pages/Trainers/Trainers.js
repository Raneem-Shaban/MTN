import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import OutlineButton from '../../components/common/buttons/OutlineButton';
import { API_BASE_URL } from '../../constants/constants';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // ✅ حالة تحميل خاصة بالجدول
  const navigate = useNavigate();

  const pageSize = 7;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchTrainers = async () => {
      try {
        setLoading(true); // ⬅️ بدء التحميل
        const response = await axios.get(
          `${API_BASE_URL}/api/reports/trainers`,
          {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );
        setTrainers(response.data);
      } catch (error) {
        console.error("Error fetching trainers:", error);
      } finally {
        setLoading(false); // ⬅️ إيقاف التحميل
      }
    };

    fetchTrainers();
  }, []);

  const trainerPage = trainers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    { header: 'Trainer', accessor: 'username' },
    { header: 'Inquiries', accessor: 'total_responded_inquiries' },
    { header: 'Opened', accessor: 'opened_inquiries' },
    { header: 'Closed', accessor: 'closed_inquiries' },
    { header: 'Pending', accessor: 'pending_inquiries' },
    { header: 'Reopened', accessor: 'reopened_inquiries' },
    { header: 'Avg Closing', accessor: 'avg_closing_hours' },
    { header: 'Last Delegation', accessor: 'last_delegated_user' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (_val, row) => (
        <OutlineButton
          title="Show Details"
          color="secondary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/trainers/${row.user_id}`);
          }}
        />
      ),
    },
  ];

  return (
    <div className="px-6 pt-6 overflow-hidden" dir="ltr">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
        Trainers Overview
      </h1>

      <div className="flex flex-col h-[calc(100vh-120px)] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center  z-10">
            <div className="loader"></div>
          </div>
        )}

        <DynamicTable
          columns={columns}
          data={trainerPage}
          rowClassName="hover:bg-[var(--color-white)] cursor-pointer transition duration-200 rounded"
        />

        <div className="mt-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(trainers.length / pageSize)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Trainers;
