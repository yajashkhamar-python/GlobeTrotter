/**
 * itineraryPlanner.js
 * Deterministic recommendation engine for GlobeTrotter's Intelligent Trip Planner.
 * Scores and distributes activities across days based on user preferences.
 */

// ─── Interest → Activity Type mappings ────────────────────────────────────────

const INTEREST_TYPE_MAP = {
  history: ['History', 'Landmark', 'Sightseeing', 'Heritage'],
  museums: ['Museum', 'Culture', 'Art'],
  food: ['Food', 'Restaurant', 'Market', 'Cuisine'],
  nature: ['Nature', 'Park', 'Garden', 'Outdoor'],
  shopping: ['Shopping', 'Market'],
  nightlife: ['Nightlife', 'Entertainment', 'Bar'],
  architecture: ['Architecture', 'Landmark', 'Sightseeing'],
  adventure: ['Adventure', 'Sport', 'Outdoor', 'Nature'],
  photography: ['Landmark', 'Sightseeing', 'Nature', 'Architecture'],
  culture: ['Culture', 'Museum', 'History', 'Art', 'Heritage'],
  family: ['Museum', 'Park', 'Nature', 'Entertainment'],
  entertainment: ['Entertainment', 'Theatre', 'Show', 'Experience'],
};

// ─── Travel style → per-day activity counts ────────────────────────────────

const STYLE_ACTIVITIES_PER_DAY = {
  relaxed: 1,
  balanced: 3,
  adventure: 4,
  cultural: 3,
  luxury: 2,
  'budget-friendly': 4,
};

// ─── Price-sensitivity by style ───────────────────────────────────────────────

const STYLE_PRICE_WEIGHTS = {
  relaxed: 'any',
  balanced: 'any',
  adventure: 'any',
  cultural: 'any',
  luxury: 'high_preferred',    // prefer higher-cost
  'budget-friendly': 'low_preferred',  // prefer lower-cost or free
};

// ─── Parse duration string like "2-3 hours", "1 hour", "45 mins" ─────────────

function parseDurationHours(str) {
  if (!str) return 2; // default: 2 hours
  const lower = str.toLowerCase();

  // Range like "2-3 hours"
  const rangeMatch = lower.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*h/);
  if (rangeMatch) return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;

  // Single value "2 hours" or "1.5 hrs"
  const singleMatch = lower.match(/(\d+(?:\.\d+)?)\s*h/);
  if (singleMatch) return parseFloat(singleMatch[1]);

  // Minutes "90 minutes" / "45 mins"
  const minMatch = lower.match(/(\d+)\s*m/);
  if (minMatch) return parseFloat(minMatch[1]) / 60;

  return 2;
}

// ─── Score a single activity against user preferences ─────────────────────────

function scoreActivity(activity, { interests, travelStyle, budget }) {
  let score = 0;

  // 1. Interest match (highest weight: 40 pts per matching interest type)
  if (interests && interests.length > 0) {
    const actType = (activity.type || '').toLowerCase();
    for (const interest of interests) {
      const mappedTypes = INTEREST_TYPE_MAP[interest.toLowerCase()] || [];
      if (mappedTypes.some(t => t.toLowerCase() === actType || actType.includes(t.toLowerCase()))) {
        score += 40;
      }
    }
  }

  // 2. Travel style partial match
  const styleTypes = {
    cultural: ['Culture', 'Museum', 'History', 'Heritage', 'Architecture'],
    adventure: ['Adventure', 'Sport', 'Outdoor', 'Nature'],
    luxury: [],  // handled by price weight
    relaxed: [],
    balanced: [],  // no penalty/bonus for balanced
    'budget-friendly': [],
  };
  const styleMatchTypes = styleTypes[travelStyle?.toLowerCase()] || [];
  const actType = (activity.type || '').toLowerCase();
  if (styleMatchTypes.some(t => t.toLowerCase() === actType)) score += 20;

  // 3. Price scoring
  const cost = parseFloat(activity.cost) || 0;
  const stylePrice = STYLE_PRICE_WEIGHTS[travelStyle?.toLowerCase()] || 'any';

  if (stylePrice === 'low_preferred') {
    // Prefer free or cheap activities
    if (cost === 0) score += 15;
    else if (cost < 500) score += 10;
    else if (cost > 2000) score -= 15;
  } else if (stylePrice === 'high_preferred') {
    // Prefer premium activities
    if (cost > 1000) score += 15;
    else if (cost === 0) score -= 5;
  }

  // 4. Budget compatibility (penalize if activity is more than 40% of daily activity budget)
  if (budget && budget > 0) {
    const numDays = 1; // per-activity check
    const activityBudgetPerActivity = budget * 0.35; // rough limit
    if (cost > activityBudgetPerActivity) score -= 20;
  }

  // 5. Rating bonus if available
  if (activity.rating) {
    const rating = parseFloat(activity.rating);
    if (rating >= 4.5) score += 15;
    else if (rating >= 4.0) score += 10;
    else if (rating >= 3.5) score += 5;
  }

  return score;
}

