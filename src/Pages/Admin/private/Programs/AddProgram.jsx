import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { getFileUrl } from '../../../../api/config';
import { 
    FaGraduationCap, FaUpload, FaTimes, FaCheckCircle, 
    FaExclamationTriangle, FaArrowLeft, FaSave,
    FaUniversity, FaSpinner, FaEdit, FaInfoCircle
} from 'react-icons/fa';
import './AddProgram.css';

const AddProgram = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const isEditMode = !!id;

    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        university: ''
    });

    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [existingBanner, setExistingBanner] = useState('');
    
    const [universities, setUniversities] = useState([]);
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // ============================================
    // FETCH UNIVERSITIES + PROGRAM
    // ============================================
    useEffect(() => {
        fetchUniversities();
        if (isEditMode) {
            fetchProgram();
        } else {
            setPageLoading(false);
        }
    }, [id]);

    const fetchUniversities = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.getAllUniversities(token);
            if (response.success) {
                setUniversities(response.universities || []);
            }
        } catch (error) {
            console.error('❌ Fetch universities error:', error);
            showToast('Failed to load universities', 'error');
        }
    };

    const fetchProgram = async () => {
        try {
            setPageLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.getProgramById(id, token);

            if (response.success && response.program) {
                const p = response.program;

                setFormData({
                    name: p.name || '',
                    description: p.description || '',
                    university: p.university?._id || p.university || ''
                });

                if (p.banner) {
                    setExistingBanner(p.banner);
                    setBannerPreview(getFileUrl(p.banner));
                }
            }
        } catch (error) {
            console.error('❌ Fetch program error:', error);
            showToast('Failed to load program', 'error');
            setTimeout(() => navigate('/admin/programs'), 2000);
        } finally {
            setPageLoading(false);
        }
    };

    // ============================================
    // HANDLE CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // ============================================
    // HANDLE BANNER
    // ============================================
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showToast('Please upload JPG, PNG or WEBP', 'error');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                showToast('File size should be less than 10MB', 'error');
                return;
            }
            setBanner(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const removeBanner = () => {
        setBanner(null);
        setBannerPreview(null);
        setExistingBanner('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================
    // TOAST
    // ============================================
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 4000);
    };

    // ============================================
    // VALIDATE
    // ============================================
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Program name is required';
        if (!formData.university) newErrors.university = 'University is required';

        return newErrors;
    };

    // ============================================
    // HANDLE SUBMIT
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showToast('Please fill all required fields', 'error');
            const firstError = document.querySelector('.error-text');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('description', formData.description);
            formDataToSend.append('university', formData.university);

            if (banner) {
                formDataToSend.append('banner', banner);
            }

            const token = localStorage.getItem('adminToken');

            let response;
            if (isEditMode) {
                response = await adminApi.updateProgram(id, formDataToSend, token);
            } else {
                response = await adminApi.createProgram(formDataToSend, token);
            }

            if (response.success) {
                showToast(
                    isEditMode ? '✅ Program updated!' : '✅ Program created!',
                    'success'
                );
                setTimeout(() => navigate('/admin/programs'), 1500);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            showToast(error.response?.data?.message || 'Failed to save', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // LOADING
    // ============================================
    if (pageLoading) {
        return (
            <div className="add-program-page">
                <div className="page-loading">
                    <FaSpinner className="spin" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="add-program-page">
            {toast.show && (
                <div className={`app-toast ${toast.type}`}>
                    <div className="toast-body">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="page-header">
                <Link to="/admin/programs" className="btn-back">
                    <FaArrowLeft /> Back
                </Link>
                <div>
                    <h1>
                        {isEditMode ? <><FaEdit /> Edit Program</> : 'Add New Program'}
                    </h1>
                    <p>{isEditMode ? 'Update program information' : 'Create a new academic program'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="add-program-form">
                {/* ===== BASIC INFO ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaGraduationCap /> Program Information
                    </h2>

                    {/* ✅ Program Name + University in ONE ROW */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Program Name *</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g., Master of Business Administration"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Select University *</label>
                            <select
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                className={errors.university ? 'error' : ''}
                            >
                                <option value="">-- Select University --</option>
                                {universities.map(uni => (
                                    <option key={uni._id} value={uni._id}>
                                        {uni.name} ({uni.code})
                                    </option>
                                ))}
                            </select>
                            {errors.university && <span className="error-text">{errors.university}</span>}
                        </div>
                    </div>

                    {/* Banner Upload */}
                    <div className="form-group">
                        <label>Program Banner {isEditMode && '(leave empty to keep current)'}</label>
                        <div className="banner-upload-container">
                            {!bannerPreview ? (
                                <div className="banner-drop-zone">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleBannerChange}
                                        accept=".jpg,.jpeg,.png,.webp"
                                    />
                                    <FaUpload className="upload-icon" />
                                    <p>Click to upload banner</p>
                                    <small>JPG, PNG or WEBP (Max 10MB)</small>
                                </div>
                            ) : (
                                <div className="banner-preview">
                                    <img src={bannerPreview} alt="Banner" />
                                    <button
                                        type="button"
                                        className="remove-banner-btn"
                                        onClick={removeBanner}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Brief description about the program..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <Link to="/admin/programs" className="btn-cancel">
                        Cancel
                    </Link>
                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> 
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <FaSave /> 
                                {isEditMode ? 'Update Program' : 'Create Program'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProgram;