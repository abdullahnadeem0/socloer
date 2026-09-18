// src/Pages/Agent/private/Payments/AgentPayments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentPayments.css';
import agentApi from '../../../api/agentApi';
import {
    FaMoneyBillWave, FaArrowDown, FaCalendarAlt,
    FaSpinner, FaExclamationTriangle, FaSync,
    FaEye, FaCheckCircle, FaClock, FaTimesCircle,
    FaFileAlt, FaChevronRight, FaWallet,
    FaChartLine, FaChevronDown, FaChevronUp,
    FaSearch, FaFilter, FaPrint, FaTimes,
    FaUniversity, FaCreditCard
} from 'react-icons/fa';

const AgentPayments = () => {
    const navigate = useNavigate();

    // ===== STATE =====
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [stats, setStats] = useState(null);
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');

    // UI States
    const [showMonthly, setShowMonthly] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Print
    const [printModal, setPrintModal] = useState({
        show: false,
        type: 'all',
        fromDate: '',
        toDate: ''
    });

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setServerError('');
        try {
            const [paymentsRes, statsRes, monthlyRes] = await Promise.all([
                agentApi.payments.getAll({ limit: 100 }),
                agentApi.payments.getStats(),
                agentApi.payments.getMonthlySummary()
            ]);

            if (paymentsRes.success) {
                setPayments(paymentsRes.data || []);
                setFilteredPayments(paymentsRes.data || []);
            }

            if (statsRes.success) {
                setStats(statsRes.data);
            }

            if (monthlyRes.success) {
                setMonthlySummary(monthlyRes.data || []);
            }

        } catch (error) {
            console.error('❌ Fetch error:', error);
            setServerError('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FILTER EFFECT
    // ============================================
    useEffect(() => {
        let filtered = [...payments];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.paymentNumber?.toLowerCase().includes(term) ||
                p.fromName?.toLowerCase().includes(term) ||
                p.transactionId?.toLowerCase().includes(term) ||
                p.note?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);

        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            filtered = filtered.filter(p => new Date(p.paymentDate).toDateString() === filterDate);
        }

        setFilteredPayments(filtered);
    }, [searchTerm, statusFilter, dateFilter, payments]);

    // ============================================
    // HELPERS
    // ============================================
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'Rs 0';
        return `Rs ${Number(amount).toLocaleString('en-PK')}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-PK', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const map = {
            'pending': { class: 'status-pending', label: 'Pending', icon: <FaClock /> },
            'completed': { class: 'status-completed', label: 'Completed', icon: <FaCheckCircle /> },
            'failed': { class: 'status-failed', label: 'Failed', icon: <FaTimesCircle /> },
            'cancelled': { class: 'status-cancelled', label: 'Cancelled', icon: <FaTimesCircle /> }
        };
        const c = map[status] || map['completed'];
        return <span className={`status-badge ${c.class}`}>{c.icon} {c.label}</span>;
    };

    // ============================================
    // PRINT FUNCTIONS
    // ============================================
    const handlePrint = (type) => {
        setPrintModal({
            show: true,
            type,
            fromDate: '',
            toDate: ''
        });
    };

    const executePrint = () => {
        const { type, fromDate, toDate } = printModal;

        let dataToPrint = [];
        let title = '';

        if (type === 'date-range') {
            dataToPrint = filteredPayments.filter(p => {
                const pDate = new Date(p.paymentDate).getTime();
                const from = fromDate ? new Date(fromDate).getTime() : 0;
                const to = toDate ? new Date(toDate).getTime() + 86400000 : Infinity;
                return pDate >= from && pDate <= to;
            });
            title = `My Payments - ${fromDate || 'Start'} to ${toDate || 'End'}`;
        } else {
            dataToPrint = filteredPayments;
            title = 'My Payments Report';
        }

        const total = dataToPrint.reduce((sum, p) => sum + (p.amount || 0), 0);

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            alert('Please allow pop-ups');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 30px; color: #1a202c; }
                    .header { text-align: center; padding-bottom: 20px; margin-bottom: 25px; border-bottom: 3px solid #2563eb; }
                    .header h1 { color: #2563eb; font-size: 26px; margin-bottom: 5px; }
                    .header p { color: #718096; font-size: 14px; }
                    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; padding: 12px; background: #f8fafc; border-radius: 8px; }
                    .total-card { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 25px; }
                    .total-card h3 { font-size: 12px; text-transform: uppercase; margin-bottom: 5px; opacity: 0.9; }
                    .total-card p { font-size: 28px; font-weight: 700; }
                    table { width: 100%; border-collapse: collapse; font-size: 13px; }
                    th { background: #2563eb; color: #fff; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
                    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
                    tr:nth-child(even) { background: #f8fafc; }
                    .amount { font-weight: 700; color: #48bb78; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #718096; padding-top: 15px; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>💰 My Payment Report</h1>
                    <p>${title}</p>
                </div>

                <div class="meta">
                    <span><strong>Generated:</strong> ${new Date().toLocaleString('en-PK')}</span>
                    <span><strong>Total Records:</strong> ${dataToPrint.length}</span>
                </div>

                <div class="total-card">
                    <h3>Total Received</h3>
                    <p>Rs ${Number(total).toLocaleString('en-PK')}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Payment No.</th>
                            <th>From</th>
                            <th>Method</th>
                            <th>Date</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint.map((p, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><strong>${p.paymentNumber || 'N/A'}</strong></td>
                                <td>${p.fromName || 'Admin'}</td>
                                <td>${p.paymentMethod || 'N/A'}</td>
                                <td>${formatDate(p.paymentDate)}</td>
                                <td class="amount">+ Rs ${Number(p.amount || 0).toLocaleString('en-PK')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} Scholarship Portal - Agent Payment Report</p>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.print(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
        setPrintModal({ show: false, type: 'all', fromDate: '', toDate: '' });
    };

    // ============================================
    // RENDER
    // ============================================
    if (loading) {
        return (
            <div className="AgentPayments">
                <div className="loading-state">
                    <FaSpinner className="spinner-large" />
                    <p>Loading your payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="AgentPayments">
            <div className="payments-wrapper">

                {/* ===== TOP BAR ===== */}
                <div className="top-bar">
                    <div className="top-bar-left">
                        <div className="icon-badge">
                            <FaWallet />
                        </div>
                        <div className="title-block">
                            <h1>My Payments</h1>
                            <p>Track your received payments</p>
                        </div>
                    </div>

                    <div className="top-bar-actions">
                        <button className="icon-btn" onClick={fetchData} title="Refresh">
                            <FaSync />
                        </button>
                        <button
                            className={`toggle-btn ${showMonthly ? 'active' : ''}`}
                            onClick={() => setShowMonthly(!showMonthly)}
                        >
                            <FaChartLine />
                            Monthly Summary
                            {showMonthly ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>
                </div>

                {serverError && (
                    <div className="alert error">
                        <FaExclamationTriangle /> {serverError}
                    </div>
                )}

                {/* ===== MONTHLY SUMMARY PANEL ===== */}
                {showMonthly && (
                    <div className="monthly-panel">
                        <div className="panel-header">
                            <FaChartLine className="panel-icon" />
                            <h2>Monthly Summary (Last 6 Months)</h2>
                        </div>

                        {monthlySummary.length === 0 ? (
                            <div className="empty-monthly">
                                <p>No payment history yet</p>
                            </div>
                        ) : (
                            <div className="monthly-grid">
                                {monthlySummary.map((month, idx) => (
                                    <div key={idx} className="month-card">
                                        <span className="month-label">{month.label}</span>
                                        <strong className="month-amount">
                                            {formatCurrency(month.total)}
                                        </strong>
                                        <small>{month.count} payments</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== STATS CARDS ===== */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-icon"><FaWallet /></div>
                            <div className="stat-info">
                                <span>Total Received</span>
                                <strong>{formatCurrency(stats.totalReceived)}</strong>
                                <small>{stats.totalCount || 0} payments</small>
                            </div>
                        </div>

                        <div className="stat-card week">
                            <div className="stat-icon"><FaCalendarAlt /></div>
                            <div className="stat-info">
                                <span>This Week</span>
                                <strong>{formatCurrency(stats.weekReceived)}</strong>
                                <small>{stats.weekCount || 0} payments</small>
                            </div>
                        </div>

                        <div className="stat-card month">
                            <div className="stat-icon"><FaChartLine /></div>
                            <div className="stat-info">
                                <span>This Month</span>
                                <strong>{formatCurrency(stats.monthReceived)}</strong>
                                <small>{stats.monthCount || 0} payments</small>
                            </div>
                        </div>

                        <div className="stat-card today">
                            <div className="stat-icon"><FaClock /></div>
                            <div className="stat-info">
                                <span>Today</span>
                                <strong>{formatCurrency(stats.todayReceived)}</strong>
                                <small>{stats.todayCount || 0} payments</small>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== FILTERS ===== */}
                <div className="filters-wrapper">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>

                    <input
                        type="date"
                        className="filter-date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />

                    {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                        <button
                            className="clear-btn"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setDateFilter('');
                            }}
                        >
                            <FaTimesCircle /> Clear
                        </button>
                    )}
                </div>

                {/* ===== LIST HEADER ===== */}
                <div className="list-header">
                    <span>
                        Showing <strong>{filteredPayments.length}</strong> of {payments.length} payments
                    </span>
                    <div className="print-actions">
                        <button className="print-action-btn" onClick={() => handlePrint('date-range')}>
                            <FaCalendarAlt /> Print Date Range
                        </button>
                        <button className="print-action-btn primary" onClick={() => handlePrint('all')}>
                            <FaPrint /> Print All
                        </button>
                    </div>
                </div>

                {/* ===== PAYMENTS TABLE ===== */}
                {filteredPayments.length === 0 ? (
                    <div className="empty-state">
                        <FaMoneyBillWave className="empty-icon" />
                        <h3>No payments yet</h3>
                        <p>You haven't received any payments yet</p>
                    </div>
                ) : (
                    <div className="payments-table">
                        <div className="table-header">
                            <span>Type</span>
                            <span>Number</span>
                            <span>From</span>
                            <span>Method</span>
                            <span>Date</span>
                            <span>Status</span>
                            <span>Amount</span>
                        </div>

                        {filteredPayments.map(payment => (
                            <div key={payment._id} className="table-row">
                                <span className="type-dot">
                                    <FaArrowDown />
                                </span>

                                <span className="cell-number">{payment.paymentNumber}</span>

                                <div className="cell-party">
                                    <strong>{payment.fromName || 'Admin'}</strong>
                                    {payment.note && <small>{payment.note}</small>}
                                </div>

                                <span className="cell-method">
                                    {payment.paymentMethod || 'N/A'}
                                </span>

                                <span className="cell-date">
                                    {formatDate(payment.paymentDate)}
                                </span>

                                <span className="cell-status">
                                    {getStatusBadge(payment.status)}
                                </span>

                                <span className="cell-amount">
                                    + {formatCurrency(payment.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== PRINT MODAL ===== */}
                {printModal.show && (
                    <div className="modal-backdrop" onClick={() => setPrintModal({ ...printModal, show: false })}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-top print">
                                <h2><FaPrint /> Print Report</h2>
                                <button className="close-x" onClick={() => setPrintModal({ ...printModal, show: false })}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-mid">
                                <h3 className="print-title">
                                    {printModal.type === 'date-range' ? 'Date Range Report' : 'All Payments Report'}
                                </h3>

                                {printModal.type === 'date-range' && (
                                    <div className="date-range-inputs">
                                        <div className="form-group">
                                            <label>From Date</label>
                                            <input
                                                type="date"
                                                value={printModal.fromDate}
                                                onChange={(e) => setPrintModal({ ...printModal, fromDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>To Date</label>
                                            <input
                                                type="date"
                                                value={printModal.toDate}
                                                onChange={(e) => setPrintModal({ ...printModal, toDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="print-info">
                                    <FaFileAlt />
                                    <p>
                                        {printModal.type === 'date-range'
                                            ? 'Payments between selected dates will be printed'
                                            : `${filteredPayments.length} payments will be printed`}
                                    </p>
                                </div>
                            </div>

                            <div className="modal-bottom">
                                <button
                                    className="modal-btn cancel"
                                    onClick={() => setPrintModal({ ...printModal, show: false })}
                                >
                                    Cancel
                                </button>
                                <button className="modal-btn print" onClick={executePrint}>
                                    <FaPrint /> Print Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentPayments;