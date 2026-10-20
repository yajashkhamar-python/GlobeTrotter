import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ChevronRight } from 'lucide-react';
import SmartImg from '../common/SmartImg';
import { getActImg, GENERIC_IMG } from '../../utils/imageResolver';
import { fetchApi } from '../../services/api';

export default function ReplaceModal({ activity, cityId, usedIds, interests, travelStyle, budget, onSelect, onClose }) {
  const [alternatives, setAlts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchApi(`/cities/${cityId}/activities`)
      .then(d => {
        const pool = (d.activities || []).filter(a =>
          a.id !== activity.id &&
          !usedIds.has(a.id)
        );
        // simple score: prefer same type, then matching interests
        const scored = pool.map(a => {
          let s = 0;
          if (a.type === activity.type) s += 30;
          if (interests?.includes(a.type?.toLowerCase())) s += 20;
          if (parseFloat(a.cost) === 0) s += 5;
          return { ...a, _score: s };
        }).sort((a, b) => b._score - a._score).slice(0, 6);
        setAlts(scored);
      })
      .catch(() => setError('Could not load alternatives.'))
      .finally(() => setLoading(false));
  }, [activity, cityId, usedIds]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Replace activity" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-hdr">
          <h3>Replace "{activity.name}"</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <p className="modal-sub">Choose an alternative activity from the same destination.</p>
        {loading ? (
          <div className="planner-loading-sm"><div className="planner-spinner sm" /> Loading alternatives…</div>
        ) : error ? (
          <div className="planner-error-msg"><AlertTriangle size={14} /> {error}</div>
        ) : alternatives.length === 0 ? (
          <div className="modal-empty">No other activities available for this city.</div>
        ) : (
          <div className="modal-alts">
            {alternatives.map(a => (
              <button key={a.id} className="modal-alt-card" onClick={() => onSelect(a)}>
                <div className="modal-alt-img">
                  <SmartImg src={getActImg(a)} fallback={GENERIC_IMG} alt={a.name} />
                </div>
                <div className="modal-alt-body">
                  <div className="modal-alt-name">{a.name}</div>
                  <div className="modal-alt-meta">
                    {a.type && <span>{a.type}</span>}
                    {parseFloat(a.cost) > 0 ? <span>est. {parseFloat(a.cost).toFixed(0)}</span> : <span className="act-free">Free</span>}
                  </div>
                </div>
                <ChevronRight size={14} className="modal-alt-arrow" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
