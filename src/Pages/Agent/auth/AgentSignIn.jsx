// src/Pages/Agent/private/AgentSignIn.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaEnvelope, 
    FaLock, 
    FaEye, 
    FaEyeSlash, 
    FaBuilding, 
    FaArrowRight,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock
} from 'react-icons/fa';
import agentApi from '../../../api/agentApi';
import './AgentSignIn.css';

const AgentSignIn = () => {
    const navigate = useNavigate();
    
    // ===== STATE =====
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

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
    // VALIDATE FORM
    // ============================================
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

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
            return;
        }

        setLoading(true);
        setServerError('');
        setSuccessMessage('');

        try {
            console.log('=========================================');
            console.log('🔐 AGENT LOGIN REQUEST');
            console.log('=========================================');
            console.log('📧 Email:', formData.email);
            
            const response = await agentApi.login(formData);
            console.log('📥 Login response:', response);
            
            if (response.success) {
                setSuccessMessage('✅ Login successful! Redirecting to dashboard...');
                
                if (response.token) {
                    localStorage.setItem('agentToken', response.token);
                    localStorage.setItem('agentData', JSON.stringify(response.agent));
                }
                
                setTimeout(() => {
                    navigate('/agent/dashboard');
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            console.error('❌ Error response:', error.response?.data);
            
            const errorData = error.response?.data;
            const status = errorData?.status;
            
            if (status === 'pending' || status === 'rejected') {
                localStorage.setItem('agentStatusEmail', formData.email);
                localStorage.setItem('agentStatusMessage', errorData?.message || '');
                localStorage.setItem('agentStatus', status);
                navigate('/agent/status');
            } else {
                setServerError(errorData?.message || 'Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="agent-signin-container">
            <div className="agent-signin-card">
                {/* ===== HEADER ===== */}
                <div className="agent-signin-header">
                    <div className="agent-signin-header-icon">
                        <FaBuilding size={32} color="#ffffff" />
                    </div>
                    <h1>Agent Login</h1>
                    <p>Sign in to your agent account</p>
                </div>

                {/* ===== SUCCESS MESSAGE ===== */}
                {successMessage && (
                    <div className="agent-signin-success-message">
                        <FaCheckCircle />
                        {successMessage}
                    </div>
                )}

                {/* ===== SERVER ERROR ===== */}
                {serverError && (
                    <div className="agent-signin-error-message">
                        <FaExclamationTriangle />
                        <span>{serverError}</span>
                    </div>
                )}

                {/* ===== FORM ===== */}
                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="agent-signin-form-group">
                        <label htmlFor="email">
                            <FaEnvelope className="agent-signin-input-icon" />
                            Email Address
                        </label>
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
                            autoComplete="email"
                        />
                        {touched.email && errors.email && (
                            <span className="agent-signin-error-text">{errors.email}</span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="agent-signin-form-group">
                        <label htmlFor="password">
                            <FaLock className="agent-signin-input-icon" />
                            Password
                        </label>
                        <div className="agent-signin-password-wrapper">
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
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="agent-signin-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {touched.password && errors.password && (
                            <span className="agent-signin-error-text">{errors.password}</span>
                        )}
                    </div>

                    {/* Forgot Password */}
                    <div className="agent-signin-form-options">
                        <Link to="/agent/forgot-password" className="agent-signin-forgot-link">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="agent-signin-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="agent-signin-spinner"></span>
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
                                <FaArrowRight />
                            </>
                        )}
                    </button>
                </form>

                {/* ===== SIGN UP LINK ===== */}
                <p className="agent-signin-signup-link">
                    Don't have an account? <Link to="/agent/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default AgentSignIn;