import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FilterTabs from "../../components/common/filters/FilterTabs";
import DynamicTable from "../../components/common/tables/DynamicTable";
import OutlineButton from "../../components/common/buttons/OutlineButton";
import Pagination from "../../components/common/pagination/Pagination";
import HighlightedText from "../../components/common/highlight/HighlightedText";
import { StatusBadge } from "../../components/common/badges/StatusBadge";
import { formatDate } from "../../../src/utils/utils";
import { API_BASE_URL } from "../../constants/constants";
import axios from "axios";
import { toast } from "react-toastify";

const itemsPerPage = 4;

const ticketStatusColors = {
  opened: { bg: "var(--color-status-open-bg)", text: "var(--color-status-open)" },
  closed: { bg: "var(--color-status-closed-bg)", text: "var(--color-status-closed)" },
  pending: { bg: "var(--color-status-pending-bg)", text: "var(--color-status-pending)" },
  reopened: { bg: "var(--color-status-open-bg)", text: "var(--color-status-open)" },
};

const truncate = (text, maxLength = 60) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

function AssistantInquiries() {
  const [selectedTab, setSelectedTab] = useState("Received");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // نفس منطق Inquiries: يستقبل من حدث window
  const navigate = useNavigate();

  // استمع لحدث البحث العام exactly مثل صفحة Inquiries
  useEffect(() => {
    const handleSearch = (e) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener("sectionSearch", handleSearch);
    return () => window.removeEventListener("sectionSearch", handleSearch);
  }, []);

  // جلب البيانات من السيرفر عند تغيير التاب أو البحث (server-side search كما في Inquiries)
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);

        // بناء URL: إذا يوجد query -> استدعاء endpoint البحث على نفس المسار
        let url;
        if (selectedTab === "Received") {
          url = searchQuery
            ? `${API_BASE_URL}/api/receivedFollowups/search?query=${encodeURIComponent(searchQuery)}`
            : `${API_BASE_URL}/api/receivedFollowups`;
        } else {
          url = searchQuery
            ? `${API_BASE_URL}/api/sentFollowups/search?query=${encodeURIComponent(searchQuery)}`
            : `${API_BASE_URL}/api/sentFollowups`;
        }

        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // console logs كما طلبت
        console.log("[AssistantInquiries] raw response:", res.data);

        if (cancelled) return;

        const arr = Array.isArray(res.data) ? res.data : [];

        const formatted = arr.map((f) => {
          const inquiryId = f?.inquiry?.id ?? null;
          const responseText = f?.response ?? f?.inquiry?.response ?? f?.inquiry?.body ?? "";
          // محاولة أخذ اسم الحالة من عدة أشكال ممكنة
          const statusName =
            f?.status?.name ??
            f?.inquiry?.cur_status?.name ??
            f?.inquiry?.status?.name ??
            (typeof f?.status === "string" ? f.status : String(f?.status ?? ""));

          return {
            id: f.id,
            inquiryId,
            title: truncate(responseText, 120), // عمود Title يعرض response كما طلبت
            follower: f?.follower?.name || "—",
            status: statusName || "—",
            section: f?.section?.name || "—",
            createdAt: formatDate(f?.created_at || f?.inquiry?.created_at),
            _raw: f,
          };
        });

        console.log("[AssistantInquiries] formatted data:", formatted);

        setData(formatted);

        // سلوك مطابق لـ Inquiries: لو في بحث وما فيه نتائج -> notify
        if (searchQuery && formatted.length === 0) {
          toast.info("No matching results found");
        }
      } catch (err) {
        console.error("❌ Error fetching followups:", err.response?.data || err.message);
        toast.error("Error fetching data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [selectedTab, searchQuery]);

  // تقسيم الصفحات مبنياً على البيانات المجلوبة (البحث خادم)
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchQuery]);

  // Show button -> نمرر inquiry.id كما طلبت
  const handleShowClick = (inquiryId, raw) => {
    const idToPass = inquiryId ?? raw?.inquiry?.id ?? raw?.id;
    if (!idToPass) {
      toast.error("Cannot open details: missing inquiry id");
      return;
    }
    navigate(`/details/${idToPass}`);
  };

  // أعمدة الجدول — فقط الأعمدة المطلوبة؛ نمرر query للـ HighlightedText لعمل الهايلات
  const columns = [
    { header: "ID", accessor: "id" },
    {
      header: "Title", // يعرض داخلها الـ response
      accessor: "title",
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    {
      header: "Follower",
      accessor: "follower",
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (value) => <StatusBadge value={value} colorMap={ticketStatusColors} />,
    },
    {
      header: "Section",
      accessor: "section",
      cell: (value) => <HighlightedText text={value} query={searchQuery} />,
    },
    { header: "Created At", accessor: "createdAt" },
    {
      header: "Show",
      accessor: "show",
      cell: (_, row) => (
        <OutlineButton
          title="Show"
          color="primary"
          onClick={() => handleShowClick(row.inquiryId, row._raw)}
        />
      ),
    },
  ];

  // تحسين تبديل التابات: نغيّر التبويب ونجعل المستخدم يلاحظ ذلك عن طريق إعادة تعيين الصفحة (المحتوى يتبدل فوراً)
  const handleTabChange = (tab) => {
    if (tab === selectedTab) return;
    setSelectedTab(tab);
    // إعادة تعيين الصفحة ستجعل المحتوى يعاد عرضه من الصفحة الأولى
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text-main)" }}>
        Assistant Inquiries
      </h1>

      <FilterTabs tabs={["Received", "Sent"]} selected={selectedTab} onChange={handleTabChange} />

      <div className="relative w-full">
        <DynamicTable columns={columns} data={paginatedData} loading={loading} />
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        )}
      </div>
    </div>
  );
}

export default AssistantInquiries;
