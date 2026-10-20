import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../services/api';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Bell, 
  Lock, 
  Shield, 
  User, 
  Bookmark, 
  LogOut, 
  Trash2,
  ChevronRight,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import '../components/common/common.css';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ==========================================
  // GENERAL (Language)
  // ==========================================
  const [savingLang, setSavingLang] = useState(false);

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setSavingLang(true);
    try {
      const res = await fetchApi('/profile/language', {
        method: 'PUT',
        body: JSON.stringify({ language: newLang })
      });
      if (res.success) {
        updateUser({ language: newLang });
        showToast('Language updated successfully');
      } else {
        showToast(res.message || 'Failed to update language', 'error');
      }
    } catch (err) {
      showToast('Error updating language', 'error');
    } finally {
      setSavingLang(false);
    }
  };

  // ==========================================
  // APPEARANCE
  // ==========================================
  const [theme, setTheme] = useState(localStorage.getItem('globetrotter_theme') || 'light');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('globetrotter_theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (newTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else if (newTheme === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  };

  // ==========================================
  // SECURITY (Password)
  // ==========================================
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPass, setSavingPass] = useState(false);
  const [passError, setPassError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      setPassError('All fields are required.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    try {
      setSavingPass(true);
      const res = await fetchApi('/profile/password', {
        method: 'PUT',
        body: JSON.stringify({ 
          currentPassword: passForm.currentPassword, 
          newPassword: passForm.newPassword 
        })
      });
      if (res.success) {
        showToast('Password updated successfully');
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPassError(res.message || 'Failed to update password');
      }
    } catch (err) {
      setPassError(err.message || 'An error occurred while updating password');
    } finally {
      setSavingPass(false);
    }
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('You must type DELETE to confirm.');
      return;
    }
    
    try {
      setDeleting(true);
      const res = await fetchApi('/profile', { method: 'DELETE' });
      if (res.success) {
        logout(); // Logs out and clears state
      } else {
        setDeleteError(res.message || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError('An error occurred. Please try again later.');
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // TABS CONFIG
  // ==========================================
  const tabs = [
    { id: 'general', label: t('settings.general'), icon: SettingsIcon },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'security', label: t('settings.security'), icon: Lock },
    { id: 'privacy', label: t('settings.privacy'), icon: Shield },
    { id: 'account', label: t('settings.account'), icon: User },
  ];

  return (
    <div className="page-container page-enter" style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 40px 64px' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          {t('settings.title')}
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          {t('settings.title')}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '16px' }}>
          {t('settings.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px', alignItems: 'start' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '120px' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px',
                fontSize: '15px', fontWeight: 600,
                background: activeTab === tab.id ? 'var(--color-accent-light)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                transition: 'all 0.2s',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* GENERAL */}
          {activeTab === 'general' && (
            <section className="pro-card" style={{ padding: '32px', animation: 'pageEnter 0.2s ease-out' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{t('settings.general')}</h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', borderTop: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={18} style={{ color: 'var(--color-text-muted)' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{t('settings.language')}</h3>
                  </div>
                </div>
                <select 
                  className="form-input" 
                  style={{ width: '180px', padding: '10px 14px' }}
                  value={language}
                  onChange={handleLanguageChange}
                  disabled={savingLang}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="gu">ગુજરાતી</option>
                </select>
              </div>
            </section>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <section className="pro-card" style={{ padding: '32px', animation: 'pageEnter 0.2s ease-out' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{t('settings.appearance')}</h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '14px' }}>Customize how GlobeTrotter looks.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Light */}
                <button 
                  onClick={() => handleThemeChange('light')}
                  style={{ 
                    border: `2px solid ${theme === 'light' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: 'var(--color-surface)',
                    borderRadius: '16px', padding: '20px', textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Sun size={20} style={{ color: '#d97706' }} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Light</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Clean light theme</div>
                </button>

                {/* Dark */}
                <button 
                  onClick={() => handleThemeChange('dark')}
                  style={{ 
                    border: `2px solid ${theme === 'dark' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: 'var(--color-surface)',
                    borderRadius: '16px', padding: '20px', textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Moon size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Dark</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Easier on the eyes</div>
                </button>

                {/* System */}
                <button 
                  onClick={() => handleThemeChange('system')}
                  style={{ 
                    border: `2px solid ${theme === 'system' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: 'var(--color-surface)',
                    borderRadius: '16px', padding: '20px', textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Monitor size={20} style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>System</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Follow device</div>
                </button>
              </div>
            </section>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <section className="pro-card" style={{ padding: '32px', animation: 'pageEnter 0.2s ease-out' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{t('settings.notifications')}</h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '14px' }}>Manage how you receive alerts.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center' }}>
                <Bell size={48} style={{ color: 'var(--color-border)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Push Notifications Coming Soon</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '300px' }}>
                  We are actively building our notification system. Check back later for trip reminders and shared activity alerts.
                </p>
              </div>
            </section>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <section className="pro-card" style={{ padding: '32px', animation: 'pageEnter 0.2s ease-out' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{t('settings.security')}</h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '14px' }}>Keep your account secure.</p>
              </div>

              <div style={{ padding: '24px 0', borderTop: '1px solid var(--color-border-light)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Change Password</h3>
                <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Current Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      style={{ marginTop: '4px', background: 'var(--color-bg-secondary)' }}
                      value={passForm.currentPassword}
                      onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
                      disabled={savingPass}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      style={{ marginTop: '4px', background: 'var(--color-bg-secondary)' }}
                      value={passForm.newPassword}
                      onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                      disabled={savingPass}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      style={{ marginTop: '4px', background: 'var(--color-bg-secondary)' }}
                      value={passForm.confirmPassword}
                      onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      disabled={savingPass}
                    />
                  </div>

                  {passError && <div style={{ color: 'var(--color-error)', fontSize: '13px', fontWeight: 500 }}>{passError}</div>}

                  <div style={{ marginTop: '8px' }}>
                    <button type="submit" className="btn btn-primary" disabled={savingPass}>
                      {savingPass ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* PRIVACY */}
          {activeTab === 'privacy' && (
            <section className="pro-card" style={{ padding: '32px', animation: 'pageEnter 0.2s ease-out' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{t('settings.privacy')}</h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '14px' }}>How your data is handled.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Your Travel Data</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    Your private trips and saved destinations are strictly confidential and only available to your authenticated account.
                  </p>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Public Sharing</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    Only trips you explicitly choose to share publicly can be viewed by others through a unique sharing link. You can revoke public access directly from the specific Trip Details page at any time.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ACCOUNT */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'pageEnter 0.2s ease-out' }}>
              
              <section className="pro-card" style={{ padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{t('settings.account')} Management</h2>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '14px' }}>Manage your account connections and sessions.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>Email Address</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{user?.email}</div>
                    </div>
                  </div>

                  <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '16px 0', borderRadius: 0, borderBottom: '1px solid var(--color-border-light)' }} onClick={() => navigate('/profile')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={18} style={{ color: 'var(--color-text-secondary)' }} />
                      <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>View profile</span>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                  </button>

                  <button className="btn btn-ghost" style={{ justifyContent: 'space-between', padding: '16px 0', borderRadius: 0, borderBottom: '1px solid var(--color-border-light)' }} onClick={() => navigate('/saved')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Bookmark size={18} style={{ color: 'var(--color-text-secondary)' }} />
                      <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>View saved places</span>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                  </button>

                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '16px 0', borderRadius: 0 }} onClick={logout}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <LogOut size={18} style={{ color: 'var(--color-text-secondary)' }} />
                      <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Log out</span>
                    </div>
                  </button>

                </div>
              </section>

              {/* DANGER ZONE */}
              <section className="pro-card" style={{ padding: '32px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-error)' }}>Danger Zone</h2>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '14px' }}>Delete your GlobeTrotter account and associated personal data.</p>
                </div>
                
                <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                  Delete account
                </button>
              </section>

            </div>
          )}

        </div>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--color-error)' }}>
              <Trash2 size={24} />
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Delete your account?</h2>
            </div>
            
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              This action cannot be undone. Your account and associated personal travel data will be permanently deleted.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'block' }}>
                Type DELETE to confirm
              </label>
              <input 
                type="text" 
                className="form-input" 
                style={{ background: 'var(--color-bg-secondary)' }}
                value={deleteConfirmation} 
                onChange={e => setDeleteConfirmation(e.target.value)}
                disabled={deleting}
              />
              {deleteError && <div style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '8px', fontWeight: 500 }}>{deleteError}</div>}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteAccount} 
                disabled={deleting || deleteConfirmation !== 'DELETE'}
              >
                {deleting ? 'Deleting...' : 'Permanently delete account'}
              </button>
            </div>
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
