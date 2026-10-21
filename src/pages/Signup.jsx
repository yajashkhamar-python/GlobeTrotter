import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../services/api';
import './auth.css';

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const pwStrength = getPasswordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      } else {
        setServerError(data.message || 'Registration failed');
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

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength];
  const strengthClass = ['', 'weak', 'weak', 'medium', 'strong'][pwStrength];

  return (
    <div className="auth-page">
      {/* Left visual */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=85"
          alt="Tropical beach travel"
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
            "Not all those who wander are lost."
          </div>
          <div className="auth-visual-author">— J.R.R. Tolkien</div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-panel">
        <div className="auth-form-header">
          <h1 className="auth-form-title">Create your account</h1>
          <p className="auth-form-subtitle">
            Start planning your dream trips today. Free forever.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Alex Traveler"
              value={form.name}
              onChange={handleChange('name')}
              autoComplete="name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
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
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
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
            {form.password && (
              <>
                <div className="password-strength">
                  {[1,2,3,4].map(i => (
                    <div
                      key={i}
                      className={`strength-bar ${i <= pwStrength ? strengthClass : ''}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-secondary">{strengthLabel}</span>
              </>
            )}
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
            <div className="form-input-wrapper">
              <input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                autoComplete="new-password"
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                className="form-input-action"
                onClick={() => setShowConfirm(s => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
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
            id="signup-submit"
            style={{ justifyContent: 'center', padding: '13px' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="auth-form-footer">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-form-link"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </p>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            By creating an account, you agree to our{' '}
            <a href="#" style={{ color: 'var(--color-accent)' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: 'var(--color-accent)' }}>Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
