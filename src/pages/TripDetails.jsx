import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, CalendarDays, Activity, Plus, Wallet, Pencil, Share2,
  CheckCircle, XCircle, ChevronUp, ChevronDown, Trash2, Clock,
  DollarSign, Star, Globe, Search, X, Sparkles,
  Map as MapIcon, Zap, Info, Eye, Compass, BarChart2, TrendingUp
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import AIAssistant from '../components/AIAssistant/AIAssistant';
import InteractiveMap from '../components/InteractiveMap/InteractiveMap';
import '../components/common/common.css';
import './TripDetails.css';

// ─── Image Fallbacks ─────────────────────────────────────────────────────────

const CITY_FALLBACKS = {
  'London':    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'Paris':     'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Dubai':     'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'Tokyo':     'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'Rome':      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'New York':  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'Phuket':    'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
  'Bali':      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'Bangkok':   'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  'Sydney':    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Mumbai':    'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80',
  'Maldives':  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
};

const ACTIVITY_FALLBACKS = {
  'Tower Bridge':      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
  'Eiffel Tower':      'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600&q=80',
  'Louvre Museum':     'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
  'Colosseum':         'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80',
  'Burj Khalifa':      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  'Senso-ji Temple':   'https://images.unsplash.com/photo-1590214815259-25ea8c087dc2?w=600&q=80',
};

const TYPE_FALLBACKS = {
  Museum:        'https://images.unsplash.com/photo-1562832135-14a35d25edef?w=600&q=80',
  Landmark:      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
  Sightseeing:   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  Food:          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
  Culture:       'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80',
  Nature:        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  Shopping:      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  Adventure:     'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
  Experience:    'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=600&q=80',
  'Water Sports':'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=600&q=80',
};

const GENERIC_FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80';

const CATEGORY_COLORS = {
  Museum: '#8b5cf6', Landmark: '#3b82f6', Sightseeing: '#06b6d4',
  Food: '#f59e0b', Culture: '#ec4899', Nature: '#22c55e',
  Shopping: '#f97316', Adventure: '#ef4444', Experience: '#0ea5e9',
  'Water Sports': '#14b8a6',
};

function getActivityImage(a) {
  if (a?.image) return a.image;
  if (a?.name && ACTIVITY_FALLBACKS[a.name]) return ACTIVITY_FALLBACKS[a.name];
  if (a?.type && TYPE_FALLBACKS[a.type]) return TYPE_FALLBACKS[a.type];
  return GENERIC_FALLBACK;
}

function getCityImage(city) {
  if (city?.image) return city.image;
  if (city?.name && CITY_FALLBACKS[city.name]) return CITY_FALLBACKS[city.name];
  return GENERIC_FALLBACK;
}

function formatDate(d, opts = {}) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
}

