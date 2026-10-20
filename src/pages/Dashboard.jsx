import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Map, Compass, CalendarDays, Wallet, Plus, ArrowRight, Building2, Ticket, Clock, MapPin, Globe, CheckCircle2, Sparkles, Wand2 
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SafeImage from '../components/common/SafeImage';
import EmptyState from '../components/common/EmptyState';
import './Dashboard.css';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetchApi('/dashboard/summary');
        if (response.success) {
          setData(response);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load dashboard', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-page"><div className="dashboard-container">Loading...</div></div>;
  }

  if (error || !data) {
    return (
      <div className="dashboard-page">
        <EmptyState
          icon={<Map size={48} />}
          title="Dashboard unavailable"
          description="We couldn't load your dashboard data right now."
          action={<button className="d-btn-primary" onClick={() => window.location.reload()}>Try Again</button>}
        />
      </div>
    );
  }

  const { 
    stats = { totalTrips: 0 }, 
    allTrips = [], 
    nextTrip = null, 
    upcomingItinerary = [], 
    budgetSummary = null
  } = data || {};
  
  const displayName = data.user?.name ? data.user.name.split(' ')[0] : (authUser?.name ? authUser.name.split(' ')[0] : 'there');

  const formatDateRange = (start, end) => {
    try {
      if (!start) return 'Dates pending';
      const s = new Date(start);
      if (isNaN(s.getTime())) return 'Invalid dates';
      const e = end ? new Date(end) : null;
      if (!e || isNaN(e.getTime())) return s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } catch (err) {
      return 'Date Error';
    }
  };

  const getDuration = (start, end) => {
    try {
      if (!start || !end) return '';
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';
      const days = Math.max(0, Math.ceil((e - s) / 86400000)) + 1;
      return `${days} days`;
    } catch (err) {
      return '';
    }
  };

  const upcomingTrips = allTrips.filter(t => new Date(t.end_date) >= new Date() || new Date(t.start_date) >= new Date());
  const recentTrips = allTrips.filter(t => new Date(t.end_date) < new Date()).sort((a,b) => new Date(b.end_date) - new Date(a.end_date)).slice(0, 3);
  
  const bgImg = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80";
  const bottomBannerImg = "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80";
  const rightBannerImg = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* HERO SECTION */}
        <div className="dash-hero animate-fade-in">
          <img src={bgImg} alt="Hero" className="dash-hero-img" />
          <div className="dash-hero-overlay"></div>
          <div className="dash-hero-content">
            <div>
              <h1 className="dash-hero-title">Good Morning, {displayName}! 👋</h1>
              <p className="dash-hero-subtitle">Every journey begins with a dream. Let's make yours unforgettable.</p>
              <div className="dash-hero-actions">
                <button className="d-btn-primary hover-lift" onClick={() => navigate('/trips/create')}>Plan a New Trip</button>
                <button className="d-btn-secondary hover-lift" onClick={() => navigate('/explore')}>Explore Destinations</button>
              </div>
            </div>
            {nextTrip && (
              <div className="hover-lift" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate(`/trips/${nextTrip.id}`)}>
                <MapPin size={24} color="white" />
                <div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>Next Trip</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{nextTrip.name}</div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{formatDateRange(nextTrip.start_date, nextTrip.end_date)}</div>
                </div>
                <ArrowRight size={16} />
              </div>
            )}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="dash-stats-row">
          <div className="dash-stat-card animate-fade-in delay-1 hover-lift" onClick={() => navigate('/trips')} style={{cursor:'pointer'}}>
            <div className="stat-icon blue"><Map size={24} /></div>
            <div className="stat-info">
              <div className="stat-title">Total Trips</div>
              <div className="stat-val">{allTrips.length}</div>
              <div className="stat-desc">All your planned journeys</div>
            </div>
            <div className="stat-arrow"><ArrowRight size={14}/></div>
          </div>
          <div className="dash-stat-card animate-fade-in delay-2 hover-lift" onClick={() => navigate('/trips')} style={{cursor:'pointer'}}>
            <div className="stat-icon green"><CalendarDays size={24} /></div>
            <div className="stat-info">
              <div className="stat-title">Upcoming Trips</div>
              <div className="stat-val">{upcomingTrips.length}</div>
              <div className="stat-desc">Trips in the next 30 days</div>
            </div>
            <div className="stat-arrow"><ArrowRight size={14}/></div>
          </div>
          <div className="dash-stat-card animate-fade-in delay-3 hover-lift" onClick={() => navigate('/explore')} style={{cursor:'pointer'}}>
            <div className="stat-icon purple"><MapPin size={24} /></div>
            <div className="stat-info">
              <div className="stat-title">Destinations</div>
              <div className="stat-val">{stats.totalDestinations || 0}</div>
              <div className="stat-desc">Unique places to explore</div>
            </div>
            <div className="stat-arrow"><ArrowRight size={14}/></div>
          </div>
          <div className="dash-stat-card animate-fade-in delay-4 hover-lift" onClick={() => navigate('/calendar')} style={{cursor:'pointer'}}>
            <div className="stat-icon orange"><Ticket size={24} /></div>
            <div className="stat-info">
              <div className="stat-title">Activities Planned</div>
              <div className="stat-val">{stats.totalActivities || 0}</div>
              <div className="stat-desc">Adventures lined up</div>
            </div>
            <div className="stat-arrow"><ArrowRight size={14}/></div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="dash-main-grid">
          
          {/* LEFT COLUMN */}
          <div className="left-col">
            <div className="section-header">
              <div>
                <h2 className="section-title">Upcoming Itinerary</h2>
                <div className="section-subtitle">Your next trips and scheduled activities</div>
              </div>
              <button className="d-btn-text" onClick={() => navigate('/trips')}>View All Trips <ArrowRight size={14}/></button>
            </div>

            <div className="dash-itinerary-list">
              {upcomingTrips.length > 0 ? upcomingTrips.map((trip, tIdx) => (
                <div className="dash-trip-panel animate-fade-in hover-lift" style={{ animationDelay: `${0.2 + tIdx * 0.1}s` }} key={trip.id}>
                  <div className="trip-panel-top">
                    <div className="img-zoom-container" style={{ width: '240px', height: '150px', flexShrink: 0, borderRadius: '12px' }}>
                      <SafeImage src={trip.cover_image} alt={trip.name} style={{ borderRadius: '12px' }} fallbackIcon={Map} />
                    </div>
                    <div className="trip-panel-info">
                      <div className="trip-panel-title-row">
                        <div className="trip-panel-title">{trip.name}</div>
                        <div className={`trip-badge ${tIdx === 0 ? 'upcoming' : 'planned'}`}>{tIdx === 0 ? 'Upcoming' : 'Planned'}</div>
                      </div>
                      <div className="trip-panel-meta">
                        <CalendarDays size={14} /> {formatDateRange(trip.start_date, trip.end_date)} ({getDuration(trip.start_date, trip.end_date)})
                      </div>
                      <div className="trip-panel-stats">
                        <span><Ticket size={14}/> {trip.activity_count} activities</span>
                        <span><Building2 size={14}/> {trip.stop_count} cities</span>
                      </div>
                      <div className="trip-progress-bar">
                        <div className="trip-progress-fill" style={{ width: tIdx === 0 ? '20%' : '0%' }}></div>
                      </div>
                      <div className="trip-progress-text">{tIdx === 0 ? '20%' : '0%'} planned</div>
                    </div>
                  </div>
                  
                  {tIdx === 0 && upcomingItinerary.length > 0 && (
                    <div className="next-activities-section">
                      <div className="next-activities-label">Next Activities</div>
                      <div className="activities-grid">
                        {upcomingItinerary.slice(0,3).map(act => (
                          <div className="activity-card" key={act.id}>
                            <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                              <SafeImage src={null} alt="act" style={{ borderRadius: '8px' }} fallbackIcon={Ticket} />
                            </div>
                            <div className="act-info">
                              <div className="act-title" title={act.activity_name}>{act.activity_name}</div>
                              <div className="act-meta"><Clock size={10}/> {act.date ? new Date(act.date).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : ''} {act.start_time?.substring(0,5)}</div>
                              <div className="act-meta"><MapPin size={10}/> {act.city_name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="trip-panel-action">
                    <button className="btn-view-trip" onClick={() => navigate(`/trips/${trip.id}`)}>{tIdx === 0 ? 'View Trip ->' : 'Continue Planning ->'}</button>
                  </div>
                </div>
              )) : (
                <EmptyState 
                  icon={<CalendarDays size={32} />}
                  title="No Upcoming Trips"
                  description="Plan your next adventure today."
                  action={<button className="d-btn-primary" onClick={() => navigate('/trips/create')}>Create Trip</button>}
                />
              )}
            </div>

            <div className="bot-banner">
              <img src={bottomBannerImg} alt="Banner" className="bot-banner-img" />
              <div className="bot-banner-overlay"></div>
              <div className="bot-banner-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Compass size={18} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Travel is the only thing you buy that makes you richer.</div>
                </div>
                <button className="d-btn-primary" onClick={() => navigate('/plan')}>Plan Your Next Trip <ArrowRight size={14}/></button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="right-col">
            
            {/* Budget Widget */}
            <div className="widget-card animate-fade-in delay-2 hover-lift">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Budget Overview</h2>
                  <div className="section-subtitle">Track your expenses and stay on budget</div>
                </div>
              </div>

              {budgetSummary ? (
                <>
                  <div className="budget-donut-container">
                    <div className="donut-chart" style={{ background: `conic-gradient(#22c55e 0% ${budgetSummary.spentPercentage}%, #f59e0b ${budgetSummary.spentPercentage}% 100%)`}}>
                      <div className="donut-inner">
                        <div className="donut-val">₹{(budgetSummary.totalBudget || 0).toLocaleString()}</div>
                        <div className="donut-lbl">Total Budget</div>
                      </div>
                    </div>
                    <div className="budget-legend">
                      <div className="legend-item">
                        <div><span className="legend-dot" style={{background: '#22c55e'}}></span> Spent</div>
                        <div style={{fontWeight: 700}}>₹{(budgetSummary.totalSpent || 0).toLocaleString()} <span style={{fontSize:'11px', color:'var(--d-text-gray)'}}>({Math.round(budgetSummary.spentPercentage)}%)</span></div>
                      </div>
                      <div className="legend-item">
                        <div><span className="legend-dot" style={{background: '#f59e0b'}}></span> Remaining</div>
                        <div style={{fontWeight: 700}}>₹{Math.max(0, budgetSummary.remaining || 0).toLocaleString()} <span style={{fontSize:'11px', color:'var(--d-text-gray)'}}>({100 - Math.round(budgetSummary.spentPercentage)}%)</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="expense-list">
                    <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '8px'}}>Expense Breakdown</div>
                    {Object.entries(budgetSummary.categories || {}).map(([cat, amt]) => {
                      const perc = budgetSummary.totalBudget > 0 ? Math.round((amt / budgetSummary.totalBudget) * 100) : 0;
                      return (
                        <div className="expense-item" key={cat}>
                          <div style={{display:'flex', alignItems:'center', gap:'8px', textTransform:'capitalize'}}>
                            <div style={{width:'24px', height:'24px', background:'#f8fafc', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center'}}><Wallet size={12}/></div>
                            {cat}
                          </div>
                          <div style={{fontWeight: 600}}>₹{amt.toLocaleString()} <span style={{color:'var(--d-text-gray)', fontSize:'11px', marginLeft:'4px'}}>{perc}%</span></div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <button className="d-btn-secondary" style={{width:'100%', borderColor:'var(--d-border)', color:'var(--d-primary)', background:'transparent'}} onClick={() => navigate('/budget')}>View Budget Details <ArrowRight size={14}/></button>
                </>
              ) : (
                <div style={{textAlign:'center', color:'var(--d-text-light)', padding:'24px 0'}}>No budget data available</div>
              )}
            </div>

            {/* Your Destinations Map */}
            <div className="widget-card animate-fade-in delay-3 hover-lift">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Your Destinations</h2>
                  <div className="section-subtitle">{stats.totalDestinations || 0} amazing places across the world</div>
                </div>
              </div>
              <div className="map-widget img-zoom-container">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" alt="Map" className="map-img" />
                <button className="d-btn-secondary" style={{width:'100%', borderColor:'var(--d-border)', color:'var(--d-text-dark)', background:'white'}} onClick={() => navigate('/explore')}>View Map <ArrowRight size={14}/></button>
              </div>
            </div>

            {/* Recent Trips */}
            {recentTrips.length > 0 && (
              <div className="widget-card animate-fade-in delay-4 hover-lift">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Recent Trips</h2>
                    <div className="section-subtitle">Your latest travel adventures</div>
                  </div>
                </div>
                <div className="recent-trips-list">
                  {recentTrips.map(trip => (
                    <div className="recent-trip-item hover-lift img-zoom-container" key={trip.id} style={{cursor:'pointer'}} onClick={() => navigate(`/trips/${trip.id}`)}>
                      <div style={{ width: '64px', height: '48px', flexShrink: 0 }}>
                        <SafeImage src={trip.cover_image} alt={trip.name} style={{ borderRadius: '6px' }} fallbackIcon={Map} />
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: '13px', fontWeight: 600}}>{trip.name}</div>
                        <div style={{fontSize: '11px', color: 'var(--d-text-gray)', marginBottom: '4px'}}>{formatDateRange(trip.start_date, trip.end_date)}</div>
                        <div style={{fontSize: '10px', color: '#3b82f6', fontWeight: 600}}>Completed</div>
                      </div>
                      <ArrowRight size={14} color="var(--d-text-light)" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Banner */}
            <div className="widget-card animate-fade-in delay-5 hover-lift img-zoom-container" style={{padding: 0, position: 'relative', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <img src={rightBannerImg} alt="Explore" style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', zIndex:1}} />
              <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'linear-gradient(to top, rgba(15,23,42,0.9), transparent)', zIndex:2}}></div>
              <div style={{position:'relative', zIndex:3, padding: '24px', color:'white'}}>
                <div style={{width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'}}>
                  <MapPin size={16} />
                </div>
                <div style={{fontSize: '16px', fontWeight: 700, marginBottom: '4px'}}>Collect moments, not things.</div>
                <div style={{fontSize: '12px', color: '#cbd5e1', marginBottom: '16px'}}>Travel far, explore more, create memories that last a lifetime.</div>
                <button className="d-btn-secondary hover-lift" style={{padding: '6px 12px', fontSize: '12px'}} onClick={() => navigate('/explore')}>Explore Destinations <ArrowRight size={12}/></button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="widget-card animate-fade-in delay-6">
              <div className="section-header">
                <h2 className="section-title">Quick Actions</h2>
              </div>
              <div className="quick-actions-grid">
                <div className="qa-tile hover-lift" onClick={() => navigate('/trips/create')}>
                  <div className="qa-icon"><Plus size={16} /></div>
                  <div>
                    <div className="qa-title">Create Trip</div>
                    <div className="qa-desc">Start a new journey</div>
                  </div>
                </div>
                <div className="qa-tile hover-lift" onClick={() => navigate('/explore')}>
                  <div className="qa-icon"><Compass size={16} /></div>
                  <div>
                    <div className="qa-title">Explore</div>
                    <div className="qa-desc">Discover destinations</div>
                  </div>
                </div>
                <div className="qa-tile hover-lift" onClick={() => navigate('/calendar')}>
                  <div className="qa-icon"><CalendarDays size={16} /></div>
                  <div>
                    <div className="qa-title">Calendar</div>
                    <div className="qa-desc">View your schedule</div>
                  </div>
                </div>
                <div className="qa-tile hover-lift" onClick={() => navigate('/budget')}>
                  <div className="qa-icon"><Wallet size={16} /></div>
                  <div>
                    <div className="qa-title">Budget</div>
                    <div className="qa-desc">Track your spending</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
