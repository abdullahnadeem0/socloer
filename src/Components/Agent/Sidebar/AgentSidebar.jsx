// src/Layout/AgentSidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUserGraduate,
    FaFileAlt,
    FaMoneyBillWave,
    FaSignOutAlt,
    FaChevronDown,
    FaChevronRight,
    FaTimes,
    FaUserTie,
    FaPlusCircle
} from 'react-icons/fa';
import './AgentSidebar.css';

const AgentSidebar = ({ isOpen, onClose, isMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});
    const [agentData, setAgentData] = useState(null);

    // ===== GET AGENT DATA =====
    useEffect(() => {
        try {
            const data = localStorage.getItem('agentData');
            if (data) {
                setAgentData(JSON.parse(data));
            }
        } catch (e) {
            console.error('Error parsing agent data');
        }
    }, []);

    // ===== AUTO-CLOSE ON MOBILE AFTER NAVIGATION =====
    useEffect(() => {
        if (isMobile && isOpen) {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    // ===== MENU ITEMS =====
    const menuItems = [
        {
            title: 'Dashboard',
            icon: <FaTachometerAlt />,
            path: '/agent/dashboard',
            exact: true
        },
        {
            title: 'Applications',
            icon: <FaFileAlt />,
            path: '/agent/my-applications',
            submenu: [
                { title: 'My Applications', path: '/agent/my-applications', exact: true },
                { title: 'New Application', path: '/agent/student-application' }
            ]
        },
        {
            title: 'Payments',
            icon: <FaMoneyBillWave />,
            path: '/agent/payments',
            submenu: [
                { title: 'My Payments', path: '/agent/payments', exact: true }
            ]
        }
    ];

    // ===== TOGGLE SUBMENU =====
    const toggleSubmenu = (title) => {
        setExpandedMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // ===== HANDLE LOGOUT =====
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('agentToken');
            localStorage.removeItem('agentData');
            navigate('/agent/login');
        }
    };

    return (
        <aside className={`
            agent_sidebar
            ${isOpen ? 'agent_sidebar_open' : 'agent_sidebar_closed'}
            ${isMobile ? 'agent_sidebar_mobile' : 'agent_sidebar_desktop'}
        `}>
            {/* ===== HEADER ===== */}
            <div className="agent_sidebar_header">
                <div className="agent_sidebar_logo">
                    <div className="agent_sidebar_logo_icon_wrapper">
                        <FaUserTie className="agent_sidebar_logo_icon" />
                    </div>
                    <div className="agent_sidebar_title_wrapper">
                        <span className="agent_sidebar_title">Agent</span>
                        <span className="agent_sidebar_subtitle">Portal</span>
                    </div>
                </div>

                {/* ===== MOBILE: CLOSE (X) BUTTON ===== */}
                {isMobile && (
                    <button
                        className="agent_sidebar_close_btn"
                        onClick={onClose}
                        aria-label="Close Sidebar"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* ===== AGENT INFO ===== */}
            {agentData && (
                <div className="agent_sidebar_user_card">
                    <div className="agent_sidebar_user_avatar">
                        {agentData.profileImage ? (
                            <img
                                src={agentData.profileImage}
                                alt={agentData.name}
                                className="agent_sidebar_user_img"
                            />
                        ) : (
                            <span className="agent_sidebar_user_initials">
                                {agentData.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                        )}
                    </div>
                    <div className="agent_sidebar_user_info">
                        <span className="agent_sidebar_user_name">
                            {agentData.name || 'Agent'}
                        </span>
                        <span className="agent_sidebar_user_email">
                            {agentData.email || ''}
                        </span>
                    </div>
                </div>
            )}

            {/* ===== MENU ===== */}
            <nav className="agent_sidebar_menu">
                {menuItems.map((item, index) => (
                    <div key={index} className="agent_sidebar_menu_item_wrapper">
                        {item.submenu ? (
                            <>
                                <button
                                    className={`agent_sidebar_menu_item ${expandedMenus[item.title] ? 'agent_sidebar_expanded' : ''}`}
                                    onClick={() => toggleSubmenu(item.title)}
                                >
                                    <span className="agent_sidebar_menu_icon">{item.icon}</span>
                                    <span className="agent_sidebar_menu_text">{item.title}</span>
                                    <span className="agent_sidebar_menu_arrow">
                                        {expandedMenus[item.title]
                                            ? <FaChevronDown />
                                            : <FaChevronRight />
                                        }
                                    </span>
                                </button>

                                {expandedMenus[item.title] && (
                                    <div className="agent_sidebar_submenu">
                                        {item.submenu.map((subItem, subIndex) => (
                                            <NavLink
                                                key={subIndex}
                                                to={subItem.path}
                                                className={({ isActive }) =>
                                                    `agent_sidebar_submenu_item ${isActive ? 'agent_sidebar_submenu_active' : ''}`
                                                }
                                                onClick={isMobile ? onClose : undefined}
                                                end={subItem.exact}
                                            >
                                                <span className="agent_sidebar_submenu_dot"></span>
                                                {subItem.title}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `agent_sidebar_menu_item ${isActive ? 'agent_sidebar_menu_active' : ''}`
                                }
                                onClick={isMobile ? onClose : undefined}
                                end={item.exact}
                            >
                                <span className="agent_sidebar_menu_icon">{item.icon}</span>
                                <span className="agent_sidebar_menu_text">{item.title}</span>
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

            {/* ===== FOOTER ===== */}
            <div className="agent_sidebar_footer">
                <button
                    className="agent_sidebar_logout_btn"
                    onClick={handleLogout}
                >
                    <span className="agent_sidebar_logout_icon_wrapper">
                        <FaSignOutAlt className="agent_sidebar_logout_icon" />
                    </span>
                    <span className="agent_sidebar_logout_text">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AgentSidebar;