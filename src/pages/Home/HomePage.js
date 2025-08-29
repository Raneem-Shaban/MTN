import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaQuestion, FaReply, FaStar, FaHourglassHalf } from 'react-icons/fa';
import StatCard from '../../components/common/cards/StatCard';
import { API_BASE_URL } from '../../constants/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

const HomePage = () => {
  const [stats, setStats] = useState({});
  const [extraStats, setExtraStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [lineData, setLineData] = useState([]);

  const statsList = [
    { title: 'Open Inquiries', count: stats.opened_inquiries, icon: FaQuestion, iconColorVar: '--color-primary' },
    { title: 'Closed Inquiries', count: stats.closed_inquiries, icon: FaQuestion, iconColorVar: '--color-secondary' },
    { title: 'Pending Inquiries', count: stats.pending_inquiries, icon: FaHourglassHalf, iconColorVar: '--color-danger' },
    { title: 'Response Rate (hrs)', count: stats.average_handling_time, icon: FaReply, iconColorVar: '--color-primary' },
    { title: 'Average Rating', count: stats.average_ratings, icon: FaStar, iconColorVar: '--color-secondary' },
  ];

  const categoryData = useMemo(() => extraStats.topCategories?.map(cat => ({
    name: cat.name,
    count: cat.inquiries_count
  })) || [], [extraStats.topCategories]);

  const trainerPerformanceData = useMemo(() => extraStats.trainers_performance?.map(trainer => ({
    name: trainer.name,
    inquiries: trainer.closed_inquiries + trainer.not_closed_inquiries,
    closed: trainer.closed_inquiries
  })) || [], [extraStats.trainers_performance]);

  const departmentEvaluationData = useMemo(() => [
    { subject: 'Speed', value: 85, fullMark: 100 },
    { subject: 'Quality', value: 92, fullMark: 100 },
    { subject: 'Follow-up', value: 78, fullMark: 100 },
    { subject: 'Clarity', value: 88, fullMark: 100 },
    { subject: 'User Feedback', value: 91, fullMark: 100 },
  ], []);

  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
    if (period === '7d') setLineData(extraStats.inquiries_last_7_days || []);
    else if (period === '6m') setLineData(extraStats.inquiries_last_6_months || []);
  }, [extraStats]);

  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem('token');
      setLoadingStats(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/inquiries/statistics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats({
          opened_inquiries: res.data.opened_inquiries,
          pending_inquiries: res.data.pending_inquiries,
          closed_inquiries: res.data.closed_inquiries,
          average_handling_time: res.data.average_handling_time,
          average_ratings: res.data.average_ratings,
        });

        setExtraStats({
          last7Days: res.data.inquiries_last_7_days,
          last6Months: res.data.inquiries_last_6_months,
          topCategories: res.data.topCategories,
          trainers_performance: res.data.trainers_performance,
          inquiries_last_7_days: res.data.inquiries_last_7_days,
          inquiries_last_6_months: res.data.inquiries_last_6_months
        });

        // تعيين البيانات الافتراضية
        setLineData(res.data.inquiries_last_7_days);

      } catch (err) {
        toast.error('Failed to load statistics');
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="p-6 py-20">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {loadingStats
          ? Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-lg bg-[var(--color-bg-secondary)] p-4 h-24 flex flex-col justify-center">
              <div className="h-4 bg-[var(--color-border)] rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-[var(--color-border)] rounded w-1/3"></div>
            </div>
          ))
          : statsList.map((item, idx) => (
            <StatCard key={idx} title={item.title} count={item.count} icon={item.icon} iconColorVar={item.iconColorVar} />
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Inquiry Volume Over Time</h2>

          {loadingStats ? (
            <div className="animate-pulse h-[200px] w-full bg-[var(--color-bg-secondary)] rounded-lg"></div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-5 max-w-full overflow-x-auto">
                {[{ label: 'Last 7 days', value: '7d' }, { label: 'Last 6 months', value: '6m' }].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => handlePeriodChange(value)}
                    className={`px-3 sm:px-4 py-1 rounded-full font-medium transition whitespace-nowrap
            ${selectedPeriod === value ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] hover:bg-[var(--color-primary)] hover:text-white'} text-xs`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>


        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Inquiry Distribution by Category</h2>
          {loadingStats ? (
            <div className="animate-pulse h-[250px] w-full bg-[var(--color-bg-secondary)] rounded-lg"></div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  dataKey="count"
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={false}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 mt-8">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Trainer Performance Overview</h2>
          {loadingStats ? (
            <div className="animate-pulse h-[300px] w-full bg-[var(--color-bg-secondary)] rounded-lg"></div>
          ) : (
            <div style={{ minWidth: Math.max(trainerPerformanceData.length * 120, 600) }}>
              <ResponsiveContainer width={trainerPerformanceData.length * 150} height={300}>
                <BarChart data={trainerPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} height={80} tick={{ dy: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inquiries" fill="#82ca9d" name="Total Inquiries" />
                  <Bar dataKey="closed" fill="#8884d8" name="Closed Inquiries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default HomePage;
