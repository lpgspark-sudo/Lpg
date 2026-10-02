import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OrderQueuePage from './pages/OrderQueuePage.jsx';
import PriceManagementPage from './pages/PriceManagementPage.jsx';
import ComplaintLogPage from './pages/ComplaintLogPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrderQueuePage />} />
          <Route path="prices" element={<PriceManagementPage />} />
          <Route path="complaints" element={<ComplaintLogPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
