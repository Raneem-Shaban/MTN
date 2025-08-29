import React, { useState } from 'react';
import { FiCalendar, FiPlus, FiLayers, FiBarChart } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TrainerReportFilter = ({ onCreate }) => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const handleCreate = () => {
    if (!reportType) {
      toast.error("Please select a report type.");
      return;
    }

    const data = { reportType };
    if (reportType === 'My Daily Report') {
      if (!startDate || !endDate) {
        toast.error("Please select start and end dates.");
        return;
      }
      data.startDate = startDate;
      data.endDate = endDate;
    } else if (reportType === 'My Weekly Report') {
      if (!month) {
        toast.error("Please select a month.");
        return;
      }
      data.month = month;
    } else if (reportType === 'My Monthly Report') {
      if (!year) {
        toast.error("Please select a year.");
        return;
      }
      data.year = year;
    }

    if (onCreate) {
      onCreate(data);
    }
  };

  const reportOptions = [
    { name: 'My Daily Report', icon: <FiCalendar /> },
    { name: 'My Weekly Report', icon: <FiLayers /> },
    { name: 'My Monthly Report', icon: <FiBarChart /> },
  ];

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-3xl p-4 sm:p-6 md:p-4 space-y-6 md:space-y-8 transition-all hover:shadow-2xl max-w-6xl mx-auto">

      {/* Report Type Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6">
        {reportOptions.map((type) => (
          <button
            key={type.name}
            onClick={() => setReportType(type.name)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-base transition-all transform
              ${reportType === type.name
                ? 'bg-[var(--color-primary)] text-[var(--color-white)] shadow-lg scale-105'
                : 'bg-[var(--color-light-gray)] text-[var(--color-text-main)] hover:bg-[var(--color-primary-hover)] hover:text-[var(--color-white)] hover:scale-105'}
            `}
          >
            {type.icon}
            <span className="hidden sm:inline">{type.name}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Date/Month/Year Inputs */}
      {reportType === 'My Daily Report' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {[{ label: 'Start Date', value: startDate, setter: setStartDate },
            { label: 'End Date', value: endDate, setter: setEndDate }].map((date) => (
            <div key={date.label} className="flex flex-col bg-[var(--color-white)] p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition">
              <label className="text-sm font-medium mb-2 flex items-center gap-2 text-[var(--color-text-accent)]">
                <FiCalendar className="text-[var(--color-dark-gray)]" />
                {date.label}
              </label>
              <input
                type="date"
                value={date.value}
                onChange={(e) => date.setter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition shadow-sm"
              />
            </div>
          ))}
        </div>
      )}

      {reportType === 'My Weekly Report' && (
        <div className="flex justify-center gap-4 md:gap-6">
          <div className="flex flex-col w-80 bg-[var(--color-white)] p-4 rounded-2xl shadow-sm hover:shadow-md transition">
            <label className="text-sm font-medium mb-2 flex items-center gap-2 text-[var(--color-text-accent)]">
              <FiLayers /> Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition shadow-sm text-base cursor-pointer"
            />
          </div>
        </div>
      )}

      {reportType === 'My Monthly Report' && (
        <div className="flex justify-center gap-4 md:gap-6">
          <div className="flex flex-col w-80 bg-[var(--color-white)] p-4 rounded-2xl shadow-sm hover:shadow-md transition">
            <label className="text-sm font-medium mb-2 flex items-center gap-2 text-[var(--color-text-accent)]">
              <FiBarChart /> Year
            </label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="YYYY"
              className="w-full px-4 py-2 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition shadow-sm text-base cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 sm:gap-3 text-[var(--color-white)] font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl shadow-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:scale-105 hover:shadow-2xl transition-all"
        >
          <FiPlus className="text-lg sm:text-xl" />
          <span className="hidden sm:inline">Create Report</span>
        </button>
      </div>
    </div>
  );
};

export default TrainerReportFilter;