// ─── Distribute activities across days ────────────────────────────────────────

function distributeActivities(scoredActivities, startDate, endDate, travelStyle) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];

  const current = new Date(start);
  while (current <= end) {
    days.push({
      date: current.toISOString().split('T')[0],
      dayNumber: days.length + 1,
      activities: [],
      hoursUsed: 0
    });
    current.setDate(current.getDate() + 1);
  }

  const maxPerDay = travelStyle === 'relaxed' ? 2 : travelStyle === 'adventure' ? 4 : 3;
  const maxHours = travelStyle === 'relaxed' ? 5 : travelStyle === 'adventure' ? 10 : 8;

  // We want to assign up to (maxPerDay * days.length) activities.
  const targetCount = days.length * maxPerDay;
  const activitiesToAssign = scoredActivities.slice(0, targetCount);

  let currentDayIndex = 0;
  for (const act of activitiesToAssign) {
    const duration = parseDurationHours(act.duration);
    
    let assigned = false;
    // Attempt round-robin
    for (let i = 0; i < days.length; i++) {
      const idx = (currentDayIndex + i) % days.length;
      const day = days[idx];
      
      // Allow if we haven't hit the cap, and it fits within time (or it's the very first activity of the day)
      if (day.activities.length < maxPerDay && (day.hoursUsed + duration <= maxHours || day.activities.length === 0)) {
        day.activities.push(act);
        day.hoursUsed += duration;
        currentDayIndex = (idx + 1) % days.length;
        assigned = true;
        break;
      }
    }
    
    // Fallback if strict limits prevented assignment
    if (!assigned) {
      let minDay = days[0];
      for (const d of days) {
        if (d.activities.length < minDay.activities.length) minDay = d;
      }
      minDay.activities.push(act);
      minDay.hoursUsed += duration;
    }
  }

  return days.map(d => ({
    date: d.date,
    dayNumber: d.dayNumber,
    activities: d.activities
  }));
}

// ─── Build recommendation reason string ───────────────────────────────────────

function buildReason(activity, interests) {
  if (!interests || interests.length === 0) return 'Highly rated attraction in the area.';

  const actType = (activity.type || '').toLowerCase();
  const matchedInterests = [];

  for (const interest of interests) {
    const mappedTypes = INTEREST_TYPE_MAP[interest.toLowerCase()] || [];
    if (mappedTypes.some(t => t.toLowerCase() === actType || actType.includes(t.toLowerCase()))) {
      matchedInterests.push(interest);
    }
  }

  if (matchedInterests.length > 0) {
    const formatted = matchedInterests.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
    return `Matches your interest in ${formatted}.`;
  }

  return 'A popular attraction worth visiting.';
}

// ─── Main planner function ────────────────────────────────────────────────────

/**
 * generateItinerary
 * @param {Object} options
 * @param {Array}  options.activities - All activities for the city from DB
 * @param {Object} options.city - City object { id, name, country, image }
 * @param {string} options.startDate - "YYYY-MM-DD"
 * @param {string} options.endDate - "YYYY-MM-DD"
 * @param {string} options.travelStyle - "balanced" | "relaxed" | "adventure" | etc.
 * @param {Array}  options.interests - ["history", "food", ...]
 * @param {number} options.travelers
 * @param {number} options.budget
 * @returns {Object} Generated itinerary
 */
export function generateItinerary({ activities, city, startDate, endDate, travelStyle, interests, travelers, budget }) {
  // 1. Score and sort activities
  const scored = activities
    .map(act => ({
      ...act,
      _score: scoreActivity(act, { interests, travelStyle, budget }),
      _reason: buildReason(act, interests),
    }))
    .filter(act => act._score > -50) // filter out very bad matches
    .sort((a, b) => b._score - a._score);

  // 2. Distribute across days
  const days = distributeActivities(scored, startDate, endDate, travelStyle);

  // 3. Calculate known activity cost
  const allScheduledActivities = days.flatMap(d => d.activities);
  const knownActivityCost = allScheduledActivities.reduce(
    (sum, act) => sum + (parseFloat(act.cost) || 0),
    0
  );

  // 4. Duration calculation
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.round((end - start) / 86400000) + 1;

  return {
    city,
    startDate,
    endDate,
    duration,
    travelers: travelers || 1,
    travelStyle,
    interests,
    days,
    budget: {
      total: budget || 0,
      knownActivityCost,
      perTraveler: travelers > 1 ? Math.round(knownActivityCost / travelers) : knownActivityCost,
      exceedsBudget: budget > 0 && knownActivityCost > budget * 0.6, // warn if activities > 60% of budget
    },
    totalActivities: allScheduledActivities.length,
  };
}
