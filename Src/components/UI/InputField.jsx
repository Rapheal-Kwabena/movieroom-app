// src/components/UI/InputField.jsx
import React from 'react';
import './InputField.css'; // Component-specific styling

const InputField = ({ label, type = 'text', placeholder, value, onChange, ...props }) => {
    return (
        <div className="input-field-group">
            {label && <label className="input-label">{label}</label>}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="themed-input"
                {...props}
            />
        </div>
    );
};

export default InputField;