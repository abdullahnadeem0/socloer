// src/Pages/Admin/private/Applications/AdminEditApplication.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminEditApplication.css';
import adminApi from '../../../../api/adminApi';
import api, { API_URL, SERVER_URL, getFileUrl } from '../../../../api/config';

import {
    FaArrowLeft, FaSave, FaUser, FaGraduationCap, FaUniversity,
    FaFileAlt, FaMoneyBillWave, FaMapMarkerAlt, FaSpinner,
    FaExclamationTriangle, FaCheckCircle, FaUpload, FaTrash,
    FaFolderOpen, FaFileContract, FaReceipt
} from 'react-icons/fa';

const AdminEditApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // ===== STATE =====
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});

    // ===== DROPDOWNS =====
    const [universities, setUniversities] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);

    // ===== ORIGINAL DATA =====
    const [originalData, setOriginalData] = useState(null);

    // ===== FILE REFS =====
    const fileRefs = {
        idProof: useRef(null),
        marksheet: useRef(null),
        incomeCertificate: useRef(null),
        profilePhoto: useRef(null),
        previousCertificate: useRef(null),
        bankPassbook: useRef(null),
        dependentPassport1: useRef(null),
        sponsorDetails: useRef(null),
        bankStatementLetter: useRef(null),
        visaCopies: useRef(null),
        pendingDocument: useRef(null),
        visaDocument: useRef(null),
        studyContinuousLetter: useRef(null),
        dependentPassport2: useRef(null),
        transferStudents: useRef(null),
        signedCAL: useRef(null),
        paymentInvoice: useRef(null),
        applicationFeeReceipt: useRef(null),
        englishExamReceipt: useRef(null),
        internalAdmissionFee: useRef(null),
        bankCheckDraft: useRef(null),
        insuranceFee: useRef(null),
        tuitionFee: useRef(null),
        finalSignedCAL: useRef(null),
        finalPaymentInvoice: useRef(null),
        initialAdmissionPortfolio: useRef(null),
        deferralAdmissionPortfolio: useRef(null)
    };


    // ===== FORM DATA =====
    const [formData, setFormData] = useState({
        university: '',
        program: '',

        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        nationality: 'Indian',
        category: 'General',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        fatherName: '',
        motherName: '',
        guardianPhone: '',
        annualIncome: '',

        previousEducation: '',
        previousInstitute: '',
        passingYear: '',
        percentage: '',
        gpa: '',

        whyDeserve: '',
        achievements: '',

        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',

        // Files
        profilePhoto: null,
        profilePhotoPreview: null,
        idProof: null,
        marksheet: null,
        incomeCertificate: null,
        previousCertificate: null,
        bankPassbook: null,
        dependentPassport1: null,
        sponsorDetails: null,
        bankStatementLetter: null,
        visaCopies: null,
        pendingDocument: null,
        visaDocument: null,
        studyContinuousLetter: null,
        dependentPassport2: null,
        transferStudents: null,
        signedCAL: null,
        paymentInvoice: null,
        applicationFeeReceipt: null,
        englishExamReceipt: null,
        internalAdmissionFee: null,
        bankCheckDraft: null,
        insuranceFee: null,
        tuitionFee: null,
        finalSignedCAL: null,
        finalPaymentInvoice: null,
        initialAdmissionPortfolio: null,
        deferralAdmissionPortfolio: null
    });

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');

            // Token check
            if (!token || token === 'null' || token === 'undefined') {
                console.error('❌ No valid token!');
                setServerError('Session expired. Please login again.');
                setTimeout(() => {
                    localStorage.clear();
                    navigate('/signin');
                }, 2000);
                return;
            }

            console.log('🔑 Token exists, length:', token.length);

            // ===== FETCH APPLICATION =====
            const appResponse = await adminApi.applications.getById(id);
            console.log('📥 Application response:', appResponse);

            if (!appResponse.success) {
                throw new Error('Application not found');
            }

            const app = appResponse.data;
            setOriginalData(app);

            // Fill form
            setFormData(prev => ({
                ...prev,
                university: app.university?._id || app.university || '',
                program: app.program?._id || app.program || '',
                firstName: app.student?.firstName || '',
                lastName: app.student?.lastName || '',
                email: app.student?.email || '',
                phone: app.student?.phone || '',
                dateOfBirth: app.student?.dateOfBirth
                    ? new Date(app.student.dateOfBirth).toISOString().split('T')[0]
                    : '',
                gender: app.student?.gender || '',
                nationality: app.student?.nationality || 'Indian',
                category: app.student?.category || 'General',
                address: app.student?.address || '',
                city: app.student?.city || '',
                state: app.student?.state || '',
                pincode: app.student?.pincode || '',
                country: app.student?.country || 'India',
                fatherName: app.student?.fatherName || '',
                motherName: app.student?.motherName || '',
                guardianPhone: app.student?.guardianPhone || '',
                annualIncome: app.student?.annualIncome || '',
                previousEducation: app.academic?.previousEducation || '',
                previousInstitute: app.academic?.previousInstitute || '',
                passingYear: app.academic?.passingYear || '',
                percentage: app.academic?.percentage || '',
                gpa: app.academic?.gpa || '',
                whyDeserve: app.statement?.whyDeserve || '',
                achievements: app.statement?.achievements || '',
                accountHolderName: app.bankDetails?.accountHolderName || '',
                accountNumber: app.bankDetails?.accountNumber || '',
                ifscCode: app.bankDetails?.ifscCode || '',
                bankName: app.bankDetails?.bankName || '',
                branchName: app.bankDetails?.branchName || ''
            }));

            // ===== FETCH UNIVERSITIES =====
            try {
                console.log('🎓 Fetching universities...');
                const unisResponse = await adminApi.getAllUniversities(token);
                console.log('📥 Universities response:', unisResponse);

                if (unisResponse.success) {
                    const unisList = unisResponse.data || unisResponse.universities || [];
                    console.log('✅ Universities loaded:', unisList.length);
                    setUniversities(unisList);
                }
            } catch (uniError) {
                console.error('❌ Universities error:', uniError);
            }

            // ===== FETCH PROGRAMS =====
            const uniId = app.university?._id || app.university;
            if (uniId) {
                try {
                    console.log('📚 Fetching programs for:', uniId);
                    const programsResponse = await adminApi.getProgramsByUniversity(uniId, token);
                    console.log('📥 Programs response:', programsResponse);

                    if (programsResponse.success) {
                        const progsList = programsResponse.data || programsResponse.programs || [];
                        console.log('✅ Programs loaded:', progsList.length);
                        setPrograms(progsList);
                    }
                } catch (progError) {
                    console.error('❌ Programs error:', progError);
                }
            }

        } catch (error) {
            console.error('❌ Fetch error:', error);
            setServerError(error.response?.data?.message || 'Failed to load application');

            if (error.response?.status === 401) {
                setTimeout(() => {
                    localStorage.clear();
                    navigate('/signin');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // HANDLE UNIVERSITY CHANGE
    // ============================================
    const handleUniversityChange = async (e) => {
        const universityId = e.target.value;

        console.log('🎓 University selected:', universityId);

        setFormData(prev => ({
            ...prev,
            university: universityId,
            program: ''
        }));

        setPrograms([]);

        if (!universityId) return;

        setLoadingPrograms(true);
        try {
            const token = localStorage.getItem('adminToken');
            console.log('📚 Fetching programs...');
            
            const response = await adminApi.getProgramsByUniversity(universityId, token);
            console.log('📥 Programs response:', response);

            if (response.success) {
                const progsList = response.data || response.programs || [];
                console.log('✅ Programs loaded:', progsList.length);
                setPrograms(progsList);
            }
        } catch (error) {
            console.error('❌ Programs error:', error);
            console.error('❌ Error details:', error.response?.data);
        } finally {
            setLoadingPrograms(false);
        }
    };

    // ============================================
    // HANDLE CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, [name]: 'Max 5MB allowed' }));
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, [name]: 'Only JPG, PNG, PDF allowed' }));
                return;
            }

            const update = { [name]: file };

            if (name === 'profilePhoto') {
                if (formData.profilePhotoPreview) {
                    URL.revokeObjectURL(formData.profilePhotoPreview);
                }
                update.profilePhotoPreview = URL.createObjectURL(file);
            }

            setFormData(prev => ({ ...prev, ...update }));
            setErrors(prev => ({ ...prev, [name]: '' }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ============================================
    // REMOVE FILE
    // ============================================
    const removeFile = (fieldName) => {
        if (fieldName === 'profilePhoto' && formData.profilePhotoPreview) {
            URL.revokeObjectURL(formData.profilePhotoPreview);
        }
        setFormData(prev => ({
            ...prev,
            [fieldName]: null,
            ...(fieldName === 'profilePhoto' && { profilePhotoPreview: null })
        }));
        if (fileRefs[fieldName]?.current) {
            fileRefs[fieldName].current.value = '';
        }
    };

    // ============================================
    // GET FILE URL
    // ============================================
    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${API_URL}${finalPath}`;
    };

    // ============================================
    // FILE UPLOAD RENDERER
    // ============================================
    const renderFileUpload = (label, name) => {
        const newFile = formData[name];
        const oldFile = originalData?.documents?.[name];

        return (
            <div className="form-group">
                <label>{label}</label>
                {!newFile ? (
                    <div className="file-drop-zone">
                        <input
                            type="file"
                            name={name}
                            ref={fileRefs[name]}
                            onChange={handleChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                        />
                        <FaUpload className="upload-icon" />
                        <p>Upload</p>
                        <small>JPG, PNG, PDF (Max 5MB)</small>
                        {oldFile && (
                            <a
                                href={getFileUrl(oldFile)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="existing-file-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                ✅ Already uploaded - Click to view
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="file-preview-simple">
                        <FaFileAlt />
                        <span>{newFile.name}</span>
                        <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => removeFile(name)}
                        >
                            <FaTrash />
                        </button>
                    </div>
                )}
                {errors[name] && <span className="error-text">{errors[name]}</span>}
            </div>
        );
    };

    // ============================================
    // HANDLE SUBMIT
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.university) newErrors.university = 'University is required';
        if (!formData.program) newErrors.program = 'Program is required';
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstError = document.querySelector('.error-text');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setSubmitLoading(true);
        setServerError('');

        try {
            const dataToSend = new FormData();

            dataToSend.append('university', formData.university);
            dataToSend.append('program', formData.program);

            dataToSend.append('student', JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                nationality: formData.nationality,
                category: formData.category,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                country: formData.country,
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                guardianPhone: formData.guardianPhone,
                annualIncome: formData.annualIncome
            }));

            dataToSend.append('academic', JSON.stringify({
                previousEducation: formData.previousEducation,
                previousInstitute: formData.previousInstitute,
                passingYear: formData.passingYear,
                percentage: formData.percentage,
                gpa: formData.gpa
            }));

            dataToSend.append('statement', JSON.stringify({
                whyDeserve: formData.whyDeserve,
                achievements: formData.achievements
            }));

            dataToSend.append('bankDetails', JSON.stringify({
                accountHolderName: formData.accountHolderName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                bankName: formData.bankName,
                branchName: formData.branchName
            }));

            const fileFields = [
                'profilePhoto', 'idProof', 'marksheet',
                'incomeCertificate', 'previousCertificate', 'bankPassbook',
                'dependentPassport1', 'sponsorDetails', 'bankStatementLetter',
                'visaCopies', 'pendingDocument', 'visaDocument',
                'studyContinuousLetter', 'dependentPassport2', 'transferStudents',
                'signedCAL', 'paymentInvoice',
                'applicationFeeReceipt', 'englishExamReceipt',
                'internalAdmissionFee', 'bankCheckDraft',
                'insuranceFee', 'tuitionFee',
                'finalSignedCAL', 'finalPaymentInvoice',
                'initialAdmissionPortfolio', 'deferralAdmissionPortfolio'
            ];

            fileFields.forEach(field => {
                if (formData[field]) {
                    dataToSend.append(field, formData[field]);
                }
            });

            const response = await adminApi.applications.update(id, dataToSend);
            console.log('📥 Update response:', response);

            if (response.success) {
                setSuccessMessage('✅ Application updated successfully!');
                setTimeout(() => {
                    navigate(`/admin/applications/${id}`);
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Update error:', error);
            setServerError(error.response?.data?.message || 'Failed to update application');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitLoading(false);
        }
    };

    // ============================================
    // LOADING
    // ============================================
    if (loading) {
        return (
            <div className="AdminEditApplication">
                <div className="loading-state">
                    <FaSpinner className="spinner-large" />
                    <p>Loading application...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // ERROR
    // ============================================
    if (serverError && !originalData) {
        return (
            <div className="AdminEditApplication">
                <div className="error-state">
                    <FaExclamationTriangle className="error-icon-large" />
                    <h2>Error Loading Application</h2>
                    <p>{serverError}</p>
                    <button className="back-btn" onClick={() => navigate('/admin/applications')}>
                        <FaArrowLeft /> Back to Applications
                    </button>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="AdminEditApplication">
            <div className="edit-container">

                {/* HEADER */}
                <div className="edit-header">
                    <button
                        className="back-icon-btn"
                        onClick={() => navigate(`/admin/applications/${id}`)}
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="header-info">
                        <h1>Edit Application</h1>
                        <span className="app-number">{originalData?.applicationNumber}</span>
                    </div>
                </div>

                {/* MESSAGES */}
                {successMessage && (
                    <div className="success-message">
                        <FaCheckCircle /> {successMessage}
                    </div>
                )}

                {serverError && (
                    <div className="error-message">
                        <FaExclamationTriangle /> {serverError}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="edit-form">

                    {/* SECTION 1: UNIVERSITY & PROGRAM */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaUniversity className="section-icon" />
                            University & Program
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Select University *</label>
                                <select
                                    name="university"
                                    value={formData.university}
                                    onChange={handleUniversityChange}
                                >
                                    <option value="">-- Select University --</option>
                                    {universities.map(uni => (
                                        <option key={uni._id} value={uni._id}>
                                            {uni.name} {uni.city ? `(${uni.city})` : ''}
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
                                    disabled={!formData.university || loadingPrograms}
                                >
                                    <option value="">
                                        {loadingPrograms
                                            ? 'Loading...'
                                            : !formData.university
                                                ? '-- Select university first --'
                                                : programs.length === 0
                                                    ? '-- No programs --'
                                                    : '-- Select Program --'}
                                    </option>
                                    {programs.map(prog => (
                                        <option key={prog._id} value={prog._id}>
                                            {prog.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.program && <span className="error-text">{errors.program}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: STUDENT INFO */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaUser className="section-icon" />
                            Student Personal Information
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input type="tel" name="phone" maxLength="10" value={formData.phone} onChange={handleChange} />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="General">General</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="EWS">EWS</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nationality</label>
                                <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: ADDRESS */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaMapMarkerAlt className="section-icon" />
                            Address
                        </h3>

                        <div className="form-group">
                            <label>Full Address</label>
                            <textarea name="address" rows="2" value={formData.address} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Pincode</label>
                                <input type="text" name="pincode" maxLength="6" value={formData.pincode} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" name="country" value={formData.country} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: FAMILY */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaUser className="section-icon" />
                            Family Information
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Father's Name</label>
                                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Mother's Name</label>
                                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Guardian Phone</label>
                                <input type="tel" name="guardianPhone" maxLength="10" value={formData.guardianPhone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Annual Income (₹)</label>
                                <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: ACADEMIC */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaGraduationCap className="section-icon" />
                            Academic Information
                        </h3>

                        <div className="form-group">
                            <label>Previous Education</label>
                            <input type="text" name="previousEducation" value={formData.previousEducation} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Previous Institute</label>
                            <input type="text" name="previousInstitute" value={formData.previousInstitute} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Passing Year</label>
                                <input type="number" name="passingYear" value={formData.passingYear} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Percentage</label>
                                <input type="number" name="percentage" step="0.01" value={formData.percentage} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>GPA</label>
                            <input type="number" name="gpa" step="0.01" value={formData.gpa} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECTION 6: STATEMENT */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaFileAlt className="section-icon" />
                            Statement
                        </h3>

                        <div className="form-group">
                            <label>Why does this student deserve this scholarship?</label>
                            <textarea name="whyDeserve" rows="5" value={formData.whyDeserve} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Achievements</label>
                            <textarea name="achievements" rows="3" value={formData.achievements} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECTION 7: BANK */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaMoneyBillWave className="section-icon" />
                            Bank Details
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Account Holder Name</label>
                                <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Account Number</label>
                                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>IFSC Code</label>
                                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Bank Name</label>
                                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Branch Name</label>
                            <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECTION 8: BASIC DOCUMENTS */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaFolderOpen className="section-icon" />
                            Basic Documents
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Profile Photo</label>
                                {!formData.profilePhotoPreview ? (
                                    <div className="file-drop-zone">
                                        <input
                                            type="file"
                                            name="profilePhoto"
                                            ref={fileRefs.profilePhoto}
                                            onChange={handleChange}
                                            accept="image/*"
                                        />
                                        <FaUpload className="upload-icon" />
                                        <p>Upload Photo</p>
                                        <small>JPG, PNG (Max 5MB)</small>
                                        {originalData?.student?.profileImage && (
                                            <a
                                                href={getFileUrl(originalData.student.profileImage)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="existing-file-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                ✅ View Current Photo
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="file-preview">
                                        <img src={formData.profilePhotoPreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="remove-file-btn"
                                            onClick={() => removeFile('profilePhoto')}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {renderFileUpload('ID Proof', 'idProof')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Marksheet', 'marksheet')}
                            {renderFileUpload('Income Certificate', 'incomeCertificate')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Previous Certificate', 'previousCertificate')}
                            {renderFileUpload('Bank Passbook', 'bankPassbook')}
                        </div>
                    </div>

                    {/* SECTION 9: ADDITIONAL DOCUMENTS */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaFolderOpen className="section-icon" />
                            Additional Documents
                        </h3>

                        <div className="form-row">
                            {renderFileUpload('Dependent Passport', 'dependentPassport1')}
                            {renderFileUpload('Visa Document', 'visaDocument')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Sponsor Details', 'sponsorDetails')}
                            {renderFileUpload('Study Continuous Letter', 'studyContinuousLetter')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Bank Statement Letter', 'bankStatementLetter')}
                            {renderFileUpload('Dependent Passport 2', 'dependentPassport2')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Visa Copies', 'visaCopies')}
                            {renderFileUpload('Transfer Students', 'transferStudents')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Pending Document', 'pendingDocument')}
                            <div></div>
                        </div>
                    </div>

                    {/* SECTION 10: CONDITIONAL */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaFileContract className="section-icon" />
                            Conditional Letter & Invoice
                        </h3>

                        <div className="form-row">
                            {renderFileUpload('Signed CAL', 'signedCAL')}
                            {renderFileUpload('Payment Invoice', 'paymentInvoice')}
                        </div>
                    </div>

                    {/* SECTION 11: PAYMENT RECEIPTS */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaReceipt className="section-icon" />
                            Payment Receipts
                        </h3>

                        <div className="form-row">
                            {renderFileUpload('Application Fee Receipt', 'applicationFeeReceipt')}
                            {renderFileUpload('English Exam Receipt', 'englishExamReceipt')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Internal Admission Fee', 'internalAdmissionFee')}
                            {renderFileUpload('Bank Check / Draft', 'bankCheckDraft')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Insurance Fee', 'insuranceFee')}
                            {renderFileUpload('Tuition Fee', 'tuitionFee')}
                        </div>
                    </div>

                    {/* SECTION 12: FINAL PORTFOLIO */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaGraduationCap className="section-icon" />
                            Final Admission Portfolio
                        </h3>

                        <div className="form-row">
                            {renderFileUpload('Signed CAL', 'finalSignedCAL')}
                            {renderFileUpload('Payment Invoice', 'finalPaymentInvoice')}
                        </div>

                        <div className="form-row">
                            {renderFileUpload('Initial Admission Portfolio', 'initialAdmissionPortfolio')}
                            {renderFileUpload('Deferral Admission Portfolio', 'deferralAdmissionPortfolio')}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate(`/admin/applications/${id}`)}
                            disabled={submitLoading}
                        >
                            <FaArrowLeft /> Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitLoading}
                        >
                            {submitLoading ? (
                                <>
                                    <FaSpinner className="spinner" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEditApplication;