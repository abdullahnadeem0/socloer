// src/Layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../Components/Admin/Sidebar/AdminSidebar';
import AdminNavbar from '../Components/Admin/Navbar/AdminNavbar';
import { FaBars } from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ===== STATE =====
    const [sidebarOpen, setSidebarOpen] = useState(true);           // desktop: open/collapsed
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // mobile: hidden by default

    // ===== CHECK AUTHENTICATION =====
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');

        if (!token || !adminData) {
            console.log('❌ No token found, redirecting to signin');
            navigate('/signin');
        }
    }, [navigate]);

    // ===== HANDLE RESPONSIVE =====
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 768;
            setIsMobile(mobile);

            if (mobile) {
                // ✅ MOBILE: sidebar always starts fully hidden (no icon-only state)
                setMobileSidebarOpen(false);
            } else if (width < 1024) {
                setSidebarOpen(false); // tablet: collapsed (icons only) — allowed on desktop/tablet
            } else {
                setSidebarOpen(true);  // desktop: full open
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ===== CLOSE MOBILE SIDEBAR ON ROUTE CHANGE =====
    useEffect(() => {
        if (isMobile) {
            setMobileSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    // ===== TOGGLE SIDEBAR =====
    const toggleSidebar = () => {
        if (isMobile) {
            setMobileSidebarOpen(prev => !prev); // mobile: open <-> fully closed
        } else {
            setSidebarOpen(prev => !prev);       // desktop: open <-> icon-only collapsed
        }
    };

    // ===== CLOSE MOBILE SIDEBAR =====
    const closeMobileSidebar = () => {
        setMobileSidebarOpen(false);
    };

    // ===== EFFECTIVE OPEN STATE =====
    // Mobile  → true/false only (never icon-only)
    // Desktop → true/false (icon-only is handled by CSS width)
    const effectiveOpen = isMobile ? mobileSidebarOpen : sidebarOpen;

    return (
        <div className="admin-layout">
            {/* ===== MOBILE: SHOW SIDEBAR BUTTON (only when closed) ===== */}
            {isMobile && !mobileSidebarOpen && (
                <button
                    className="admin-sidebar-show-btn"
                    onClick={() => setMobileSidebarOpen(true)}
                    aria-label="Show Sidebar"
                >
                    <FaBars />
                    <span>Menu</span>
                </button>
            )}

            {/* ===== MOBILE: LIGHT OVERLAY (no black) ===== */}
            {isMobile && mobileSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />
            )}

            {/* ===== SIDEBAR CONTAINER ===== */}
            <aside
                className={`admin-sidebar-container ${
                    isMobile
                        ? (mobileSidebarOpen ? 'mobile-open' : 'mobile-closed')  // ✅ mobile: 2 states only
                        : (sidebarOpen ? 'open' : 'closed')                       // desktop: open or icon-only
                }`}
            >
                <AdminSidebar
                    isOpen={effectiveOpen}
                    onClose={closeMobileSidebar}
                    isMobile={isMobile}
                />
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className={`admin-main-container ${
                !isMobile && sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
            }`}>
                <AdminNavbar
                    onToggleSidebar={toggleSidebar}
                    isMobile={isMobile}
                    sidebarOpen={effectiveOpen}
                />

                <main className="admin-content">
                    <div className="admin-content-inner">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;