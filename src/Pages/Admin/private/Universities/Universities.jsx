import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { 
    FaSearch, FaPlus, FaEye, FaEdit, FaTrash,
    FaCheckCircle, FaTimesCircle, FaToggleOn, FaToggleOff,
    FaSpinner, FaUniversity, FaMapMarkerAlt, FaEnvelope,
    FaPhone, FaGlobe, FaUser, FaRedo, FaExclamationTriangle,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import './Universities.css';

const Universities = () => {
    const navigate = useNavigate();
    
    // ===== STATE =====
    const [universities, setUniversities] = useState([]);
    const [filteredUniversities, setFilteredUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ 
        total: 0, active: 0, inactive: 0, verified: 0, unverified: 0 
    });
    
    // ===== TOAST =====
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // ===== DELETE MODAL =====
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUni, setSelectedUni] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // ===== PAGINATION =====
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // ============================================
    // FETCH UNIVERSITIES
    // ============================================
    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await adminApi.getAllUniversities(token);
            console.log('📥 Universities:', response);

            if (response.success) {
                setUniversities(response.universities || []);
                setStats(response.stats || { 
                    total: 0, active: 0, inactive: 0, verified: 0, unverified: 0 
                });
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setError(error.response?.data?.message || 'Failed to load universities');
            showToast('Failed to load universities', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FILTER
    // ============================================
    useEffect(() => {
        let filtered = [...universities];

        if (statusFilter === 'active') {
            filtered = filtered.filter(u => u.isActive);
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(u => !u.isActive);
        } else if (statusFilter === 'verified') {
            filtered = filtered.filter(u => u.isVerified);
        } else if (statusFilter === 'unverified') {
            filtered = filtered.filter(u => !u.isVerified);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(query) ||
                u.code?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.city?.toLowerCase().includes(query)
            );
        }

        setFilteredUniversities(filtered);
        setCurrentPage(1);
    }, [universities, statusFilter, searchQuery]);

    // ============================================
    // PAGINATION
    // ============================================
    const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUniversities = filteredUniversities.slice(startIndex, startIndex + itemsPerPage);

    // ============================================
    // TOAST
    // ============================================
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 4000);
    };

    // ============================================
    // DELETE
    // ============================================
    const handleDelete = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await adminApi.deleteUniversity(selectedUni._id, token);
            
            if (response.success) {
                showToast(`✅ ${selectedUni.name} deleted successfully`, 'success');
                setUniversities(prev => prev.filter(u => u._id !== selectedUni._id));
                setStats(prev => ({ ...prev, total: prev.total - 1 }));
                setShowDeleteModal(false);
                setSelectedUni(null);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // TOGGLE ACTIVE
    // ============================================
    const handleToggleActive = async (uni) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.toggleUniversityActive(uni._id, token);
            
            if (response.success) {
                showToast(`✅ ${uni.name} ${response.university.isActive ? 'activated' : 'deactivated'}`, 'success');
                setUniversities(prev => prev.map(u => 
                    u._id === uni._id ? { ...u, isActive: response.university.isActive } : u
                ));
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle status', 'error');
        }
    };

    // ============================================
    // TOGGLE VERIFIED
    // ============================================
    const handleToggleVerified = async (uni) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.toggleUniversityVerified(uni._id, token);
            
            if (response.success) {
                showToast(`✅ ${uni.name} ${response.university.isVerified ? 'verified' : 'unverified'}`, 'success');
                setUniversities(prev => prev.map(u => 
                    u._id === uni._id ? { ...u, isVerified: response.university.isVerified } : u
                ));
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle verified', 'error');
        }
    };

    // ============================================
    // RENDER
    // ============================================
    if (loading) {
        return (
            <div className="universities-loading">
                <FaSpinner className="spinner" />
                <p>Loading universities...</p>
            </div>
        );
    }

    return (
        <div className="universities-page">
            {/* Toast */}
            {toast.show && (
                <div className={`app-toast ${toast.type}`}>
                    <div className="toast-body">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Universities</h1>
                    <p>Manage all registered universities</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchUniversities}>
                        <FaRedo /> Refresh
                    </button>
                    <Link to="/admin/universities/add" className="btn-add">
                        <FaPlus /> Add University
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-box total">
                    <div className="stat-icon"><FaUniversity /></div>
                    <div>
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-box active">
                    <div className="stat-icon"><FaCheckCircle /></div>
                    <div>
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>
                <div className="stat-box inactive">
                    <div className="stat-icon"><FaTimesCircle /></div>
                    <div>
                        <span className="stat-label">Inactive</span>
                        <span className="stat-value">{stats.inactive}</span>
                    </div>
                </div>
                <div className="stat-box verified">
                    <div className="stat-icon"><FaCheckCircle /></div>
                    <div>
                        <span className="stat-label">Verified</span>
                        <span className="stat-value">{stats.verified}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, code, email, city..."
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
                        className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        Active ({stats.active})
                    </button>
                    <button 
                        className={`filter-tab ${statusFilter === 'inactive' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('inactive')}
                    >
                        Inactive ({stats.inactive})
                    </button>
                    <button 
                        className={`filter-tab ${statusFilter === 'verified' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('verified')}
                    >
                        Verified ({stats.verified})
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-banner">
                    <FaExclamationTriangle />
                    {error}
                </div>
            )}

            {/* Table */}
            {paginatedUniversities.length > 0 ? (
                <div className="universities-table-wrapper">
                    <table className="universities-table">
                        <thead>
                            <tr>
                                <th>University</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Owner/Manager</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUniversities.map((uni) => (
                                <tr key={uni._id}>
                                    <td>
                                        <div className="uni-cell">
                                            <div className="uni-logo">
                                                {uni.logo ? (
                                                    <img 
                                                        src={`http://localhost:5000${uni.logo}`} 
                                                        alt={uni.name} 
                                                    />
                                                ) : (
                                                    <span><FaUniversity /></span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="uni-name">{uni.name}</div>
                                                <div className="uni-code">
                                                    Code: <strong>{uni.code}</strong>
                                                    {uni.shortName && ` | ${uni.shortName}`}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <div><FaEnvelope /> {uni.email}</div>
                                            <div><FaPhone /> {uni.phone}</div>
                                            {uni.website && (
                                                <div><FaGlobe /> {uni.website}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="location-cell">
                                            <FaMapMarkerAlt />
                                            <div>
                                                <div>{uni.city}, {uni.state}</div>
                                                <small>{uni.country} - {uni.pincode}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {uni.ownerManager?.name ? (
                                            <div className="owner-cell">
                                                <div className="owner-name">
                                                    <FaUser /> {uni.ownerManager.name}
                                                </div>
                                                <small>{uni.ownerManager.designation}</small>
                                                {uni.ownerManager.phone && (
                                                    <small><FaPhone /> {uni.ownerManager.phone}</small>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">N/A</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="status-cell">
                                            <button
                                                className={`status-toggle ${uni.isActive ? 'active' : 'inactive'}`}
                                                onClick={() => handleToggleActive(uni)}
                                                title={uni.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {uni.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                {uni.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                            <button
                                                className={`status-toggle ${uni.isVerified ? 'verified' : 'unverified'}`}
                                                onClick={() => handleToggleVerified(uni)}
                                                title={uni.isVerified ? 'Unverify' : 'Verify'}
                                            >
                                                {uni.isVerified ? <FaCheckCircle /> : <FaTimesCircle />}
                                                {uni.isVerified ? 'Verified' : 'Unverified'}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link 
                                                to={`/admin/universities/${uni._id}`}
                                                className="btn-view"
                                                title="View"
                                            >
                                                <FaEye />
                                            </Link>
                                            <Link 
                                                to={`/admin/universities/edit/${uni._id}`}
                                                className="btn-edit"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => {
                                                    setSelectedUni(uni);
                                                    setShowDeleteModal(true);
                                                }}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <FaUniversity className="empty-icon" />
                    <h3>No universities found</h3>
                    <p>
                        {searchQuery || statusFilter !== 'all'
                            ? 'Try changing your filters'
                            : 'Start by adding your first university'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                        <Link to="/admin/universities/add" className="btn-add-empty">
                            <FaPlus /> Add University
                        </Link>
                    )}
                </div>
            )}

            {/* Pagination */}
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

            {/* Delete Modal */}
            {showDeleteModal && selectedUni && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-icon">
                            <FaTrash />
                        </div>
                        <h2>Delete University?</h2>
                        <p>
                            Are you sure you want to delete <strong>{selectedUni.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button 
                                className="btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-confirm-delete"
                                onClick={handleDelete}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <><FaSpinner className="spin" /> Deleting...</>
                                ) : (
                                    <><FaTrash /> Delete</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Universities;