// src/Pages/Home/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import {
    FaUserShield,
    FaUserTie,
    FaSignInAlt,
    FaUserPlus,
    FaArrowRight,
    FaBuilding,
    FaGraduationCap,
    FaMoneyBillWave,
    FaUsers,
    FaCheckCircle
} from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    // ===== ANIMATION ON MOUNT =====
    useEffect(() => {
        setVisible(true);
    }, []);

    return (
        <div className="HomePage">
            {/* ===== BACKGROUND SHAPES ===== */}
            <div className="HomePage-bg-shape HomePage-shape-1"></div>
            <div className="HomePage-bg-shape HomePage-shape-2"></div>
            <div className="HomePage-bg-shape HomePage-shape-3"></div>

            {/* ===== MAIN CONTAINER ===== */}
            <div className={`HomePage-container ${visible ? 'HomePage-visible' : ''}`}>

                {/* ===== HEADER ===== */}
                <div className="HomePage-header">
                    <div className="HomePage-header-icon-wrapper">
                        <FaBuilding className="HomePage-header-icon" />
                    </div>
                    <h1 className="HomePage-title">
                        Welcome to <span className="HomePage-title-highlight">Scholarship Portal</span>
                    </h1>
                    <p className="HomePage-subtitle">
                        Manage scholarships, applications, and payments — all in one place
                    </p>
                </div>

                {/* ===== 2 BIG CARDS ===== */}
                <div className="HomePage-cards-wrapper">

                    {/* ============================================ */}
                    {/* CARD 1: ADMIN */}
                    {/* ============================================ */}
                    <div className="HomePage-card HomePage-card-admin">
                        <div className="HomePage-card-glow"></div>

                        <div className="HomePage-card-header">
                            <div className="HomePage-card-icon-wrapper HomePage-admin-icon-bg">
                                <FaUserShield className="HomePage-card-icon" />
                            </div>
                            <h2 className="HomePage-card-title">Admin</h2>
                            <p className="HomePage-card-desc">
                                Manage agents, universities, programs, and all applications
                            </p>
                        </div>

                        <div className="HomePage-card-features">
                            <div className="HomePage-feature-item">
                                <FaUsers className="HomePage-feature-icon" />
                                <span>Manage Agents</span>
                            </div>
                            <div className="HomePage-feature-item">
                                <FaGraduationCap className="HomePage-feature-icon" />
                                <span>Universities & Programs</span>
                            </div>
                            <div className="HomePage-feature-item">
                                <FaCheckCircle className="HomePage-feature-icon" />
                                <span>Approve Applications</span>
                            </div>
                            <div className="HomePage-feature-item">
                                <FaMoneyBillWave className="HomePage-feature-icon" />
                                <span>Payments</span>
                            </div>
                        </div>

                        <div className="HomePage-card-buttons">
                            <button
                                className="HomePage-btn HomePage-btn-admin-login"
                                onClick={() => navigate('/signin')}
                            >
                                <FaSignInAlt />
                                Login as Admin
                                <FaArrowRight className="HomePage-btn-arrow" />
                            </button>
                            <button
                                className="HomePage-btn HomePage-btn-admin-signup"
                                onClick={() => navigate('/signup')}
                            >
                                <FaUserPlus />
                                Sign Up as Admin
                            </button>
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* CARD 2: AGENT */}
                    {/* ============================================ */}
                    <div className="HomePage-card HomePage-card-agent">
                        <div className="HomePage-card-glow"></div>

                        <div className="HomePage-card-header">
                            <div className="HomePage-card-icon-wrapper HomePage-agent-icon-bg">
                                <FaUserTie className="HomePage-card-icon" />
                            </div>
                            <h2 className="HomePage-card-title">Agent</h2>
                            <p className="HomePage-card-desc">
                                Submit student applications and track your earnings
                            </p>
                        </div>

                        <div className="HomePage-card-features">
                            <div className="HomePage-feature-item">
                                <FaUserPlus className="HomePage-feature-icon" />
                                <span>Submit Applications</span>
                            </div>
                            <div className="HomePage-feature-item">
                                <FaCheckCircle className="HomePage-feature-icon" />
                                <span>Track Status</span>
                            </div>
                            <div className="HomePage-feature-item">
                                <FaMoneyBillWave className="HomePage-feature-icon" />
                                <span>Earn Commissions</span>
                            </div>
                            <div className="HomePage-feature-item">
                                <FaGraduationCap className="HomePage-feature-icon" />
                                <span>Student Support</span>
                            </div>
                        </div>

                        <div className="HomePage-card-buttons">
                            <button
                                className="HomePage-btn HomePage-btn-agent-login"
                                onClick={() => navigate('/agent/login')}
                            >
                                <FaSignInAlt />
                                Login as Agent
                                <FaArrowRight className="HomePage-btn-arrow" />
                            </button>
                            <button
                                className="HomePage-btn HomePage-btn-agent-signup"
                                onClick={() => navigate('/agent/signup')}
                            >
                                <FaUserPlus />
                                Sign Up as Agent
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div className="HomePage-footer">
                    <p>© {new Date().getFullYear()} Scholarship Portal. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;