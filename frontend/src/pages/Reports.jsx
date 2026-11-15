
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    CalendarDays,
    Activity,
    TrendingUp,
    TrendingDown
} from "lucide-react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

import api from "../services/api";

function Reports() {
    const today = new Date().toLocaleDateString("en-CA");

    const [date, setDate] = useState(today);
    const [reportType, setReportType] = useState("daily");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const generateReport = async () => {
        setLoading(true);
        setError("");
        setReport(null);

        try {
            const endpoints = {
                daily: `/readings/reports/daily?date=${date}`,
                monthToDate: `/readings/reports/month-to-date?date=${date}`,
                monthly: `/readings/reports/monthly?date=${date}`
            };

            const response = await api.get(endpoints[reportType]);
            setReport(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to generate report."
            );
        } finally {
            setLoading(false);
        }
    };

    const summary = report?.summary;

    const formatDate = (value) => {
        if (!value) return "—";

        const [year, month, day] = String(value)
            .split("-")
            .map(Number);

        return new Date(year, month - 1, day).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getReportPeriod = () => {
        const [year, month] = date.split("-").map(Number);

        if (reportType === "daily") {
            return formatDate(date);
        }

        if (reportType === "monthToDate") {
            const start =
                `${year}-${String(month).padStart(2, "0")}-01`;

            return `${formatDate(start)} – ${formatDate(date)}`;
        }

        const previousMonth = new Date(year, month - 2, 1);
        const previousYear = previousMonth.getFullYear();
        const previousMonthNumber = previousMonth.getMonth() + 1;

        const start =
            `${previousYear}-${String(previousMonthNumber).padStart(2, "0")}-01`;

        const lastDay = new Date(
            previousYear,
            previousMonthNumber,
            0
        ).getDate();

        const end =
            `${previousYear}-${String(previousMonthNumber).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

        return `${formatDate(start)} – ${formatDate(end)}`;
    };

    const chartData = (report?.readings || [])
        .map((reading) => ({
            timeSlot: reading.time_slot,
            glucose: Number(reading.glucose_value)
        }))
        .sort((a, b) => {
            const slots = [
                "Morning (fasting)",
                "After breakfast",
                "After lunch",
                "After dinner"
            ];

            return slots.indexOf(a.timeSlot) -
                slots.indexOf(b.timeSlot);
        });

    return (
        <div className="reports-page">

            <header className="reports-header">
                <Link to="/dashboard" className="back-link">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="reports-title">
                    <div className="report-title-icon">
                        <FileText />
                    </div>

                    <div>
                        <h1>Glucose Reports</h1>
                        <p>
                            Review your glucose readings and trends.
                        </p>
                    </div>
                </div>
            </header>

            <section className="report-filter-card">
                <h3>Generate a report</h3>

                <div className="report-type-options">

                    <label
                        className={
                            reportType === "daily"
                                ? "report-option selected"
                                : "report-option"
                        }
                    >
                        <input
                            type="radio"
                            value="daily"
                            checked={reportType === "daily"}
                            onChange={() => setReportType("daily")}
                        />
                        Daily Report
                    </label>

                    <label
                        className={
                            reportType === "monthToDate"
                                ? "report-option selected"
                                : "report-option"
                        }
                    >
                        <input
                            type="radio"
                            value="monthToDate"
                            checked={reportType === "monthToDate"}
                            onChange={() => setReportType("monthToDate")}
                        />
                        Month-to-Date
                    </label>

                    <label
                        className={
                            reportType === "monthly"
                                ? "report-option selected"
                                : "report-option"
                        }
                    >
                        <input
                            type="radio"
                            value="monthly"
                            checked={reportType === "monthly"}
                            onChange={() => setReportType("monthly")}
                        />
                        Previous Month
                    </label>

                </div>

                <div className="report-filter-bottom">

                    <div className="form-field">
                        <label>
                            <CalendarDays size={15} />
                            Select reference date
                        </label>

                        <input
                            type="date"
                            value={date}
                            max={today}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <button
                        className="primary-btn generate-btn"
                        onClick={generateReport}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate Report"}
                    </button>

                </div>
            </section>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {report && (
                <section className="report-result">

                    <div className="report-result-heading">
                        <div>
                            <span className="topbar-label">
                                REPORT RESULTS
                            </span>

                            <h2>
                                {report.reportType || "Glucose"} Report
                            </h2>

                            <p>{getReportPeriod()}</p>
                        </div>
                    </div>

                    <div className="stats-grid report-stats">

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <TrendingUp />
                            </div>

                            <div>
                                <span>Highest</span>
                                <h2>{summary?.highest ?? "—"}</h2>
                                <small>mg/dL</small>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <TrendingDown />
                            </div>

                            <div>
                                <span>Lowest</span>
                                <h2>{summary?.lowest ?? "—"}</h2>
                                <small>mg/dL</small>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <Activity />
                            </div>

                            <div>
                                <span>Average</span>
                                <h2>{summary?.average ?? "—"}</h2>
                                <small>mg/dL</small>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">
                                <FileText />
                            </div>

                            <div>
                                <span>Total Readings</span>
                                <h2>{summary?.totalReadings ?? 0}</h2>
                                <small>Recorded entries</small>
                            </div>
                        </div>

                    </div>

                    {reportType === "daily" && (
                        <>
                            {chartData.length > 0 && (
                                <div className="report-chart-card">

                                    <div className="report-chart-heading">
                                        <div>
                                            <h3>Glucose Overview</h3>
                                            <p>
                                                Your readings across the day
                                            </p>
                                        </div>

                                        <div className="chart-icon">
                                            <Activity size={20} />
                                        </div>
                                    </div>

                                    <div className="report-chart">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={chartData}
                                                margin={{
                                                    top: 15,
                                                    right: 15,
                                                    left: 5,
                                                    bottom: 45
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="timeSlot"
                                                    interval={0}
                                                    angle={-15}
                                                    textAnchor="end"
                                                    tick={{ fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />

                                                <YAxis
                                                    domain={[0, "auto"]}
                                                    tick={{ fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />

                                                <Tooltip
                                                    formatter={(value) => [
                                                        `${value} mg/dL`,
                                                        "Glucose"
                                                    ]}
                                                />

                                                <Bar
                                                    dataKey="glucose"
                                                    name="Glucose"
                                                    fill="#14b8a6"
                                                    radius={[7, 7, 0, 0]}
                                                    maxBarSize={65}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                </div>
                            )}

                            <div className="readings-card">
                                <h3>Daily reading details</h3>

                                {report.readings?.length ? (
                                    <div className="table-wrapper">
                                        <table className="readings-table">
                                            <thead>
                                                <tr>
                                                    <th>Time Slot</th>
                                                    <th>Glucose Value</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {report.readings.map((reading) => (
                                                    <tr key={reading.id}>
                                                        <td>
                                                            {reading.time_slot}
                                                        </td>

                                                        <td>
                                                            <span className="glucose-value">
                                                                {reading.glucose_value} mg/dL
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <FileText size={36} />
                                        <h3>
                                            No readings for this date
                                        </h3>
                                        <p>
                                            Add readings from your dashboard
                                            to see them here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {summary?.totalReadings === 0 && (
                        <p className="report-empty-note">
                            No readings found for this reporting period.
                            Start recording your glucose readings to
                            build your report.
                        </p>
                    )}

                </section>
            )}

            {!report && !loading && !error && (
                <div className="report-placeholder">
                    <FileText size={45} />
                    <h3>Your reports will appear here</h3>
                    <p>
                        Select a report type and date, then generate
                        your report.
                    </p>
                </div>
            )}

        </div>
    );
}

export default Reports;
