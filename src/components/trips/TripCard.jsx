import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Activity, Pencil, Trash2, Eye } from 'lucide-react';
import './cards.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }) {
  const map = {
    upcoming:  { cls: 'badge-accent',   label: 'Upcoming' },
    completed: { cls: 'badge-success',  label: 'Completed' },
    draft:     { cls: 'badge-neutral',  label: 'Draft' },
    ongoing:   { cls: 'badge-warning',  label: 'Ongoing' },
  };
  const s = map[status] || map.draft;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

/**
 * TripCard — displays a single trip summary
 * Props: trip, showActions (bool), onDelete (fn)
 */
export function TripCard({ trip, showActions = false, onDelete }) {
  const navigate = useNavigate();

  return (
    <article className="trip-card" aria-label={`Trip: ${trip.name}`}>
      {trip.coverImage ? (
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="trip-card-image"
          loading="lazy"
        />
      ) : (
        <div className="trip-card-img-placeholder">✈️</div>
      )}

      <div className="trip-card-body">
        <div className="trip-card-header">
          <h3 className="trip-card-name">{trip.name}</h3>
          <StatusBadge status={trip.status} />
        </div>

        <div className="trip-card-meta">
          <div className="trip-card-meta-item">
            <CalendarDays size={13} />
            <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
          </div>
          <div className="trip-card-meta-item">
            <MapPin size={13} />
            <span>{trip.cityCount} {trip.cityCount === 1 ? 'city' : 'cities'} · {trip.totalDays} days</span>
          </div>
          {trip.estimatedBudget && (
            <div className="trip-card-meta-item">
              <Activity size={13} />
              <span>Est. ₹{trip.estimatedBudget.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        <div className="trip-card-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/trips/${trip.id}`)}
            id={`view-trip-${trip.id}`}
          >
            <Eye size={13} />
            View Trip
          </button>
          {showActions && (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate(`/trips/${trip.id}`)}
                id={`edit-trip-${trip.id}`}
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-danger)' }}
                onClick={() => onDelete?.(trip.id)}
                id={`delete-trip-${trip.id}`}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * DestinationCard
 * Props: destination, onExplore (fn), onSave (fn)
 */
export function DestinationCard({ destination, onExplore, saved = false }) {
  const dots = [1, 2, 3, 4].map(i => (
    <span
      key={i}
      className={`cost-dot ${i <= destination.costIndicator ? 'filled' : ''}`}
    />
  ));

  return (
    <article className="dest-card" aria-label={`Destination: ${destination.city}, ${destination.country}`}>
      <div className="dest-card-img-wrapper">
        <img
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          className="dest-card-img"
          loading="lazy"
        />
        <div className="dest-card-popularity">
          ⭐ {destination.popularity}%
        </div>
      </div>
      <div className="dest-card-body">
        <div className="dest-card-city">{destination.city}</div>
        <div className="dest-card-country">{destination.country}</div>
        <div className="dest-card-footer">
          <div className="cost-indicator" aria-label={`Cost: ${destination.costLevel}`}>
            {dots}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onExplore?.(destination)}
            id={`explore-${destination.id}`}
          >
            Explore
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * ActivityBlock — shows a single activity in the itinerary
 */
export function ActivityBlock({ activity }) {
  return (
    <div className="activity-block">
      <div className="activity-time">{activity.time}</div>
      <div className="activity-content">
        <div className="activity-name">
          {activity.icon} {activity.name}
        </div>
        <div className="activity-tags">
          <span className="activity-tag">{activity.category}</span>
          <span className="activity-tag">·</span>
          <span className="activity-tag">{activity.duration}</span>
        </div>
      </div>
      <div className="activity-cost">₹{activity.cost.toLocaleString('en-IN')}</div>
    </div>
  );
}
