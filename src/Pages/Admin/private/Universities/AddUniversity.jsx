import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { getFileUrl } from '../../../../api/config';
import { 
    FaUniversity, FaUpload, FaTimes, FaCheckCircle, 
    FaExclamationTriangle, FaArrowLeft, FaSave,
    FaUser, FaMapMarkerAlt, FaInfoCircle, FaPlus,
    FaSpinner, FaEdit
} from 'react-icons/fa';
import './AddUniversity.css';

const AddUniversity = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // ✅ Get ID from URL
    const fileInputRef = useRef(null);

    // ✅ Check if Edit Mode
    const isEditMode = !!id;

    // ===== STATE =====
    const [formData, setFormData] = useState({
        // Basic
        name: '',
        shortName: '',
        code: '',
        establishedYear: '',
        universityType: 'Private',
        accreditation: '',
        description: '',
        
        // Contact
        email: '',
        phone: '',
        alternatePhone: '',
        website: '',
        
        // Location
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        location: '',
        
        // Owner/Manager
        ownerName: '',
        ownerDesignation: 'Owner',
        ownerEmail: '',
        ownerPhone: '',
        ownerAlternatePhone: '',
        ownerAddress: '',
        ownerCity: '',
        ownerState: '',
        ownerPincode: '',
        
        // Courses
        courses: []
    });

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [existingLogo, setExistingLogo] = useState('');  // ✅ For edit mode
    const [newCourse, setNewCourse] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEditMode); // ✅
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // ============================================
    // ✅ FETCH UNIVERSITY (EDIT MODE)
    // ============================================
    useEffect(() => {
        if (isEditMode) {
            fetchUniversity();
        }
    }, [id]);

    const fetchUniversity = async () => {
        try {
            setPageLoading(true);
            const token = localStorage.getItem('adminToken');
            
            console.log('📥 Fetching university for edit:', id);
            const response = await adminApi.getUniversityById(id, token);
            console.log('📥 Response:', response);

            if (response.success && response.university) {
                const uni = response.university;

                // ✅ Populate form with existing data
                setFormData({
                    name: uni.name || '',
                    shortName: uni.shortName || '',
                    code: uni.code || '',
                    establishedYear: uni.establishedYear || '',
                    universityType: uni.universityType || 'Private',
                    accreditation: uni.accreditation || '',
                    description: uni.description || '',
                    
                    email: uni.email || '',
                    phone: uni.phone || '',
                    alternatePhone: uni.alternatePhone || '',
                    website: uni.website || '',
                    
                    address: uni.address || '',
                    city: uni.city || '',
                    state: uni.state || '',
                    country: uni.country || 'India',
                    pincode: uni.pincode || '',
                    location: uni.location || '',
                    
                    ownerName: uni.ownerManager?.name || '',
                    ownerDesignation: uni.ownerManager?.designation || 'Owner',
                    ownerEmail: uni.ownerManager?.email || '',
                    ownerPhone: uni.ownerManager?.phone || '',
                    ownerAlternatePhone: uni.ownerManager?.alternatePhone || '',
                    ownerAddress: uni.ownerManager?.address || '',
                    ownerCity: uni.ownerManager?.city || '',
                    ownerState: uni.ownerManager?.state || '',
                    ownerPincode: uni.ownerManager?.pincode || '',
                    
                    courses: uni.courses || []
                });

                // ✅ Set existing logo
                if (uni.logo) {
                    setExistingLogo(uni.logo);
                    setLogoPreview(getFileUrl(uni.logo));
                }
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            showToast('Failed to load university', 'error');
            setTimeout(() => navigate('/admin/universities'), 2000);
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ============================================
    // HANDLE LOGO
    // ============================================
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showToast('Please upload JPG, PNG, SVG or WEBP file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size should be less than 5MB', 'error');
                return;
            }
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const removeLogo = () => {
        setLogo(null);
        setLogoPreview(null);
        setExistingLogo('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================
    // HANDLE COURSES
    // ============================================
    const addCourse = () => {
        if (newCourse.trim() && !formData.courses.includes(newCourse.trim())) {
            setFormData(prev => ({
                ...prev,
                courses: [...prev.courses, newCourse.trim()]
            }));
            setNewCourse('');
        }
    };

    const removeCourse = (course) => {
        setFormData(prev => ({
            ...prev,
            courses: prev.courses.filter(c => c !== course)
        }));
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

        if (!formData.name.trim()) newErrors.name = 'University name is required';
        if (!formData.code.trim()) newErrors.code = 'University code is required';
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner/Manager name is required';
        if (!formData.ownerEmail.trim()) {
            newErrors.ownerEmail = 'Owner email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
            newErrors.ownerEmail = 'Invalid email format';
        }
        if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Owner phone is required';

        return newErrors;
    };

    // ============================================
    // ✅ HANDLE SUBMIT (ADD + EDIT)
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
            
            // Basic
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('shortName', formData.shortName.trim());
            formDataToSend.append('code', formData.code.toUpperCase().trim());
            formDataToSend.append('establishedYear', formData.establishedYear);
            formDataToSend.append('universityType', formData.universityType);
            formDataToSend.append('accreditation', formData.accreditation);
            formDataToSend.append('description', formData.description);
            
            // Contact
            formDataToSend.append('email', formData.email.trim().toLowerCase());
            formDataToSend.append('phone', formData.phone.trim());
            formDataToSend.append('alternatePhone', formData.alternatePhone);
            formDataToSend.append('website', formData.website);
            
            // Location
            formDataToSend.append('address', formData.address.trim());
            formDataToSend.append('city', formData.city.trim());
            formDataToSend.append('state', formData.state.trim());
            formDataToSend.append('country', formData.country);
            formDataToSend.append('pincode', formData.pincode.trim());
            formDataToSend.append('location', formData.location);
            
            // Owner/Manager
            const ownerManager = {
                name: formData.ownerName.trim(),
                designation: formData.ownerDesignation,
                email: formData.ownerEmail.trim().toLowerCase(),
                phone: formData.ownerPhone.trim(),
                alternatePhone: formData.ownerAlternatePhone,
                address: formData.ownerAddress,
                city: formData.ownerCity,
                state: formData.ownerState,
                pincode: formData.ownerPincode
            };
            formDataToSend.append('ownerManager', JSON.stringify(ownerManager));
            
            // Courses
            formDataToSend.append('courses', JSON.stringify(formData.courses));
            
            // Logo (only if new logo selected)
            if (logo) {
                formDataToSend.append('logo', logo);
            }

            const token = localStorage.getItem('adminToken');
            
            // ✅ Create or Update based on mode
            let response;
            if (isEditMode) {
                console.log('📤 Updating university:', id);
                response = await adminApi.updateUniversity(id, formDataToSend, token);
            } else {
                console.log('📤 Creating university');
                response = await adminApi.createUniversity(formDataToSend, token);
            }

            if (response.success) {
                showToast(
                    isEditMode 
                        ? '✅ University updated successfully!' 
                        : '✅ University created successfully!', 
                    'success'
                );
                setTimeout(() => {
                    navigate('/admin/universities');
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            showToast(
                error.response?.data?.message || 
                (isEditMode ? 'Failed to update' : 'Failed to create'), 
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // LOADING (Edit Mode)
    // ============================================
    if (pageLoading) {
        return (
            <div className="add-university-page">
                <div className="page-loading">
                    <FaSpinner className="spin" />
                    <p>Loading university details...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="add-university-page">
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
            <div className="page-header">
                <Link to="/admin/universities" className="btn-back">
                    <FaArrowLeft /> Back
                </Link>
                <div>
                    <h1>
                        {isEditMode ? (
                            <><FaEdit /> Edit University</>
                        ) : (
                            'Add New University'
                        )}
                    </h1>
                    <p>
                        {isEditMode 
                            ? 'Update university information' 
                            : 'Fill in all the details to register a new university'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="add-university-form">
                {/* ===== BASIC INFORMATION ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaUniversity /> Basic Information
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>University Name *</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g., Delhi University"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label>Short Name</label>
                            <input
                                type="text"
                                name="shortName"
                                placeholder="e.g., DU"
                                value={formData.shortName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>University Code *</label>
                            <input
                                type="text"
                                name="code"
                                placeholder="e.g., DU-001"
                                value={formData.code}
                                onChange={handleChange}
                                className={errors.code ? 'error' : ''}
                                style={{textTransform: 'uppercase'}}
                                disabled={isEditMode}  // ✅ Code can't change
                            />
                            {errors.code && <span className="error-text">{errors.code}</span>}
                            {isEditMode && (
                                <small style={{color: '#718096', fontSize: '12px'}}>
                                    Code cannot be changed
                                </small>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Established Year</label>
                            <input
                                type="number"
                                name="establishedYear"
                                placeholder="e.g., 1922"
                                value={formData.establishedYear}
                                onChange={handleChange}
                                min="1800"
                                max={new Date().getFullYear()}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>University Type</label>
                            <select
                                name="universityType"
                                value={formData.universityType}
                                onChange={handleChange}
                            >
                                <option value="Private">Private</option>
                                <option value="Government">Government</option>
                                <option value="Deemed">Deemed</option>
                                <option value="Autonomous">Autonomous</option>
                                <option value="Central">Central</option>
                                <option value="State">State</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Accreditation</label>
                            <input
                                type="text"
                                name="accreditation"
                                placeholder="e.g., NAAC A+"
                                value={formData.accreditation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="form-group">
                        <label>
                            {isEditMode ? 'University Logo (leave empty to keep current)' : 'University Logo'}
                        </label>
                        <div className="logo-upload-container">
                            {!logoPreview ? (
                                <div className="logo-drop-zone">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleLogoChange}
                                        accept=".jpg,.jpeg,.png,.svg,.webp"
                                    />
                                    <FaUpload className="upload-icon" />
                                    <p>Click to upload logo</p>
                                    <small>JPG, PNG, SVG or WEBP (Max 5MB)</small>
                                </div>
                            ) : (
                                <div className="logo-preview">
                                    <img src={logoPreview} alt="Logo Preview" />
                                    <button
                                        type="button"
                                        className="remove-logo-btn"
                                        onClick={removeLogo}
                                        title="Remove logo"
                                    >
                                        <FaTimes />
                                    </button>
                                    {existingLogo && !logo && (
                                        <div className="logo-label">Current Logo</div>
                                    )}
                                    {logo && (
                                        <div className="logo-label new">New Logo</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {isEditMode && !logo && existingLogo && (
                            <small style={{color: '#718096', fontSize: '12px', marginTop: '8px', display: 'block'}}>
                                📌 Current logo will be kept if you don't upload a new one
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Brief description about the university..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                </div>

                {/* ===== CONTACT INFORMATION ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaInfoCircle /> Contact Information
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="university@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="+91 XXXXXXXXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Alternate Phone</label>
                            <input
                                type="text"
                                name="alternatePhone"
                                placeholder="+91 XXXXXXXXXX"
                                value={formData.alternatePhone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="url"
                                name="website"
                                placeholder="https://university.edu"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* ===== LOCATION ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaMapMarkerAlt /> Location
                    </h2>

                    <div className="form-group">
                        <label>Full Address *</label>
                        <textarea
                            name="address"
                            placeholder="Street, Building, Area..."
                            value={formData.address}
                            onChange={handleChange}
                            className={errors.address ? 'error' : ''}
                            rows="2"
                        />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                className={errors.city ? 'error' : ''}
                            />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>
                        <div className="form-group">
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleChange}
                                className={errors.state ? 'error' : ''}
                            />
                            {errors.state && <span className="error-text">{errors.state}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Pincode *</label>
                            <input
                                type="text"
                                name="pincode"
                                placeholder="e.g., 110001"
                                value={formData.pincode}
                                onChange={handleChange}
                                className={errors.pincode ? 'error' : ''}
                                maxLength="10"
                            />
                            {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Google Maps Location (Optional)</label>
                        <input
                            type="text"
                            name="location"
                            placeholder="https://maps.google.com/... or coordinates"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ===== OWNER/MANAGER ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaUser /> Owner / Manager Information
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="ownerName"
                                placeholder="Owner/Manager name"
                                value={formData.ownerName}
                                onChange={handleChange}
                                className={errors.ownerName ? 'error' : ''}
                            />
                            {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Designation *</label>
                            <select
                                name="ownerDesignation"
                                value={formData.ownerDesignation}
                                onChange={handleChange}
                            >
                                <option value="Owner">Owner</option>
                                <option value="Manager">Manager</option>
                                <option value="Director">Director</option>
                                <option value="Principal">Principal</option>
                                <option value="Dean">Dean</option>
                                <option value="Registrar">Registrar</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="ownerEmail"
                                placeholder="owner@example.com"
                                value={formData.ownerEmail}
                                onChange={handleChange}
                                className={errors.ownerEmail ? 'error' : ''}
                            />
                            {errors.ownerEmail && <span className="error-text">{errors.ownerEmail}</span>}
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="text"
                                name="ownerPhone"
                                placeholder="+91 XXXXXXXXXX"
                                value={formData.ownerPhone}
                                onChange={handleChange}
                                className={errors.ownerPhone ? 'error' : ''}
                            />
                            {errors.ownerPhone && <span className="error-text">{errors.ownerPhone}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Alternate Phone</label>
                            <input
                                type="text"
                                name="ownerAlternatePhone"
                                placeholder="+91 XXXXXXXXXX"
                                value={formData.ownerAlternatePhone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Owner Address</label>
                        <input
                            type="text"
                            name="ownerAddress"
                            placeholder="Residential address"
                            value={formData.ownerAddress}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="ownerCity"
                                placeholder="City"
                                value={formData.ownerCity}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="ownerState"
                                placeholder="State"
                                value={formData.ownerState}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="ownerPincode"
                                placeholder="Pincode"
                                value={formData.ownerPincode}
                                onChange={handleChange}
                                maxLength="10"
                            />
                        </div>
                    </div>
                </div>

                {/* ===== COURSES ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaPlus /> Courses Offered
                    </h2>

                    <div className="form-group">
                        <label>Add Courses</label>
                        <div className="tag-input-container">
                            <div className="tag-input">
                                <input
                                    type="text"
                                    placeholder="e.g., B.Tech, MBA, BBA"
                                    value={newCourse}
                                    onChange={(e) => setNewCourse(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCourse())}
                                />
                                <button type="button" onClick={addCourse} className="add-tag-btn">
                                    Add
                                </button>
                            </div>
                            <div className="tags-container">
                                {formData.courses.map(course => (
                                    <span key={course} className="tag">
                                        {course}
                                        <button type="button" onClick={() => removeCourse(course)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SUBMIT ===== */}
                <div className="form-actions">
                    <Link to="/admin/universities" className="btn-cancel">
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
                                {isEditMode ? 'Update University' : 'Create University'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUniversity;