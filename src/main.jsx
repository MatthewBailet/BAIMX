import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App, { HomePage } from './App.jsx'
import { LiveFeedPage } from './pages/LiveFeedPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="Livefeed" element={<LiveFeedPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
