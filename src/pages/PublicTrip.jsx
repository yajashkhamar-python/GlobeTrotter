import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, Activity, Wallet, Share2, Copy, CheckCircle, Clock, XCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import '../components/common/common.css';
import './PublicTrip.css';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDayHeader(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function PublicTrip() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [newTripId, setNewTripId] = useState(null);
  const [copyError, setCopyError] = useState(null);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shared/${token}`);
        const data = await response.json();
        
        if (data.success) {
          const t = data.trip;
          const end = new Date(t.end_date);
          const start = new Date(t.start_date);
          setTrip({
            ...t,
            id: t.id,
            name: t.name,
            startDate: t.start_date,
            endDate: t.end_date,
            coverImage: t.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
            description: t.description,
            cityCount: t.stops?.length || 0,
            totalDays: Math.max(0, Math.ceil((end - start) / 86400000)) + 1,
            stops: t.stops || [],
            budget_summary: t.budget_summary || []
          });
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load shared trip');
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [token]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${trip.name} - GlobeTrotter Itinerary`,
          text: `Check out this travel itinerary for ${trip.name}!`,
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyClick = () => {
    if (isAuthenticated) {
      setShowCopyConfirm(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const executeCopy = async () => {
    setIsCopying(true);
    setCopyError(null);
    try {
      const data = await fetchApi(`/shared/${token}/copy`, {
        method: 'POST',
      });
      if (data.success) {
        setNewTripId(data.trip.id);
        setCopySuccess(true);
      } else {
        setCopyError(data.message || "Couldn't Copy Trip");
      }
    } catch (err) {
      setCopyError("Something went wrong. Please try again.");
    } finally {
      setIsCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="public-trip-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)' }}>Loading Itinerary...</h2>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="public-trip-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '100px' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <EmptyState
            icon={<MapPin size={48} color="var(--color-text-muted)" />}
            title="Trip Not Available"
            description="This shared itinerary is no longer available."
            action={
              <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
                Explore GlobeTrotter
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalActivities = trip.stops.reduce((acc, stop) => acc + (stop.activities?.length || 0), 0);
  
  // Calculate budget total
  const totalBudget = trip.budget_summary.reduce((acc, curr) => acc + curr.total, 0);

  // Group activities by date
  const allActivities = trip.stops.flatMap(stop => 
    (stop.activities || []).map(act => ({ ...act, cityName: stop.city?.name }))
  );
  
  const dayGroups = allActivities.reduce((acc, act) => {
    const d = act.date ? formatDayHeader(act.date) : 'Unscheduled';
    if (!acc[d]) acc[d] = [];
    acc[d].push(act);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(dayGroups).sort((a, b) => {
    if (a === 'Unscheduled') return 1;
    if (b === 'Unscheduled') return -1;
    return new Date(a) - new Date(b);
  });

  // Create destinations string
  const destinationNames = trip.stops.map(s => s.city?.name).filter(Boolean);
  const destinationsString = destinationNames.join(' • ');

  return (
    <div className="public-trip-page">
      {/* 3. HERO SECTION */}
      <div className="public-hero">
        <img src={trip.coverImage} alt={trip.name} className="public-hero-img" loading="lazy" />
        <div className="public-hero-overlay" />
        <div className="public-hero-content">
          <div className="public-hero-subtitle">Trip Itinerary</div>
          <h1 className="public-hero-title">{trip.name}</h1>
          
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px', opacity: 0.9 }}>
            {destinationsString}
          </div>
          
          <div className="public-hero-meta">
            <span><CalendarDays size={18} /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
          </div>
        </div>
      </div>

      {/* 4. TRIP SUMMARY */}
      <div className="public-summary-cards">
        <div className="public-summary-card">
          <div className="public-summary-value">{trip.cityCount}</div>
          <div className="public-summary-label">Destinations</div>
        </div>
        <div className="public-summary-card">
          <div className="public-summary-value">{trip.totalDays} Days</div>
          <div className="public-summary-label">Duration</div>
        </div>
        <div className="public-summary-card">
          <div className="public-summary-value">{totalActivities}</div>
          <div className="public-summary-label">Activities</div>
        </div>
        <div className="public-summary-card">
          <div className="public-summary-value">{totalBudget > 0 ? `₹${totalBudget.toLocaleString('en-IN')}` : 'N/A'}</div>
          <div className="public-summary-label">Est. Budget</div>
        </div>
      </div>

      <div className="public-content-grid">
        
        {/* 5. DESTINATION OVERVIEW */}
        {trip.stops && trip.stops.length > 0 && (
          <section>
            <h2 className="public-section-title"><MapPin size={24} /> Your Journey</h2>
            <div className="public-timeline">
              {trip.stops.map(stop => (
                <div key={stop.id} className="public-timeline-stop">
                  {stop.city?.image && (
                    <img src={stop.city.image} alt={stop.city.name} className="public-stop-image" />
                  )}
                  <div className="public-stop-details">
                    <h4>{stop.city?.name}</h4>
                    <p>{stop.city?.country}</p>
                    <p style={{ marginTop: '4px' }}>
                      <CalendarDays size={14} /> {formatDate(stop.start_date)} — {formatDate(stop.end_date)}
                    </p>
                    {stop.activities && stop.activities.length > 0 && (
                      <p style={{ marginTop: '2px', color: 'var(--color-accent)' }}>
                        {stop.activities.length} activities planned
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. DAY-BY-DAY ITINERARY */}
        {sortedDates.length > 0 && (
          <section>
            <h2 className="public-section-title"><Activity size={24} /> Day-by-Day Itinerary</h2>
            
            {sortedDates.map((date, index) => {
              // Sort activities by time
              const dayActs = [...dayGroups[date]].sort((a, b) => {
                if (!a.start_time) return 1;
                if (!b.start_time) return -1;
                return a.start_time.localeCompare(b.start_time);
              });
              
              const dayLabel = date !== 'Unscheduled' ? `Day ${index + 1}` : 'Unscheduled';
              const locationLabel = dayActs[0]?.cityName || '';

              return (
                <div key={date} className="public-day-group">
                  <div className="public-day-header">
                    <div>
                      <span style={{ marginRight: '8px', opacity: 0.8 }}>{dayLabel}</span>
                      {date !== 'Unscheduled' && <span>{date}</span>}
                    </div>
                    {locationLabel && <span>{locationLabel}</span>}
                  </div>
                  
                  <div>
                    {dayActs.map((act, i) => (
                      <div key={i} className="public-activity-card">
                        <div className="public-activity-time">
                          {act.start_time ? act.start_time.slice(0,5) : ''}
                        </div>
                        <div className="public-activity-content">
                          {act.activity?.image && (
                            <img src={act.activity.image} alt={act.activity.name} className="public-activity-image" />
                          )}
                          <div className="public-activity-info">
                            <h5>{act.activity?.name}</h5>
                            
                            <div className="public-activity-meta">
                              <span><MapPin size={12} /> {act.cityName}</span>
                              {act.activity?.duration && <span><Clock size={12} /> {act.activity.duration}</span>}
                              {(act.activity?.cost > 0 || act.custom_cost > 0) && (
                                <span><Wallet size={12} /> ₹{parseFloat(act.activity?.cost || act.custom_cost || 0).toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            
                            {act.activity?.description && (
                              <p className="public-activity-desc">{act.activity.description}</p>
                            )}
                            {act.notes && (
                              <div style={{ marginTop: '8px', padding: '8px', background: 'var(--color-bg)', borderRadius: '6px', fontSize: '13px', fontStyle: 'italic' }}>
                                "{act.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* 8. BUDGET SECTION */}
        {trip.budget_summary && trip.budget_summary.length > 0 && totalBudget > 0 && (
          <section>
            <h2 className="public-section-title"><Wallet size={24} /> Trip Budget</h2>
            
            <div className="public-budget-chart">
              <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Total Estimated</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>₹{totalBudget.toLocaleString('en-IN')}</div>
              </div>
              
              {/* 9. BUDGET VISUALIZATION */}
              {trip.budget_summary.map((item, i) => {
                const percentage = Math.max(2, Math.round((item.total / totalBudget) * 100));
                return (
                  <div key={i} className="public-budget-row">
                    <div className="public-budget-label">{item.category}</div>
                    <div className="public-budget-bar-bg">
                      <div className="public-budget-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="public-budget-amount">₹{item.total.toLocaleString('en-IN')}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        
        {/* 11. SHARE SECTION */}
        <section className="public-share-section">
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Enjoyed this itinerary?</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Share this trip with your friends or save it for inspiration.</p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleCopyClick} disabled={isCopying || copySuccess}>
              {isCopying ? 'Copying...' : copySuccess ? 'Copied ✓' : 'Copy This Trip'}
            </button>
            <button className="btn btn-outline" onClick={handleShare}>
              <Share2 size={16} /> Share
            </button>
            <button className="btn btn-outline" onClick={handleCopyLink}>
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />} 
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </section>
        
        {/* 12. PUBLIC BRANDING */}
        <div className="public-branding">
          <div style={{ fontWeight: 700, letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }}></span>
            GlobeTrotter
          </div>
          <p>Plan. Explore. Experience.</p>
        </div>

      </div>

      {/* LOGIN PROMPT MODAL */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h2>Copy this itinerary</h2>
              <button className="btn-close" onClick={() => setShowLoginModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                Login or create an account to save your own editable copy.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login', { state: { from: location.pathname } })}>
                  <LogIn size={18} style={{ marginRight: '8px' }} /> Login
                </button>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/register', { state: { from: location.pathname } })}>
                  <UserPlus size={18} style={{ marginRight: '8px' }} /> Sign Up
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={() => setShowLoginModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COPY CONFIRMATION MODAL */}
      {showCopyConfirm && (
        <div className="modal-backdrop" onClick={() => !isCopying && setShowCopyConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'center' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h2>{copySuccess ? '✓ Trip Copied' : 'Copy This Trip?'}</h2>
              {!isCopying && !copySuccess && (
                <button className="btn-close" onClick={() => setShowCopyConfirm(false)}><XCircle size={20} /></button>
              )}
            </div>
            <div className="modal-body">
              {copySuccess ? (
                <div>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                    <strong>{trip.name}</strong> has been added to your trips.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/trips/${newTripId}`)}>
                    View My Trip
                  </button>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={() => setShowCopyConfirm(false)}>
                    Close
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    You'll get your own editable copy of this itinerary. The original will remain unchanged.
                  </p>
                  
                  <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '24px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>{trip.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                      <div><span style={{ color: 'var(--color-text-muted)' }}>Destinations:</span> {trip.cityCount}</div>
                      <div><span style={{ color: 'var(--color-text-muted)' }}>Activities:</span> {totalActivities}</div>
                    </div>
                  </div>

                  {copyError && (
                    <div style={{ color: 'var(--color-danger)', marginBottom: '20px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                      ✕ {copyError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCopyConfirm(false)} disabled={isCopying}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={executeCopy} disabled={isCopying}>
                      {isCopying ? 'Copying...' : copyError ? 'Try Again' : 'Copy Trip'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
