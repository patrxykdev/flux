import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; 
import { useAuth } from '../../contexts/AuthContext';
import StatCard from './StatCard';
import RecentBacktestsCard from './RecentBacktestsCard';
import TopStrategiesCard from './TopStrategiesCard';
import RecentBacktestChart from './RecentBacktestChart';
import './Dashboard.css';

interface DashboardStats {
  portfolio_summary: {
    total_backtests: number;
    total_strategies: number;
    best_win_rate: number;
    best_strategy_return: number;
    total_pnl: number;
  };
  top_strategies: Array<{
    name: string;
    total_return: number;
    backtest_count: number;
    win_count: number;
    avg_return: number;
    win_rate: number;
  }>;
  recent_backtests: Array<{
    id: number;
    strategy_name: string;
    ticker: string;
    return_pct: string | number;
    final_equity: string | number;
    trade_count: number;
    created_at: string;
    timeframe: string;
    leverage: string;
    results: any;
  }>;
}

const Dashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch dashboard stats
      const statsResponse = await api.get('/api/dashboard-stats/');
      setDashboardStats(statsResponse.data);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data", error);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/', { replace: true });
        return;
      }
      
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatCardsData = () => {
    if (!dashboardStats) return [];
    
    return [
      {
        title: "Total Backtests",
        value: dashboardStats.portfolio_summary.total_backtests.toString(),
        icon: "chart",
      },
      {
        title: "Active Strategies",
        value: dashboardStats.portfolio_summary.total_strategies.toString(),
        icon: "target",
      },
      {
        title: "Best Win Rate",
        value: `${dashboardStats.portfolio_summary.best_win_rate}%`,
        icon: "winrate",
      },
      {
        title: "Best Strategy Return",
        value: `${dashboardStats.portfolio_summary.best_strategy_return}%`,
        icon: "trend",
        isPnL: true,
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="dashboard-content">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.username || 'User'}!</h1>
          <p>Here's a snapshot of your trading portfolio.</p>
        </div>
      </div>

      <div className="stats-grid">
        {getStatCardsData().map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      
      <div className="main-content-grid">
        <div className="top-row">
          <TopStrategiesCard strategies={dashboardStats?.top_strategies || []} />
          <RecentBacktestsCard 
            backtests={dashboardStats?.recent_backtests || []} 
          />
        </div>
        <div className="chart-row">
          <RecentBacktestChart backtest={dashboardStats?.recent_backtests?.[0] || null} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;