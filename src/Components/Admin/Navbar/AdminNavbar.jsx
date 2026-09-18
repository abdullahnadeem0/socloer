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
    FaFileAlt,
    FaClipboardList
} from 'react-icons/fa';
import './AdminNavbar.css';

const AdminNavbar = ({ onToggleSidebar, isMobile, sidebarOpen }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    
    // ===== STATE =====
    const [adminData, setAdminData] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // ===== NOTIFICATIONS =====
    const [notifications] = useState([
        {
            id: 1,
            title: 'New Agent Registration',
            message: 'John Doe has registered as an agent',
            time: '5 min ago',
            unread: true,
            type: 'agent'
        },
        {
            id: 2,
            title: 'Pending Approval',
            message: '3 agents waiting for approval',
            time: '1 hour ago',
            unread: true,
            type: 'approval'
        },
        {
            id: 3,
            title: 'New User Registered',
            message: 'Sarah Smith joined the platform',
            time: '2 hours ago',
            unread: false,
            type: 'user'
        }
    ]);

    // ===== GET ADMIN DATA =====
    useEffect(() => {
        try {
            const data = localStorage.getItem('adminData');
            if (data) {
                setAdminData(JSON.parse(data));
            }
        } catch (error) {
            console.error('Error parsing admin data:', error);
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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            navigate('/signin');
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
        <header className="admin-navbar">
            <div className="navbar-inner">
                {/* ===== LEFT SECTION ===== */}
                <div className="navbar-left">
                    {/* Toggle Sidebar Button */}
                    <button 
                        className="navbar-toggle-btn"
                        onClick={onToggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <FaBars />
                    </button>

                    {/* ===== ACTION BUTTONS ===== */}
                    <div className="navbar-actions">
                        <button className="action-btn primary">
                            <FaPlus />
                            <span>Apply Now</span>
                        </button>
                        <button className="action-btn secondary">
                            <FaClipboardList />
                            <span>View Applications</span>
                        </button>
                        <button className="action-btn tertiary">
                            <FaUser />
                            <span>Add New User</span>
                        </button>
                    </div>
                </div>

                {/* ===== RIGHT SECTION ===== */}
                <div className="navbar-right" ref={dropdownRef}>
                    {/* Notifications */}
                    <div className="navbar-dropdown-wrapper">
                        <button 
                            className="navbar-icon-btn notification-btn"
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowProfileDropdown(false);
                            }}
                            title="Notifications"
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="navbar-dropdown notifications-dropdown">
                                <div className="dropdown-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="mark-read-btn">
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="notifications-list">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className={`notification-item ${notif.unread ? 'unread' : ''}`}
                                            >
                                                <div className={`notification-dot ${notif.type}`}></div>
                                                <div className="notification-content">
                                                    <h4>{notif.title}</h4>
                                                    <p>{notif.message}</p>
                                                    <span className="notification-time">{notif.time}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-notifications">
                                            <p>No notifications</p>
                                        </div>
                                    )}
                                </div>

                                <div className="dropdown-footer">
                                    <Link to="/admin/notifications">View all notifications</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="navbar-dropdown-wrapper">
                        <button 
                            className="profile-btn"
                            onClick={() => {
                                setShowProfileDropdown(!showProfileDropdown);
                                setShowNotifications(false);
                            }}
                        >
                            <div className="profile-avatar">
                                {adminData?.profileImage ? (
                                    <img src={adminData.profileImage} alt="Profile" />
                                ) : (
                                    <span>{getInitials(adminData?.name)}</span>
                                )}
                            </div>
                            <div className="profile-info">
                                <span className="profile-name">
                                    {adminData?.name || 'Admin'}
                                </span>
                                <span className="profile-role">Administrator</span>
                            </div>
                            <FaChevronDown className={`profile-arrow ${showProfileDropdown ? 'rotate' : ''}`} />
                        </button>

                        {/* Profile Dropdown */}
                        {showProfileDropdown && (
                            <div className="navbar-dropdown profile-dropdown">
                                <div className="profile-header">
                                    <div className="profile-avatar-large">
                                        {adminData?.profileImage ? (
                                            <img src={adminData.profileImage} alt="Profile" />
                                        ) : (
                                            <span>{getInitials(adminData?.name)}</span>
                                        )}
                                    </div>
                                    <div className="profile-details">
                                        <h4>{adminData?.name || 'Admin'}</h4>
                                        <p>{adminData?.email || 'admin@example.com'}</p>
                                    </div>
                                </div>

                                <div className="profile-menu">
                                    <Link to="/admin/profile" className="profile-menu-item">
                                        <FaUser />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link to="/admin/settings" className="profile-menu-item">
                                        <FaCog />
                                        <span>Settings</span>
                                    </Link>
                                </div>

                                <div className="profile-footer">
                                    <button 
                                        className="logout-menu-btn"
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

export default AdminNavbar;