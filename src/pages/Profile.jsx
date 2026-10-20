import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import { 
  Settings, Lock, LogOut, Map, Calendar, 
  MapPin, Heart, Activity, User, Mail, ChevronRight, X 
} from 'lucide-react';
import '../components/common/common.css';

export default function Profile() {
  const { t } = useLanguage();

  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/profile');
      if (data.success) {
        setProfileData(data);
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      setError('An error occurred while loading profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openEditModal = () => {
  const { t } = useLanguage();

    setEditForm({
      name: profileData?.user?.name || user?.name || '',
      email: profileData?.user?.email || user?.email || ''
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Name and email are required.');
      return;
    }
    
    try {
      setSaving(true);
      const res = await fetchApi('/profile', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      
      if (res.success) {
        setShowEditModal(false);
        // Update local state
        setProfileData(prev => ({
          ...prev,
          user: { ...prev.user, name: res.user.name, email: res.user.email }
        }));
        // Update global auth context
        updateUser({ name: res.user.name, email: res.user.email });
        showToast('Profile updated successfully.');
      } else {
        setEditError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setEditError('An error occurred while saving profile');
    } finally {
      setSaving(false);
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Formatting date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px' }}>
        <div style={{ height: '200px', borderRadius: '24px', marginBottom: '32px' }} className="skeleton-card" />
        <div className="grid-4" style={{ gap: '24px', marginBottom: '32px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '100px', borderRadius: '16px' }} className="skeleton-card" />)}
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <User size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Couldn't load your profile</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadProfile}>Try again</button>
        </div>
      </div>
    );
  }

  const { stats, preferences } = profileData;
  const userData = profileData.user;

  return (
    <div className="page-container page-enter" style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 40px 64px' }}>
      
      {/* 1. PROFILE HERO */}
      <section style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(30,41,59,0.4) 100%)',
        border: '1px solid var(--color-border-light)',
        borderRadius: '24px',
        padding: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '40px',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', zIndex: 1 }}>
          <div style={{
            width: '104px', height: '104px',
            borderRadius: '50%',
            background: 'var(--color-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: 700, color: 'white',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            border: '4px solid var(--color-surface)'
          }}>
            {getInitials(userData?.name)}
          </div>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              {userData?.name || 'Traveler'}
            </h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', margin: '0 0 4px 0', fontSize: '15px' }}>
              <Mail size={16} /> {userData?.email}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0, fontWeight: 500 }}>
              {t('profile.memberSince')} {formatDate(userData?.created_at)}
            </p>
          </div>
        </div>

        <button className="btn btn-outline" style={{ zIndex: 1, background: 'var(--color-surface)' }} onClick={openEditModal}>
          {t('profile.editProfile') || 'Edit Profile'}
        </button>
      </section>

      {/* 2. TRAVEL OVERVIEW (STATS) */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>{t('profile.travelOverview')}</h2>
        <div className="grid-4" style={{ gap: '20px' }}>
          
          <div className="pro-card" style={{ padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Map size={20} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{stats?.totalTrips || 0}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{t('profile.trips') || 'Trips Planned'}</div>
          </div>

          <div className="pro-card" style={{ padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MapPin size={20} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{stats?.totalDestinations || 0}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{t('profile.destinations') || 'Destinations Visited'}</div>
          </div>

          <div className="pro-card" style={{ padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Activity size={20} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{stats?.totalActivities || 0}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{t('profile.activities') || 'Activities Logged'}</div>
          </div>

          <div className="pro-card" style={{ padding: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Heart size={20} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{stats?.totalSaved || 0}</div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{t('profile.saved') || 'Saved Places'}</div>
          </div>

        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ABOUT YOU */}
          <section className="pro-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>{t('profile.aboutYou')}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.fullName') || 'Full Name'}</label>
                <div style={{ fontSize: '16px', fontWeight: 500, marginTop: '4px' }}>{userData?.name}</div>
              </div>
              
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.emailAddress') || 'Email Address'}</label>
                <div style={{ fontSize: '16px', fontWeight: 500, marginTop: '4px' }}>{userData?.email}</div>
              </div>
              
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.memberSince')}</label>
                <div style={{ fontSize: '16px', fontWeight: 500, marginTop: '4px' }}>{formatDate(userData?.created_at)}</div>
              </div>
            </div>
          </section>

          {/* TRAVEL PREFERENCES */}
          {preferences && (
            <section className="pro-card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>{t('profile.travelPreferences')}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {preferences.interests && preferences.interests.length > 0 && (
                  <div>
                    <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>{t('profile.interests') || 'Interests'}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {preferences.interests.map(interest => (
                        <span key={interest} style={{ background: 'var(--color-bg-secondary)', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, border: '1px solid var(--color-border-light)' }}>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(preferences.travel_style || preferences.trip_pace || preferences.budget_preference) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {preferences.travel_style && (
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.travelStyle') || 'Travel Style'}</label>
                        <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '2px' }}>{preferences.travel_style}</div>
                      </div>
                    )}
                    {preferences.trip_pace && (
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.tripPace') || 'Trip Pace'}</label>
                        <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '2px' }}>{preferences.trip_pace}</div>
                      </div>
                    )}
                    {preferences.budget_preference && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.budget') || 'Budget'}</label>
                        <div style={{ fontSize: '15px', fontWeight: 500, marginTop: '2px' }}>{preferences.budget_preference}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ACCOUNT */}
          <section className="pro-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '32px 32px 16px 32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{t('profile.accountSettings') || 'Account Settings'}</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '20px 32px', borderRadius: 0, borderBottom: '1px solid var(--color-border-light)' }} onClick={() => navigate('/settings')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Lock size={18} style={{ color: 'var(--color-text-secondary)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{t('profile.changePassword') || 'Change password'}</span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '20px 32px', borderRadius: 0, borderBottom: '1px solid var(--color-border-light)' }} onClick={() => navigate('/settings')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Settings size={18} style={{ color: 'var(--color-text-secondary)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{t('profile.applicationSettings') || 'Application settings'}</span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '20px 32px', borderRadius: 0, borderBottom: '1px solid var(--color-border-light)' }} onClick={() => navigate('/saved')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Heart size={18} style={{ color: 'var(--color-text-secondary)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{t('profile.viewSavedPlaces')}</span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>

              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '20px 32px', borderRadius: 0, color: 'var(--color-error)' }} onClick={logout}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <LogOut size={18} />
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{t('profile.logout') || 'Log out'}</span>
                </div>
              </button>

            </div>
          </section>

        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{t('profile.editProfile') || 'Edit profile'}</h2>
              <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" htmlFor="edit-name">{t('profile.fullName') || 'Full Name'}</label>
                <input 
                  id="edit-name"
                  type="text" 
                  className="form-input" 
                  style={{ background: 'var(--color-bg-secondary)' }}
                  value={editForm.name} 
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="edit-email">{t('profile.emailAddress') || 'Email Address'}</label>
                <input 
                  id="edit-email"
                  type="email" 
                  className="form-input" 
                  style={{ background: 'var(--color-bg-secondary)' }}
                  value={editForm.email} 
                  onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  disabled={saving}
                />
              </div>
              
              {editError && <div style={{ color: 'var(--color-error)', fontSize: '14px', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px' }}>{editError}</div>}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{ 
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: 500,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

    </div>
  );
}
