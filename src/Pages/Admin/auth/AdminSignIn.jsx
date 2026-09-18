import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSignIn.css';
import adminApi from '../../../api/adminApi';
import { 
    FaEnvelope, 
    FaLock, 
    FaEye, 
    FaEyeSlash,
    FaBuilding,
    FaArrowRight,
    FaExclamationTriangle,
    FaClock,
    FaEnvelopeOpen,
    FaCheckCircle
} from 'react-icons/fa';

const AdminSignIn = () => {
    const navigate = useNavigate();
    const otpInputs = useRef([]);
    
    // ===== STEP 1: FORM STATE =====
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

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
    // HANDLE CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
    // ✅ HANDLE OTP CHANGE - FIXED
    // ============================================
    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setOtpError('');

        // Auto focus next input
        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }

        // ✅ Auto verify when all 6 digits are filled
        const allFilled = newOtp.every(digit => digit !== '');
        if (allFilled && index === 5) {
            console.log('✅ All OTP filled:', newOtp.join(''));
            // Small delay to ensure state is updated
            setTimeout(() => {
                const otpValue = newOtp.join('');
                if (otpValue.length === 6) {
                    handleVerifyLoginOTP(otpValue);
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
                handleVerifyLoginOTP(pastedData);
            }, 300);
        }
    };

    // ============================================
    // HANDLE SIGN IN - Step 1
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setServerError('');

        try {
            const response = await adminApi.signin(formData);
            console.log('📥 Signin response:', response);
            
            if (response.success) {
                setUserEmail(formData.email);
                setShowOTP(true);
                setTimer(120);
                setResendDisabled(true);
                setSuccessMessage('Verification code sent to your email!');
                setOtp(['', '', '', '', '', '']);
                setOtpError('');
            }
        } catch (error) {
            console.error('❌ Signin error:', error);
            setServerError(
                error.response?.data?.message || 
                'Invalid email or password'
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ✅ VERIFY LOGIN OTP - FIXED
    // ============================================
    const handleVerifyLoginOTP = async (otpValue) => {
        // If otpValue is not passed, get from state
        if (!otpValue) {
            otpValue = otp.join('');
        }
        
        console.log('🔑 Final OTP Value:', otpValue);
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
            console.log('📤 Sending Login OTP request:', requestData);
            
            const response = await adminApi.verifyLoginOTP(requestData);
            console.log('📥 Verify Login response:', response);

            if (response.success) {
                setSuccessMessage('✅ Login successful! Redirecting to dashboard...');
                if (response.token) {
                    localStorage.setItem('adminToken', response.token);
                    localStorage.setItem('adminData', JSON.stringify(response.admin));
                }
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Login OTP verification error:', error);
            setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // ============================================
    // RESEND LOGIN OTP
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
        <div className="signin-container">
            <div className="signin-card">
                {/* ===== LOGO SECTION ===== */}
                <div className="logo-container">
                    <div className="logo-icon">
                        <FaBuilding size={36} color="#ffffff" />
                    </div>
                    <h1 className="company-name">Admin Portal</h1>
                    <p className="company-tagline">
                        {showOTP ? 'Verify to login' : 'Sign in to your account'}
                    </p>
                </div>

                {/* ===== SUCCESS MESSAGE ===== */}
                {successMessage && (
                    <div className="success-message">
                        <FaCheckCircle className="success-icon" />
                        {successMessage}
                    </div>
                )}

                {/* ============================================ */}
                {/* STEP 1: SIGN IN FORM */}
                {/* ============================================ */}
                {!showOTP ? (
                    <>
                        {serverError && (
                            <div className="error-message server-error">
                                <FaExclamationTriangle className="error-icon" />
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="email">
                                    <FaEnvelope className="input-icon" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email address"
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

                            {/* Password Field */}
                            <div className="form-group">
                                <label htmlFor="password">
                                    <FaLock className="input-icon" />
                                    Password
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
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

                            {/* Remember Me & Forgot Password */}
                            <div className="form-options">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="/forgot-password" className="forgot-link">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                className="signin-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="signup-link">
                            Don't have an account? <a href="/signup">Sign Up</a>
                        </p>
                    </>
                ) : (
                    /* ============================================ */
                    /* STEP 2: OTP VERIFICATION */
                    /* ============================================ */
                    <>
                        <div className="otp-section">
                            <div className="otp-header">
                                <FaEnvelopeOpen className="otp-icon" />
                                <p className="otp-message">
                                    We sent a verification code to <strong>{userEmail}</strong>
                                </p>
                                <p style={{ 
                                    fontSize: '12px', 
                                    color: '#a0aec0',
                                    marginTop: '4px'
                                }}>
                                    Please check your email for the 6-digit code
                                </p>
                            </div>

                            {/* 6 OTP Inputs */}
                            <div className="otp-inputs">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(ref) => (otpInputs.current[index] = ref)}
                                        id={`otp-${index}`}
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

                            {/* Timer */}
                            <div className="otp-timer">
                                <FaClock className="timer-icon" />
                                <span>
                                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="timer-label">remaining</span>
                            </div>

                            {/* Resend */}
                            <button
                                className="resend-btn"
                                onClick={handleResendOTP}
                                disabled={resendDisabled || otpLoading}
                            >
                                Resend Code
                            </button>

                            {/* Verify & Back */}
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
                                    className="verify-btn"
                                    onClick={() => handleVerifyLoginOTP(otp.join(''))}
                                    disabled={otpLoading}
                                >
                                    {otpLoading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Login'
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

export default AdminSignIn;