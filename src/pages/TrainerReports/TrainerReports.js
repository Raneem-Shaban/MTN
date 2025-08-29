// TrainerReports.jsx
import React, { useState } from 'react';
import ReportFilter from '../../components/reportFilter/ReportFilter';
import DynamicTable from '../../components/common/tables/DynamicTable';
import Pagination from '../../components/common/pagination/Pagination';
import { FiLoader, FiDownload } from 'react-icons/fi';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import TrainerReportFilter from '../../components/reportFilter/TrainerReportFilter';

const TrainerReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [filterData, setFilterData] = useState(null);

  const pageSize = 10;

  const paginatedData = reportData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  const handleCreate = async (data) => {
    try {
      setLoading(true);
      setFilterData(data);

      let url = "";
      let payload = {};

      // نحدد نوع التقرير ونجهز البودي
      if (data.reportType === "My Daily Report") {
        url = `${API_BASE_URL}/api/reports/myDailyReport`;
        payload = {
          start_date: data.startDate,
          end_date: data.endDate,
        };
      } else if (data.reportType === "My Weekly Report") {
        url = `${API_BASE_URL}/api/reports/myWeeklyReport`;
        payload = {
          month: data.month,
        };
      } else if (data.reportType === "My Monthly Report") {
        url = `${API_BASE_URL}/api/reports/myMonthlyReport`;
        payload = {
          year: data.year,
        };
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.length > 0) {
        setReportData(response.data);

        // تعريف الأعمدة للجدول بشكل ديناميكي
        setColumns([
          { header: "Date", accessor: "date" },
          { header: "Total Responded", accessor: "total_responded" },
          { header: "Opened", accessor: "opened" },
          { header: "Closed", accessor: "closed" },
          { header: "Pending", accessor: "pending" },
          { header: "Reopened", accessor: "reopened" },
          { header: "Avg Closing", accessor: "avg_closing" },
          { header: "Avg Rating", accessor: "avg_rating" },
          { header: "Followups", accessor: "followups" },
          { header: "Last Delegation From", accessor: "last_delegation_from" },
        ]);
      } else {
        toast.info("No data found for the selected filter.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch report data.");
    } finally {
      setLoading(false);
    }
  };

const handleExport = async () => {
  if (!filterData) {
    toast.error("Please create a report first.");
    return;
  }

  try {
    setExporting(true);

    let url = "";
    let payload = {};

    if (filterData.reportType === "My Daily Report") {
      url = `${API_BASE_URL}/api/reports/myDailyExcel`;
      payload = {
        start_date: filterData.startDate,
        end_date: filterData.endDate,
      };
    } else if (filterData.reportType === "My Weekly Report") {
      url = `${API_BASE_URL}/api/reports/myWeeklyExcel`;
      payload = {
        month: filterData.month,
      };
    } else if (filterData.reportType === "My Monthly Report") {
      url = `${API_BASE_URL}/api/reports/myMonthlyExcel`;
      payload = {
        year: filterData.year,
      };
    }

    const token = localStorage.getItem("token");
    const response = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    // تحميل الملف
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;

    // تغيير اسم الملف حسب نوع التقرير
    let fileName = "report.xlsx";
    if (filterData.reportType === "My Daily Report") fileName = "myDailyReport.xlsx";
    if (filterData.reportType === "My Weekly Report") fileName = "myWeeklyReport.xlsx";
    if (filterData.reportType === "My Monthly Report") fileName = "myMonthlyReport.xlsx";

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Excel exported successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Failed to export Excel.");
  } finally {
    setExporting(false);
  }
};



  return (
    <div className="p-6 space-y-8 py-20">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Reports
      </h1>

      {/* استدعاء الفلتر مع تمرير handleCreate */}
      <TrainerReportFilter onCreate={handleCreate} />

      <div className="flex flex-col h-[calc(50vh-120px)] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="loader"></div>
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
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 hover:shadow-lg text-white text-sm font-semibold transition-all"
                  disabled={exporting}
                >
                  {exporting ? (
                    <FiLoader className="animate-spin text-lg" />
                  ) : (
                    <FiDownload className="text-lg" />
                  )}
                  Export Excel
                </button>

              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TrainerReports;
