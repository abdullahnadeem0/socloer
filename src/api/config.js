import axios from 'axios';

// ✅ Vite ke environment variables use karein
export const API_URL = import.meta.env.VITE_API_URL || 'https://newsoloer-e3ov1m4wx-abdullahnadeem0s-projects.vercel.app/api';
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://newsoloer-e3ov1m4wx-abdullahnadeem0s-projects.vercel.app/';

// ✅ Helper to get full file URL (for images/logos)
export const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${SERVER_URL}${cleanPath}`;
};

// Axios instance create karein
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds
});

export default api;