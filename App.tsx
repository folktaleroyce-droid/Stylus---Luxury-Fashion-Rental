import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Dashboard } from './pages/Dashboard';
import { AIStylistPage } from './pages/AIStylistPage';
import { InfoPage } from './pages/InfoPage';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-stylist" element={<AIStylistPage />} />
          
          {/* Footer / Info Routes */}
          <Route path="/the-edit" element={<InfoPage type="edit" />} />
          <Route path="/privacy" element={<InfoPage type="privacy" />} />
          <Route path="/terms" element={<InfoPage type="terms" />} />
          <Route path="/authenticity" element={<InfoPage type="authenticity" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;