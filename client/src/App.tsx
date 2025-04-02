
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Tickets from './pages/tickets';
import Problems from './pages/problems';
import Changes from './pages/changes';
import Assets from './pages/assets';
import AssetDiscovery from './pages/asset-discovery';
import ServiceCatalog from './pages/service-catalog';
import KnowledgeBase from './pages/knowledge-base';
import Reports from './pages/reports';
import Settings from './pages/settings';
import NotFound from './pages/not-found';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from './components/sidebar';
import Topbar from './components/topbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <div>
            <Topbar />
            <Sidebar />
            <div className="ml-64 pt-16">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/changes" element={<Changes />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/asset-discovery" element={<AssetDiscovery />} />
                <Route path="/service-catalog" element={<ServiceCatalog />} />
                <Route path="/knowledge-base" element={<KnowledgeBase />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
