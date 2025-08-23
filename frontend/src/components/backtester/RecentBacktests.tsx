import React, { useState, useEffect } from 'react';
import api from '../../api';
import './RecentBacktests.css';

interface Backtest {
  id: number;
  strategy_name: string;
  ticker: string;
  start_date: string;
  end_date: string;
  timeframe: string;
  initial_cash: string;
  leverage: string;
  results: any;
  created_at: string;
}

interface RecentBacktestsProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecentBacktests: React.FC<RecentBacktestsProps> = ({ isOpen, onClose }) => {
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRecentBacktests();
    }
  }, [isOpen]);

  const fetchRecentBacktests = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.get('/api/recent-backtests/');
      setBacktests(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Could not load recent backtests.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'string') {
      // Remove any non-numeric characters except decimal point
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
      if (isNaN(numericValue)) return value;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericValue);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getReturnClass = (returnValue: string) => {
    if (!returnValue || returnValue === 'N/A') return 'neutral';
    const numericValue = parseFloat(returnValue.replace(/[^\d.-]/g, ''));
    if (isNaN(numericValue)) return 'neutral';
    return numericValue >= 0 ? 'profit' : 'loss';
  };

  if (!isOpen) return null;

  return (
    <div className="recent-backtests-overlay" onClick={onClose}>
      <div className="recent-backtests-modal" onClick={(e) => e.stopPropagation()}>
        <div className="recent-backtests-header">
          <h2>Recent Backtests</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="recent-backtests-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading recent backtests...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchRecentBacktests} className="retry-button">
                Try Again
              </button>
            </div>
          ) : backtests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No backtests yet</p>
              <p className="empty-subtitle">Run your first backtest to see results here</p>
            </div>
          ) : (
            <div className="backtests-grid">
              {backtests.map((backtest) => (
                <div key={backtest.id} className="backtest-card">
                  <div className="backtest-header">
                    <div className="strategy-info">
                      <h3 className="strategy-name">{backtest.strategy_name}</h3>
                      <span className="ticker-badge">{backtest.ticker}</span>
                    </div>
                    <div className="backtest-meta">
                      <span className="timeframe-badge">{backtest.timeframe}</span>
                      <span className="leverage-badge">{backtest.leverage}x</span>
                    </div>
                  </div>

                  <div className="backtest-stats">
                    <div className="stat-row">
                      <div className="stat-item">
                        <label>Return</label>
                        <span className={`stat-value return-value ${getReturnClass(backtest.results?.stats?.['Return [%]'] || 'N/A')}`}>
                          {backtest.results?.stats?.['Return [%]'] || 'N/A'}
                        </span>
                      </div>
                      <div className="stat-item">
                        <label>Final Equity</label>
                        <span className="stat-value">
                          {formatCurrency(backtest.results?.stats?.['Equity Final [$]'] || 'N/A')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="stat-row">
                      <div className="stat-item">
                        <label>Trades</label>
                        <span className="stat-value">
                          {backtest.results?.stats?.['# Trades'] || '0'}
                        </span>
                      </div>
                      <div className="stat-item">
                        <label>Initial Capital</label>
                        <span className="stat-value">
                          {formatCurrency(backtest.initial_cash)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="backtest-dates">
                    <div className="date-range">
                      <span className="date-label">Period:</span>
                      <span className="date-value">
                        {new Date(backtest.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(backtest.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="created-at">
                      <span className="date-label">Run:</span>
                      <span className="date-value">{formatDate(backtest.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentBacktests;
