// src/Pages/Agent/private/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentDashboard.css';
import agentApi from '../../../api/agentApi';
import {
    FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle,
    FaMoneyBillWave, FaWallet, FaCalendarAlt,
    FaSpinner, FaExclamationTriangle, FaSync, FaChartLine,
    FaArrowRight, FaArrowDown, FaUniversity, FaGraduationCap,
    FaPlus, FaEye, FaChartPie, FaChartBar, FaCreditCard,
    FaRegClock, FaRegFileAlt, FaArrowUp
} from 'react-icons/fa';

// ============================================
// ANIMATED DONUT CHART
// ============================================
const AgentAnimatedDonutChart = ({ data, title, centerLabel = "Total" }) => {
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
        <div className="agent-dashboard-chart-container">
            <h4 className="agent-dashboard-chart-title">
                <FaChartPie className="agent-dashboard-chart-title-icon" />
                {title}
            </h4>
            <div className="agent-dashboard-donut-wrapper">
                <svg viewBox="0 0 200 200" className="agent-dashboard-donut-svg">
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
                                className="agent-dashboard-donut-segment"
                                style={{
                                    transition: `stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.3}s`
                                }}
                            />
                        );
                    })}
                </svg>
                <div className="agent-dashboard-donut-center">
                    <strong>{total}</strong>
                    <span>{centerLabel}</span>
                </div>
            </div>
            <div className="agent-dashboard-donut-legend">
                {data.map((item, idx) => (
                    <div
                        key={idx}
                        className={`agent-dashboard-legend-item agent-dashboard-legend-animated-${idx}`}
                        style={{ animationDelay: `${1.5 + idx * 0.1}s` }}
                    >
                        <span
                            className="agent-dashboard-legend-color"
                            style={{ background: item.color }}
                        ></span>
                        <span className="agent-dashboard-legend-label">{item.label}</span>
                        <span className="agent-dashboard-legend-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// ANIMATED BAR CHART
// ============================================
const AgentAnimatedBarChart = ({ data, title }) => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="agent-dashboard-chart-container">
            <h4 className="agent-dashboard-chart-title">
                <FaChartBar className="agent-dashboard-chart-title-icon" />
                {title}
            </h4>
            <div className="agent-dashboard-bar-chart">
                {data.map((item, idx) => (
                    <div key={idx} className="agent-dashboard-bar-item">
                        <div className="agent-dashboard-bar-wrapper">
                            <div
                                className="agent-dashboard-bar"
                                style={{
                                    height: animated ? `${(item.value / maxValue) * 100}%` : '0%',
                                    background: item.color || 'linear-gradient(180deg, #60a5fa, #2563eb)',
                                    transition: `height 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.2}s`
                                }}
                            >
                                <span className="agent-dashboard-bar-value">
                                    Rs {Number(item.value).toLocaleString('en-PK')}
                                </span>
                            </div>
                        </div>
                        <span className="agent-dashboard-bar-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// ANIMATED LINE CHART
// ============================================
const AgentAnimatedLineChart = ({ data, color = '#2563eb', title }) => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!data || data.length === 0) {
        return (
            <div className="agent-dashboard-chart-container">
                <h4 className="agent-dashboard-chart-title">
                    <FaChartLine className="agent-dashboard-chart-title-icon" />
                    {title}
                </h4>
                <p className="agent-dashboard-empty-chart">No data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const width = 400;
    const height = 180;
    const padding = 30;

    const points = data.map((item, idx) => {
        const x = padding + (idx / (data.length - 1 || 1)) * (width - padding * 2);
        const y = height - padding - (item.value / maxValue) * (height - padding * 2);
        return { x, y, ...item };
    });

    const pathData = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const areaPath = pathData + ` L ${points[points.length - 1]?.x} ${height - padding} L ${points[0]?.x} ${height - padding} Z`;
    const pathLength = 1000;

    return (
        <div className="agent-dashboard-chart-container">
            <h4 className="agent-dashboard-chart-title">
                <FaChartLine className="agent-dashboard-chart-title-icon" />
                {title}
            </h4>
            <div className="agent-dashboard-line-chart">
                <svg viewBox={`0 0 ${width} ${height}`} className="agent-dashboard-line-svg">
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
                <div className="agent-dashboard-line-labels">
                    {data.map((item, idx) => (
                        <span
                            key={idx}
                            className="agent-dashboard-line-label"
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
const AgentAnimatedCounter = ({ value, duration = 1500 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;
        const endValue = parseFloat(value) || 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(endValue * easeOut);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <>{Math.round(count)}</>;
};

const AgentAnimatedCurrencyCounter = ({ value, duration = 1500 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;
        const endValue = parseFloat(value) || 0;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(endValue * easeOut);

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
        className={`agent-dashboard-stat-card agent-dashboard-stat-card-${color} agent-dashboard-slide-up`}
        onClick={onClick}
        style={{ animationDelay: `${delay}s` }}
    >
        <div className="agent-dashboard-stat-icon-wrapper">
            <div className="agent-dashboard-stat-icon">{icon}</div>
        </div>
        <div className="agent-dashboard-stat-body">
            <h3 className="agent-dashboard-stat-value">{value}</h3>
            <p className="agent-dashboard-stat-label">{label}</p>
            {small && <small className="agent-dashboard-stat-small">{small}</small>}
        </div>
        <div className="agent-dashboard-stat-arrow">
            <FaArrowRight />
        </div>
    </div>
);

// ============================================
// MAIN AGENT DASHBOARD
// ============================================
const AgentDashboard = () => {
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
            const response = await agentApi.getDashboardStats();
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

    const getAppStatusBadge = (status) => {
        const map = {
            'submitted': { class: 'agent-dashboard-badge-pending', label: 'Submitted' },
            'under-review': { class: 'agent-dashboard-badge-pending', label: 'Review' },
            'pending-documents': { class: 'agent-dashboard-badge-pending', label: 'Pending' },
            'approved': { class: 'agent-dashboard-badge-approved', label: 'Approved' },
            'rejected': { class: 'agent-dashboard-badge-rejected', label: 'Rejected' },
            'scholarship-disbursed': { class: 'agent-dashboard-badge-disbursed', label: 'Disbursed' }
        };
        const c = map[status] || map['submitted'];
        return <span className={`agent-dashboard-mini-badge ${c.class}`}>{c.label}</span>;
    };

    if (loading) {
        return (
            <div className="agent-dashboard-page">
                <div className="agent-dashboard-loading-state">
                    <FaSpinner className="agent-dashboard-spinner-large" />
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (serverError || !stats) {
        return (
            <div className="agent-dashboard-page">
                <div className="agent-dashboard-error-state">
                    <FaExclamationTriangle className="agent-dashboard-error-icon" />
                    <h2>Failed to Load</h2>
                    <p>{serverError}</p>
                    <button className="agent-dashboard-retry-btn" onClick={fetchStats}>
                        <FaSync /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Chart Data
    const appChartData = [
        { label: 'Approved', value: stats.applications.approved, color: '#10b981' },
        { label: 'Pending', value: stats.applications.pending, color: '#f59e0b' },
        { label: 'Rejected', value: stats.applications.rejected, color: '#ef4444' },
        { label: 'Disbursed', value: stats.applications.disbursed, color: '#2563eb' }
    ].filter(item => item.value > 0);

    const paymentBarData = [
        { label: 'Today', value: Math.round(stats.payments.todayReceived), color: 'linear-gradient(180deg, #60a5fa, #2563eb)' },
        { label: 'This Week', value: Math.round(stats.payments.weekReceived), color: 'linear-gradient(180deg, #10b981, #059669)' },
        { label: 'This Month', value: Math.round(stats.payments.monthReceived), color: 'linear-gradient(180deg, #f59e0b, #d97706)' },
        { label: 'Total', value: Math.round(stats.payments.totalReceived), color: 'linear-gradient(180deg, #a78bfa, #7c3aed)' }
    ];

    const monthlyLineData = stats.payments.monthlySummary.map(m => ({
        label: m.label,
        value: m.total
    }));

    return (
        <div className="agent-dashboard-page">
            <div className="agent-dashboard-wrapper">

                {/* ===== HEADER ===== */}
                <div className="agent-dashboard-header agent-dashboard-fade-in">
                    <div className="agent-dashboard-header-left">
                        <div className="agent-dashboard-header-icon-wrapper">
                            <FaChartLine className="agent-dashboard-header-icon" />
                        </div>
                        <div>
                            <h1 className="agent-dashboard-title">Dashboard</h1>
                            <p className="agent-dashboard-subtitle">
                                Welcome back! Here's your overview for today
                            </p>
                        </div>
                    </div>
                    <div className="agent-dashboard-header-actions">
                        <button className="agent-dashboard-refresh-btn" onClick={fetchStats}>
                            <FaSync /> Refresh
                        </button>
                        <button className="agent-dashboard-new-btn" onClick={() => navigate('/agent/student-application')}>
                            <FaPlus /> New Application
                        </button>
                    </div>
                </div>

                {/* ===== QUICK SUMMARY CARDS ===== */}
                <div className="agent-dashboard-summary-row">
                    <div className="agent-dashboard-summary-card agent-dashboard-summary-apps agent-dashboard-slide-up" style={{animationDelay: '0.05s'}} onClick={() => navigate('/agent/my-applications')}>
                        <div className="agent-dashboard-summary-icon"><FaFileAlt /></div>
                        <div className="agent-dashboard-summary-content">
                            <span className="agent-dashboard-summary-value"><AgentAnimatedCounter value={stats.applications.total} /></span>
                            <span className="agent-dashboard-summary-label">Total Applications</span>
                        </div>
                    </div>
                    <div className="agent-dashboard-summary-card agent-dashboard-summary-approved agent-dashboard-slide-up" style={{animationDelay: '0.1s'}} onClick={() => navigate('/agent/my-applications')}>
                        <div className="agent-dashboard-summary-icon"><FaCheckCircle /></div>
                        <div className="agent-dashboard-summary-content">
                            <span className="agent-dashboard-summary-value"><AgentAnimatedCounter value={stats.applications.approved} /></span>
                            <span className="agent-dashboard-summary-label">Approved</span>
                        </div>
                    </div>
                    <div className="agent-dashboard-summary-card agent-dashboard-summary-received agent-dashboard-slide-up" style={{animationDelay: '0.15s'}} onClick={() => navigate('/agent/payments')}>
                        <div className="agent-dashboard-summary-icon"><FaWallet /></div>
                        <div className="agent-dashboard-summary-content">
                            <span className="agent-dashboard-summary-value"><AgentAnimatedCurrencyCounter value={stats.payments.totalReceived} /></span>
                            <span className="agent-dashboard-summary-label">Total Received</span>
                        </div>
                    </div>
                    <div className="agent-dashboard-summary-card agent-dashboard-summary-month agent-dashboard-slide-up" style={{animationDelay: '0.2s'}} onClick={() => navigate('/agent/payments')}>
                        <div className="agent-dashboard-summary-icon"><FaCalendarAlt /></div>
                        <div className="agent-dashboard-summary-content">
                            <span className="agent-dashboard-summary-value"><AgentAnimatedCurrencyCounter value={stats.payments.monthReceived} /></span>
                            <span className="agent-dashboard-summary-label">This Month</span>
                        </div>
                    </div>
                </div>

                {/* ===== APPLICATIONS SECTION ===== */}
                <div className="agent-dashboard-section-title-bar">
                    <div className="agent-dashboard-section-title-left">
                        <FaFileAlt className="agent-dashboard-section-title-icon" />
                        <h2 className="agent-dashboard-section-title">My Applications</h2>
                    </div>
                    <button className="agent-dashboard-view-all-link" onClick={() => navigate('/agent/my-applications')}>
                        View All <FaArrowRight />
                    </button>
                </div>

                <div className="agent-dashboard-stats-grid-apps">
                    <StatCard
                        icon={<FaFileAlt />}
                        value={<AgentAnimatedCounter value={stats.applications.total} />}
                        label="Total"
                        color="primary"
                        onClick={() => navigate('/agent/my-applications')}
                        delay={0.1}
                    />
                    <StatCard
                        icon={<FaCheckCircle />}
                        value={<AgentAnimatedCounter value={stats.applications.approved} />}
                        label="Approved"
                        color="success"
                        onClick={() => navigate('/agent/my-applications')}
                        delay={0.15}
                    />
                    <StatCard
                        icon={<FaClock />}
                        value={<AgentAnimatedCounter value={stats.applications.pending} />}
                        label="Pending"
                        color="warning"
                        onClick={() => navigate('/agent/my-applications')}
                        delay={0.2}
                    />
                    <StatCard
                        icon={<FaTimesCircle />}
                        value={<AgentAnimatedCounter value={stats.applications.rejected} />}
                        label="Rejected"
                        color="error"
                        onClick={() => navigate('/agent/my-applications')}
                        delay={0.25}
                    />
                    <StatCard
                        icon={<FaMoneyBillWave />}
                        value={<AgentAnimatedCounter value={stats.applications.disbursed} />}
                        label="Disbursed"
                        color="info"
                        onClick={() => navigate('/agent/my-applications')}
                        delay={0.3}
                    />
                </div>

                {/* ===== APPLICATIONS CHART ===== */}
                {appChartData.length > 0 && (
                    <div className="agent-dashboard-charts-row">
                        <AgentAnimatedDonutChart
                            data={appChartData}
                            title="Applications Distribution"
                            centerLabel="Apps"
                        />
                    </div>
                )}

                {/* ===== PAYMENTS SECTION ===== */}
                <div className="agent-dashboard-section-title-bar">
                    <div className="agent-dashboard-section-title-left">
                        <FaMoneyBillWave className="agent-dashboard-section-title-icon" />
                        <h2 className="agent-dashboard-section-title">My Payments</h2>
                    </div>
                    <button className="agent-dashboard-view-all-link" onClick={() => navigate('/agent/payments')}>
                        View All <FaArrowRight />
                    </button>
                </div>

                <div className="agent-dashboard-stats-grid-payments">
                    <StatCard
                        icon={<FaWallet />}
                        value={<AgentAnimatedCurrencyCounter value={stats.payments.totalReceived} />}
                        label="Total Received"
                        small={`${stats.payments.totalCount} transactions`}
                        color="primary"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<FaCalendarAlt />}
                        value={<AgentAnimatedCurrencyCounter value={stats.payments.monthReceived} />}
                        label="This Month"
                        small={`${stats.payments.monthCount} transactions`}
                        color="success"
                        delay={0.15}
                    />
                    <StatCard
                        icon={<FaCalendarAlt />}
                        value={<AgentAnimatedCurrencyCounter value={stats.payments.weekReceived} />}
                        label="This Week"
                        small={`${stats.payments.weekCount} transactions`}
                        color="warning"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<FaArrowDown />}
                        value={<AgentAnimatedCurrencyCounter value={stats.payments.todayReceived} />}
                        label="Today"
                        small={`${stats.payments.todayCount} transactions`}
                        color="info"
                        delay={0.25}
                    />
                </div>

                {/* ===== PAYMENT CHARTS ===== */}
                <div className="agent-dashboard-charts-row">
                    <AgentAnimatedBarChart data={paymentBarData} title="Payments Comparison" />
                    {monthlyLineData.length > 0 && (
                        <AgentAnimatedLineChart
                            data={monthlyLineData}
                            color="#2563eb"
                            title="Monthly Payment Trends"
                        />
                    )}
                </div>

                {/* ===== RECENT ACTIVITY ===== */}
                <div className="agent-dashboard-section-title-bar">
                    <div className="agent-dashboard-section-title-left">
                        <FaRegClock className="agent-dashboard-section-title-icon" />
                        <h2 className="agent-dashboard-section-title">Recent Activity</h2>
                    </div>
                </div>

                <div className="agent-dashboard-recent-grid">
                    {/* Recent Applications */}
                    <div className="agent-dashboard-recent-card agent-dashboard-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="agent-dashboard-recent-card-header">
                            <FaRegFileAlt className="agent-dashboard-recent-card-icon" />
                            <h3>Recent Applications</h3>
                        </div>
                        <div className="agent-dashboard-recent-list">
                            {stats.recentApplications.length === 0 ? (
                                <p className="agent-dashboard-empty-text">No applications yet</p>
                            ) : (
                                stats.recentApplications.map(app => (
                                    <div key={app._id} className="agent-dashboard-recent-item" onClick={() => navigate(`/agent/view-application/${app._id}`)}>
                                        <div className="agent-dashboard-recent-item-icon agent-dashboard-recent-item-icon-app">
                                            <FaFileAlt />
                                        </div>
                                        <div className="agent-dashboard-recent-item-info">
                                            <strong>{app.applicationNumber}</strong>
                                            <small>{app.student?.firstName} {app.student?.lastName}</small>
                                            <small className="agent-dashboard-uni-text">{app.university?.name}</small>
                                        </div>
                                        {getAppStatusBadge(app.status)}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="agent-dashboard-recent-card agent-dashboard-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="agent-dashboard-recent-card-header">
                            <FaCreditCard className="agent-dashboard-recent-card-icon" />
                            <h3>Recent Payments</h3>
                        </div>
                        <div className="agent-dashboard-recent-list">
                            {stats.recentPayments.length === 0 ? (
                                <p className="agent-dashboard-empty-text">No payments yet</p>
                            ) : (
                                stats.recentPayments.map(payment => (
                                    <div key={payment._id} className="agent-dashboard-recent-item">
                                        <div className="agent-dashboard-recent-item-icon agent-dashboard-recent-item-icon-receive">
                                            <FaArrowDown />
                                        </div>
                                        <div className="agent-dashboard-recent-item-info">
                                            <strong>{payment.paymentNumber}</strong>
                                            <small>{new Date(payment.paymentDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</small>
                                        </div>
                                        <div className="agent-dashboard-recent-payment-amount agent-dashboard-payment-receive">
                                            +{formatCurrency(payment.amount)}
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

export default AgentDashboard;