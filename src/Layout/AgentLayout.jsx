import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AgentSidebar from '../Components/Agent/Sidebar/AgentSidebar';
import AgentNavbar from '../Components/Agent/Navbar/AgentNavbar';
import './AgentLayout.css';

const AgentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // ===== STATE =====
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

        // Check approval status
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
            setIsMobile(width < 768);
            
            if (width < 768) {
                setSidebarOpen(false);
            } else if (width < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
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
            setMobileSidebarOpen(!mobileSidebarOpen);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    const closeMobileSidebar = () => {
        setMobileSidebarOpen(false);
    };

    return (
        <div className="agent-layout">
            {/* ===== MOBILE OVERLAY ===== */}
            {isMobile && mobileSidebarOpen && (
                <div 
                    className="agent-sidebar-overlay" 
                    onClick={closeMobileSidebar}
                ></div>
            )}

            {/* ===== SIDEBAR ===== */}
            <aside 
                className={`agent-sidebar-container ${
                    sidebarOpen ? 'agent-sidebar-open' : 'agent-sidebar-closed'
                } ${isMobile && mobileSidebarOpen ? 'agent-sidebar-mobile-open' : ''}`}
            >
                <AgentSidebar 
                    isOpen={sidebarOpen} 
                    onClose={closeMobileSidebar}
                    isMobile={isMobile}
                />
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <div className={`agent-main-container ${
                sidebarOpen ? 'agent-sidebar-open' : 'agent-sidebar-closed'
            }`}>
                {/* ===== NAVBAR ===== */}
                <AgentNavbar 
                    onToggleSidebar={toggleSidebar}
                    isMobile={isMobile}
                    sidebarOpen={isMobile ? mobileSidebarOpen : sidebarOpen}
                />

                {/* ===== PAGE CONTENT ===== */}
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