import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const successMessage = location.state?.message;

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      
      if (data.success) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setServerError(data.message || 'Login failed');
      }
    } catch (error) {
      setServerError('An error occurred while connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
    if (serverError) setServerError('');
  };

  return (
    <div className="auth-page">
      {/* Left visual */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000&q=85"
          alt="Travel landscape"
          className="auth-visual-img"
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-logo">
          <div className="auth-visual-logo-icon">
            <Globe size={18} color="white" />
          </div>
          <span className="auth-visual-logo-text">GlobeTrotter</span>
        </div>
        <div className="auth-visual-content">
          <div className="auth-visual-quote">
            "The world is a book, and those who do not travel read only one page."
          </div>
          <div className="auth-visual-author">— Saint Augustine</div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-panel">
        <div className="auth-form-header">
          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-subtitle">
            Sign in to continue planning your adventures.
          </p>
        </div>

        {successMessage && (
          <div style={{ backgroundColor: '#e6f4ea', color: '#137333', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
            {successMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                className="form-input-action"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Forgot */}
          <div className="auth-forgot">
            <a href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>

          {serverError && (
            <div className="field-error" style={{ marginBottom: '16px', textAlign: 'center' }}>
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            id="login-submit"
            style={{ justifyContent: 'center', padding: '13px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-divider">or continue with</div>

          <button
            type="button"
            className="auth-social-btn"
            id="login-google"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.7 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 3l6.4-6.4C34.4 4.1 29.5 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 6 1.1 8.2 3l6.4-6.4C34.4 4.1 29.5 2 24 2 15.9 2 8.8 7.4 6.3 14.7z"/>
              <path fill="#FBBC05" d="M24 46c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 37.6 27 38.5 24 38.5c-5.5 0-10-3.2-11.7-7.8l-7 5.4C8.9 42.7 15.9 46 24 46z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.5 5.3C41.8 36.3 44.5 30.6 44.5 24c0-1.3-.2-2.7-.5-4z"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-form-footer">
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-form-link"
              onClick={() => navigate('/signup')}
            >
              Create one
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
