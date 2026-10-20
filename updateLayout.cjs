const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TripDetails.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

const newRender = `  return (
    <div className="td-page">
      <Toast toasts={toasts} />

      {/* 1. TOP HEADER */}
      <div className="td-top-header">
        <div className="td-th-left">
          <button className="td-back-btn" onClick={() => navigate('/trips')}><ChevronRight size={18} style={{transform:'rotate(180deg)'}}/> Back</button>
          <h2 className="td-th-title">View Trip</h2>
        </div>
        <div className="td-th-right">
          <button className="td-icon-btn"><Search size={18}/></button>
          <button className="td-icon-btn"><Compass size={18}/></button>
          <div className="td-avatar"></div>
        </div>
      </div>

      {/* 2. TRIP SUMMARY CARD */}
      <div className="td-summary-card">
        <TravelImage src={heroImage} fallback={GENERIC_FALLBACK} alt={trip.name} className="td-summary-img" />
        <div className="td-summary-body">
          <div className="td-summary-header">
            <div>
              <div className="td-summary-badge">{trip.status || 'Upcoming'}</div>
              <h1 className="td-summary-title">{trip.name}</h1>
              <div className="td-summary-location"><MapPin size={14}/> {currentStop?.city?.country || 'Unknown Destination'}</div>
            </div>
            <div className="td-summary-actions">
              <button className="td-btn-outline" onClick={() => navigate(\`/trips/edit/\${trip.id}\`)}><Pencil size={14}/> Edit Trip</button>
              <button className="td-btn-primary" onClick={() => setShowShareModal(true)}><Share2 size={14}/> Share Trip</button>
            </div>
          </div>
          <div className="td-summary-meta">
            <div className="td-meta-item"><CalendarDays size={16}/> <div><span>Dates</span><strong>{formatDateShort(trip.startDate)} – {formatDate(trip.endDate)}</strong></div></div>
            <div className="td-meta-item"><MapPin size={16}/> <div><span>Destinations</span><strong>{trip.cityCount} destinations</strong></div></div>
            <div className="td-meta-item"><Clock size={16}/> <div><span>Duration</span><strong>{trip.totalDays} days</strong></div></div>
          </div>
        </div>
      </div>

      {/* 3. MAIN TWO-COLUMN CONTENT */}
      <div className="td-main-grid">
        {/* LEFT COLUMN: INTERACTIVE MAP (70%) */}
        <div className="td-grid-left">
          <InteractiveMap 
            trip={trip} 
            selectedCityId={currentStop?.city?.id} 
            onSelectDestination={(idx) => setActiveStop(idx)} 
          />
        </div>

        {/* RIGHT COLUMN: INFO PANEL (30%) */}
        <div className="td-grid-right">
          
          {/* A. Selected Destination Card */}
          <div className="td-info-card">
            <div className="td-info-img-wrapper">
              <TravelImage src={getCityImage(currentStop?.city)} fallback={GENERIC_FALLBACK} alt={currentStop?.city?.name} className="td-info-img" />
            </div>
            <div className="td-info-body">
              <div className="td-info-header">
                <h3>{currentStop?.city?.name || 'Destination'}</h3>
                <span className="td-day-badge">Day 1</span>
              </div>
              <div className="td-info-loc">{currentStop?.city?.country} • {formatDateShort(currentStop?.start_date)}</div>
              <p className="td-info-desc">Explore the beautiful sights and sounds of {currentStop?.city?.name}.</p>
              <button className="td-btn-outline-full">View Details</button>
            </div>
          </div>

          {/* B. Quick Actions Card */}
          <div className="td-info-card quick-actions">
            <h3 className="td-card-title">Quick Actions</h3>
            <div className="td-qa-grid">
              <button className="td-qa-btn" onClick={() => setShowShareModal(true)}><Share2 size={16}/> Share Trip</button>
              <button className="td-qa-btn" onClick={() => navigate('/calendar')}><CalendarDays size={16}/> View Calendar</button>
              <button className="td-qa-btn" onClick={() => navigate('/budget')}><Wallet size={16}/> Manage Budget</button>
              <button className="td-qa-btn" onClick={() => navigate('/explore')}><Compass size={16}/> Explore</button>
              <button className="td-qa-btn" onClick={() => navigate(\`/trips/edit/\${trip.id}\`)}><Pencil size={16}/> Edit Trip</button>
            </div>
          </div>

          {/* C. AI Copilot Card */}
          <div className="td-ai-promo-card">
            <Sparkles size={24} className="td-ai-icon" />
            <p>Would you like AI to suggest better activities or alternative plans for this trip?</p>
            <button className="td-btn-ai" onClick={() => setShowAIAssistant(true)}>Open AI Copilot</button>
          </div>

        </div>
      </div>
`;

// Replace lines 539 to 1006
const before = lines.slice(0, 538).join('\n');
const after = lines.slice(1007).join('\n'); // Starts with {/* ═══ ACTIVITY DETAIL MODAL

fs.writeFileSync(filePath, before + '\n' + newRender + '\n' + after);
console.log('Successfully updated TripDetails.jsx');
