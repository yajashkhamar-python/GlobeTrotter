import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Compass, Navigation, User, Map, Plane, Bookmark, Settings, SlidersHorizontal, X, MapPin, Ticket, Clock, Building2, Plus, DollarSign, Search, Globe, AlertTriangle, CheckCircle, XCircle, Info, CalendarDays, Heart, Wand2 } from 'lucide-react';
import { fetchApi } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import SafeImage from '../components/common/SafeImage';
import countriesData from 'world-countries';
import '../components/common/common.css';
import './Explore.css';
import { getCityImg, getCountryImg, getActImg } from '../utils/imageResolver';

// Build a clean, local countries list from world-countries
const globalCountries = countriesData.map(c => ({
  name: {
    common: c.name.common,
    official: c.name.official
  },
  cca2: c.cca2,
  cca3: c.cca3,
  capital: c.capital,
  region: c.region,
  subregion: c.subregion,
  population: c.population,
  currencies: c.currencies,
  languages: c.languages,
  flags: {
    png: `https://flags.restcountries.com/v5/w640/${c.cca2.toLowerCase()}.png`
  }
}));

const POPULAR_COUNTRIES = ['India', 'France', 'Italy', 'Spain', 'United Kingdom', 'Japan', 'United Arab Emirates', 'United States', 'Australia', 'Brazil'];

