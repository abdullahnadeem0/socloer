import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { getFileUrl } from '../../../../api/config';
import { 
    FaSearch, FaPlus, FaEye, FaEdit, FaTrash,
    FaCheckCircle, FaTimesCircle, FaToggleOn, FaToggleOff,
    FaSpinner, FaGraduationCap, FaUniversity, FaRedo,
    FaExclamationTriangle, FaStar, FaRegStar,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import './Programs.css';

const Programs = () => {
    const navigate = useNavigate();

    // ===== STATE =====
    const [programs, setPrograms] = useState([]);
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ 
        total: 0, active: 0, inactive: 0, featured: 0 
    });
    
    // ===== TOAST =====
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // ===== DELETE MODAL =====
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // ===== PAGINATION =====
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // ============================================
    // FETCH PROGRAMS
    // ============================================
    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await adminApi.getAllPrograms(token);
            console.log('📥 Programs:', response);

            if (response.success) {
                setPrograms(response.programs || []);
                setStats(response.stats || { total: 0, active: 0, inactive: 0, featured: 0 });
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setError(error.response?.data?.message || 'Failed to load programs');
            showToast('Failed to load programs', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FILTER
    // ============================================
    useEffect(() => {
        let filtered = [...programs];

        // Status filter
        if (statusFilter === 'active') filtered = filtered.filter(p => p.isActive);
        else if (statusFilter === 'inactive') filtered = filtered.filter(p => !p.isActive);
        else if (statusFilter === 'featured') filtered = filtered.filter(p => p.isFeatured);

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.university?.name?.toLowerCase().includes(q)
            );
        }

        setFilteredPrograms(filtered);
        setCurrentPage(1);
    }, [programs, statusFilter, searchQuery]);

    // ============================================
    // PAGINATION
    // ============================================
    const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage);

    // ============================================
    // TOAST
    // ============================================
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 4000);
    };

    // ============================================
    // TOGGLE ACTIVE
    // ============================================
    const handleToggleActive = async (program) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.toggleProgramActive(program._id, token);

            if (response.success) {
                showToast(
                    `✅ ${program.name} ${response.program.isActive ? 'activated' : 'deactivated'}`,
                    'success'
                );
                setPrograms(prev => prev.map(p =>
                    p._id === program._id
                        ? { ...p, isActive: response.program.isActive }
                        : p
                ));
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle', 'error');
        }
    };

    // ============================================
    // TOGGLE FEATURED
    // ============================================
    const handleToggleFeatured = async (program) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.toggleProgramFeatured(program._id, token);

            if (response.success) {
                showToast(
                    `⭐ ${program.name} ${response.program.isFeatured ? 'featured' : 'unfeatured'}`,
                    'success'
                );
                setPrograms(prev => prev.map(p =>
                    p._id === program._id
                        ? { ...p, isFeatured: response.program.isFeatured }
                        : p
                ));
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle', 'error');
        }
    };

    // ============================================
    // DELETE
    // ============================================
    const handleDelete = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.deleteProgram(selectedProgram._id, token);

            if (response.success) {
                showToast(`✅ ${selectedProgram.name} deleted`, 'success');
                setPrograms(prev => prev.filter(p => p._id !== selectedProgram._id));
                setStats(prev => ({ ...prev, total: prev.total - 1 }));
                setShowDeleteModal(false);
                setSelectedProgram(null);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // LOADING
    // ============================================
    if (loading) {
        return (
            <div className="programs-loading">
                <FaSpinner className="spinner" />
                <p>Loading programs...</p>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="programs-page">
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
                    <h1>Programs</h1>
                    <p>Manage all academic programs</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchPrograms}>
                        <FaRedo /> Refresh
                    </button>
                    <Link to="/admin/programs/add" className="btn-add">
                        <FaPlus /> Add Program
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-box total">
                    <div className="stat-icon"><FaGraduationCap /></div>
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
                <div className="stat-box featured">
                    <div className="stat-icon"><FaStar /></div>
                    <div>
                        <span className="stat-label">Featured</span>
                        <span className="stat-value">{stats.featured}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, university..."
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
                        className={`filter-tab ${statusFilter === 'featured' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('featured')}
                    >
                        Featured ({stats.featured})
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

            {/* Programs Grid */}
            {paginatedPrograms.length > 0 ? (
                <div className="programs-grid">
                    {paginatedPrograms.map(program => (
                        <div key={program._id} className="program-card">
                            {/* Banner */}
                            <div className="program-banner">
                                {program.banner ? (
                                    <img 
                                        src={getFileUrl(program.banner)} 
                                        alt={program.name}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="banner-placeholder">
                                        <FaGraduationCap />
                                    </div>
                                )}
                                
                                {/* Status Badges */}
                                <div className="banner-badges">
                                    {program.isFeatured && (
                                        <span className="badge featured">
                                            <FaStar /> Featured
                                        </span>
                                    )}
                                    <span className={`badge ${program.isActive ? 'active' : 'inactive'}`}>
                                        {program.isActive ? '● Active' : '● Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="program-content">
                                <div className="program-header">
                                    <h3>{program.name}</h3>
                                </div>

                                {/* University */}
                                {program.university && (
                                    <div className="program-university">
                                        <FaUniversity />
                                        <span>{program.university.name}</span>
                                    </div>
                                )}

                                {/* Description */}
                                {program.description && (
                                    <p className="program-description">
                                        {program.description.length > 100 
                                            ? program.description.substring(0, 100) + '...' 
                                            : program.description}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="program-actions">
                                    <Link 
                                        to={`/admin/programs/${program._id}`}
                                        className="action-btn view"
                                        title="View Details"
                                    >
                                        <FaEye />
                                    </Link>
                                    <Link 
                                        to={`/admin/programs/edit/${program._id}`}
                                        className="action-btn edit"
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </Link>
                                    <button 
                                        className="action-btn star"
                                        onClick={() => handleToggleFeatured(program)}
                                        title={program.isFeatured ? 'Unfeature' : 'Feature'}
                                    >
                                        {program.isFeatured ? <FaStar /> : <FaRegStar />}
                                    </button>
                                    <button 
                                        className="action-btn toggle"
                                        onClick={() => handleToggleActive(program)}
                                        title={program.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {program.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                    </button>
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => {
                                            setSelectedProgram(program);
                                            setShowDeleteModal(true);
                                        }}
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FaGraduationCap className="empty-icon" />
                    <h3>No programs found</h3>
                    <p>
                        {searchQuery || statusFilter !== 'all'
                            ? 'Try changing your filters'
                            : 'Start by adding your first program'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                        <Link to="/admin/programs/add" className="btn-add-empty">
                            <FaPlus /> Add Program
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
            {showDeleteModal && selectedProgram && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-icon">
                            <FaTrash />
                        </div>
                        <h2>Delete Program?</h2>
                        <p>
                            Are you sure you want to delete <strong>{selectedProgram.name}</strong>?
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

export default Programs;