// src/Layout/AgentLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AgentSidebar from '../Components/Agent/Sidebar/AgentSidebar';
import AgentNavbar from '../Components/Agent/Navbar/AgentNavbar';
import { FaBars } from 'react-icons/fa';
import './AgentLayout.css';

const AgentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ===== STATE =====
    const [sidebarOpen, setSidebarOpen] = useState(true);              // desktop: full / icon-only
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // mobile: hidden by default

    // ============================================
    // CHECK AUTHENTICATION
    // ============================================
    useEffect(() => {
        const token = localStorage.getItem('agentToken');
        const agentData = localStorage.getItem('agentData');

        if (!token || !agentData) {
            console.log('❌ No agent token found, redirecting to login');
            navigate('/agent/login');
            return;
        }

        try {
            const agent = JSON.parse(agentData);
            if (agent.approvalStatus !== 'approved') {
                console.log('❌ Agent not approved:', agent.approvalStatus);
                navigate('/agent/status');
            }
        } catch (error) {
            console.error('Error parsing agent data:', error);
            navigate('/agent/login');
        }
    }, [navigate]);

    // ============================================
    // HANDLE RESPONSIVE
    // ============================================
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 768;
            setIsMobile(mobile);

            if (mobile) {
                // ✅ MOBILE: sidebar always starts fully hidden
                setMobileSidebarOpen(false);
            } else if (width < 1024) {
                setSidebarOpen(false); // tablet: icon-only
            } else {
                setSidebarOpen(true);  // desktop: full
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ============================================
    // CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
    // ============================================
    useEffect(() => {
        if (isMobile) {
            setMobileSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    // ============================================
    // TOGGLE SIDEBAR
    // ============================================
    const toggleSidebar = () => {
        if (isMobile) {
            setMobileSidebarOpen(prev => !prev); // mobile: full open <-> fully closed
        } else {
            setSidebarOpen(prev => !prev);       // desktop: full <-> icon-only
        }
    };

    const closeMobileSidebar = () => {
        setMobileSidebarOpen(false);
    };

    // ============================================
    // EFFECTIVE OPEN STATE
    // Mobile → true/false only (never icon-only)
    // ============================================
    const effectiveOpen = isMobile ? mobileSidebarOpen : sidebarOpen;

    return (
        <div className="agent-layout">
            {/* ===== MOBILE: SHOW SIDEBAR BUTTON (only when closed) ===== */}
            {isMobile && !mobileSidebarOpen && (
                <button
                    className="agent-sidebar-show-btn"
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
                    className="agent-sidebar-overlay"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />
            )}

            {/* ===== SIDEBAR CONTAINER ===== */}
            <aside
                className={`agent-sidebar-container ${
                    isMobile
                        ? (mobileSidebarOpen ? 'agent-sidebar-mobile-open' : 'agent-sidebar-mobile-closed')
                        : (sidebarOpen ? 'agent-sidebar-open' : 'agent-sidebar-closed')
                }`}
            >
                <AgentSidebar
                    isOpen={effectiveOpen}
                    onClose={closeMobileSidebar}
                    isMobile={isMobile}
                    onToggle={toggleSidebar}
                />
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className={`agent-main-container ${
                !isMobile && sidebarOpen ? 'agent-sidebar-open' : 'agent-sidebar-closed'
            }`}>
                <AgentNavbar
                    onToggleSidebar={toggleSidebar}
                    isMobile={isMobile}
                    sidebarOpen={effectiveOpen}
                />

                <main className="agent-content">
                    <div className="agent-content-inner">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AgentLayout;