function formatDateShort(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function daysBetween(d1, d2) {
  if (!d1 || !d2) return 0;
  return Math.max(0, Math.round((new Date(d2) - new Date(d1)) / 86400000)) + 1;
}

// ─── Smart Image ─────────────────────────────────────────────────────────────

function Img({ src, fallback, alt, className, style }) {
  const [cur, setCur] = useState(src || fallback || GENERIC_FALLBACK);
  useEffect(() => { setCur(src || fallback || GENERIC_FALLBACK); }, [src, fallback]);
  return (
    <img src={cur} alt={alt || ''} className={className}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
      onError={() => { if (cur !== fallback && fallback) setCur(fallback); else if (cur !== GENERIC_FALLBACK) setCur(GENERIC_FALLBACK); }} />
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div className="td-toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`td-toast td-toast--${t.type}`}>
          {t.type === 'success' && <CheckCircle size={16} />}
          {t.type === 'error' && <XCircle size={16} />}
          {t.type === 'info' && <Info size={16} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity, onAdd, onView }) {
  const { t } = useLanguage();
  const color = CATEGORY_COLORS[activity.type] || '#64748b';
  return (
    <div className="td-act-card" onClick={() => onView(activity)}>
      <div className="td-act-img">
        <Img src={getActivityImage(activity)} fallback={GENERIC_FALLBACK} alt={activity.name} />
        <div className="td-act-type-badge" style={{ background: color }}>{activity.type || 'Activity'}</div>
        {Number(activity.cost) > 0 && (
          <div className="td-act-price-badge">₹{Number(activity.cost).toFixed(0)}</div>
        )}
      </div>
      <div className="td-act-body">
        <h4 className="td-act-name">{activity.name}</h4>
        <div className="td-act-meta-row">
          {activity.duration && <span className="td-act-meta-item"><Clock size={11} />{activity.duration}</span>}
          {activity.rating && <span className="td-act-meta-item td-act-rating"><Star size={11} fill="currentColor" />{activity.rating}</span>}
          {!Number(activity.cost) && <span className="td-act-free">Free</span>}
        </div>
        <div className="td-act-actions">
          <button className="td-act-btn-ghost" onClick={e => { e.stopPropagation(); onView(activity); }}>
            <Eye size={12} /> Details
          </button>
          <button className="td-act-btn-add" onClick={e => { e.stopPropagation(); onAdd(activity); }}>
            <Plus size={12} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Destination Stop Card ────────────────────────────────────────────────────

function StopCard({ stop, index, isActive, total, onSelect, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div className={`td-stop ${isActive ? 'td-stop--active' : ''}`} onClick={() => onSelect(index)}>
      <div className="td-stop-img">
        <Img src={getCityImage(stop.city)} fallback={GENERIC_FALLBACK} alt={stop.city?.name} />
        <div className="td-stop-num">{index + 1}</div>
      </div>
      <div className="td-stop-body">
        <div className="td-stop-row">
          <div>
            <div className="td-stop-city">{stop.city?.name}</div>
            <div className="td-stop-country"><Globe size={10} />{stop.city?.country}</div>
          </div>
          <div className="td-stop-actions" onClick={e => e.stopPropagation()}>
            <button onClick={() => onMoveUp(index)} disabled={index === 0}><ChevronUp size={11} /></button>
            <button onClick={() => onMoveDown(index)} disabled={index === total - 1}><ChevronDown size={11} /></button>
            <button className="danger" onClick={() => onRemove(stop.id)}><Trash2 size={11} /></button>
          </div>
        </div>
        <div className="td-stop-dates"><CalendarDays size={10} />{formatDateShort(stop.start_date)} – {formatDateShort(stop.end_date)}</div>
        <div className="td-stop-chips">
          <span>{daysBetween(stop.start_date, stop.end_date)}d</span>
          <span className="accent">{stop.activities?.length || 0} activities</span>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Progress Bar ────────────────────────────────────────────────────────

function MiniBar({ pct, color = 'var(--color-accent)' }) {
  return (
    <div className="td-minibar-track">
      <div className="td-minibar-fill" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [trip, setTrip]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeStop, setActiveStop]   = useState(0);

  const [showAddStop, setShowAddStop]                   = useState(false);
  const [showShare, setShowShare]                       = useState(false);
  const [showAI, setShowAI]                             = useState(false);
  const [showActDetail, setShowActDetail]               = useState(null);
  const [showAddActModal, setShowAddActModal]           = useState(null);
  const [shareSettings, setShareSettings]               = useState({ is_public: false, share_token: null });

  const [cities, setCities]             = useState([]);
  const [citySearch, setCitySearch]     = useState('');
  const [selCity, setSelCity]           = useState(null);
  const [cityActs, setCityActs]         = useState([]);
  const [cityActsLoading, setCityActsLoading] = useState(false);
  const [stopForm, setStopForm]         = useState({ start_date: '', end_date: '' });
  const [stopErr, setStopErr]           = useState('');
  const [addingStop, setAddingStop]     = useState(false);

  const [actForm, setActForm]           = useState({ date: '', start_time: '09:00' });
  const [actErr, setActErr]             = useState('');
  const [addingAct, setAddingAct]       = useState(false);
  const [actFilter, setActFilter]       = useState('All');
  const [actSearch, setActSearch]       = useState('');
  const [toasts, setToasts]             = useState([]);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message: msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const loadTrip = useCallback(async () => {
    try {
      const [td, br, er] = await Promise.all([
        fetchApi(`/trips/${id}`),
        fetchApi(`/trips/${id}/budget`).catch(() => ({ success: false })),
        fetchApi(`/trips/${id}/expenses`).catch(() => ({ success: false })),
      ]);
      if (td.success) {
        const raw = td.trip;
        const end = new Date(raw.end_date), start = new Date(raw.start_date);
        setTrip({
          ...raw,
          startDate: raw.start_date, endDate: raw.end_date, coverImage: raw.cover_image,
          cityCount: raw.stops?.length || 0,
          totalDays: Math.max(1, Math.ceil((end - start) / 86400000) + 1),
          status: end < new Date() ? 'Completed' : start > new Date() ? 'Upcoming' : 'Active',
          budgetLimit: br.success ? (br.budget?.budget_limit || 0) : 0,
          expenses: er.success ? (er.expenses || []) : [],
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadTrip(); }, [loadTrip]);

  useEffect(() => {
    if (showAddStop) fetchApi('/cities').then(d => setCities(d.cities || []));
  }, [showAddStop]);

  useEffect(() => {
    if (showShare && trip?.id) {
      fetchApi(`/trips/${trip.id}/share`).then(d => { if (d.success) setShareSettings(d.share); });
    }
  }, [showShare, trip?.id]);

  const currentStop   = trip?.stops?.[activeStop];
  const stopActivities = currentStop?.activities || [];

  useEffect(() => {
    const cid = selCity ? selCity.id : currentStop?.city?.id;
    if (!cid) { setCityActs([]); return; }
    setCityActsLoading(true);
    fetchApi(`/cities/${cid}/activities`)
      .then(d => setCityActs(d.activities || []))
      .catch(() => setCityActs([]))
      .finally(() => setCityActsLoading(false));
  }, [selCity, currentStop?.city?.id]);

  const totalActivities = useMemo(() => (trip?.stops || []).reduce((a, s) => a + (s.activities?.length || 0), 0), [trip]);
  const totalCost = useMemo(() => (trip?.stops || []).reduce((sum, s) =>
    sum + (s.activities || []).reduce((a, act) => a + parseFloat(act.activity?.cost || act.custom_cost || 0), 0), 0), [trip]);

  const dayGroups = useMemo(() => stopActivities.reduce((acc, act) => {
    const key = act.date
      ? formatDate(act.date, { weekday: 'short', day: 'numeric', month: 'long' })
      : 'Unscheduled';
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {}), [stopActivities]);

  const activityTypes = useMemo(() => ['All', ...new Set(cityActs.map(a => a.type).filter(Boolean))], [cityActs]);

  const filteredActs = useMemo(() => {
    const usedIds = new Set(stopActivities.map(a => a.activity?.id));
    let res = cityActs.filter(a => !usedIds.has(a.id));
    if (actFilter !== 'All') res = res.filter(a => a.type === actFilter);
    if (actSearch.trim()) {
      const q = actSearch.toLowerCase();
      res = res.filter(a => a.name?.toLowerCase().includes(q) || a.type?.toLowerCase().includes(q));
    }
    return res;
  }, [cityActs, actFilter, actSearch, stopActivities]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
  }, [cities, citySearch]);

  // Analytics
  const categoryBreakdown = useMemo(() => {
    const map = {};
    (trip?.stops || []).forEach(s => (s.activities || []).forEach(a => {
      const type = a.activity?.type || 'Other';
      map[type] = (map[type] || 0) + 1;
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [trip]);

  const budgetUsed = useMemo(() => (trip?.expenses || []).reduce((s, e) => s + parseFloat(e.amount || 0), 0), [trip]);

  // Handlers
  const handleAddStop = async () => {
    if (!selCity) { setStopErr('Please select a destination.'); return; }
    if (!stopForm.start_date || !stopForm.end_date) { setStopErr('Please select travel dates.'); return; }
    if (stopForm.start_date > stopForm.end_date) { setStopErr('End date must be after start date.'); return; }
    setAddingStop(true);
    try {
      const res = await fetchApi(`/trips/${trip.id}/stops`, { method: 'POST', body: JSON.stringify({ city_id: selCity.id, ...stopForm }) });
      if (res.success) { addToast(`${selCity.name} added!`); setShowAddStop(false); setSelCity(null); setStopForm({ start_date: '', end_date: '' }); setActiveStop((trip?.stops?.length) || 0); await loadTrip(); }
      else setStopErr(res.message || 'Failed to add.');
    } catch (err) { setStopErr(err.message); } finally { setAddingStop(false); }
  };

  const handleRemoveStop = async (stopId) => {
    if (!window.confirm('Remove this destination and all its activities?')) return;
    const res = await fetchApi(`/stops/${stopId}`, { method: 'DELETE' });
    if (res.success) { addToast('Destination removed.', 'info'); setActiveStop(0); await loadTrip(); }
  };

  const handleReorderStops = async (dir, idx) => {
    const newStops = [...trip.stops];
    [newStops[idx], newStops[idx + dir]] = [newStops[idx + dir], newStops[idx]];
    const res = await fetchApi(`/trips/${trip.id}/stops/reorder`, { method: 'PUT', body: JSON.stringify({ stopIds: newStops.map(s => s.id) }) });
    if (res.success) { setActiveStop(idx + dir); await loadTrip(); }
  };

  const handleAddActivity = async () => {
    if (!actForm.date) { setActErr('Please select a date.'); return; }
    const act = showAddActModal;
    if (!act || !currentStop) return;
    const stopStart = currentStop.start_date?.split('T')[0], stopEnd = currentStop.end_date?.split('T')[0];
    if (stopStart && actForm.date < stopStart) { setActErr(`Date must be on or after ${formatDateShort(stopStart)}.`); return; }
    if (stopEnd && actForm.date > stopEnd) { setActErr(`Date must be on or before ${formatDateShort(stopEnd)}.`); return; }
    setAddingAct(true);
    try {
      const res = await fetchApi(`/stops/${currentStop.id}/activities`, { method: 'POST', body: JSON.stringify({ activity_id: act.id, date: actForm.date, start_time: actForm.start_time }) });
      if (res.success) { addToast(`${act.name} added to itinerary!`); setShowAddActModal(null); setActForm({ date: '', start_time: '09:00' }); setActErr(''); await loadTrip(); }
      else setActErr(res.message || 'Failed to add activity.');
    } catch (err) { setActErr(err.message); } finally { setAddingAct(false); }
  };

  const handleRemoveActivity = async (actId, actName) => {
    if (!window.confirm(`Remove "${actName}" from your itinerary?`)) return;
    const res = await fetchApi(`/trip-activities/${actId}`, { method: 'DELETE' });
    if (res.success) { addToast('Activity removed.', 'info'); await loadTrip(); }
  };

  const handleReorderActivity = async (actId, dir, curIdx) => {
    const grp = Object.values(dayGroups).find(acts => acts.some(a => a.id === actId));
    if (!grp) return;
    const ti = curIdx + dir;
    if (ti < 0 || ti >= grp.length) return;
    await Promise.all([
      fetchApi(`/trip-activities/${grp[curIdx].id}`, { method: 'PUT', body: JSON.stringify({ activity_order: grp[ti].activity_order ?? ti }) }),
      fetchApi(`/trip-activities/${grp[ti].id}`, { method: 'PUT', body: JSON.stringify({ activity_order: grp[curIdx].activity_order ?? curIdx }) }),
    ]);
    addToast('Order updated'); await loadTrip();
  };

  const handleUpdateShare = async (is_public) => {
    const res = await fetchApi(`/trips/${trip.id}/share`, { method: 'PUT', body: JSON.stringify({ is_public }) });
    if (res.success) { setShareSettings(res.share); addToast(is_public ? 'Trip is now public' : 'Trip is now private'); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/shared/${shareSettings.share_token}`);
    addToast('Link copied!');
  };

  // ─── Loading / Not Found ─────────────────────────────────────────────────
  if (loading) return (
    <div className="td-loading">
      <div className="td-spinner" />
      <p>Loading your trip…</p>
    </div>
  );

  if (!trip) return (
    <div className="td-not-found">
      <MapPin size={48} />
      <h2>Trip not found</h2>
      <p>This trip doesn't exist or may have been deleted.</p>
      <button className="td-btn-primary" onClick={() => navigate('/trips')}>← Back to My Trips</button>
    </div>
  );

  const heroImage = getCityImage(currentStop?.city) || trip.coverImage || GENERIC_FALLBACK;
  const statusColor = { Active: '#22c55e', Upcoming: '#3b82f6', Completed: '#94a3b8' }[trip.status] || '#94a3b8';

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="td-page">
      <Toast toasts={toasts} />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="td-hero">
        <div className="td-hero-bg">
          <Img src={heroImage} fallback={GENERIC_FALLBACK} alt={trip.name} />
        </div>
        <div className="td-hero-overlay" />
        <div className="td-hero-inner">
          <div className="td-hero-left">
            <div className="td-hero-thumb">
              <Img src={heroImage} fallback={GENERIC_FALLBACK} alt={trip.name} />
            </div>
            <div className="td-hero-text">
              <div className="td-hero-top-row">
                <h1 className="td-hero-title">{trip.name}</h1>
                <span className="td-hero-status" style={{ color: statusColor, borderColor: `${statusColor}40`, background: `${statusColor}18` }}>
                  {trip.status}
                </span>
              </div>
              <div className="td-hero-meta">
                {currentStop?.city && (
                  <span><MapPin size={13} />{currentStop.city.name}, {currentStop.city.country}</span>
                )}
                <span><CalendarDays size={13} />{formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)}</span>
                <span><MapIcon size={13} />{trip.stops?.length || 0} Destinations</span>
                <span><Activity size={13} />{totalActivities} Activities</span>
                <span><Clock size={13} />{trip.totalDays} Days</span>
              </div>
            </div>
          </div>
          <div className="td-hero-actions">
            <button className="td-hero-btn" onClick={() => navigate(`/trips/edit/${trip.id}`)}>
              <Pencil size={14} /> Edit
            </button>
            <button className="td-hero-btn" onClick={() => setShowShare(true)}>
              <Share2 size={14} /> Share
            </button>
            <button className="td-hero-btn" onClick={() => navigate('/budget')}>
              <Wallet size={14} /> Budget
            </button>
            <button className="td-hero-btn" onClick={() => navigate('/calendar')}>
              <CalendarDays size={14} /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PLANNING PROGRESS BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="td-progress-row">
        <span className="td-progress-label">Trip Planning Progress</span>
        <div className="td-progress-steps">
          {[
            { label: 'Destinations', done: (trip.stops?.length || 0) > 0, count: trip.stops?.length || 0 },
            { label: 'Activities',   done: totalActivities > 0,           count: totalActivities },
            { label: 'Budget',       done: trip.budgetLimit > 0 || totalCost > 0, count: trip.budgetLimit > 0 ? 1 : 0 },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div className={`td-ps ${step.done ? 'done' : ''}`}>
                <div className="td-ps-icon">
                  {step.done ? <CheckCircle size={16} /> : <div className="td-ps-circle" />}
                </div>
                <div className="td-ps-text">
                  <span className="td-ps-name">{step.label}</span>
                  <span className="td-ps-val">{step.count}</span>
                </div>
              </div>
              {i < arr.length - 1 && <div className="td-ps-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          4 SUMMARY STAT CARDS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="td-stat-cards">
        {[
          { icon: <CalendarDays size={20} />, val: trip.totalDays, label: 'Days', sub: `${formatDateShort(trip.startDate)} – ${formatDateShort(trip.endDate)}`, cls: 'blue' },
          { icon: <MapPin size={20} />,       val: trip.stops?.length || 0, label: 'Destinations', sub: trip.stops?.map(s => s.city?.name).filter(Boolean).slice(0, 2).join(', ') || 'None yet', cls: 'purple' },
          { icon: <Activity size={20} />,     val: totalActivities,  label: 'Activities', sub: 'Planned so far', cls: 'green' },
          { icon: <Wallet size={20} />,       val: `₹${totalCost > 0 ? totalCost.toFixed(0) : '0'}`, label: 'Est. Cost', sub: 'Based on activities', cls: 'orange' },
        ].map(c => (
          <div key={c.label} className="td-stat-card">
            <div className={`td-stat-icon td-stat-icon--${c.cls}`}>{c.icon}</div>
            <div className="td-stat-info">
              <div className="td-stat-val">{c.val}</div>
              <div className="td-stat-label">{c.label}</div>
              <div className="td-stat-sub">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN 3-COLUMN WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="td-layout">

        {/* ─── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="td-left">
          <div className="td-panel">
            <div className="td-panel-hdr">
              <div className="td-panel-title"><MapPin size={16} /> Your Destinations</div>
              <button className="td-btn-sm" onClick={() => setShowAddStop(true)}><Plus size={13} /> Add</button>
            </div>

            {showAddStop && (
              <div className="td-add-stop">
                <div className="td-add-stop-search">
                  <Search size={14} />
                  <input placeholder="Search cities…" value={citySearch} onChange={e => setCitySearch(e.target.value)} />
                  {citySearch && <button onClick={() => setCitySearch('')}><X size={14} /></button>}
                </div>
                {selCity ? (
                  <>
                    <div className="td-sel-city">
                      <span><strong>{selCity.name}</strong>, {selCity.country}</span>
                      <button className="td-btn-ghost" onClick={() => setSelCity(null)}>Change</button>
                    </div>
                    <div className="td-date-row">
                      <div className="td-fg"><label>Arrival</label><input type="date" className="td-date-in" value={stopForm.start_date} onChange={e => setStopForm({ ...stopForm, start_date: e.target.value })} /></div>
                      <div className="td-fg"><label>Departure</label><input type="date" className="td-date-in" value={stopForm.end_date} onChange={e => setStopForm({ ...stopForm, end_date: e.target.value })} /></div>
                    </div>
                    {stopErr && <div className="td-err">{stopErr}</div>}
                    <div className="td-add-stop-btns">
                      <button className="td-btn-outline" onClick={() => { setShowAddStop(false); setSelCity(null); }}>Cancel</button>
                      <button className="td-btn-primary" onClick={handleAddStop} disabled={addingStop}>{addingStop ? 'Adding…' : 'Add to Trip'}</button>
                    </div>
                  </>
                ) : (
                  <div className="td-city-list">
                    {filteredCities.slice(0, 12).map(c => (
                      <div key={c.id} className="td-city-item" onClick={() => { setSelCity(c); setStopForm({ start_date: trip.startDate?.split('T')[0] || '', end_date: trip.endDate?.split('T')[0] || '' }); setStopErr(''); }}>
                        <div className="td-city-thumb"><Img src={getCityImage(c)} fallback={GENERIC_FALLBACK} alt={c.name} /></div>
                        <div><div className="td-city-name">{c.name}</div><div className="td-city-country">{c.country}</div></div>
                      </div>
                    ))}
                    {filteredCities.length === 0 && <p className="td-city-empty">No cities found for "{citySearch}"</p>}
                  </div>
                )}
              </div>
            )}

            <div className="td-stops-list">
              {trip.stops?.length > 0 ? (
                trip.stops.map((stop, idx) => (
                  <StopCard key={stop.id} stop={stop} index={idx} isActive={activeStop === idx}
                    total={trip.stops.length} onSelect={setActiveStop}
                    onRemove={() => handleRemoveStop(stop.id)}
                    onMoveUp={() => handleReorderStops(-1, idx)}
                    onMoveDown={() => handleReorderStops(1, idx)} />
                ))
              ) : (
                <div className="td-empty-panel">
                  <MapPin size={28} />
                  <h4>No destinations yet</h4>
                  <p>Add your first destination to start planning.</p>
                  <button className="td-btn-primary" style={{ marginTop: 12 }} onClick={() => setShowAddStop(true)}>+ Add Destination</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── CENTER COLUMN ───────────────────────────────────────────── */}
        <div className="td-center">

          {/* Map */}
          {trip.stops?.length > 0 && (
            <div className="td-map-box">
              <InteractiveMap trip={trip} />
            </div>
          )}

          {/* Discover Activities */}
          <div className="td-panel">
            <div className="td-panel-hdr">
              <div className="td-panel-title"><Compass size={16} /> Discover Activities</div>
              {currentStop && <span className="td-panel-badge">{currentStop.city?.name}</span>}
            </div>
            {!currentStop ? (
              <div className="td-empty-panel">
                <Compass size={28} />
                <p>Select a destination to discover activities.</p>
              </div>
            ) : (
              <div className="td-discover">
                <div className="td-discover-bar">
                  <div className="td-search-box">
                    <Search size={14} />
                    <input placeholder="Search activities…" value={actSearch} onChange={e => setActSearch(e.target.value)} />
                    {actSearch && <button onClick={() => setActSearch('')}><X size={14} /></button>}
                  </div>
                  <div className="td-chips">
                    {activityTypes.map(type => (
                      <button key={type} className={`td-chip ${actFilter === type ? 'active' : ''}`} onClick={() => setActFilter(type)}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="td-acts-grid">
                  {cityActsLoading ? (
                    <div className="td-acts-loading"><div className="td-spinner" /><span>Loading activities…</span></div>
                  ) : filteredActs.length > 0 ? (
                    filteredActs.map(act => (
                      <ActivityCard key={act.id} activity={act} onAdd={() => setShowAddActModal(act)} onView={() => setShowActDetail(act)} />
                    ))
                  ) : (
                    <div className="td-empty-panel td-empty-panel--inline">
                      <Search size={24} />
                      <p>No activities found. <button className="td-btn-ghost" onClick={() => { setActFilter('All'); setActSearch(''); }}>Clear filters</button></p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Daily Itinerary */}
          {trip.stops?.length > 0 && (
            <div className="td-panel">
              <div className="td-panel-hdr">
                <div className="td-panel-title"><CalendarDays size={16} /> Daily Itinerary</div>
                <span className="td-panel-badge">{stopActivities.length} activities</span>
              </div>
              <div className="td-itin">
                {Object.keys(dayGroups).length > 0 ? (
                  Object.entries(dayGroups).map(([date, acts]) => (
                    <div key={date} className="td-day-group">
                      <div className="td-day-hdr">
                        <span className="td-day-title">{date}</span>
                        <span className="td-day-badge">{acts.length} {acts.length === 1 ? 'activity' : 'activities'}</span>
                      </div>
                      {acts.sort((a, b) => (a.start_time || '23:59').localeCompare(b.start_time || '23:59')).map((act, i, arr) => (
                        <div key={act.id} className="td-itin-row">
                          <div className="td-itin-time-col">
                            <div className="td-itin-time">{act.start_time?.slice(0, 5) || '—'}</div>
                          </div>
                          <div className="td-itin-timeline">
                            <div className="td-itin-dot" style={{ borderColor: CATEGORY_COLORS[act.activity?.type] || '#64748b' }} />
                            {i < arr.length - 1 && <div className="td-itin-line" />}
                          </div>
                          <div className="td-itin-card">
                            <div className="td-itin-thumb">
                              <Img src={getActivityImage(act.activity)} fallback={GENERIC_FALLBACK} alt={act.activity?.name} />
                              {act.activity?.type && (
                                <div className="td-itin-type" style={{ background: CATEGORY_COLORS[act.activity.type] || '#64748b' }}>
                                  {act.activity.type}
                                </div>
                              )}
                            </div>
                            <div className="td-itin-info">
                              <div className="td-itin-name">{act.activity?.name || 'Custom Activity'}</div>
                              {act.activity?.duration && <div className="td-itin-dur"><Clock size={11} />{act.activity.duration}</div>}
                            </div>
                            <div className="td-itin-btns">
                              <button title="Move up"   disabled={i === 0}             onClick={() => handleReorderActivity(act.id, -1, i)}><ChevronUp size={13} /></button>
                              <button title="Move down" disabled={i === arr.length - 1} onClick={() => handleReorderActivity(act.id, 1, i)}><ChevronDown size={13} /></button>
                              <button title="Remove" className="danger" onClick={() => handleRemoveActivity(act.id, act.activity?.name)}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="td-empty-panel">
                    <CalendarDays size={28} />
                    <h4>No activities planned yet</h4>
                    <p>Discover activities above and add them to your itinerary.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trip Insights */}
          {(categoryBreakdown.length > 0 || totalActivities > 0) && (
            <div className="td-panel">
              <div className="td-panel-hdr">
                <div className="td-panel-title"><BarChart2 size={16} /> Trip Insights</div>
              </div>
              <div className="td-insights">
                <div className="td-insights-grid">
                  <div className="td-insight-stat">
                    <div className="td-insight-val">{totalActivities > 0 ? (totalActivities / Math.max(1, trip.totalDays)).toFixed(1) : '0'}</div>
                    <div className="td-insight-label">Avg activities/day</div>
                  </div>
                  <div className="td-insight-stat">
                    <div className="td-insight-val">{categoryBreakdown.length}</div>
                    <div className="td-insight-label">Activity categories</div>
                  </div>
                  <div className="td-insight-stat">
                    <div className="td-insight-val">{trip.stops?.length || 0}</div>
                    <div className="td-insight-label">Destinations</div>
                  </div>
                  <div className="td-insight-stat">
                    <div className="td-insight-val">{trip.totalDays}</div>
                    <div className="td-insight-label">Total days</div>
                  </div>
                </div>
                {categoryBreakdown.length > 0 && (
                  <div className="td-cat-breakdown">
                    <div className="td-cb-title">Activities by Category</div>
                    {categoryBreakdown.slice(0, 5).map(([cat, count]) => (
                      <div key={cat} className="td-cb-row">
                        <div className="td-cb-dot" style={{ background: CATEGORY_COLORS[cat] || '#64748b' }} />
                        <span className="td-cb-cat">{cat}</span>
                        <MiniBar pct={(count / totalActivities) * 100} color={CATEGORY_COLORS[cat] || '#64748b'} />
                        <span className="td-cb-count">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="td-right">

          {/* Trip Summary */}
          <div className="td-panel">
            <div className="td-panel-hdr">
              <div className="td-panel-title"><Info size={16} /> Trip Summary</div>
            </div>
            <div className="td-summary-grid">
              {[
                { val: trip.totalDays, label: 'Days' },
                { val: trip.stops?.length || 0, label: 'Destinations' },
                { val: trip.stops?.length || 0, label: 'Stops' },
                { val: totalActivities, label: 'Activities' },
              ].map(s => (
                <div key={s.label} className="td-sg-cell">
                  <div className="td-sg-val">{s.val}</div>
                  <div className="td-sg-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="td-panel-footer">
              <button className="td-btn-outline td-btn-full" onClick={() => navigate('/calendar')}>
                <CalendarDays size={14} /> View Calendar
              </button>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="td-panel">
            <div className="td-panel-hdr">
              <div className="td-panel-title"><Wallet size={16} /> Budget Overview</div>
            </div>
            <div className="td-budget-body">
              <div className="td-budget-total">₹{totalCost.toFixed(0)}</div>
              <div className="td-budget-sub">Estimated from activities</div>
              {trip.budgetLimit > 0 && (
                <div className="td-budget-bar-wrap">
                  <div className="td-budget-bar-labels">
                    <span>Used ₹{budgetUsed.toFixed(0)}</span>
                    <span>Budget ₹{trip.budgetLimit}</span>
                  </div>
                  <MiniBar pct={(budgetUsed / trip.budgetLimit) * 100} color={budgetUsed > trip.budgetLimit ? '#ef4444' : '#22c55e'} />
                </div>
              )}
              {(trip.expenses || []).length > 0 && (
                <div className="td-budget-breakdown">
                  {Object.entries(
                    (trip.expenses || []).reduce((acc, e) => { acc[e.category || 'Other'] = (acc[e.category || 'Other'] || 0) + parseFloat(e.amount || 0); return acc; }, {})
                  ).map(([cat, amt]) => (
                    <div key={cat} className="td-budget-row">
                      <span>{cat}</span>
                      <span>₹{amt.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="td-btn-primary td-btn-full" onClick={() => navigate('/budget')}>
                View Full Budget
              </button>
            </div>
          </div>

          {/* Destinations Overview */}
          <div className="td-panel">
            <div className="td-panel-hdr">
              <div className="td-panel-title"><MapIcon size={16} /> Route Overview</div>
            </div>
            <div className="td-route-list">
              {(trip.stops || []).length === 0
                ? <div className="td-empty-panel td-empty-panel--sm"><p>No destinations yet.</p></div>
                : (trip.stops || []).map((stop, idx) => (
                    <div key={stop.id} className={`td-route-item ${activeStop === idx ? 'active' : ''}`} onClick={() => setActiveStop(idx)}>
                      <div className="td-route-thumb">
                        <Img src={getCityImage(stop.city)} fallback={GENERIC_FALLBACK} alt={stop.city?.name} />
                      </div>
                      <div className="td-route-info">
                        <div className="td-route-name">{stop.city?.name}</div>
                        <div className="td-route-dates">{formatDateShort(stop.start_date)} – {formatDateShort(stop.end_date)}</div>
                        <div className="td-route-acts">{stop.activities?.length || 0} activities</div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Quick Actions */}
          <div className="td-panel">
            <div className="td-panel-hdr">
              <div className="td-panel-title"><Zap size={16} /> Quick Actions</div>
            </div>
            <div className="td-quick-actions">
              {[
                { label: 'Add Destination', icon: <MapPin size={14} />, fn: () => setShowAddStop(true) },
                { label: 'Edit Trip',       icon: <Pencil size={14} />,   fn: () => navigate(`/trips/edit/${trip.id}`) },
                { label: 'View Budget',     icon: <Wallet size={14} />,   fn: () => navigate('/budget') },
                { label: 'Calendar',        icon: <CalendarDays size={14} />, fn: () => navigate('/calendar') },
              ].map(a => (
                <button key={a.label} className="td-qa-btn" onClick={a.fn}>
                  {a.icon}{a.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Copilot */}
          <div className="td-ai-card" onClick={() => setShowAI(true)}>
            <div className="td-ai-glow" />
            <div className="td-ai-icon"><Sparkles size={22} /></div>
            <div className="td-ai-text">
              <h4>AI Travel Copilot</h4>
              <p>Get smart itinerary suggestions tailored to your trip.</p>
              <button className="td-ai-btn"><TrendingUp size={14} /> Generate Itinerary</button>
            </div>
          </div>

        </div>
      </div>{/* end td-layout */}

      {/* ═══════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Activity Detail */}
      {showActDetail && (
        <div className="td-backdrop" onClick={() => setShowActDetail(null)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-img">
              <Img src={getActivityImage(showActDetail)} fallback={GENERIC_FALLBACK} alt={showActDetail.name} />
              <button className="td-modal-close" onClick={() => setShowActDetail(null)}><X size={18} /></button>
              <div className="td-modal-type-badge" style={{ background: CATEGORY_COLORS[showActDetail.type] || '#64748b' }}>{showActDetail.type}</div>
            </div>
            <div className="td-modal-body">
              <h2 className="td-modal-title">{showActDetail.name}</h2>
              <div className="td-modal-meta">
                <span><MapPin size={13} />{currentStop?.city?.name}, {currentStop?.city?.country}</span>
                {showActDetail.duration && <span><Clock size={13} />{showActDetail.duration}</span>}
                {Number(showActDetail.cost) > 0
                  ? <span><DollarSign size={13} />₹{Number(showActDetail.cost).toFixed(0)} est.</span>
                  : <span className="td-free">Free entry</span>}
                {showActDetail.rating && <span><Star size={13} fill="currentColor" style={{ color: '#f59e0b' }} />{showActDetail.rating}</span>}
              </div>
              {showActDetail.description && <p className="td-modal-desc">{showActDetail.description}</p>}
              <div className="td-modal-footer">
                <button className="td-btn-outline" onClick={() => setShowActDetail(null)}>Close</button>
                <button className="td-btn-primary" onClick={() => { setShowAddActModal(showActDetail); setShowActDetail(null); }}>
                  <Plus size={14} /> Add to Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity to Itinerary */}
      {showAddActModal && (
        <div className="td-backdrop" onClick={() => { setShowAddActModal(null); setActErr(''); }}>
          <div className="td-modal td-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="td-modal-hdr">
              <div><h2>Add to Itinerary</h2><p>{showAddActModal.name}</p></div>
              <button className="td-modal-close-btn" onClick={() => { setShowAddActModal(null); setActErr(''); }}><X size={20} /></button>
            </div>
            <div className="td-modal-body">
              <div className="td-add-act-preview">
                <div className="td-add-act-img"><Img src={getActivityImage(showAddActModal)} fallback={GENERIC_FALLBACK} alt={showAddActModal.name} /></div>
                <div><div className="td-add-act-name">{showAddActModal.name}</div><div className="td-add-act-meta">{showAddActModal.type} · {showAddActModal.duration}</div></div>
              </div>
              <div className="td-add-act-dest">
                <MapPin size={13} /><span>Adding to <strong>{currentStop?.city?.name}</strong></span>
                <span className="td-add-act-dates">{formatDateShort(currentStop?.start_date)} – {formatDateShort(currentStop?.end_date)}</span>
              </div>
              <div className="td-fg"><label>Date *</label>
                <input type="date" className="td-date-in" value={actForm.date}
                  min={currentStop?.start_date?.split('T')[0]} max={currentStop?.end_date?.split('T')[0]}
                  onChange={e => { setActForm(f => ({ ...f, date: e.target.value })); setActErr(''); }} /></div>
              <div className="td-fg"><label>Start Time</label>
                <input type="time" className="td-date-in" value={actForm.start_time}
                  onChange={e => setActForm(f => ({ ...f, start_time: e.target.value }))} /></div>
              {actErr && <div className="td-err">{actErr}</div>}
              <div className="td-modal-footer">
                <button className="td-btn-outline" onClick={() => { setShowAddActModal(null); setActErr(''); }}>Cancel</button>
                <button className="td-btn-primary" onClick={handleAddActivity} disabled={addingAct}>
                  {addingAct ? 'Adding…' : <><Plus size={14} /> Add Activity</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="td-backdrop" onClick={() => setShowShare(false)}>
          <div className="td-modal td-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="td-modal-hdr">
              <h2>Share Trip</h2>
              <button className="td-modal-close-btn" onClick={() => setShowShare(false)}><X size={20} /></button>
            </div>
            <div className="td-modal-body">
              <div className="td-share-info"><h3>{trip.name}</h3><p>{formatDateShort(trip.startDate)} – {formatDate(trip.endDate)} · {trip.cityCount} destinations</p></div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '16px 0 8px' }}>Visibility</h4>
              <div className="td-share-opts">
                {[{ val: false, label: 'Private', desc: 'Only you can view this trip.' }, { val: true, label: 'Public', desc: 'Anyone with the link can view.' }].map(opt => (
                  <label key={String(opt.val)} className={`td-share-opt ${shareSettings.is_public === opt.val ? 'active' : ''}`}>
                    <input type="radio" name="vis" checked={shareSettings.is_public === opt.val} onChange={() => handleUpdateShare(opt.val)} />
                    <div><div style={{ fontWeight: 600 }}>{opt.label}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{opt.desc}</div></div>
                  </label>
                ))}
              </div>
              {shareSettings.is_public && shareSettings.share_token && (
                <div className="td-share-link">
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Public Link</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input readOnly value={`${window.location.origin}/shared/${shareSettings.share_token}`} className="td-date-in" style={{ flex: 1, fontSize: 12 }} />
                    <button className="td-btn-primary" onClick={handleCopyLink}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAI && <AIAssistant tripId={trip.id} tripName={trip.name} onClose={() => setShowAI(false)} onApplySuccess={loadTrip} />}
    </div>
  );
}
