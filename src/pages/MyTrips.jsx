import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Map } from 'lucide-react';
import { fetchApi } from '../services/api';
import { TripCard } from '../components/trips/TripCard';
import EmptyState from '../components/common/EmptyState';
import '../components/common/common.css';

const FILTERS = ['All', 'Upcoming', 'Completed', 'Draft'];

export default function MyTrips() {
  const { t } = useLanguage();

  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await fetchApi('/trips');
        if (data.success) {
          // Add a dummy status logic based on dates (since DB doesn't have status yet)
          const now = new Date();
          const mappedTrips = data.trips.map(t => {
            const end = new Date(t.end_date);
            const start = new Date(t.start_date);
            let status = 'upcoming';
            if (end < now) status = 'completed';
            else if (start <= now && end >= now) status = 'ongoing';
            return {
              ...t,
              id: t.id,
              name: t.name,
              startDate: t.start_date,
              endDate: t.end_date,
              coverImage: t.cover_image,
              status,
              cityCount: 0, // Placeholder
              totalDays: Math.max(0, Math.ceil((end - start) / 86400000)) + 1,
            };
          });
          setTrips(mappedTrips);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTrips();
  }, []);

  const filtered = filter === 'All'
    ? trips
    : trips.filter(t => t.status.toLowerCase() === filter.toLowerCase());

  const handleDelete = async (id) => {
    if (window.confirm('Delete this trip?')) {
      try {
        await fetchApi(`/trips/${id}`, { method: 'DELETE' });
        setTrips(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete trip');
      }
    }
  };

  return (
    <div className="page-container page-enter">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            My Trips
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} in your collection
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/trips/create')}
          id="my-trips-new"
        >
          <Plus size={16} />
          Plan New Trip
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 'var(--space-6)' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
            id={`filter-${f.toLowerCase()}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Trip grid */}
      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              showActions
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Map size={32} />}
          title="No trips yet"
          description={
            filter === 'All'
              ? "You haven't planned any trips yet. Start your first adventure!"
              : `No ${filter.toLowerCase()} trips found.`
          }
          action={
            filter === 'All' && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/trips/create')}
              >
                <Plus size={16} />
                Plan Your First Trip
              </button>
            )
          }
        />
      )}
    </div>
  );
}
