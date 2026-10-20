import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Building2, Ticket, Plus, CheckCircle, XCircle } from 'lucide-react';
import countriesData from 'world-countries';
import SafeImage from '../components/common/SafeImage';
import { fetchApi } from '../services/api';
import '../components/common/common.css';
import './CountryDetail.css';

export default function CountryDetail() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [country, setCountry] = useState(null);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find country by cca2, cca3, or common name (case insensitive)
    const term = code.toLowerCase();
    const found = countriesData.find(c => 
      c.cca2.toLowerCase() === term || 
      c.cca3.toLowerCase() === term || 
      c.name.common.toLowerCase() === term
    );
    
    if (found) {
      setCountry({
        ...found,
        flagUrl: `https://flags.restcountries.com/v5/w640/${found.cca2.toLowerCase()}.png`
      });
    }
    
    // Fetch associated cities and activities
    const loadData = async () => {
      if (!found) { setLoading(false); return; }
      
      try {
        const [citiesRes, actRes] = await Promise.all([
          fetchApi('/cities'),
          fetchApi('/activities')
        ]);
        
        if (citiesRes.success) {
          const matchedCities = citiesRes.cities.filter(city => 
            city.country.toLowerCase() === found.name.common.toLowerCase() ||
            city.country.toLowerCase() === found.cca2.toLowerCase()
          );
          setCities(matchedCities);
        }
        
        if (actRes.success) {
          const matchedActs = actRes.activities.filter(act => {
            // Check if activity belongs to any of the matched cities
            const matchedCities = citiesRes.cities?.filter(c => c.country.toLowerCase() === found.name.common.toLowerCase());
            return matchedCities?.some(c => c.id === act.city_id);
          });
          setActivities(matchedActs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [code]);

  if (loading) {
    return <div className="page-container flex items-center justify-center">Loading...</div>;
  }

  if (!country) {
    return (
      <div className="page-container">
        <button className="btn btn-ghost" onClick={() => navigate('/explore')}>
          <ArrowLeft size={18} /> Back to Explore
        </button>
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <h2>Country not found</h2>
          <p>We couldn't find a country matching "{code}".</p>
        </div>
      </div>
    );
  }

  // Extract useful info
  const population = country.population?.toLocaleString() || 'N/A';
  const capital = country.capital?.[0] || 'N/A';
  const currencyObj = country.currencies ? Object.values(country.currencies)[0] : null;
  const currencyStr = currencyObj ? `${currencyObj.name} (${currencyObj.symbol || 'N/A'})` : 'N/A';
  const region = country.region || 'N/A';
  const subregion = country.subregion || 'N/A';
  const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
  const timezones = country.timezones?.join(', ') || 'N/A';
  const callingCode = country.idd ? `${country.idd.root}${country.idd.suffixes?.[0] || ''}` : 'N/A';
  const area = country.area ? `${country.area.toLocaleString()} km²` : 'N/A';

  return (
    <div className="country-detail-page">
      <div className="cd-header">
        <button className="btn btn-ghost cd-back-btn" onClick={() => navigate('/explore')}>
          <ArrowLeft size={18} /> Back to Explore
        </button>
      </div>

      <div className="cd-hero">
        <div className="cd-hero-bg">
          <SafeImage src={`https://images.unsplash.com/photo-1522878129733-3118a1a367c3?auto=format&fit=crop&w=2000&q=80`} alt={country.name.common} fallbackIcon={Globe} />
          <div className="cd-hero-overlay"></div>
        </div>
        <div className="cd-hero-content">
          <div className="cd-flag-wrap">
            <img src={country.flagUrl} alt={`${country.name.common} flag`} className="cd-flag" />
          </div>
          <h1 className="cd-title">{country.name.common}</h1>
          <p className="cd-subtitle">{country.name.official}</p>
          <div className="cd-hero-meta">
            <span className="badge badge-accent">{region}</span>
            {subregion !== 'N/A' && <span className="badge badge-neutral">{subregion}</span>}
          </div>
        </div>
      </div>

      <div className="page-container cd-content-grid">
        <div className="cd-main">
          
          <div className="cd-section">
            <h2 className="cd-section-title">About {country.name.common}</h2>
            <p className="cd-text">
              {country.name.common} is a beautiful country located in {subregion}. 
              With a population of over {population}, its capital is {capital}. 
              The official currency is the {currencyStr}, and the primary languages spoken include {languages}. 
              It covers an area of {area}.
            </p>
          </div>

          {cities.length > 0 && (
            <div className="cd-section">
              <h2 className="cd-section-title">Popular Places in {country.name.common}</h2>
              <div className="explore-grid">
                {cities.map(city => (
                  <div className="pro-card" key={city.id}>
                    <div className="pro-card-image-wrap">
                      <SafeImage src={city.image} alt={city.name} fallbackIcon={Building2} />
                      <div className="pro-card-overlay"></div>
                    </div>
                    <div className="pro-card-content">
                      <div className="pro-card-tag">{city.country}</div>
                      <div className="pro-card-title">{city.name}</div>
                      <p className="pro-card-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {city.description || 'A beautiful destination to explore.'}
                      </p>
                      <button className="pro-card-action" onClick={() => {
                        // Pass state to Explore or handle here if needed. 
                        // The user said: "Use the existing destination/activity data... Do not invent backend data"
                        // But didn't ask to reproduce the Add to Trip functionality ON the country page for cities, just for the country itself.
                        // Actually, they said: "[ + Add Japan to Trip ]".
                      }}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activities.length > 0 && (
            <div className="cd-section">
              <h2 className="cd-section-title">Popular Activities</h2>
              <div className="explore-grid">
                {activities.map(act => (
                  <div className="pro-card" key={act.id}>
                    <div className="pro-card-image-wrap">
                      <SafeImage src={act.image} alt={act.name} fallbackIcon={Ticket} />
                      <div className="pro-card-overlay"></div>
                    </div>
                    <div className="pro-card-content">
                      <div className="pro-card-tag">{act.type || 'Activity'}</div>
                      <div className="pro-card-title">{act.name}</div>
                      <p className="pro-card-desc" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {act.description || 'An amazing experience.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="cd-sidebar">
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 'var(--space-5)', color: '#0f172a' }}>
              Travel Information
            </h3>
            <div className="cd-info-list">
              <div className="cd-info-item">
                <div className="cd-info-label">Population</div>
                <div className="cd-info-value">{population}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Capital</div>
                <div className="cd-info-value">{capital}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Currency</div>
                <div className="cd-info-value">{currencyStr}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Region</div>
                <div className="cd-info-value">{region}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Subregion</div>
                <div className="cd-info-value">{subregion}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Languages</div>
                <div className="cd-info-value">{languages}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Timezones</div>
                <div className="cd-info-value">{timezones}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Calling Code</div>
                <div className="cd-info-value">{callingCode}</div>
              </div>
              <div className="cd-info-item">
                <div className="cd-info-label">Area</div>
                <div className="cd-info-value">{area}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
