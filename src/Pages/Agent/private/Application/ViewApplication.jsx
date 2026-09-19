// src/Pages/Agent/private/Application/ViewApplication.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewApplication.css';
import agentApi from '../../../../api/agentApi';
import api, { API_URL, SERVER_URL, getFileUrl } from '../../../../api/config';
import {
    FaArrowLeft, FaEdit, FaUserGraduate, FaUniversity,
    FaGraduationCap, FaFileAlt, FaMoneyBillWave,
    FaCheckCircle, FaClock, FaTimesCircle, FaSpinner,
    FaExclamationTriangle, FaCalendarAlt, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaFolderOpen,
    FaDownload, FaPrint, FaHourglassHalf, FaUser, FaBook
} from 'react-icons/fa';

const ViewApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ===== STATE =====
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');

    // ============================================
    // ✅ FIXED: BACKEND URL (Hardcoded for now)
    // ============================================

    // ============================================
    // FETCH APPLICATION
    // ============================================
    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        setLoading(true);
        setServerError('');
        try {
            const response = await agentApi.getApplicationById(id);
            if (response.success) {
                setApplication(response.data);
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            setServerError(error.response?.data?.message || 'Failed to load application');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ✅ FIXED: getFileUrl Function
    // ============================================
    const getFileUrl = (path) => {
        if (!path) return null;

        // Full URL already
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        // Windows backslash ko forward slash karo
        const cleanPath = path.replace(/\\/g, '/');

        // Extra slash handle karo
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

        return `${API_URL}${finalPath}`;
    };

    // ============================================
    // HELPERS
    // ============================================
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'draft': { class: 'status-draft', label: 'Draft', icon: <FaFileAlt /> },
            'submitted': { class: 'status-submitted', label: 'Submitted', icon: <FaClock /> },
            'under-review': { class: 'status-review', label: 'Under Review', icon: <FaHourglassHalf /> },
            'pending-documents': { class: 'status-pending', label: 'Pending Documents', icon: <FaExclamationTriangle /> },
            'approved': { class: 'status-approved', label: 'Approved', icon: <FaCheckCircle /> },
            'rejected': { class: 'status-rejected', label: 'Rejected', icon: <FaTimesCircle /> },
            'scholarship-disbursed': { class: 'status-disbursed', label: 'Scholarship Disbursed', icon: <FaCheckCircle /> }
        };
        return statusMap[status] || statusMap['submitted'];
    };

    // ============================================
    // DOCUMENT RENDERER
    // ============================================
    const renderDoc = (label, path) => {
        if (!path) {
            return (
                <div className="doc-item empty">
                    <FaFileAlt className="doc-icon" />
                    <div className="doc-info">
                        <span className="doc-label">{label}</span>
                        <span className="doc-status empty-text">Not Uploaded</span>
                    </div>
                </div>
            );
        }

        return (
            <a
                href={getFileUrl(path)}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-item uploaded"
            >
                <FaFileAlt className="doc-icon" />
                <div className="doc-info">
                    <span className="doc-label">{label}</span>
                    <span className="doc-status uploaded-text">
                        <FaCheckCircle /> Uploaded
                    </span>
                </div>
                <FaDownload className="download-icon" />
            </a>
        );
    };

    // ============================================
    // LOADING STATE
    // ============================================
    if (loading) {
        return (
            <div className="ViewApplication">
                <div className="loading-state">
                    <FaSpinner className="spinner-large" />
                    <p>Loading application details...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // ERROR STATE
    // ============================================
    if (serverError || !application) {
        return (
            <div className="ViewApplication">
                <div className="error-state">
                    <FaExclamationTriangle className="error-icon-large" />
                    <h2>Application Not Found</h2>
                    <p>{serverError || 'The application you are looking for does not exist'}</p>
                    <button
                        className="back-btn"
                        onClick={() => navigate('/agent/my-applications')}
                    >
                        <FaArrowLeft /> Back to Applications
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(application.status);
    const canEdit = !['approved', 'scholarship-disbursed'].includes(application.status);

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="ViewApplication">
            <div className="view-container">

                {/* ===== HEADER ===== */}
                <div className="view-header">
                    <button
                        className="back-icon-btn"
                        onClick={() => navigate('/agent/my-applications')}
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="header-info">
                        <div className="header-title">
                            <h1>Application Details</h1>
                            <span className="app-number">{application.applicationNumber}</span>
                        </div>
                        <span className={`status-badge ${statusInfo.class}`}>
                            {statusInfo.icon} {statusInfo.label}
                        </span>
                    </div>
                    <div className="header-actions">
                        {canEdit && (
                            <button
                                className="edit-action-btn"
                                onClick={() => navigate(`/agent/edit-application/${application._id}`)}
                            >
                                <FaEdit /> Edit
                            </button>
                        )}
                        <button
                            className="print-action-btn"
                            onClick={() => window.print()}
                        >
                            <FaPrint /> Print
                        </button>
                    </div>
                </div>

                {/* ===== TIMELINE ===== */}
                <div className="timeline-card">
                    <div className="timeline-item">
                        <div className="timeline-dot active"></div>
                        <div className="timeline-content">
                            <span>Submitted</span>
                            <strong>{formatDateTime(application.submittedAt || application.createdAt)}</strong>
                        </div>
                    </div>
                    <div className="timeline-line"></div>
                    <div className="timeline-item">
                        <div className={`timeline-dot ${application.status !== 'submitted' ? 'active' : ''}`}></div>
                        <div className="timeline-content">
                            <span>Current Status</span>
                            <strong>{statusInfo.label}</strong>
                        </div>
                    </div>
                </div>

                {/* ===== STUDENT INFO ===== */}
                <div className="info-card">
                    <div className="card-header">
                        <FaUserGraduate className="card-icon" />
                        <h2>Student Information</h2>
                    </div>

                    <div className="student-profile">
                        {application.student?.profileImage ? (
                            <img
                                src={getFileUrl(application.student.profileImage)}
                                alt="Profile"
                                className="student-photo"
                            />
                        ) : (
                            <div className="student-photo placeholder">
                                <FaUserGraduate />
                            </div>
                        )}
                        <div className="student-basic">
                            <h3>{application.student?.firstName} {application.student?.lastName}</h3>
                            <div className="basic-info">
                                <span><FaEnvelope /> {application.student?.email}</span>
                                <span><FaPhone /> {application.student?.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Date of Birth</span>
                            <span className="info-value">{formatDate(application.student?.dateOfBirth)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Gender</span>
                            <span className="info-value">{application.student?.gender}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Category</span>
                            <span className="info-value">{application.student?.category}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Nationality</span>
                            <span className="info-value">{application.student?.nationality}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Father's Name</span>
                            <span className="info-value">{application.student?.fatherName || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Mother's Name</span>
                            <span className="info-value">{application.student?.motherName || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Annual Income</span>
                            <span className="info-value">
                                {application.student?.annualIncome
                                    ? `₹ ${Number(application.student.annualIncome).toLocaleString('en-IN')}`
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Guardian Phone</span>
                            <span className="info-value">{application.student?.guardianPhone || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="address-section">
                        <span className="section-subtitle">
                            <FaMapMarkerAlt /> Address
                        </span>
                        <p className="address-text">
                            {application.student?.address}<br />
                            {application.student?.city}, {application.student?.state} - {application.student?.pincode}<br />
                            {application.student?.country}
                        </p>
                    </div>
                </div>

                {/* ===== ACADEMIC INFO ===== */}
                <div className="info-card">
                    <div className="card-header">
                        <FaBook className="card-icon" />
                        <h2>Academic Information</h2>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Previous Education</span>
                            <span className="info-value">{application.academic?.previousEducation || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Previous Institute</span>
                            <span className="info-value">{application.academic?.previousInstitute || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Passing Year</span>
                            <span className="info-value">{application.academic?.passingYear || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Percentage</span>
                            <span className="info-value">
                                {application.academic?.percentage ? `${application.academic.percentage}%` : 'N/A'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">GPA</span>
                            <span className="info-value">{application.academic?.gpa || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* ===== UNIVERSITY & PROGRAM ===== */}
                <div className="info-card highlight">
                    <div className="card-header">
                        <FaUniversity className="card-icon" />
                        <h2>University & Program</h2>
                    </div>

                    <div className="university-info">
                        <div className="uni-block">
                            <span className="info-label">University</span>
                            <h3>{application.universityName || 'N/A'}</h3>
                            {application.university?.city && (
                                <span className="uni-location">
                                    <FaMapMarkerAlt /> {application.university.city}, {application.university.state}
                                </span>
                            )}
                        </div>

                        <div className="program-block">
                            <span className="info-label">Program</span>
                            <h3>
                                <FaGraduationCap /> {application.programName || 'N/A'}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* ===== STATEMENT ===== */}
                <div className="info-card">
                    <div className="card-header">
                        <FaFileAlt className="card-icon" />
                        <h2>Statement</h2>
                    </div>

                    <div className="statement-block">
                        <span className="info-label">Why does this student deserve this scholarship?</span>
                        <p className="statement-text">
                            {application.statement?.whyDeserve || 'N/A'}
                        </p>
                    </div>

                    {application.statement?.achievements && (
                        <div className="statement-block">
                            <span className="info-label">Achievements</span>
                            <p className="statement-text">{application.statement.achievements}</p>
                        </div>
                    )}
                </div>

                {/* ===== BANK DETAILS ===== */}
                {application.bankDetails?.accountNumber && (
                    <div className="info-card">
                        <div className="card-header">
                            <FaMoneyBillWave className="card-icon" />
                            <h2>Bank Details</h2>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Account Holder</span>
                                <span className="info-value">{application.bankDetails.accountHolderName}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Account Number</span>
                                <span className="info-value">{application.bankDetails.accountNumber}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">IFSC Code</span>
                                <span className="info-value">{application.bankDetails.ifscCode}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Bank Name</span>
                                <span className="info-value">{application.bankDetails.bankName}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Branch</span>
                                <span className="info-value">{application.bankDetails.branchName}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== DOCUMENTS ===== */}
                <div className="info-card">
                    <div className="card-header">
                        <FaFolderOpen className="card-icon" />
                        <h2>Documents</h2>
                    </div>

                    {/* Basic Documents */}
                    <div className="docs-section">
                        <h4 className="docs-subtitle">Basic Documents</h4>
                        <div className="docs-grid">
                            {renderDoc('Profile Photo', application.documents?.profilePhoto)}
                            {renderDoc('ID Proof', application.documents?.idProof)}
                            {renderDoc('Marksheet', application.documents?.marksheet)}
                            {renderDoc('Income Certificate', application.documents?.incomeCertificate)}
                            {renderDoc('Previous Certificate', application.documents?.previousCertificate)}
                            {renderDoc('Bank Passbook', application.documents?.bankPassbook)}
                        </div>
                    </div>

                    {/* Additional Documents */}
                    <div className="docs-section">
                        <h4 className="docs-subtitle">Additional Documents</h4>
                        <div className="docs-grid">
                            {renderDoc('Dependent Passport', application.documents?.dependentPassport1)}
                            {renderDoc('Sponsor Details', application.documents?.sponsorDetails)}
                            {renderDoc('Bank Statement Letter', application.documents?.bankStatementLetter)}
                            {renderDoc('Visa Copies', application.documents?.visaCopies)}
                            {renderDoc('Pending Document', application.documents?.pendingDocument)}
                            {renderDoc('Visa Document', application.documents?.visaDocument)}
                            {renderDoc('Study Continuous Letter', application.documents?.studyContinuousLetter)}
                            {renderDoc('Dependent Passport 2', application.documents?.dependentPassport2)}
                            {renderDoc('Transfer Students', application.documents?.transferStudents)}
                        </div>
                    </div>

                    {/* Conditional Letter & Invoice */}
                    <div className="docs-section">
                        <h4 className="docs-subtitle">Conditional Letter & Invoice</h4>
                        <div className="docs-grid">
                            {renderDoc('Signed CAL', application.documents?.signedCAL)}
                            {renderDoc('Payment Invoice', application.documents?.paymentInvoice)}
                        </div>
                    </div>

                    {/* Payment Receipts */}
                    <div className="docs-section">
                        <h4 className="docs-subtitle">Submit Payment Receipt</h4>
                        <div className="docs-grid">
                            {renderDoc('Application Fee Receipt', application.documents?.applicationFeeReceipt)}
                            {renderDoc('English Exam Receipt', application.documents?.englishExamReceipt)}
                            {renderDoc('Internal Admission Fee', application.documents?.internalAdmissionFee)}
                            {renderDoc('Bank Check / Draft', application.documents?.bankCheckDraft)}
                            {renderDoc('Insurance Fee', application.documents?.insuranceFee)}
                            {renderDoc('Tuition Fee', application.documents?.tuitionFee)}
                        </div>
                    </div>

                    {/* Final Admission Portfolio */}
                    <div className="docs-section">
                        <h4 className="docs-subtitle">Final Admission Portfolio</h4>
                        <div className="docs-grid">
                            {renderDoc('Signed CAL', application.documents?.finalSignedCAL)}
                            {renderDoc('Payment Invoice', application.documents?.finalPaymentInvoice)}
                            {renderDoc('Initial Admission Portfolio', application.documents?.initialAdmissionPortfolio)}
                            {renderDoc('Deferral Admission Portfolio', application.documents?.deferralAdmissionPortfolio)}
                        </div>
                    </div>
                </div>

                {/* ===== ADMIN REMARKS ===== */}
                {(application.adminRemarks || application.rejectionReason) && (
                    <div className="info-card remarks-card">
                        <div className="card-header">
                            <FaExclamationTriangle className="card-icon" />
                            <h2>Admin Remarks</h2>
                        </div>
                        {application.adminRemarks && (
                            <p className="remarks-text">{application.adminRemarks}</p>
                        )}
                        {application.rejectionReason && (
                            <p className="remarks-text rejection">
                                <strong>Rejection Reason:</strong> {application.rejectionReason}
                            </p>
                        )}
                    </div>
                )}

                {/* ===== FOOTER ACTIONS ===== */}
                <div className="footer-actions">
                    <button
                        className="back-btn"
                        onClick={() => navigate('/agent/my-applications')}
                    >
                        <FaArrowLeft /> Back to Applications
                    </button>

                    {canEdit && (
                        <button
                            className="edit-btn"
                            onClick={() => navigate(`/agent/edit-application/${application._id}`)}
                        >
                            <FaEdit /> Edit Application
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewApplication;