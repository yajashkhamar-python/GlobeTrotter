import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CalendarDays, MapPin, FileText, Wand2, Sparkles } from 'lucide-react';
import { fetchApi } from '../services/api';
import './CreateTrip.css';

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
];

export default function CreateTrip() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCityId = searchParams.get('cityId');
  const initialCityName = searchParams.get('cityName');
  const isEditMode = Boolean(id);
  const passedCoverImage = location.state?.coverImage || '';

  const [form, setForm] = useState({
    name: initialCityName ? `${initialCityName} Trip` : '',
    startDate: '',
    endDate: '',
    description: '',
    coverImage: passedCoverImage,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  // Date calculation
  const getToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getToday();
  const [originalStartDate, setOriginalStartDate] = useState(null);

  // Debounced image search
  useEffect(() => {
    if (isEditMode || passedCoverImage) return;
    const timer = setTimeout(async () => {
      const query = form.name.trim();
      if (!query || query.length < 3) return;

      setImageLoading(true);
      try {
        const searchTerms = encodeURIComponent(query);
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${searchTerms}`);
        if (res.ok) {
          const data = await res.json();
          if (data.originalimage && data.originalimage.source) {
            setForm(f => ({ ...f, coverImage: data.originalimage.source }));
          }
        }
      } catch (err) {
        console.error('Image search failed:', err);
      } finally {
        setImageLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.name, isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      const loadTrip = async () => {
        try {
          const data = await fetchApi(`/trips/${id}`);
          if (data.success && data.trip) {
            setForm({
              name: data.trip.name || '',
              startDate: data.trip.start_date ? new Date(data.trip.start_date).toISOString().split('T')[0] : '',
              endDate: data.trip.end_date ? new Date(data.trip.end_date).toISOString().split('T')[0] : '',
              description: data.trip.description || '',
              coverImage: data.trip.cover_image || '',
            });
            setOriginalStartDate(data.trip.start_date ? new Date(data.trip.start_date).toISOString().split('T')[0] : null);
          }
        } catch (error) {
          setServerError('Failed to load trip details');
        }
      };
      loadTrip();
    }
  }, [id, isEditMode]);

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
    if (serverError) setServerError('');
  };

  const minStartDate = isEditMode && originalStartDate && originalStartDate < todayStr ? originalStartDate : todayStr;
  const effectiveMinEndDate = form.startDate && form.startDate > minStartDate ? form.startDate : minStartDate;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Trip name is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    else if (form.startDate < minStartDate) errs.startDate = 'Start date cannot be in the past';
    
    if (!form.endDate) errs.endDate = 'End date is required';
    else if (form.endDate < effectiveMinEndDate) errs.endDate = 'End date must be on or after start date';
    
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setServerError('');

    try {
      const payload = {
        name: form.name,
        start_date: form.startDate,
        end_date: form.endDate,
        description: form.description,
        cover_image: form.coverImage,
      };

      if (isEditMode) {
        await fetchApi(`/trips/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        navigate(`/trips/${id}`);
      } else {
        const response = await fetchApi('/trips', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        
        // If created from Explore page with a destination
        if (initialCityId && response.success && response.trip) {
          try {
            await fetchApi(`/trips/${response.trip.id}/stops`, {
              method: 'POST',
              body: JSON.stringify({
                city_id: initialCityId,
                start_date: payload.start_date,
                end_date: payload.end_date
              })
            });
          } catch (stopErr) {
            console.error('Failed to auto-add trip stop:', stopErr);
            // Non-fatal, just continue
          }
        }
        
        navigate(`/trips/${response.trip.id}`);
      }
    } catch (error) {
      setServerError(error.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const previewImage = form.coverImage || DEFAULT_COVERS[0];
  const duration = form.startDate && form.endDate
    ? Math.max(0, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000)) + 1
    : null;

  return (
    <div className="create-trip-page">
      <div className="create-trip-header">
        <h1 className="create-trip-title">{isEditMode ? 'Edit your trip' : 'Create your trip'}</h1>
        <p className="create-trip-subtitle">
          {isEditMode ? 'Update the details of your trip.' : 'Fill in the details to start building your itinerary.'}
        </p>
      </div>

      {!isEditMode && (
        <div style={{ 
          margin: '0 auto var(--space-6) auto', 
          maxWidth: '1000px', 
          background: 'linear-gradient(135deg, rgba(29, 91, 239, 0.1), rgba(124, 58, 237, 0.1))', 
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: 'var(--radius-lg)', 
          padding: 'var(--space-4) var(--space-6)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: '#7c3aed' }} /> Don't want to start from scratch?
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: 0 }}>
              Use our smart planner to automatically build an itinerary based on your preferences.
            </p>
          </div>
          <button 
            className="btn" 
            style={{ background: 'linear-gradient(135deg, #1d5bef, #7c3aed)', color: 'white', border: 'none', padding: '8px 16px' }}
            onClick={() => navigate(initialCityId ? `/plan?cityId=${initialCityId}` : '/plan')}
          >
            <Wand2 size={16} /> Plan with GlobeTrotter
          </button>
        </div>
      )}

      {serverError && (
        <div className="field-error" style={{ marginBottom: '16px', textAlign: 'center', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
          {serverError}
        </div>
      )}

      <div className="create-trip-layout">
        {/* Form */}
        <form className="create-trip-form-panel" onSubmit={handleSubmit} noValidate>
          {/* Trip Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-name">Trip Name *</label>
            <input
              id="trip-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. European Summer Adventure"
              value={form.name}
              onChange={handleChange('name')}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Dates */}
          <div className="form-date-row">
            <div className="form-group">
              <label className="form-label" htmlFor="trip-start">Start Date *</label>
              <div className="form-input-wrapper">
                <CalendarDays size={15} className="form-input-icon" />
                <input
                  id="trip-start"
                  type="date"
                  className={`form-input ${errors.startDate ? 'error' : ''}`}
                  style={{ paddingLeft: '38px' }}
                  value={form.startDate}
                  onChange={handleChange('startDate')}
                  min={minStartDate}
                />
              </div>
              {errors.startDate && <span className="field-error">{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="trip-end">End Date *</label>
              <div className="form-input-wrapper">
                <CalendarDays size={15} className="form-input-icon" />
                <input
                  id="trip-end"
                  type="date"
                  className={`form-input ${errors.endDate ? 'error' : ''}`}
                  style={{ paddingLeft: '38px' }}
                  value={form.endDate}
                  onChange={handleChange('endDate')}
                  min={effectiveMinEndDate}
                />
              </div>
              {errors.endDate && <span className="field-error">{errors.endDate}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-desc">Description</label>
            <div className="form-input-wrapper">
              <FileText size={15} className="form-input-icon" style={{ top: '14px', transform: 'none' }} />
              <textarea
                id="trip-desc"
                className="form-input"
                placeholder="Describe your trip..."
                value={form.description}
                onChange={handleChange('description')}
                rows={3}
                style={{ paddingLeft: '38px', resize: 'vertical', minHeight: '80px' }}
              />
            </div>
          </div>

          {/* Removed manual Cover Image URL and Quick Pick Covers */}

          {/* Actions */}
          <div className="create-trip-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/trips')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="create-trip-submit"
            >
              {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Trip →' : 'Create Trip →')}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="create-trip-preview">
          {imageLoading ? (
            <div className="preview-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
              Loading image...
            </div>
          ) : (
            <img src={previewImage} alt="Trip preview" className="preview-image" loading="lazy" onError={(e) => { e.target.src = DEFAULT_COVERS[0] }} />
          )}
          <div className="preview-body">
            <div className="preview-label">Preview</div>
            <div className="preview-trip-name">
              {form.name || <span style={{ color: 'var(--color-text-muted)' }}>Your trip name</span>}
            </div>
            <div className="preview-meta">
              {form.startDate && (
                <div className="preview-meta-item">
                  <CalendarDays size={13} />
                  <span>
                    {new Date(form.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {form.endDate && ` — ${new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </span>
                </div>
              )}
              {duration !== null && (
                <div className="preview-meta-item">
                  <MapPin size={13} />
                  <span>{duration} day{duration !== 1 ? 's' : ''}</span>
                </div>
              )}
              {form.description && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                  {form.description.slice(0, 100)}{form.description.length > 100 ? '...' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
