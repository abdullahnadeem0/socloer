import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaClock, 
    FaTimesCircle, 
    FaEnvelope, 
    FaSignOutAlt,
    FaRedo,
    FaPhone,
    FaExclamationTriangle
} from 'react-icons/fa';
import './AgentStatus.css';

const AgentStatus = () => {
    const navigate = useNavigate();
    
    // ===== STATE =====
    const [status, setStatus] = useState('pending');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // ============================================
    // GET STATUS FROM LOCALSTORAGE
    // ============================================
    useEffect(() => {
        const savedStatus = localStorage.getItem('agentStatus');
        const savedEmail = localStorage.getItem('agentStatusEmail');
        const savedMessage = localStorage.getItem('agentStatusMessage');

        console.log('📋 Agent Status Data:');
        console.log('   Status:', savedStatus);
        console.log('   Email:', savedEmail);
        console.log('   Message:', savedMessage);

        if (!savedStatus || !savedEmail) {
            // No status data - redirect to login
            navigate('/agent/login');
            return;
        }

        setStatus(savedStatus);
        setEmail(savedEmail);
        setMessage(savedMessage || '');
        setLoading(false);
    }, [navigate]);

    // ============================================
    // HANDLE LOGOUT
    // ============================================
    const handleLogout = () => {
        // Clear all agent-related data
        localStorage.removeItem('agentToken');
        localStorage.removeItem('agentData');
        localStorage.removeItem('agentStatus');
        localStorage.removeItem('agentStatusEmail');
        localStorage.removeItem('agentStatusMessage');
        
        navigate('/agent/login');
    };

    // ============================================
    // HANDLE REFRESH
    // ============================================
    const handleRefresh = () => {
        window.location.reload();
    };

    // ============================================
    // LOADING
    // ============================================
    if (loading) {
        return (
            <div className="agent-status-container">
                <div className="agent-status-card">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER - PENDING STATUS
    // ============================================
    if (status === 'pending') {
        return (
            <div className="agent-status-container">
                <div className="status-overlay"></div>
                
                <div className="agent-status-card pending">
                    {/* Icon */}
                    <div className="status-icon-wrapper pending">
                        <div className="status-icon-pulse"></div>
                        <FaClock className="status-icon" />
                    </div>

                    {/* Content */}
                    <div className="status-content">
                        <h1>Application Pending</h1>
                        <p className="status-subtitle">
                            Your application is currently under review
                        </p>

                        <div className="status-info-box pending">
                            <FaExclamationTriangle className="info-icon" />
                            <div>
                                <strong>What does this mean?</strong>
                                <p>
                                    Our admin team is reviewing your application. 
                                    This usually takes 24-48 hours. You will receive 
                                    an email notification once your application is 
                                    approved or rejected.
                                </p>
                            </div>
                        </div>

                        <div className="status-details">
                            <div className="detail-row">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value pending-badge">
                                    <FaClock /> Pending
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{email}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="status-actions">
                            <button 
                                className="btn-refresh"
                                onClick={handleRefresh}
                            >
                                <FaRedo /> Check Status Again
                            </button>
                            <button 
                                className="btn-logout"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>

                        <p className="status-footer-text">
                            Need help? Contact us at{' '}
                            <a href="mailto:support@solreshapip.com">
                                support@solreshapip.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER - REJECTED STATUS
    // ============================================
    if (status === 'rejected') {
        return (
            <div className="agent-status-container">
                <div className="status-overlay"></div>
                
                <div className="agent-status-card rejected">
                    {/* Icon */}
                    <div className="status-icon-wrapper rejected">
                        <FaTimesCircle className="status-icon" />
                    </div>

                    {/* Content */}
                    <div className="status-content">
                        <h1>Application Rejected</h1>
                        <p className="status-subtitle">
                            We regret to inform you that your application has been rejected
                        </p>

                        <div className="status-info-box rejected">
                            <FaExclamationTriangle className="info-icon" />
                            <div>
                                <strong>Reason for Rejection</strong>
                                <p>
                                    {message || 'No specific reason was provided. Please contact support for more details.'}
                                </p>
                            </div>
                        </div>

                        <div className="status-details">
                            <div className="detail-row">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value rejected-badge">
                                    <FaTimesCircle /> Rejected
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{email}</span>
                            </div>
                        </div>

                        <div className="status-message">
                            <h3>What can you do next?</h3>
                            <ul>
                                <li>Review the reason mentioned above</li>
                                <li>Contact our support team for clarification</li>
                                <li>You may reapply after resolving the issues</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="status-actions">
                            <Link 
                                to="/agent/signup"
                                className="btn-reapply"
                            >
                                <FaRedo /> Apply Again
                            </Link>
                            <button 
                                className="btn-logout"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>

                        <div className="contact-support">
                            <p>Need help? Contact us:</p>
                            <div className="contact-links">
                                <a href="mailto:support@solreshapip.com">
                                    <FaEnvelope /> support@solreshapip.com
                                </a>
                                <a href="tel:+911234567890">
                                    <FaPhone /> +91 1234 567 890
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div className="agent-status-container">
            <div className="agent-status-card">
                <h1>Unknown Status</h1>
                <button onClick={handleLogout} className="btn-logout">
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default AgentStatus;