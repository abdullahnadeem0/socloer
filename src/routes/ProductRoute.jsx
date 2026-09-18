import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductRoute = ({ children }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Token check karein
        const token = localStorage.getItem('adminToken');
        
        // Agar token nahi hai toh Home pe navigate karein
        if (!token) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    // Agar token hai toh children (page) dikhao
    return children;
};

export default ProductRoute;