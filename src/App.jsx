import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layout
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public pages
import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import PublicTrip from './pages/PublicTrip';

// Authenticated pages
import Dashboard  from './pages/Dashboard';
import MyTrips    from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import Explore    from './pages/Explore';
import CountryDetail from './pages/CountryDetail';
import Calendar   from './pages/Calendar';
import Budget     from './pages/Budget';
import Saved      from './pages/Saved';
import Profile    from './pages/Profile';
import Settings   from './pages/Settings';
import PlanTrip   from './pages/PlanTrip';

import './App.css';

export default function App() {
  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('globetrotter_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/"       element={<Landing />} />
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/shared/:token" element={<PublicTrip />} />

            {/* Authenticated app shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard"    element={<Dashboard />} />
                <Route path="/trips"        element={<MyTrips />} />
                <Route path="/trips/create" element={<CreateTrip />} />
                <Route path="/trips/edit/:id" element={<CreateTrip />} />
                <Route path="/trips/:id"    element={<TripDetails />} />
                <Route path="/explore"      element={<Explore />} />
                <Route path="/explore/country/:code" element={<CountryDetail />} />
                <Route path="/calendar"     element={<Calendar />} />
                <Route path="/budget"       element={<Budget />} />
                <Route path="/saved"        element={<Saved />} />
                <Route path="/profile"      element={<Profile />} />
                <Route path="/settings"     element={<Settings />} />
                <Route path="/plan"          element={<PlanTrip />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
