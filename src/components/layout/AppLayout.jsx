import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '../common/ErrorBoundary';
import './AppLayout.css';

export default function AppLayout() {
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="app-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
