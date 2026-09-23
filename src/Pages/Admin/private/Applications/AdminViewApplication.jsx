// src/Pages/Admin/Applications/AdminViewApplication.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminViewApplication.css';
import adminApi from '../../../../api/adminApi';
import api, { API_URL, SERVER_URL, getFileUrl as configGetFileUrl } from '../../../../api/config';
import {
    FaArrowLeft, FaUserGraduate, FaUniversity, FaGraduationCap,
    FaFileAlt, FaMoneyBillWave, FaCheckCircle, FaClock,
    FaTimesCircle, FaSpinner, FaExclamationTriangle,
    FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope,
    FaFolderOpen, FaDownload, FaPrint, FaHourglassHalf,
    FaUser, FaBook, FaRedo, FaTimes, FaHistory, FaUserTie,
    FaLink, FaExternalLinkAlt, FaImage, FaFilePdf,
    FaCloudDownloadAlt
} from 'react-icons/fa';

const AdminViewApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // STATE
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Action modal
    const [actionModal, setActionModal] = useState({
        show: false,
        type: '',
        remarks: '',
        loading: false
    });

    // ===== Download States =====
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
    const [downloadingField, setDownloadingField] = useState(null);

    // ===== Image Preview Modal =====
    const [previewImage, setPreviewImage] = useState(null);

    // ============================================
    // FETCH
    // ============================================
    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        setLoading(true);
        setServerError('');
        try {
            const response = await adminApi.applications.getById(id);
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
    // HELPERS
    // ============================================
    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${API_URL}${finalPath}`;
    };

    const isExternalUrl = (path) => {
        if (!path) return false;
        return path.startsWith('http://') || path.startsWith('https://');
    };

    const isImageFile = (path) => {
        if (!path) return false;
        const lower = path.toLowerCase();
        return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(lower) ||
            /\.(jpg|jpeg|png|webp)\?/i.test(lower);
    };

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

    const canTakeAction = (status) => {
        return ['submitted', 'under-review', 'pending-documents'].includes(status);
    };

    // ============================================
    // ✅ DOWNLOAD SINGLE FILE
    // ============================================
    const generateFileName = (label, path) => {
        const studentName = `${application?.student?.firstName || 'Student'}_${application?.student?.lastName || ''}`.trim();
        const appNumber = application?.applicationNumber || 'App';
        const safeLabel = label.replace(/[^a-zA-Z0-9]/g, '_');

        let ext = '';
        if (path && !isExternalUrl(path)) {
            const parts = path.split('.');
            if (parts.length > 1) ext = '.' + parts.pop().split('?')[0];
        }
        if (!ext) ext = '.pdf';
        return `${appNumber}_${studentName}_${safeLabel}${ext}`;
    };

    const triggerDownload = (blob, fileName) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    };

    const downloadFile = async (label, path, isDownloadAll = false) => {
        if (!path) return;
        const fileName = generateFileName(label, path);

        try {
            if (!isDownloadAll) setDownloadingField(label);

            // ===== EXTERNAL URL =====
            if (isExternalUrl(path)) {
                let downloadUrl = path;

                // Google Drive direct download
                const driveMatch = path.match(/\/file\/d\/([^/]+)/);
                if (driveMatch) {
                    downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
                }

                try {
                    const response = await fetch(downloadUrl, { mode: 'cors' });
                    if (response.ok) {
                        const blob = await response.blob();
                        triggerDownload(blob, fileName);
                    } else {
                        window.open(path, '_blank');
                    }
                } catch (fetchError) {
                    console.warn('CORS blocked, opening in new tab:', fetchError);
                    window.open(path, '_blank');
                }
                return;
            }

            // ===== LOCAL FILE =====
            const fileUrl = getFileUrl(path);
            const response = await fetch(fileUrl);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            if (blob.type === 'application/json') throw new Error('File not found on server');

            triggerDownload(blob, fileName);
        } catch (error) {
            console.error(`❌ Download failed for ${label}:`, error);
            const url = isExternalUrl(path) ? path : getFileUrl(path);
            window.open(url, '_blank');
        } finally {
            if (!isDownloadAll) setTimeout(() => setDownloadingField(null), 500);
        }
    };

    // ============================================
    // ✅ DOWNLOAD ALL DOCUMENTS
    // ============================================
    const downloadAllDocuments = async () => {
        if (!application?.documents) return;
        const docs = application.documents;

        const docList = [
            { label: 'Profile Photo', path: docs.profilePhoto },
            { label: 'ID Proof', path: docs.idProof },
            { label: 'Marksheet', path: docs.marksheet },
            { label: 'Income Certificate', path: docs.incomeCertificate },
            { label: 'Previous Certificate', path: docs.previousCertificate },
            { label: 'Bank Passbook', path: docs.bankPassbook },
            { label: 'Dependent Passport', path: docs.dependentPassport1 },
            { label: 'Sponsor Details', path: docs.sponsorDetails },
            { label: 'Bank Statement Letter', path: docs.bankStatementLetter },
            { label: 'Visa Copies', path: docs.visaCopies },
            { label: 'Pending Document', path: docs.pendingDocument },
            { label: 'Visa Document', path: docs.visaDocument },
            { label: 'Study Continuous Letter', path: docs.studyContinuousLetter },
            { label: 'Dependent Passport 2', path: docs.dependentPassport2 },
            { label: 'Transfer Students', path: docs.transferStudents },
            { label: 'Signed CAL', path: docs.signedCAL },
            { label: 'Payment Invoice', path: docs.paymentInvoice },
            { label: 'Application Fee Receipt', path: docs.applicationFeeReceipt },
            { label: 'English Exam Receipt', path: docs.englishExamReceipt },
            { label: 'Internal Admission Fee', path: docs.internalAdmissionFee },
            { label: 'Bank Check Draft', path: docs.bankCheckDraft },
            { label: 'Insurance Fee', path: docs.insuranceFee },
            { label: 'Tuition Fee', path: docs.tuitionFee },
            { label: 'Final Signed CAL', path: docs.finalSignedCAL },
            { label: 'Final Payment Invoice', path: docs.finalPaymentInvoice },
            { label: 'Initial Admission Portfolio', path: docs.initialAdmissionPortfolio },
            { label: 'Deferral Admission Portfolio', path: docs.deferralAdmissionPortfolio }
        ].filter(d => d.path);

        if (docList.length === 0) {
            alert('No documents available to download');
            return;
        }

        setDownloadingAll(true);
        setDownloadProgress({ current: 0, total: docList.length });

        for (let i = 0; i < docList.length; i++) {
            setDownloadProgress({ current: i + 1, total: docList.length });
            try {
                await downloadFile(docList[i].label, docList[i].path, true);
            } catch (err) {
                console.error(`Failed: ${docList[i].label}`, err);
            }
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        setDownloadingAll(false);
        setDownloadProgress({ current: 0, total: 0 });
    };

    // ============================================
    // ACTION HANDLERS
    // ============================================
    const openActionModal = (type) => {
        setActionModal({
            show: true,
            type,
            remarks: '',
            loading: false
        });
    };

    const closeActionModal = () => {
        setActionModal({
            show: false,
            type: '',
            remarks: '',
            loading: false
        });
    };

    const handleAction = async () => {
        const { type, remarks } = actionModal;

        if ((type === 'reject' || type === 'review') && !remarks.trim()) {
            alert(`${type === 'reject' ? 'Rejection reason' : 'Review remarks'} is required`);
            return;
        }

        setActionModal(prev => ({ ...prev, loading: true }));

        try {
            let response;

            if (type === 'approve') {
                response = await adminApi.applications.approve(application._id, remarks);
            } else if (type === 'reject') {
                response = await adminApi.applications.reject(application._id, remarks);
            } else if (type === 'review') {
                response = await adminApi.applications.review(application._id, remarks);
            }

            if (response.success) {
                setSuccessMessage(response.message || 'Action completed');
                closeActionModal();
                fetchApplication();
                setTimeout(() => setSuccessMessage(''), 4000);
            }
        } catch (error) {
            console.error('❌ Action error:', error);
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setActionModal(prev => ({ ...prev, loading: false }));
        }
    };

    // ============================================
    // ✅ DOCUMENT RENDERER (with URL + Download + Preview)
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

        const external = isExternalUrl(path);
        const isImage = isImageFile(path);
        const fileUrl = getFileUrl(path);
        const isDownloading = downloadingField === label;

        return (
            <div className="doc-item uploaded">
                <div className="doc-icon-wrap">
                    {isImage ? <FaImage className="doc-icon" /> : <FaFilePdf className="doc-icon" />}
                    {external && <FaLink className="doc-link-badge" title="External URL" />}
                </div>
                <div className="doc-info">
                    <span className="doc-label">{label}</span>
                    <span className="doc-status uploaded-text">
                        <FaCheckCircle /> {external ? 'URL Provided' : 'Uploaded'}
                    </span>
                </div>
                <div className="doc-actions">
                    {/* PREVIEW / OPEN */}
                    {isImage ? (
                        <button
                            type="button"
                            className="doc-btn preview"
                            onClick={() => setPreviewImage({ url: fileUrl, label })}
                            title="Preview"
                        >
                            <FaImage />
                        </button>
                    ) : (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="doc-btn preview"
                            title="Open in new tab"
                        >
                            <FaExternalLinkAlt />
                        </a>
                    )}

                    {/* DOWNLOAD */}
                    <button
                        type="button"
                        className="doc-btn download"
                        onClick={() => downloadFile(label, path)}
                        disabled={isDownloading}
                        title="Download"
                    >
                        {isDownloading ? (
                            <FaSpinner className="spinner-small" />
                        ) : (
                            <FaDownload />
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // ============================================
    // LOADING
    // ============================================
    if (loading) {
        return (
            <div className="AdminViewApplication">
                <div className="loading-state">
                    <FaSpinner className="spinner-large" />
                    <p>Loading application details...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // ERROR
    // ============================================
    if (serverError || !application) {
        return (
            <div className="AdminViewApplication">
                <div className="error-state">
                    <FaExclamationTriangle className="error-icon-large" />
                    <h2>Application Not Found</h2>
                    <p>{serverError || 'The application does not exist'}</p>
                    <button className="back-btn" onClick={() => navigate('/admin/applications')}>
                        <FaArrowLeft /> Back to Applications
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(application.status);
    const canAct = canTakeAction(application.status);

    // ===== Available documents count =====
    const docs = application.documents || {};
    const availableDocsCount = Object.values(docs).filter(
        v => v && typeof v === 'string' && v.length > 0
    ).length;

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="AdminViewApplication">
            <div className="view-container" id="printable-area">

                {/* ===== HEADER ===== */}
                <div className="view-header no-print">
                    <button
                        className="back-icon-btn"
                        onClick={() => navigate('/admin/applications')}
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
                        <button className="print-action-btn" onClick={() => window.print()}>
                            <FaPrint /> Print
                        </button>
                    </div>
                </div>

                {/* ===== PRINT-ONLY HEADER ===== */}
                <div className="print-only-header">
                    <h1>Student Scholarship Application</h1>
                    <p><strong>Application No:</strong> {application.applicationNumber}</p>
                    <p><strong>Status:</strong> {statusInfo.label}</p>
                    <p><strong>Printed On:</strong> {new Date().toLocaleString('en-IN')}</p>
                </div>

                {/* ===== SUCCESS MESSAGE ===== */}
                {successMessage && (
                    <div className="success-message no-print">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

                {/* ===== AGENT CARD ===== */}
                <div className="info-card agent-card">
                    <div className="card-header">
                        <FaUserTie className="card-icon" />
                        <h2>Submitted By Agent</h2>
                    </div>
                    <div className="agent-info">
                        <div className="agent-avatar">
                            {application.agentName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="agent-details">
                            <h3>{application.agentName || 'N/A'}</h3>
                            <div className="basic-info">
                                <span><FaEnvelope /> {application.agentEmail || 'N/A'}</span>
                                <span><FaPhone /> {application.agentPhone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== TIMELINE ===== */}
                {application.statusHistory && application.statusHistory.length > 0 && (
                    <div className="info-card timeline-card">
                        <div className="card-header">
                            <FaHistory className="card-icon" />
                            <h2>Status Timeline</h2>
                        </div>
                        <div className="timeline-list">
                            {application.statusHistory.map((h, i) => (
                                <div key={i} className="timeline-entry">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-details">
                                        <div className="timeline-status">
                                            {getStatusInfo(h.status).icon}
                                            <strong>{getStatusInfo(h.status).label}</strong>
                                        </div>
                                        <span className="timeline-date">{formatDateTime(h.changedAt)}</span>
                                        {h.remarks && <p className="timeline-remarks">{h.remarks}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                                onClick={() => setPreviewImage({
                                    url: getFileUrl(application.student.profileImage),
                                    label: 'Profile Photo'
                                })}
                                style={{ cursor: 'pointer' }}
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

                {/* ===== ACADEMIC ===== */}
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
                        <p className="statement-text">{application.statement?.whyDeserve || 'N/A'}</p>
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
                    <div className="card-header between">
                        <div className="header-left">
                            <FaFolderOpen className="card-icon" />
                            <h2>Documents</h2>
                            {availableDocsCount > 0 && (
                                <span className="docs-count-badge">{availableDocsCount} available</span>
                            )}
                        </div>

                        {availableDocsCount > 0 && (
                            <button
                                type="button"
                                className="download-all-btn no-print"
                                onClick={downloadAllDocuments}
                                disabled={downloadingAll}
                            >
                                {downloadingAll ? (
                                    <>
                                        <FaSpinner className="spinner-small" />
                                        {downloadProgress.current}/{downloadProgress.total}...
                                    </>
                                ) : (
                                    <>
                                        <FaCloudDownloadAlt />
                                        Download All
                                    </>
                                )}
                            </button>
                        )}
                    </div>

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

                    <div className="docs-section">
                        <h4 className="docs-subtitle">Conditional Letter & Invoice</h4>
                        <div className="docs-grid">
                            {renderDoc('Signed CAL', application.documents?.signedCAL)}
                            {renderDoc('Payment Invoice', application.documents?.paymentInvoice)}
                        </div>
                    </div>

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

                {/* ===== ACTION BUTTONS ===== */}
                {canAct && (
                    <div className="action-panel no-print">
                        <h3>Take Action</h3>
                        <div className="action-buttons">
                            <button
                                className="big-action-btn approve"
                                onClick={() => openActionModal('approve')}
                            >
                                <FaCheckCircle />
                                <span>Approve</span>
                                <small>Accept application</small>
                            </button>

                            <button
                                className="big-action-btn review"
                                onClick={() => openActionModal('review')}
                            >
                                <FaRedo />
                                <span>Review</span>
                                <small>Send back for corrections</small>
                            </button>

                            <button
                                className="big-action-btn reject"
                                onClick={() => openActionModal('reject')}
                            >
                                <FaTimesCircle />
                                <span>Reject</span>
                                <small>Decline application</small>
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== FOOTER ===== */}
                <div className="footer-actions no-print">
                    <button
                        className="back-btn"
                        onClick={() => navigate('/admin/applications')}
                    >
                        <FaArrowLeft /> Back to Applications
                    </button>
                </div>
            </div>

            {/* ===== IMAGE PREVIEW MODAL ===== */}
            {previewImage && (
                <div
                    className="image-preview-modal no-print"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="preview-content" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3>{previewImage.label}</h3>
                            <div className="preview-actions">
                                <button
                                    type="button"
                                    className="preview-btn download"
                                    onClick={() => downloadFile(previewImage.label, previewImage.url)}
                                    title="Download"
                                >
                                    <FaDownload />
                                </button>
                                <a
                                    href={previewImage.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="preview-btn open"
                                    title="Open in new tab"
                                >
                                    <FaExternalLinkAlt />
                                </a>
                                <button
                                    type="button"
                                    className="preview-btn close"
                                    onClick={() => setPreviewImage(null)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>
                        <div className="preview-body">
                            <img
                                src={previewImage.url}
                                alt={previewImage.label}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ACTION MODAL ===== */}
            {actionModal.show && (
                <div className="modal-overlay no-print" onClick={closeActionModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className={`modal-header ${actionModal.type}`}>
                            <h2>
                                {actionModal.type === 'approve' && <>✅ Approve Application</>}
                                {actionModal.type === 'reject' && <>❌ Reject Application</>}
                                {actionModal.type === 'review' && <>🔄 Send Back for Review</>}
                            </h2>
                            <button className="close-btn" onClick={closeActionModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-app-info">
                                <div><span>Application:</span> <strong>{application.applicationNumber}</strong></div>
                                <div><span>Student:</span> <strong>{application.student?.firstName} {application.student?.lastName}</strong></div>
                                <div><span>Agent:</span> <strong>{application.agentName}</strong></div>
                            </div>

                            <div className="modal-message">
                                {actionModal.type === 'approve' && (
                                    <p className="info-text">
                                        This will <strong>approve</strong> the application and notify the agent via email.
                                    </p>
                                )}
                                {actionModal.type === 'reject' && (
                                    <p className="warning-text">
                                        This will <strong>reject</strong> the application. Agent will receive the reason via email.
                                    </p>
                                )}
                                {actionModal.type === 'review' && (
                                    <p className="review-text">
                                        Application will be sent back to agent for <strong>corrections</strong>.
                                    </p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>
                                    {actionModal.type === 'approve' && 'Remarks (Optional)'}
                                    {actionModal.type === 'reject' && 'Rejection Reason *'}
                                    {actionModal.type === 'review' && 'Review Remarks *'}
                                </label>
                                <textarea
                                    placeholder={
                                        actionModal.type === 'approve' ? 'Additional notes...' :
                                            actionModal.type === 'reject' ? 'Why is this being rejected?' :
                                                'What changes are needed?'
                                    }
                                    rows="4"
                                    value={actionModal.remarks}
                                    onChange={(e) => setActionModal(prev => ({ ...prev, remarks: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="modal-btn cancel"
                                onClick={closeActionModal}
                                disabled={actionModal.loading}
                            >
                                Cancel
                            </button>
                            <button
                                className={`modal-btn primary ${actionModal.type}`}
                                onClick={handleAction}
                                disabled={actionModal.loading}
                            >
                                {actionModal.loading ? (
                                    <><FaSpinner className="spinner" /> Processing...</>
                                ) : (
                                    <>
                                        {actionModal.type === 'approve' && <><FaCheckCircle /> Approve & Notify</>}
                                        {actionModal.type === 'reject' && <><FaTimesCircle /> Reject & Notify</>}
                                        {actionModal.type === 'review' && <><FaRedo /> Send Back</>}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminViewApplication;