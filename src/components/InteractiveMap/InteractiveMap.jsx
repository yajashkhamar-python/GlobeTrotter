import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Map as MapIcon, Calendar, Maximize, Clock, Compass, ChevronRight, Activity, ArrowRight, Layers } from 'lucide-react';
import './InteractiveMap.css';

// Custom Markers
const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color};" class="marker-pin"></div><i class="custom-icon"></i>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -35]
  });
};

const createNumberedIcon = (number, color = '#1d5bef') => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color};" class="marker-pin numbered"><span class="marker-number">${number}</span></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -35]
  });
};

const activityIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#16a34a;" class="marker-pin activity"><div class="activity-dot"></div></div>`,
  iconSize: [20, 28],
  iconAnchor: [10, 28],
  popupAnchor: [0, -20]
});

const createMarkerIcon = (marker, isActive) => {
  if (marker.type === 'destination') {
    return createNumberedIcon('★', isActive ? '#f59e0b' : '#1d5bef');
  }
  return activityIcon;
};

// Helper to update map bounds
function MapBoundsUpdater({ positions, selectedPosition, isSidebarOpen }) {
  const map = useMap();
  useEffect(() => {
    // Invalidate size to fix tile loading issues if container resized
    map.invalidateSize();
    
    if (selectedPosition) {
      map.flyTo(selectedPosition, 13, { animate: true, duration: 1.5 });
    } else if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12, animate: true });
    }
  }, [map, positions, selectedPosition, isSidebarOpen]);
  return null;
}

