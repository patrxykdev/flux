import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; 
import { useAuth } from '../../contexts/AuthContext';
import StatCard from './StatCard';
import PortfolioPerformanceCard from './PortfolioPerformanceCard';
import { statCardsData } from './data';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    api.get('/api/profile/')
      .then(response => setUsername(response.data.username))
      .catch(error => {
        console.error("Failed to fetch profile", error);
        // If it's an authentication error, redirect to login
        if (error.response?.status === 401) {
          logout();
          navigate('/', { replace: true });
        }
      });
  }, []);

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {username || 'User'}!</h1>
          <p>Here's a snapshot of your trading portfolio.</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCardsData.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      
      <div className="main-content-grid">
        <PortfolioPerformanceCard />
      </div>
    </div>
  );
};

export default Dashboard;