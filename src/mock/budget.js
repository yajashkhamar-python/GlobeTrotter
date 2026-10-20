// mock/budget.js
// Centralized mock budget data — replace with API calls in Phase 2

export const mockBudget = {
  tripId: 'trip-1',
  tripName: 'European Summer Adventure',
  estimatedTotal: 125000,
  spent: 0,
  currency: '₹',
  perDay: 8333,
  breakdown: [
    { id: 'b1', category: 'Flights', icon: '✈️', allocated: 40000, spent: 0, color: '#1d5bef' },
    { id: 'b2', category: 'Accommodation', icon: '🏨', allocated: 35000, spent: 0, color: '#7c3aed' },
    { id: 'b3', category: 'Activities', icon: '🎭', allocated: 20000, spent: 0, color: '#059669' },
    { id: 'b4', category: 'Meals', icon: '🍽️', allocated: 18000, spent: 0, color: '#d97706' },
    { id: 'b5', category: 'Transport', icon: '🚇', allocated: 8000, spent: 0, color: '#dc2626' },
    { id: 'b6', category: 'Shopping & Other', icon: '🛍️', allocated: 4000, spent: 0, color: '#6b7280' },
  ],
};

export const budgetByTrip = {
  'trip-1': mockBudget,
  'trip-2': {
    tripId: 'trip-2',
    tripName: 'Southeast Asia Odyssey',
    estimatedTotal: 85000,
    spent: 0,
    currency: '₹',
    perDay: 4474,
    breakdown: [
      { id: 'b7',  category: 'Flights', icon: '✈️', allocated: 25000, spent: 0, color: '#1d5bef' },
      { id: 'b8',  category: 'Accommodation', icon: '🏨', allocated: 22000, spent: 0, color: '#7c3aed' },
      { id: 'b9',  category: 'Activities', icon: '🎭', allocated: 15000, spent: 0, color: '#059669' },
      { id: 'b10', category: 'Meals', icon: '🍽️', allocated: 14000, spent: 0, color: '#d97706' },
      { id: 'b11', category: 'Transport', icon: '🚇', allocated: 6000, spent: 0, color: '#dc2626' },
      { id: 'b12', category: 'Shopping & Other', icon: '🛍️', allocated: 3000, spent: 0, color: '#6b7280' },
    ],
  },
};
