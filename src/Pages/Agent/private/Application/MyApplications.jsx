// src/Pages/Agent/private/Application/MyApplications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyApplications.css';
import agentApi from '../../../../api/agentApi';
import {
    FaSearch, FaFilter, FaEye, FaEdit, FaTrash,
    FaCheckCircle, FaClock, FaTimesCircle, FaSpinner,
    FaFileAlt, FaUserGraduate, FaUniversity, FaPlus,
    FaExclamationTriangle, FaFolderOpen, FaCalendarAlt,
    FaChartLine, FaHourglassHalf, FaGraduationCap
} from 'react-icons/fa';

const MyApplications = () => {
    const navigate = useNavigate();

    // ===== STATE =====
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // ===== FILTERS =====
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await agentApi.getMyApplications();
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
            const response = await agentApi.getApplicationStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('❌ Stats error:', error);
        }
    };

    // ============================================
    // FILTER EFFECT
    // ============================================
    useEffect(() => {
        let filtered = [...applications];

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.applicationNumber?.toLowerCase().includes(term) ||
                app.student?.firstName?.toLowerCase().includes(term) ||
                app.student?.lastName?.toLowerCase().includes(term) ||
                app.student?.email?.toLowerCase().includes(term) ||
                app.universityName?.toLowerCase().includes(term) ||
                app.programName?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        setFilteredApps(filtered);
    }, [searchTerm, statusFilter, applications]);

    // ============================================
    // NAVIGATION HANDLERS
    // ============================================
    const handleView = (id) => {
        navigate(`/agent/view-application/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/agent/edit-application/${id}`);
    };

    const handleNewApplication = () => {
        navigate('/agent/student-application');
    };

    // ============================================
    // DELETE
    // ============================================
    const handleDelete = async (id, appNumber) => {
        if (!window.confirm(`Delete application "${appNumber}"? This cannot be undone.`)) return;

        setDeleteLoading(id);
        try {
            const response = await agentApi.deleteApplication(id);
            if (response.success) {
                setSuccessMessage('🗑️ Application deleted successfully');
                fetchApplications();
                fetchStats();
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            setServerError(error.response?.data?.message || 'Failed to delete');
            setTimeout(() => setServerError(''), 3000);
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const statusMap = {
            'draft': { class: 'status-draft', label: 'Draft', icon: <FaFileAlt /> },
            'submitted': { class: 'status-submitted', label: 'Submitted', icon: <FaClock /> },
            'under-review': { class: 'status-review', label: 'Under Review', icon: <FaHourglassHalf /> },
            'pending-documents': { class: 'status-pending', label: 'Pending Docs', icon: <FaExclamationTriangle /> },
            'approved': { class: 'status-approved', label: 'Approved', icon: <FaCheckCircle /> },
            'rejected': { class: 'status-rejected', label: 'Rejected', icon: <FaTimesCircle /> },
            'scholarship-disbursed': { class: 'status-disbursed', label: 'Disbursed', icon: <FaCheckCircle /> }
        };
        const config = statusMap[status] || statusMap['submitted'];
        return (
            <span className={`status-badge ${config.class}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const canEdit = (status) => {
        return !['approved', 'scholarship-disbursed'].includes(status);
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="MyApplications">
            <div className="my-apps-container">

                {/* ===== HEADER ===== */}
                <div className="my-apps-header">
                    <div className="header-left">
                        <div className="header-icon-wrapper">
                            <FaFolderOpen className="header-icon" />
                        </div>
                        <div>
                            <h1>My Applications</h1>
                            <p>Manage all your student scholarship applications</p>
                        </div>
                    </div>

                    <button
                        className="new-app-btn"
                        onClick={handleNewApplication}
                    >
                        <FaPlus /> New Application
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
                                <h3>{(stats.submitted || 0) + (stats.pending || 0) + (stats.underReview || 0)}</h3>
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

                {/* ===== FILTERS BAR ===== */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by app number, student name, university..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="submitted">Submitted</option>
                            <option value="under-review">Under Review</option>
                            <option value="pending-documents">Pending Documents</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="scholarship-disbursed">Disbursed</option>
                        </select>
                    </div>
                </div>

                {/* ===== APPLICATIONS LIST ===== */}
                <div className="apps-list-header">
                    <span>
                        Showing <strong>{filteredApps.length}</strong> of {applications.length} applications
                    </span>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <FaSpinner className="spinner-large" />
                        <p>Loading your applications...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="empty-state">
                        <FaFolderOpen className="empty-icon" />
                        <h3>No applications found</h3>
                        <p>
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Click "New Application" to submit your first scholarship application'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
                            <button
                                className="empty-action-btn"
                                onClick={handleNewApplication}
                            >
                                <FaPlus /> Create Application
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="apps-grid">
                        {filteredApps.map(app => (
                            <div key={app._id} className="app-card">

                                {/* HEADER */}
                                <div className="app-card-header">
                                    <div className="app-number">
                                        <FaFileAlt />
                                        <span>{app.applicationNumber}</span>
                                    </div>
                                    {getStatusBadge(app.status)}
                                </div>

                                {/* BODY */}
                                <div className="app-card-body">
                                    {/* Student */}
                                    <div className="info-row">
                                        <FaUserGraduate className="row-icon" />
                                        <div>
                                            <span className="row-label">Student</span>
                                            <strong>
                                                {app.student?.firstName} {app.student?.lastName}
                                            </strong>
                                            <small>{app.student?.email}</small>
                                        </div>
                                    </div>

                                    {/* University */}
                                    <div className="info-row">
                                        <FaUniversity className="row-icon" />
                                        <div>
                                            <span className="row-label">University</span>
                                            <strong>{app.universityName || 'N/A'}</strong>
                                            <small>{app.university?.city}, {app.university?.state}</small>
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
                                            <span className="row-label">Submitted</span>
                                            <strong>{formatDate(app.submittedAt || app.createdAt)}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTIONS */}
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
                                        disabled={!canEdit(app.status)}
                                        title={canEdit(app.status) ? 'Edit' : 'Cannot edit approved/disbursed'}
                                    >
                                        <FaEdit /> Edit
                                    </button>

                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(app._id, app.applicationNumber)}
                                        disabled={
                                            deleteLoading === app._id ||
                                            !canEdit(app.status)
                                        }
                                        title={canEdit(app.status) ? 'Delete' : 'Cannot delete approved/disbursed'}
                                    >
                                        {deleteLoading === app._id ? (
                                            <FaSpinner className="spinner" />
                                        ) : (
                                            <><FaTrash /> Delete</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;