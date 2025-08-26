import React from 'react';
import './RecentBacktestsCard.css';

interface RecentBacktest {
  id: number;
  strategy_name: string;
  ticker: string;
  return_pct: string | number;
  final_equity: string | number;
  trade_count: number;
  created_at: string;
  timeframe: string;
  leverage: string;
}

interface RecentBacktestsCardProps {
  backtests: RecentBacktest[];
}

const RecentBacktestsCard: React.FC<RecentBacktestsCardProps> = ({ backtests }) => {

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'string') {
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

  const getReturnClass = (returnValue: string | number) => {
    if (!returnValue || returnValue === 'N/A') return 'neutral';
    const numericValue = typeof returnValue === 'string' ? parseFloat(returnValue.replace(/[^\d.-]/g, '')) : returnValue;
    if (isNaN(numericValue)) return 'neutral';
    return numericValue >= 0 ? 'profit' : 'loss';
  };

  const formatReturn = (returnValue: string | number) => {
    if (returnValue === 'N/A') return 'N/A';
    const numericValue = typeof returnValue === 'string' ? parseFloat(returnValue.replace(/[^\d.-]/g, '')) : returnValue;
    if (isNaN(numericValue)) return returnValue;
    return `${numericValue >= 0 ? '+' : ''}${numericValue.toFixed(2)}%`;
  };

  if (backtests.length === 0) {
    return (
      <div className="dashboard-card recent-backtests-card">
        <div className="card-header">
          <h3>Recent Backtests</h3>
        </div>
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p>No backtests yet</p>
          <p className="empty-subtitle">Run your first backtest to see results here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card recent-backtests-card">
      <div className="card-header">
        <h3>Recent Backtests</h3>

      </div>
      <div className="backtests-list">
        {backtests.slice(0, 3).map((backtest) => (
          <div key={backtest.id} className="backtest-item">
            <div className="backtest-info">
              <h4 className="backtest-name">{backtest.strategy_name}</h4>
              <div className="backtest-meta">
                <span className="ticker-badge">{backtest.ticker}</span>
                <div className="timeframe-leverage-group">
                  <span className="timeframe-badge">{backtest.timeframe}</span>
                  <span className="leverage-badge">{backtest.leverage}x</span>
                </div>
              </div>
            </div>
            <div className="backtest-performance">
              <div className="return-stat">
                <span className={`return-value ${getReturnClass(backtest.return_pct)}`}>
                  {formatReturn(backtest.return_pct)}
                </span>
                <span className="return-label">Return</span>
              </div>
              <div className="equity-stat">
                <span className="equity-value">
                  {formatCurrency(backtest.final_equity)}
                </span>
                <span className="equity-label">Final</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentBacktestsCard;
