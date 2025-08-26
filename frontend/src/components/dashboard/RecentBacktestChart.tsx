import React from 'react';
import './RecentBacktestChart.css';

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
  results: any;
}

interface RecentBacktestChartProps {
  backtest: RecentBacktest | null;
}

const RecentBacktestChart: React.FC<RecentBacktestChartProps> = ({ backtest }) => {
  if (!backtest) {
    return (
      <div className="dashboard-card recent-backtest-chart">
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p>No backtests yet</p>
          <p className="empty-subtitle">Run your first backtest to see the chart here</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  // Generate a beautiful, compact equity curve chart
  const generateEquityCurve = () => {
    if (!backtest.results) {
      // Fallback to a beautiful line chart
      return (
        <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(13, 110, 253, 0.4)" />
              <stop offset="100%" stopColor="rgba(13, 110, 253, 0.02)" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 90 L 50 85 L 100 92 L 150 78 L 200 87 L 250 72 C 275 67, 300 67, 325 72 L 350 90 L 400 78" 
            fill="url(#equityGradient)" 
            stroke="#0D6EFD" 
            strokeWidth="1.5"
          />
        </svg>
      );
    }

    // Try to get equity curve from the actual backtest results structure
    let equityData = null;
    
    // Check for plot_data.equity_curve (the actual structure from backtester)
    if (backtest.results.plot_data && backtest.results.plot_data.equity_curve) {
      equityData = backtest.results.plot_data.equity_curve;
    }
    // Check for equity_curve in results (fallback)
    else if (backtest.results.equity_curve) {
      equityData = backtest.results.equity_curve;
    }
    // Check for equity curve in stats
    else if (backtest.results.stats && backtest.results.stats.equity_curve) {
      equityData = backtest.results.stats.equity_curve;
    }
    // Check for portfolio value progression
    else if (backtest.results.portfolio_values) {
      equityData = backtest.results.portfolio_values;
    }
    // Check for any array of numeric values that could represent equity
    else if (backtest.results.equity && Array.isArray(backtest.results.equity)) {
      equityData = backtest.results.equity;
    }

    // If we have actual equity curve data, use it
    if (equityData && Array.isArray(equityData) && equityData.length > 0) {
      const maxEquity = Math.max(...equityData);
      const minEquity = Math.min(...equityData);
      let range = maxEquity - minEquity;
      
      if (range === 0) range = 1; // Avoid division by zero
      
      const points = equityData.map((value, index) => {
        const x = (index / (equityData.length - 1)) * 400;
        const y = 120 - ((value - minEquity) / range) * 100 - 10;
        return `${x},${y}`;
      }).join(' ');
      
      return (
        <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(13, 110, 253, 0.4)" />
              <stop offset="100%" stopColor="rgba(13, 110, 253, 0.02)" />
            </linearGradient>
          </defs>
          <path 
            d={`M ${points}`}
            fill="url(#equityGradient)" 
            stroke="#0D6EFD" 
            strokeWidth="1"
          />
        </svg>
      );
    }

    // Fallback to a beautiful line chart
    return (
      <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(13, 110, 253, 0.4)" />
            <stop offset="100%" stopColor="rgba(13, 110, 253, 0.02)" />
          </linearGradient>
        </defs>
        <path 
          d="M 0 90 L 50 85 L 100 92 L 150 78 L 200 87 L 250 72 C 275 67, 300 67, 325 72 L 350 90 L 400 78" 
          fill="url(#equityGradient)" 
          stroke="#0D6EFD" 
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="dashboard-card recent-backtest-chart">
      <div className="chart-content">
        <div className="strategy-info">
          <h4 className="strategy-name centered">{backtest.strategy_name}</h4>
          <div className="backtest-stats">
            <div className="stat-item">
              <span className="stat-label">Return</span>
              <span className={`stat-value return-value ${getReturnClass(backtest.return_pct)}`}>
                {formatReturn(backtest.return_pct)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Final Equity</span>
              <span className="stat-value">
                {formatCurrency(backtest.final_equity)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trades</span>
              <span className="stat-value">
                {backtest.trade_count}
              </span>
            </div>
          </div>
        </div>
        
        <div className="chart-container">
          {generateEquityCurve()}
        </div>
        
        <div className="backtest-footer">
          <span className="date-label">Run on:</span>
          <span className="date-value">{formatDate(backtest.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default RecentBacktestChart;
