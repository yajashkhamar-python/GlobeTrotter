import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, ArrowRight, Heart, MapPin, Compass } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { fetchApi } from '../services/api';
import { getCityImg, getCountryImg, getActImg } from '../utils/imageResolver';
import SafeImage from '../components/common/SafeImage';
import '../components/common/common.css';
import './Saved.css';

export default function Saved() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All Saved');
  const [sortOrder, setSortOrder] = useState('Recent');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchApi('/saved/destinations');
      if (res.success) {
        setSavedDestinations(res.destinations || []);
      } else {
        setError(res.message || 'Failed to fetch saved destinations');
      }
    } catch (err) {
      setError('An error occurred while loading saved destinations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (cityId, cityName) => {
    try {
      const res = await fetchApi(`/saved/destinations/${cityId}`, { method: 'DELETE' });
      if (res.success) {
        setSavedDestinations(prev => prev.filter(d => d.id !== cityId));
        addToast(`Removed ${cityName} from saved.`, 'success');
      } else {
        addToast("Couldn't remove from saved.", 'error');
      }
    } catch (err) {
      addToast("Couldn't remove from saved.", 'error');
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchQuery.toLowerCase();
    
    // Filter
    let filtered = savedDestinations.filter(d => {
      const nameMatch = d.name?.toLowerCase().includes(term);
      const countryMatch = d.country?.toLowerCase().includes(term);
      return nameMatch || countryMatch;
    });

    if (filter === 'Countries') {
      filtered = filtered.filter(d => !d.country); // simple mock for countries
    } else if (filter === 'Cities') {
      filtered = filtered.filter(d => d.country); 
    }

    // Sort
    if (sortOrder === 'A-Z') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOrder === 'Z-A') {
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }

    return filtered;
  }, [savedDestinations, searchQuery, filter, sortOrder]);

  return (
    <div className="saved-page-container">
      
      {/* HEADER */}
      <div className="saved-header">
        <div className="saved-header-left">
          <div className="saved-header-icon-box">
            <Bookmark size={32} fill="currentColor" />
          </div>
          <div>
            <h1 className="saved-header-title">My Saved Places</h1>
            <p className="saved-header-subtitle">Your favorite destinations, all in one place.</p>
          </div>
        </div>
        <div className="saved-header-count">
          {savedDestinations.length} Saved
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="saved-toolbar">
        <div className="saved-search-wrapper">
          <Search size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            className="saved-search-input"
            placeholder="Search saved places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="saved-filters">
          {['All Saved', 'Cities'].map(f => (
            <button 
              key={f}
              className={`saved-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <select 
          className="saved-sort" 
          value={sortOrder} 
          onChange={e => setSortOrder(e.target.value)}
        >
          <option value="Recent">Recently Saved</option>
          <option value="A-Z">Name: A–Z</option>
          <option value="Z-A">Name: Z–A</option>
        </select>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="saved-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="saved-card skeleton-card" style={{ height: '400px' }}></div>
          ))}
        </div>
      ) : error ? (
        <EmptyState 
          icon={<Compass size={48} />}
          title="Something went wrong"
          description={error}
          action={<button className="btn btn-primary" onClick={fetchSaved}>Try Again</button>}
        />
      ) : savedDestinations.length === 0 ? (
        <EmptyState 
          icon={<Heart size={48} />}
          title="Your next adventure starts here"
          description="Save the places you love and keep all your travel inspiration together."
          action={<button className="btn btn-primary" onClick={() => navigate('/explore')}>Explore Destinations</button>}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState 
          icon={<Search size={48} />}
          title="No matches found"
          description="Try another destination or clear your filter."
          action={<button className="btn btn-ghost" onClick={() => { setSearchQuery(''); setFilter('All Saved'); }}>Clear Search</button>}
        />
      ) : (
        <div className="saved-grid">
          {filteredItems.map((dest, idx) => (
            <article key={dest.id} className={`saved-card animate-fade-in delay-${(idx % 6) + 1}`}>
              <div className="saved-card-image-wrap">
                <SafeImage src={dest.image || getCityImg(dest)} alt={dest.name} fallbackIcon={Compass} />
                <button
                  className="saved-card-remove"
                  onClick={() => handleUnsave(dest.id, dest.name)}
                  aria-label={`Unsave ${dest.name}`}
                  title="Remove from saved"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
              
              <div className="saved-card-content">
                <div className="saved-card-type">{dest.country ? 'City' : 'Destination'}</div>
                <h3 className="saved-card-title">{dest.name}</h3>
                
                {dest.country && (
                  <div className="saved-card-location">
                    <MapPin size={14} /> {dest.country} {dest.region ? `• ${dest.region}` : ''}
                  </div>
                )}
                
                <p className="saved-card-desc">
                  {dest.description || 'A beautiful destination to explore. Add this to your next trip to make it memorable.'}
                </p>
                
                <div className="saved-card-actions">
                  <button 
                    className="saved-btn-primary" 
                    onClick={() => navigate(`/explore/country/${(dest.country || dest.name).toLowerCase()}`)} 
                  >
                    Explore
                  </button>
                  <button className="saved-btn-secondary">
                    Add to Trip
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Toast Container */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 500,
            animation: 'slideIn 0.3s ease-out'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
