async function getTrip() {
  let res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_ai_copilot_final@example.com', password: 'password123' })
  });
  let data = await res.json();
  const token = data.token;
  
  res = await fetch('http://localhost:5000/api/trips/17', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
getTrip().catch(console.error);
