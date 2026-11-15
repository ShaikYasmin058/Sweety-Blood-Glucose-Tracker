
import { useEffect, useState } from "react";
import {
    Activity, HeartPulse, LayoutDashboard, FileText,
    LogOut, Plus, Trash2, Droplets, CalendarDays,
    TrendingUp, Menu, X, Pencil
} from "lucide-react";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip
} from "recharts";

import { useAuth } from "../context/useAuth";
import api from "../services/api";
import "../index.css";

const slots = [
    "Morning (fasting)",
    "After breakfast",
    "After lunch",
    "After dinner"
];

const chartColors = [
    "#8B5CF6",
    "#3B82F6",
    "#F59E0B",
    "#10B981"
];

function Dashboard() {
    const { user, logout } = useAuth();

    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const today = new Date().toLocaleDateString("en-CA");

    const [form, setForm] = useState({
        reading_date: today,
        time_slot: slots[0],
        glucose_value: ""
    });

    const loadReadings = async () => {
        try {
            setLoading(true);
            const response = await api.get("/readings");
            setReadings(response.data.readings || []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load readings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReadings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        setForm({
            reading_date: today,
            time_slot: slots[0],
            glucose_value: ""
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const payload = {
            ...form,
            glucose_value: Number(form.glucose_value)
        };

        try {
            if (editingId !== null) {
                await api.put(`/readings/${editingId}`, payload);
                setMessage("Glucose reading updated successfully!");
            } else {
                await api.post("/readings", payload);
                setMessage("Glucose reading added successfully!");
            }

            resetForm();
            await loadReadings();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Unable to ${editingId !== null ? "update" : "add"} reading.`
            );
        }
    };

    const handleEdit = (reading) => {
        setError("");
        setMessage("");

        let dateValue = "";

        if (reading.reading_date) {
            const dateText = String(reading.reading_date);

            if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
                dateValue = dateText;
            } else {
                const date = new Date(dateText);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                dateValue = `${year}-${month}-${day}`;
            }
        }

        setForm({
            reading_date: dateValue,
            time_slot: reading.time_slot,
            glucose_value: String(reading.glucose_value)
        });

        setEditingId(reading.id);
        setShowForm(true);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this reading?")) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await api.delete(`/readings/${id}`);
            setMessage("Reading deleted successfully!");
            await loadReadings();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete reading."
            );
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const dateText = String(date);
        let dateObject;

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
            const [year, month, day] = dateText.split("-").map(Number);
            dateObject = new Date(year, month - 1, day);
        } else {
            dateObject = new Date(dateText);
        }

        return dateObject.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // Get today's readings
    const todayReadings = readings.filter((reading) => {
        const dateText = String(reading.reading_date || "").slice(0, 10);
        return dateText === today;
    });

    // Total number of readings today
    const totalToday = todayReadings.length;

    // Calculate each time slot separately
    const todayChartData = slots.map((slot, index) => {

        const slotReadings = todayReadings.filter(
            (reading) => reading.time_slot === slot
        );

        const count = slotReadings.length;

        const percentage = totalToday > 0
            ? (count / totalToday) * 100
            : 0;

        return {
            name: slot,
            count: count,
            value: count,
            percentage: Number(percentage.toFixed(1)),
            values: slotReadings.map(
                (reading) => Number(reading.glucose_value)
            ),
            color: chartColors[index]
        };
    });

    // Only show slots containing readings in the pie chart
    const chartData = todayChartData.filter(
        (item) => item.count > 0
    );

    // Overall glucose statistics
    const values = readings.map(
        (r) => Number(r.glucose_value)
    );

    const average = values.length
        ? (
            values.reduce((sum, value) => sum + value, 0) /
            values.length
        ).toFixed(1)
        : "—";

    const highest = values.length ? Math.max(...values) : "—";
    const lowest = values.length ? Math.min(...values) : "—";

    return (
        <div className="dashboard-layout">

            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
                <div className="sidebar-brand">
                    <HeartPulse size={30} />
                    <span>Sweety</span>
                    <button
                        className="mobile-close"
                        onClick={() => setMobileMenu(false)}
                    >
                        <X />
                    </button>
                </div>

                <div className="sidebar-section">MENU</div>

                <a className="sidebar-link active" href="/dashboard">
                    <LayoutDashboard size={19} />
                    Dashboard
                </a>

                <a className="sidebar-link" href="/reports">
                    <FileText size={19} />
                    Reports
                </a>

                <div className="sidebar-bottom">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {(user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <strong>{user?.name || "User"}</strong>
                            <span>Personal Account</span>
                        </div>
                    </div>

                    <button className="logout-btn" onClick={logout}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {mobileMenu && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileMenu(false)}
                />
            )}

            {/* Main Dashboard */}
            <main className="dashboard-main">

                {/* Topbar */}
                <header className="topbar">
                    <button
                        className="menu-toggle"
                        onClick={() => setMobileMenu(true)}
                    >
                        <Menu />
                    </button>

                    <div>
                        <span className="topbar-label">HEALTH OVERVIEW</span>
                        <h2>My Dashboard</h2>
                    </div>

                    <div className="topbar-date">
                        <CalendarDays size={17} />
                        {new Date().toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </div>
                </header>

                {/* Welcome */}
                <section className="welcome-section">
                    <div>
                        <h1>
                            Hello, {user?.name || "there"}! <span>👋</span>
                        </h1>
                        <p>
                            Keep track of your glucose readings and stay informed.
                        </p>
                    </div>

                    <button
                        className="add-reading-btn"
                        onClick={() => {
                            if (editingId !== null) {
                                resetForm();
                            } else {
                                setShowForm(!showForm);
                            }
                        }}
                    >
                        <Plus size={19} />
                        Add Reading
                    </button>
                </section>

                {error && <div className="alert alert-error">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                {/* Add / Edit Form */}
                {showForm && (
                    <section className="reading-form-card">
                        <div className="form-heading">
                            <div>
                                <h3>
                                    {editingId !== null
                                        ? "Edit glucose reading"
                                        : "Add glucose reading"}
                                </h3>
                                <p>
                                    {editingId !== null
                                        ? "Update the details of your reading."
                                        : "Enter your reading details below."}
                                </p>
                            </div>

                            <button className="close-form" onClick={resetForm}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="reading-form">
                            <div className="form-field">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={form.reading_date}
                                    max={today}
                                    required
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            reading_date: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="form-field">
                                <label>Time slot</label>
                                <select
                                    value={form.time_slot}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            time_slot: e.target.value
                                        })
                                    }
                                >
                                    {slots.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Glucose value (mg/dL)</label>
                                <input
                                    type="number"
                                    min="40"
                                    max="600"
                                    step="1"
                                    placeholder="Example: 110"
                                    value={form.glucose_value}
                                    required
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            glucose_value: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <button className="primary-btn form-submit" type="submit">
                                {editingId !== null ? "Save Changes" : "Save Reading"}
                            </button>

                            {editingId !== null && (
                                <button
                                    className="close-form"
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </section>
                )}

                {/* Statistics Cards */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon purple"><Droplets /></div>
                        <div>
                            <span>Total Readings</span>
                            <h2>{loading ? "..." : readings.length}</h2>
                            <small>All recorded entries</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon blue"><Activity /></div>
                        <div>
                            <span>Average Glucose</span>
                            <h2>{loading ? "..." : average}</h2>
                            <small>mg/dL · All readings</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange"><TrendingUp /></div>
                        <div>
                            <span>Highest Reading</span>
                            <h2>{loading ? "..." : highest}</h2>
                            <small>mg/dL · All readings</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green"><HeartPulse /></div>
                        <div>
                            <span>Lowest Reading</span>
                            <h2>{loading ? "..." : lowest}</h2>
                            <small>mg/dL · All readings</small>
                        </div>
                    </div>
                </section>

                {/* Today's Pie Chart */}
                <section className="readings-card">
                    <div className="section-heading">
                        <div>
                            <h3>Today's Reading Distribution</h3>
                            <p>Hover over a color to see reading details</p>
                        </div>

                        <span className="glucose-value">
                            {loading ? "..." : `${totalToday} Total Today`}
                        </span>
                    </div>

                    {loading ? (
                        <p className="empty-state">Loading chart...</p>
                    ) : totalToday === 0 ? (
                        <div className="empty-state">
                            <Droplets size={40} />
                            <h3>No readings today</h3>
                            <p>Add a glucose reading today to see your chart.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: "100%", height: "300px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={105}
                                            innerRadius={55}
                                            paddingAngle={3}
                                        >
                                            {chartData.map((entry) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload?.length) {
                                                    return null;
                                                }

                                                const item = payload[0].payload;

                                                return (
                                                    <div style={{
                                                        background: "#fff",
                                                        padding: "14px",
                                                        borderRadius: "10px",
                                                        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                                                        border: `2px solid ${item.color}`,
                                                        color: "#222",
                                                        minWidth: "190px"
                                                    }}>
                                                        <strong>{item.name}</strong>

                                                        <p style={{ margin: "7px 0" }}>
                                                            Readings: <strong>{item.count}</strong>
                                                        </p>

                                                        <p style={{ margin: "7px 0" }}>
                                                            Percentage: <strong>{item.percentage}%</strong>
                                                        </p>

                                                        <p style={{ margin: "7px 0" }}>
                                                            Glucose values:{" "}
                                                            <strong>
                                                                {item.values.join(", ")} mg/dL
                                                            </strong>
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend with individual percentages */}
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: "18px",
                                padding: "10px"
                            }}>
                                {todayChartData.map((item) => (
                                    <div
                                        key={item.name}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "7px"
                                        }}
                                    >
                                        <span style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            background: item.color
                                        }} />

                                        <span style={{ fontSize: "13px" }}>
                                            {item.name}: {item.count} ({item.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* Recent Readings */}
                <section className="readings-card">
                    <div className="section-heading">
                        <div>
                            <h3>Recent glucose readings</h3>
                            <p>Your recorded glucose history</p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="empty-state">Loading readings...</p>
                    ) : readings.length === 0 ? (
                        <div className="empty-state">
                            <Droplets size={40} />
                            <h3>No readings yet</h3>
                            <p>Add your first glucose reading to get started.</p>

                            <button
                                className="add-reading-btn"
                                onClick={() => setShowForm(true)}
                            >
                                <Plus size={18} />
                                Add First Reading
                            </button>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="readings-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Glucose Value</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {readings.map((reading) => (
                                        <tr key={reading.id}>
                                            <td>{formatDate(reading.reading_date)}</td>
                                            <td>{reading.time_slot}</td>
                                            <td>
                                                <span className="glucose-value">
                                                    {reading.glucose_value} mg/dL
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="delete-btn"
                                                    title="Edit reading"
                                                    onClick={() => handleEdit(reading)}
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    title="Delete reading"
                                                    onClick={() => handleDelete(reading.id)}
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="dashboard-footer">
                    Sweety · Blood Glucose Tracker
                    <span>
                        For personal tracking only. Not a substitute for medical advice.
                    </span>
                </footer>
            </main>
        </div>
    );
}

export default Dashboard;
