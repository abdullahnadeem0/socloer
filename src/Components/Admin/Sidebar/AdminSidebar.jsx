// src/Layout/AdminSidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaUserTie, 
    FaBuilding, 
    FaSignOutAlt,
    FaFileAlt,
    FaChevronDown,
    FaChevronRight,
    FaTimes,
    FaUniversity,
    FaGraduationCap,
    FaMoneyBillWave
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, onClose, isMobile }) => {
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState({});

    // ===== MENU ITEMS =====
    const menuItems = [
        // ===== DASHBOARD =====
        {
            title: 'Dashboard',
            icon: <FaTachometerAlt />,
            path: '/admin/dashboard',
            exact: true
        },

        // ===== AGENTS MANAGEMENT =====
        {
            title: 'Agents',
            icon: <FaUserTie />,
            path: '/admin/agents',
            submenu: [
                { title: 'All Agents', path: '/admin/agents', exact: true },
                { title: 'Pending Approvals', path: '/admin/agents/pending' },
                { title: 'Approved', path: '/admin/agents/approved' },
                { title: 'Rejected', path: '/admin/agents/rejected' }
            ]
        },

        // ===== APPLICATIONS MANAGEMENT ⭐ =====
        {
            title: 'Applications',
            icon: <FaFileAlt />,
            path: '/admin/applications',
            submenu: [
                { title: 'All Applications', path: '/admin/applications', exact: true }
            ]
        },

        // ===== PAYMENTS MANAGEMENT ⭐ =====
        {
            title: 'Payments',
            icon: <FaMoneyBillWave />,
            path: '/admin/payments',
            submenu: [
                { title: 'All Payments', path: '/admin/payments', exact: true },
                { title: 'Receive Payment', path: '/admin/payments/receive' },
                { title: 'Send Payment', path: '/admin/payments/send' }
            ]
        },

        // ===== UNIVERSITIES =====
        {
            title: 'Universities',
            icon: <FaUniversity />,
            path: '/admin/universities',
            submenu: [
                { title: 'All Universities', path: '/admin/universities', exact: true },
                { title: 'Add University', path: '/admin/universities/add' }
            ]
        },

        // ===== PROGRAMS =====
        {
            title: 'Programs',
            icon: <FaGraduationCap />,
            path: '/admin/programs',
            submenu: [
                { title: 'All Programs', path: '/admin/programs', exact: true },
                { title: 'Add Program', path: '/admin/programs/add' }
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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            navigate('/signin');
        }
    };

    return (
        <div className={`admin-sidebar ${isOpen ? 'admin-sidebar-open' : 'admin-sidebar-collapsed'}`}>
            {/* ===== SIDEBAR HEADER ===== */}
            <div className="admin-sidebar-header">
                <div className="admin-sidebar-logo">
                    <div className="admin-sidebar-logo-icon-wrapper">
                        <FaBuilding className="admin-sidebar-logo-icon" />
                    </div>
                    {isOpen && (
                        <div className="admin-sidebar-title-wrapper">
                            <span className="admin-sidebar-title">Admin</span>
                            <span className="admin-sidebar-subtitle">Panel</span>
                        </div>
                    )}
                </div>
                
                {/* Mobile close button */}
                {isMobile && (
                    <button className="admin-sidebar-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* ===== SIDEBAR MENU ===== */}
            <nav className="admin-sidebar-menu">
                {menuItems.map((item, index) => (
                    <div key={index} className="admin-sidebar-menu-item-wrapper">
                        {item.submenu ? (
                            /* ===== MENU WITH SUBMENU ===== */
                            <>
                                <button
                                    className={`admin-sidebar-menu-item ${expandedMenus[item.title] ? 'admin-sidebar-expanded' : ''}`}
                                    onClick={() => toggleSubmenu(item.title)}
                                    title={!isOpen ? item.title : ''}
                                >
                                    <span className="admin-sidebar-menu-icon">{item.icon}</span>
                                    {isOpen && (
                                        <>
                                            <span className="admin-sidebar-menu-text">{item.title}</span>
                                            <span className="admin-sidebar-menu-arrow">
                                                {expandedMenus[item.title] 
                                                    ? <FaChevronDown /> 
                                                    : <FaChevronRight />
                                                }
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Submenu */}
                                {isOpen && expandedMenus[item.title] && (
                                    <div className="admin-sidebar-submenu">
                                        {item.submenu.map((subItem, subIndex) => (
                                            <NavLink
                                                key={subIndex}
                                                to={subItem.path}
                                                className={({ isActive }) => 
                                                    `admin-sidebar-submenu-item ${isActive ? 'admin-sidebar-submenu-active' : ''}`
                                                }
                                                onClick={isMobile ? onClose : undefined}
                                                end={subItem.exact}
                                            >
                                                <span className="admin-sidebar-submenu-dot"></span>
                                                {subItem.title}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ===== SIMPLE MENU ITEM ===== */
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => 
                                    `admin-sidebar-menu-item ${isActive ? 'admin-sidebar-menu-active' : ''}`
                                }
                                title={!isOpen ? item.title : ''}
                                onClick={isMobile ? onClose : undefined}
                                end={item.exact}
                            >
                                <span className="admin-sidebar-menu-icon">{item.icon}</span>
                                {isOpen && <span className="admin-sidebar-menu-text">{item.title}</span>}
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>

            {/* ===== SIDEBAR FOOTER ===== */}
            <div className="admin-sidebar-footer">
                <button 
                    className="admin-sidebar-logout-btn"
                    onClick={handleLogout}
                    title={!isOpen ? 'Logout' : ''}
                >
                    <span className="admin-sidebar-logout-icon-wrapper">
                        <FaSignOutAlt className="admin-sidebar-logout-icon" />
                    </span>
                    {isOpen && <span className="admin-sidebar-logout-text">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;