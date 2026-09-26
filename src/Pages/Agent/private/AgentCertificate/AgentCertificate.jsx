// src/Pages/Agent/private/AgentCertificate.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    FaCertificate, FaDownload, FaPrint, FaCheckCircle, FaShieldAlt,
    FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase,
    FaGraduationCap, FaClock, FaArrowLeft, FaSpinner, FaAward,
    FaFilePdf, FaFileImage, FaExclamationTriangle
} from 'react-icons/fa';
import agentApi from '../../../../api/agentApi';
import './AgentCertificate.css';

const AgentCertificate = () => {
    const navigate = useNavigate();
    const certificateRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchCertificate();
        // eslint-disable-next-line
    }, []);

    const fetchCertificate = async () => {
        try {
            setLoading(true);
            const res = await agentApi.getCertificate();
            if (res.success) {
                setCertificate(res.certificate);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load certificate';
            setError(msg);
            setStatus(err.response?.data?.status || '');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // DOWNLOAD AS PNG
    // ============================================
    const downloadAsImage = async () => {
        if (!certificateRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const link = document.createElement('a');
            link.download = `Agent-Certificate-${certificate.certificateId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download Error:', err);
            alert('Failed to download image');
        } finally {
            setDownloading(false);
        }
    };

    // ============================================
    // DOWNLOAD AS PDF
    // ============================================
    const downloadAsPDF = async () => {
        if (!certificateRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
            pdf.save(`Agent-Certificate-${certificate.certificateId}.pdf`);
        } catch (err) {
            console.error('PDF Error:', err);
            alert('Failed to download PDF');
        } finally {
            setDownloading(false);
        }
    };

    // ============================================
    // PRINT
    // ============================================
    const handlePrint = () => {
        window.print();
    };

    // ============================================
    // LOADING
    // ============================================
    if (loading) {
        return (
            <div className="agent-cert-page">
                <div className="agent-cert-loading">
                    <FaSpinner className="agent-cert-spinner" />
                    <p>Loading your certificate...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // NOT APPROVED / ERROR
    // ============================================
    if (error || !certificate) {
        const isPending = status === 'pending';
        const isRejected = status === 'rejected';

        return (
            <div className="agent-cert-page">
                <div className="agent-cert-status-card">
                    <div className={`agent-cert-status-icon ${isPending ? 'pending' : isRejected ? 'rejected' : 'error'}`}>
                        {isPending ? <FaClock /> : <FaExclamationTriangle />}
                    </div>
                    <h2>
                        {isPending
                            ? 'Certificate Pending'
                            : isRejected
                                ? 'Account Rejected'
                                : 'Certificate Not Available'}
                    </h2>
                    <p>
                        {isPending
                            ? 'Your account is currently under admin review. Once approved, your certificate will be available here.'
                            : isRejected
                                ? 'Your account was rejected. Certificate cannot be issued.'
                                : error}
                    </p>
                    <button
                        className="agent-cert-back-btn"
                        onClick={() => navigate('/agent/dashboard')}
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ============================================
    // MAIN CERTIFICATE
    // ============================================
    const { agent } = certificate;
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="agent-cert-page">

            {/* ACTION BAR */}
            <div className="agent-cert-actions no-print">
                <button className="agent-cert-action-btn back" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <div className="agent-cert-action-group">
                    <button
                        className="agent-cert-action-btn print"
                        onClick={handlePrint}
                        disabled={downloading}
                    >
                        <FaPrint /> Print
                    </button>
                    <button
                        className="agent-cert-action-btn img"
                        onClick={downloadAsImage}
                        disabled={downloading}
                    >
                        {downloading ? <FaSpinner className="spin" /> : <FaFileImage />} PNG
                    </button>
                    <button
                        className="agent-cert-action-btn pdf"
                        onClick={downloadAsPDF}
                        disabled={downloading}
                    >
                        {downloading ? <FaSpinner className="spin" /> : <FaFilePdf />} PDF
                    </button>
                </div>
            </div>

            {/* ============================================
                CERTIFICATE BODY
                ============================================ */}
            <div className="agent-cert-wrapper">
                <div className="agent-cert" ref={certificateRef}>

                    {/* Decorative Border Frame */}
                    <div className="agent-cert-frame" />
                    <div className="agent-cert-corner top-left" />
                    <div className="agent-cert-corner top-right" />
                    <div className="agent-cert-corner bottom-left" />
                    <div className="agent-cert-corner bottom-right" />

                    {/* Watermark */}
                    <div className="agent-cert-watermark">
                        <FaShieldAlt />
                    </div>

                    {/* ===== HEADER ===== */}
                    <div className="agent-cert-header">
                        <div className="agent-cert-logo">
                            <div className="agent-cert-logo-icon">
                                <FaUserTie />
                            </div>
                            <div className="agent-cert-logo-text">
                                <h3>Agent Portal</h3>
                                <small>Verified Partner Network</small>
                            </div>
                        </div>

                        <div className="agent-cert-seal">
                            <FaAward className="agent-cert-seal-icon" />
                            <span>OFFICIAL</span>
                        </div>
                    </div>

                    {/* ===== TITLE ===== */}
                    <div className="agent-cert-title-section">
                        <p className="agent-cert-eyebrow">Certificate of Verification</p>
                        <h1 className="agent-cert-title">Authorized Agent</h1>
                        <div className="agent-cert-divider">
                            <span className="line" />
                            <FaCertificate className="agent-cert-divider-icon" />
                            <span className="line" />
                        </div>
                        <p className="agent-cert-subtitle">
                            This certificate is proudly presented to
                        </p>
                    </div>

                    {/* ===== AGENT NAME ===== */}
                    <div className="agent-cert-name-block">
                        {agent.profileImage && (
                            <div className="agent-cert-avatar">
                                <img src={agent.profileImage} alt={agent.name} />
                                <span className="agent-cert-avatar-check">
                                    <FaCheckCircle />
                                </span>
                            </div>
                        )}
                        <h2 className="agent-cert-name">{agent.name}</h2>
                        <p className="agent-cert-role">
                            {agent.jobTitle}{agent.company ? ` at ${agent.company}` : ''}
                        </p>
                    </div>

                    {/* ===== BODY TEXT ===== */}
                    <p className="agent-cert-body-text">
                        In recognition of successfully completing the verification process
                        and meeting all the required standards, this individual has been
                        officially approved as a <strong>Verified Education Agent</strong> in
                        the Agent Portal network.
                    </p>

                    {/* ===== DETAILS GRID ===== */}
                    <div className="agent-cert-details-grid">
                        <div className="agent-cert-detail">
                            <FaEnvelope className="agent-cert-detail-icon" />
                            <div>
                                <small>Email</small>
                                <span>{agent.email}</span>
                            </div>
                        </div>
                        <div className="agent-cert-detail">
                            <FaPhone className="agent-cert-detail-icon" />
                            <div>
                                <small>Phone</small>
                                <span>{agent.phone}</span>
                            </div>
                        </div>
                        <div className="agent-cert-detail">
                            <FaMapMarkerAlt className="agent-cert-detail-icon" />
                            <div>
                                <small>Location</small>
                                <span>{agent.city}, {agent.state}, {agent.country}</span>
                            </div>
                        </div>
                        <div className="agent-cert-detail">
                            <FaBriefcase className="agent-cert-detail-icon" />
                            <div>
                                <small>Experience</small>
                                <span>{agent.experience}</span>
                            </div>
                        </div>
                        <div className="agent-cert-detail">
                            <FaGraduationCap className="agent-cert-detail-icon" />
                            <div>
                                <small>Education</small>
                                <span>{agent.education}</span>
                            </div>
                        </div>
                        {agent.specialization && (
                            <div className="agent-cert-detail">
                                <FaAward className="agent-cert-detail-icon" />
                                <div>
                                    <small>Specialization</small>
                                    <span>{agent.specialization}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== SKILLS ===== */}
                    {agent.skills?.length > 0 && (
                        <div className="agent-cert-skills">
                            <small className="agent-cert-skills-label">Key Skills</small>
                            <div className="agent-cert-skills-list">
                                {agent.skills.slice(0, 8).map((s, i) => (
                                    <span key={i} className="agent-cert-skill-tag">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== FOOTER ===== */}
                    <div className="agent-cert-footer">

                        {/* Certificate ID */}
                        <div className="agent-cert-footer-block">
                            <small>Certificate ID</small>
                            <strong className="agent-cert-id">{certificate.certificateId}</strong>
                        </div>

                        {/* Signature */}
                        <div className="agent-cert-footer-block center">
                            {agent.signature ? (
                                <img
                                    src={agent.signature}
                                    alt="Signature"
                                    className="agent-cert-signature-img"
                                />
                            ) : (
                                <div className="agent-cert-signature-placeholder">
                                    <FaUserTie />
                                </div>
                            )}
                            <div className="agent-cert-signature-line" />
                            <small>Authorized Signature</small>
                        </div>

                        {/* Issued Date */}
                        <div className="agent-cert-footer-block right">
                            <small>Issued On</small>
                            <strong>{issuedDate}</strong>
                        </div>

                    </div>

                    {/* Verification Line */}
                    <div className="agent-cert-verify-line">
                        <FaCheckCircle className="agent-cert-verify-icon" />
                        <span>
                            Verify this certificate at:
                            <strong> {certificate.verificationUrl}</strong>
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AgentCertificate;