// Centralized API URL: reads import.meta.env.VITE_API_URL in production or defaults to local dev server
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export { API_URL };

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('globetrotter_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } else {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const text = await response.text();
    throw new Error('API returned non-JSON response');
  }

  return data;
};