export default function InteractiveMap({ trip, itineraryContent }) {
  const [selectedDay, setSelectedDay] = useState('all');
  const [activeTab, setActiveTab] = useState('destinations');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [activeStopId, setActiveStopId] = useState(null);
  const mapRef = useRef();

  if (!trip || !trip.stops || trip.stops.length === 0) {
    return (
      <div className="imap-card imap-empty-state">
        <MapIcon size={48} className="imap-empty-icon" />
        <h3>Your Travel Map is Empty</h3>
        <p>Add destinations to your itinerary to generate your interactive route.</p>
      </div>
    );
  }

  // Filter valid coordinates
  const validStops = trip.stops.filter(s => s.city && s.city.latitude && s.city.longitude);
  const routePositions = validStops.map(s => [parseFloat(s.city.latitude), parseFloat(s.city.longitude)]);
  
  // Extract days
  const allDays = useMemo(() => {
    const days = new Set();
    trip.stops.forEach(stop => {
      stop.activities?.forEach(act => {
        if (act.date) days.add(act.date);
      });
      if (stop.start_date) days.add(stop.start_date);
    });
    return Array.from(days).sort();
  }, [trip]);

  // Extract activities
  const activities = useMemo(() => {
    const acts = [];
    validStops.forEach(stop => {
      if (!stop.activities) return;
      stop.activities.forEach((act) => {
        if (selectedDay !== 'all' && act.date !== selectedDay) return;
        const offsetLat = parseFloat(stop.city.latitude) + (Math.random() * 0.015 - 0.0075);
        const offsetLng = parseFloat(stop.city.longitude) + (Math.random() * 0.015 - 0.0075);
        acts.push({ ...act, lat: offsetLat, lng: offsetLng, cityName: stop.city.name });
      });
    });
    return acts;
  }, [validStops, selectedDay]);

  const mapMarkers = useMemo(() => {
    const markers = [];
    validStops.forEach(stop => {
      markers.push({
        id: `dest-${stop.id}`, stopId: stop.id,
        lat: parseFloat(stop.city.latitude), lng: parseFloat(stop.city.longitude),
        title: stop.city.name, subtitle: stop.city.country, type: 'destination', img: stop.city.image
      });
    });
    activities.forEach(act => {
      markers.push({
        id: `act-${act.id}`, stopId: act.stop_id,
        lat: act.lat, lng: act.lng,
        title: act.name || act.activity?.name,
        subtitle: act.date ? new Date(act.date).toLocaleDateString() : '',
        details: act.activity?.type, type: 'activity', img: act.activity?.image
      });
    });
    return markers;
  }, [validStops, activities]);

  const [triggerFitBounds, setTriggerFitBounds] = useState(0);

  const handleFitAll = () => {
    setSelectedMarker(null);
    setActiveStopId(null);
  };

  const handleSelectDestination = (stop) => {
    if (stop.city?.latitude && stop.city?.longitude) {
      setSelectedMarker([parseFloat(stop.city.latitude), parseFloat(stop.city.longitude)]);
      setActiveStopId(stop.id);
    }
  };

  return (
    <div className="imap-card">
      {/* HEADER */}
      <div className="imap-header">
        <div className="imap-header-left">
          <div className="imap-icon-wrapper">
            <Compass size={24} className="imap-header-icon" />
          </div>
          <div className="imap-header-titles">
            <h2 className="imap-title">Your Travel Journey</h2>
            <span className="imap-subtitle">Explore your destinations and discover your route.</span>
          </div>
        </div>
        
        <div className="imap-controls">
          <div className="imap-filter-wrapper">
            <Calendar size={14} className="imap-filter-icon" />
            <select 
              className="imap-day-filter" 
              value={selectedDay} 
              onChange={e => setSelectedDay(e.target.value)}
            >
              <option value="all">All Days</option>
              {allDays.map(d => (
                <option key={d} value={d}>{new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</option>
              ))}
            </select>
          </div>
          <button className="imap-btn-fit" onClick={handleFitAll}>
            <Maximize size={16} /> <span className="imap-btn-text">Fit All</span>
          </button>
          <button className="imap-btn-fit" style={{background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)'}} onClick={() => { setSelectedDay('all'); handleFitAll(); }}>
            <span className="imap-btn-text">Reset</span>
          </button>
        </div>
      </div>

      <div className="imap-layout">
        {/* MAP AREA */}
        <div className="imap-map-container">
          {validStops.length > 0 ? (
            <MapContainer 
              center={routePositions[0] || [20, 0]} 
              zoom={5} 
              scrollWheelZoom={true} 
              className="imap-leaflet"
              ref={mapRef}
            >
              <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapBoundsUpdater positions={routePositions} selectedPosition={selectedMarker} />
              
              {mapMarkers.map(marker => (
                <Marker 
                  key={marker.id} 
                  position={[marker.lat, marker.lng]}
                  icon={createMarkerIcon(marker, activeStopId === marker.stopId)}
                  eventHandlers={{
                    click: () => {
                      if (marker.type === 'destination') {
                        setActiveTab('destinations');
                        handleSelectDestination(marker);
                      }
                    },
                  }}
                >
                  <Popup className="imap-popup custom-popup">
                    <div className="imap-popup-header">
                      {marker.img && (
                        <div className="imap-popup-thumb">
                          <img src={marker.img} alt={marker.title} />
                        </div>
                      )}
                    </div>
                    <div className="imap-popup-body">
                      <h4>{marker.title}</h4>
                      {marker.subtitle && <p className="imap-popup-subtitle">{marker.subtitle}</p>}
                      {marker.details && <p className="imap-popup-details">{marker.details}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {routePositions.length > 1 && selectedDay === 'all' && (
                <Polyline positions={routePositions} color="var(--color-primary)" weight={3} dashArray="5, 10" opacity={0.7} />
              )}
            </MapContainer>
          ) : (
            <div className="imap-empty-state">
              <MapIcon size={48} className="imap-empty-icon" />
              <h3>Map Unavailable</h3>
              <p>We need valid coordinates to display your destinations on the map.</p>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="imap-sidebar">
          <div className="imap-sidebar-tabs">
            <button 
              className={`imap-tab ${activeTab === 'destinations' ? 'active' : ''}`}
              onClick={() => setActiveTab('destinations')}
            >
              Destinations
            </button>
            <button 
              className={`imap-tab ${activeTab === 'activities' ? 'active' : ''}`}
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
                  className={`imap-dest-card ${isActive ? 'active' : ''} ${!hasCoords ? 'disabled' : ''}`}
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
            
            {itineraryContent && (
              <div className="imap-itinerary-container">
                {itineraryContent}
              </div>
            )}
          </div>
          
        </div>
      </div>

    </div>
  );
}

