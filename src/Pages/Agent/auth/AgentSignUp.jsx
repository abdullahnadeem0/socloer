import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentSignUp.css';
import agentApi from '../../../api/agentApi';
import { 
    FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
    FaBuilding, FaArrowRight, FaExclamationTriangle,
    FaClock, FaEnvelopeOpen, FaCheckCircle, FaIdCard,
    FaCalendarAlt, FaBriefcase, FaMapMarkerAlt,
    FaGraduationCap, FaPhone, FaUpload, FaTrash, FaFileAlt,
    FaTimes
} from 'react-icons/fa';

const AgentSignUp = () => {
    const navigate = useNavigate();
    const otpInputs = useRef([]);
    const fileInputRef = useRef(null);
    
    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        idType: 'aadhar',
        idNumber: '',
        idFile: null,
        idFilePreview: null,
        jobTitle: '',
        company: '',
        experience: '',
        education: '',
        specialization: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        bio: '',
        languages: [],
        skills: [],
        agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // ===== OTP STATE =====
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(120);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    // ===== LANGUAGE & SKILLS STATE =====
    const [newLanguage, setNewLanguage] = useState('');
    const [newSkill, setNewSkill] = useState('');

    // ===== TOAST STATE =====
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'error',
        visible: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Options
    const educationOptions = [
        'High School', 'Diploma', "Bachelor's Degree",
        "Master's Degree", 'PhD', 'Professional Certification'
    ];

    const experienceOptions = [
        'Fresher', '1-2 Years', '3-5 Years', '5-10 Years', '10+ Years'
    ];

    const idTypeOptions = [
        { value: 'aadhar', label: 'Aadhar Card' },
        { value: 'pan', label: 'PAN Card' },
        { value: 'driving_license', label: 'Driving License' },
        { value: 'passport', label: 'Passport' }
    ];

    const genderOptions = ['Male', 'Female', 'Other'];

    // ============================================
    // TOAST FUNCTIONS
    // ============================================
    const showToast = (message, type = 'error') => {
        setToast({
            show: true,
            message: message,
            type: type,
            visible: true
        });
        setTimeout(() => {
            setToast({ ...toast, visible: false, show: false });
        }, 5000);
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false, show: false });
    };

    // ============================================
    // TIMER EFFECT
    // ============================================
    useEffect(() => {
        if (showOTP && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
        if (timer === 0) {
            setResendDisabled(false);
        }
    }, [showOTP, timer]);

    // ============================================
    // AUTO-FOCUS FIRST OTP INPUT
    // ============================================
    useEffect(() => {
        if (showOTP && otpInputs.current[0]) {
            otpInputs.current[0].focus();
        }
    }, [showOTP]);

    // ============================================
    // HANDLE CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setServerError('');
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    // ============================================
    // HANDLE FILE UPLOAD
    // ============================================
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                showToast('Please upload JPG, PNG or PDF file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size should be less than 5MB', 'error');
                return;
            }
            setFormData(prev => ({
                ...prev,
                idFile: file,
                idFilePreview: URL.createObjectURL(file)
            }));
            showToast('File uploaded successfully!', 'success');
        }
    };

    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            idFile: null,
            idFilePreview: null
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ============================================
    // HANDLE LANGUAGE & SKILLS
    // ============================================
    const addLanguage = () => {
        if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
            setFormData(prev => ({
                ...prev,
                languages: [...prev.languages, newLanguage.trim()]
            }));
            setNewLanguage('');
        }
    };

    const removeLanguage = (lang) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.filter(l => l !== lang)
        }));
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    // ============================================
    // HANDLE OTP CHANGE
    // ============================================
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setOtpError('');
        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
        const allFilled = newOtp.every(digit => digit !== '');
        if (allFilled && index === 5) {
            setTimeout(() => {
                const otpValue = newOtp.join('');
                if (otpValue.length === 6) {
                    handleVerifyOTP(otpValue);
                }
            }, 300);
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        if (pastedData.length === 6) {
            setTimeout(() => {
                handleVerifyOTP(pastedData);
            }, 300);
        }
    };

    // ============================================
    // VALIDATE FORM
    // ============================================
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        if (!formData.idType) {
            newErrors.idType = 'ID type is required';
        }

        if (!formData.idNumber.trim()) {
            newErrors.idNumber = 'ID number is required';
        }

        if (!formData.idFile) {
            newErrors.idFile = 'Please upload your ID document';
        }

        if (!formData.jobTitle) {
            newErrors.jobTitle = 'Job title is required';
        }

        if (!formData.experience) {
            newErrors.experience = 'Experience is required';
        }

        if (!formData.education) {
            newErrors.education = 'Education is required';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Please enter a valid 6-digit pincode';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the terms and conditions';
        }

        // Show first error as toast
        const firstErrorKey = Object.keys(newErrors)[0];
        if (firstErrorKey) {
            showToast(newErrors[firstErrorKey], 'error');
        }

        return newErrors;
    };

    // ============================================
    // ✅ HANDLE SUBMIT - FIXED
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting || loading) {
            showToast('Please wait, submission in progress...', 'warning');
            return;
        }
        
        const newErrors = validateForm();
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            const firstError = document.querySelector('.error-text');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);
        setLoading(true);
        setServerError('');
        showToast('Creating account... Please wait!', 'info');

        try {
            const formDataToSend = new FormData();
            
            // ✅ SEND ALL FIELDS ONE BY ONE
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('email', formData.email.trim());
            formDataToSend.append('phone', formData.phone.trim());
            formDataToSend.append('password', formData.password);
            formDataToSend.append('confirmPassword', formData.confirmPassword);
            formDataToSend.append('dateOfBirth', formData.dateOfBirth);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('nationality', formData.nationality || '');
            formDataToSend.append('idType', formData.idType);
            formDataToSend.append('idNumber', formData.idNumber.trim());
            formDataToSend.append('jobTitle', formData.jobTitle.trim());
            formDataToSend.append('company', formData.company || '');
            formDataToSend.append('experience', formData.experience);
            formDataToSend.append('education', formData.education);
            formDataToSend.append('specialization', formData.specialization || '');
            formDataToSend.append('address', formData.address.trim());
            formDataToSend.append('city', formData.city.trim());
            formDataToSend.append('state', formData.state.trim());
            formDataToSend.append('pincode', formData.pincode.trim());
            formDataToSend.append('country', formData.country || 'India');
            formDataToSend.append('bio', formData.bio || '');
            
            // ✅ Languages & Skills as JSON strings
            formDataToSend.append('languages', JSON.stringify(formData.languages));
            formDataToSend.append('skills', JSON.stringify(formData.skills));
            
            // ✅ File
            if (formData.idFile) {
                formDataToSend.append('idFile', formData.idFile);
            } else {
                showToast('Please upload your ID document', 'error');
                setIsSubmitting(false);
                setLoading(false);
                return;
            }

            // ✅ DEBUG: Log all fields
            console.log('=========================================');
            console.log('📤 SENDING FORM DATA:');
            console.log('=========================================');
            for (let [key, value] of formDataToSend.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: FILE - ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            console.log('=========================================');

            const response = await agentApi.signup(formDataToSend);
            console.log('📥 Signup response:', response);
            
            if (response.success) {
                showToast('✅ Verification code sent to your email!', 'success');
                setUserEmail(formData.email);
                setShowOTP(true);
                setTimer(120);
                setResendDisabled(true);
                setSuccessMessage('Verification code sent to your email!');
                setOtp(['', '', '', '', '', '']);
                setOtpError('');
            } else {
                showToast(response.message || 'Registration failed', 'error');
                setServerError(response.message);
            }
            
            setIsSubmitting(false);
            setLoading(false);
            
        } catch (error) {
            console.error('❌ Signup error:', error);
            console.error('❌ Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Registration failed. Please try again.';
            
            setServerError(errorMessage);
            showToast(errorMessage, 'error');
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    // ============================================
    // HANDLE VERIFY OTP
    // ============================================
    const handleVerifyOTP = async (otpValue) => {
        if (otpLoading) {
            showToast('Please wait, verification in progress...', 'warning');
            return;
        }

        if (!otpValue) {
            otpValue = otp.join('');
        }
        
        if (otpValue.length !== 6) {
            setOtpError('Please enter all 6 digits');
            showToast('Please enter all 6 digits', 'error');
            return;
        }

        setOtpLoading(true);
        setOtpError('');
        showToast('Verifying OTP...', 'info');

        try {
            const requestData = {
                email: userEmail,
                otp: otpValue.toString().trim()
            };
            
            const response = await agentApi.verifyOTP(requestData);
            console.log('📥 Verify response:', response);

            if (response.success) {
                showToast('✅ Registration successful! Redirecting to login...', 'success');
                setSuccessMessage('✅ Registration successful! Redirecting to login...');
                
                if (response.token) {
                    localStorage.setItem('agentToken', response.token);
                    localStorage.setItem('agentData', JSON.stringify(response.agent));
                }
                
                setTimeout(() => {
                    navigate('/agent/login');
                }, 1500);
                setOtpLoading(false);
            }
        } catch (error) {
            console.error('❌ OTP verification error:', error);
            const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
            setOtpError(errorMessage);
            showToast(errorMessage, 'error');
            setOtpLoading(false);
        }
    };

    // ============================================
    // HANDLE RESEND OTP
    // ============================================
    const handleResendOTP = async () => {
        if (otpLoading) {
            showToast('Please wait, resending OTP...', 'warning');
            return;
        }

        setOtpLoading(true);
        setOtpError('');
        showToast('Resending verification code...', 'info');

        try {
            const response = await agentApi.resendOTP({ email: userEmail });
            if (response.success) {
                setTimer(120);
                setResendDisabled(true);
                setOtp(['', '', '', '', '', '']);
                setSuccessMessage('New verification code sent!');
                showToast('✅ New verification code sent!', 'success');
                setOtpLoading(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
            setOtpError(errorMessage);
            showToast(errorMessage, 'error');
            setOtpLoading(false);
        }
    };

    // ============================================
    // BACK TO FORM
    // ============================================
    const handleBackToForm = () => {
        setShowOTP(false);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setSuccessMessage('');
        setTimer(120);
        setOtpLoading(false);
        setIsSubmitting(false);
        setLoading(false);
        hideToast();
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="agent-signup-container">
            {/* ===== TOAST NOTIFICATION ===== */}
            {toast.show && toast.visible && (
                <div className={`toast-notification ${toast.type}`}>
                    <div className="toast-content">
                        <span className="toast-icon">
                            {toast.type === 'success' && '✅'}
                            {toast.type === 'error' && '❌'}
                            {toast.type === 'warning' && '⚠️'}
                            {toast.type === 'info' && 'ℹ️'}
                        </span>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={hideToast}>
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            <div className="agent-signup-card">
                {/* ===== HEADER ===== */}
                <div className="signup-header">
                    <div className="header-icon">
                        <FaBuilding size={32} color="#ffffff" />
                    </div>
                    <h1>Agent Registration</h1>
                    <p>Join our network of trusted agents</p>
                </div>

                {successMessage && (
                    <div className="success-message">
                        <FaCheckCircle className="success-icon" />
                        {successMessage}
                    </div>
                )}

                {!showOTP ? (
                    <>
                        {serverError && (
                            <div className="error-message server-error">
                                <FaExclamationTriangle className="error-icon" />
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="agent-form">
                            {/* ===== PERSONAL INFORMATION ===== */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FaUser className="section-icon" />
                                    Personal Information
                                </h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.name && errors.name ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.name && errors.name && (
                                            <span className="error-text">{errors.name}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.email && errors.email ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.email && errors.email && (
                                            <span className="error-text">{errors.email}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number *</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="Enter 10-digit phone number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.phone && errors.phone ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.phone && errors.phone && (
                                            <span className="error-text">{errors.phone}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="password">Password *</label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                placeholder="Create a password (min 6 characters)"
                                                value={formData.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={touched.password && errors.password ? 'error' : ''}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={loading}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {touched.password && errors.password && (
                                            <span className="error-text">{errors.password}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirm Password *</label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder="Confirm your password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={loading}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {touched.confirmPassword && errors.confirmPassword && (
                                            <span className="error-text">{errors.confirmPassword}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ===== PERSONAL DETAILS ===== */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FaCalendarAlt className="section-icon" />
                                    Personal Details
                                </h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="dateOfBirth">Date of Birth *</label>
                                        <input
                                            type="date"
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.dateOfBirth && errors.dateOfBirth ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.dateOfBirth && errors.dateOfBirth && (
                                            <span className="error-text">{errors.dateOfBirth}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="gender">Gender *</label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.gender && errors.gender ? 'error' : ''}
                                            disabled={loading}
                                        >
                                            <option value="">Select Gender</option>
                                            {genderOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {touched.gender && errors.gender && (
                                            <span className="error-text">{errors.gender}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="nationality">Nationality</label>
                                    <input
                                        type="text"
                                        id="nationality"
                                        name="nationality"
                                        placeholder="Your nationality"
                                        value={formData.nationality}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* ===== IDENTIFICATION ===== */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FaIdCard className="section-icon" />
                                    Identification
                                </h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="idType">ID Type *</label>
                                        <select
                                            id="idType"
                                            name="idType"
                                            value={formData.idType}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.idType && errors.idType ? 'error' : ''}
                                            disabled={loading}
                                        >
                                            <option value="">Select ID Type</option>
                                            {idTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {touched.idType && errors.idType && (
                                            <span className="error-text">{errors.idType}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="idNumber">ID Number *</label>
                                        <input
                                            type="text"
                                            id="idNumber"
                                            name="idNumber"
                                            placeholder="Enter your ID number"
                                            value={formData.idNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.idNumber && errors.idNumber ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.idNumber && errors.idNumber && (
                                            <span className="error-text">{errors.idNumber}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="idFile">Upload ID Document *</label>
                                    <div className="file-upload-container">
                                        {!formData.idFilePreview ? (
                                            <div className="file-drop-zone">
                                                <input
                                                    type="file"
                                                    id="idFile"
                                                    name="idFile"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    className={errors.idFile ? 'error' : ''}
                                                    disabled={loading}
                                                />
                                                <FaUpload className="upload-icon" />
                                                <p>Click to upload or drag and drop</p>
                                                <small>JPG, PNG or PDF (Max 5MB)</small>
                                            </div>
                                        ) : (
                                            <div className="file-preview">
                                                {formData.idFilePreview.match(/\.(jpeg|jpg|png|gif)$/) ? (
                                                    <img 
                                                        src={formData.idFilePreview} 
                                                        alt="ID Document Preview" 
                                                        className="preview-image"
                                                    />
                                                ) : (
                                                    <div className="file-icon-preview">
                                                        <FaFileAlt size={40} />
                                                        <p>{formData.idFile?.name}</p>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="remove-file-btn"
                                                    onClick={removeFile}
                                                    disabled={loading}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {errors.idFile && (
                                        <span className="error-text">{errors.idFile}</span>
                                    )}
                                </div>
                            </div>

                            {/* ===== PROFESSIONAL ===== */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FaBriefcase className="section-icon" />
                                    Professional Information
                                </h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="jobTitle">Job Title *</label>
                                        <input
                                            type="text"
                                            id="jobTitle"
                                            name="jobTitle"
                                            placeholder="Your job title"
                                            value={formData.jobTitle}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.jobTitle && errors.jobTitle ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.jobTitle && errors.jobTitle && (
                                            <span className="error-text">{errors.jobTitle}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="company">Company/Organization</label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            placeholder="Company name"
                                            value={formData.company}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="experience">Experience *</label>
                                        <select
                                            id="experience"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.experience && errors.experience ? 'error' : ''}
                                            disabled={loading}
                                        >
                                            <option value="">Select Experience</option>
                                            {experienceOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {touched.experience && errors.experience && (
                                            <span className="error-text">{errors.experience}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="education">Education *</label>
                                        <select
                                            id="education"
                                            name="education"
                                            value={formData.education}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.education && errors.education ? 'error' : ''}
                                            disabled={loading}
                                        >
                                            <option value="">Select Education</option>
                                            {educationOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {touched.education && errors.education && (
                                            <span className="error-text">{errors.education}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="specialization">Specialization</label>
                                    <input
                                        type="text"
                                        id="specialization"
                                        name="specialization"
                                        placeholder="Your area of expertise"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* ===== LOCATION ===== */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FaMapMarkerAlt className="section-icon" />
                                    Location
                                </h3>
                                <div className="form-group">
                                    <label htmlFor="address">Address *</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        placeholder="Enter your full address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={touched.address && errors.address ? 'error' : ''}
                                        rows="2"
                                        disabled={loading}
                                    />
                                    {touched.address && errors.address && (
                                        <span className="error-text">{errors.address}</span>
                                    )}
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.city && errors.city ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.city && errors.city && (
                                            <span className="error-text">{errors.city}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="state">State *</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.state && errors.state ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {touched.state && errors.state && (
                                            <span className="error-text">{errors.state}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="pincode">Pincode *</label>
                                        <input
                                            type="text"
                                            id="pincode"
                                            name="pincode"
                                            placeholder="6-digit pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={touched.pincode && errors.pincode ? 'error' : ''}
                                            maxLength="6"
                                            disabled={loading}
                                        />
                                        {touched.pincode && errors.pincode && (
                                            <span className="error-text">{errors.pincode}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="country">Country</label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ===== LANGUAGES & SKILLS ===== */}
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FaGraduationCap className="section-icon" />
                                    Languages & Skills
                                </h3>
                                <div className="form-group">
                                    <label>Languages</label>
                                    <div className="tag-input-container">
                                        <div className="tag-input">
                                            <input
                                                type="text"
                                                placeholder="Add a language"
                                                value={newLanguage}
                                                onChange={(e) => setNewLanguage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                                disabled={loading}
                                            />
                                            <button type="button" onClick={addLanguage} className="add-tag-btn" disabled={loading}>
                                                Add
                                            </button>
                                        </div>
                                        <div className="tags-container">
                                            {formData.languages.map(lang => (
                                                <span key={lang} className="tag">
                                                    {lang}
                                                    <button type="button" onClick={() => removeLanguage(lang)} disabled={loading}>
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Skills</label>
                                    <div className="tag-input-container">
                                        <div className="tag-input">
                                            <input
                                                type="text"
                                                placeholder="Add a skill"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                                disabled={loading}
                                            />
                                            <button type="button" onClick={addSkill} className="add-tag-btn" disabled={loading}>
                                                Add
                                            </button>
                                        </div>
                                        <div className="tags-container">
                                            {formData.skills.map(skill => (
                                                <span key={skill} className="tag">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(skill)} disabled={loading}>
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="bio">Bio / About</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        placeholder="Tell us about yourself"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* ===== TERMS ===== */}
                            <div className="form-group terms-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        className={errors.agreeTerms ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <span>
                                        I agree to the <a href="/terms">Terms and Conditions</a> and 
                                        <a href="/privacy"> Privacy Policy</a> *
                                    </span>
                                </label>
                                {errors.agreeTerms && (
                                    <span className="error-text">{errors.agreeTerms}</span>
                                )}
                            </div>

                            {/* ===== SUBMIT BUTTON ===== */}
                            <button 
                                type="submit" 
                                className={`signup-button ${loading ? 'loading' : ''}`}
                                disabled={loading || isSubmitting}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>

                            <p className="login-link">
                                Already have an account? <a href="/agent/login">Login</a>
                            </p>
                        </form>
                    </>
                ) : (
                    /* ===== OTP VERIFICATION ===== */
                    <div className="otp-section">
                        <div className="otp-header">
                            <FaEnvelopeOpen className="otp-icon" />
                            <p className="otp-message">
                                We sent a verification code to <strong>{userEmail}</strong>
                            </p>
                            <p className="otp-sub-message">
                                Please check your email for the 6-digit code
                            </p>
                        </div>

                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(ref) => (otpInputs.current[index] = ref)}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={handleOtpPaste}
                                    className={`otp-digit ${otpError ? 'error' : ''}`}
                                    disabled={otpLoading}
                                />
                            ))}
                        </div>

                        {otpError && (
                            <span className="error-text otp-error">{otpError}</span>
                        )}

                        <div className="otp-timer">
                            <FaClock className="timer-icon" />
                            <span>
                                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                            </span>
                            <span className="timer-label">remaining</span>
                        </div>

                        <button
                            className={`resend-btn ${(resendDisabled || otpLoading) ? 'disabled' : ''}`}
                            onClick={handleResendOTP}
                            disabled={resendDisabled || otpLoading}
                        >
                            {otpLoading ? 'Sending...' : 'Resend Code'}
                        </button>

                        <div className="otp-actions">
                            <button
                                type="button"
                                className="back-btn"
                                onClick={handleBackToForm}
                                disabled={otpLoading}
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                className={`verify-btn ${otpLoading ? 'loading' : ''}`}
                                onClick={() => handleVerifyOTP(otp.join(''))}
                                disabled={otpLoading}
                            >
                                {otpLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Complete'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentSignUp;