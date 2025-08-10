import React, { useState } from 'react';
import ReportFilter from '../../components/reportFilter/ReportFilter';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import { FiLoader, FiFileText, FiDownload } from 'react-icons/fi';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleCreate = ({ startDate, endDate, reportType }) => {
    setLoading(true);
    setReportData([]);

    setTimeout(() => {
      const dummyData = Array.from({ length: 23 }, (_, i) => ({
        id: i + 1,
        metric: reportType || 'N/A',
        value: Math.floor(Math.random() * 1000),
        period: `${startDate} → ${endDate}`,
      }));

      setReportData(dummyData);
      setCurrentPage(1);
      setLoading(false);
    }, 1500);
  };

  const paginatedData = reportData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Metric', accessor: 'metric' },
    { header: 'Value', accessor: 'value' },
    { header: 'Period', accessor: 'period' },
  ];

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
                className="inlizne-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white text-sm font-medium transition"
              >
                <FiDownload className="text-lg" />
                Export Excel
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white text-sm font-medium transition"
              >
                <FiFileText className="text-lg" />
                Export PDF
              </button>
            </div>

          </div>
        )
      )}
    </div>
  );
};

export default Reports;
