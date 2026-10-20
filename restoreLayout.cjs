const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TripDetails.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const originalRender = `  return (
    <div className="td-page">
      <Toast toasts={toasts} />

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <div className="td-hero">
        <TravelImage src={heroImage} fallback={GENERIC_FALLBACK} alt={trip.name} className="td-hero-img" />
        <div className="td-hero-overlay" />
        <div className="td-hero-content">
          <div className="td-hero-left">
            <div className="td-hero-badge">{trip.status || 'Upcoming'}</div>
            <h1 className="td-hero-title">{trip.name}</h1>
            {currentStop?.city?.country && (
              <div className="td-hero-location"><MapPin size={13} /> {currentStop.city.country}</div>
            )}
            <div className="td-hero-meta">
              <span><CalendarDays size={12} /> {formatDateShort(trip.startDate)} – {formatDate(trip.endDate)}</span>
              <span>|</span>
              <span>{trip.totalDays} {trip.totalDays === 1 ? 'day' : 'days'}</span>
              <span>|</span>
              <span>{trip.cityCount} destination{trip.cityCount !== 1 ? 's' : ''}</span>
              <span>|</span>
              <span>{totalActivities} activities</span>
            </div>
            {trip.description && <p className="td-hero-desc">{trip.description}</p>}
          </div>
          <div className="td-hero-actions">
            <button className="td-hero-btn" style={{ background: 'var(--color-primary)', color: 'white', border: 'none' }} onClick={() => setShowAIAssistant(true)}><Sparkles size={14} /> Ask AI to Improve My Trip</button>
            <button className="td-hero-btn" onClick={() => setShowShareModal(true)}><Share2 size={14} /> Share Trip</button>
            <button className="td-hero-btn" onClick={() => navigate(\`/trips/edit/\${trip.id}\`)}><Pencil size={14} /> Edit Trip</button>
            <button className="td-hero-btn" onClick={() => navigate('/budget')}><Wallet size={14} /> Budget</button>
            <button className="td-hero-btn" onClick={() => navigate('/calendar')}><CalendarDays size={14} /> Calendar</button>
          </div>
        </div>
      </div>

      {/* ═══ PLANNING PROGRESS ═══════════════════════════════════════════════ */}
      <div className="td-progress-bar">
        <span className="td-progress-title">Trip Planning Progress</span>
        <div className="td-progress-steps">
          <div className={\`td-ps \${trip.stops?.length > 0 ? 'done' : ''}\`}>
            <div className="td-ps-icon">{trip.stops?.length > 0 ? <CheckCircle size={16} /> : <div className="td-ps-circle" />}</div>
            <div className="td-ps-info">
              <span className="td-ps-label">Destinations</span>
              <span className="td-ps-count">{trip.stops?.length || 0}/1</span>
            </div>
          </div>
          <div className="td-ps-line" />
          <div className={\`td-ps \${totalActivities > 0 ? 'done' : ''}\`}>
            <div className="td-ps-icon">{totalActivities > 0 ? <CheckCircle size={16} /> : <div className="td-ps-circle" />}</div>
            <div className="td-ps-info">
              <span className="td-ps-label">Activities</span>
              <span className="td-ps-count">{totalActivities}/1</span>
            </div>
          </div>
          <div className="td-ps-line" />
          <div className={\`td-ps \${totalCost > 0 ? 'done' : ''}\`}>
            <div className="td-ps-icon">{totalCost > 0 ? <CheckCircle size={16} /> : <div className="td-ps-circle" />}</div>
            <div className="td-ps-info">
              <span className="td-ps-label">Budget</span>
              <span className="td-ps-count">{totalCost > 0 ? '1/1' : '0/1'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="td-layout">
        {/* ═══ LEFT PANEL: ITINERARY & JOURNEY ════════════════════════════════ */}
        <div className="td-left">
          <div className="td-panel">
            <div className="td-panel-header">
              <h2><MapIcon size={20} /> Route & Journey</h2>
              <button className="td-btn-add" onClick={() => setShowAddStop(true)}><Plus size={16} /> Add Destination</button>
            </div>
            
            {showAddStop && (
              <div className="td-add-stop-panel">
                <div className="td-add-stop-search">
                  <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <input type="text" placeholder="Search cities (e.g. Paris, Tokyo)..."
                    value={citySearch} onChange={e => setCitySearch(e.target.value)} />
                  {citySearch && <button onClick={() => setCitySearch('')}><X size={16} /></button>}
                </div>
                {selectedCity ? (
                  <div className="td-add-stop-form">
                    <div className="td-add-stop-sel">
                      <div className="td-add-stop-sel-info">
                        <strong>{selectedCity.name}</strong>, {selectedCity.country}
                      </div>
                      <button onClick={() => setSelectedCity(null)} className="td-btn-ghost">Change</button>
                    </div>
                    <div className="td-add-stop-dates">
                      <div className="td-form-group">
                        <label>Arrival</label>
                        <input type="date" className="td-date-input" value={stopForm.start_date} onChange={e => setStopForm({ ...stopForm, start_date: e.target.value })} />
                      </div>
                      <div className="td-form-group">
                        <label>Departure</label>
                        <input type="date" className="td-date-input" value={stopForm.end_date} onChange={e => setStopForm({ ...stopForm, end_date: e.target.value })} />
                      </div>
                    </div>
                    {stopFormError && <div className="td-form-error">{stopFormError}</div>}
                    <div className="td-add-stop-actions">
                      <button className="td-btn-outline" onClick={() => { setShowAddStop(false); setSelectedCity(null); }}>Cancel</button>
                      <button className="td-btn-primary" onClick={handleAddStop} disabled={addingStop}>{addingStop ? 'Adding...' : 'Add to Trip'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="td-city-results">
                    {filteredCities.slice(0, 15).map(c => (
                      <div key={c.id} className="td-city-result" onClick={() => handleSelectCity(c)}>
                        <div className="td-city-result-img"><TravelImage src={getCityImage(c)} fallback={GENERIC_FALLBACK} alt={c.name} /></div>
                        <div className="td-city-result-info">
                          <div className="td-city-name">{c.name}</div>
                          <div className="td-city-country">{c.country}</div>
                        </div>
                      </div>
                    ))}
                    {filteredCities.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)' }}>No cities found matching "{citySearch}"</div>}
                  </div>
                )}
              </div>
            )}

            <div className="td-stops-list">
              {trip.stops?.length > 0 ? (
                trip.stops.map((stop, idx) => (
                  <StopCard key={stop.id} stop={stop} index={idx} isActive={activeStop === idx} totalStops={trip.stops.length} onSelect={setActiveStop} onRemove={() => handleRemoveStop(stop.id)} onMoveUp={() => handleReorderStops(-1, idx)} onMoveDown={() => handleReorderStops(1, idx)} />
                ))
              ) : (
                <div className="td-empty-state">
                  <MapPin size={32} />
                  <h3>Where are you going?</h3>
                  <p>Add your first destination to start planning your itinerary.</p>
                  <button className="td-btn-primary" onClick={() => setShowAddStop(true)} style={{ marginTop: 16 }}>Add Destination</button>
                </div>
              )}
            </div>
            
            {/* Interactive Map */}
            {trip.stops?.length > 0 && (
               <InteractiveMap trip={trip} />
            )}
          </div>

          <div className="td-panel">
            <div className="td-panel-header">
              <h2><CalendarDays size={20} /> Daily Itinerary</h2>
              {currentStop && (
                <div className="td-panel-badge">{currentStop.city?.name}</div>
              )}
            </div>

            <div className="td-itinerary">
              {Object.keys(dayGroups).length > 0 ? (
                Object.entries(dayGroups).map(([date, acts]) => (
                  <div key={date} className="td-day-group">
                    <div className="td-day-header">
                      <h3>{date}</h3>
                    </div>
                    <div className="td-day-activities">
                      {acts.sort((a, b) => {
                        const tA = a.start_time || '23:59';
                        const tB = b.start_time || '23:59';
                        if (tA !== tB) return tA.localeCompare(tB);
                        return (a.activity_order || 0) - (b.activity_order || 0);
                      }).map((act, index) => (
                        <div key={act.id} className="td-itinerary-item">
                          <div className="td-itin-time">{act.start_time ? act.start_time.substring(0, 5) : '--:--'}</div>
                          <div className="td-itin-line">
                            <div className="td-itin-dot" />
                            {index !== acts.length - 1 && <div className="td-itin-connector" />}
                          </div>
                          <div className="td-itin-card">
                            <div className="td-itin-card-img">
                              <TravelImage src={getActivityImage(act.activity)} fallback={GENERIC_FALLBACK} alt={act.activity?.name} />
                              <div className="td-itin-badge">{act.activity?.type}</div>
                            </div>
                            <div className="td-itin-card-body">
                              <h4>{act.activity?.name || 'Custom Activity'}</h4>
                              {act.activity?.duration && <div className="td-itin-dur"><Clock size={12}/> {act.activity.duration}</div>}
                              <div className="td-itin-controls">
                                <button className="td-btn-icon" onClick={() => handleReorderActivity(act.id, -1, index)} disabled={index === 0}><ChevronUp size={14}/></button>
                                <button className="td-btn-icon" onClick={() => handleReorderActivity(act.id, 1, index)} disabled={index === acts.length - 1}><ChevronDown size={14}/></button>
                                <button className="td-btn-icon danger" onClick={() => handleRemoveActivity(act.id, act.activity?.name)}><Trash2 size={14}/></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="td-empty-state">
                  <CalendarDays size={32} />
                  <h3>No activities planned yet</h3>
                  <p>Browse the suggestions on the right and add activities to your itinerary.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL: DISCOVER ACTIVITIES ════════════════════════════════ */}
        <div className="td-right">
          <div className="td-panel td-discover-panel">
            <div className="td-panel-header">
              <h2><Compass size={20} /> Discover Activities</h2>
              {currentStop && <div className="td-panel-badge">{currentStop.city?.name}</div>}
            </div>

            {!currentStop ? (
              <div className="td-empty-state" style={{ padding: '60px 20px' }}>
                <MapPin size={32} />
                <p>Select a destination to discover top attractions and things to do.</p>
              </div>
            ) : (
              <div className="td-discover-content">
                <div className="td-discover-filters">
                  <div className="td-search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search activities..." value={activitySearch} onChange={e => setActivitySearch(e.target.value)} />
                    {activitySearch && <button onClick={() => setActivitySearch('')}><X size={16} /></button>}
                  </div>
                  <div className="td-filter-chips">
                    {activityTypes.map(t => (
                      <button key={t} className={\`td-chip \${activityFilter === t ? 'active' : ''}\`} onClick={() => setActivityFilter(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="td-activities-grid">
                  {cityActivitiesLoading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                      <div className="td-spinner" style={{ margin: '0 auto 16px' }} />
                      Loading activities...
                    </div>
                  ) : filteredActivities.length > 0 ? (
                    filteredActivities.map(act => (
                      <ActivityCard key={act.id} activity={act} onAddToDay={() => setShowAddActivityModal(act)} onViewDetails={() => setShowActivityDetail(act)} />
                    ))
                  ) : (
                    <div className="td-empty-state">
                      <Search size={32} />
                      <p>No activities found matching your filters in {currentStop.city?.name}.</p>
                      <button className="td-btn-ghost" onClick={() => { setActivityFilter('All'); setActivitySearch(''); }}>Clear Filters</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
`;

// Extract from file: find `  return (\n    <div className="td-page">` and `{/* ═══ ACTIVITY DETAIL MODAL`
const startIndex = content.indexOf(`  return (\n    <div className="td-page">\n      <Toast toasts={toasts} />`);
const endIndex = content.indexOf(`      {/* ═══ ACTIVITY DETAIL MODAL`);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find boundaries!');
} else {
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex);
  fs.writeFileSync(filePath, before + originalRender + '\n' + after);
  console.log('Restored original layout successfully.');
}
