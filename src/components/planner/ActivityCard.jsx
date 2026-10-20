import React from 'react';
import { Clock, MapPin, Tag, CheckCircle2, DollarSign } from 'lucide-react';
import SmartImg from '../common/SmartImg';
import { getActImg, GENERIC_IMG } from '../../utils/imageResolver';

export default function ActivityCard({ act, onRemove, onReplace, showReplace, sym = '₹' }) {
  const cost = parseFloat(act.cost);
  const costStr = cost > 0 ? `${sym}${cost.toLocaleString()}` : 'Free';

  return (
    <div className="ac-card">

      {/* Image */}
      <div className="ac-img-wrap">
        <SmartImg src={getActImg(act)} fallback={GENERIC_IMG} alt={act.name} />
      </div>

      {/* Content */}
      <div className="ac-body">
        <div className="ac-top">
          <div className="ac-title-block">
            <h4 className="ac-name">{act.name}</h4>
            <div className="ac-location">
              <MapPin size={11} />
              <span>{act.city || 'Destination'}</span>
            </div>
          </div>
          <div className="ac-actions">
            {showReplace && (
              <button className="ac-btn" onClick={() => onReplace(act)}>Replace</button>
            )}
            <button className="ac-btn ac-btn-danger" onClick={() => onRemove(act.id)}>Remove</button>
            <span className="ac-chevron">›</span>
          </div>
        </div>

        <div className="ac-tags">
          {act.type && (
            <span className="ac-tag ac-tag-type"><Tag size={10} /> {act.type}</span>
          )}
          {act.duration && (
            <span className="ac-tag"><Clock size={10} /> {act.duration}</span>
          )}
          <span className="ac-tag"><DollarSign size={10} /> {costStr}</span>
        </div>

        {act.description && (
          <p className="ac-desc">
            {act.description.slice(0, 160)}{act.description.length > 160 ? '…' : ''}
          </p>
        )}

        {act.type && (
          <div className="ac-match">
            <CheckCircle2 size={12} />
            <span>Matches your interest in <strong>{act.type.toLowerCase()}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
