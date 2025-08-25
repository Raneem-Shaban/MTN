import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaQuestion, FaReply, FaStar, FaChartPie } from 'react-icons/fa';
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
const fullLineData = {
  '24h': [
    { date: '1h ago', count: 2 },
    { date: '2h ago', count: 4 },
  ],
  week: [
    { date: 'Mon', count: 10 },
    { date: 'Tue', count: 15 },
  ],
  month: [
    { date: 'Week 1', count: 40 },
    { date: 'Week 2', count: 55 },
  ],
  all: [
    { date: 'Jan', count: 150 },
    { date: 'Feb', count: 200 },
  ],
};




const HomePage = () => {
  const [stats, setStats] = useState({});
  const [extraStats, setExtraStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const lineData = useMemo(() => fullLineData[selectedPeriod], [selectedPeriod]);

 const categoryData = useMemo(() => [
  { name: 'Category A', count: 40 },
  { name: 'Category B', count: 25 },
  { name: 'Category C', count: 35 },
], []);

const trainerPerformanceData = useMemo(() => [
  { name: 'Trainer A', inquiries: 20, closed: 18 },
  { name: 'Trainer B', inquiries: 25, closed: 22 },
  { name: 'Trainer C', inquiries: 15, closed: 14 },
  { name: 'Trainer D', inquiries: 30, closed: 29 },
], []);

const departmentEvaluationData = useMemo(() => [
  { subject: 'Speed', value: 85, fullMark: 100 },
  { subject: 'Quality', value: 92, fullMark: 100 },
  { subject: 'Follow-up', value: 78, fullMark: 100 },
  { subject: 'Clarity', value: 88, fullMark: 100 },
  { subject: 'User Feedback', value: 91, fullMark: 100 },
], []);

  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem('token');
      setLoadingStats(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/inquiries/Statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
        setExtraStats({
          reassigned_inquiries: res.data.reassigned_inquiries,
          pending_inquiries: res.data.pending_inquiries,
          kpi_compliance: res.data.kpi_compliance,
          trainer_avg_rating: res.data.trainer_avg_rating,
        });
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg bg-[var(--color-bg-secondary)] p-4 h-24 flex flex-col justify-center"
            >
              <div className="h-4 bg-[var(--color-border)] rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-[var(--color-border)] rounded w-1/3"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard title="Open Inquiries" count={stats.opened_inquiries} icon={FaQuestion} iconColorVar="--color-primary" />
            <StatCard title="Closed Inquiries" count={stats.closed_inquiries} icon={FaQuestion} iconColorVar="--color-secondary" />
            <StatCard title="Response Rate (hrs)" count={stats.average_handling_time} icon={FaReply} iconColorVar="--color-danger" />
            <StatCard title="Average Rating" count={stats.average_ratings} icon={FaStar} iconColorVar="--color-primary" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          title="Reassigned Inquiries"
          count={extraStats.reassigned_inquiries ?? 0}
          icon={FaReply}
          iconColorVar="--color-secondary"
        />

        <StatCard
          title="Pending Inquiries"
          count={extraStats.pending_inquiries ?? 0}
          icon={FaQuestion}
          iconColorVar="--color-primary"
        />

        <StatCard
          title="KPI Compliance (%)"
          count={extraStats.kpi_compliance ?? 0}
          icon={FaChartPie}
          iconColorVar="--color-danger"
        />

        <StatCard
          title="Trainer Avg Rating"
          count={extraStats.trainer_avg_rating ?? 0}
          icon={FaStar}
          iconColorVar="--color-primary"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Inquiry Volume Over Time</h2>

          <div className="flex flex-wrap gap-3 mb-5 max-w-full overflow-x-auto">
            {[
              { label: 'Last 24 Hours', value: '24h' },
              { label: 'Last Week', value: 'week' },
              { label: 'Last Month', value: 'month' },
              { label: 'Since Beginning', value: 'all' },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handlePeriodChange(value)}
                className={`px-3 sm:px-4 py-1 rounded-full font-medium transition whitespace-nowrap
        ${selectedPeriod === value
                    ? 'bg-[var(--color-primary)] text-white shadow-lg'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] hover:bg-[var(--color-primary)] hover:text-white'
                  } text-xs`}
              >
                {label}
              </button>
            ))}
          </div>


          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>


        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Inquiry Distribution by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                dataKey="count"
                isAnimationActive={false}
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={50}
                fill="#8884d8"
                label={(entry) => entry.name}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Trainer Performance Overview</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trainerPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inquiries" fill="#82ca9d" name="Total Inquiries" />
              <Bar dataKey="closed" fill="#8884d8" name="Closed Inquiries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Department Evaluation Metrics</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={departmentEvaluationData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#ff8042"
                fill="#ff8042"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
