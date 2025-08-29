// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/homepage/HomePage';
import Dashboard from './components/dashboard/Dashboard';
import StrategyBuilder from './components/builder/StrategyBuilder';
import DashboardLayout from './components/common/DashboardLayout';
import EmailVerification from './components/homepage/EmailVerification';
import './App.css'; 
import BacktestPage from './components/backtester/BacktestPage';
import HelpPage from './components/help/HelpPage';
import type { JSX } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Debug message to verify React is loading
console.log('React App is loading...');

// A helper component to protect routes that require a login
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
  console.log('ProtectedRoute: localStorage token =', localStorage.getItem('accessToken') ? 'YES' : 'NO');
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to home due to no authentication');
    // If no token, redirect to the login page
    return <Navigate to="/" replace />;
  }
  console.log('ProtectedRoute: Allowing access to protected route');
  return children;
};

// Placeholder components for new pages
const PortfolioPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Portfolio</h1>
    <p>Portfolio management page coming soon...</p>
  </div>
);

const AnalyticsPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Analytics</h1>
    <p>Analytics page coming soon...</p>
  </div>
);

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="main-app">
      <Routes>
        {/* If logged in, the root path '/' redirects to the dashboard */}
        {/* If not logged in, the root path '/' shows the HomePage */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />} />
        
        {/* Email verification route - no authentication required */}
        <Route path="/verify-email" element={<EmailVerification />} />
          
        {/* Dashboard Layout Routes - All pages with sidebar except settings */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Dashboard />} />
        </Route>
        <Route 
          path="/builder" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<StrategyBuilder />} />
        </Route>
        <Route 
          path="/backtest" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<BacktestPage />} />
        </Route>
        <Route 
          path="/portfolio" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<PortfolioPage />} />
        </Route>
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<AnalyticsPage />} />
        </Route>
        <Route 
          path="/help" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<HelpPage />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          // Define default options
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;