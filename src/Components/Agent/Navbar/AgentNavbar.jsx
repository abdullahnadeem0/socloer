import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaBars, 
    FaBell, 
    FaUser, 
    FaCog, 
    FaSignOutAlt,
    FaChevronDown,
    FaPlus,
    FaClipboardList,
    FaUsers,
    FaTimes
} from 'react-icons/fa';
import './AgentNavbar.css';

const AgentNavbar = ({ onToggleSidebar, isMobile, sidebarOpen }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    
    // ===== STATE =====
    const [agentData, setAgentData] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // ===== NOTIFICATIONS =====
    const [notifications] = useState([
        {
            id: 1,
            title: 'New Application Approved',
            message: 'Your student application has been approved',
            time: '5 min ago',
            unread: true,
            type: 'approval'
        },
        {
            id: 2,
            title: 'New Student Added',
            message: 'John Doe added successfully',
            time: '1 hour ago',
            unread: true,
            type: 'student'
        },
        {
            id: 3,
            title: 'Application Submitted',
            message: 'Application APP-2025-00001 submitted',
            time: '2 hours ago',
            unread: false,
            type: 'submitted'
        }
    ]);

    // ===== GET AGENT DATA =====
    useEffect(() => {
        try {
            const data = localStorage.getItem('agentData');
            if (data) {
                setAgentData(JSON.parse(data));
            }
        } catch (error) {
            console.error('Error parsing agent data:', error);
        }
    }, []);

    // ===== CLOSE DROPDOWN ON OUTSIDE CLICK =====
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ===== HANDLE LOGOUT =====
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('agentToken');
            localStorage.removeItem('agentData');
            navigate('/agent/login');
        }
    };

    // ===== GET UNREAD COUNT =====
    const unreadCount = notifications.filter(n => n.unread).length;

    // ===== GET INITIALS =====
    const getInitials = (name) => {
        if (!name) return 'A';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="agent-navbar">
            <div className="agent-navbar-inner">
                {/* ===== LEFT SECTION ===== */}
                <div className="agent-navbar-left">
                    {/* Toggle Sidebar Button */}
                    <button 
                        className="agent-navbar-toggle-btn"
                        onClick={onToggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <FaBars />
                    </button>

                    {/* Quick Action Buttons */}
                    <div className="agent-navbar-actions">
                        <Link to="/agent/students/add" className="agent-action-btn agent-action-primary">
                            <FaUsers />
                            <span>Add Student</span>
                        </Link>
                        <Link to="/agent/applications" className="agent-action-btn agent-action-secondary">
                            <FaClipboardList />
                            <span>Applications</span>
                        </Link>
                    </div>
                </div>

                {/* ===== RIGHT SECTION ===== */}
                <div className="agent-navbar-right" ref={dropdownRef}>
                    {/* Notifications */}
                    <div className="agent-navbar-dropdown-wrapper">
                        <button 
                            className="agent-navbar-icon-btn agent-notification-btn"
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowProfileDropdown(false);
                            }}
                            title="Notifications"
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="agent-notification-badge">{unreadCount}</span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="agent-navbar-dropdown agent-notifications-dropdown">
                                <div className="agent-dropdown-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="agent-mark-read-btn">
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="agent-notifications-list">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className={`agent-notification-item ${notif.unread ? 'agent-notification-unread' : ''}`}
                                            >
                                                <div className={`agent-notification-dot agent-dot-${notif.type}`}></div>
                                                <div className="agent-notification-content">
                                                    <h4>{notif.title}</h4>
                                                    <p>{notif.message}</p>
                                                    <span className="agent-notification-time">{notif.time}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="agent-empty-notifications">
                                            <p>No notifications</p>
                                        </div>
                                    )}
                                </div>

                                <div className="agent-dropdown-footer">
                                    <Link to="/agent/notifications">View all notifications</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="agent-navbar-dropdown-wrapper">
                        <button 
                            className="agent-profile-btn"
                            onClick={() => {
                                setShowProfileDropdown(!showProfileDropdown);
                                setShowNotifications(false);
                            }}
                        >
                            <div className="agent-profile-avatar">
                                {agentData?.profileImage ? (
                                    <img src={agentData.profileImage} alt="Profile" />
                                ) : (
                                    <span>{getInitials(agentData?.name)}</span>
                                )}
                            </div>
                            <div className="agent-profile-info">
                                <span className="agent-profile-name">
                                    {agentData?.name || 'Agent'}
                                </span>
                                <span className="agent-profile-role">Agent</span>
                            </div>
                            <FaChevronDown className={`agent-profile-arrow ${showProfileDropdown ? 'agent-rotate' : ''}`} />
                        </button>

                        {/* Profile Dropdown */}
                        {showProfileDropdown && (
                            <div className="agent-navbar-dropdown agent-profile-dropdown">
                                <div className="agent-profile-header">
                                    <div className="agent-profile-avatar-large">
                                        {agentData?.profileImage ? (
                                            <img src={agentData.profileImage} alt="Profile" />
                                        ) : (
                                            <span>{getInitials(agentData?.name)}</span>
                                        )}
                                    </div>
                                    <div className="agent-profile-details">
                                        <h4>{agentData?.name || 'Agent'}</h4>
                                        <p>{agentData?.email || 'agent@example.com'}</p>
                                    </div>
                                </div>

                                <div className="agent-profile-menu">
                                    <Link to="/agent/profile" className="agent-profile-menu-item">
                                        <FaUser />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link to="/agent/settings" className="agent-profile-menu-item">
                                        <FaCog />
                                        <span>Settings</span>
                                    </Link>
                                </div>

                                <div className="agent-profile-footer">
                                    <button 
                                        className="agent-logout-menu-btn"
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AgentNavbar;