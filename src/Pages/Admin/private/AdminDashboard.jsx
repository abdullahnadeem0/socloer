// src/Pages/Admin/private/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import adminApi from '../../../api/adminApi';
import {
    FaUsers, FaUserCheck, FaUserClock, FaUserTimes,
    FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle,
    FaMoneyBillWave, FaArrowDown, FaArrowUp, FaWallet,
    FaUniversity, FaGraduationCap, FaSpinner,
    FaExclamationTriangle, FaSync, FaChartLine,
    FaArrowRight, FaCalendarAlt, FaUserTie,
    FaChartPie, FaChartBar, FaCreditCard, FaExchangeAlt,
    FaRegClock, FaRegFileAlt, FaBuilding, FaBook
} from 'react-icons/fa';

// ============================================
// ANIMATED DONUT CHART
// ============================================
const AnimatedDonutChart = ({ data, title, centerLabel = "Total" }) => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    let cumulativePercent = 0;

    const segments = data.map(item => {
        const percent = (item.value / total) * 100;
        const startPercent = cumulativePercent;
        cumulativePercent += percent;
        return { ...item, percent, startPercent };
    });

    const radius = 65;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="admin-dashboard-chart-container">
            <h4 className="admin-dashboard-chart-title">
                <FaChartPie className="admin-dashboard-chart-title-icon" />
                {title}
            </h4>
            <div className="admin-dashboard-donut-wrapper">
                <svg viewBox="0 0 200 200" className="admin-dashboard-donut-svg">
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="28"
                    />

                    {segments.map((seg, idx) => {
                        const dashLength = animated ? (seg.percent / 100) * circumference : 0;
                        const dashOffset = (seg.startPercent / 100) * circumference;
                        return (
                            <circle
                                key={idx}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="28"
                                strokeDasharray={`${dashLength} ${circumference}`}
                                strokeDashoffset={-dashOffset}
                                transform="rotate(-90 100 100)"
                                strokeLinecap="round"
                                className="admin-dashboard-donut-segment"
                                style={{
                                    transition: `stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.3}s`
                                }}
                            />
                        );
                    })}
                </svg>
                <div className="admin-dashboard-donut-center">
                    <strong>{total}</strong>
                    <span>{centerLabel}</span>
                </div>
            </div>
            <div className="admin-dashboard-donut-legend">
                {data.map((item, idx) => (
                    <div
                        key={idx}
                        className={`admin-dashboard-legend-item admin-dashboard-legend-animated-${idx}`}
                        style={{
                            animationDelay: `${1.5 + idx * 0.1}s`
                        }}
                    >
                        <span
                            className="admin-dashboard-legend-color"
                            style={{ background: item.color }}
                        ></span>
                        <span className="admin-dashboard-legend-label">{item.label}</span>
                        <span className="admin-dashboard-legend-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// ANIMATED BAR CHART
// ============================================
const AnimatedBarChart = ({ data, title }) => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="admin-dashboard-chart-container">
            <h4 className="admin-dashboard-chart-title">
                <FaChartBar className="admin-dashboard-chart-title-icon" />
                {title}
            </h4>
            <div className="admin-dashboard-bar-chart">
                {data.map((item, idx) => (
                    <div key={idx} className="admin-dashboard-bar-item">
                        <div className="admin-dashboard-bar-wrapper">
                            <div
                                className="admin-dashboard-bar"
                                style={{
                                    height: animated ? `${(item.value / maxValue) * 100}%` : '0%',
                                    background: item.color || 'linear-gradient(180deg, #60a5fa, #2563eb)',
                                    transition: `height 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.2}s`
                                }}
                            >
                                <span className="admin-dashboard-bar-value">
                                    {item.value.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <span className="admin-dashboard-bar-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// ANIMATED LINE CHART
// ============================================
const AnimatedLineChart = ({ data, color = '#2563eb', title }) => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const width = 300;
    const height = 150;
    const padding = 25;

    const points = data.map((item, idx) => {
        const x = padding + (idx / (data.length - 1 || 1)) * (width - padding * 2);
        const y = height - padding - (item.value / maxValue) * (height - padding * 2);
        return { x, y, ...item };
    });

    const pathData = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const areaPath = pathData + ` L ${points[points.length - 1]?.x} ${height - padding} L ${points[0]?.x} ${height - padding} Z`;

    const pathLength = 500;

    return (
        <div className="admin-dashboard-chart-container">
            <h4 className="admin-dashboard-chart-title">
                <FaChartLine className="admin-dashboard-chart-title-icon" />
                {title}
            </h4>
            <div className="admin-dashboard-line-chart">
                <svg viewBox={`0 0 ${width} ${height}`} className="admin-dashboard-line-svg">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                        <line
                            key={idx}
                            x1={padding}
                            y1={padding + ratio * (height - padding * 2)}
                            x2={width - padding}
                            y2={padding + ratio * (height - padding * 2)}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                        />
                    ))}

                    <path
                        d={areaPath}
                        fill={color}
                        opacity={animated ? "0.1" : "0"}
                        style={{ transition: 'opacity 1s ease 0.8s' }}
                    />

                    <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={animated ? 0 : pathLength}
                        style={{
                            transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    />

                    {points.map((p, idx) => (
                        <circle
                            key={idx}
                            cx={p.x}
                            cy={p.y}
                            r={animated ? "5" : "0"}
                            fill="#fff"
                            stroke={color}
                            strokeWidth="3"
                            style={{
                                transition: `r 0.3s ease ${1 + idx * 0.15}s`
                            }}
                        />
                    ))}
                </svg>
                <div className="admin-dashboard-line-labels">
                    {data.map((item, idx) => (
                        <span
                            key={idx}
                            className="admin-dashboard-line-label"
                            style={{ animationDelay: `${1.2 + idx * 0.1}s` }}
                        >
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ============================================
// ANIMATED COUNTER
// ============================================
const AnimatedCounter = ({ value, duration = 1500 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;
        const startValue = 0;
        const endValue = parseFloat(value) || 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * easeOut;

            setCount(current);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <>{Math.round(count)}</>;
};

const AnimatedCurrencyCounter = ({ value, duration = 1500 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;
        const endValue = parseFloat(value) || 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = endValue * easeOut;

            setCount(current);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <>Rs {Number(count).toLocaleString('en-PK', { maximumFractionDigits: 0 })}</>;
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon, value, label, small, color, onClick, delay = 0 }) => (
    <div
        className={`admin-dashboard-stat-card admin-dashboard-stat-card-${color} admin-dashboard-slide-up`}
        onClick={onClick}
        style={{ animationDelay: `${delay}s` }}
    >
        <div className="admin-dashboard-stat-icon-wrapper">
            <div className="admin-dashboard-stat-icon">{icon}</div>
        </div>
        <div className="admin-dashboard-stat-body">
            <h3 className="admin-dashboard-stat-value">{value}</h3>
            <p className="admin-dashboard-stat-label">{label}</p>
            {small && <small className="admin-dashboard-stat-small">{small}</small>}
        </div>
        <div className="admin-dashboard-stat-arrow">
            <FaArrowRight />
        </div>
    </div>
);

// ============================================
// MAIN DASHBOARD
// ============================================
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setServerError('');
        try {
            const response = await adminApi.getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('❌ Dashboard error:', error);
            setServerError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'Rs 0';
        return `Rs ${Number(amount).toLocaleString('en-PK')}`;
    };

    const getAgentStatusBadge = (status) => {
        const map = {
            'pending': { class: 'admin-dashboard-badge-pending', label: 'Pending' },
            'approved': { class: 'admin-dashboard-badge-approved', label: 'Approved' },
            'rejected': { class: 'admin-dashboard-badge-rejected', label: 'Rejected' }
        };
        const c = map[status] || map['pending'];
        return <span className={`admin-dashboard-mini-badge ${c.class}`}>{c.label}</span>;
    };

    const getAppStatusBadge = (status) => {
        const map = {
            'submitted': { class: 'admin-dashboard-badge-pending', label: 'Submitted' },
            'under-review': { class: 'admin-dashboard-badge-pending', label: 'Review' },
            'pending-documents': { class: 'admin-dashboard-badge-pending', label: 'Pending' },
            'approved': { class: 'admin-dashboard-badge-approved', label: 'Approved' },
            'rejected': { class: 'admin-dashboard-badge-rejected', label: 'Rejected' },
            'scholarship-disbursed': { class: 'admin-dashboard-badge-disbursed', label: 'Disbursed' }
        };
        const c = map[status] || map['submitted'];
        return <span className={`admin-dashboard-mini-badge ${c.class}`}>{c.label}</span>;
    };

    if (loading) {
        return (
            <div className="admin-dashboard-page">
                <div className="admin-dashboard-loading-state">
                    <FaSpinner className="admin-dashboard-spinner-large" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (serverError || !stats) {
        return (
            <div className="admin-dashboard-page">
                <div className="admin-dashboard-error-state">
                    <FaExclamationTriangle className="admin-dashboard-error-icon" />
                    <h2>Failed to Load</h2>
                    <p>{serverError}</p>
                    <button className="admin-dashboard-retry-btn" onClick={fetchStats}>
                        <FaSync /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Chart Data
    const agentChartData = [
        { label: 'Approved', value: stats.agents.approved, color: '#10b981' },
        { label: 'Pending', value: stats.agents.pending, color: '#f59e0b' },
        { label: 'Rejected', value: stats.agents.rejected, color: '#ef4444' }
    ];

    const appChartData = [
        { label: 'Approved', value: stats.applications.approved, color: '#10b981' },
        { label: 'Pending', value: stats.applications.pending, color: '#f59e0b' },
        { label: 'Rejected', value: stats.applications.rejected, color: '#ef4444' },
        { label: 'Disbursed', value: stats.applications.disbursed, color: '#2563eb' }
    ];

    const paymentBarData = [
        { label: 'Received', value: Math.round(stats.payments.totalReceived), color: 'linear-gradient(180deg, #10b981, #059669)' },
        { label: 'Sent', value: Math.round(stats.payments.totalSent), color: 'linear-gradient(180deg, #60a5fa, #2563eb)' }
    ];

    const lineChartData = [
        { label: 'Today', value: stats.payments.todayReceived + stats.payments.todaySent },
        { label: 'Received', value: stats.payments.totalReceived },
        { label: 'Sent', value: stats.payments.totalSent }
    ];

    return (
        <div className="admin-dashboard-page">
            <div className="admin-dashboard-wrapper">

                {/* ===== HEADER ===== */}
                <div className="admin-dashboard-header admin-dashboard-fade-in">
                    <div className="admin-dashboard-header-left">
                        <div className="admin-dashboard-header-icon-wrapper">
                            <FaChartLine className="admin-dashboard-header-icon" />
                        </div>
                        <div>
                            <h1 className="admin-dashboard-title">Dashboard</h1>
                            <p className="admin-dashboard-subtitle">
                                Welcome back! Here's your overview for today
                            </p>
                        </div>
                    </div>
                    <button className="admin-dashboard-refresh-btn" onClick={fetchStats}>
                        <FaSync /> Refresh Data
                    </button>
                </div>

                {/* ===== QUICK SUMMARY CARDS ===== */}
                <div className="admin-dashboard-summary-row">
                    <div className="admin-dashboard-summary-card admin-dashboard-summary-agents admin-dashboard-slide-up" style={{animationDelay: '0.05s'}} onClick={() => navigate('/admin/agents')}>
                        <div className="admin-dashboard-summary-icon"><FaUsers /></div>
                        <div className="admin-dashboard-summary-content">
                            <span className="admin-dashboard-summary-value"><AnimatedCounter value={stats.agents.total} /></span>
                            <span className="admin-dashboard-summary-label">Total Agents</span>
                        </div>
                    </div>
                    <div className="admin-dashboard-summary-card admin-dashboard-summary-apps admin-dashboard-slide-up" style={{animationDelay: '0.1s'}} onClick={() => navigate('/admin/applications')}>
                        <div className="admin-dashboard-summary-icon"><FaFileAlt /></div>
                        <div className="admin-dashboard-summary-content">
                            <span className="admin-dashboard-summary-value"><AnimatedCounter value={stats.applications.total} /></span>
                            <span className="admin-dashboard-summary-label">Total Applications</span>
                        </div>
                    </div>
                    <div className="admin-dashboard-summary-card admin-dashboard-summary-received admin-dashboard-slide-up" style={{animationDelay: '0.15s'}} onClick={() => navigate('/admin/payments')}>
                        <div className="admin-dashboard-summary-icon"><FaArrowDown /></div>
                        <div className="admin-dashboard-summary-content">
                            <span className="admin-dashboard-summary-value"><AnimatedCurrencyCounter value={stats.payments.totalReceived} /></span>
                            <span className="admin-dashboard-summary-label">Total Received</span>
                        </div>
                    </div>
                    <div className="admin-dashboard-summary-card admin-dashboard-summary-balance admin-dashboard-slide-up" style={{animationDelay: '0.2s'}} onClick={() => navigate('/admin/payments')}>
                        <div className="admin-dashboard-summary-icon"><FaWallet /></div>
                        <div className="admin-dashboard-summary-content">
                            <span className="admin-dashboard-summary-value"><AnimatedCurrencyCounter value={stats.payments.balance} /></span>
                            <span className="admin-dashboard-summary-label">Balance</span>
                        </div>
                    </div>
                </div>

                {/* ===== AGENTS SECTION ===== */}
                <div className="admin-dashboard-section-title-bar">
                    <div className="admin-dashboard-section-title-left">
                        <FaUsers className="admin-dashboard-section-title-icon" />
                        <h2 className="admin-dashboard-section-title">Agents Overview</h2>
                    </div>
                    <button className="admin-dashboard-view-all-link" onClick={() => navigate('/admin/agents')}>
                        View All <FaArrowRight />
                    </button>
                </div>

                <div className="admin-dashboard-stats-grid-agents">
                    <StatCard
                        icon={<FaUsers />}
                        value={<AnimatedCounter value={stats.agents.total} />}
                        label="Total Agents"
                        color="primary"
                        onClick={() => navigate('/admin/agents')}
                        delay={0.1}
                    />
                    <StatCard
                        icon={<FaUserCheck />}
                        value={<AnimatedCounter value={stats.agents.approved} />}
                        label="Approved"
                        color="success"
                        onClick={() => navigate('/admin/agents/approved')}
                        delay={0.15}
                    />
                    <StatCard
                        icon={<FaUserClock />}
                        value={<AnimatedCounter value={stats.agents.pending} />}
                        label="Pending"
                        color="warning"
                        onClick={() => navigate('/admin/agents/pending')}
                        delay={0.2}
                    />
                    <StatCard
                        icon={<FaUserTimes />}
                        value={<AnimatedCounter value={stats.agents.rejected} />}
                        label="Rejected"
                        color="error"
                        onClick={() => navigate('/admin/agents/rejected')}
                        delay={0.25}
                    />
                </div>

                {/* ===== APPLICATIONS SECTION ===== */}
                <div className="admin-dashboard-section-title-bar">
                    <div className="admin-dashboard-section-title-left">
                        <FaFileAlt className="admin-dashboard-section-title-icon" />
                        <h2 className="admin-dashboard-section-title">Applications Overview</h2>
                    </div>
                    <button className="admin-dashboard-view-all-link" onClick={() => navigate('/admin/applications')}>
                        View All <FaArrowRight />
                    </button>
                </div>

                <div className="admin-dashboard-stats-grid-apps">
                    <StatCard
                        icon={<FaFileAlt />}
                        value={<AnimatedCounter value={stats.applications.total} />}
                        label="Total"
                        color="primary"
                        onClick={() => navigate('/admin/applications')}
                        delay={0.1}
                    />
                    <StatCard
                        icon={<FaCheckCircle />}
                        value={<AnimatedCounter value={stats.applications.approved} />}
                        label="Approved"
                        color="success"
                        onClick={() => navigate('/admin/applications?status=approved')}
                        delay={0.15}
                    />
                    <StatCard
                        icon={<FaClock />}
                        value={<AnimatedCounter value={stats.applications.pending} />}
                        label="Pending"
                        color="warning"
                        onClick={() => navigate('/admin/applications?status=pending')}
                        delay={0.2}
                    />
                    <StatCard
                        icon={<FaTimesCircle />}
                        value={<AnimatedCounter value={stats.applications.rejected} />}
                        label="Rejected"
                        color="error"
                        onClick={() => navigate('/admin/applications?status=rejected')}
                        delay={0.25}
                    />
                    <StatCard
                        icon={<FaMoneyBillWave />}
                        value={<AnimatedCounter value={stats.applications.disbursed} />}
                        label="Disbursed"
                        color="info"
                        onClick={() => navigate('/admin/applications?status=scholarship-disbursed')}
                        delay={0.3}
                    />
                </div>

                {/* ===== CHARTS ROW ===== */}
                <div className="admin-dashboard-charts-row">
                    <AnimatedDonutChart
                        data={agentChartData}
                        title="Agents Distribution"
                        centerLabel="Agents"
                    />
                    <AnimatedDonutChart
                        data={appChartData}
                        title="Applications Distribution"
                        centerLabel="Apps"
                    />
                </div>

                {/* ===== PAYMENTS SECTION ===== */}
                <div className="admin-dashboard-section-title-bar">
                    <div className="admin-dashboard-section-title-left">
                        <FaMoneyBillWave className="admin-dashboard-section-title-icon" />
                        <h2 className="admin-dashboard-section-title">Payments Overview</h2>
                    </div>
                    <button className="admin-dashboard-view-all-link" onClick={() => navigate('/admin/payments')}>
                        View All <FaArrowRight />
                    </button>
                </div>

                <div className="admin-dashboard-stats-grid-payments">
                    <StatCard
                        icon={<FaArrowDown />}
                        value={<AnimatedCurrencyCounter value={stats.payments.totalReceived} />}
                        label="Total Received"
                        small={`${stats.payments.receivedCount} transactions`}
                        color="success"
                        onClick={() => navigate('/admin/payments')}
                        delay={0.1}
                    />
                    <StatCard
                        icon={<FaArrowUp />}
                        value={<AnimatedCurrencyCounter value={stats.payments.totalSent} />}
                        label="Total Sent"
                        small={`${stats.payments.sentCount} transactions`}
                        color="primary"
                        onClick={() => navigate('/admin/payments')}
                        delay={0.15}
                    />
                    <StatCard
                        icon={<FaWallet />}
                        value={<AnimatedCurrencyCounter value={stats.payments.balance} />}
                        label="Balance"
                        color="info"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<FaCalendarAlt />}
                        value={<AnimatedCurrencyCounter value={stats.payments.todayReceived + stats.payments.todaySent} />}
                        label="Today"
                        color="warning"
                        delay={0.25}
                    />
                </div>

                {/* ===== PAYMENT CHARTS ===== */}
                <div className="admin-dashboard-charts-row">
                    <AnimatedBarChart data={paymentBarData} title="Payments Comparison" />
                    <AnimatedLineChart data={lineChartData} color="#2563eb" title="Payment Trends" />
                </div>

                {/* ===== OTHER STATS ===== */}
                <div className="admin-dashboard-section-title-bar">
                    <div className="admin-dashboard-section-title-left">
                        <FaUniversity className="admin-dashboard-section-title-icon" />
                        <h2 className="admin-dashboard-section-title">Academics</h2>
                    </div>
                </div>

                <div className="admin-dashboard-stats-grid-other">
                    <StatCard
                        icon={<FaUniversity />}
                        value={<AnimatedCounter value={stats.universities} />}
                        label="Universities"
                        color="primary"
                        onClick={() => navigate('/admin/universities')}
                        delay={0.1}
                    />
                    <StatCard
                        icon={<FaGraduationCap />}
                        value={<AnimatedCounter value={stats.programs} />}
                        label="Programs"
                        color="info"
                        onClick={() => navigate('/admin/programs')}
                        delay={0.15}
                    />
                </div>

                {/* ===== RECENT ACTIVITY ===== */}
                <div className="admin-dashboard-section-title-bar">
                    <div className="admin-dashboard-section-title-left">
                        <FaRegClock className="admin-dashboard-section-title-icon" />
                        <h2 className="admin-dashboard-section-title">Recent Activity</h2>
                    </div>
                </div>

                <div className="admin-dashboard-recent-grid">
                    <div className="admin-dashboard-recent-card admin-dashboard-slide-up" style={{animationDelay: '0.1s'}}>
                        <div className="admin-dashboard-recent-card-header">
                            <FaRegFileAlt className="admin-dashboard-recent-card-icon" />
                            <h3>Recent Applications</h3>
                        </div>
                        <div className="admin-dashboard-recent-list">
                            {stats.recentApplications.length === 0 ? (
                                <p className="admin-dashboard-empty-text">No applications yet</p>
                            ) : (
                                stats.recentApplications.map((app) => (
                                    <div
                                        key={app._id}
                                        className="admin-dashboard-recent-item"
                                        onClick={() => navigate(`/admin/applications/${app._id}`)}
                                    >
                                        <div className="admin-dashboard-recent-item-icon admin-dashboard-recent-item-icon-app">
                                            <FaFileAlt />
                                        </div>
                                        <div className="admin-dashboard-recent-item-info">
                                            <strong>{app.applicationNumber}</strong>
                                            <small>{app.student?.firstName} {app.student?.lastName}</small>
                                            <small className="admin-dashboard-agent-text">Agent: {app.agent?.name}</small>
                                        </div>
                                        {getAppStatusBadge(app.status)}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="admin-dashboard-recent-card admin-dashboard-slide-up" style={{animationDelay: '0.2s'}}>
                        <div className="admin-dashboard-recent-card-header">
                            <FaUserTie className="admin-dashboard-recent-card-icon" />
                            <h3>Recent Agents</h3>
                        </div>
                        <div className="admin-dashboard-recent-list">
                            {stats.recentAgents.length === 0 ? (
                                <p className="admin-dashboard-empty-text">No agents yet</p>
                            ) : (
                                stats.recentAgents.map(agent => (
                                    <div
                                        key={agent._id}
                                        className="admin-dashboard-recent-item"
                                        onClick={() => navigate('/admin/agents')}
                                    >
                                        <div className="admin-dashboard-recent-item-avatar">
                                            {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div className="admin-dashboard-recent-item-info">
                                            <strong>{agent.name}</strong>
                                            <small>{agent.email}</small>
                                        </div>
                                        {getAgentStatusBadge(agent.approvalStatus)}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="admin-dashboard-recent-card admin-dashboard-slide-up" style={{animationDelay: '0.3s'}}>
                        <div className="admin-dashboard-recent-card-header">
                            <FaCreditCard className="admin-dashboard-recent-card-icon" />
                            <h3>Recent Payments</h3>
                        </div>
                        <div className="admin-dashboard-recent-list">
                            {stats.recentPayments.length === 0 ? (
                                <p className="admin-dashboard-empty-text">No payments yet</p>
                            ) : (
                                stats.recentPayments.map(payment => (
                                    <div
                                        key={payment._id}
                                        className="admin-dashboard-recent-item"
                                        onClick={() => navigate('/admin/payments')}
                                    >
                                        <div className={`admin-dashboard-recent-item-icon admin-dashboard-recent-item-icon-${payment.type}`}>
                                            {payment.type === 'receive' ? <FaArrowDown /> : <FaArrowUp />}
                                        </div>
                                        <div className="admin-dashboard-recent-item-info">
                                            <strong>{payment.paymentNumber}</strong>
                                            <small>
                                                {payment.type === 'receive'
                                                    ? payment.fromName || 'Received'
                                                    : payment.toName || payment.agentName || 'Sent'}
                                            </small>
                                        </div>
                                        <div className={`admin-dashboard-recent-payment-amount admin-dashboard-payment-${payment.type}`}>
                                            {payment.type === 'receive' ? '+' : '-'}{formatCurrency(payment.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;