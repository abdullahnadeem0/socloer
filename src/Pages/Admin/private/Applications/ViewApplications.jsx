import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { 
    FaSearch, FaEye, FaCheck, FaTimes, 
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaIdCard, FaBriefcase, FaGraduationCap,
    FaSpinner, FaChevronLeft, FaChevronRight,
    FaExclamationTriangle, FaCheckCircle, FaClock,
    FaFileAlt, FaTimes as FaClose, FaRedo
} from 'react-icons/fa';
import './ViewApplications.css';

const ViewApplications = () => {
    const navigate = useNavigate();
    
    // ===== STATE =====
    const [agents, setAgents] = useState([]);
    const [filteredAgents, setFilteredAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    
    // ===== MODAL STATE =====
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // ===== TOAST STATE =====
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // ===== PAGINATION =====
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // ============================================
    // FETCH AGENTS
    // ============================================
    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await adminApi.getAllAgents(token);
            console.log('📥 Agents response:', response);

            if (response.success) {
                setAgents(response.agents || []);
                setStats(response.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
            }
        } catch (error) {
            console.error('❌ Fetch agents error:', error);
            setError(error.response?.data?.message || 'Failed to load applications');
            showToast('Failed to load applications', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FILTER AGENTS
    // ============================================
    useEffect(() => {
        let filtered = [...agents];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(agent => agent.approvalStatus === statusFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(agent =>
                agent.name?.toLowerCase().includes(query) ||
                agent.email?.toLowerCase().includes(query) ||
                agent.phone?.includes(query) ||
                agent.city?.toLowerCase().includes(query) ||
                agent.idNumber?.includes(query)
            );
        }

        setFilteredAgents(filtered);
        setCurrentPage(1);
    }, [agents, statusFilter, searchQuery]);

    // ============================================
    // PAGINATION
    // ============================================
    const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAgents = filteredAgents.slice(startIndex, startIndex + itemsPerPage);

    // ============================================
    // TOAST
    // ============================================
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 5000);
    };

    // ============================================
    // VIEW DETAILS
    // ============================================
    const handleViewDetails = (agent) => {
        setSelectedAgent(agent);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedAgent(null);
    };

    // ============================================
    // ✅ APPROVE AGENT
    // ============================================
    const handleApprove = async (agentId, skipConfirm = false) => {
        if (!skipConfirm && !window.confirm('Are you sure you want to approve this agent?')) return;

        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await adminApi.approveAgent(agentId, token);
            console.log('📥 Approve response:', response);

            if (response.success) {
                showToast(`✅ ${response.agent.name} has been approved! Email sent.`, 'success');
                
                setAgents(prev => prev.map(a => 
                    a._id === agentId 
                        ? { ...a, approvalStatus: 'approved', approvedAt: new Date() }
                        : a
                ));

                // Update stats
                const oldAgent = agents.find(a => a._id === agentId);
                if (oldAgent) {
                    setStats(prev => ({
                        ...prev,
                        [oldAgent.approvalStatus]: Math.max(0, prev[oldAgent.approvalStatus] - 1),
                        approved: prev.approved + 1
                    }));
                }

                closeDetailModal();
                setShowStatusModal(false);
            }
        } catch (error) {
            console.error('❌ Approve error:', error);
            showToast(error.response?.data?.message || 'Failed to approve agent', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // ✅ OPEN REJECT MODAL
    // ============================================
    const openRejectModal = (agent) => {
        setSelectedAgent(agent);
        setRejectionReason('');
        setShowRejectModal(true);
        setShowDetailModal(false);
        setShowStatusModal(false);
    };

    // ============================================
    // ✅ REJECT AGENT
    // ============================================
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }

        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await adminApi.rejectAgent(
                selectedAgent._id, 
                { reason: rejectionReason },
                token
            );
            console.log('📥 Reject response:', response);

            if (response.success) {
                showToast(`❌ ${response.agent.name} has been rejected. Email sent.`, 'success');
                
                setAgents(prev => prev.map(a => 
                    a._id === selectedAgent._id 
                        ? { ...a, approvalStatus: 'rejected', rejectionReason }
                        : a
                ));

                // Update stats
                const oldStatus = selectedAgent.approvalStatus;
                setStats(prev => ({
                    ...prev,
                    [oldStatus]: Math.max(0, prev[oldStatus] - 1),
                    rejected: prev.rejected + 1
                }));

                setShowRejectModal(false);
                setSelectedAgent(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('❌ Reject error:', error);
            showToast(error.response?.data?.message || 'Failed to reject agent', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // ✅ OPEN STATUS CHANGE MODAL
    // ============================================
    const openStatusModal = (agent, status) => {
        setSelectedAgent(agent);
        setNewStatus(status);
        setRejectionReason(agent.rejectionReason || '');
        setShowStatusModal(true);
        setShowDetailModal(false);
    };

    // ============================================
    // ✅ CHANGE STATUS (Approve / Reject / Pending)
    // ============================================
    const handleChangeStatus = async () => {
        if (!selectedAgent || !newStatus) return;

        // If rejected, need reason
        if (newStatus === 'rejected' && !rejectionReason.trim()) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }

        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            const oldStatus = selectedAgent.approvalStatus;

            let response;
            if (newStatus === 'approved') {
                response = await adminApi.approveAgent(selectedAgent._id, token);
            } else if (newStatus === 'rejected') {
                response = await adminApi.rejectAgent(
                    selectedAgent._id,
                    { reason: rejectionReason },
                    token
                );
            } else if (newStatus === 'pending') {
                // ✅ NEW: Set back to pending
                response = await adminApi.setPendingStatus(selectedAgent._id, token);
            }

            console.log('📥 Status change response:', response);

            if (response.success) {
                const statusMessages = {
                    approved: `✅ ${selectedAgent.name} approved! Email sent.`,
                    rejected: `❌ ${selectedAgent.name} rejected. Email sent.`,
                    pending: `⏳ ${selectedAgent.name} set to pending. Email sent.`
                };
                showToast(statusMessages[newStatus], 'success');

                // Update local state
                setAgents(prev => prev.map(a => 
                    a._id === selectedAgent._id 
                        ? { 
                            ...a, 
                            approvalStatus: newStatus,
                            rejectionReason: newStatus === 'rejected' ? rejectionReason : a.rejectionReason,
                            approvedAt: newStatus === 'approved' ? new Date() : a.approvedAt,
                            rejectedAt: newStatus === 'rejected' ? new Date() : a.rejectedAt
                        }
                        : a
                ));

                // Update stats
                setStats(prev => ({
                    ...prev,
                    [oldStatus]: Math.max(0, prev[oldStatus] - 1),
                    [newStatus]: prev[newStatus] + 1
                }));

                setShowStatusModal(false);
                setSelectedAgent(null);
                setNewStatus('');
                setRejectionReason('');
            }
        } catch (error) {
            console.error('❌ Status change error:', error);
            showToast(error.response?.data?.message || 'Failed to change status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // FORMAT DATE
    // ============================================
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // ============================================
    // STATUS BADGE
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            pending: { label: 'Pending', class: 'pending', icon: <FaClock /> },
            approved: { label: 'Approved', class: 'approved', icon: <FaCheckCircle /> },
            rejected: { label: 'Rejected', class: 'rejected', icon: <FaTimes /> }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`status-badge ${badge.class}`}>
                {badge.icon}
                {badge.label}
            </span>
        );
    };

    // ============================================
    // RENDER
    // ============================================
    if (loading) {
        return (
            <div className="applications-loading">
                <FaSpinner className="spinner" />
                <p>Loading applications...</p>
            </div>
        );
    }

    return (
        <div className="applications-page">
            {/* ===== TOAST ===== */}
            {toast.show && (
                <div className={`app-toast ${toast.type}`}>
                    <div className="toast-body">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* ===== PAGE HEADER ===== */}
            <div className="page-header">
                <div>
                    <h1>View Applications</h1>
                    <p>Review and manage agent registration requests</p>
                </div>
                <button className="btn-refresh" onClick={fetchAgents}>
                    <FaRedo /> Refresh
                </button>
            </div>

            {/* ===== STATS CARDS ===== */}
            <div className="stats-row">
                <div className="stat-box total">
                    <div className="stat-icon"><FaUser /></div>
                    <div>
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-box pending">
                    <div className="stat-icon"><FaClock /></div>
                    <div>
                        <span className="stat-label">Pending</span>
                        <span className="stat-value">{stats.pending}</span>
                    </div>
                </div>
                <div className="stat-box approved">
                    <div className="stat-icon"><FaCheckCircle /></div>
                    <div>
                        <span className="stat-label">Approved</span>
                        <span className="stat-value">{stats.approved}</span>
                    </div>
                </div>
                <div className="stat-box rejected">
                    <div className="stat-icon"><FaTimes /></div>
                    <div>
                        <span className="stat-label">Rejected</span>
                        <span className="stat-value">{stats.rejected}</span>
                    </div>
                </div>
            </div>

            {/* ===== FILTERS ===== */}
            <div className="filters-bar">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-tabs">
                    <button 
                        className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All ({stats.total})
                    </button>
                    <button 
                        className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button 
                        className={`filter-tab ${statusFilter === 'approved' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('approved')}
                    >
                        Approved ({stats.approved})
                    </button>
                    <button 
                        className={`filter-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('rejected')}
                    >
                        Rejected ({stats.rejected})
                    </button>
                </div>
            </div>

            {/* ===== ERROR ===== */}
            {error && (
                <div className="error-banner">
                    <FaExclamationTriangle />
                    {error}
                </div>
            )}

            {/* ===== APPLICATIONS TABLE ===== */}
            {paginatedAgents.length > 0 ? (
                <div className="applications-table-wrapper">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Job Title</th>
                                <th>Applied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAgents.map((agent) => (
                                <tr key={agent._id}>
                                    <td>
                                        <div className="agent-cell">
                                            <div className="agent-avatar">
                                                {agent.profileImage ? (
                                                    <img src={agent.profileImage} alt={agent.name} />
                                                ) : (
                                                    <span>{getInitials(agent.name)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="agent-name">{agent.name}</div>
                                                <div className="agent-id">{agent.idType}: {agent.idNumber}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <div><FaEnvelope /> {agent.email}</div>
                                            <div><FaPhone /> {agent.phone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="location-cell">
                                            <FaMapMarkerAlt />
                                            {agent.city}, {agent.state}
                                        </div>
                                    </td>
                                    <td>{agent.jobTitle || 'N/A'}</td>
                                    <td>{formatDate(agent.createdAt)}</td>
                                    <td>{getStatusBadge(agent.approvalStatus)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-view"
                                                onClick={() => handleViewDetails(agent)}
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                            
                                            {/* ✅ Pending: Show Approve/Reject */}
                                            {agent.approvalStatus === 'pending' && (
                                                <>
                                                    <button 
                                                        className="btn-approve"
                                                        onClick={() => handleApprove(agent._id)}
                                                        title="Approve"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button 
                                                        className="btn-reject"
                                                        onClick={() => openRejectModal(agent)}
                                                        title="Reject"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}

                                            {/* ✅ Approved/Rejected: Show Change Status button */}
                                            {agent.approvalStatus !== 'pending' && (
                                                <button 
                                                    className="btn-change-status"
                                                    onClick={() => openStatusModal(agent, agent.approvalStatus)}
                                                    title="Change Status"
                                                >
                                                    <FaRedo />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <FaUser className="empty-icon" />
                    <h3>No applications found</h3>
                    <p>
                        {searchQuery || statusFilter !== 'all' 
                            ? 'Try changing your filters' 
                            : 'No agent applications yet'}
                    </p>
                </div>
            )}

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <FaChevronLeft /> Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next <FaChevronRight />
                    </button>
                </div>
            )}

            {/* ===== DETAIL MODAL ===== */}
            {showDetailModal && selectedAgent && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeDetailModal}>
                            <FaClose />
                        </button>

                        <div className="modal-header">
                            <div className="modal-avatar">
                                {selectedAgent.profileImage ? (
                                    <img src={selectedAgent.profileImage} alt={selectedAgent.name} />
                                ) : (
                                    <span>{getInitials(selectedAgent.name)}</span>
                                )}
                            </div>
                            <div className="modal-header-info">
                                <h2>{selectedAgent.name}</h2>
                                <p>{selectedAgent.email}</p>
                                {getStatusBadge(selectedAgent.approvalStatus)}
                            </div>
                        </div>

                        <div className="modal-body">
                            {/* Personal Info */}
                            <div className="detail-section">
                                <h3><FaUser /> Personal Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Full Name</label>
                                        <p>{selectedAgent.name}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email</label>
                                        <p>{selectedAgent.email}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone</label>
                                        <p>{selectedAgent.phone}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Date of Birth</label>
                                        <p>{formatDate(selectedAgent.dateOfBirth)}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Gender</label>
                                        <p>{selectedAgent.gender}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Nationality</label>
                                        <p>{selectedAgent.nationality || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Identification */}
                            <div className="detail-section">
                                <h3><FaIdCard /> Identification</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>ID Type</label>
                                        <p style={{textTransform: 'capitalize'}}>
                                            {selectedAgent.idType?.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="detail-item">
                                        <label>ID Number</label>
                                        <p>{selectedAgent.idNumber}</p>
                                    </div>
                                </div>
                                
                                {selectedAgent.idFile && (
                                    <div className="id-document">
                                        <label>ID Document</label>
                                        <div className="document-preview">
                                            {selectedAgent.idFile.match(/\.(jpg|jpeg|png)$/i) ? (
                                                <img 
                                                    src={`http://localhost:5000${selectedAgent.idFile}`}
                                                    alt="ID Document"
                                                    onClick={() => window.open(`http://localhost:5000${selectedAgent.idFile}`, '_blank')}
                                                />
                                            ) : (
                                                <a 
                                                    href={`http://localhost:5000${selectedAgent.idFile}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="document-link"
                                                >
                                                    <FaFileAlt />
                                                    View Document (PDF)
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Professional */}
                            <div className="detail-section">
                                <h3><FaBriefcase /> Professional Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Job Title</label>
                                        <p>{selectedAgent.jobTitle || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Company</label>
                                        <p>{selectedAgent.company || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Experience</label>
                                        <p>{selectedAgent.experience || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Education</label>
                                        <p>{selectedAgent.education || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Specialization</label>
                                        <p>{selectedAgent.specialization || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="detail-section">
                                <h3><FaMapMarkerAlt /> Location</h3>
                                <div className="detail-grid">
                                    <div className="detail-item full-width">
                                        <label>Address</label>
                                        <p>{selectedAgent.address}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>City</label>
                                        <p>{selectedAgent.city}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>State</label>
                                        <p>{selectedAgent.state}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Pincode</label>
                                        <p>{selectedAgent.pincode}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Country</label>
                                        <p>{selectedAgent.country}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Languages & Skills */}
                            {(selectedAgent.languages?.length > 0 || selectedAgent.skills?.length > 0) && (
                                <div className="detail-section">
                                    <h3><FaGraduationCap /> Languages & Skills</h3>
                                    {selectedAgent.languages?.length > 0 && (
                                        <div className="detail-item">
                                            <label>Languages</label>
                                            <div className="tags-display">
                                                {selectedAgent.languages.map((lang, i) => (
                                                    <span key={i} className="tag-item">{lang}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedAgent.skills?.length > 0 && (
                                        <div className="detail-item">
                                            <label>Skills</label>
                                            <div className="tags-display">
                                                {selectedAgent.skills.map((skill, i) => (
                                                    <span key={i} className="tag-item">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedAgent.bio && (
                                <div className="detail-section">
                                    <h3>Bio</h3>
                                    <p className="bio-text">{selectedAgent.bio}</p>
                                </div>
                            )}

                            {selectedAgent.approvalStatus === 'rejected' && (
                                <div className="detail-section rejection-info">
                                    <h3>Rejection Details</h3>
                                    <div className="detail-item">
                                        <label>Reason</label>
                                        <p>{selectedAgent.rejectionReason || 'No reason provided'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Rejected At</label>
                                        <p>{formatDateTime(selectedAgent.rejectedAt)}</p>
                                    </div>
                                </div>
                            )}

                            {selectedAgent.approvalStatus === 'approved' && (
                                <div className="detail-section approval-info">
                                    <h3>Approval Details</h3>
                                    <div className="detail-item">
                                        <label>Approved At</label>
                                        <p>{formatDateTime(selectedAgent.approvedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== FOOTER - SHOW ALL STATUS OPTIONS ===== */}
                        <div className="modal-footer">
                            {selectedAgent.approvalStatus === 'pending' ? (
                                <>
                                    <button 
                                        className="btn-modal-reject"
                                        onClick={() => openRejectModal(selectedAgent)}
                                        disabled={actionLoading}
                                    >
                                        <FaTimes /> Reject
                                    </button>
                                    <button 
                                        className="btn-modal-approve"
                                        onClick={() => handleApprove(selectedAgent._id)}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <><FaSpinner className="spin" /> Processing...</>
                                        ) : (
                                            <><FaCheck /> Approve Agent</>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        className="btn-modal-pending"
                                        onClick={() => openStatusModal(selectedAgent, 'pending')}
                                        disabled={actionLoading}
                                    >
                                        <FaClock /> Set to Pending
                                    </button>
                                    <button 
                                        className={`btn-modal-${selectedAgent.approvalStatus === 'approved' ? 'reject' : 'approve'}`}
                                        onClick={() => openStatusModal(
                                            selectedAgent, 
                                            selectedAgent.approvalStatus === 'approved' ? 'rejected' : 'approved'
                                        )}
                                        disabled={actionLoading}
                                    >
                                        {selectedAgent.approvalStatus === 'approved' ? (
                                            <><FaTimes /> Reject Instead</>
                                        ) : (
                                            <><FaCheck /> Approve Instead</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== STATUS CHANGE MODAL ===== */}
            {showStatusModal && selectedAgent && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="status-header">
                            <div className={`status-icon ${newStatus}`}>
                                {newStatus === 'approved' && <FaCheckCircle />}
                                {newStatus === 'rejected' && <FaTimes />}
                                {newStatus === 'pending' && <FaClock />}
                            </div>
                            <h2>Change Status</h2>
                            <p>
                                Change status for <strong>{selectedAgent.name}</strong> from{' '}
                                <strong style={{textTransform: 'capitalize'}}>{selectedAgent.approvalStatus}</strong> to{' '}
                                <strong style={{textTransform: 'capitalize'}}>{newStatus}</strong>
                            </p>
                        </div>

                        {/* Status Options */}
                        <div className="status-options">
                            <button
                                type="button"
                                className={`status-option ${newStatus === 'pending' ? 'active' : ''}`}
                                onClick={() => setNewStatus('pending')}
                            >
                                <FaClock />
                                <span>Pending</span>
                            </button>
                            <button
                                type="button"
                                className={`status-option ${newStatus === 'approved' ? 'active' : ''}`}
                                onClick={() => setNewStatus('approved')}
                            >
                                <FaCheckCircle />
                                <span>Approved</span>
                            </button>
                            <button
                                type="button"
                                className={`status-option ${newStatus === 'rejected' ? 'active' : ''}`}
                                onClick={() => setNewStatus('rejected')}
                            >
                                <FaTimes />
                                <span>Rejected</span>
                            </button>
                        </div>

                        {/* Rejection Reason */}
                        {newStatus === 'rejected' && (
                            <div className="status-body">
                                <label>Rejection Reason *</label>
                                <textarea
                                    placeholder="Please provide a reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows="4"
                                    autoFocus
                                />
                                <small>{rejectionReason.length}/500 characters</small>
                            </div>
                        )}

                        {/* Info Message */}
                        <div className={`status-info ${newStatus}`}>
                            {newStatus === 'approved' && (
                                <>
                                    <FaCheckCircle />
                                    <span>
                                        ✅ Agent will be notified via email: "Congratulations! You are verified and now available on our website."
                                    </span>
                                </>
                            )}
                            {newStatus === 'rejected' && (
                                <>
                                    <FaExclamationTriangle />
                                    <span>
                                        ⚠️ Agent will be notified via email with the rejection reason.
                                    </span>
                                </>
                            )}
                            {newStatus === 'pending' && (
                                <>
                                    <FaClock />
                                    <span>
                                        ⏳ Agent will be notified that their application is under review again.
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="status-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowStatusModal(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className={`btn-confirm-${newStatus}`}
                                onClick={handleChangeStatus}
                                disabled={actionLoading || (newStatus === 'rejected' && !rejectionReason.trim())}
                            >
                                {actionLoading ? (
                                    <><FaSpinner className="spin" /> Processing...</>
                                ) : (
                                    <>
                                        {newStatus === 'approved' && <><FaCheckCircle /> Approve</>}
                                        {newStatus === 'rejected' && <><FaTimes /> Reject</>}
                                        {newStatus === 'pending' && <><FaClock /> Set Pending</>}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== REJECT MODAL (from table) ===== */}
            {showRejectModal && selectedAgent && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content reject-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="reject-header">
                            <div className="reject-icon">
                                <FaExclamationTriangle />
                            </div>
                            <h2>Reject Application</h2>
                            <p>
                                Are you sure you want to reject <strong>{selectedAgent.name}</strong>?
                                This action will send an email to the agent.
                            </p>
                        </div>

                        <div className="reject-body">
                            <label>Rejection Reason *</label>
                            <textarea
                                placeholder="Please provide a reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows="4"
                                autoFocus
                            />
                            <small>{rejectionReason.length}/500 characters</small>
                        </div>

                        <div className="reject-footer">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowRejectModal(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-confirm-reject"
                                onClick={handleReject}
                                disabled={actionLoading || !rejectionReason.trim()}
                            >
                                {actionLoading ? (
                                    <><FaSpinner className="spin" /> Rejecting...</>
                                ) : (
                                    <><FaTimes /> Confirm Reject</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewApplications;