import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { getFileUrl } from '../../../../api/config';
import { 
    FaArrowLeft, FaEdit, FaTrash, FaUniversity,
    FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt,
    FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
    FaSpinner, FaToggleOn, FaToggleOff, FaExclamationTriangle,
    FaGraduationCap, FaInfoCircle, FaBuilding, FaIdCard,
    FaClock, FaCheck, FaTimes as FaX
} from 'react-icons/fa';
import './UniversityDetail.css';

const UniversityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ===== STATE =====
    const [university, setUniversity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ============================================
    // FETCH UNIVERSITY
    // ============================================
    useEffect(() => {
        fetchUniversity();
    }, [id]);

    const fetchUniversity = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/signin');
                return;
            }

            console.log('📥 Fetching university:', id);
            const response = await adminApi.getUniversityById(id, token);
            console.log('📥 Response:', response);

            if (response.success) {
                setUniversity(response.university);
            } else {
                setError('University not found');
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setError(error.response?.data?.message || 'Failed to load university');
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
            const response = await adminApi.toggleUniversityActive(id, token);

            if (response.success) {
                showToast(
                    `✅ University ${response.university.isActive ? 'activated' : 'deactivated'}`,
                    'success'
                );
                setUniversity(prev => ({
                    ...prev,
                    isActive: response.university.isActive
                }));
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // ============================================
    // TOGGLE VERIFIED
    // ============================================
    const handleToggleVerified = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.toggleUniversityVerified(id, token);

            if (response.success) {
                showToast(
                    `✅ University ${response.university.isVerified ? 'verified' : 'unverified'}`,
                    'success'
                );
                setUniversity(prev => ({
                    ...prev,
                    isVerified: response.university.isVerified
                }));
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
            const response = await adminApi.deleteUniversity(id, token);

            if (response.success) {
                showToast('✅ University deleted successfully', 'success');
                setTimeout(() => navigate('/admin/universities'), 1500);
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
            <div className="university-detail-loading">
                <FaSpinner className="spinner" />
                <p>Loading university details...</p>
            </div>
        );
    }

    // ============================================
    // ERROR
    // ============================================
    if (error || !university) {
        return (
            <div className="university-detail-error">
                <FaExclamationTriangle />
                <h2>Error</h2>
                <p>{error || 'University not found'}</p>
                <Link to="/admin/universities" className="btn-back">
                    <FaArrowLeft /> Back to Universities
                </Link>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="university-detail-page">
            {/* Toast */}
            {toast.show && (
                <div className={`app-toast ${toast.type}`}>
                    <div className="toast-body">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* ===== HEADER ===== */}
            <div className="detail-header">
                <Link to="/admin/universities" className="btn-back">
                    <FaArrowLeft /> Back
                </Link>

                <div className="header-actions">
                    <button 
                        className={`btn-status ${university.isActive ? 'active' : 'inactive'}`}
                        onClick={handleToggleActive}
                        disabled={actionLoading}
                        title={university.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {university.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        {university.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                        className={`btn-status ${university.isVerified ? 'verified' : 'unverified'}`}
                        onClick={handleToggleVerified}
                        disabled={actionLoading}
                        title={university.isVerified ? 'Unverify' : 'Verify'}
                    >
                        {university.isVerified ? <FaCheckCircle /> : <FaTimesCircle />}
                        {university.isVerified ? 'Verified' : 'Unverified'}
                    </button>
                    <Link 
                        to={`/admin/universities/edit/${university._id}`}
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

            {/* ===== HERO CARD ===== */}
            <div className="hero-card">
                <div className="hero-logo">
                    {university.logo ? (
                        <img 
                            src={getFileUrl(university.logo)} 
                            alt={university.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="logo-fallback"><svg>...</svg></div>';
                            }}
                        />
                    ) : (
                        <FaUniversity />
                    )}
                </div>
                <div className="hero-info">
                    <div className="hero-title-row">
                        <h1>{university.name}</h1>
                        <div className="status-badges">
                            <span className={`badge ${university.isActive ? 'green' : 'red'}`}>
                                {university.isActive ? '● Active' : '● Inactive'}
                            </span>
                            <span className={`badge ${university.isVerified ? 'blue' : 'gray'}`}>
                                {university.isVerified ? '✓ Verified' : '○ Unverified'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="hero-meta">
                        {university.shortName && (
                            <span className="badge blue">{university.shortName}</span>
                        )}
                        <span className="badge gray">Code: {university.code}</span>
                        {university.universityType && (
                            <span className="badge purple">{university.universityType}</span>
                        )}
                        {university.accreditation && (
                            <span className="badge green">{university.accreditation}</span>
                        )}
                        {university.establishedYear && (
                            <span className="badge orange">Est. {university.establishedYear}</span>
                        )}
                    </div>

                    {university.description && (
                        <p className="hero-description">{university.description}</p>
                    )}
                </div>
            </div>

            {/* ===== QUICK STATS ===== */}
            <div className="quick-stats">
                <div className="quick-stat">
                    <div className="quick-stat-icon blue">
                        <FaGraduationCap />
                    </div>
                    <div>
                        <span className="quick-stat-value">{university.courses?.length || 0}</span>
                        <span className="quick-stat-label">Courses</span>
                    </div>
                </div>
                <div className="quick-stat">
                    <div className="quick-stat-icon purple">
                        <FaUser />
                    </div>
                    <div>
                        <span className="quick-stat-value">
                            {university.ownerManager?.designation || 'N/A'}
                        </span>
                        <span className="quick-stat-label">Owner Type</span>
                    </div>
                </div>
                <div className="quick-stat">
                    <div className="quick-stat-icon green">
                        <FaMapMarkerAlt />
                    </div>
                    <div>
                        <span className="quick-stat-value">{university.city}</span>
                        <span className="quick-stat-label">City</span>
                    </div>
                </div>
                <div className="quick-stat">
                    <div className="quick-stat-icon orange">
                        <FaCalendarAlt />
                    </div>
                    <div>
                        <span className="quick-stat-value">
                            {formatDate(university.createdAt)}
                        </span>
                        <span className="quick-stat-label">Registered</span>
                    </div>
                </div>
            </div>

            {/* ===== INFO GRID ===== */}
            <div className="info-grid">
                {/* Contact Info */}
                <div className="info-card">
                    <div className="card-header">
                        <FaInfoCircle />
                        <h3>Contact Information</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label"><FaEnvelope /> Email</span>
                            <a href={`mailto:${university.email}`} className="value link">
                                {university.email}
                            </a>
                        </div>
                        <div className="info-row">
                            <span className="label"><FaPhone /> Phone</span>
                            <a href={`tel:${university.phone}`} className="value link">
                                {university.phone}
                            </a>
                        </div>
                        {university.alternatePhone && (
                            <div className="info-row">
                                <span className="label"><FaPhone /> Alternate</span>
                                <span className="value">{university.alternatePhone}</span>
                            </div>
                        )}
                        {university.website && (
                            <div className="info-row">
                                <span className="label"><FaGlobe /> Website</span>
                                <a 
                                    href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="value link"
                                >
                                    {university.website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Location */}
                <div className="info-card">
                    <div className="card-header">
                        <FaMapMarkerAlt />
                        <h3>Location</h3>
                    </div>
                    <div className="card-body">
                        <div className="info-row">
                            <span className="label">Address</span>
                            <span className="value">{university.address}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">City</span>
                            <span className="value">{university.city}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">State</span>
                            <span className="value">{university.state}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Country</span>
                            <span className="value">{university.country}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Pincode</span>
                            <span className="value">{university.pincode}</span>
                        </div>
                        {university.location && (
                            <div className="info-row">
                                <span className="label">Map</span>
                                <a 
                                    href={university.location}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="value link"
                                >
                                    View on Map →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== OWNER / MANAGER ===== */}
            {university.ownerManager?.name && (
                <div className="info-card full-width">
                    <div className="card-header">
                        <FaUser />
                        <h3>Owner / Manager Information</h3>
                    </div>
                    <div className="card-body">
                        <div className="owner-grid">
                            <div className="info-row">
                                <span className="label">Name</span>
                                <span className="value bold">{university.ownerManager.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Designation</span>
                                <span className="value">
                                    <span className="badge blue">{university.ownerManager.designation}</span>
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="label"><FaEnvelope /> Email</span>
                                <a href={`mailto:${university.ownerManager.email}`} className="value link">
                                    {university.ownerManager.email}
                                </a>
                            </div>
                            <div className="info-row">
                                <span className="label"><FaPhone /> Phone</span>
                                <a href={`tel:${university.ownerManager.phone}`} className="value link">
                                    {university.ownerManager.phone}
                                </a>
                            </div>
                            {university.ownerManager.alternatePhone && (
                                <div className="info-row">
                                    <span className="label">Alternate</span>
                                    <span className="value">{university.ownerManager.alternatePhone}</span>
                                </div>
                            )}
                            {university.ownerManager.address && (
                                <div className="info-row full">
                                    <span className="label">Address</span>
                                    <span className="value">
                                        {university.ownerManager.address}
                                        {university.ownerManager.city && `, ${university.ownerManager.city}`}
                                        {university.ownerManager.state && `, ${university.ownerManager.state}`}
                                        {university.ownerManager.pincode && ` - ${university.ownerManager.pincode}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== COURSES ===== */}
            {university.courses?.length > 0 && (
                <div className="info-card full-width">
                    <div className="card-header">
                        <FaGraduationCap />
                        <h3>Courses Offered ({university.courses.length})</h3>
                    </div>
                    <div className="card-body">
                        <div className="courses-list">
                            {university.courses.map((course, index) => (
                                <span key={index} className="course-tag">
                                    <FaGraduationCap /> {course}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ADDITIONAL INFO ===== */}
            <div className="info-card full-width">
                <div className="card-header">
                    <FaClock />
                    <h3>Additional Information</h3>
                </div>
                <div className="card-body">
                    <div className="additional-grid">
                        <div className="info-row">
                            <span className="label">Created On</span>
                            <span className="value">{formatDate(university.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Last Updated</span>
                            <span className="value">{formatDate(university.updatedAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">University ID</span>
                            <span className="value mono">{university._id}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== DELETE MODAL ===== */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-icon">
                            <FaTrash />
                        </div>
                        <h2>Delete University?</h2>
                        <p>
                            Are you sure you want to delete <strong>{university.name}</strong>?
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

export default UniversityDetail;