import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { getFileUrl } from '../../../../api/config';
import { 
    FaArrowLeft, FaEdit, FaTrash, FaGraduationCap,
    FaUniversity, FaCheckCircle, FaSpinner, FaToggleOn,
    FaToggleOff, FaExclamationTriangle, FaStar, FaRegStar,
    FaInfoCircle, FaMapMarkerAlt
} from 'react-icons/fa';
import './ProgramDetail.css';

const ProgramDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ===== STATE =====
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ============================================
    // FETCH PROGRAM
    // ============================================
    useEffect(() => {
        fetchProgram();
    }, [id]);

    const fetchProgram = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await adminApi.getProgramById(id, token);
            console.log('📥 Program:', response);

            if (response.success) {
                setProgram(response.program);
            } else {
                setError('Program not found');
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setError(error.response?.data?.message || 'Failed to load program');
        } finally {
            setLoading(false);
        }
    };

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
    const handleToggleActive = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.toggleProgramActive(id, token);

            if (response.success) {
                showToast(
                    `✅ Program ${response.program.isActive ? 'activated' : 'deactivated'}`,
                    'success'
                );
                setProgram(prev => ({ ...prev, isActive: response.program.isActive }));
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // TOGGLE FEATURED
    // ============================================
    const handleToggleFeatured = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.toggleProgramFeatured(id, token);

            if (response.success) {
                showToast(
                    `⭐ Program ${response.program.isFeatured ? 'featured' : 'unfeatured'}`,
                    'success'
                );
                setProgram(prev => ({ ...prev, isFeatured: response.program.isFeatured }));
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // DELETE
    // ============================================
    const handleDelete = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.deleteProgram(id, token);

            if (response.success) {
                showToast('✅ Program deleted successfully', 'success');
                setTimeout(() => navigate('/admin/programs'), 1500);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete', 'error');
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
            month: 'long',
            day: 'numeric'
        });
    };

    // ============================================
    // LOADING
    // ============================================
    if (loading) {
        return (
            <div className="program-detail-loading">
                <FaSpinner className="spinner" />
                <p>Loading program details...</p>
            </div>
        );
    }

    // ============================================
    // ERROR
    // ============================================
    if (error || !program) {
        return (
            <div className="program-detail-error">
                <FaExclamationTriangle />
                <h2>Error</h2>
                <p>{error || 'Program not found'}</p>
                <Link to="/admin/programs" className="btn-back">
                    <FaArrowLeft /> Back to Programs
                </Link>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="program-detail-page">
            {/* Toast */}
            {toast.show && (
                <div className={`app-toast ${toast.type}`}>
                    <div className="toast-body">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="detail-header">
                <Link to="/admin/programs" className="btn-back">
                    <FaArrowLeft /> Back
                </Link>

                <div className="header-actions">
                    <button 
                        className={`btn-status ${program.isFeatured ? 'featured' : 'unfeatured'}`}
                        onClick={handleToggleFeatured}
                        disabled={actionLoading}
                        title={program.isFeatured ? 'Unfeature' : 'Feature'}
                    >
                        {program.isFeatured ? <FaStar /> : <FaRegStar />}
                        {program.isFeatured ? 'Featured' : 'Feature'}
                    </button>
                    <button 
                        className={`btn-status ${program.isActive ? 'active' : 'inactive'}`}
                        onClick={handleToggleActive}
                        disabled={actionLoading}
                        title={program.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {program.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        {program.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <Link 
                        to={`/admin/programs/edit/${program._id}`}
                        className="btn-edit"
                    >
                        <FaEdit /> Edit
                    </Link>
                    <button 
                        className="btn-delete"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={actionLoading}
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="hero-banner-card">
                <div className="hero-banner-image">
                    {program.banner ? (
                        <img 
                            src={getFileUrl(program.banner)} 
                            alt={program.name}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.classList.add('no-image');
                            }}
                        />
                    ) : (
                        <div className="banner-placeholder">
                            <FaGraduationCap />
                        </div>
                    )}
                </div>

                <div className="hero-content">
                    <div className="hero-title-row">
                        <div>
                            <h1>{program.name}</h1>
                        </div>
                        <div className="hero-badges">
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

                    {/* University */}
                    {program.university && (
                        <div className="hero-university">
                            <FaUniversity />
                            <div>
                                <strong>{program.university.name}</strong>
                                {(program.university.city || program.university.state) && (
                                    <span>
                                        <FaMapMarkerAlt /> 
                                        {program.university.city}
                                        {program.university.state && `, ${program.university.state}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {program.description && (
                        <p className="hero-description">{program.description}</p>
                    )}
                </div>
            </div>

            {/* Additional Information */}
            <div className="info-card full-width">
                <div className="card-header">
                    <FaInfoCircle />
                    <h3>Additional Information</h3>
                </div>
                <div className="card-body">
                    <div className="meta-grid">
                        <div className="info-row">
                            <span className="label">Status</span>
                            <span className="value">
                                <span className={`badge ${program.isActive ? 'green' : 'red'}`}>
                                    {program.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Featured</span>
                            <span className="value">
                                {program.isFeatured ? (
                                    <span className="badge orange">⭐ Yes</span>
                                ) : (
                                    <span className="badge gray">No</span>
                                )}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Created</span>
                            <span className="value">{formatDate(program.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Last Updated</span>
                            <span className="value">{formatDate(program.updatedAt)}</span>
                        </div>
                        <div className="info-row full">
                            <span className="label">Program ID</span>
                            <span className="value mono">{program._id}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-icon">
                            <FaTrash />
                        </div>
                        <h2>Delete Program?</h2>
                        <p>
                            Are you sure you want to delete <strong>{program.name}</strong>?
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

export default ProgramDetail;