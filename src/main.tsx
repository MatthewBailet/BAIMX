import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App, { HomePage } from './App'
import AboutPage from './pages/AboutPage'
import { LiveFeedPage } from './pages/LiveFeedPage'
import ArticlePage from './pages/ArticlePage'
import ScrollToTop from './components/ScrollToTop'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="Livefeed" element={<LiveFeedPage />} />
          <Route path="About" element={<AboutPage />} />
          <Route path="article/:slug" element={<ArticlePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
