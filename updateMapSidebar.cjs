const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'InteractiveMap', 'InteractiveMap.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// I need to add state for the tabs
content = content.replace(
  "const [selectedDay, setSelectedDay] = useState('all');",
  "const [selectedDay, setSelectedDay] = useState('all');\n  const [activeTab, setActiveTab] = useState('destinations');"
);

const newSidebar = `        {/* SIDEBAR */}
        <div className="imap-sidebar">
          <div className="imap-sidebar-tabs">
            <button 
              className={\`imap-tab \${activeTab === 'destinations' ? 'active' : ''}\`}
              onClick={() => setActiveTab('destinations')}
            >
              Destinations
            </button>
            <button 
              className={\`imap-tab \${activeTab === 'activities' ? 'active' : ''}\`}
              onClick={() => setActiveTab('activities')}
            >
              Activities
            </button>
          </div>
          
          <div className="imap-dest-list">
            {activeTab === 'destinations' && trip.stops.map((stop, idx) => {
              const hasCoords = stop.city?.latitude && stop.city?.longitude;
              const isActive = activeStopId === stop.id;
              
              return (
                <div 
                  key={stop.id} 
                  className={\`imap-dest-card \${isActive ? 'active' : ''} \${!hasCoords ? 'disabled' : ''}\`}
                  onClick={() => hasCoords && handleSelectDestination(stop)}
                >
                  <div className="imap-dest-number">{idx + 1}</div>
                  <div className="imap-dest-content">
                    <div className="imap-dest-name">{stop.city?.name || 'Unknown'}</div>
                    <div className="imap-dest-meta">
                      {stop.city?.country} 
                      {stop.start_date && <span> • {new Date(stop.start_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>}
                    </div>
                  </div>
                  {isActive && <ChevronRight size={16} className="imap-dest-arrow" />}
                </div>
              );
            })}

            {activeTab === 'activities' && activities.map((act, idx) => (
              <div key={act.id} className="imap-dest-card">
                <div className="imap-dest-number" style={{background:'#16a34a'}}><Activity size={14}/></div>
                <div className="imap-dest-content">
                  <div className="imap-dest-name">{act.name}</div>
                  <div className="imap-dest-meta">
                    {act.cityName} 
                    {act.date && <span> • {new Date(act.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="imap-overview-card">
            <h4>Trip Overview</h4>
            <div className="imap-overview-grid">
              <div className="imap-og-item">
                <MapPin size={14} className="imap-og-icon"/>
                <div><span>Destinations</span><strong>{validStops.length}</strong></div>
              </div>
              <div className="imap-og-item">
                <Clock size={14} className="imap-og-icon"/>
                <div><span>Duration</span><strong>{trip.totalDays || Math.max(1, trip.stops.length * 2)} days</strong></div>
              </div>
            </div>
          </div>
        </div>`;

// Replace the old sidebar with the new sidebar string
const regex = /\{\/\* SIDEBAR \*\/\}(.|\n)*?\{\/\* MAP AREA \*\/\}/m;
content = content.replace(regex, newSidebar + '\n\n        {/* MAP AREA */}');

fs.writeFileSync(filePath, content);
console.log('Successfully updated InteractiveMap.jsx');
