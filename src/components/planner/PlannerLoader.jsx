import React from 'react';
import { Globe, CheckCircle, Sparkles } from 'lucide-react';

const LOADING_MSGS = [
  'Understanding your destination…',
  'Matching your interests…',
  'Selecting top activities…',
  'Organizing your days…',
  'Balancing your itinerary…',
  'Preparing your journey…',
];

export default function PlannerLoader({ step }) {
  return (
    <div className="pll-root" aria-live="polite" aria-label="Generating itinerary">
      <div className="pll-globe">
        <Globe size={56} />
        <Sparkles className="pll-spark" size={24} />
      </div>
      <h2 className="pll-title">Building your personalized itinerary…</h2>
      <p className="pll-sub">Our smart planner is crafting a custom journey for you.</p>

      <div className="pll-progress-bar">
        <div className="pll-progress-fill" style={{ width: `${Math.round(((step + 1) / LOADING_MSGS.length) * 100)}%` }} />
      </div>

      <div className="pll-steps">
        {LOADING_MSGS.map((msg, i) => (
          <div key={i} className={`pll-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="pll-step-icon">
              {i < step
                ? <CheckCircle size={16} />
                : i === step
                  ? <div className="planner-spinner sm" />
                  : <div className="pll-dot" />
              }
            </div>
            <span>{msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
