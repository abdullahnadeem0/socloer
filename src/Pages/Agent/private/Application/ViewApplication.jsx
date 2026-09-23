// src/Pages/Agent/private/Application/ViewApplication.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewApplication.css';
import agentApi from '../../../../api/agentApi';
import api, { API_URL, SERVER_URL, getFileUrl as configGetFileUrl } from '../../../../api/config';
import {
    FaArrowLeft, FaEdit, FaUserGraduate, FaUniversity,
    FaGraduationCap, FaFileAlt, FaMoneyBillWave,
    FaCheckCircle, FaClock, FaTimesCircle, FaSpinner,
    FaExclamationTriangle, FaCalendarAlt, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaFolderOpen,
    FaDownload, FaPrint, FaHourglassHalf, FaUser, FaBook,
    FaLink, FaExternalLinkAlt, FaImage, FaFilePdf, FaTimes,
    FaCloudDownloadAlt
} from 'react-icons/fa';

const ViewApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ===== STATE =====
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');

    // Download states
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
    const [downloadingField, setDownloadingField] = useState(null);

    // Image preview modal
    const [previewImage, setPreviewImage] = useState(null);

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
    // GET FILE URL
    // ============================================
    const getFileUrl = (path) => {
        if (!path) return null;

        // Full URL already
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        // Windows backslash → forward slash
        const cleanPath = path.replace(/\\/g, '/');
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

        return `${API_URL}${finalPath}`;
    };

    // ============================================
    // CHECK IF FILE IS EXTERNAL URL
    // ============================================
    const isExternalUrl = (path) => {
        if (!path) return false;
        return path.startsWith('http://') || path.startsWith('https://');
    };

    // ============================================
    // CHECK IF FILE IS IMAGE
    // ============================================
    const isImageFile = (path) => {
        if (!path) return false;
        const lower = path.toLowerCase();
        return (
            lower.endsWith('.jpg') ||
            lower.endsWith('.jpeg') ||
            lower.endsWith('.png') ||
            lower.endsWith('.gif') ||
            lower.endsWith('.webp') ||
            lower.includes('.jpg?') ||
            lower.includes('.jpeg?') ||
            lower.includes('.png?') ||
            lower.includes('.webp?')
        );
    };

    // ============================================
    // GENERATE SAFE FILENAME
    // ============================================
    const generateFileName = (label, path) => {
        const studentName = `${application?.student?.firstName || 'Student'}_${application?.student?.lastName || ''}`.trim();
        const appNumber = application?.applicationNumber || 'App';
        const safeLabel = label.replace(/[^a-zA-Z0-9]/g, '_');

        // Try to get extension from path
        let ext = '';
        if (path && !isExternalUrl(path)) {
            const parts = path.split('.');
            if (parts.length > 1) {
                ext = '.' + parts.pop().split('?')[0];
            }
        }

        if (!ext) ext = '.pdf'; // default

        return `${appNumber}_${studentName}_${safeLabel}${ext}`;
    };

    // ============================================
    // DOWNLOAD A SINGLE FILE TO LOCAL STORAGE
    // ============================================
    const downloadFile = async (label, path, isDownloadAll = false) => {
        if (!path) return;

        const fileName = generateFileName(label, path);

        try {
            if (!isDownloadAll) {
                setDownloadingField(label);
            }

            // ===== EXTERNAL URL =====
            if (isExternalUrl(path)) {
                // For Google Drive links, convert to direct download
                let downloadUrl = path;

                // Google Drive: /file/d/ID/view → /file/d/ID/export?download
                const driveMatch = path.match(/\/file\/d\/([^/]+)/);
                if (driveMatch) {
                    downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
                }

                // Try to fetch as blob for download
                try {
                    const response = await fetch(downloadUrl, { mode: 'cors' });
                    if (response.ok) {
                        const blob = await response.blob();
                        triggerDownload(blob, fileName);
                    } else {
                        // Fallback: open in new tab
                        window.open(path, '_blank');
                    }
                } catch (fetchError) {
                    // CORS blocked → fallback: open in new tab
                    console.warn('CORS blocked, opening in new tab:', fetchError);
                    window.open(path, '_blank');
                }
                return;
            }

            // ===== LOCAL FILE =====
            const fileUrl = getFileUrl(path);
            const response = await fetch(fileUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();

            // If it's a JSON error response, don't download
            if (blob.type === 'application/json') {
                throw new Error('File not found on server');
            }

            triggerDownload(blob, fileName);

        } catch (error) {
            console.error(`❌ Download failed for ${label}:`, error);

            // Fallback: open in new tab
            const url = isExternalUrl(path) ? path : getFileUrl(path);
            window.open(url, '_blank');
        } finally {
            if (!isDownloadAll) {
                setTimeout(() => setDownloadingField(null), 500);
            }
        }
    };

    // ============================================
    // TRIGGER BROWSER DOWNLOAD
    // ============================================
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

    // ============================================
    // DOWNLOAD ALL DOCUMENTS
    // ============================================
    const downloadAllDocuments = async () => {
        if (!application?.documents) return;

        const docs = application.documents;

        // Build list of all available docs
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
        ].filter(d => d.path); // Only available docs

        if (docList.length === 0) {
            alert('No documents available to download');
            return;
        }

        setDownloadingAll(true);
        setDownloadProgress({ current: 0, total: docList.length });

        // Download sequentially with delay (avoid browser blocking)
        for (let i = 0; i < docList.length; i++) {
            const doc = docList[i];
            setDownloadProgress({ current: i + 1, total: docList.length });

            try {
                await downloadFile(doc.label, doc.path, true);
            } catch (err) {
                console.error(`Failed: ${doc.label}`, err);
            }

            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        setDownloadingAll(false);
        setDownloadProgress({ current: 0, total: 0 });
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
    // ✅ RENDER DOCUMENT (with download + preview)
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
                    {/* PREVIEW */}
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
                        title="Download to device"
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

    // Count available documents
    const docs = application.documents || {};
    const availableDocsCount = [
        docs.profilePhoto, docs.idProof, docs.marksheet, docs.incomeCertificate,
        docs.previousCertificate, docs.bankPassbook, docs.dependentPassport1,
        docs.sponsorDetails, docs.bankStatementLetter, docs.visaCopies,
        docs.pendingDocument, docs.visaDocument, docs.studyContinuousLetter,
        docs.dependentPassport2, docs.transferStudents, docs.signedCAL,
        docs.paymentInvoice, docs.applicationFeeReceipt, docs.englishExamReceipt,
        docs.internalAdmissionFee, docs.bankCheckDraft, docs.insuranceFee,
        docs.tuitionFee, docs.finalSignedCAL, docs.finalPaymentInvoice,
        docs.initialAdmissionPortfolio, docs.deferralAdmissionPortfolio
    ].filter(Boolean).length;

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="ViewApplication">
            <div className="view-container" id="printable-area">

                {/* ===== HEADER ===== */}
                <div className="view-header no-print">
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
                            title="Print this page"
                        >
                            <FaPrint /> Print
                        </button>
                    </div>
                </div>

                {/* Print-only header */}
                <div className="print-only-header">
                    <h1>Student Scholarship Application</h1>
                    <p><strong>Application No:</strong> {application.applicationNumber}</p>
                    <p><strong>Status:</strong> {statusInfo.label}</p>
                    <p><strong>Printed On:</strong> {new Date().toLocaleString('en-IN')}</p>
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
                                        Downloading {downloadProgress.current}/{downloadProgress.total}...
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
                <div className="footer-actions no-print">
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
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIyIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIi8+PHBhdGggZD0iTTkuNSA5LjVhMS41IDEuNSAwIDEgMCAwLTMgMS41IDEuNSAwIDAgMCAwIDN6Ii8+PHBhdGggZD0iTTIxIDE1bC01LTVMMiAyMSIvPjwvc3ZnPg==';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewApplication;