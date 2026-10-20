/**
 * PlanTrip.jsx — GlobeTrotter Smart Trip Planner
 * 5-step personalized itinerary builder
 * Uses world-countries for full country discovery + PostgreSQL for city/activity data
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, CalendarDays, Heart, Wallet, CheckCircle,
  ChevronRight, ChevronLeft, Globe, Search, Plus, Minus, Clock,
  DollarSign, Users, Star, Info, RefreshCw, Trash2, ArrowRight,
  Compass, X, AlertTriangle, Wand2, Sparkles, Edit2, RotateCcw,
  ZoomIn, BarChart3
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PlannerLoader from '../components/planner/PlannerLoader';
import GeneratedItinerary from '../components/planner/GeneratedItinerary';
import ReplaceModal from '../components/planner/ReplaceModal';
import SmartImg from '../components/common/SmartImg';
import countriesData from 'world-countries';
import './PlanTrip.css';

import { getCityImg, getCountryImg, GENERIC_IMG } from '../utils/imageResolver';
import { formatDate, daysBetween, nightsBetween, formatDayLong } from '../utils/formatters';
import { TRAVEL_STYLES, INTERESTS, CURRENCIES } from '../utils/constants';

// ─── World Countries ──────────────────────────────────────────────────────────
const ALL_COUNTRIES = countriesData.map(c => ({
  name: c.name.common,
  official: c.name.official,
  cca2: c.cca2,
  capital: Array.isArray(c.capital) ? c.capital[0] : c.capital || '',
  region: c.region,
  subregion: c.subregion || '',
})).sort((a, b) => a.name.localeCompare(b.name));

const POPULAR_DESTINATIONS = ['France', 'Japan', 'Thailand', 'Italy', 'India', 'Singapore',
  'United Kingdom', 'United Arab Emirates', 'Australia', 'Spain', 'Indonesia', 'Greece'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

const STEPS = [
  { id: 0, label: 'Destination', short: '01' },
  { id: 1, label: 'Dates', short: '02' },
  { id: 2, label: 'Preferences', short: '03' },
  { id: 3, label: 'Budget', short: '04' },
  { id: 4, label: 'Review', short: '05' },
];

const LOADING_MSGS = [
  'Matching your destination…',
  'Selecting activities…',
  'Applying your interests…',
  'Balancing your schedule…',
  'Checking budget compatibility…',
  'Building your itinerary…',
];

// ─── Progress Indicator ───────────────────────────────────────────────────────
function PlannerProgress({ step, onGoToStep, maxCompleted }) {
  return (
    <div className="planner-progress" role="navigation" aria-label="Planner steps">
      {STEPS.map((s, i) => {
        const isDone = i < step;
        const isActive = i === step;
        const canClick = i <= maxCompleted;
        return (
          <React.Fragment key={s.id}>
            <button
              className={`pp-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => canClick && onGoToStep(i)}
              disabled={!canClick}
              aria-current={isActive ? 'step' : undefined}
              title={s.label}
            >
              <div className="pp-circle">
                {isDone ? <CheckCircle size={14} strokeWidth={2.5} /> : <span>{s.short}</span>}
              </div>
              <span className="pp-label">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`pp-line ${isDone ? 'done' : ''}`} aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Destination ──────────────────────────────────────────────────────
function DestinationStep({ selectedCity, onSelectCity }) {
  const [search, setSearch] = useState('');
  const [dbCities, setDbCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryCities, setCountryCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);
  const inputRef = useRef(null);

  // Load all DB cities once
  useEffect(() => {
    fetchApi('/cities').then(d => {
      setDbCities(d.cities || []);
      setDbLoaded(true);
    }).catch(() => setDbLoaded(true));
  }, []);

  // Pre-select country from existing selection
  useEffect(() => {
    if (selectedCity && !selectedCountry) {
      const c = ALL_COUNTRIES.find(c => c.name === selectedCity.country);
      if (c) setSelectedCountry(c);
    }
  }, [selectedCity]);

  // Filtered countries from world-countries
  const filteredCountries = useMemo(() => {
    if (!search.trim()) {
      return ALL_COUNTRIES.filter(c => POPULAR_DESTINATIONS.includes(c.name));
    }
    const term = search.toLowerCase();
    return ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.official.toLowerCase().includes(term) ||
      (c.capital && c.capital.toLowerCase().includes(term)) ||
      (c.subregion && c.subregion.toLowerCase().includes(term))
    ).slice(0, 24);
  }, [search]);

  // Filtered cities based on search
  const filteredCities = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return dbCities.filter(c => c.name.toLowerCase().includes(term));
  }, [search, dbCities]);

  // When country selected, get its DB cities
  const handleCountrySelect = useCallback(async (country) => {
    setSelectedCountry(country);
    setLoadingCities(true);
    // Filter from already-loaded cities
    const cities = dbCities.filter(c =>
      c.country.toLowerCase() === country.name.toLowerCase() ||
      (country.cca2 === 'GB' && c.country === 'UK')
    );
    setCountryCities(cities);
    setLoadingCities(false);
  }, [dbCities]);

  const handleBack = () => {
    setSelectedCountry(null);
    setCountryCities([]);
    if (search) setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className="step-content" aria-label="Destination selection">
      <div className="step-hero">
        <Compass size={36} className="step-hero-icon" />
        <h2>Where do you want to go?</h2>
        <p>Choose a country, then select your destination city.</p>
      </div>

      {/* Search */}
      <div className="dest-search" role="search">
        <Search size={16} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search countries, cities or destinations…"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedCountry(null); }}
          aria-label="Search destinations"
          autoFocus
        />
        {search && (
          <button onClick={() => { setSearch(''); setSelectedCountry(null); }} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {/* --- LEVEL 2: Cities in selected country --- */}
      {selectedCountry && (
        <div className="dest-level2">
          <button className="dest-back-btn" onClick={handleBack}>
            <ChevronLeft size={15} /> {selectedCountry.name}
          </button>
          <div className="dest-country-banner">
            <SmartImg
              src={getCountryImg(selectedCountry.name)}
              fallback={GENERIC_IMG}
              alt={selectedCountry.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="dest-country-banner-overlay">
              <div>
                <h3>{selectedCountry.name}</h3>
                <p>{selectedCountry.capital && `Capital: ${selectedCountry.capital} · `}{selectedCountry.region}</p>
              </div>
            </div>
          </div>

          {loadingCities ? (
            <div className="dest-loading">
              <div className="planner-spinner sm" /> Loading destinations…
            </div>
          ) : countryCities.length > 0 ? (
            <>
              <p className="dest-l2-label">Popular destinations in {selectedCountry.name}</p>
              <div className="dest-city-grid">
                {countryCities.map(city => (
                  <button
                    key={city.id}
                    className={`dest-city-card ${selectedCity?.id === city.id ? 'selected' : ''}`}
                    onClick={() => onSelectCity(city)}
                    aria-pressed={selectedCity?.id === city.id}
                  >
                    <div className="dest-city-img">
                      <SmartImg src={getCityImg(city)} fallback={GENERIC_IMG} alt={city.name} />
                      {selectedCity?.id === city.id && (
                        <div className="dest-city-selected-badge"><CheckCircle size={20} /></div>
                      )}
                    </div>
                    <div className="dest-city-info">
                      <div className="dest-city-name">{city.name}</div>
                      <div className="dest-city-meta">
                        <Globe size={10} />{city.country}
                        {city.region && <span>· {city.region}</span>}
                      </div>
                      {city.description && (
                        <p className="dest-city-desc">{city.description.slice(0, 70)}…</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="dest-no-cities">
              <Globe size={32} />
              <h4>No itinerary data yet for {selectedCountry.name}</h4>
              <p>We don't have detailed city data for this country in our planner yet. Choose another destination or browse popular cities below.</p>
              <button className="planner-btn-outline" onClick={handleBack}>
                <ChevronLeft size={14} /> Browse Other Countries
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- LEVEL 1: Country grid --- */}
      {!selectedCountry && (
        <>
          <p className="dest-section-label">
            {search.trim() ? `${filteredCountries.length + filteredCities.length} result${(filteredCountries.length + filteredCities.length) !== 1 ? 's' : ''} for "${search}"` : 'Popular Destinations'}
          </p>
          {(filteredCountries.length === 0 && filteredCities.length === 0) ? (
            <div className="dest-empty">
              <Compass size={40} />
              <h4>No destinations found for "{search}"</h4>
              <p>Try a different country name or capital city.</p>
              <button className="planner-btn-outline" onClick={() => setSearch('')}>
                <X size={14} /> Clear Search
              </button>
            </div>
          ) : (
            <div className="dest-country-grid">
              {filteredCities.map(city => (
                <button
                  key={city.id}
                  className="dest-city-card"
                  onClick={() => onSelectCity(city)}
                  aria-label={`Select ${city.name}`}
                >
                  <div className="dest-city-img">
                    <SmartImg src={getCityImg(city)} fallback={GENERIC_IMG} alt={city.name} />
                  </div>
                  <div className="dest-city-info">
                    <div className="dest-city-name">{city.name}</div>
                    <div className="dest-city-meta">
                      <Globe size={10} />{city.country}
                    </div>
                  </div>
                </button>
              ))}
              {filteredCountries.map(country => {
                const hasCities = dbCities.some(c =>
                  c.country.toLowerCase() === country.name.toLowerCase() ||
                  (country.cca2 === 'GB' && c.country === 'UK')
                );
                return (
                  <button
                    key={country.cca2}
                    className={`dest-country-card ${hasCities ? 'has-data' : ''}`}
                    onClick={() => handleCountrySelect(country)}
                    aria-label={`Select ${country.name}`}
                  >
                    <div className="dest-country-img">
                      <SmartImg src={getCountryImg(country.name)} fallback={GENERIC_IMG} alt={country.name} />
                      <div className="dest-country-gradient" />
                      {hasCities && <div className="dest-data-badge">✓ Available</div>}
                    </div>
                    <div className="dest-country-info">
                      <div className="dest-country-name">{country.name}</div>
                      <div className="dest-country-meta">{country.capital || country.region}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Step 2: Dates ────────────────────────────────────────────────────────────
function DatesStep({ startDate, endDate, onChange }) {
  const today = todayStr();
  const days = daysBetween(startDate, endDate);
  const nights = nightsBetween(startDate, endDate);

  return (
    <div className="step-content">
      <div className="step-hero">
        <CalendarDays size={36} className="step-hero-icon" />
        <h2>When are you travelling?</h2>
        <p>Select your travel dates to build your personalised day-by-day plan.</p>
      </div>

      <div className="dates-grid">
        <div className="date-field">
          <label htmlFor="start-date">Departure Date</label>
          <div className="date-input-wrap">
            <CalendarDays size={16} />
            <input
              id="start-date"
              type="date"
              value={startDate}
              min={today}
              onChange={e => {
                const newStart = e.target.value;
                onChange({ startDate: newStart, endDate: endDate < newStart ? newStart : endDate });
              }}
              aria-label="Departure date"
            />
          </div>
          {startDate && <div className="date-display">{formatDate(startDate, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</div>}
        </div>

        <div className="dates-arrow" aria-hidden="true"><ArrowRight size={20} /></div>

        <div className="date-field">
          <label htmlFor="end-date">Return Date</label>
          <div className="date-input-wrap">
            <CalendarDays size={16} />
            <input
              id="end-date"
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={e => onChange({ startDate, endDate: e.target.value })}
              aria-label="Return date"
            />
          </div>
          {endDate && <div className="date-display">{formatDate(endDate, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</div>}
        </div>
      </div>

      {startDate && endDate && days > 0 && (
        <div className="dates-duration" role="status" aria-live="polite">
          <div className="dates-duration-inner">
            <CalendarDays size={18} />
            <div>
              <div className="dates-duration-main">
                <strong>{days}</strong> {days === 1 ? 'day' : 'days'} / <strong>{nights}</strong> {nights === 1 ? 'night' : 'nights'}
              </div>
              <div className="dates-duration-range">
                {formatDate(startDate, { day: 'numeric', month: 'short' })} → {formatDate(endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {endDate && startDate && endDate < startDate && (
        <div className="planner-error-msg" role="alert">
          <AlertTriangle size={15} /> Return date must be after departure date.
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Preferences ──────────────────────────────────────────────────────
function PreferencesStep({ travelStyle, interests, travelers, onStyleChange, onInterestToggle, onTravelersChange }) {
  const styleLabel = TRAVEL_STYLES.find(s => s.id === travelStyle)?.label || '';
  const interestLabels = interests.map(i => INTERESTS.find(x => x.id === i)?.label || i);

  return (
    <div className="step-content">
      <div className="step-hero">
        <Heart size={36} className="step-hero-icon" />
        <h2>What kind of trip do you want?</h2>
        <p>Your travel style and interests shape your personalised itinerary.</p>
      </div>

      <section className="pref-section" aria-labelledby="style-heading">
        <h3 id="style-heading">Travel Style</h3>
        <div className="style-grid" role="radiogroup" aria-labelledby="style-heading">
          {TRAVEL_STYLES.map(s => (
            <button
              key={s.id}
              role="radio"
              aria-checked={travelStyle === s.id}
              className={`style-card ${travelStyle === s.id ? 'selected' : ''}`}
              onClick={() => onStyleChange(s.id)}
            >
              <span className="style-emoji" aria-hidden="true">{s.emoji}</span>
              <span className="style-label">{s.label}</span>
              <span className="style-desc">{s.desc}</span>
              {travelStyle === s.id && <CheckCircle size={14} className="style-check" />}
            </button>
          ))}
        </div>
      </section>

      <section className="pref-section" aria-labelledby="interests-heading">
        <h3 id="interests-heading">Interests <span className="pref-hint">Select all that apply</span></h3>
        <div className="interests-grid">
          {INTERESTS.map(int => (
            <button
              key={int.id}
              className={`interest-chip ${interests.includes(int.id) ? 'selected' : ''}`}
              onClick={() => onInterestToggle(int.id)}
              aria-pressed={interests.includes(int.id)}
            >
              <span aria-hidden="true">{int.emoji}</span>
              <span>{int.label}</span>
              {interests.includes(int.id) && <CheckCircle size={11} />}
            </button>
          ))}
        </div>
      </section>

      <section className="pref-section" aria-labelledby="travelers-heading">
        <h3 id="travelers-heading">Number of Travellers</h3>
        <div className="travelers-row">
          <button
            className="travelers-btn"
            onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
            disabled={travelers <= 1}
            aria-label="Decrease travelers"
          >
            <Minus size={16} />
          </button>
          <div className="travelers-display" aria-live="polite">
            <Users size={18} aria-hidden="true" />
            <span className="travelers-num">{travelers}</span>
            <span className="travelers-label">{travelers === 1 ? 'traveller' : 'travellers'}</span>
          </div>
          <button
            className="travelers-btn"
            onClick={() => onTravelersChange(Math.min(20, travelers + 1))}
            aria-label="Increase travelers"
          >
            <Plus size={16} />
          </button>
        </div>
      </section>

      {/* Dynamic trip personality */}
      {(styleLabel || interestLabels.length > 0) && (
        <div className="trip-personality" role="status" aria-live="polite">
          <Sparkles size={14} aria-hidden="true" />
          <span className="trip-personality-label">Trip Personality:</span>
          <span>
            {[styleLabel, ...interestLabels.slice(0, 3)].filter(Boolean).join(' · ')}
            {interestLabels.length > 3 && ` +${interestLabels.length - 3} more`}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Budget ───────────────────────────────────────────────────────────
function BudgetStep({ budget, currency, budgetPref, onBudgetChange, onCurrencyChange, onPrefChange, startDate, endDate, travelers }) {
  const days = daysBetween(startDate, endDate);
  const perDay = days > 0 && budget > 0 ? Math.round(budget / days) : 0;
  const perPersonPerDay = perDay > 0 && travelers > 0 ? Math.round(perDay / travelers) : 0;
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  const alloc = budget > 0 ? [
    { label: 'Accommodation', pct: 0.40, color: '#3b82f6' },
    { label: 'Transport', pct: 0.20, color: '#8b5cf6' },
    { label: 'Activities', pct: 0.20, color: '#10b981' },
    { label: 'Food', pct: 0.15, color: '#f59e0b' },
    { label: 'Other', pct: 0.05, color: '#6b7280' },
  ] : [];

  return (
    <div className="step-content">
      <div className="step-hero">
        <Wallet size={36} className="step-hero-icon" />
        <h2>What's your budget?</h2>
        <p>Your budget helps us recommend activities that give you the best value.</p>
      </div>

      <div className="budget-pref-row">
        {[
          { id: 'flexible', label: 'Flexible', desc: 'No strict limit' },
          { id: 'balanced', label: 'Balanced', desc: 'Aim for within budget' },
          { id: 'strict', label: 'Strict', desc: 'Stay within budget' },
        ].map(p => (
          <button
            key={p.id}
            className={`budget-pref-btn ${budgetPref === p.id ? 'selected' : ''}`}
            onClick={() => onPrefChange(p.id)}
          >
            <span className="bpb-label">{p.label}</span>
            <span className="bpb-desc">{p.desc}</span>
          </button>
        ))}
      </div>

      <div className="budget-currency-row">
        <div className="budget-currency-select">
          <label htmlFor="currency-select">Currency</label>
          <select id="currency-select" value={currency} onChange={e => onCurrencyChange(e.target.value)}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>
            ))}
          </select>
        </div>
        <div className="budget-input-wrap">
          <label htmlFor="budget-amount">Total Trip Budget</label>
          <div className="budget-input-inner">
            <span className="budget-sym">{sym}</span>
            <input
              id="budget-amount"
              type="number"
              placeholder="0"
              value={budget || ''}
              min={0}
              onChange={e => onBudgetChange(parseFloat(e.target.value) || 0)}
              aria-label="Total trip budget"
            />
          </div>
        </div>
      </div>

      {budget > 0 && days > 0 && (
        <div className="budget-per-day" role="status">
          <DollarSign size={15} />
          <span><strong>{sym}{perDay.toLocaleString()}</strong> per day</span>
          {travelers > 1 && <span>· <strong>{sym}{perPersonPerDay.toLocaleString()}</strong> per person/day</span>}
        </div>
      )}

      {budget > 0 && (
        <div className="budget-alloc">
          <div className="budget-alloc-header">
            <BarChart3 size={14} />
            <span>Suggested Budget Allocation</span>
            <span className="budget-alloc-note">Estimated only — not including flights</span>
          </div>
          {alloc.map(a => (
            <div key={a.label} className="budget-alloc-row">
              <span className="bal-label">{a.label}</span>
              <div className="bal-bar-wrap">
                <div className="bal-bar" style={{ width: `${a.pct * 100}%`, background: a.color }} />
              </div>
              <span className="bal-val">{sym}{Math.round(budget * a.pct).toLocaleString()}</span>
              <span className="bal-pct">{Math.round(a.pct * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="budget-skip-note">
        <Info size={13} /> Budget is optional. Skip it and we'll still build a great itinerary.
      </div>
    </div>
  );
}

// ─── Step 5: Review & Generate ────────────────────────────────────────────────
function ReviewStep({ city, startDate, endDate, travelStyle, interests, travelers, budget, currency, budgetPref, onEdit, onGenerate, generating, genError }) {
  const days = daysBetween(startDate, endDate);
  const nights = nightsBetween(startDate, endDate);
  const styleObj = TRAVEL_STYLES.find(s => s.id === travelStyle);
  const interestObjs = interests.map(i => INTERESTS.find(x => x.id === i)).filter(Boolean);
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  return (
    <div className="step-content">
      <div className="step-hero">
        <Wand2 size={36} className="step-hero-icon" />
        <h2>Review & Generate</h2>
        <p>Everything looks good? Hit Generate to build your personalised day-by-day itinerary.</p>
      </div>

      <div className="review-card">
        {/* Destination */}
        <div className="review-dest-img">
          <SmartImg src={getCityImg(city)} fallback={GENERIC_IMG} alt={city?.name} />
          <div className="review-dest-overlay">
            <h3>{city?.name}</h3>
            <p>{city?.country}</p>
          </div>
        </div>
        <div className="review-sections">
          <ReviewSection icon={CalendarDays} label="Dates" onEdit={() => onEdit(1)}>
            <div className="review-val-main">{formatDate(startDate, { day: 'numeric', month: 'short' })} – {formatDate(endDate, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className="review-val-sub">{days} days / {nights} nights</div>
          </ReviewSection>
          <ReviewSection icon={Users} label="Travellers" onEdit={() => onEdit(2)}>
            <div className="review-val-main">{travelers} {travelers === 1 ? 'traveller' : 'travellers'}</div>
          </ReviewSection>
          <ReviewSection icon={Heart} label="Travel Style" onEdit={() => onEdit(2)}>
            <div className="review-val-main">{styleObj?.emoji} {styleObj?.label}</div>
            <div className="review-val-sub">{styleObj?.desc}</div>
          </ReviewSection>
          {interestObjs.length > 0 && (
            <ReviewSection icon={Sparkles} label="Interests" onEdit={() => onEdit(2)}>
              <div className="review-chips">
                {interestObjs.map(i => (
                  <span key={i.id} className="review-chip">{i.emoji} {i.label}</span>
                ))}
              </div>
            </ReviewSection>
          )}
          {budget > 0 && (
            <ReviewSection icon={Wallet} label="Budget" onEdit={() => onEdit(3)}>
              <div className="review-val-main">{sym}{budget.toLocaleString()} <span className="review-pref-badge">{budgetPref}</span></div>
            </ReviewSection>
          )}
        </div>
      </div>

      {genError && (
        <div className="planner-error-msg" role="alert">
          <AlertTriangle size={15} /> {genError}
        </div>
      )}

      <button
        className="generate-btn"
        onClick={onGenerate}
        disabled={generating}
        aria-busy={generating}
      >
        {generating ? (
          <><div className="btn-spinner" /> Generating…</>
        ) : (
          <><Wand2 size={18} /> Generate My Itinerary</>
        )}
      </button>
    </div>
  );
}

function ReviewSection({ icon: Icon, label, children, onEdit }) {
  return (
    <div className="review-section">
      <div className="review-section-left">
        <Icon size={14} className="review-section-icon" />
        <span className="review-section-label">{label}</span>
      </div>
      <div className="review-section-val">{children}</div>
      <button className="review-edit-btn" onClick={onEdit} aria-label={`Edit ${label}`}>
        <Edit2 size={13} />
      </button>
    </div>
  );
}

// Components have been extracted to src/components/planner

// ─── Main PlanTrip Page ────────────────────────────────────────────────────────
export default function PlanTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step state
  const [step, setStep] = useState(0);
  const [maxCompleted, setMaxCompleted] = useState(0);

  // Form state
  const [city, setCity] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [interests, setInterests] = useState([]);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [budgetPref, setBudgetPref] = useState('flexible');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genError, setGenError] = useState('');
  const [itinerary, setItinerary] = useState(null);

  // Replace modal
  const [replaceTarget, setReplaceTarget] = useState(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedTripId, setSavedTripId] = useState(null);

  // Pre-fill from query params
  useEffect(() => {
    const qCityId = searchParams.get('cityId');
    if (qCityId) {
      fetchApi('/cities').then(d => {
        const found = (d.cities || []).find(c => String(c.id) === qCityId);
        if (found) { setCity(found); setMaxCompleted(1); }
      }).catch(() => { });
    }
  }, [searchParams]);

  // ── Navigation validation ─────────────────────────────────────────────────
  const canContinue = useMemo(() => {
    if (step === 0) return !!city;
    if (step === 1) return !!startDate && !!endDate && endDate >= startDate;
    if (step === 2) return !!travelStyle;
    if (step === 3) return true;
    return false;
  }, [step, city, startDate, endDate, travelStyle]);

  const goNext = () => {
    const next = Math.min(4, step + 1);
    setStep(next);
    setMaxCompleted(prev => Math.max(prev, next));
  };

  const goToStep = (target) => {
    if (target <= maxCompleted) setStep(target);
  };

  const toggleInterest = useCallback((id) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenError('');
    setGenerating(true);
    setGenStep(0);

    const timers = LOADING_MSGS.map((_, i) => setTimeout(() => setGenStep(i), i * 600));

    try {
      const res = await fetchApi('/planner/generate', {
        method: 'POST',
        body: JSON.stringify({ cityId: city.id, startDate, endDate, travelStyle, interests, travelers, budget }),
      });
      if (res.success) {
        await new Promise(r => setTimeout(r, 400));
        setItinerary(res.itinerary);
      } else {
        setGenError(res.isActivityError ? res.message : 'Something went wrong while creating your itinerary.');
      }
    } catch (err) {
      setGenError('Something went wrong while creating your itinerary.');
    } finally {
      timers.forEach(clearTimeout);
      setGenerating(false);
    }
  };

  // ── Remove activity ───────────────────────────────────────────────────────
  const handleRemoveActivity = useCallback((date, actId) => {
    setItinerary(prev => {
      let removedCost = 0;
      const newDays = prev.days.map(d => {
        if (d.date === date) {
          const act = d.activities.find(a => a.id === actId);
          if (act) removedCost = parseFloat(act.cost) || 0;
          return { ...d, activities: d.activities.filter(a => a.id !== actId) };
        }
        return d;
      });
      
      return {
        ...prev,
        days: newDays,
        totalActivities: prev.totalActivities - 1,
        budget: {
          ...prev.budget,
          knownActivityCost: Math.max(0, (prev.budget?.knownActivityCost || 0) - removedCost),
          total: Math.max(0, (prev.budget?.total || 0) - removedCost)
        }
      };
    });
  }, []);

  // ── Replace activity ──────────────────────────────────────────────────────
  const usedIds = useMemo(() => {
    if (!itinerary) return new Set();
    return new Set(itinerary.days.flatMap(d => d.activities.map(a => a.id)));
  }, [itinerary]);

  const handleOpenReplace = useCallback((date, act) => {
    setReplaceTarget({ date, act });
  }, []);

  const handleConfirmReplace = useCallback((newAct) => {
    if (!replaceTarget) return;
    const { date, act } = replaceTarget;
    setItinerary(prev => {
      const oldCost = parseFloat(act.cost) || 0;
      const newCost = parseFloat(newAct.cost) || 0;
      const costDiff = newCost - oldCost;

      return {
        ...prev,
        days: prev.days.map(d =>
          d.date === date
            ? { ...d, activities: d.activities.map(a => a.id === act.id ? { ...newAct, _reason: 'Manually selected replacement.' } : a) }
            : d
        ),
        budget: {
          ...prev.budget,
          knownActivityCost: Math.max(0, (prev.budget?.knownActivityCost || 0) + costDiff),
          total: Math.max(0, (prev.budget?.total || 0) + costDiff)
        }
      };
    });
    setReplaceTarget(null);
  }, [replaceTarget]);

  // ── Regenerate ────────────────────────────────────────────────────────────
  const handleRegenerate = () => {
    setItinerary(null);
    setSavedTripId(null);
    setSaveError('');
    setStep(4);
    setMaxCompleted(4);
  };

  // ── Save trip ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!itinerary || !city) return;
    setSaving(true);
    setSaveError('');
    try {
      const interestLabels = interests.map(i => INTERESTS.find(x => x.id === i)?.label || i);
      const res = await fetchApi('/planner/save', {
        method: 'POST',
        body: JSON.stringify({
          tripName: `${city.name} Trip`,
          cityId: city.id,
          startDate,
          endDate,
          description: `Personalised ${travelStyle} trip to ${city.name}${interestLabels.length ? `. Interests: ${interestLabels.join(', ')}` : ''}.`,
          days: itinerary.days,
          coverImage: city.image
        }),
      });
      if (res.success) setSavedTripId(res.tripId);
      else setSaveError(res.message || 'Failed to save trip.');
    } catch (err) {
      setSaveError(err.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // Generation loader overlay
  if (generating) {
    return (
      <div className="planner-page">
        <PlannerLoader step={genStep} />
      </div>
    );
  }

  // Generated result
  if (itinerary) {
    return (
      <div className="planner-page">
        <GeneratedItinerary
          itinerary={itinerary}
          onRemoveActivity={handleRemoveActivity}
          onReplaceActivity={(date, act) => handleOpenReplace(date, act)}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          saving={saving}
          saveError={saveError}
          savedTripId={savedTripId}
          navigate={navigate}
          currency={currency}
        />
        {replaceTarget && (
          <ReplaceModal
            activity={replaceTarget.act}
            cityId={city.id}
            usedIds={usedIds}
            interests={interests}
            travelStyle={travelStyle}
            budget={budget}
            onSelect={handleConfirmReplace}
            onClose={() => setReplaceTarget(null)}
          />
        )}
      </div>
    );
  }

  // Multi-step planner
  return (
    <div className="planner-page">
      <div className="planner-container">
        <div className="planner-header">
          <div>
            <h1 className="planner-title">
              Plan Your Trip
            </h1>
            <p className="planner-subtitle">Build a personalized itinerary around your destination, dates, interests and budget.</p>
          </div>
          <Compass size={32} style={{ color: 'var(--color-accent)' }} />
        </div>

        {/* Hero Section */}
        <div className="planner-hero">
          <div className="planner-hero-bg"></div>
          <div className="planner-hero-overlay"></div>
          <div className="planner-hero-content">
            <h2>PLAN YOUR NEXT ADVENTURE</h2>
            <p>Tell us where you want to go and we'll help build your journey.</p>
          </div>
        </div>

        <PlannerProgress step={step} onGoToStep={goToStep} maxCompleted={maxCompleted} />

        <div className="planner-panel">
          <div className="planner-panel-inner">
            {step === 0 && <DestinationStep selectedCity={city} onSelectCity={(c) => { setCity(c); }} />}
            {step === 1 && (
              <DatesStep
                startDate={startDate}
                endDate={endDate}
                onChange={({ startDate: s, endDate: e }) => { setStartDate(s); setEndDate(e); }}
              />
            )}
            {step === 2 && (
              <PreferencesStep
                travelStyle={travelStyle}
                interests={interests}
                travelers={travelers}
                onStyleChange={setTravelStyle}
                onInterestToggle={toggleInterest}
                onTravelersChange={setTravelers}
              />
            )}
            {step === 3 && (
              <BudgetStep
                budget={budget}
                currency={currency}
                budgetPref={budgetPref}
                onBudgetChange={setBudget}
                onCurrencyChange={setCurrency}
                onPrefChange={setBudgetPref}
                startDate={startDate}
                endDate={endDate}
                travelers={travelers}
              />
            )}
            {step === 4 && !generating && (
              <ReviewStep
                city={city}
                startDate={startDate}
                endDate={endDate}
                travelStyle={travelStyle}
                interests={interests}
                travelers={travelers}
                budget={budget}
                currency={currency}
                budgetPref={budgetPref}
                onEdit={goToStep}
                onGenerate={handleGenerate}
                generating={generating}
                genError={genError}
              />
            )}
            {genError && (
              <div className="planner-error-box" style={{ padding: '24px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: '16px', marginTop: '24px', textAlign: 'center' }}>
                <div style={{ color: 'var(--color-error)', fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{genError}</div>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Please try again or adjust your preferences.</div>
                <button className="planner-btn" onClick={handleGenerate}>Try Again</button>
              </div>
            )}
          </div>

          {/* Navigation footer */}
          {step < 4 && (
            <div className="planner-nav">
              <button
                className="planner-btn-outline"
                onClick={() => { if (step > 0) setStep(s => s - 1); }}
                disabled={step === 0}
              >
                <ChevronLeft size={15} /> Back
              </button>
              <div className="planner-nav-info">Step {step + 1} of {STEPS.length}</div>
              <button
                className="planner-btn-primary"
                onClick={goNext}
                disabled={!canContinue}
              >
                {step === 3 ? 'Review & Generate' : 'Continue'} <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
