import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, Check, ExternalLink, Calendar, Compass, Info, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../services/api';
import './Header.css';

const PAGE_TITLES = (t) => ({
  '/dashboard': t('navigation.dashboard') || 'Dashboard',
  '/trips':     t('navigation.trips') || 'My Trips',
  '/trips/create': t('dashboard.createTrip') || 'Create Trip',
  '/explore':   t('navigation.explore') || 'Explore',
  '/calendar':  t('navigation.calendar') || 'Calendar',
  '/budget':    t('navigation.budget') || 'Budget',
  '/saved':     t('navigation.saved') || 'Saved',
  '/profile':   t('navigation.profile') || 'Profile',
  '/settings':  t('navigation.settings') || 'Settings',
});

export default function Header({ onMenuClick }) {
  const { t } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const getTitle = () => {
    const path = location.pathname;
    const titles = PAGE_TITLES(t);
    if (titles[path]) return titles[path];
    if (path.startsWith('/trips/') && path !== '/trips/create') return t('trips.viewTrip') || 'Trip Details';
    return 'GlobeTrotter';
  };

  // Fetch notifications
  const loadNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetchApi('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        const unread = (res.notifications || []).filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id, link, e) => {
    e?.stopPropagation();
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetchApi('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'trip_reminder':
        return <Calendar size={16} className="notif-icon-reminder" />;
      case 'recommendation':
        return <Compass size={16} className="notif-icon-rec" />;
      default:
        return <Info size={16} className="notif-icon-info" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <header className="app-header" role="banner">
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-breadcrumb">
          <span className="header-breadcrumb-title">{getTitle()}</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-icon-btn"
          aria-label="Search"
          onClick={() => navigate('/explore')}
        >
          <Search size={18} />
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="header-notif-wrapper" ref={dropdownRef}>
          <button
            className={`header-icon-btn ${isOpen ? 'active' : ''}`}
            aria-label="Notifications"
            onClick={() => {
              setIsOpen(prev => !prev);
              if (!isOpen) loadNotifications();
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="header-notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="header-notif-dropdown">
              <div className="notif-dropdown-header">
                <div className="notif-dropdown-title-group">
                  <h4 className="notif-dropdown-title">{t('settings.notifications') || 'Notifications'}</h4>
                  {unreadCount > 0 && (
                    <span className="notif-unread-tag">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="notif-mark-all-btn" onClick={handleMarkAllAsRead}>
                    <Check size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="notif-dropdown-body">
                {loading && notifications.length === 0 ? (
                  <div className="notif-empty-state">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p>No notifications yet</p>
                    <span>We'll notify you when trips, activities, or updates occur.</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`notif-item ${!item.is_read ? 'unread' : ''}`}
                      onClick={(e) => handleMarkAsRead(item.id, item.link, e)}
                    >
                      <div className="notif-item-icon">
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="notif-item-content">
                        <div className="notif-item-top">
                          <span className="notif-item-title">{item.title}</span>
                          <span className="notif-item-time">{formatTime(item.created_at)}</span>
                        </div>
                        <p className="notif-item-message">{item.message}</p>
                      </div>
                      {!item.is_read && <span className="notif-unread-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="header-avatar"
          onClick={() => navigate('/profile')}
          role="button"
          aria-label="User profile"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