export default function Explore() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  // Data State
  const [dbCities, setDbCities] = useState([]);
  const [dbActivities, setDbActivities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [publicSearchTerm, setPublicSearchTerm] = useState('');
  const [savedCities, setSavedCities] = useState(new Set());
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingPublic, setLoadingPublic] = useState(true);

  // Dropdown UI state
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Modals state
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Add to Trip state
  const [isAddingToTrip, setIsAddingToTrip] = useState(false);
  const [addSuccessState, setAddSuccessState] = useState(''); // 'success', 'already', 'error', ''
  const [addError, setAddError] = useState('');
  const [targetTripId, setTargetTripId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetStopId, setTargetStopId] = useState('');

  // Toast State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch PostgreSQL data
  useEffect(() => {
    const loadAllData = async () => {
      setLoadingInitial(true);
      setLoadingPublic(true);
      try {
        const [citiesRes, activitiesRes, tripsRes, publicTripsRes, savedRes] = await Promise.allSettled([
          fetchApi('/cities'),
          fetchApi('/activities'),
          fetchApi('/trips').catch(() => ({ success: false })), // Might fail if logged out
          fetchApi('/shared/discover'),
          fetchApi('/saved/destinations').catch(() => ({ success: false }))
        ]);
        
        if (citiesRes.status === 'fulfilled' && citiesRes.value.success) setDbCities(citiesRes.value.cities);
        if (activitiesRes.status === 'fulfilled' && activitiesRes.value.success) setDbActivities(activitiesRes.value.activities);
        if (tripsRes.status === 'fulfilled' && tripsRes.value.success) setTrips(tripsRes.value.trips);
        
        if (publicTripsRes.status === 'fulfilled' && publicTripsRes.value.success) {
          setPublicTrips(publicTripsRes.value.publicTrips);
        }

        if (savedRes.status === 'fulfilled' && savedRes.value.success) {
          setSavedCities(new Set(savedRes.value.destinations.map(d => d.id)));
        }
      } catch (err) {
        console.error('PostgreSQL API error:', err);
      } finally {
        setLoadingInitial(false);
        setLoadingPublic(false);
      }
    };
    loadAllData();
  }, []);

  const handleToggleSaveCity = async (cityId, e) => {
    e.stopPropagation();
    const isSaved = savedCities.has(cityId);
    
    try {
      if (isSaved) {
        const res = await fetchApi(`/saved/destinations/${cityId}`, { method: 'DELETE' });
        if (res.success) {
          setSavedCities(prev => {
            const next = new Set(prev);
            next.delete(cityId);
            return next;
          });
          addToast('Removed from saved places', 'success');
        }
      } else {
        const res = await fetchApi('/saved/destinations', {
          method: 'POST',
          body: JSON.stringify({ cityId })
        });
        if (res.success) {
          setSavedCities(prev => {
            const next = new Set(prev);
            next.add(cityId);
            return next;
          });
          addToast('Added to saved places', 'success');
        }
      }
    } catch (err) {
      addToast('Failed to update saved places', 'error');
    }
  };

  // Compute Search Results based on the local query
  const searchResults = useMemo(() => {
    if (!query.trim()) return { countries: [], cities: [], activities: [] };
    
    const term = query.toLowerCase().trim();
    
    const matchedCountries = globalCountries.filter(c => 
      c.name?.common?.toLowerCase().includes(term) ||
      c.name?.official?.toLowerCase().includes(term) ||
      (c.capital && c.capital[0]?.toLowerCase().includes(term)) ||
      (c.cca3 && c.cca3.toLowerCase().includes(term))
    ).slice(0, 6);

    const matchedCities = dbCities.filter(c => 
      c.name?.toLowerCase().includes(term) ||
      c.country?.toLowerCase().includes(term)
    ).slice(0, 5);

    const matchedActivities = dbActivities.filter(a => 
      a.name?.toLowerCase().includes(term) ||
      a.city_name?.toLowerCase().includes(term)
    ).slice(0, 5);

    return { countries: matchedCountries, cities: matchedCities, activities: matchedActivities };
  }, [query, dbCities, dbActivities]);

  const hasSearchResults = searchResults.countries.length > 0 || searchResults.cities.length > 0 || searchResults.activities.length > 0;

  // Filter public trips
  const filteredPublicTrips = useMemo(() => {
    if (!publicSearchTerm.trim()) return publicTrips;
    const term = publicSearchTerm.toLowerCase();
    return publicTrips.filter(t => 
      t.name?.toLowerCase().includes(term) ||
      t.destination_names?.toLowerCase().includes(term)
    );
  }, [publicTrips, publicSearchTerm]);

  // Add Destination logic
  const handleAddCityToTrip = async () => {
    setAddError('');
    setAddSuccessState('');
    if (!targetTripId || !startDate || !endDate) {
      setAddError('Please fill all fields');
      return;
    }
    
    const trip = trips.find(t => t.id == targetTripId);
    if (trip) {
      if (trip.start_date && startDate < trip.start_date.substring(0, 10)) {
        return setAddError(`Start date must be after ${trip.start_date.substring(0, 10)}`);
      }
      if (trip.end_date && endDate > trip.end_date.substring(0, 10)) {
        return setAddError(`End date must be before ${trip.end_date.substring(0, 10)}`);
      }
      if (startDate > endDate) return setAddError('End date must be after start date');
    }

    const alreadyExists = trip?.stops?.some(s => s.city_id === selectedCity.id);
    if (alreadyExists) {
      setAddSuccessState('already');
      addToast(`Already Added: ${selectedCity.name} is already in your trip.`, 'info');
      return;
    }

    setIsAddingToTrip(true);
    try {
      const res = await fetchApi(`/trips/${targetTripId}/stops`, {
        method: 'POST',
        body: JSON.stringify({ city_id: selectedCity.id, start_date: startDate, end_date: endDate })
      });
      if (res.success) {
        setAddSuccessState('success');
        addToast(`Added to Trip: ${selectedCity.name} has been added to your trip.`, 'success');
        setTrips(prev => prev.map(t => t.id == targetTripId ? { ...t, stops: [...(t.stops || []), { city_id: selectedCity.id }] } : t));
        setTimeout(() => { setSelectedCity(null); setAddSuccessState(''); }, 2000);
      } else {
        setAddSuccessState('error');
        setAddError(res.message || 'Failed to add destination');
        addToast("Couldn't Add to Trip: Something went wrong. Please try again.", 'error');
      }
    } catch (err) {
      setAddSuccessState('error');
      setAddError('An error occurred');
      addToast("Couldn't Add to Trip: Something went wrong. Please try again.", 'error');
    } finally {
      setIsAddingToTrip(false);
    }
  };

  // Add Activity logic
  const handleAddActivityToTrip = async () => {
    setAddError('');
    setAddSuccessState('');
    if (!targetTripId || !targetStopId || !startDate) {
      setAddError('Please select a trip, a stop, and a date');
      return;
    }

    setIsAddingToTrip(true);
    try {
      const res = await fetchApi(`/stops/${targetStopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({ activity_id: selectedActivity.id, date: startDate })
      });
      if (res.success) {
        setAddSuccessState('success');
        addToast(`Added to Trip: ${selectedActivity.name} has been added to your trip.`, 'success');
        setTimeout(() => { setSelectedActivity(null); setAddSuccessState(''); }, 2000);
      } else {
        setAddSuccessState('error');
        setAddError(res.message || 'Failed to add activity');
        addToast("Couldn't Add to Trip: Something went wrong. Please try again.", 'error');
      }
    } catch (err) {
      setAddSuccessState('error');
      setAddError('An error occurred');
      addToast("Couldn't Add to Trip: Something went wrong. Please try again.", 'error');
    } finally {
      setIsAddingToTrip(false);
    }
  };

  const selectedTripForActivity = useMemo(() => trips.find(t => t.id == targetTripId), [targetTripId, trips]);

  const openCountry = (countryData) => { 
    setShowDropdown(false); 
    navigate(`/explore/country/${countryData.cca2}`);
  };
  const openCity = (cityData) => { setSelectedCity(cityData); setTargetTripId(''); setStartDate(''); setEndDate(''); setAddError(''); setAddSuccessState(''); setShowDropdown(false); };
  const openActivity = (actData) => { setSelectedActivity(actData); setTargetTripId(''); setTargetStopId(''); setStartDate(''); setAddError(''); setAddSuccessState(''); setShowDropdown(false); };

  // Matching logic
  const matchingTrips = useMemo(() => {
    if (selectedActivity) {
      return trips.filter(t => t.stops?.some(s => s.city_name === selectedActivity.city_name || (s.city && s.city.name === selectedActivity.city_name)));
    }
    if (selectedCity) {
      return trips.filter(t => t.stops?.some(s => s.city_id === selectedCity.id || s.country === selectedCity.country || (s.city && s.city.country === selectedCity.country)));
    }
    return [];
  }, [selectedCity, selectedActivity, trips]);

  const handleCreateNewTrip = () => {
  const { t } = useLanguage();

    const city = selectedCity || { id: selectedActivity?.city_id, name: selectedActivity?.city_name };
    const imageUrl = selectedCity?.image || selectedActivity?.image || '';
    navigate(`/trips/create?cityId=${city.id}&cityName=${encodeURIComponent(city.name)}`, {
      state: { coverImage: imageUrl }
    });
  };

  if (loadingInitial) {
    return (
      <div className="explore-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>Loading travel directory...</div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={20} className="toast-icon" />}
            {toast.type === 'error' && <XCircle size={20} className="toast-icon" />}
            {toast.type === 'info' && <CheckCircle size={20} className="toast-icon" />}
            <div className="toast-message">
              <strong>{toast.message.split(': ')[0]}</strong>
              {toast.message.split(': ')[1] && <div>{toast.message.split(': ')[1]}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="explore-hero">
        <div className="explore-hero-content">
          <h1 className="explore-hero-title">Explore the world</h1>
          <p className="explore-hero-subtitle">
            Discover destinations, cities and experiences for your next journey.
          </p>
          <div className="search-container-wrapper" ref={searchRef}>
            <Search className="search-icon-large" size={20} />
            <input 
              type="text" 
              className="search-input-large" 
              placeholder="Search countries, cities and experiences..." 
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => { if(query) setShowDropdown(true); }}
            />
            {/* Dropdown Autocomplete */}
            {showDropdown && query.trim() && (
              <div className="search-dropdown">
                {!hasSearchResults ? (
                  <div style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)', textAlign: 'center', fontSize: '14px' }}>
                    No results found for "{query}". Try another search.
                  </div>
                ) : (
                  <>
                    {searchResults.countries.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">Countries</div>
                        {searchResults.countries.map((c, i) => (
                          <div className="search-dropdown-item" key={i} onClick={() => openCountry(c)}>
                            <div className="search-dropdown-item-img">
                              <SafeImage src={getCountryImg(c.name.common)} alt={c.name.common} fallbackIcon={Globe} />
                            </div>
                            <div className="search-dropdown-item-content">
                              <div className="search-dropdown-item-title">{c.name.common}</div>
                              <div className="search-dropdown-item-sub">Country {c.region ? `• ${c.region}` : ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.cities.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">Destinations</div>
                        {searchResults.cities.map((city, i) => (
                          <div className="search-dropdown-item" key={i} onClick={() => openCity(city)}>
                            <div className="search-dropdown-item-img">
                              <SafeImage src={getCityImg(city)} alt={city.name} fallbackIcon={Building2} />
                            </div>
                            <div className="search-dropdown-item-content">
                              <div className="search-dropdown-item-title">{city.name}</div>
                              <div className="search-dropdown-item-sub">{city.country}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.activities.length > 0 && (
                      <div className="search-dropdown-section">
                        <div className="search-dropdown-header">Activities</div>
                        {searchResults.activities.map((act, i) => (
                          <div className="search-dropdown-item" key={i} onClick={() => openActivity(act)}>
                            <div className="search-dropdown-item-img">
                              <SafeImage src={getActImg(act)} alt={act.name} fallbackIcon={Ticket} />
                            </div>
                            <div className="search-dropdown-item-content">
                              <div className="search-dropdown-item-title">{act.name}</div>
                              <div className="search-dropdown-item-sub">{act.city_name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div style={{ marginTop: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            Popular: <span style={{ cursor: 'pointer', margin: '0 8px' }} onClick={() => {setQuery('India'); setShowDropdown(true)}}>India</span>
            <span style={{ cursor: 'pointer', margin: '0 8px' }} onClick={() => {setQuery('Paris'); setShowDropdown(true)}}>Paris</span>
            <span style={{ cursor: 'pointer', margin: '0 8px' }} onClick={() => {setQuery('Tokyo'); setShowDropdown(true)}}>Tokyo</span>
            <span style={{ cursor: 'pointer', margin: '0 8px' }} onClick={() => {setQuery('Dubai'); setShowDropdown(true)}}>Dubai</span>
          </div>
        </div>
      </div>

      <div className="explore-content">
        {/* Popular Destinations */}
        {dbCities.length > 0 && (
          <div className="explore-section">
            <div className="explore-section-header">
              <h2 className="explore-section-title">Popular Destinations</h2>
              <p className="explore-section-subtitle">Discover the most visited places in the GlobeTrotter network.</p>
            </div>
            <div className="explore-grid">
              {dbCities.slice(0, 8).map((city, idx) => (
                <div className={`pro-card hover-lift animate-fade-in delay-${(idx % 6) + 1}`} key={city.id} onClick={() => openCity(city)} style={{ position: 'relative' }}>
                  <div className="pro-card-image-wrap img-zoom-container">
                    <SafeImage src={getCityImg(city)} alt={city.name} fallbackIcon={Building2} fallbackText={city.name} />
                    <div className="pro-card-overlay"></div>
                  </div>
                  <button
                    onClick={(e) => handleToggleSaveCity(city.id, e)}
                    style={{
                      position: 'absolute', top: '16px', right: '16px',
                      background: 'var(--color-surface)', backdropFilter: 'blur(4px)',
                      border: 'none', borderRadius: '50%',
                      width: '36px', height: '36px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: savedCities.has(city.id) ? '#ef4444' : 'var(--color-text-secondary)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      transition: 'transform 0.2s ease, color 0.2s ease'
                    }}
                  >
                    <Heart size={18} fill={savedCities.has(city.id) ? 'currentColor' : 'none'} />
                  </button>
                  <div className="pro-card-content">
                    <div className="pro-card-tag">{city.country}</div>
                    <div className="pro-card-title">{city.name}</div>
                    <p className="pro-card-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {city.description || 'A beautiful destination to explore.'}
                    </p>
                    <button className="pro-card-action">Explore {city.name}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discover Experiences */}
        {dbActivities.length > 0 && (
          <div className="explore-section">
            <div className="explore-section-header">
              <h2 className="explore-section-title">Discover Experiences</h2>
              <p className="explore-section-subtitle">Make your trip memorable with places and activities worth adding to your itinerary.</p>
            </div>
            <div className="explore-grid">
              {dbActivities.slice(0, 8).map((act, idx) => (
                <div className={`pro-card hover-lift animate-fade-in delay-${(idx % 6) + 1}`} key={act.id} onClick={() => openActivity(act)}>
                  <div className="pro-card-image-wrap img-zoom-container">
                    <SafeImage src={getActImg(act)} alt={act.name} fallbackIcon={Ticket} fallbackText={act.name} />
                    <div className="pro-card-overlay"></div>
                  </div>
                  <div className="pro-card-content">
                    <div className="pro-card-tag">{act.type || 'Activity'}</div>
                    <div className="pro-card-title">{act.name}</div>
                    <div className="pro-card-meta">
                      <span style={{display:'flex', alignItems:'center', gap:'4px'}}><MapPin size={12}/> {act.city_name}</span>
                    </div>
                    <p className="pro-card-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {act.description || 'An unforgettable experience waiting for you.'}
                    </p>
                    <button className="pro-card-action primary"><Plus size={16}/> Add to Trip</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Browse by Country */}
        <div className="explore-section">
          <div className="explore-section-header">
            <h2 className="explore-section-title">Browse countries</h2>
            <p className="explore-section-subtitle">Find your next destination by country.</p>
          </div>
          <div className="explore-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {POPULAR_COUNTRIES.map((countryName, i) => {
              const c = globalCountries.find(x => x.name.common === countryName);
              if (!c) return null;
              return (
                <div className={`pro-card hover-lift animate-fade-in delay-${(i % 6) + 1}`} key={i} onClick={() => openCountry(c)}>
                  <div className="pro-card-image-wrap img-zoom-container" style={{ height: '140px' }}>
                    <SafeImage src={getCountryImg(c.name.common)} alt={c.name.common} fallbackIcon={Globe} />
                  </div>
                  <div className="pro-card-content" style={{ padding: 'var(--space-4)' }}>
                    <div className="pro-card-tag">{c.region}</div>
                    <div className="pro-card-title" style={{ fontSize: '18px', marginBottom: 0 }}>{c.name.common}</div>
                    <div className="pro-card-meta" style={{ marginTop: '8px' }}>Capital: {c.capital?.[0] || 'N/A'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Travel Inspiration */}
        <div className="explore-section" style={{ marginTop: 'var(--space-12)' }}>
          <div className="explore-section-header">
            <h2 className="explore-section-title">Explore by Region</h2>
            <p className="explore-section-subtitle">Find your next adventure across the continents.</p>
          </div>
          <div className="explore-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
            {['Europe', 'Asia', 'Americas', 'Africa', 'Oceania'].map((region, i) => (
              <div 
                key={i} 
                className={`pro-card hover-lift animate-fade-in delay-${(i % 6) + 1}`} 
                style={{ height: '160px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => { setQuery(region); setShowDropdown(true); }}
              >
                <div style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}></div>
                <div style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'20px', fontWeight:700, letterSpacing:'0.05em', zIndex:2 }}>
                  {region}
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* ================= MODALS ================= */}

      {/* Country Modal is now a dedicated route /explore/country/:code */}

      {/* City Modal */}
      {selectedCity && (
        <div className="modal-backdrop" onClick={() => setSelectedCity(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: '240px' }}>
              <SafeImage src={getCityImg(selectedCity)} alt={selectedCity.name} fallbackIcon={Building2} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-ghost" 
                  style={{ background: 'var(--color-surface)', color: savedCities.has(selectedCity.id) ? '#ef4444' : 'var(--color-text-secondary)', padding: '8px' }} 
                  onClick={(e) => handleToggleSaveCity(selectedCity.id, e)}
                  title={savedCities.has(selectedCity.id) ? "Unsave Destination" : "Save Destination"}
                >
                  <Heart size={20} fill={savedCities.has(selectedCity.id) ? 'currentColor' : 'none'} />
                </button>
                <button className="btn btn-ghost" style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', padding: '8px' }} onClick={() => setSelectedCity(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{selectedCity.name}</h2>
              <p style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-4)' }}>
                <MapPin size={16} /> {selectedCity.country}
              </p>
              <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)' }}>
                  <Plus size={16} /> Add {selectedCity.name} to Trip
                </h4>
                
                {matchingTrips.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontSize: '14px' }}>
                      No matching trip found.<br/>Your existing trips don't include {selectedCity.country}.
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateNewTrip}>
                      <Plus size={16} /> Create New Trip
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>YOUR MATCHING TRIPS</p>
                    <div>
                      <select className="form-input" value={targetTripId} onChange={e => { setTargetTripId(e.target.value); setAddSuccessState(''); }}>
                        <option value="">-- Choose a matching trip --</option>
                        {matchingTrips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    {targetTripId && (
                      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Start Date</label>
                          <input type="date" className="form-input" value={startDate} onChange={e => { setStartDate(e.target.value); setAddSuccessState(''); }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">End Date</label>
                          <input type="date" className="form-input" value={endDate} onChange={e => { setEndDate(e.target.value); setAddSuccessState(''); }} />
                        </div>
                      </div>
                    )}
                    {addError && <div style={{ color: 'var(--color-error)', fontSize: '13px' }}>{addError}</div>}
                    
                    <button 
                      className={`btn w-full ${addSuccessState === 'success' || addSuccessState === 'already' ? 'btn-success' : 'btn-primary'}`} 
                      disabled={isAddingToTrip || !targetTripId || !startDate || !endDate} 
                      onClick={handleAddCityToTrip}
                    >
                      {isAddingToTrip ? 'Adding...' : 
                       addSuccessState === 'success' ? '✓ Added to Trip' :
                       addSuccessState === 'already' ? '✓ Already Added' :
                       addSuccessState === 'error' ? 'Try Again' : 
                       'Add Destination'}
                    </button>
                  </div>
                )}
                
                {/* Plan Trip CTA Integration */}
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)' }}>
                  <button 
                    className="btn w-full"
                    style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6)', color: 'white', border: 'none' }}
                    onClick={() => navigate(`/plan?cityId=${selectedCity.id}`)}
                  >
                    <Wand2 size={16} /> Plan a Trip with AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPIRATION FROM TRAVELERS */}
      <section className="explore-section inspiration-section">
        <div className="inspiration-header-container">
          <div className="inspiration-header-content">
            <div className="inspiration-header-icon-box">
              <MapPin size={24} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="explore-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '32px' }}>
                Get Inspired by Travelers <Plane size={24} color="var(--color-primary)" />
              </h2>
              <p className="explore-section-subtitle" style={{ maxWidth: '600px', fontSize: '15px' }}>
                Discover real journeys shared by travelers around the world and find inspiration for your next adventure.
              </p>
            </div>
          </div>
          
          <div className="inspiration-search-wrapper">
            <div className="search-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}><Search size={18} /></div>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search public trips, cities, or countries..." 
              value={publicSearchTerm}
              onChange={e => setPublicSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '30px', border: '1px solid var(--color-border-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
            />
          </div>
        </div>

        {loadingPublic ? (
          <div className="inspiration-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="inspiration-card skeleton-card"></div>
            ))}
          </div>
        ) : filteredPublicTrips.length > 0 ? (
          <div className="inspiration-grid">
            {filteredPublicTrips.map((trip, idx) => {
              const days = trip.start_date && trip.end_date ? Math.max(1, Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000)) : '?';
              return (
              <div key={trip.trip_id} className={`inspiration-card hover-lift animate-fade-in delay-${(idx % 6) + 1}`} onClick={() => navigate(`/shared/${trip.share_token}`)}>
                <div className="inspiration-card-image img-zoom-container">
                  <SafeImage src={trip.cover_image || getCountryImg(trip.destination_names?.split(',')[0]?.trim())} alt={trip.name} fallbackIcon={Globe} />
                  <div className="inspiration-card-badge-top">PUBLIC TRIP</div>
                  <div className="inspiration-card-bookmark">
                    <Bookmark size={16} color="white" />
                  </div>
                </div>
                <div className="inspiration-card-content">
                  <h3 className="inspiration-card-title">{trip.name}</h3>
                  <div className="inspiration-card-info-row">
                    <MapPin size={14} /> <span>{trip.destination_names || 'Various Destinations'}</span>
                  </div>
                  <div className="inspiration-card-info-row" style={{ marginBottom: '16px' }}>
                    <CalendarDays size={14} /> 
                    <span>
                      {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '?'} 
                      {' - '} 
                      {trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '?'}
                    </span>
                  </div>
                  
                  <div className="inspiration-card-stats-row">
                    <div className="stat-badge"><CalendarDays size={12}/> {days} days</div>
                    <div className="stat-badge"><MapPin size={12}/> {trip.destination_count} destination{trip.destination_count !== 1 && 's'}</div>
                    <div className="stat-badge"><Settings size={12}/> {trip.activity_count} activities</div>
                  </div>
                  
                  <div className="inspiration-card-creator">
                    <div className="creator-avatar">
                      {trip.creator_name ? trip.creator_name.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div className="creator-info">
                      <div className="creator-name">{trip.creator_name || 'Traveler'}</div>
                      <div className="creator-type">Public trip</div>
                    </div>
                  </div>
                  
                  <button className="inspiration-card-btn">
                    View Itinerary &rarr;
                  </button>
                </div>
              </div>
            )})}
          </div>
        ) : publicSearchTerm ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No trips match your search"
            description="Try another destination or search term to find public itineraries."
            action={<button className="btn btn-ghost" style={{ border: '1px solid var(--color-border-light)' }} onClick={() => setPublicSearchTerm('')}>Clear Search</button>}
          />
        ) : (
          <EmptyState 
            icon={<Globe size={48} />}
            title="No public itineraries yet"
            description="Be the first to share a journey and inspire other travelers."
            action={<button className="btn btn-primary hover-lift" onClick={() => navigate('/plan')}><Wand2 size={16}/> Plan Your Trip</button>}
          />
        )}

        <div className="inspiration-promo-banner animate-fade-in delay-4">
          <div className="promo-left">
            <div className="promo-icon"><Plane size={24} color="var(--color-primary)" /></div>
            <div>
              <h3 className="promo-title">Ready to plan your own adventure?</h3>
              <p className="promo-subtitle">Create your personalized trip and start exploring the world today.</p>
            </div>
          </div>
          <button className="promo-btn hover-lift" onClick={() => navigate('/plan')}>
            + Create a Trip
          </button>
        </div>
      </section>

      </div>

      {/* Activity Modal */}
      {selectedActivity && (
        <div className="modal-backdrop" onClick={() => setSelectedActivity(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', height: '240px' }}>
              <SafeImage src={getActImg(selectedActivity)} alt={selectedActivity.name} fallbackIcon={Ticket} />
              <button className="btn btn-ghost" style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }} onClick={() => setSelectedActivity(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {selectedActivity.type || 'Activity'}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{selectedActivity.name}</h2>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16}/> {selectedActivity.city_name}</span>
                {selectedActivity.cost && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={16}/> ₹{selectedActivity.cost}</span>}
                {selectedActivity.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16}/> {selectedActivity.duration}</span>}
              </div>
              <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)' }}>
                  <Plus size={16} /> Add "{selectedActivity.name}" to Trip
                </h4>
                
                {matchingTrips.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontSize: '14px' }}>
                      No matching trip found for {selectedActivity.city_name}.<br/>Create a {selectedActivity.city_name} trip first to add this activity.
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateNewTrip}>
                      <Plus size={16} /> Create New Trip
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>YOUR MATCHING TRIPS</p>
                    <div>
                      <select className="form-input" value={targetTripId} onChange={e => { setTargetTripId(e.target.value); setAddSuccessState(''); }}>
                        <option value="">-- Choose a matching trip --</option>
                        {matchingTrips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    {targetTripId && selectedTripForActivity?.stops && (
                      <div>
                        <label className="form-label">Select Stop (in {selectedTripForActivity.name})</label>
                        <select className="form-input" value={targetStopId} onChange={e => {
                          setTargetStopId(e.target.value);
                          setAddSuccessState('');
                          const stop = selectedTripForActivity.stops.find(s => s.id == e.target.value);
                          if (stop && stop.start_date) setStartDate(stop.start_date.substring(0, 10));
                        }}>
                          <option value="">-- Choose a stop --</option>
                          {selectedTripForActivity.stops
                            .filter(s => s.city_name === selectedActivity.city_name || (s.city && s.city.name === selectedActivity.city_name))
                            .map(s => (
                              <option key={s.id} value={s.id}>{s.city_name || s.city?.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {targetStopId && (
                      <div>
                        <label className="form-label">Date for Activity</label>
                        <input type="date" className="form-input" value={startDate} onChange={e => { setStartDate(e.target.value); setAddSuccessState(''); }} />
                      </div>
                    )}
                    {addError && <div style={{ color: 'var(--color-error)', fontSize: '13px' }}>{addError}</div>}
                    
                    <button 
                      className={`btn w-full ${addSuccessState === 'success' || addSuccessState === 'already' ? 'btn-success' : 'btn-primary'}`} 
                      disabled={isAddingToTrip || !targetTripId || !targetStopId || !startDate} 
                      onClick={handleAddActivityToTrip}
                    >
                      {isAddingToTrip ? 'Adding...' : 
                       addSuccessState === 'success' ? '✓ Added to Trip' :
                       addSuccessState === 'already' ? '✓ Already Added' :
                       addSuccessState === 'error' ? 'Try Again' : 
                       'Add Activity'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
