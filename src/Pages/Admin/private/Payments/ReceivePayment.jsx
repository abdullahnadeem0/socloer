// src/Pages/Admin/private/Payments/ReceivePayment.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReceivePayment.css';
import adminApi from '../../../../api/adminApi';
import {
    FaArrowLeft, FaArrowDown, FaMoneyBillWave,
    FaUniversity, FaCalendarAlt, FaStickyNote, FaSpinner,
    FaCheckCircle, FaExclamationTriangle, FaSave
} from 'react-icons/fa';

const ReceivePayment = () => {
    const navigate = useNavigate();

    // ===== STATE =====
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [serverError, setServerError] = useState('');
    const [errors, setErrors] = useState({});

    // ===== FORM DATA =====
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'PKR',
        paymentMethod: 'Bank Transfer',
        transactionId: '',
        bankName: '',
        accountNumber: '',
        note: '',
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'completed'
    });

    // ============================================
    // HANDLE CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setServerError('');
    };

    // ============================================
    // VALIDATE
    // ============================================
    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Valid amount is required';
        }

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }

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
            const firstError = document.querySelector('.error-text');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);
        setServerError('');

        try {
            const dataToSend = {
                type: 'receive',
                amount: parseFloat(formData.amount),
                currency: 'PKR',
                paymentMethod: formData.paymentMethod,
                transactionId: formData.transactionId,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                note: formData.note,
                paymentDate: formData.paymentDate,
                status: formData.status
            };

            const response = await adminApi.payments.create(dataToSend);

            if (response.success) {
                setSuccessMessage(`✅ Payment received! Number: ${response.data.paymentNumber}`);
                setTimeout(() => {
                    navigate('/admin/payments');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Create error:', error);
            setServerError(error.response?.data?.message || 'Failed to record payment');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="Receive-Payment-page">
            <div className="receive-container">

                {/* ===== HEADER ===== */}
                <div className="receive-header">
                    <button
                        className="back-icon-btn"
                        onClick={() => navigate('/admin/payments')}
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="header-info">
                        <div className="header-icon-wrapper received">
                            <FaArrowDown />
                        </div>
                        <div>
                            <h1>Receive Payment</h1>
                            <p>Record incoming payment (paisa aaya)</p>
                        </div>
                    </div>
                </div>

                {/* ===== MESSAGES ===== */}
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

                {/* ===== FORM ===== */}
                <form onSubmit={handleSubmit} className="receive-form">

                    {/* SECTION 1: AMOUNT */}
                    <div className="form-section highlight">
                        <h3 className="section-title">
                            <FaMoneyBillWave className="section-icon" />
                            Amount
                        </h3>

                        <div className="simple-amount-wrapper">
                            <span className="simple-currency-label">Rs</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                className={`simple-amount-input ${errors.amount ? 'error' : ''}`}
                                autoFocus
                            />
                            <span className="simple-currency-code">PKR</span>
                        </div>
                        {errors.amount && <span className="error-text">{errors.amount}</span>}
                    </div>

                    {/* SECTION 2: PAYMENT DETAILS */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaUniversity className="section-icon" />
                            Payment Details
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Online">Online</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Transaction ID (Optional)</label>
                                <input
                                    type="text"
                                    name="transactionId"
                                    value={formData.transactionId}
                                    onChange={handleChange}
                                    placeholder="e.g., TXN123456789"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Bank Name (Optional)</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    placeholder="e.g., HBL, Meezan, UBL"
                                />
                            </div>

                            <div className="form-group">
                                <label>Account Number (Optional)</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    placeholder="Account number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: DATE & NOTE */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <FaCalendarAlt className="section-icon" />
                            Date & Notes
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Payment Date *</label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    value={formData.paymentDate}
                                    onChange={handleChange}
                                    className={errors.paymentDate ? 'error' : ''}
                                />
                                {errors.paymentDate && <span className="error-text">{errors.paymentDate}</span>}
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <FaStickyNote /> Note
                            </label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                placeholder="Kuch bhi note karna ho..."
                                rows="3"
                                maxLength="500"
                            />
                            <small className="char-count">
                                {formData.note.length}/500 characters
                            </small>
                        </div>
                    </div>

                    {/* ===== ACTIONS ===== */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate('/admin/payments')}
                            disabled={loading}
                        >
                            <FaArrowLeft /> Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-btn received"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spinner" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Record Receive Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceivePayment;