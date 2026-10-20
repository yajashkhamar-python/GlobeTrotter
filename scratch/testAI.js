async function testAI() {
  // 1. Register User
  let res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test_ai_copilot_final@example.com', password: 'password123' })
  });
  let data = await res.json();
  if (!res.ok && data.message !== 'User already exists') throw new Error(data.message);

  // Login
  res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_ai_copilot_final@example.com', password: 'password123' })
  });
  data = await res.json();
  const token = data.token;
  console.log('Got token:', token ? 'YES' : 'NO');

  // Create Trip
  res = await fetch('http://localhost:5000/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'AI Test Trip',
      destinations: [{ city_id: 1, start_date: '2026-12-01', end_date: '2026-12-05' }],
      start_date: '2026-12-01',
      end_date: '2026-12-05',
      budget_limit: 1000
    })
  });
  data = await res.json();
  const tripId = data.trip.id;
  console.log('Created trip ID:', tripId);

  // Test 1: General Question
  console.log('Sending General Question...');
  res = await fetch('http://localhost:5000/api/ai-assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      tripId,
      message: 'Explain the difference between JavaScript and Python in 2 sentences.',
      history: []
    })
  });
  data = await res.json();
  console.log('Response 1:', data.response);

  // Test 2: Trip specific question
  console.log('Sending Trip Question...');
  res = await fetch('http://localhost:5000/api/ai-assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      tripId,
      message: 'Can you suggest one more activity for my trip? I have one empty day in Mumbai. Add an activity.',
      history: [
         { role: 'user', text: 'Explain the difference between JavaScript and Python in 2 sentences.' },
         { role: 'model', text: data.response || '' }
      ]
    })
  });
  let data2 = await res.json();
  console.log('Response 2:', data2.response);
  console.log('Proposed Changes:', data2.proposedChanges);
}
testAI().catch(console.error);
