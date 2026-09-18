// src/Pages/NotFound/NotFound.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // ============================================
    // MOUSE PARALLAX EFFECT
    // ============================================
    useEffect(() => {
        const shapes = document.querySelectorAll('.bg-shape');
        const container = containerRef.current;

        const handleMouseMove = (e) => {
            // Background shapes parallax
            shapes.forEach(shape => {
                const speed = shape.getAttribute('data-speed');
                const xOffset = (window.innerWidth / 2 - e.clientX) * speed / 50;
                const yOffset = (window.innerHeight / 2 - e.clientY) * speed / 50;
                shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });

            // Container tilt effect
            if (container) {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
                container.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            }
        };

        const handleMouseLeave = () => {
            if (container) {
                container.style.transform = `rotateY(0deg) rotateX(0deg)`;
                container.style.transition = 'all 0.5s ease';
            }
        };

        const handleMouseEnter = () => {
            if (container) {
                container.style.transition = 'none';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, []);

    return (
        <div className="NotFound">
            {/* Creative Background Shapes */}
            <div className="bg-shape shape-1" data-speed="2"></div>
            <div className="bg-shape shape-2" data-speed="-2"></div>
            <div className="bg-shape shape-3" data-speed="1"></div>

            {/* Main Content */}
            <div className="container" ref={containerRef}>
                <div className="error-code">404</div>
                <h1 className="error-message">Oops! Page not found.</h1>
                <p className="error-description">
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable. Let's get you back on track.
                </p>
                <button
                    className="home-btn"
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;