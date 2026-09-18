// src/Pages/Admin/private/Applications/AdminApplications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminApplications.css';
import adminApi from '../../../../api/adminApi';
import {
    FaSearch, FaFilter, FaEye, FaEdit, FaTrash,
    FaCheckCircle, FaClock, FaTimesCircle, FaSpinner,
    FaFileAlt, FaUserGraduate, FaUniversity, FaPlus,
    FaExclamationTriangle, FaChartLine, FaHourglassHalf,
    FaSync, FaCalendarAlt, FaUserTie, FaRedo, FaTimes,
    FaGraduationCap
} from 'react-icons/fa';

const AdminApplications = () => {
    const navigate = useNavigate();

    // ===== STATE =====
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [agents, setAgents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // ===== FILTERS =====
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');

    // ===== ACTION MODAL =====
    const [actionModal, setActionModal] = useState({
        show: false,
        type: '',           // 'approve' | 'reject' | 'review' | 'delete'
        application: null,
        remarks: '',
        loading: false
    });

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchApplications();
        fetchStats();
        fetchAgents();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await adminApi.applications.getAll();
            if (response.success) {
                setApplications(response.data || []);
                setFilteredApps(response.data || []);
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setServerError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminApi.applications.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('❌ Stats error:', error);
        }
    };

    const fetchAgents = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.getAllAgents(token);
            if (response.success) {
                setAgents(response.agents || response.data || []);
            }
        } catch (error) {
            console.error('❌ Agents error:', error);
        }
    };

    // ============================================
    // FILTER EFFECT
    // ============================================
    useEffect(() => {
        let filtered = [...applications];

        // Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.applicationNumber?.toLowerCase().includes(term) ||
                app.student?.firstName?.toLowerCase().includes(term) ||
                app.student?.lastName?.toLowerCase().includes(term) ||
                app.student?.email?.toLowerCase().includes(term) ||
                app.agentName?.toLowerCase().includes(term) ||
                app.universityName?.toLowerCase().includes(term) ||
                app.programName?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // Agent filter
        if (agentFilter !== 'all') {
            filtered = filtered.filter(app => 
                app.agent === agentFilter || 
                app.agent?._id === agentFilter
            );
        }

        setFilteredApps(filtered);
    }, [searchTerm, statusFilter, agentFilter, applications]);

    // ============================================
    // NAVIGATION
    // ============================================
    const handleView = (id) => {
        navigate(`/admin/applications/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/admin/applications/edit/${id}`);
    };

    // ============================================
    // ACTION MODAL HANDLERS
    // ============================================
    const openActionModal = (type, application) => {
        setActionModal({
            show: true,
            type,
            application,
            remarks: '',
            loading: false
        });
    };

    const closeActionModal = () => {
        setActionModal({
            show: false,
            type: '',
            application: null,
            remarks: '',
            loading: false
        });
    };

    const handleAction = async () => {
        const { type, application, remarks } = actionModal;

        // Validation
        if ((type === 'reject' || type === 'review') && !remarks.trim()) {
            alert(`${type === 'reject' ? 'Rejection reason' : 'Review remarks'} is required`);
            return;
        }

        setActionModal(prev => ({ ...prev, loading: true }));

        try {
            let response;

            if (type === 'approve') {
                response = await adminApi.applications.approve(application._id, remarks);
            } else if (type === 'reject') {
                response = await adminApi.applications.reject(application._id, remarks);
            } else if (type === 'review') {
                response = await adminApi.applications.review(application._id, remarks);
            } else if (type === 'delete') {
                response = await adminApi.applications.delete(application._id);
            }

            if (response.success) {
                setSuccessMessage(response.message || `${type} successful`);
                closeActionModal();
                fetchApplications();
                fetchStats();
                setTimeout(() => setSuccessMessage(''), 4000);
            }
        } catch (error) {
            console.error('❌ Action error:', error);
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setActionModal(prev => ({ ...prev, loading: false }));
        }
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const map = {
            'draft': { class: 'status-draft', label: 'Draft', icon: <FaFileAlt /> },
            'submitted': { class: 'status-submitted', label: 'Submitted', icon: <FaClock /> },
            'under-review': { class: 'status-review', label: 'Under Review', icon: <FaHourglassHalf /> },
            'pending-documents': { class: 'status-pending', label: 'Pending Docs', icon: <FaExclamationTriangle /> },
            'approved': { class: 'status-approved', label: 'Approved', icon: <FaCheckCircle /> },
            'rejected': { class: 'status-rejected', label: 'Rejected', icon: <FaTimesCircle /> },
            'scholarship-disbursed': { class: 'status-disbursed', label: 'Disbursed', icon: <FaCheckCircle /> }
        };
        const c = map[status] || map['submitted'];
        return <span className={`status-badge ${c.class}`}>{c.icon} {c.label}</span>;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const canTakeAction = (status) => {
        return ['submitted', 'under-review', 'pending-documents'].includes(status);
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="AdminApplications">
            <div className="admin-apps-container">

                {/* ===== HEADER ===== */}
                <div className="admin-apps-header">
                    <div className="header-left">
                        <div className="header-icon-wrapper">
                            <FaFileAlt className="header-icon" />
                        </div>
                        <div>
                            <h1>Applications Management</h1>
                            <p>Review and manage all agent scholarship applications</p>
                        </div>
                    </div>
                    <button className="refresh-btn" onClick={fetchApplications}>
                        <FaSync /> Refresh
                    </button>
                </div>

                {/* ===== MESSAGES ===== */}
                {successMessage && (
                    <div className="success-message">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

                {serverError && (
                    <div className="error-message">
                        <FaExclamationTriangle /> {serverError}
                    </div>
                )}

                {/* ===== STATS CARDS ===== */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card stat-total">
                            <div className="stat-icon"><FaChartLine /></div>
                            <div className="stat-content">
                                <h3>{stats.total}</h3>
                                <p>Total Applications</p>
                            </div>
                        </div>
                        <div className="stat-card stat-pending">
                            <div className="stat-icon"><FaClock /></div>
                            <div className="stat-content">
                                <h3>{(stats.submitted || 0) + (stats.underReview || 0) + (stats.pending || 0)}</h3>
                                <p>Pending</p>
                            </div>
                        </div>
                        <div className="stat-card stat-approved">
                            <div className="stat-icon"><FaCheckCircle /></div>
                            <div className="stat-content">
                                <h3>{stats.approved}</h3>
                                <p>Approved</p>
                            </div>
                        </div>
                        <div className="stat-card stat-rejected">
                            <div className="stat-icon"><FaTimesCircle /></div>
                            <div className="stat-content">
                                <h3>{stats.rejected}</h3>
                                <p>Rejected</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== FILTERS ===== */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by app number, student, agent, university..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="submitted">Submitted</option>
                            <option value="under-review">Under Review</option>
                            <option value="pending-documents">Pending Documents</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="scholarship-disbursed">Disbursed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <FaUserTie className="filter-icon" />
                        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
                            <option value="all">All Agents</option>
                            {agents.map(a => (
                                <option key={a._id} value={a._id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ===== LIST HEADER ===== */}
                <div className="apps-list-header">
                    Showing <strong>{filteredApps.length}</strong> of {applications.length} applications
                </div>

                {/* ===== LIST ===== */}
                {loading ? (
                    <div className="loading-state">
                        <FaSpinner className="spinner-large" />
                        <p>Loading applications...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="empty-state">
                        <FaFileAlt className="empty-icon" />
                        <h3>No applications found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="apps-grid">
                        {filteredApps.map(app => (
                            <div key={app._id} className="app-card">

                                {/* ===== CARD HEADER ===== */}
                                <div className="app-card-header">
                                    <div className="app-number">
                                        <FaFileAlt />
                                        <span>{app.applicationNumber}</span>
                                    </div>
                                    {getStatusBadge(app.status)}
                                </div>

                                {/* ===== CARD BODY ===== */}
                                <div className="app-card-body">
                                    {/* Student */}
                                    <div className="info-row">
                                        <FaUserGraduate className="row-icon" />
                                        <div>
                                            <span className="row-label">Student</span>
                                            <strong>{app.student?.firstName} {app.student?.lastName}</strong>
                                            <small>{app.student?.email}</small>
                                        </div>
                                    </div>

                                    {/* Agent */}
                                    <div className="info-row agent-row">
                                        <FaUserTie className="row-icon agent-icon" />
                                        <div>
                                            <span className="row-label">Submitted By</span>
                                            <strong>{app.agentName || 'N/A'}</strong>
                                            <small>{app.agentEmail || 'N/A'}</small>
                                        </div>
                                    </div>

                                    {/* University */}
                                    <div className="info-row">
                                        <FaUniversity className="row-icon" />
                                        <div>
                                            <span className="row-label">University</span>
                                            <strong>{app.universityName || 'N/A'}</strong>
                                        </div>
                                    </div>

                                    {/* Program */}
                                    <div className="info-row">
                                        <FaGraduationCap className="row-icon" />
                                        <div>
                                            <span className="row-label">Program</span>
                                            <strong>{app.programName || 'N/A'}</strong>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="info-row">
                                        <FaCalendarAlt className="row-icon" />
                                        <div>
                                            <span className="row-label">Submitted On</span>
                                            <strong>{formatDate(app.submittedAt || app.createdAt)}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* ===== CARD ACTIONS ===== */}
                                <div className="app-card-actions">
                                    <button
                                        className="action-btn view-btn"
                                        onClick={() => handleView(app._id)}
                                        title="View Details"
                                    >
                                        <FaEye /> View
                                    </button>

                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => handleEdit(app._id)}
                                        title="Edit"
                                    >
                                        <FaEdit /> Edit
                                    </button>

                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => openActionModal('delete', app)}
                                        disabled={deleteLoading === app._id}
                                        title="Delete"
                                    >
                                        {deleteLoading === app._id ? (
                                            <FaSpinner className="spinner" />
                                        ) : (
                                            <><FaTrash /> Delete</>
                                        )}
                                    </button>
                                </div>

                                {/* ===== QUICK ACTIONS (if pending) ===== */}
                                {canTakeAction(app.status) && (
                                    <div className="quick-actions">
                                        <button
                                            className="quick-btn approve"
                                            onClick={() => openActionModal('approve', app)}
                                        >
                                            <FaCheckCircle /> Approve
                                        </button>
                                        <button
                                            className="quick-btn review"
                                            onClick={() => openActionModal('review', app)}
                                        >
                                            <FaRedo /> Review
                                        </button>
                                        <button
                                            className="quick-btn reject"
                                            onClick={() => openActionModal('reject', app)}
                                        >
                                            <FaTimesCircle /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ============================================ */}
                {/* ACTION MODAL */}
                {/* ============================================ */}
                {actionModal.show && (
                    <div className="modal-overlay" onClick={closeActionModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className={`modal-header ${actionModal.type}`}>
                                <h2>
                                    {actionModal.type === 'approve' && <>✅ Approve Application</>}
                                    {actionModal.type === 'reject' && <>❌ Reject Application</>}
                                    {actionModal.type === 'review' && <>🔄 Send Back for Review</>}
                                    {actionModal.type === 'delete' && <>🗑️ Delete Application</>}
                                </h2>
                                <button className="close-btn" onClick={closeActionModal}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body">
                                {/* App info */}
                                <div className="modal-app-info">
                                    <div className="info-item">
                                        <span>Application:</span>
                                        <strong>{actionModal.application?.applicationNumber}</strong>
                                    </div>
                                    <div className="info-item">
                                        <span>Student:</span>
                                        <strong>
                                            {actionModal.application?.student?.firstName} {actionModal.application?.student?.lastName}
                                        </strong>
                                    </div>
                                    <div className="info-item">
                                        <span>Agent:</span>
                                        <strong>{actionModal.application?.agentName}</strong>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="modal-message">
                                    {actionModal.type === 'approve' && (
                                        <p className="info-text">
                                            This will <strong>approve</strong> the application. The agent will receive a confirmation email.
                                        </p>
                                    )}
                                    {actionModal.type === 'reject' && (
                                        <p className="warning-text">
                                            This will <strong>reject</strong> the application. Agent will receive the reason via email.
                                        </p>
                                    )}
                                    {actionModal.type === 'review' && (
                                        <p className="review-text">
                                            Application will be sent back to agent for <strong>corrections</strong>.
                                        </p>
                                    )}
                                    {actionModal.type === 'delete' && (
                                        <p className="warning-text">
                                            ⚠️ This will <strong>permanently delete</strong> the application. This action cannot be undone.
                                        </p>
                                    )}
                                </div>

                                {/* Remarks (only for approve/reject/review) */}
                                {actionModal.type !== 'delete' && (
                                    <div className="form-group">
                                        <label>
                                            {actionModal.type === 'approve' && 'Remarks (Optional)'}
                                            {actionModal.type === 'reject' && 'Rejection Reason *'}
                                            {actionModal.type === 'review' && 'Review Remarks *'}
                                        </label>
                                        <textarea
                                            placeholder={
                                                actionModal.type === 'approve' ? 'Additional notes...' :
                                                actionModal.type === 'reject' ? 'Why is this being rejected?' :
                                                'What changes are needed?'
                                            }
                                            rows="4"
                                            value={actionModal.remarks}
                                            onChange={(e) => setActionModal(prev => ({ ...prev, remarks: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="modal-btn cancel"
                                    onClick={closeActionModal}
                                    disabled={actionModal.loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`modal-btn primary ${actionModal.type}`}
                                    onClick={handleAction}
                                    disabled={actionModal.loading}
                                >
                                    {actionModal.loading ? (
                                        <><FaSpinner className="spinner" /> Processing...</>
                                    ) : (
                                        <>
                                            {actionModal.type === 'approve' && <><FaCheckCircle /> Approve & Notify</>}
                                            {actionModal.type === 'reject' && <><FaTimesCircle /> Reject & Notify</>}
                                            {actionModal.type === 'review' && <><FaRedo /> Send Back</>}
                                            {actionModal.type === 'delete' && <><FaTrash /> Delete Permanently</>}
                                        </>
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

export default AdminApplications;