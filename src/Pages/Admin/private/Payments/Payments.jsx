// src/Pages/Admin/private/Payments/Payments.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payments.css';
import adminApi from '../../../../api/adminApi';
import {
    FaMoneyBillWave, FaArrowDown, FaArrowUp, FaWallet,
    FaCalendarAlt, FaSpinner, FaExclamationTriangle,
    FaSync, FaEye, FaPrint, FaFileInvoiceDollar,
    FaCheckCircle, FaClock, FaTimesCircle,
    FaUserTie, FaFilter, FaSearch, FaTrash,
    FaEdit, FaFileAlt, FaChevronRight, FaTimes,
    FaChevronDown, FaChevronUp, FaDownload, FaUniversity
} from 'react-icons/fa';

const Payments = () => {
    const navigate = useNavigate();
    const printRef = useRef(null);

    // ===== STATE =====
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Agent Wise Panel
    const [showAgentWise, setShowAgentWise] = useState(false);
    const [agents, setAgents] = useState([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [agentPayments, setAgentPayments] = useState([]);
    const [loadingAgentPayments, setLoadingAgentPayments] = useState(false);

    // Print Modal
    const [printModal, setPrintModal] = useState({
        show: false,
        type: 'all', // 'all', 'agent', 'date-range'
        title: '',
        fromDate: '',
        toDate: ''
    });

    // Delete modal
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        payment: null,
        loading: false
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
            const paymentsResponse = await adminApi.payments.getAll({ limit: 100 });
            if (paymentsResponse.success) {
                setPayments(paymentsResponse.data || []);
                setFilteredPayments(paymentsResponse.data || []);
            }

            const statsResponse = await adminApi.payments.getStats();
            if (statsResponse.success) {
                setStats(statsResponse.data);
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setServerError('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FETCH AGENTS (Jab Show Agent Wise Click Ho)
    // ============================================
    const handleShowAgentWise = async () => {
        setShowAgentWise(!showAgentWise);

        if (!showAgentWise && agents.length === 0) {
            setLoadingAgents(true);
            try {
                const token = localStorage.getItem('adminToken');
                const response = await adminApi.getAllAgents(token);
                if (response.success) {
                    setAgents(response.agents || response.data || []);
                }
            } catch (error) {
                console.error('❌ Agents fetch error:', error);
            } finally {
                setLoadingAgents(false);
            }
        }
    };

    // ============================================
    // SELECT AGENT
    // ============================================
    const handleSelectAgent = async (agent) => {
        setSelectedAgent(agent);
        setLoadingAgentPayments(true);

        try {
            const response = await adminApi.payments.getAll({
                agent: agent._id,
                limit: 100
            });

            if (response.success) {
                setAgentPayments(response.data || []);
            }
        } catch (error) {
            console.error('❌ Agent payments error:', error);
        } finally {
            setLoadingAgentPayments(false);
        }
    };

    // ============================================
    // CLEAR AGENT SELECTION
    // ============================================
    const handleClearAgent = () => {
        setSelectedAgent(null);
        setAgentPayments([]);
    };

    // ============================================
    // PRINT FUNCTIONS
    // ============================================
    const handlePrintAll = () => {
        setPrintModal({
            show: true,
            type: 'all',
            title: 'All Payments Report',
            fromDate: '',
            toDate: ''
        });
    };

    const handlePrintAgent = () => {
        if (!selectedAgent) return;

        setPrintModal({
            show: true,
            type: 'agent',
            title: `Agent Report: ${selectedAgent.name}`,
            fromDate: '',
            toDate: ''
        });
    };

    const handlePrintDateRange = () => {
        setPrintModal({
            show: true,
            type: 'date-range',
            title: 'Date Range Report',
            fromDate: '',
            toDate: ''
        });
    };

    const executePrint = () => {
        const { type, fromDate, toDate } = printModal;

        let dataToPrint = [];
        let title = '';

        if (type === 'agent' && selectedAgent) {
            dataToPrint = agentPayments;
            title = `Payment Report - ${selectedAgent.name}`;
        } else if (type === 'date-range') {
            dataToPrint = filteredPayments.filter(p => {
                const pDate = new Date(p.paymentDate).getTime();
                const from = fromDate ? new Date(fromDate).getTime() : 0;
                const to = toDate ? new Date(toDate).getTime() + 86400000 : Infinity;
                return pDate >= from && pDate <= to;
            });
            title = `Payment Report - ${fromDate || 'Start'} to ${toDate || 'End'}`;
        } else {
            dataToPrint = filteredPayments;
            title = 'All Payments Report';
        }

        // Print window open karo
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            alert('Please allow pop-ups to print');
            return;
        }

        const totalReceived = dataToPrint
            .filter(p => p.type === 'receive')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const totalSent = dataToPrint
            .filter(p => p.type === 'send')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const formatCurrency = (amount) => {
            return `Rs ${Number(amount || 0).toLocaleString('en-PK')}`;
        };

        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('en-PK', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        };

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        padding: 30px;
                        color: #1a202c;
                        background: #fff;
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                        margin-bottom: 25px;
                        border-bottom: 3px solid #2563eb;
                    }
                    .header h1 {
                        color: #2563eb;
                        font-size: 26px;
                        margin-bottom: 5px;
                    }
                    .header p {
                        color: #718096;
                        font-size: 14px;
                    }
                    .meta {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        font-size: 13px;
                        color: #4a5568;
                        padding: 12px;
                        background: #f8fafc;
                        border-radius: 8px;
                    }
                    .summary {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 25px;
                    }
                    .summary-card {
                        flex: 1;
                        padding: 15px;
                        border-radius: 10px;
                        border-left: 4px solid;
                    }
                    .summary-card.received { background: #f0fff4; border-color: #48bb78; }
                    .summary-card.sent { background: #fff5f5; border-color: #fc8181; }
                    .summary-card.balance { background: #eef2ff; border-color: #2563eb; }
                    .summary-card h3 {
                        font-size: 11px;
                        text-transform: uppercase;
                        color: #718096;
                        margin-bottom: 5px;
                    }
                    .summary-card p {
                        font-size: 20px;
                        font-weight: 700;
                        color: #1a202c;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    th {
                        background: #2563eb;
                        color: #fff;
                        padding: 10px;
                        text-align: left;
                        font-size: 11px;
                        text-transform: uppercase;
                    }
                    td {
                        padding: 10px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    tr:nth-child(even) { background: #f8fafc; }
                    .type-badge {
                        display: inline-block;
                        padding: 3px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                    }
                    .type-badge.receive { background: #f0fff4; color: #276749; }
                    .type-badge.send { background: #eef2ff; color: #2563eb; }
                    .amount {
                        font-weight: 700;
                    }
                    .amount.receive { color: #48bb78; }
                    .amount.send { color: #2563eb; }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #718096;
                        padding-top: 15px;
                        border-top: 1px solid #e2e8f0;
                    }
                    @media print {
                        body { padding: 15px; }
                        .header h1 { font-size: 22px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>💰 Payment Report</h1>
                    <p>${title}</p>
                </div>

                <div class="meta">
                    <span><strong>Generated:</strong> ${new Date().toLocaleString('en-PK')}</span>
                    <span><strong>Total Records:</strong> ${dataToPrint.length}</span>
                </div>

                <div class="summary">
                    <div class="summary-card received">
                        <h3>Total Received</h3>
                        <p>${formatCurrency(totalReceived)}</p>
                    </div>
                    <div class="summary-card sent">
                        <h3>Total Sent</h3>
                        <p>${formatCurrency(totalSent)}</p>
                    </div>
                    <div class="summary-card balance">
                        <h3>Balance</h3>
                        <p>${formatCurrency(totalReceived - totalSent)}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Payment No.</th>
                            <th>Type</th>
                            <th>From/To</th>
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
                                <td>
                                    <span class="type-badge ${p.type}">
                                        ${p.type === 'receive' ? 'Received' : 'Sent'}
                                    </span>
                                </td>
                                <td>
                                    ${p.type === 'receive'
                                        ? p.fromName || p.studentName || 'N/A'
                                        : p.toName || p.agentName || 'N/A'}
                                </td>
                                <td>${p.paymentMethod || 'N/A'}</td>
                                <td>${formatDate(p.paymentDate)}</td>
                                <td class="amount ${p.type}">
                                    ${p.type === 'receive' ? '+' : '-'} ${formatCurrency(p.amount)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} Scholarship Portal - Payment Report</p>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
        setPrintModal({ show: false, type: 'all', title: '', fromDate: '', toDate: '' });
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
                p.toName?.toLowerCase().includes(term) ||
                p.agentName?.toLowerCase().includes(term) ||
                p.studentName?.toLowerCase().includes(term) ||
                p.transactionId?.toLowerCase().includes(term) ||
                p.note?.toLowerCase().includes(term)
            );
        }

        if (typeFilter !== 'all') filtered = filtered.filter(p => p.type === typeFilter);
        if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);

        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            filtered = filtered.filter(p => new Date(p.paymentDate).toDateString() === filterDate);
        }

        setFilteredPayments(filtered);
    }, [searchTerm, typeFilter, statusFilter, dateFilter, payments]);

    // ============================================
    // NAVIGATION
    // ============================================
    const handleView = (id) => navigate(`/admin/payments/view/${id}`);
    const handleEdit = (id) => navigate(`/admin/payments/edit/${id}`);
    const handleReceive = () => navigate('/admin/payments/receive');
    const handleSend = () => navigate('/admin/payments/send');

    // ============================================
    // DELETE
    // ============================================
    const openDeleteModal = (payment) => setDeleteModal({ show: true, payment, loading: false });
    const closeDeleteModal = () => setDeleteModal({ show: false, payment: null, loading: false });

    const handleDelete = async () => {
        const { payment } = deleteModal;
        setDeleteModal(prev => ({ ...prev, loading: true }));

        try {
            const response = await adminApi.payments.delete(payment._id);
            if (response.success) {
                setSuccessMessage('🗑️ Payment deleted successfully');
                closeDeleteModal();
                fetchData();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            setServerError(error.response?.data?.message || 'Failed to delete');
            setTimeout(() => setServerError(''), 3000);
        } finally {
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

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
    // RENDER
    // ============================================
    if (loading) {
        return (
            <div className="Payments-page">
                <div className="loading-state">
                    <FaSpinner className="spinner-large" />
                    <p>Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="Payments-page">
            <div className="payments-wrapper">

                {/* ===== TOP BAR ===== */}
                <div className="top-bar">
                    <div className="top-bar-left">
                        <div className="icon-badge">
                            <FaMoneyBillWave />
                        </div>
                        <div className="title-block">
                            <h1>Payments</h1>
                            <p>Manage all transactions</p>
                        </div>
                    </div>

                    <div className="top-bar-actions">
                        <button className="icon-btn refresh" onClick={fetchData} title="Refresh">
                            <FaSync />
                        </button>
                        <button
                            className={`toggle-btn ${showAgentWise ? 'active' : ''}`}
                            onClick={handleShowAgentWise}
                        >
                            <FaUserTie />
                            Show Agent Wise
                            {showAgentWise ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        <button className="action-pill receive" onClick={handleReceive}>
                            <FaArrowDown /> Receive
                        </button>
                        <button className="action-pill send" onClick={handleSend}>
                            <FaArrowUp /> Send
                        </button>
                    </div>
                </div>

                {/* ===== MESSAGES ===== */}
                {successMessage && (
                    <div className="alert success">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

                {serverError && (
                    <div className="alert error">
                        <FaExclamationTriangle /> {serverError}
                    </div>
                )}

                {/* ============================================ */}
                {/* ⭐ AGENT WISE PANEL (Toggle) */}
                {/* ============================================ */}
                {showAgentWise && (
                    <div className="agent-wise-panel">
                        <div className="panel-header">
                            <div className="panel-header-left">
                                <FaUserTie className="panel-icon" />
                                <h2>Select Agent</h2>
                            </div>
                            <button className="panel-close" onClick={() => setShowAgentWise(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="panel-body">
                            {/* Agent List */}
                            <div className="agents-list">
                                {loadingAgents ? (
                                    <div className="loading-agents">
                                        <FaSpinner className="spinner" />
                                        <p>Loading agents...</p>
                                    </div>
                                ) : agents.length === 0 ? (
                                    <div className="empty-agents">
                                        <FaUserTie />
                                        <p>No agents found</p>
                                    </div>
                                ) : (
                                    agents.map(agent => (
                                        <button
                                            key={agent._id}
                                            className={`agent-item ${selectedAgent?._id === agent._id ? 'active' : ''}`}
                                            onClick={() => handleSelectAgent(agent)}
                                        >
                                            <div className="agent-avatar">
                                                {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                                            </div>
                                            <div className="agent-info">
                                                <strong>{agent.name}</strong>
                                                <small>{agent.email}</small>
                                            </div>
                                            <FaChevronRight className="agent-arrow" />
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Selected Agent Payments */}
                            {selectedAgent && (
                                <div className="agent-payments-section">
                                    <div className="agent-payments-header">
                                        <div>
                                            <h3>{selectedAgent.name}</h3>
                                            <p>{agentPayments.length} payments</p>
                                        </div>
                                        <div className="agent-header-actions">
                                            <button className="print-btn-small" onClick={handlePrintAgent}>
                                                <FaPrint /> Print
                                            </button>
                                            <button className="clear-btn-small" onClick={handleClearAgent}>
                                                <FaTimes /> Clear
                                            </button>
                                        </div>
                                    </div>

                                    {loadingAgentPayments ? (
                                        <div className="loading-state-small">
                                            <FaSpinner className="spinner" />
                                            <p>Loading...</p>
                                        </div>
                                    ) : agentPayments.length === 0 ? (
                                        <div className="empty-state-small">
                                            <FaFileInvoiceDollar />
                                            <p>No payments for this agent</p>
                                        </div>
                                    ) : (
                                        <div className="agent-payments-list">
                                            {agentPayments.map(payment => (
                                                <div key={payment._id} className={`mini-payment-row ${payment.type}`}>
                                                    <span className="mini-payment-type">
                                                        {payment.type === 'receive' ? <FaArrowDown /> : <FaArrowUp />}
                                                    </span>
                                                    <span className="mini-payment-number">{payment.paymentNumber}</span>
                                                    <span className="mini-payment-date">{formatDate(payment.paymentDate)}</span>
                                                    <span className={`mini-payment-amount ${payment.type}`}>
                                                        {payment.type === 'receive' ? '+' : '-'} {formatCurrency(payment.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== STATS COMPACT ===== */}
                {stats && (
                    <div className="stats-compact">
                        <div className="stat-compact received">
                            <div className="stat-icon"><FaArrowDown /></div>
                            <div className="stat-info">
                                <span>Received</span>
                                <strong>{formatCurrency(stats.totalReceived)}</strong>
                            </div>
                        </div>

                        <div className="stat-compact sent">
                            <div className="stat-icon"><FaArrowUp /></div>
                            <div className="stat-info">
                                <span>Sent</span>
                                <strong>{formatCurrency(stats.totalSent)}</strong>
                            </div>
                        </div>

                        <div className={`stat-compact balance ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
                            <div className="stat-icon"><FaWallet /></div>
                            <div className="stat-info">
                                <span>Balance</span>
                                <strong>{formatCurrency(stats.balance)}</strong>
                            </div>
                        </div>

                        <div className="stat-compact today">
                            <div className="stat-icon"><FaCalendarAlt /></div>
                            <div className="stat-info">
                                <span>Today</span>
                                <strong>{formatCurrency(stats.todayReceived + stats.todaySent)}</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== FILTERS BAR ===== */}
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

                    <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="receive">Received</option>
                        <option value="send">Sent</option>
                    </select>

                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                        type="date"
                        className="filter-date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />

                    {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || dateFilter) && (
                        <button
                            className="clear-btn"
                            onClick={() => {
                                setSearchTerm('');
                                setTypeFilter('all');
                                setStatusFilter('all');
                                setDateFilter('');
                            }}
                        >
                            <FaTimesCircle /> Clear
                        </button>
                    )}
                </div>

                {/* ===== LIST HEADER + PRINT ACTIONS ===== */}
                <div className="list-header">
                    <span>Showing <strong>{filteredPayments.length}</strong> of {payments.length} payments</span>
                    <div className="print-actions">
                        <button className="print-action-btn" onClick={handlePrintDateRange}>
                            <FaCalendarAlt /> Print Date Range
                        </button>
                        <button className="print-action-btn primary" onClick={handlePrintAll}>
                            <FaPrint /> Print All
                        </button>
                    </div>
                </div>

                {/* ===== PAYMENTS LIST ===== */}
                {filteredPayments.length === 0 ? (
                    <div className="empty-state">
                        <FaFileInvoiceDollar className="empty-icon" />
                        <h3>No payments found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="payments-table">
                        <div className="table-header">
                            <span>Type</span>
                            <span>Number</span>
                            <span>From / To</span>
                            <span>Method</span>
                            <span>Date</span>
                            <span>Status</span>
                            <span>Amount</span>
                            <span>Actions</span>
                        </div>

                        {filteredPayments.map(payment => (
                            <div
                                key={payment._id}
                                className={`table-row ${payment.type}`}
                                onClick={() => handleView(payment._id)}
                            >
                                <span className={`type-dot ${payment.type}`}>
                                    {payment.type === 'receive' ? <FaArrowDown /> : <FaArrowUp />}
                                </span>

                                <span className="cell-number">{payment.paymentNumber}</span>

                                <div className="cell-party">
                                    <strong>
                                        {payment.type === 'receive'
                                            ? payment.fromName || payment.studentName || 'N/A'
                                            : payment.toName || payment.agentName || 'N/A'}
                                    </strong>
                                    {payment.note && <small>{payment.note}</small>}
                                </div>

                                <span className="cell-method">{payment.paymentMethod || 'N/A'}</span>

                                <span className="cell-date">{formatDate(payment.paymentDate)}</span>

                                <span className="cell-status">{getStatusBadge(payment.status)}</span>

                                <span className={`cell-amount ${payment.type}`}>
                                    {payment.type === 'receive' ? '+' : '-'} {formatCurrency(payment.amount)}
                                </span>

                                <div className="cell-actions" onClick={(e) => e.stopPropagation()}>
                                    <button className="row-btn edit" onClick={() => handleEdit(payment._id)}>
                                        <FaEdit />
                                    </button>
                                    <button className="row-btn delete" onClick={() => openDeleteModal(payment)}>
                                        <FaTrash />
                                    </button>
                                    <FaChevronRight className="row-arrow" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ============================================ */}
                {/* PRINT MODAL */}
                {/* ============================================ */}
                {printModal.show && (
                    <div className="modal-backdrop" onClick={() => setPrintModal({ ...printModal, show: false })}>
                        <div className="modal-card print-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-top print">
                                <h2><FaPrint /> Print Report</h2>
                                <button className="close-x" onClick={() => setPrintModal({ ...printModal, show: false })}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-mid">
                                <h3 className="print-title">{printModal.title}</h3>

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
                                    <FaFileInvoiceDollar />
                                    <p>
                                        {printModal.type === 'agent'
                                            ? `${agentPayments.length} payments will be printed`
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

                {/* ===== DELETE MODAL ===== */}
                {deleteModal.show && (
                    <div className="modal-backdrop" onClick={closeDeleteModal}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-top delete">
                                <h2>🗑️ Delete Payment</h2>
                                <button className="close-x" onClick={closeDeleteModal}>
                                    <FaTimesCircle />
                                </button>
                            </div>

                            <div className="modal-mid">
                                <div className="modal-info-box">
                                    <div className="info-line">
                                        <span>Payment:</span>
                                        <strong>{deleteModal.payment?.paymentNumber}</strong>
                                    </div>
                                    <div className="info-line">
                                        <span>Amount:</span>
                                        <strong>{formatCurrency(deleteModal.payment?.amount)}</strong>
                                    </div>
                                </div>

                                <p className="warning-box">
                                    ⚠️ Are you sure? This cannot be undone.
                                </p>
                            </div>

                            <div className="modal-bottom">
                                <button className="modal-btn cancel" onClick={closeDeleteModal} disabled={deleteModal.loading}>
                                    Cancel
                                </button>
                                <button className="modal-btn delete" onClick={handleDelete} disabled={deleteModal.loading}>
                                    {deleteModal.loading ? (
                                        <><FaSpinner className="spinner" /> Deleting...</>
                                    ) : (
                                        <><FaTrash /> Delete</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;