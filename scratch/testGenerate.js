async function testGenerate() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    console.log('Got token. Fetching cities...');
    const citiesRes = await fetch('http://localhost:5000/api/cities');
    const citiesData = await citiesRes.json();
    const bkk = citiesData.cities.find(c => c.name.toLowerCase() === 'bangkok');
    
    if (!bkk) {
      console.log('Bangkok not found');
      return;
    }
    
    console.log('Generating itinerary for', bkk.name);
    const genRes = await fetch('http://localhost:5000/api/planner/generate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        cityId: bkk.id,
        startDate: '2026-10-15',
        endDate: '2026-10-21',
        travelStyle: 'balanced',
        interests: ['food', 'culture'],
        travelers: 2,
        budget: 80000
      })
    });
    const genData = await genRes.json();
    
    if (!genRes.ok) {
        console.error('Error:', genData);
    } else {
        console.log('Success! Itinerary days:', genData.itinerary.days.length);
    }
  } catch (err) {
    console.error('Network Error:', err.message);
  }
}

testGenerate();
