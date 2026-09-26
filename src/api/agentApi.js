// src/api/agentApi.js
import api from './config.js';

const agentApi = {
    // =============================================
    // AUTHENTICATION APIs
    // =============================================
    
    // Agent Sign Up
    signup: async (formData) => {
        try {
            console.log("=========================================");
            console.log("🔐 API - AGENT SIGN UP");
            console.log("=========================================");
            
            const response = await api.post('/agent/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("📥 Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Signup Error:", error.response?.data);
            throw error;
        }
    },

    // Verify OTP
    verifyOTP: async (data) => {
        try {
            console.log("🔐 API - VERIFY OTP");
            const response = await api.post('/agent/verify-otp', data);
            return response.data;
        } catch (error) {
            console.error("❌ Verify OTP Error:", error.response?.data);
            throw error;
        }
    },

    // Resend OTP
    resendOTP: async (data) => {
        try {
            const response = await api.post('/agent/resend-otp', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Agent Login
    login: async (credentials) => {
        try {
            console.log("🔐 API - AGENT LOGIN");
            const response = await api.post('/agent/login', credentials);
            return response.data;
        } catch (error) {
            console.error("❌ Login Error:", error.response?.data);
            throw error;
        }
    },

    // =============================================
    // PROFILE APIs
    // =============================================
    
    getProfile: async (token) => {
        try {
            const response = await api.get('/agent/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (id, data, token) => {
        try {
            const response = await api.put(`/agent/${id}`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // =============================================
    // DROPDOWN APIs
    // =============================================
    
    // Get all universities (for dropdown)
    getUniversities: async () => {
        try {
            console.log("=========================================");
            console.log("🎓 API - GET UNIVERSITIES");
            console.log("=========================================");
            
            const token = localStorage.getItem('agentToken');
            const response = await api.get('/agent/dropdowns/universities', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log("📥 Universities:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Get Universities Error:", error.response?.data);
            throw error;
        }
    },

    // Get programs by university ID (for dropdown)
    getProgramsByUniversity: async (universityId) => {
        try {
            console.log("=========================================");
            console.log("📚 API - GET PROGRAMS by University:", universityId);
            console.log("=========================================");
            
            const token = localStorage.getItem('agentToken');
            const response = await api.get(`/agent/dropdowns/programs/${universityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log("📥 Programs:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Get Programs Error:", error.response?.data);
            throw error;
        }
    },

    // =============================================
    // APPLICATION APIs
    // =============================================
    
    // Create new student application
    createApplication: async (formData) => {
        try {
            console.log("=========================================");
            console.log("📝 API - CREATE APPLICATION");
            console.log("=========================================");
            
            const token = localStorage.getItem('agentToken');
            const response = await api.post('/agent/applications', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log("📥 Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Create Application Error:", error.response?.data);
            throw error;
        }
    },

    // Get all applications of logged-in agent
    getMyApplications: async () => {
        try {
            console.log("=========================================");
            console.log("📋 API - GET MY APPLICATIONS");
            console.log("=========================================");
            
            const token = localStorage.getItem('agentToken');
            const response = await api.get('/agent/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log("📥 Applications:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Get Applications Error:", error.response?.data);
            throw error;
        }
    },

    // Get single application by ID
    getApplicationById: async (id) => {
        try {
            console.log("=========================================");
            console.log("📄 API - GET APPLICATION:", id);
            console.log("=========================================");
            
            const token = localStorage.getItem('agentToken');
            const response = await api.get(`/agent/applications/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log("📥 Application:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Get Application Error:", error.response?.data);
            throw error;
        }
    },

    // Delete application
    deleteApplication: async (id) => {
        try {
            console.log("=========================================");
            console.log("🗑️ API - DELETE APPLICATION:", id);
            console.log("=========================================");
            
            const token = localStorage.getItem('agentToken');
            const response = await api.delete(`/agent/applications/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log("📥 Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Delete Application Error:", error.response?.data);
            throw error;
        }
    },
// =============================================
// APPLICATION APIs
// =============================================

// Update application
updateApplication: async (id, formData) => {
    try {
        console.log("📝 API - UPDATE APPLICATION:", id);
        const token = localStorage.getItem('agentToken');
        const response = await api.put(`/agent/applications/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("📥 Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Update Application Error:", error.response?.data);
        throw error;
    }
},

// Get application stats
getApplicationStats: async () => {
    try {
        console.log("📊 API - GET APPLICATION STATS");
        const token = localStorage.getItem('agentToken');
        const response = await api.get('/agent/applications/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("📥 Stats:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Get Stats Error:", error.response?.data);
        throw error;
    }
},
    // =============================================
    // UTILITY FUNCTIONS
    // =============================================
    
    logout: () => {
        localStorage.removeItem('agentToken');
        localStorage.removeItem('agentData');
        window.location.href = '/agent/login';
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('agentToken');
    },

    getToken: () => {
        return localStorage.getItem('agentToken');
    },

    getAgentData: () => {
        try {
            const data = localStorage.getItem('agentData');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },// src/api/agentApi.js
// Add this section

payments: {
    // Get all my payments
    getAll: async (filters = {}) => {
        try {
            const token = localStorage.getItem('agentToken');
            const response = await api.get('/agent/payments', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: filters
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get stats
    getStats: async () => {
        try {
            const token = localStorage.getItem('agentToken');
            const response = await api.get('/agent/payments/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get single
    getById: async (id) => {
        try {
            const token = localStorage.getItem('agentToken');
            const response = await api.get(`/agent/payments/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Monthly summary
    getMonthlySummary: async () => {
        try {
            const token = localStorage.getItem('agentToken');
            const response = await api.get('/agent/payments/monthly-summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
},// src/api/agentApi.js
// Add to agentApi object
// ===== CERTIFICATE =====
getCertificate: async () => {
    try {
        console.log("🎓 API - GET CERTIFICATE");
        const token = localStorage.getItem('agentToken');
        const response = await api.get('/agent/certificate', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Certificate Error:', error.response?.data);
        throw error;
    }
},
getDashboardStats: async () => {
    try {
        console.log("📊 API - AGENT DASHBOARD STATS");
        const token = localStorage.getItem('agentToken');
        const response = await api.get('/agent/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Dashboard Error:', error.response?.data);
        throw error;
    }
},
};

export default agentApi;