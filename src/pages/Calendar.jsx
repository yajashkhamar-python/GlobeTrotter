import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Calendar as CalIcon, Clock, MapPin, Plane, Building2, Ticket, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { fetchApi } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import './Calendar.css';
import '../components/common/common.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// The colors from the screenshot (Blue for Europe Adventure, Green for Japan Trip, etc.)
const TRIP_COLORS = [
  { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb' },
  { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
  { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
  { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' }
];

const getLocalDateStr = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d)) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};

function buildCalendarWeeks(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrev - i);
    cells.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), currentMonth: false, dateStr: getLocalDateStr(d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(year, month, d);
    cells.push({ day: d, month, year, currentMonth: true, dateStr: getLocalDateStr(dObj) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const dObj = new Date(year, month + 1, d);
    cells.push({ day: d, month: dObj.getMonth(), year: dObj.getFullYear(), currentMonth: false, dateStr: getLocalDateStr(dObj) });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export default function Calendar() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const [view, setView] = useState('Month'); // Month, Week, Day, Agenda

  const today = new Date();
  const todayStr = getLocalDateStr(today);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchApi('/calendar');
        if (res.success) {
          setTrips(res.trips);
          if (res.trips.length > 0) {
            const nowIso = getLocalDateStr(new Date());
            const upcoming = res.trips.find(t => getLocalDateStr(t.end_date) >= nowIso);
            const targetTrip = upcoming || res.trips[res.trips.length - 1];
            if (targetTrip?.start_date) {
              const td = new Date(targetTrip.start_date);
              setCalYear(td.getFullYear());
              setCalMonth(td.getMonth());

              if (nowIso < getLocalDateStr(targetTrip.start_date)) {
                setSelectedDate(getLocalDateStr(td));
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load calendar data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeTrips = selectedTripId === 'ALL' ? trips : trips.filter(t => t.id == selectedTripId);

  // Compute Daily Cells and Agendas
  const DAILY_MAP = {}; // Map of dateStr -> { tripCards: [], activities: [], hasEvent: boolean }
  const allCities = new Set();

  activeTrips.forEach((trip, tIdx) => {
    const colorTheme = TRIP_COLORS[tIdx % TRIP_COLORS.length];

    if (!trip.start_date || !trip.end_date) return;
    const tStart = getLocalDateStr(trip.start_date);
    const tEnd = getLocalDateStr(trip.end_date);

    // We want to loop from trip start to trip end and put a card on every day
    const d1 = new Date(trip.start_date);
    const d2 = new Date(trip.end_date);

    for (let dt = new Date(d1); dt <= d2; dt.setDate(dt.getDate() + 1)) {
      const dtStr = getLocalDateStr(dt);
      if (!DAILY_MAP[dtStr]) DAILY_MAP[dtStr] = { tripCards: [], activities: [], hasEvent: false };

      const dayIndex = Math.ceil((dt - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1;

      // Determine if there's a specific city stop active on this day
      let activeCity = '';
      trip.stops?.forEach(stop => {
        const sStart = getLocalDateStr(stop.start_date);
        const sEnd = getLocalDateStr(stop.end_date);
        if (dtStr >= sStart && dtStr <= sEnd) {
          activeCity = stop.city_name;
          allCities.add(stop.city_name);
        }
      });

      DAILY_MAP[dtStr].tripCards.push({
        tripId: trip.id,
        tripName: trip.name,
        city: activeCity,
        dayNum: dayIndex,
        colorTheme
      });
      DAILY_MAP[dtStr].hasEvent = true;
    }

    // Now populate activities specifically mapped to their dates
    trip.stops?.forEach(stop => {
      stop.activities?.forEach(act => {
        const actDateStr = getLocalDateStr(act.date);
        if (actDateStr && DAILY_MAP[actDateStr]) {
          DAILY_MAP[actDateStr].activities.push({
            time: formatTime(act.start_time),
            rawTime: act.start_time,
            label: act.activity_name,
            category: act.type,
            city: stop.city_name,
            tripId: trip.id
          });
        }
      });
    });
  });

  const weeks = buildCalendarWeeks(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };
  const goToday = () => {
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  const handleDayClick = (dateKey) => setSelectedDate(dateKey);

  // Agenda Right Panel computation
  const dSelected = new Date(selectedDate);
  const selectedDisplayDate = `${DAYS[dSelected.getDay()]}, ${dSelected.getDate()} ${MONTHS[dSelected.getMonth()].substring(0, 3)} ${dSelected.getFullYear()}`;

  let selectedTripCard = null;
  const eventsForSelected = DAILY_MAP[selectedDate] || { tripCards: [], activities: [] };
  if (eventsForSelected.tripCards.length > 0) {
    const matchingTrip = trips.find(t => t.id === eventsForSelected.tripCards[0].tripId);
    if (matchingTrip) selectedTripCard = matchingTrip;
  }

  // We intentionally do not fall back to a random trip if the selected date has no trip.
  // The empty state component will render instead.

  let activeTripDuration = 0;
  let activeTripActivitiesCount = 0;
  let activeTripCitiesCount = 0;
  if (selectedTripCard) {
    const sd = new Date(selectedTripCard.start_date);
    const ed = new Date(selectedTripCard.end_date);
    activeTripDuration = Math.ceil((ed - sd) / (1000 * 60 * 60 * 24)) + 1 || 1;
    activeTripCitiesCount = selectedTripCard.stops?.length || 0;
    selectedTripCard.stops?.forEach(s => {
      activeTripActivitiesCount += (s.activities?.length || 0);
    });
  }

  const scheduleActivities = eventsForSelected.activities.sort((a, b) => (a.rawTime || '').localeCompare(b.rawTime || ''));
  const scheduleCity = eventsForSelected.tripCards[0]?.city;
  const scheduleDayNum = eventsForSelected.tripCards[0]?.dayNum;

  // Placeholder images based on trip color index just to mock the design
  const getThumbnail = (theme) => {
    if (theme.text === '#2563eb') return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=100&q=80'; // Paris
    if (theme.text === '#10b981') return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=100&q=80'; // Japan
    return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=100&q=80'; // Generic
  };

  return (
    <div className="calendar-page page-enter">
      {/* Travel Hero Header */}
      <div className="cal-hero">
        <div className="cal-hero-content">
          <div className="cal-hero-icon">
            <CalIcon size={28} />
          </div>
          <div className="cal-hero-title">
            <h1>Calendar</h1>
            <p>Your travel plans at a glance</p>
          </div>
        </div>
        <div className="cal-hero-art">
          Collect moments not things <Plane size={24} style={{ marginLeft: '8px' }} />
        </div>
      </div>

      <div className="calendar-controls-bar">
        <div className="cal-nav-group">
          <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
          <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
          <div className="cal-month-title">
            {MONTHS[calMonth]} {calYear} <ChevronRightIcon size={14} style={{ transform: 'rotate(90deg)', marginLeft: '4px' }} />
          </div>
          <button className="cal-today-btn" onClick={goToday}>
            <CalIcon size={14} /> Today
          </button>
        </div>

        <div className="cal-view-toggles">
          {['Month', 'Week', 'Day', 'Agenda'].map(v => (
            <button
              key={v}
              className={`cal-view-btn ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="cal-filters">
          <select
            className="cal-filter-select"
            value={selectedTripId}
            onChange={e => setSelectedTripId(e.target.value)}
          >
            <option value="ALL">All Trips</option>
            {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select
            className="cal-filter-select"
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
          >
            <option value="ALL">All Cities</option>
            {Array.from(allCities).map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>

          <button className="cal-search-btn"><Search size={16} /></button>
        </div>
      </div>

      <div className="calendar-main-area">
        {/* Main Grid */}
        <div className="cal-grid-wrapper">
          <div className="cal-header">
            {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
          </div>
          <div className="cal-body">
            {weeks.map((week, wIdx) => (
              <div className="cal-week-row" key={wIdx}>
                {week.map((cell, cIdx) => {
                  const isToday = cell.dateStr === todayStr;
                  const isSelected = cell.dateStr === selectedDate;
                  const events = DAILY_MAP[cell.dateStr];

                  return (
                    <div
                      key={cIdx}
                      className={`cal-cell ${!cell.currentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDayClick(cell.dateStr)}
                    >
                      <div className="cal-cell-header">
                        <div className="cal-cell-num-wrapper">
                          <div className="cal-cell-num">{cell.day}</div>
                          {isToday && <div className="cal-today-pill">Today</div>}
                        </div>
                        {events?.hasEvent && (
                          <div className="cal-event-dots">
                            <div className="cal-event-dot" style={{ background: events.tripCards[0]?.colorTheme.text || 'gray' }}></div>
                          </div>
                        )}
                      </div>

                      {/* Trip Cards in Cell */}
                      {events?.tripCards.map((tc, i) => (
                        <div
                          key={i}
                          className="cal-cell-trip-card"
                          style={{ background: tc.colorTheme.bg, color: tc.colorTheme.text }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/trips/${tc.tripId}`); }}
                        >
                          <div className="cal-trip-card-name">{tc.tripName}</div>
                          <div className="cal-trip-card-details">
                            {tc.city && <div>📍 {tc.city}</div>}
                            <div>(Day {tc.dayNum})</div>
                          </div>
                          <img src={getThumbnail(tc.colorTheme)} alt="" className="cal-trip-card-image" />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Agenda Panel */}
        <div className="agenda-panel">
          <div className="agenda-header">
            <div className="agenda-date">{selectedDisplayDate}</div>
            {selectedDate === todayStr && <div className="agenda-today-badge">Today</div>}
          </div>

          {!selectedTripCard ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              <CalIcon size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Select a date</div>
              <div style={{ fontSize: '13px', lineHeight: 1.5 }}>Choose a date on your calendar to see its trip details and schedule.</div>
            </div>
          ) : (
            <>
              <div className="agenda-trip-card">
                <img src={getThumbnail(TRIP_COLORS[trips.findIndex(t => t.id === selectedTripCard.id) % TRIP_COLORS.length])} alt="" className="agenda-trip-img" />
                <div className="agenda-trip-info">
                  <div className="agenda-trip-title">{selectedTripCard.name}</div>
                  <div className="agenda-trip-dates">
                    {new Date(selectedTripCard.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – {new Date(selectedTripCard.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="agenda-trip-status">
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div> 
                    {todayStr < getLocalDateStr(selectedTripCard.start_date) ? 'Upcoming' : 
                     todayStr > getLocalDateStr(selectedTripCard.end_date) ? 'Completed' : 'In Progress'}
                  </div>
                </div>
              </div>

              <div className="agenda-schedule-section">
                <div className="agenda-schedule-title">{selectedDate === todayStr ? "Today's Schedule" : "Daily Schedule"}</div>
                {scheduleCity || scheduleActivities.length > 0 ? (
                  <div className="timeline-list">
                    {scheduleCity && (
                      <div className="timeline-item">
                        <div className="timeline-item-icon"><MapPin size={16} /></div>
                        <div className="timeline-city-header">
                          <div className="timeline-city-name">{scheduleCity} (Day {scheduleDayNum})</div>
                          <div className="timeline-city-sub">Stay in {scheduleCity}</div>
                        </div>
                      </div>
                    )}

                    {scheduleActivities.map((act, i) => (
                      <div className="timeline-item" key={i}>
                        <div className="timeline-item-dot"></div>
                        <div className="timeline-event-content">
                          <div className="timeline-event-header">
                            <div className="timeline-event-time">{act.time}</div>
                            <div className="timeline-event-name">
                              {act.category === 'Activity' ? <Building2 size={14} color="var(--color-accent)" /> : <Ticket size={14} color="var(--color-accent)" />}
                              {act.label}
                            </div>
                          </div>
                          {act.category && <div className="timeline-event-cat">{act.category}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No events scheduled for this day.</div>
                )}
              </div>

              <div className="quick-info-section">
                <div className="quick-info-title">Quick Info</div>
                <div className="quick-info-list">
                  <div className="quick-info-row">
                    <div className="quick-info-label"><Clock size={14} /> Trip Duration</div>
                    <div className="quick-info-value">{activeTripDuration} days</div>
                  </div>
                  <div className="quick-info-row">
                    <div className="quick-info-label"><Ticket size={14} /> Total Activities</div>
                    <div className="quick-info-value">{activeTripActivitiesCount}</div>
                  </div>
                  <div className="quick-info-row">
                    <div className="quick-info-label"><Building2 size={14} /> Cities</div>
                    <div className="quick-info-value">{activeTripCitiesCount}</div>
                  </div>
                </div>
              </div>

              <button className="view-trip-btn" onClick={() => navigate(`/trips/${selectedTripCard.id}`)}>
                View Trip Details <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
