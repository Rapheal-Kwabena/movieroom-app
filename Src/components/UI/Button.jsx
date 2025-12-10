// src/components/UI/Button.jsx
import React from 'react';
import './Button.css'; // Import component-specific styles

const Button = ({ children, onClick, type = 'button', variant = 'primary', ...props }) => {
    return (
        <button
            className={`btn btn-${variant}`}
            onClick={onClick}
            type={type}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;