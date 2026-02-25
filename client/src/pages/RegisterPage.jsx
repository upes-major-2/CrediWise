import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', consentToDataShare: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (form.password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.consentToDataShare);
            toast.success('Account created! Welcome to CrediWise 🎉');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-glow" />
            <div className="auth-card glass-card animate-fade-in">
                <div className="auth-logo">
                    <span className="auth-gem">💎</span>
                    <span className="auth-brand">CrediWise</span>
                </div>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-sub">Free forever. No credit card required.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-name">Full Name</label>
                        <input id="reg-name" type="text" className="form-input" placeholder="Rahul Sharma" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email</label>
                        <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password</label>
                        <input id="reg-password" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                        <input id="reg-confirm" type="password" className="form-input" placeholder="Repeat your password" value={form.confirmPassword}
                            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                    </div>
                    <label className="consent-label">
                        <input type="checkbox" checked={form.consentToDataShare}
                            onChange={e => setForm(f => ({ ...f, consentToDataShare: e.target.checked }))} />
                        <span>I consent to CrediWise storing my expense and reward data to provide personalized insights.</span>
                    </label>
                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account →'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
