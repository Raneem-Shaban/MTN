import React, { useState } from 'react';
import ReportFilter from '../../components/reportFilter/ReportFilter';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import { FiLoader, FiDownload } from 'react-icons/fi';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';
import { toast } from 'react-toastify';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState([]);
  const pageSize = 5;

  const handleCreate = async ({ startDate, endDate, reportType }) => {
    if (!reportType) return;
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setReportData([]);
    const token = localStorage.getItem('token');

    try {
      let res, formattedData = [];

      if (reportType === "System Report") {
        res = await axios.post(
          `${API_BASE_URL}/api/reports/system`,
          { start_date: startDate, end_date: endDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;
        formattedData = Object.entries(data).map(([key, value], index) => ({
          id: index + 1,
          metric: key,
          value: value,
          period: `${startDate} → ${endDate}`,
        }));

        setColumns([
          { header: 'ID', accessor: 'id' },
          { header: 'Metric', accessor: 'metric' },
          { header: 'Value', accessor: 'value' },
          { header: 'Period', accessor: 'period' },
        ]);
      }

      else if (reportType === "Trainer Report") {
        res = await axios.post(
          `${API_BASE_URL}/api/reports/trainers`,
          { start_date: startDate, end_date: endDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;
        formattedData = data.map((item, index) => ({
          id: index + 1,
          username: item.username,
          total_responded_inquiries: item.total_responded_inquiries,
          opened_inquiries: item.opened_inquiries,
          closed_inquiries: item.closed_inquiries,
          pending_inquiries: item.pending_inquiries,
          reopened_inquiries: item.reopened_inquiries,
          avg_closing_hours: item.avg_closing_hours ?? "-",
          last_delegated_user: item.last_delegated_user ?? "-",
        }));

        setColumns([
          { header: 'ID', accessor: 'id' },
          { header: 'Username', accessor: 'username' },
          { header: 'Total Responded', accessor: 'total_responded_inquiries' },
          { header: 'Opened', accessor: 'opened_inquiries' },
          { header: 'Closed', accessor: 'closed_inquiries' },
          { header: 'Pending', accessor: 'pending_inquiries' },
          { header: 'Reopened', accessor: 'reopened_inquiries' },
          { header: 'Avg Closing (h)', accessor: 'avg_closing_hours' },
          { header: 'Last Delegated User', accessor: 'last_delegated_user' },
        ]);
      }

      setReportData(formattedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching report:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch report. Please check your token and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = reportData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Reports
      </h1>

      <ReportFilter onCreate={handleCreate} />

      {loading ? (
        <div className="flex justify-center py-10">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        reportData.length > 0 && (
          <div className="space-y-4">
            <DynamicTable
              columns={columns}
              data={paginatedData}
              onRowClick={(row) => console.log('Clicked row:', row)}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(reportData.length / pageSize)}
              onPageChange={(page) => setCurrentPage(page)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 hover:shadow-lg text-white text-sm font-semibold transition-all"
              >
                <FiDownload className="text-lg" />
                Export Excel
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Reports;
