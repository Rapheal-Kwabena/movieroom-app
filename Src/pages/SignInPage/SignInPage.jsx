// src/pages/SignInPage/SignInPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/UI/Navbar';
import Button from '../../components/UI/Button';
import InputField from '../../components/UI/InputField';
import './SignInPage.css';

const SignInPage = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validation
            if (!formData.username.trim()) {
                throw new Error('Username is required');
            }

            if (!formData.password.trim()) {
                throw new Error('Password is required');
            }

            if (isSignUp) {
                if (!formData.email.trim()) {
                    throw new Error('Email is required');
                }
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (formData.password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
            }

            // TODO: Replace with actual API call
            // For now, simulate authentication
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store user info in localStorage (temporary solution)
            localStorage.setItem('movieroom_user', JSON.stringify({
                username: formData.username,
                email: formData.email || `${formData.username}@movieroom.app`,
                loggedIn: true,
            }));

            // Redirect to home page
            navigate('/');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
    };

    return (
        <>
            <Navbar />
            <main className="signin-page-content">
                <div className="signin-container">
                    <div className="signin-card">
                        <div className="signin-header">
                            <h1>{isSignUp ? '🎬 Create Account' : '🎬 Welcome Back'}</h1>
                            <p className="signin-subtitle">
                                {isSignUp 
                                    ? 'Join MovieRoom and start watching together' 
                                    : 'Sign in to continue your movie journey'}
                            </p>
                        </div>

                        {error && (
                            <div className="error-banner">
                                ⚠️ {error}
                            </div>
                        )}

                        <form className="signin-form" onSubmit={handleSubmit}>
                            <InputField
                                label="Username"
                                name="username"
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />

                            {isSignUp && (
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            )}

                            <InputField
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            {isSignUp && (
                                <InputField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            )}

                            {!isSignUp && (
                                <div className="forgot-password">
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        alert('Password reset feature coming soon!');
                                    }}>
                                        Forgot password?
                                    </a>
                                </div>
                            )}

                            <Button type="submit" disabled={loading}>
                                {loading 
                                    ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                                    : (isSignUp ? 'Sign Up' : 'Sign In')
                                }
                            </Button>
                        </form>

                        <div className="signin-divider">
                            <span>OR</span>
                        </div>

                        <div className="social-signin">
                            <button className="social-btn google-btn" onClick={() => alert('Google Sign In coming soon!')}>
                                <span className="social-icon">🔵</span>
                                Continue with Google
                            </button>
                            <button className="social-btn github-btn" onClick={() => alert('GitHub Sign In coming soon!')}>
                                <span className="social-icon">⚫</span>
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="signin-footer">
                            {isSignUp ? (
                                <p>
                                    Already have an account?{' '}
                                    <button className="toggle-link" onClick={toggleMode}>
                                        Sign In
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    Don't have an account?{' '}
                                    <button className="toggle-link" onClick={toggleMode}>
                                        Sign Up
                                    </button>
                                </p>
                            )}
                        </div>

                        <div className="guest-access">
                            <p>or</p>
                            <Link to="/" className="guest-link">
                                Continue as Guest →
                            </Link>
                        </div>
                    </div>

                    <div className="signin-illustration">
                        <div className="illustration-content">
                            <h2>🎬 Watch Movies Together</h2>
                            <ul>
                                <li>✨ Create private or public rooms</li>
                                <li>💬 Chat in real-time</li>
                                <li>😊 React at movie moments</li>
                                <li>⏱️ Synchronized playback</li>
                                <li>🎉 Join trending rooms</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default SignInPage;