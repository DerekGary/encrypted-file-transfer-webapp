// ./frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import DownloadPage from './pages/DownloadPage';
import './styles/App.css'; // Global Styles

// This serves as the router for our different pages.
function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/download/:mainId/:subId" component={DownloadPage} />
      </Routes>
  );
}

export default App;
