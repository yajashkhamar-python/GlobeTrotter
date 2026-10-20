import fetch from 'node-fetch';

fetch('http://localhost:5000/api/planner/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // no token on purpose, expecting 401
  },
  body: JSON.stringify({ tripName: 'Test', cityId: 1, startDate: '2026-10-01', endDate: '2026-10-05', days: [] })
}).then(res => {
  console.log('Status:', res.status);
  return res.text();
}).then(console.log).catch(console.error);
