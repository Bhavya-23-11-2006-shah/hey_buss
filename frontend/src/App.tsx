import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DisplayProvider } from './lib/DisplayContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { BookPage } from './pages/BookPage';
import { TrackPage } from './pages/TrackPage';
import { TicketsPage } from './pages/TicketsPage';
import { HelpPage } from './pages/HelpPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <DisplayProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing / Splash page */}
          <Route path="/" element={<AppShell />}>
            <Route index element={<LandingPage />} />
          </Route>

          {/* App Shell with Sidebar (desktop) & Bottom Tab Bar (mobile) */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="book" element={<BookPage />} />
            <Route path="track" element={<TrackPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/:id" element={<TicketsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="profile" element={<SettingsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect to /app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </DisplayProvider>
  );
};

export default App;
