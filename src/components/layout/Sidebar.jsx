import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Map,
  Compass,
  CalendarDays,
  Wallet,
  Bookmark,
  User,
  Settings,
  LogOut,
  Globe,
  X,
  Wand2,
} from 'lucide-react';
import './Sidebar.css';

const navItems = (t) => [
  { to: '/dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard },
  { to: '/trips',     label: t('navigation.trips'),     icon: Map },
  { to: '/plan',      label: t('navigation.planTrip'),  icon: Wand2, highlight: true },
  { to: '/explore',   label: t('navigation.explore'),   icon: Compass },
  { to: '/calendar',  label: t('navigation.calendar'),  icon: CalendarDays },
  { to: '/budget',    label: t('navigation.budget'),    icon: Wallet },
];

const bottomItems = (t) => [
  { to: '/saved',    label: t('navigation.saved'),    icon: Bookmark },
];

const footerItems = (t) => [
  { to: '/profile',  label: t('navigation.profile'),  icon: User },
  { to: '/settings', label: t('navigation.settings'), icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        {/* Close button (mobile) */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Globe size={20} color="white" />
          </div>
          <span className="sidebar-logo-text">GlobeTrotter</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" role="navigation">
          <span className="sidebar-section-label">{t('common.explore') || 'Main'}</span>

          {navItems(t).map(({ to, label, icon: Icon, highlight }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}${highlight ? ' highlight' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-nav-icon">
                <Icon size={17} />
              </span>
              {label}
            </NavLink>
          ))}

          <div className="sidebar-divider" />
          <span className="sidebar-section-label">{t('common.explore') || 'Library'}</span>

          {bottomItems(t).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-nav-icon">
                <Icon size={17} />
              </span>
              {label}
            </NavLink>
          ))}

          <div className="sidebar-divider" />
          <span className="sidebar-section-label">{t('settings.account')}</span>

          {footerItems(t).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-nav-icon">
                <Icon size={17} />
              </span>
              {label}
            </NavLink>
          ))}

          <button
            className="sidebar-nav-item"
            onClick={handleLogout}
            style={{ width: '100%', textAlign: 'left', marginTop: 'auto', color: 'rgba(220,80,80,0.75)' }}
          >
            <span className="sidebar-nav-icon">
              <LogOut size={17} />
            </span>
            {t('navigation.logout')}
          </button>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => { navigate('/profile'); onClose(); }}>
            <div className="sidebar-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
