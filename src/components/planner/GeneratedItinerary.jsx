import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, Users, CheckCircle, Edit2, Sparkles,
  MapPin, DollarSign, ArrowRight, Globe, Lightbulb, Save,
  Clock, Heart, ShieldCheck, Map, Search, Image as ImageIcon,
  Wand2
} from 'lucide-react';
import SmartImg from '../common/SmartImg';
import ActivityCard from './ActivityCard';
import { getCityImg, GENERIC_IMG } from '../../utils/imageResolver';
import { formatDate, formatDayLong } from '../../utils/formatters';
import { TRAVEL_STYLES, INTERESTS, CURRENCIES } from '../../utils/constants';
import { fetchApi } from '../../services/api';
import './GeneratedItinerary.css';

export default function GeneratedItinerary({
  itinerary, onRemoveActivity, onReplaceActivity,
  onSave, onRegenerate, saving, saveError, savedTripId, navigate, currency
}) {
  const { city, days, budget, totalActivities, duration, travelers, travelStyle, interests } = itinerary;
  const styleObj = TRAVEL_STYLES.find(s => s.id === travelStyle);
  const interestObjs = (interests || []).map(i => INTERESTS.find(x => x.id === i)).filter(Boolean);
  const sym = CURRENCIES.find(c => c.code === currency)?.symbol || '₹';
  const nights = Math.max(0, duration - 1);

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const activeDay = days[activeDayIndex] || days[0];

  const knownCost = budget?.knownActivityCost || 0;
  const estTotal = budget?.total || 0;
  const estAcc = Math.round(estTotal * 0.40);
  const estFood = Math.round(estTotal * 0.15);
  const estTrans = Math.round(estTotal * 0.15);
  const estOther = Math.round(estTotal * 0.10);

  const cityDesc = city?.description ||
    `Experience the best of ${city?.name} — iconic landmarks, vibrant culture, and unforgettable cuisine.`;

  // Discovery logic
  const [availableActivities, setAvailableActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (!city?.id) return;
    let isMounted = true;
    setLoadingActivities(true);
    fetchApi(`/cities/${city.id}/activities`)
      .then(res => {
        if (isMounted && res.success) {
          setAvailableActivities(res.activities || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoadingActivities(false);
      });
    return () => { isMounted = false; };
  }, [city?.id]);

  const allUsedActIds = useMemo(() => {
    const ids = new Set();
    days.forEach(d => {
      d.activities.forEach(a => ids.add(a.id));
    });
    return ids;
  }, [days]);

  const discoveryActs = useMemo(() => {
    return availableActivities
      .filter(act => !allUsedActIds.has(act.id))
      .slice(0, 4)
      .map(act => ({
        ...act,
        price: (parseFloat(act.cost) || 0) > 0 ? `${sym}${act.cost}` : 'Free',
        title: act.name,
        category: act.type || act.category || 'Experience'
      }));
  }, [availableActivities, allUsedActIds, sym]);

  // Helper for AI Copilot
  const handleAICopilot = () => {
    // In a real app, this would open the AI Assistant modal/panel
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('open-ai-copilot', { detail: { city: city?.name } }));
    }
    alert("AI Travel Copilot will analyze this itinerary!");
  };

  return (
    <div className="gi-layout-v2">
      
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="gi-hero-v2">
        <img className="gi-hero-bg-v2" src={city?.image || GENERIC_IMG} alt={city?.name} />
        <div className="gi-hero-overlay-v2"></div>
        <div className="gi-hero-content-v2">
          <div className="gi-hero-left-v2">
            <h1>{city?.name}, {city?.country}</h1>
            <div className="gi-hero-meta-v2">
              <span className="gi-hero-meta-pill-v2">
                <CalendarDays size={16} />
                {formatDate(itinerary.startDate, { day: 'numeric', month: 'short' })} – {formatDate(itinerary.endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="gi-hero-meta-pill-v2">
                <Clock size={16} />
                {duration} Days, {nights} Nights
              </span>
              <span className="gi-hero-meta-pill-v2">
                <Users size={16} />
                {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
              </span>
              <span className="gi-hero-meta-pill-v2">
                <MapPin size={16} />
                {totalActivities} Activities
              </span>
            </div>
            <p className="gi-hero-desc-v2">{cityDesc}</p>
          </div>
          <div className="gi-hero-actions-v2">
            <button className="gi-hero-btn-v2 gi-hero-btn-edit-v2" onClick={onRegenerate}>
              <Edit2 size={16} /> Edit Trip
            </button>
            <button className="gi-hero-btn-v2 gi-hero-btn-save-v2" onClick={onSave} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Trip'}
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────────────────── */}
      <div className="gi-stats-v2">
        <div className="gi-stat-card-v2">
          <div className="gi-stat-icon-v2 blue"><CalendarDays size={24} /></div>
          <div>
            <div className="gi-stat-val-v2">{duration} Days</div>
            <div className="gi-stat-lbl-v2">Duration</div>
          </div>
        </div>
        <div className="gi-stat-card-v2">
          <div className="gi-stat-icon-v2 purple"><Users size={24} /></div>
          <div>
            <div className="gi-stat-val-v2">{travelers}</div>
            <div className="gi-stat-lbl-v2">Travelers</div>
          </div>
        </div>
        <div className="gi-stat-card-v2">
          <div className="gi-stat-icon-v2 green"><Map size={24} /></div>
          <div>
            <div className="gi-stat-val-v2">{totalActivities}</div>
            <div className="gi-stat-lbl-v2">Activities</div>
          </div>
        </div>
        <div className="gi-stat-card-v2">
          <div className="gi-stat-icon-v2 amber"><DollarSign size={24} /></div>
          <div>
            <div className="gi-stat-val-v2">{sym}{estTotal.toLocaleString()}</div>
            <div className="gi-stat-lbl-v2">Estimated Cost</div>
          </div>
        </div>
        <div className="gi-stat-card-v2">
          <div className="gi-stat-icon-v2 red"><Globe size={24} /></div>
          <div>
            <div className="gi-stat-val-v2">1</div>
            <div className="gi-stat-lbl-v2">Destination</div>
          </div>
        </div>
      </div>

      {/* ── PROGRESS SECTION ───────────────────────────────────── */}
      <div className="gi-progress-v2">
        <div className="gi-prog-item-v2">
          <div className="gi-prog-icon-v2 done"><CheckCircle size={16} /></div>
          <div>Destinations</div>
        </div>
        <div className="gi-prog-line-v2 done" />
        <div className="gi-prog-item-v2">
          <div className="gi-prog-icon-v2 done"><CheckCircle size={16} /></div>
          <div>Activities</div>
        </div>
        <div className="gi-prog-line-v2 done" />
        <div className="gi-prog-item-v2">
          <div className="gi-prog-icon-v2 done"><CheckCircle size={16} /></div>
          <div>Calendar</div>
        </div>
        <div className="gi-prog-line-v2" style={{ background: 'linear-gradient(90deg, #10b981 70%, var(--color-border) 70%)' }} />
        <div className="gi-prog-item-v2">
          <div className="gi-prog-icon-v2" style={{ borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>70%</div>
          <div>Budget</div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN GRID ───────────────────────────────── */}
      <div className="gi-grid-v2">
        
        {/* LEFT COLUMN: Itinerary */}
        <div className="gi-left-v2">
          
          <div className="gi-itin-head-v2">
            <h2>Your Itinerary</h2>
            <p>Explore your trip day by day</p>
          </div>

          <div className="gi-tabs-v2">
            {days.map((day, idx) => (
              <div
                key={day.date}
                className={`gi-tab-v2 ${activeDayIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveDayIndex(idx)}
              >
                <span className="gi-tab-num-v2">Day {day.dayNumber}</span>
                <span className="gi-tab-date-v2">{formatDate(day.date, { weekday: 'short' })}</span>
              </div>
            ))}
          </div>

          {activeDay && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Day {activeDay.dayNumber} • {formatDayLong(activeDay.date)}
              </h3>
              
              {activeDay.activities.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                  <Sparkles size={32} style={{ color: 'var(--color-accent)', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '18px', margin: '0 0 8px' }}>Free Day</h4>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Explore {city?.name} at your own pace.</p>
                </div>
              ) : (
                <div className="gi-timeline-v2">
                  {activeDay.activities.map((act, i) => {
                    const hour = 9 + i * 3;
                    const time = `${String(hour > 23 ? 23 : hour).padStart(2, '0')}:00`;
                    return (
                      <div key={act.id} className="gi-tl-item-v2">
                        <div className="gi-tl-dot-v2" />
                        <div className="gi-tl-time-v2">{time}</div>
                        <div className="gi-tl-card-v2">
                          <ActivityCard
                            act={act}
                            sym={sym}
                            onRemove={(id) => onRemoveActivity(activeDay.date, id)}
                            onReplace={(act) => onReplaceActivity(activeDay.date, act)}
                            showReplace
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* DESTINATION DISCOVERY */}
          {discoveryActs.length > 0 && !loadingActivities && (
            <div className="gi-discovery-v2">
              <h2>Explore More Experiences</h2>
              <p>Discover activities that are not currently included in your itinerary.</p>
              <div className="gi-discovery-grid-v2">
                {discoveryActs.map((act) => (
                  <div key={act.id} className="gi-discovery-card-v2">
                    <img className="gi-disc-img-v2" src={act.image || GENERIC_IMG} alt={act.title} />
                    <div className="gi-disc-info-v2">
                      <div className="gi-disc-meta-v2">
                        <span className="gi-disc-cat-v2">{act.category}</span>
                        <span className="gi-disc-price-v2">{act.price}</span>
                      </div>
                      <h4 className="gi-disc-title-v2">{act.title}</h4>
                      <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {act.duration || 2} hours
                      </p>
                      <button className="gi-disc-btn-v2" onClick={() => onReplaceActivity(activeDay.date, act)}>Replace Activity</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* READY TO SAVE */}
          <div className="gi-save-section-v2">
            <div>
              <h3>Ready to make this trip yours?</h3>
              <p>Your itinerary is almost ready. Review your activities and save your trip.</p>
            </div>
            <div className="gi-save-btns-v2">
              <button className="gi-hero-btn-v2" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} onClick={onRegenerate}>
                Edit Itinerary
              </button>
              <button className="gi-hero-btn-v2 gi-hero-btn-save-v2" onClick={onSave} disabled={saving}>
                <CheckCircle size={16} /> {saving ? 'Saving...' : 'Save Trip'}
              </button>
            </div>
            {saveError && <p style={{ color: '#ef4444', width: '100%', margin: '10px 0 0' }}>{saveError}</p>}
            {savedTripId && (
              <div style={{ color: '#10b981', width: '100%', margin: '10px 0 0', fontWeight: '600' }}>
                Trip saved! <button onClick={() => navigate(`/trips/${savedTripId}`)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 'bold' }}>View Trip &rarr;</button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Overview & Insights */}
        <div className="gi-right-v2">
          
          {/* YOUR TRIP */}
          <div className="gi-sb-card-v2">
            <div className="gi-sb-head-v2">
              <span>Your Trip</span>
            </div>
            <div className="gi-trip-thumb-v2">
              <img src={city?.image || GENERIC_IMG} alt={city?.name} />
            </div>
            <div className="gi-trip-info-v2">
              <h4>{city?.name}</h4>
              <p>{city?.country}</p>
              <p style={{ marginTop: '8px', fontSize: '13px' }}>
                <CalendarDays size={13} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                {formatDate(itinerary.startDate, { day: 'numeric', month: 'short' })} – {formatDate(itinerary.endDate, { day: 'numeric', month: 'short' })}
              </p>
              <p style={{ fontSize: '13px' }}>
                <Users size={13} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                {travelers} Travelers
              </p>
            </div>
            <button className="gi-disc-btn-v2" style={{ marginTop: '16px' }} onClick={() => savedTripId && navigate(`/trips/${savedTripId}`)}>
              View Trip Details
            </button>
          </div>

          {/* YOUR INTERESTS */}
          {interestObjs.length > 0 && (
            <div className="gi-sb-card-v2">
              <div className="gi-sb-head-v2">
                <span>Your Interests</span>
              </div>
              <div className="gi-int-chips-v2">
                {interestObjs.map(int => (
                  <span key={int.id} className="gi-int-chip-v2">
                    {int.emoji} {int.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* BUDGET OVERVIEW */}
          <div className="gi-sb-card-v2">
            <div className="gi-sb-head-v2">
              <span>Budget Overview</span>
            </div>
            <h3 className="gi-budget-total-v2">{sym}{estTotal.toLocaleString()}</h3>
            <div className="gi-budget-lbl-v2">Estimated Total</div>
            
            <div className="gi-budget-bar-v2">
              <div className="gi-budget-fill-v2" style={{ width: '70%' }}></div>
            </div>

            <div className="gi-budget-breakdown-v2">
              <div className="gi-bb-row-v2">
                <span className="gi-bb-lbl-v2"><span className="gi-bb-dot-v2" style={{ background: '#3b82f6' }} /> Accommodation</span>
                <span>{sym}{estAcc.toLocaleString()}</span>
              </div>
              <div className="gi-bb-row-v2">
                <span className="gi-bb-lbl-v2"><span className="gi-bb-dot-v2" style={{ background: '#10b981' }} /> Activities</span>
                <span>{sym}{knownCost.toLocaleString()}</span>
              </div>
              <div className="gi-bb-row-v2">
                <span className="gi-bb-lbl-v2"><span className="gi-bb-dot-v2" style={{ background: '#f59e0b' }} /> Food</span>
                <span>{sym}{estFood.toLocaleString()}</span>
              </div>
              <div className="gi-bb-row-v2">
                <span className="gi-bb-lbl-v2"><span className="gi-bb-dot-v2" style={{ background: '#8b5cf6' }} /> Transport</span>
                <span>{sym}{estTrans.toLocaleString()}</span>
              </div>
            </div>
            <button className="gi-disc-btn-v2" style={{ marginTop: '20px' }}>
              View Budget
            </button>
          </div>

          {/* TRIP INSIGHTS */}
          <div className="gi-sb-card-v2">
            <div className="gi-sb-head-v2">
              <span>Trip Insights</span>
            </div>
            <div className="gi-insights-v2">
              <div className="gi-insight-v2">
                <CheckCircle size={16} className="gi-insight-ok-v2" />
                <span>Good activity coverage</span>
              </div>
              <div className="gi-insight-v2">
                <CheckCircle size={16} className="gi-insight-ok-v2" />
                <span>Balanced daily schedule</span>
              </div>
              <div className="gi-insight-v2">
                <CheckCircle size={16} className="gi-insight-ok-v2" />
                <span>Enough free time</span>
              </div>
              <div className="gi-insight-v2">
                <CheckCircle size={16} className="gi-insight-ok-v2" />
                <span>Activities match your interests</span>
              </div>
              <div className="gi-insight-v2">
                <CheckCircle size={16} className={knownCost <= estTotal || estTotal === 0 ? "gi-insight-ok-v2" : "gi-insight-warn-v2"} />
                <span>{knownCost <= estTotal || estTotal === 0 ? "Budget is within estimated range" : "Slightly over budget"}</span>
              </div>
            </div>
          </div>

          {/* AI TRAVEL COPILOT */}
          <div className="gi-sb-card-v2 gi-ai-card-v2">
            <div className="gi-sb-head-v2 gi-ai-head-v2">
              <span><Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Travel Copilot</span>
            </div>
            <h4>Let AI improve your trip</h4>
            <p>Let our AI Travel Copilot optimize your itinerary, suggest hidden gems, and answer travel questions.</p>
            <button className="gi-ai-btn-v2" onClick={handleAICopilot}>
              <Wand2 size={16} /> Ask Travel Copilot
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
