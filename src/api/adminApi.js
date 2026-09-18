// src/api/adminApi.js
import api from './config.js';

const adminApi = {
    // =============================================
    // AUTHENTICATION APIs
    // =============================================
    
    signup: async (userData) => {
        try {
            const response = await api.post('/admin/signup', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    signin: async (credentials) => {
        try {
            console.log("🔐 API - ADMIN SIGN IN");
            const response = await api.post('/admin/signin', credentials);
            console.log("📥 Signin Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Signin API Error:", error.response?.data);
            throw error;
        }
    },

    verifySignUpOTP: async (data) => {
        try {
            const requestData = {
                email: data.email,
                otp: String(data.otp).trim()
            };
            const response = await api.post('/admin/verify-signup', requestData);
            return response.data;
        } catch (error) {
            console.error("❌ API Verify OTP Error:", error.response?.data);
            throw error;
        }
    },

    verifyLoginOTP: async (data) => {
        try {
            const requestData = {
                email: data.email,
                otp: String(data.otp).trim()
            };
            const response = await api.post('/admin/verify-login-otp', requestData);
            return response.data;
        } catch (error) {
            console.error("❌ API Verify Login OTP Error:", error.response?.data);
            throw error;
        }
    },

    resendOTP: async (data) => {
        try {
            const response = await api.post('/admin/resend-otp', data);
            return response.data;
        } catch (error) {
            console.error("❌ Resend OTP Error:", error.response?.data);
            throw error;
        }
    },

    forgotPassword: async (data) => {
        try {
            const response = await api.post('/admin/forgot-password', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (token, data) => {
        try {
            const response = await api.post(`/admin/reset-password/${token}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // =============================================
    // ADMIN PROFILE APIs
    // =============================================
    
    getProfile: async (token) => {
        try {
            const response = await api.get('/admin/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllAdmins: async (token) => {
        try {
            const response = await api.get('/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAdminById: async (id, token) => {
        try {
            const response = await api.get(`/admin/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateAdmin: async (id, data, token) => {
        try {
            const response = await api.put(`/admin/${id}`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteAdmin: async (id, token) => {
        try {
            const response = await api.delete(`/admin/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    changePassword: async (id, data, token) => {
        try {
            const response = await api.put(`/admin/${id}/change-password`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // =============================================
    // AGENT MANAGEMENT APIs
    // =============================================

    getAllAgents: async (token) => {
        try {
            console.log("🔐 API - GET ALL AGENTS");
            const response = await api.get('/admin/agents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("📥 Agents Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Get Agents Error:", error.response?.data);
            throw error;
        }
    },

    getPendingAgents: async (token) => {
        try {
            const response = await api.get('/admin/agents/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("❌ Get Pending Agents Error:", error.response?.data);
            throw error;
        }
    },

    getAgentById: async (id, token) => {
        try {
            const response = await api.get(`/admin/agents/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    approveAgent: async (id, token) => {
        try {
            console.log("✅ API - APPROVE AGENT:", id);
            const response = await api.put(`/admin/agents/approve/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("📥 Approve Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Approve Error:", error.response?.data);
            throw error;
        }
    },

    rejectAgent: async (id, data, token) => {
        try {
            console.log("❌ API - REJECT AGENT:", id);
            const response = await api.put(`/admin/agents/reject/${id}`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("📥 Reject Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Reject Error:", error.response?.data);
            throw error;
        }
    },

    setPendingStatus: async (id, token) => {
        try {
            console.log("⏳ API - SET PENDING STATUS:", id);
            const response = await api.put(`/admin/agents/pending/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("❌ Set Pending Error:", error.response?.data);
            throw error;
        }
    },

    deleteAgent: async (id, token) => {
        try {
            const response = await api.delete(`/admin/agents/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // =============================================
    // UNIVERSITY MANAGEMENT APIs
    // =============================================

    createUniversity: async (formData, token) => {
        try {
            console.log("🔐 API - CREATE UNIVERSITY");
            const response = await api.post('/universities', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("❌ Create University Error:", error.response?.data);
            throw error;
        }
    },

    getAllUniversities: async (token, filters = {}) => {
        try {
            console.log("🔐 API - GET ALL UNIVERSITIES");
            const response = await api.get('/universities', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error("❌ Get Universities Error:", error.response?.data);
            throw error;
        }
    },

    getUniversityById: async (id, token) => {
        try {
            const response = await api.get(`/universities/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUniversity: async (id, formData, token) => {
        try {
            const response = await api.put(`/universities/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteUniversity: async (id, token) => {
        try {
            const response = await api.delete(`/universities/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleUniversityActive: async (id, token) => {
        try {
            const response = await api.put(`/universities/${id}/toggle-active`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleUniversityVerified: async (id, token) => {
        try {
            const response = await api.put(`/universities/${id}/toggle-verified`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // =============================================
    // PROGRAM MANAGEMENT APIs
    // =============================================

    createProgram: async (formData, token) => {
        try {
            console.log("🔐 API - CREATE PROGRAM");
            const response = await api.post('/programs', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("❌ Create Program Error:", error.response?.data);
            throw error;
        }
    },

    getAllPrograms: async (token, filters = {}) => {
        try {
            const response = await api.get('/programs', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: filters
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProgramById: async (id, token) => {
        try {
            const response = await api.get(`/programs/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProgram: async (id, formData, token) => {
        try {
            const response = await api.put(`/programs/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteProgram: async (id, token) => {
        try {
            const response = await api.delete(`/programs/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleProgramActive: async (id, token) => {
        try {
            const response = await api.put(`/programs/${id}/toggle-active`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleProgramFeatured: async (id, token) => {
        try {
            const response = await api.put(`/programs/${id}/toggle-featured`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProgramsByUniversity: async (universityId, token) => {
        try {
            const response = await api.get(`/programs/university/${universityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // =============================================
    // APPLICATION MANAGEMENT APIs
    // =============================================

    applications: {
        getAll: async (filters = {}) => {
            try {
                console.log("🔐 API - GET ALL APPLICATIONS");
                const token = localStorage.getItem('adminToken');
                const response = await api.get('/admin/applications', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: filters
                });
                console.log("📥 Applications Response:", response.data);
                return response.data;
            } catch (error) {
                console.error("❌ Get Applications Error:", error.response?.data);
                throw error;
            }
        },

        getById: async (id) => {
            try {
                console.log("🔐 API - GET APPLICATION:", id);
                const token = localStorage.getItem('adminToken');
                const response = await api.get(`/admin/applications/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                console.error("❌ Get Application Error:", error.response?.data);
                throw error;
            }
        },

        getStats: async () => {
            try {
                console.log("🔐 API - GET APPLICATION STATS");
                const token = localStorage.getItem('adminToken');
                const response = await api.get('/admin/applications/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                console.error("❌ Get Stats Error:", error.response?.data);
                throw error;
            }
        },

        update: async (id, formData) => {
            try {
                console.log("🔐 API - UPDATE APPLICATION:", id);
                const token = localStorage.getItem('adminToken');
                const response = await api.put(`/admin/applications/${id}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log("📥 Update Response:", response.data);
                return response.data;
            } catch (error) {
                console.error("❌ Update Error:", error.response?.data);
                throw error;
            }
        },

        delete: async (id) => {
            try {
                console.log("🔐 API - DELETE APPLICATION:", id);
                const token = localStorage.getItem('adminToken');
                const response = await api.delete(`/admin/applications/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log("📥 Delete Response:", response.data);
                return response.data;
            } catch (error) {
                console.error("❌ Delete Error:", error.response?.data);
                throw error;
            }
        },

        approve: async (id, remarks = '') => {
            try {
                console.log("✅ API - APPROVE APPLICATION:", id);
                const token = localStorage.getItem('adminToken');
                const response = await api.patch(`/admin/applications/${id}/approve`,
                    { remarks },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                console.log("📥 Approve Response:", response.data);
                return response.data;
            } catch (error) {
                console.error("❌ Approve Error:", error.response?.data);
                throw error;
            }
        },

        reject: async (id, reason) => {
            try {
                console.log("❌ API - REJECT APPLICATION:", id);
                const token = localStorage.getItem('adminToken');
                const response = await api.patch(`/admin/applications/${id}/reject`,
                    { reason, remarks: reason },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                console.log("📥 Reject Response:", response.data);
                return response.data;
            } catch (error) {
                console.error("❌ Reject Error:", error.response?.data);
                throw error;
            }
        },

        review: async (id, remarks) => {
            try {
                console.log("🔄 API - REVIEW APPLICATION:", id);
                const token = localStorage.getItem('adminToken');
                const response = await api.patch(`/admin/applications/${id}/review`,
                    { remarks },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                console.log("📥 Review Response:", response.data);
                return response.data;
            } catch (error) {
                console.error("❌ Review Error:", error.response?.data);
                throw error;
            }
        }
    },

    // =============================================
    // PAYMENT MANAGEMENT APIs
    // =============================================

    payments: {
        create: async (data) => {
            try {
                console.log("💰 API - CREATE PAYMENT:", data.type);
                const token = localStorage.getItem('adminToken');
                const response = await api.post('/admin/payments', data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                console.error("❌ Create Payment Error:", error.response?.data);
                throw error;
            }
        },

        getAll: async (filters = {}) => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await api.get('/admin/payments', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: filters
                });
                return response.data;
            } catch (error) {
                console.error("❌ Get Payments Error:", error.response?.data);
                throw error;
            }
        },

        getById: async (id) => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await api.get(`/admin/payments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        update: async (id, data) => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await api.put(`/admin/payments/${id}`, data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        delete: async (id) => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await api.delete(`/admin/payments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        getStats: async (filters = {}) => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await api.get('/admin/payments/stats', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: filters
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        getDailyReport: async (date) => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await api.get('/admin/payments/daily-report', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: { date }
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        getAgentSummary: async (agentId) => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await api.get(`/admin/payments/agent/${agentId}/summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                throw error;
            }
        }
    },

    // =============================================
    // DASHBOARD APIs ⭐
    // =============================================

    getDashboardStats: async () => {
        try {
            console.log("📊 API - GET DASHBOARD STATS");
            const token = localStorage.getItem('adminToken');
            const response = await api.get('/admin/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("📥 Dashboard Response:", response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Dashboard Error:', error.response?.data);
            throw error;
        }
    },

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================
    
    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('userData');
        window.location.href = '/signin';
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('adminToken');
    },

    getToken: () => {
        return localStorage.getItem('adminToken');
    },

    getUserRole: () => {
        return localStorage.getItem('adminRole');
    },

    getUserData: () => {
        try {
            const data = localStorage.getItem('adminData');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    setAuthData: (token, role, userData) => {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminRole', role);
        localStorage.setItem('adminData', JSON.stringify(userData));
    },

    clearAuthData: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('userData');
    }
};

export default adminApi;