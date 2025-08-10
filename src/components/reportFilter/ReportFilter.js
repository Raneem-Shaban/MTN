import React, { useState } from 'react';
import { FiCalendar, FiBarChart2, FiPlus } from 'react-icons/fi';

const ReportFilter = ({ onCreate }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('');

    const handleCreate = () => {
        if (onCreate) {
            onCreate({ startDate, endDate, reportType });
        }
    };

    return (
        <div className="bg-[var(--color-bg)] border shadow-sm rounded-2xl p-6 md:p-8 space-y-6 max-w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                    <label className="text-sm text-[var(--color-text-accent)] font-medium mb-2 flex items-center gap-1">
                        <FiCalendar className="text-[var(--color-text-accent)]" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] transition shadow-sm"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-[var(--color-text-accent)] font-medium mb-2 flex items-center gap-1">
                        <FiCalendar className="text-[var(--color-text-accent)]" />
                        End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-[var(--color-text-muted)]  focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]  focus:border-[var(--color-secondary)] transition shadow-sm"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm text-[var(--color-text-accent)] font-medium mb-2 flex items-center gap-1">
                        <FiBarChart2 className="text-[var(--color-text-accent)]" />
                        Reporting Type
                    </label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-[var(--color-text-muted)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)]  transition shadow-sm"
                    >
                        <option value="">Choose a reporting type</option>
                        <option>Number of users</option>
                        <option>Number of active users</option>
                        <option>Number of trainers</option>
                        <option>Number of active trainers</option>
                        <option>Number of sections</option>
                        <option>Number of categories</option>
                        <option>Number of active categories</option>
                        <option>Number of all inquiries</option>
                        <option>Number of closed inquiries</option>
                        <option>Number of opened inquiries</option>
                        <option>Number of pending inquiries</option>
                        <option>Number of reopened inquiries</option>
                        <option>Average closing time (hours)</option>
                        <option>Average of evaluation</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)]"
                >
                    <FiPlus />
                    Create Report
                </button>

            </div>
        </div>
    );
};

export default ReportFilter;
