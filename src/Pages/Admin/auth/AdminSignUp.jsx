// src/Pages/Admin/private/AdminSignUp.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSignUp.css';
import adminApi from '../../../api/adminApi';
import { 
    FaUser, 
    FaEnvelope, 
    FaLock, 
    FaEye, 
    FaEyeSlash,
    FaCheckCircle,
    FaBuilding,
    FaArrowRight,
    FaExclamationTriangle,
    FaClock,
    FaEnvelopeOpen
} from 'react-icons/fa';

const AdminSignUp = () => {
    const navigate = useNavigate();
    const otpInputs = useRef([]);
    
    // ===== STEP 1: FORM STATE =====
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [agreeTerms, setAgreeTerms] = useState(false);

    // ===== STEP 2: OTP STATE =====
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(120);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
    // FORM VALIDATION
    // ============================================
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
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
        
        if (!agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the terms and conditions';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ============================================
    // HANDLE SIGN UP - Step 1
    // ============================================
    const handleSignUp = async (e) => {
        e.preventDefault();
        
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        if (!validateForm()) {
            const firstError = document.querySelector('.admin-signup-error-text');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await adminApi.signup(formData);
            console.log('📥 Signup response:', response);
            
            if (response.success) {
                setUserEmail(formData.email);
                setShowOTP(true);
                setTimer(120);
                setResendDisabled(true);
                setSuccessMessage('Verification code sent to your email!');
                setOtp(['', '', '', '', '', '']);
                setOtpError('');
                
                if (response.otp) {
                    const otpDigits = response.otp.toString().split('');
                    setOtp(otpDigits);
                }
            }
        } catch (error) {
            console.error('❌ Signup error:', error);
            setErrors({
                form: error.response?.data?.message || 'An error occurred during signup'
            });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // HANDLE OTP CHANGE - 6 Inputs
    // ============================================
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        setOtpError('');

        if (value && index < 5) {
            otpInputs.current[index + 1].focus();
        }

        if (newOtp.every(digit => digit !== '') && index === 5) {
            setTimeout(() => handleVerifyOTP(), 300);
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1].focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            otpInputs.current[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            otpInputs.current[index + 1].focus();
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
            setTimeout(() => handleVerifyOTP(), 300);
        }
    };

    // ============================================
    // VERIFY OTP - Step 2
    // ============================================
    const handleVerifyOTP = async () => {
        const otpValue = otp.join('');
        console.log('🔑 OTP Value:', otpValue);
        console.log('🔑 OTP Length:', otpValue.length);
        
        if (otpValue.length !== 6) {
            setOtpError('Please enter all 6 digits');
            return;
        }

        setOtpLoading(true);
        setOtpError('');

        try {
            const requestData = {
                email: userEmail,
                otp: otpValue.toString().trim()
            };
            console.log('📤 Sending OTP request:', requestData);
            
            const response = await adminApi.verifySignUpOTP(requestData);
            console.log('📥 Verify response:', response);

            if (response.success) {
                setSuccessMessage('✅ Account verified successfully!');
                if (response.token) {
                    localStorage.setItem('adminToken', response.token);
                    localStorage.setItem('adminData', JSON.stringify(response.admin));
                }
                setTimeout(() => {
                    navigate('/signin');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ OTP verification error:', error);
            console.error('❌ Error response:', error.response?.data);
            setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // ============================================
    // RESEND OTP
    // ============================================
    const handleResendOTP = async () => {
        setOtpLoading(true);
        setOtpError('');

        try {
            const response = await adminApi.resendOTP({ email: userEmail });
            console.log('📥 Resend response:', response);
            if (response.success) {
                setTimer(120);
                setResendDisabled(true);
                setOtp(['', '', '', '', '', '']);
                setSuccessMessage('New verification code sent!');
                
                if (response.otp) {
                    const otpDigits = response.otp.toString().split('');
                    setOtp(otpDigits);
                }
            }
        } catch (error) {
            console.error('❌ Resend OTP error:', error);
            setOtpError(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
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
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="admin-signup-container">
            <div className="admin-signup-card">
                {/* ===== LOGO ===== */}
                <div className="admin-signup-logo-container">
                    <div className="admin-signup-logo-icon">
                        <FaBuilding size={36} color="#ffffff" />
                    </div>
                    <h1 className="admin-signup-company-name">Admin Portal</h1>
                    <p className="admin-signup-company-tagline">
                        {showOTP ? 'Verify your email' : 'Create your admin account'}
                    </p>
                </div>

                {/* ===== SUCCESS MESSAGE ===== */}
                {successMessage && (
                    <div className="admin-signup-success-message">
                        <FaCheckCircle className="admin-signup-success-icon" />
                        {successMessage}
                    </div>
                )}

                {/* ============================================ */}
                {/* STEP 1: SIGN UP FORM */}
                {/* ============================================ */}
                {!showOTP ? (
                    <>
                        {errors.form && (
                            <div className="admin-signup-error-message admin-signup-server-error">
                                <FaExclamationTriangle className="admin-signup-error-icon" />
                                {errors.form}
                            </div>
                        )}

                        <form onSubmit={handleSignUp} className="admin-signup-form">
                            {/* Name */}
                            <div className="admin-signup-form-group">
                                <label>
                                    <FaUser className="admin-signup-input-icon" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({...formData, name: e.target.value});
                                        setErrors({...errors, name: ''});
                                    }}
                                    onBlur={() => setTouched({...touched, name: true})}
                                    className={touched.name && errors.name ? 'error' : ''}
                                    disabled={loading}
                                />
                                {touched.name && errors.name && (
                                    <span className="admin-signup-error-text">{errors.name}</span>
                                )}
                            </div>

                            {/* Email */}
                            <div className="admin-signup-form-group">
                                <label>
                                    <FaEnvelope className="admin-signup-input-icon" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({...formData, email: e.target.value});
                                        setErrors({...errors, email: ''});
                                    }}
                                    onBlur={() => setTouched({...touched, email: true})}
                                    className={touched.email && errors.email ? 'error' : ''}
                                    disabled={loading}
                                />
                                {touched.email && errors.email && (
                                    <span className="admin-signup-error-text">{errors.email}</span>
                                )}
                            </div>

                            {/* Password */}
                            <div className="admin-signup-form-group">
                                <label>
                                    <FaLock className="admin-signup-input-icon" />
                                    Password
                                </label>
                                <div className="admin-signup-password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Enter password (min 6 characters)"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({...formData, password: e.target.value});
                                            setErrors({...errors, password: ''});
                                        }}
                                        onBlur={() => setTouched({...touched, password: true})}
                                        className={touched.password && errors.password ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="admin-signup-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {touched.password && errors.password && (
                                    <span className="admin-signup-error-text">{errors.password}</span>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="admin-signup-form-group">
                                <label>
                                    <FaLock className="admin-signup-input-icon" />
                                    Confirm Password
                                </label>
                                <div className="admin-signup-password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData({...formData, confirmPassword: e.target.value});
                                            setErrors({...errors, confirmPassword: ''});
                                        }}
                                        onBlur={() => setTouched({...touched, confirmPassword: true})}
                                        className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="admin-signup-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <span className="admin-signup-error-text">{errors.confirmPassword}</span>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="admin-signup-terms-group">
                                <label className="admin-signup-terms-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => {
                                            setAgreeTerms(e.target.checked);
                                            setErrors({...errors, agreeTerms: ''});
                                        }}
                                    />
                                    <span>
                                        I agree to the <a href="/terms">Terms of Service</a>
                                    </span>
                                </label>
                                {errors.agreeTerms && (
                                    <span className="admin-signup-error-text">{errors.agreeTerms}</span>
                                )}
                            </div>

                            {/* Submit */}
                            <button type="submit" className="admin-signup-button" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="admin-signup-spinner"></span>
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="admin-signup-signin-link">
                            Already have an account? <a href="/signin">Sign In</a>
                        </p>
                    </>
                ) : (
                    /* ============================================ */
                    /* STEP 2: OTP VERIFICATION - 6 Inputs */
                    /* ============================================ */
                    <>
                        <div className="admin-signup-otp-section">
                            <div className="admin-signup-otp-header">
                                <FaEnvelopeOpen className="admin-signup-otp-icon" />
                                <p className="admin-signup-otp-message">
                                    We sent a verification code to <strong>{userEmail}</strong>
                                </p>
                            </div>

                            {/* ✅ 6 OTP Inputs */}
                            <div className="admin-signup-otp-inputs">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(ref) => (otpInputs.current[index] = ref)}
                                        id={`admin-signup-otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={handleOtpPaste}
                                        className={`admin-signup-otp-digit ${otpError ? 'error' : ''}`}
                                        disabled={otpLoading}
                                    />
                                ))}
                            </div>

                            {otpError && (
                                <span className="admin-signup-error-text admin-signup-otp-error">{otpError}</span>
                            )}

                            {/* Timer */}
                            <div className="admin-signup-otp-timer">
                                <FaClock className="admin-signup-timer-icon" />
                                <span>
                                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="admin-signup-timer-label">remaining</span>
                            </div>

                            {/* Resend */}
                            <button
                                className="admin-signup-resend-btn"
                                onClick={handleResendOTP}
                                disabled={resendDisabled || otpLoading}
                            >
                                Resend Code
                            </button>

                            {/* Verify & Back */}
                            <div className="admin-signup-otp-actions">
                                <button
                                    type="button"
                                    className="admin-signup-back-btn"
                                    onClick={handleBackToForm}
                                    disabled={otpLoading}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    className="admin-signup-verify-btn"
                                    onClick={handleVerifyOTP}
                                    disabled={otpLoading}
                                >
                                    {otpLoading ? (
                                        <>
                                            <span className="admin-signup-spinner"></span>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Complete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminSignUp;