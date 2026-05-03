import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <>
      <div className="bg-mesh" aria-hidden="true" />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/result"    element={<ResultPage />} />
          <Route path="/history"   element={<HistoryPage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
