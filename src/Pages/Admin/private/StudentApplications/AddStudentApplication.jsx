import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminApi from '../../../../api/adminApi';
import { getFileUrl } from '../../../../api/config';
import DocumentUpload from '../../../../Components/Upload/DocumentUpload';
import { 
    FaUser, FaUniversity, FaGraduationCap, FaBook,
    FaFileAlt, FaSave, FaCheckCircle, FaExclamationTriangle,
    FaSpinner, FaArrowLeft, FaPaperPlane, FaPlus,
    FaEnvelope, FaPhone, FaPassport, FaMapMarkerAlt,
    FaCalendarAlt, FaGlobe, FaUserGraduate, FaLanguage,
    FaFileInvoiceDollar, FaClipboardCheck, FaTimes
} from 'react-icons/fa';
import './AddStudentApplication.css';

const AddStudentApplication = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // ===== MASTER DATA =====
    const [universities, setUniversities] = useState([]);
    const [programs, setPrograms] = useState([]);

    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        middleName: '',
        lastName: '',
        nationality: '',
        homeCountry: '',
        address: '',
        dateOfBirth: '',
        passportNumber: '',
        email: '',
        phone: '',
        
        // Institute & Program
        university: '',
        program: '',
        intake: '',
        studyLevel: '',
        duration: '',
        
        // Last Education
        educationLevel: '',
        educationSubject: '',
        educationInstitute: '',
        educationResult: '',
        passingYear: '',
        
        // Language Proficiency
        languageIssuer: '',
        overallScore: '',
        readingWriting: '',
        listeningSpeaking: '',
        examType: ''
    });

    // ===== UPLOADED DOCUMENTS =====
    const [documents, setDocuments] = useState({
        // Basic Documents
        englishProficiency: '',
        passport: '',
        recommendationLetter: '',
        academicCertificate: '',
        applicantPhoto: '',
        updatedResume: '',
        statementOfPurpose: '',
        
        // Additional Documents
        dependentPassport: '',
        sponsorDetails: '',
        bankStatementLetter: '',
        visaCopies: '',
        pendingDocument: '',
        visaDocument: '',
        studyContinuousLetter: '',
        dependentPassport2nd: '',
        transferStudents: '',
        
        // Conditional
        signedCAL: '',
        paymentInvoice: '',
        
        // Payment Receipts
        applicationFee: '',
        englishExamFee: '',
        internalAdmissionFee: '',
        bankCheck: '',
        insuranceFee: '',
        tuitionFee: ''
    });

    const [uploading, setUploading] = useState({});
    const [errors, setErrors] = useState({});

    // ============================================
    // FETCH UNIVERSITIES
    // ============================================
    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            setPageLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.getAllUniversities(token);
            if (response.success) {
                setUniversities(response.universities || []);
            }
        } catch (error) {
            console.error('❌ Fetch universities:', error);
            showToast('Failed to load universities', 'error');
        } finally {
            setPageLoading(false);
        }
    };

    // ============================================
    // FETCH PROGRAMS ON UNIVERSITY CHANGE
    // ============================================
    useEffect(() => {
        if (formData.university) {
            fetchPrograms(formData.university);
        } else {
            setPrograms([]);
        }
    }, [formData.university]);

    const fetchPrograms = async (universityId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await adminApi.getProgramsByUniversity(universityId, token);
            if (response.success) {
                setPrograms(response.programs || []);
            }
        } catch (error) {
            console.error('❌ Fetch programs:', error);
        }
    };

    // ============================================
    // HANDLE CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // ============================================
    // HANDLE DOCUMENT UPLOAD (local preview)
    // ============================================
    const handleDocUpload = (field, file) => {
        // Just store the file locally for now, upload on submit
        setDocuments(prev => ({
            ...prev,
            [field]: {
                file: file,
                preview: URL.createObjectURL(file)
            }
        }));
    };

    const handleDocRemove = (field) => {
        setDocuments(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    // ============================================
    // TOAST
    // ============================================
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 4000);
    };

    // ============================================
    // VALIDATE
    // ============================================
    const validateForm = () => {
        const newErrors = {};

        // Personal
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.passportNumber.trim()) newErrors.passportNumber = 'Passport number is required';
        if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
        if (!formData.homeCountry.trim()) newErrors.homeCountry = 'Home country is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        // Institute
        if (!formData.university) newErrors.university = 'University is required';
        if (!formData.program) newErrors.program = 'Program is required';
        if (!formData.intake.trim()) newErrors.intake = 'Intake is required';

        return newErrors;
    };

    // ============================================
    // HANDLE SUBMIT
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showToast('Please fill all required fields', 'error');
            const firstError = document.querySelector('.error-text');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Personal Info
            formDataToSend.append('personalInfo', JSON.stringify({
                firstName: formData.firstName.trim(),
                middleName: formData.middleName.trim(),
                lastName: formData.lastName.trim(),
                nationality: formData.nationality.trim(),
                homeCountry: formData.homeCountry.trim(),
                address: formData.address.trim(),
                dateOfBirth: formData.dateOfBirth,
                passportNumber: formData.passportNumber.toUpperCase().trim(),
                email: formData.email.toLowerCase().trim(),
                phone: formData.phone.trim()
            }));

            // Institute Info
            formDataToSend.append('instituteInfo', JSON.stringify({
                university: formData.university,
                program: formData.program,
                intake: formData.intake.trim(),
                studyLevel: formData.studyLevel.trim(),
                duration: formData.duration.trim()
            }));

            // Last Education
            formDataToSend.append('lastEducation', JSON.stringify({
                level: formData.educationLevel,
                subject: formData.educationSubject,
                institute: formData.educationInstitute,
                result: formData.educationResult,
                passingYear: formData.passingYear
            }));

            // Language Proficiency
            formDataToSend.append('languageProficiency', JSON.stringify({
                issuer: formData.languageIssuer,
                overallScore: formData.overallScore,
                readingWriting: formData.readingWriting,
                listeningSpeaking: formData.listeningSpeaking,
                examType: formData.examType
            }));

            // Attach all document files
            Object.keys(documents).forEach(field => {
                const doc = documents[field];
                if (doc && doc.file) {
                    formDataToSend.append(`doc_${field}`, doc.file);
                }
            });

            const token = localStorage.getItem('adminToken');
            const response = await adminApi.createStudentApplication(formDataToSend, token);

            if (response.success) {
                showToast('✅ Application created successfully!', 'success');
                setTimeout(() => {
                    navigate('/admin/student-applications');
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Create error:', error);
            showToast(error.response?.data?.message || 'Failed to create application', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // LOADING
    // ============================================
    if (pageLoading) {
        return (
            <div className="add-student-app-page">
                <div className="page-loading">
                    <FaSpinner className="spin" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="add-student-app-page">
            {/* Toast */}
            {toast.show && (
                <div className={`app-toast ${toast.type}`}>
                    <div className="toast-body">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="page-header">
                <Link to="/admin/student-applications" className="btn-back">
                    <FaArrowLeft /> Back
                </Link>
                <div>
                    <h1><FaPlus /> Add Student Application</h1>
                    <p>Create a new application on behalf of a student</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="add-student-app-form">

                {/* ===== 1. PERSONAL INFORMATION ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaUser /> Personal Information
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={errors.firstName ? 'error' : ''}
                            />
                            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Middle Name</label>
                            <input
                                type="text"
                                name="middleName"
                                placeholder="Enter middle name"
                                value={formData.middleName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={errors.lastName ? 'error' : ''}
                            />
                            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Date of Birth *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className={errors.dateOfBirth ? 'error' : ''}
                            />
                            {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nationality *</label>
                            <input
                                type="text"
                                name="nationality"
                                placeholder="e.g., Pakistan"
                                value={formData.nationality}
                                onChange={handleChange}
                                className={errors.nationality ? 'error' : ''}
                            />
                            {errors.nationality && <span className="error-text">{errors.nationality}</span>}
                        </div>
                        <div className="form-group">
                            <label>Home Country *</label>
                            <input
                                type="text"
                                name="homeCountry"
                                placeholder="e.g., Pakistan"
                                value={formData.homeCountry}
                                onChange={handleChange}
                                className={errors.homeCountry ? 'error' : ''}
                            />
                            {errors.homeCountry && <span className="error-text">{errors.homeCountry}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address *</label>
                        <textarea
                            name="address"
                            placeholder="Full address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2"
                            className={errors.address ? 'error' : ''}
                        />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Passport Number *</label>
                            <input
                                type="text"
                                name="passportNumber"
                                placeholder="e.g., CT8948251"
                                value={formData.passportNumber}
                                onChange={handleChange}
                                style={{ textTransform: 'uppercase' }}
                                className={errors.passportNumber ? 'error' : ''}
                            />
                            {errors.passportNumber && <span className="error-text">{errors.passportNumber}</span>}
                        </div>
                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="+923343708156"
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="student@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                </div>

                {/* ===== 2. INSTITUTE & PROGRAM ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaUniversity /> Institute & Program
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Select University *</label>
                            <select
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                className={errors.university ? 'error' : ''}
                            >
                                <option value="">-- Select University --</option>
                                {universities.map(uni => (
                                    <option key={uni._id} value={uni._id}>
                                        {uni.name} {uni.code && `(${uni.code})`}
                                    </option>
                                ))}
                            </select>
                            {errors.university && <span className="error-text">{errors.university}</span>}
                        </div>
                        <div className="form-group">
                            <label>Select Program *</label>
                            <select
                                name="program"
                                value={formData.program}
                                onChange={handleChange}
                                className={errors.program ? 'error' : ''}
                                disabled={!formData.university}
                            >
                                <option value="">-- Select Program --</option>
                                {programs.map(prog => (
                                    <option key={prog._id} value={prog._id}>
                                        {prog.name}
                                    </option>
                                ))}
                            </select>
                            {errors.program && <span className="error-text">{errors.program}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Intake *</label>
                            <input
                                type="text"
                                name="intake"
                                placeholder="e.g., October (2026)"
                                value={formData.intake}
                                onChange={handleChange}
                                className={errors.intake ? 'error' : ''}
                            />
                            {errors.intake && <span className="error-text">{errors.intake}</span>}
                        </div>
                        <div className="form-group">
                            <label>Study Level</label>
                            <input
                                type="text"
                                name="studyLevel"
                                placeholder="e.g., Undergraduate"
                                value={formData.studyLevel}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duration</label>
                        <input
                            type="text"
                            name="duration"
                            placeholder="e.g., 3 Years"
                            value={formData.duration}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ===== 3. LAST EDUCATION ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaGraduationCap /> Last Education
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Level</label>
                            <input
                                type="text"
                                name="educationLevel"
                                placeholder="e.g., High School"
                                value={formData.educationLevel}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                name="educationSubject"
                                placeholder="e.g., Mathematics"
                                value={formData.educationSubject}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Institute</label>
                        <input
                            type="text"
                            name="educationInstitute"
                            placeholder="e.g., United Boys Higher Secondary"
                            value={formData.educationInstitute}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Result</label>
                            <input
                                type="text"
                                name="educationResult"
                                placeholder="e.g., 72%"
                                value={formData.educationResult}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Passing Year</label>
                            <input
                                type="text"
                                name="passingYear"
                                placeholder="e.g., 2025"
                                value={formData.passingYear}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* ===== 4. LANGUAGE PROFICIENCY ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaLanguage /> Language Proficiency
                    </h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Issuer</label>
                            <input
                                type="text"
                                name="languageIssuer"
                                placeholder="e.g., IELTS, TOEFL"
                                value={formData.languageIssuer}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Overall Score</label>
                            <input
                                type="text"
                                name="overallScore"
                                placeholder="e.g., 5.5"
                                value={formData.overallScore}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Reading / Writing</label>
                            <input
                                type="text"
                                name="readingWriting"
                                placeholder="e.g., 5.0/6.0"
                                value={formData.readingWriting}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Listening / Speaking</label>
                            <input
                                type="text"
                                name="listeningSpeaking"
                                placeholder="e.g., 5.5/6.0"
                                value={formData.listeningSpeaking}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Exam Type</label>
                        <input
                            type="text"
                            name="examType"
                            placeholder="e.g., Computer Based"
                            value={formData.examType}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ===== 5. BASIC DOCUMENTS ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaFileAlt /> Basic Documents
                    </h2>

                    <div className="documents-grid">
                        <DocumentUpload
                            label="English Proficiency"
                            file={documents.englishProficiency?.preview}
                            onUpload={(file) => handleDocUpload('englishProficiency', file)}
                            onRemove={() => handleDocRemove('englishProficiency')}
                        />
                        <DocumentUpload
                            label="Passport"
                            file={documents.passport?.preview}
                            onUpload={(file) => handleDocUpload('passport', file)}
                            onRemove={() => handleDocRemove('passport')}
                        />
                        <DocumentUpload
                            label="Recommendation Letter"
                            file={documents.recommendationLetter?.preview}
                            onUpload={(file) => handleDocUpload('recommendationLetter', file)}
                            onRemove={() => handleDocRemove('recommendationLetter')}
                        />
                        <DocumentUpload
                            label="All Academic Certificate & Marksheet"
                            file={documents.academicCertificate?.preview}
                            onUpload={(file) => handleDocUpload('academicCertificate', file)}
                            onRemove={() => handleDocRemove('academicCertificate')}
                        />
                        <DocumentUpload
                            label="Applicant Photo (White Background)"
                            file={documents.applicantPhoto?.preview}
                            onUpload={(file) => handleDocUpload('applicantPhoto', file)}
                            onRemove={() => handleDocRemove('applicantPhoto')}
                            accept=".jpg,.jpeg,.png"
                        />
                        <DocumentUpload
                            label="Updated Resume / CV"
                            file={documents.updatedResume?.preview}
                            onUpload={(file) => handleDocUpload('updatedResume', file)}
                            onRemove={() => handleDocRemove('updatedResume')}
                        />
                        <DocumentUpload
                            label="Statement of Purpose (SOP)"
                            file={documents.statementOfPurpose?.preview}
                            onUpload={(file) => handleDocUpload('statementOfPurpose', file)}
                            onRemove={() => handleDocRemove('statementOfPurpose')}
                        />
                    </div>
                </div>

                {/* ===== 6. ADDITIONAL DOCUMENTS ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaFileAlt /> Additional Documents
                    </h2>

                    <div className="documents-grid">
                        <DocumentUpload
                            label="Dependent Passport (if any)"
                            file={documents.dependentPassport?.preview}
                            onUpload={(file) => handleDocUpload('dependentPassport', file)}
                            onRemove={() => handleDocRemove('dependentPassport')}
                        />
                        <DocumentUpload
                            label="Sponsor Details"
                            file={documents.sponsorDetails?.preview}
                            onUpload={(file) => handleDocUpload('sponsorDetails', file)}
                            onRemove={() => handleDocRemove('sponsorDetails')}
                        />
                        <DocumentUpload
                            label="Bank Statement Letter"
                            file={documents.bankStatementLetter?.preview}
                            onUpload={(file) => handleDocUpload('bankStatementLetter', file)}
                            onRemove={() => handleDocRemove('bankStatementLetter')}
                        />
                        <DocumentUpload
                            label="Visa Copies"
                            file={documents.visaCopies?.preview}
                            onUpload={(file) => handleDocUpload('visaCopies', file)}
                            onRemove={() => handleDocRemove('visaCopies')}
                        />
                        <DocumentUpload
                            label="Pending Document"
                            file={documents.pendingDocument?.preview}
                            onUpload={(file) => handleDocUpload('pendingDocument', file)}
                            onRemove={() => handleDocRemove('pendingDocument')}
                        />
                        <DocumentUpload
                            label="Visa Document"
                            file={documents.visaDocument?.preview}
                            onUpload={(file) => handleDocUpload('visaDocument', file)}
                            onRemove={() => handleDocRemove('visaDocument')}
                        />
                        <DocumentUpload
                            label="Study Continuous Letter / Job Certificate"
                            file={documents.studyContinuousLetter?.preview}
                            onUpload={(file) => handleDocUpload('studyContinuousLetter', file)}
                            onRemove={() => handleDocRemove('studyContinuousLetter')}
                        />
                        <DocumentUpload
                            label="Dependent Passport 2nd (if any)"
                            file={documents.dependentPassport2nd?.preview}
                            onUpload={(file) => handleDocUpload('dependentPassport2nd', file)}
                            onRemove={() => handleDocRemove('dependentPassport2nd')}
                        />
                        <DocumentUpload
                            label="Transfer Students"
                            file={documents.transferStudents?.preview}
                            onUpload={(file) => handleDocUpload('transferStudents', file)}
                            onRemove={() => handleDocRemove('transferStudents')}
                        />
                    </div>
                </div>

                {/* ===== 7. CONDITIONAL LETTER & INVOICE ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaFileInvoiceDollar /> Conditional Letter & Invoice
                    </h2>

                    <div className="documents-grid">
                        <DocumentUpload
                            label="Signed CAL"
                            file={documents.signedCAL?.preview}
                            onUpload={(file) => handleDocUpload('signedCAL', file)}
                            onRemove={() => handleDocRemove('signedCAL')}
                        />
                        <DocumentUpload
                            label="Payment Invoice"
                            file={documents.paymentInvoice?.preview}
                            onUpload={(file) => handleDocUpload('paymentInvoice', file)}
                            onRemove={() => handleDocRemove('paymentInvoice')}
                        />
                    </div>
                </div>

                {/* ===== 8. SUBMIT PAYMENT RECEIPT ===== */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaClipboardCheck /> Submit Payment Receipt
                    </h2>

                    <div className="documents-grid">
                        <DocumentUpload
                            label="Application Fee Payment Receipt"
                            file={documents.applicationFee?.preview}
                            onUpload={(file) => handleDocUpload('applicationFee', file)}
                            onRemove={() => handleDocRemove('applicationFee')}
                        />
                        <DocumentUpload
                            label="English / Internal Exam Payment Fee Receipt"
                            file={documents.englishExamFee?.preview}
                            onUpload={(file) => handleDocUpload('englishExamFee', file)}
                            onRemove={() => handleDocRemove('englishExamFee')}
                        />
                        <DocumentUpload
                            label="Internal Admission Fee / Registration Fee"
                            file={documents.internalAdmissionFee?.preview}
                            onUpload={(file) => handleDocUpload('internalAdmissionFee', file)}
                            onRemove={() => handleDocRemove('internalAdmissionFee')}
                        />
                        <DocumentUpload
                            label="Bank Check / Bank Draft"
                            file={documents.bankCheck?.preview}
                            onUpload={(file) => handleDocUpload('bankCheck', file)}
                            onRemove={() => handleDocRemove('bankCheck')}
                        />
                        <DocumentUpload
                            label="Insurance Fee"
                            file={documents.insuranceFee?.preview}
                            onUpload={(file) => handleDocUpload('insuranceFee', file)}
                            onRemove={() => handleDocRemove('insuranceFee')}
                        />
                        <DocumentUpload
                            label="Tuition Fee"
                            file={documents.tuitionFee?.preview}
                            onUpload={(file) => handleDocUpload('tuitionFee', file)}
                            onRemove={() => handleDocRemove('tuitionFee')}
                        />
                    </div>
                </div>

                {/* ===== ACTIONS ===== */}
                <div className="form-actions">
                    <Link to="/admin/student-applications" className="btn-cancel">
                        Cancel
                    </Link>
                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <FaSave /> Create Application
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudentApplication;