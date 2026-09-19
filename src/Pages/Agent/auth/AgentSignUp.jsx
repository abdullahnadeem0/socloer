// src/Pages/Agent/private/AgentSignUp.jsx
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
    FaTimes, FaUserTie
} from 'react-icons/fa';

// ============================================
// FLOATING CIRCLES BACKGROUND - WHITE THEME
// ============================================
const FloatingCircles = () => {
    // Soft pastel circles for white theme
    const circles = [
        { size: 340, top: '3%',  left: '5%',   duration: 22, delay: 0,   color: 'rgba(96, 165, 250, 0.30)' }, // soft blue
        { size: 240, top: '58%', left: '72%',  duration: 28, delay: 2,   color: 'rgba(167, 139, 250, 0.28)' }, // soft purple
        { size: 200, top: '72%', left: '12%',  duration: 24, delay: 4,   color: 'rgba(147, 197, 253, 0.26)' }, // light blue
        { size: 280, top: '18%', left: '68%',  duration: 30, delay: 1,   color: 'rgba(196, 181, 253, 0.26)' }, // light lavender
        { size: 160, top: '42%', left: '38%',  duration: 20, delay: 3,   color: 'rgba(110, 231, 183, 0.25)' }, // soft mint
        { size: 220, top: '82%', left: '52%',  duration: 26, delay: 5,   color: 'rgba(251, 207, 232, 0.28)' }, // soft pink
        { size: 180, top: '8%',  left: '42%',  duration: 32, delay: 2.5, color: 'rgba(253, 224, 71, 0.22)'  }, // soft yellow
        { size: 260, top: '32%', left: '88%',  duration: 27, delay: 1.5, color: 'rgba(125, 211, 252, 0.26)' }, // sky blue
    ];

    return (
        <div className="agent-signup-bg-circles" aria-hidden="true">
            {circles.map((c, i) => (
                <span
                    key={i}
                    className="agent-signup-bg-circle"
                    style={{
                        width: c.size,
                        height: c.size,
                        top: c.top,
                        left: c.left,
                        background: `radial-gradient(circle at 30% 30%, ${c.color}, transparent 70%)`,
                        animationDuration: `${c.duration}s`,
                        animationDelay: `-${c.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

// ============================================
// MAIN COMPONENT (same as before — sirf upar wala change hai)
// ============================================
const AgentSignUp = () => {
    const navigate = useNavigate();
    const otpInputs = useRef([]);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        dateOfBirth: '', gender: '', nationality: '',
        idType: 'aadhar', idNumber: '', idFile: null, idFilePreview: null,
        jobTitle: '', company: '', experience: '', education: '', specialization: '',
        address: '', city: '', state: '', pincode: '', country: 'India', bio: '',
        languages: [], skills: [], agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(120);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    const [newLanguage, setNewLanguage] = useState('');
    const [newSkill, setNewSkill] = useState('');

    const [toast, setToast] = useState({ show: false, message: '', type: 'error', visible: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const educationOptions = ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Professional Certification'];
    const experienceOptions = ['Fresher', '1-2 Years', '3-5 Years', '5-10 Years', '10+ Years'];
    const idTypeOptions = [
        { value: 'aadhar', label: 'Aadhar Card' },
        { value: 'pan', label: 'PAN Card' },
        { value: 'driving_license', label: 'Driving License' },
        { value: 'passport', label: 'Passport' }
    ];
    const genderOptions = ['Male', 'Female', 'Other'];

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type, visible: true });
        setTimeout(() => setToast({ show: false, message: '', type: 'error', visible: false }), 5000);
    };
    const hideToast = () => setToast({ show: false, message: '', type: 'error', visible: false });

    useEffect(() => {
        if (showOTP && timer > 0) {
            const interval = setInterval(() => setTimer(p => p - 1), 1000);
            return () => clearInterval(interval);
        }
        if (timer === 0) setResendDisabled(false);
    }, [showOTP, timer]);

    useEffect(() => {
        if (showOTP && otpInputs.current[0]) otpInputs.current[0].focus();
    }, [showOTP]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        setServerError('');
    };

    const handleBlur = (e) => setTouched(prev => ({ ...prev, [e.target.name]: true }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) return showToast('Please upload JPG, PNG or PDF file', 'error');
        if (file.size > 5 * 1024 * 1024) return showToast('File size should be less than 5MB', 'error');
        setFormData(prev => ({ ...prev, idFile: file, idFilePreview: URL.createObjectURL(file) }));
        showToast('File uploaded successfully!', 'success');
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, idFile: null, idFilePreview: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addLanguage = () => {
        if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
            setFormData(prev => ({ ...prev, languages: [...prev.languages, newLanguage.trim()] }));
            setNewLanguage('');
        }
    };
    const removeLanguage = (lang) => setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            setNewSkill('');
        }
    };
    const removeSkill = (skill) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setOtpError('');
        if (value && index < 5) otpInputs.current[index + 1]?.focus();
        if (newOtp.every(d => d !== '') && index === 5) {
            setTimeout(() => {
                const v = newOtp.join('');
                if (v.length === 6) handleVerifyOTP(v);
            }, 300);
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputs.current[index - 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text/plain').slice(0, 6);
        if (!/^\d+$/.test(pasted)) return;
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
        setOtp(newOtp);
        if (pasted.length === 6) setTimeout(() => handleVerifyOTP(pasted), 300);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        else if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit phone number';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.idType) newErrors.idType = 'ID type is required';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
        if (!formData.idFile) newErrors.idFile = 'Please upload your ID document';
        if (!formData.jobTitle) newErrors.jobTitle = 'Job title is required';
        if (!formData.experience) newErrors.experience = 'Experience is required';
        if (!formData.education) newErrors.education = 'Education is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = 'Please enter a valid 6-digit pincode';
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
        const firstKey = Object.keys(newErrors)[0];
        if (firstKey) showToast(newErrors[firstKey], 'error');
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting || loading) return showToast('Please wait, submission in progress...', 'warning');
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            const firstError = document.querySelector('.agent-signup-error-text');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setIsSubmitting(true);
        setLoading(true);
        setServerError('');
        showToast('Creating account... Please wait!', 'info');
        try {
            const fd = new FormData();
            Object.entries({
                name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim(),
                password: formData.password, confirmPassword: formData.confirmPassword,
                dateOfBirth: formData.dateOfBirth, gender: formData.gender, nationality: formData.nationality || '',
                idType: formData.idType, idNumber: formData.idNumber.trim(),
                jobTitle: formData.jobTitle.trim(), company: formData.company || '',
                experience: formData.experience, education: formData.education,
                specialization: formData.specialization || '',
                address: formData.address.trim(), city: formData.city.trim(),
                state: formData.state.trim(), pincode: formData.pincode.trim(),
                country: formData.country || 'India', bio: formData.bio || '',
                languages: JSON.stringify(formData.languages),
                skills: JSON.stringify(formData.skills),
            }).forEach(([k, v]) => fd.append(k, v));
            if (formData.idFile) fd.append('idFile', formData.idFile);
            const response = await agentApi.signup(fd);
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
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
            setServerError(msg);
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otpValue) => {
        if (otpLoading) return showToast('Please wait, verification in progress...', 'warning');
        if (!otpValue) otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setOtpError('Please enter all 6 digits');
            return showToast('Please enter all 6 digits', 'error');
        }
        setOtpLoading(true);
        setOtpError('');
        showToast('Verifying OTP...', 'info');
        try {
            const response = await agentApi.verifyOTP({ email: userEmail, otp: otpValue.toString().trim() });
            if (response.success) {
                showToast('✅ Registration successful! Redirecting to login...', 'success');
                setSuccessMessage('✅ Registration successful! Redirecting to login...');
                if (response.token) {
                    localStorage.setItem('agentToken', response.token);
                    localStorage.setItem('agentData', JSON.stringify(response.agent));
                }
                setTimeout(() => navigate('/agent/login'), 1500);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
            setOtpError(msg);
            showToast(msg, 'error');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (otpLoading) return;
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
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to resend OTP';
            setOtpError(msg);
            showToast(msg, 'error');
        } finally {
            setOtpLoading(false);
        }
    };

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

    return (
        <div className="agent-signup-page">
            <FloatingCircles />
            <div className="agent-signup-bg-gradient" aria-hidden="true" />

            {toast.show && toast.visible && (
                <div className={`agent-signup-toast agent-signup-toast-${toast.type}`}>
                    <div className="agent-signup-toast-content">
                        <span className="agent-signup-toast-icon">
                            {toast.type === 'success' && '✅'}
                            {toast.type === 'error' && '❌'}
                            {toast.type === 'warning' && '⚠️'}
                            {toast.type === 'info' && 'ℹ️'}
                        </span>
                        <span className="agent-signup-toast-message">{toast.message}</span>
                        <button className="agent-signup-toast-close" onClick={hideToast}><FaTimes /></button>
                    </div>
                </div>
            )}

            <div className="agent-signup-card">
                {/* LEFT BRAND PANEL */}
                <div className="agent-signup-brand-panel">
                    <div className="agent-signup-brand-icon">
                        <FaUserTie />
                    </div>
                    <h1 className="agent-signup-brand-title">Agent Portal</h1>
                    <p className="agent-signup-brand-text">
                        Join our network of trusted education agents and help students achieve their dreams.
                    </p>
                    <div className="agent-signup-brand-dots">
                        <span></span><span></span><span></span><span></span>
                    </div>
                </div>

                {/* RIGHT FORM PANEL */}
                <div className="agent-signup-form-panel">
                    <div className="agent-signup-form-header">
                        <h2>{showOTP ? 'Verify Email' : 'Create Account'}</h2>
                        <p>{showOTP ? 'Enter the code we sent to your email' : 'Fill in your details to get started'}</p>
                    </div>

                    {successMessage && (
                        <div className="agent-signup-success-message">
                            <FaCheckCircle className="agent-signup-success-icon" />
                            {successMessage}
                        </div>
                    )}

                    {!showOTP ? (
                        <>
                            {serverError && (
                                <div className="agent-signup-error-message agent-signup-server-error">
                                    <FaExclamationTriangle className="agent-signup-error-icon" />
                                    {serverError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="agent-signup-form">
                                {/* PERSONAL INFO */}
                                <div className="agent-signup-form-section">
                                    <h3 className="agent-signup-section-title">
                                        <FaUser className="agent-signup-section-icon" /> Personal Information
                                    </h3>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="name">Full Name *</label>
                                            <input type="text" id="name" name="name" placeholder="Enter your full name"
                                                value={formData.name} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.name && errors.name ? 'error' : ''} disabled={loading} />
                                            {touched.name && errors.name && <span className="agent-signup-error-text">{errors.name}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="email">Email Address *</label>
                                            <input type="email" id="email" name="email" placeholder="Enter your email"
                                                value={formData.email} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.email && errors.email ? 'error' : ''} disabled={loading} />
                                            {touched.email && errors.email && <span className="agent-signup-error-text">{errors.email}</span>}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="phone">Phone Number *</label>
                                            <input type="tel" id="phone" name="phone" placeholder="10-digit phone number"
                                                value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.phone && errors.phone ? 'error' : ''} disabled={loading} />
                                            {touched.phone && errors.phone && <span className="agent-signup-error-text">{errors.phone}</span>}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="password">Password *</label>
                                            <div className="agent-signup-password-wrapper">
                                                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                                                    placeholder="Min 6 characters" value={formData.password}
                                                    onChange={handleChange} onBlur={handleBlur}
                                                    className={touched.password && errors.password ? 'error' : ''} disabled={loading} />
                                                <button type="button" className="agent-signup-password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            {touched.password && errors.password && <span className="agent-signup-error-text">{errors.password}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="confirmPassword">Confirm Password *</label>
                                            <div className="agent-signup-password-wrapper">
                                                <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword"
                                                    name="confirmPassword" placeholder="Confirm your password"
                                                    value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                                                    className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''} disabled={loading} />
                                                <button type="button" className="agent-signup-password-toggle"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            {touched.confirmPassword && errors.confirmPassword && <span className="agent-signup-error-text">{errors.confirmPassword}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* PERSONAL DETAILS */}
                                <div className="agent-signup-form-section">
                                    <h3 className="agent-signup-section-title">
                                        <FaCalendarAlt className="agent-signup-section-icon" /> Personal Details
                                    </h3>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="dateOfBirth">Date of Birth *</label>
                                            <input type="date" id="dateOfBirth" name="dateOfBirth"
                                                value={formData.dateOfBirth} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.dateOfBirth && errors.dateOfBirth ? 'error' : ''} disabled={loading} />
                                            {touched.dateOfBirth && errors.dateOfBirth && <span className="agent-signup-error-text">{errors.dateOfBirth}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="gender">Gender *</label>
                                            <select id="gender" name="gender" value={formData.gender}
                                                onChange={handleChange} onBlur={handleBlur}
                                                className={touched.gender && errors.gender ? 'error' : ''} disabled={loading}>
                                                <option value="">Select Gender</option>
                                                {genderOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                            {touched.gender && errors.gender && <span className="agent-signup-error-text">{errors.gender}</span>}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-group">
                                        <label htmlFor="nationality">Nationality</label>
                                        <input type="text" id="nationality" name="nationality" placeholder="Your nationality"
                                            value={formData.nationality} onChange={handleChange} disabled={loading} />
                                    </div>
                                </div>

                                {/* ID */}
                                <div className="agent-signup-form-section">
                                    <h3 className="agent-signup-section-title">
                                        <FaIdCard className="agent-signup-section-icon" /> Identification
                                    </h3>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="idType">ID Type *</label>
                                            <select id="idType" name="idType" value={formData.idType}
                                                onChange={handleChange} onBlur={handleBlur}
                                                className={touched.idType && errors.idType ? 'error' : ''} disabled={loading}>
                                                <option value="">Select ID Type</option>
                                                {idTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                            {touched.idType && errors.idType && <span className="agent-signup-error-text">{errors.idType}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="idNumber">ID Number *</label>
                                            <input type="text" id="idNumber" name="idNumber" placeholder="Enter your ID number"
                                                value={formData.idNumber} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.idNumber && errors.idNumber ? 'error' : ''} disabled={loading} />
                                            {touched.idNumber && errors.idNumber && <span className="agent-signup-error-text">{errors.idNumber}</span>}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-group">
                                        <label htmlFor="idFile">Upload ID Document *</label>
                                        <div className="agent-signup-file-upload">
                                            {!formData.idFilePreview ? (
                                                <div className="agent-signup-file-drop">
                                                    <input type="file" id="idFile" name="idFile" ref={fileInputRef}
                                                        onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf"
                                                        className={errors.idFile ? 'error' : ''} disabled={loading} />
                                                    <FaUpload className="agent-signup-upload-icon" />
                                                    <p>Click to upload or drag and drop</p>
                                                    <small>JPG, PNG or PDF (Max 5MB)</small>
                                                </div>
                                            ) : (
                                                <div className="agent-signup-file-preview">
                                                    {formData.idFilePreview.match(/\.(jpeg|jpg|png|gif)$/) ? (
                                                        <img src={formData.idFilePreview} alt="ID Preview" className="agent-signup-preview-image" />
                                                    ) : (
                                                        <div className="agent-signup-file-icon-preview">
                                                            <FaFileAlt size={40} />
                                                            <p>{formData.idFile?.name}</p>
                                                        </div>
                                                    )}
                                                    <button type="button" className="agent-signup-remove-file"
                                                        onClick={removeFile} disabled={loading}><FaTrash /></button>
                                                </div>
                                            )}
                                        </div>
                                        {errors.idFile && <span className="agent-signup-error-text">{errors.idFile}</span>}
                                    </div>
                                </div>

                                {/* PROFESSIONAL */}
                                <div className="agent-signup-form-section">
                                    <h3 className="agent-signup-section-title">
                                        <FaBriefcase className="agent-signup-section-icon" /> Professional Information
                                    </h3>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="jobTitle">Job Title *</label>
                                            <input type="text" id="jobTitle" name="jobTitle" placeholder="Your job title"
                                                value={formData.jobTitle} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.jobTitle && errors.jobTitle ? 'error' : ''} disabled={loading} />
                                            {touched.jobTitle && errors.jobTitle && <span className="agent-signup-error-text">{errors.jobTitle}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="company">Company/Organization</label>
                                            <input type="text" id="company" name="company" placeholder="Company name"
                                                value={formData.company} onChange={handleChange} disabled={loading} />
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="experience">Experience *</label>
                                            <select id="experience" name="experience" value={formData.experience}
                                                onChange={handleChange} onBlur={handleBlur}
                                                className={touched.experience && errors.experience ? 'error' : ''} disabled={loading}>
                                                <option value="">Select Experience</option>
                                                {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                            {touched.experience && errors.experience && <span className="agent-signup-error-text">{errors.experience}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="education">Education *</label>
                                            <select id="education" name="education" value={formData.education}
                                                onChange={handleChange} onBlur={handleBlur}
                                                className={touched.education && errors.education ? 'error' : ''} disabled={loading}>
                                                <option value="">Select Education</option>
                                                {educationOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                            {touched.education && errors.education && <span className="agent-signup-error-text">{errors.education}</span>}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-group">
                                        <label htmlFor="specialization">Specialization</label>
                                        <input type="text" id="specialization" name="specialization"
                                            placeholder="Your area of expertise" value={formData.specialization}
                                            onChange={handleChange} disabled={loading} />
                                    </div>
                                </div>

                                {/* LOCATION */}
                                <div className="agent-signup-form-section">
                                    <h3 className="agent-signup-section-title">
                                        <FaMapMarkerAlt className="agent-signup-section-icon" /> Location
                                    </h3>
                                    <div className="agent-signup-form-group">
                                        <label htmlFor="address">Address *</label>
                                        <textarea id="address" name="address" placeholder="Enter your full address"
                                            value={formData.address} onChange={handleChange} onBlur={handleBlur}
                                            className={touched.address && errors.address ? 'error' : ''}
                                            rows="2" disabled={loading} />
                                        {touched.address && errors.address && <span className="agent-signup-error-text">{errors.address}</span>}
                                    </div>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="city">City *</label>
                                            <input type="text" id="city" name="city" placeholder="City"
                                                value={formData.city} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.city && errors.city ? 'error' : ''} disabled={loading} />
                                            {touched.city && errors.city && <span className="agent-signup-error-text">{errors.city}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="state">State *</label>
                                            <input type="text" id="state" name="state" placeholder="State"
                                                value={formData.state} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.state && errors.state ? 'error' : ''} disabled={loading} />
                                            {touched.state && errors.state && <span className="agent-signup-error-text">{errors.state}</span>}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-row">
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="pincode">Pincode *</label>
                                            <input type="text" id="pincode" name="pincode" placeholder="6-digit pincode"
                                                value={formData.pincode} onChange={handleChange} onBlur={handleBlur}
                                                className={touched.pincode && errors.pincode ? 'error' : ''}
                                                maxLength="6" disabled={loading} />
                                            {touched.pincode && errors.pincode && <span className="agent-signup-error-text">{errors.pincode}</span>}
                                        </div>
                                        <div className="agent-signup-form-group">
                                            <label htmlFor="country">Country</label>
                                            <input type="text" id="country" name="country" value={formData.country}
                                                onChange={handleChange} disabled={loading} />
                                        </div>
                                    </div>
                                </div>

                                {/* LANGS & SKILLS */}
                                <div className="agent-signup-form-section">
                                    <h3 className="agent-signup-section-title">
                                        <FaGraduationCap className="agent-signup-section-icon" /> Languages & Skills
                                    </h3>
                                    <div className="agent-signup-form-group">
                                        <label>Languages</label>
                                        <div className="agent-signup-tag-input">
                                            <input type="text" placeholder="Add a language" value={newLanguage}
                                                onChange={(e) => setNewLanguage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                                disabled={loading} />
                                            <button type="button" onClick={addLanguage} className="agent-signup-add-tag" disabled={loading}>
                                                Add
                                            </button>
                                        </div>
                                        <div className="agent-signup-tags">
                                            {formData.languages.map(lang => (
                                                <span key={lang} className="agent-signup-tag">
                                                    {lang}
                                                    <button type="button" onClick={() => removeLanguage(lang)} disabled={loading}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-group">
                                        <label>Skills</label>
                                        <div className="agent-signup-tag-input">
                                            <input type="text" placeholder="Add a skill" value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                disabled={loading} />
                                            <button type="button" onClick={addSkill} className="agent-signup-add-tag" disabled={loading}>
                                                Add
                                            </button>
                                        </div>
                                        <div className="agent-signup-tags">
                                            {formData.skills.map(skill => (
                                                <span key={skill} className="agent-signup-tag">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(skill)} disabled={loading}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="agent-signup-form-group">
                                        <label htmlFor="bio">Bio / About</label>
                                        <textarea id="bio" name="bio" placeholder="Tell us about yourself"
                                            value={formData.bio} onChange={handleChange} rows="3" disabled={loading} />
                                    </div>
                                </div>

                                <div className="agent-signup-form-group agent-signup-terms-group">
                                    <label className="agent-signup-checkbox-label">
                                        <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms}
                                            onChange={handleChange} className={errors.agreeTerms ? 'error' : ''} disabled={loading} />
                                        <span>I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a> *</span>
                                    </label>
                                    {errors.agreeTerms && <span className="agent-signup-error-text">{errors.agreeTerms}</span>}
                                </div>

                                <button type="submit" className="agent-signup-submit-btn" disabled={loading || isSubmitting}>
                                    {loading ? (
                                        <><span className="agent-signup-spinner"></span> Creating Account...</>
                                    ) : (
                                        <>Create Account <FaArrowRight /></>
                                    )}
                                </button>

                                <p className="agent-signup-login-link">
                                    Already have an account? <a href="/agent/login">Login</a>
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="agent-signup-otp-section">
                            <div className="agent-signup-otp-header">
                                <FaEnvelopeOpen className="agent-signup-otp-icon" />
                                <p className="agent-signup-otp-message">
                                    We sent a verification code to <strong>{userEmail}</strong>
                                </p>
                                <p className="agent-signup-otp-sub-message">Please check your email for the 6-digit code</p>
                            </div>
                            <div className="agent-signup-otp-inputs">
                                {otp.map((digit, index) => (
                                    <input key={index} ref={(ref) => (otpInputs.current[index] = ref)}
                                        type="text" maxLength={1} value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={handleOtpPaste}
                                        className={`agent-signup-otp-digit ${otpError ? 'error' : ''}`}
                                        disabled={otpLoading} />
                                ))}
                            </div>
                            {otpError && <span className="agent-signup-error-text agent-signup-otp-error">{otpError}</span>}
                            <div className="agent-signup-otp-timer">
                                <FaClock className="agent-signup-timer-icon" />
                                <span>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                                <span className="agent-signup-timer-label">remaining</span>
                            </div>
                            <button className="agent-signup-resend-btn" onClick={handleResendOTP}
                                disabled={resendDisabled || otpLoading}>
                                {otpLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                            <div className="agent-signup-otp-actions">
                                <button type="button" className="agent-signup-back-btn"
                                    onClick={handleBackToForm} disabled={otpLoading}>← Back</button>
                                <button type="button" className="agent-signup-verify-btn"
                                    onClick={() => handleVerifyOTP(otp.join(''))} disabled={otpLoading}>
                                    {otpLoading ? (<><span className="agent-signup-spinner"></span> Verifying...</>) : ('Verify & Complete')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentSignUp;