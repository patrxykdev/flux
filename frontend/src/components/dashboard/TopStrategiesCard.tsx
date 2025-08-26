import React from 'react';
import './TopStrategiesCard.css';

interface TopStrategy {
  name: string;
  total_return: number;
  backtest_count: number;
  win_count: number;
  avg_return: number;
  win_rate: number;
}

interface TopStrategiesCardProps {
  strategies: TopStrategy[];
}

const TopStrategiesCard: React.FC<TopStrategiesCardProps> = ({ strategies }) => {
  if (strategies.length === 0) {
    return (
      <div className="dashboard-card top-strategies-card">
        <div className="card-header">
          <h3>Top Strategies</h3>
        </div>
        <div className="empty-state">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <p>No strategies yet</p>
          <p className="empty-subtitle">Create and run strategies to see performance here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card top-strategies-card">
      <div className="card-header">
        <h3>Top Strategies</h3>
        <span className="strategy-count">{strategies.length} strategies</span>
      </div>
      <div className="strategies-list">
        {strategies.map((strategy, index) => (
          <div key={strategy.name} className="strategy-item">
            <div className="strategy-rank">
              <span className="rank-number">
                #{index + 1}
              </span>
            </div>
            <div className="strategy-info">
              <h4 className="strategy-name">{strategy.name}</h4>
              <div className="strategy-meta">
                <span className="backtest-count">
                  {strategy.backtest_count} backtest{strategy.backtest_count !== 1 ? 's' : ''}
                </span>
                <span className="win-rate">
                  {strategy.win_rate.toFixed(1)}% win rate
                </span>
              </div>
            </div>
            <div className="strategy-performance">
              <div className="total-return">
                <span className={`return-value ${strategy.total_return >= 0 ? 'profit' : 'loss'}`}>
                  {strategy.total_return >= 0 ? '+' : ''}{strategy.total_return.toFixed(2)}%
                </span>
                <span className="return-label">Total</span>
              </div>
              <div className="avg-return">
                <span className={`return-value ${strategy.avg_return >= 0 ? 'profit' : 'loss'}`}>
                  {strategy.avg_return >= 0 ? '+' : ''}{strategy.avg_return.toFixed(2)}%
                </span>
                <span className="return-label">Avg</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStrategiesCard;
