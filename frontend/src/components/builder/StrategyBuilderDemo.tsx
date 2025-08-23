// frontend/src/components/builder/StrategyBuilderDemo.tsx
import React from 'react';
import './StrategyBuilderDemo.css';

const StrategyBuilderDemo: React.FC = () => {
  return (
    <div className="strategy-builder-demo">
      <div className="demo-header">
        <h2>🚀 Enhanced Strategy Builder</h2>
        <p>Professional-grade trading strategy creation with advanced risk management</p>
      </div>

      <div className="demo-features">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Entry Conditions</h3>
          <p>Advanced position sizing with multiple strategies:</p>
          <ul>
            <li>Fixed percentage of portfolio</li>
            <li>Fixed dollar amounts</li>
            <li>Risk-based sizing (1-2% risk per trade)</li>
            <li>Kelly Criterion optimization</li>
            <li>Volatility-adjusted sizing</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Stop Loss Options</h3>
          <p>Comprehensive stop loss strategies:</p>
          <ul>
            <li>Fixed percentage stops</li>
            <li>Fixed dollar stops</li>
            <li>Trailing stops with activation</li>
            <li>ATR-based stops</li>
            <li>Support/resistance levels</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💰</div>
          <h3>Take Profit Options</h3>
          <p>Flexible profit-taking strategies:</p>
          <ul>
            <li>Fixed percentage targets</li>
            <li>Fixed dollar targets</li>
            <li>Risk:Reward ratios</li>
            <li>Indicator-based exits</li>
            <li>Multiple exit conditions</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Smart Interface</h3>
          <p>User-friendly design features:</p>
          <ul>
            <li>Preset configurations</li>
            <li>Tabbed navigation</li>
            <li>Real-time strategy display</li>
            <li>Custom configuration options</li>
            <li>Mobile responsive</li>
          </ul>
        </div>
      </div>

      <div className="demo-examples">
        <h3>Strategy Examples</h3>
        
        <div className="example-strategy">
          <h4>Conservative Strategy</h4>
          <div className="strategy-details">
            <div className="strategy-section">
              <strong>Entry:</strong> 2% portfolio per trade, max 10% position
            </div>
            <div className="strategy-section">
              <strong>Stop Loss:</strong> 5% fixed percentage
            </div>
            <div className="strategy-section">
              <strong>Take Profit:</strong> 1:2 risk:reward ratio
            </div>
          </div>
        </div>

        <div className="example-strategy">
          <h4>Aggressive Strategy</h4>
          <div className="strategy-details">
            <div className="strategy-section">
              <strong>Entry:</strong> 5% portfolio per trade, max 20% position
            </div>
            <div className="strategy-section">
              <strong>Stop Loss:</strong> 2x ATR-based stop
            </div>
            <div className="strategy-section">
              <strong>Take Profit:</strong> 10% fixed percentage
            </div>
          </div>
        </div>

        <div className="example-strategy">
          <h4>Risk-Managed Strategy</h4>
          <div className="strategy-details">
            <div className="strategy-section">
              <strong>Entry:</strong> 1% risk per trade, Kelly Criterion sizing
            </div>
            <div className="strategy-section">
              <strong>Stop Loss:</strong> 10% trailing stop (activates at 5% profit)
            </div>
            <div className="strategy-section">
              <strong>Take Profit:</strong> RSI > 70 exit condition
            </div>
          </div>
        </div>
      </div>

      <div className="demo-cta">
        <h3>Ready to Build Your Strategy?</h3>
        <p>Create professional trading strategies with advanced risk management tools</p>
        <button className="demo-button">Start Building</button>
      </div>
    </div>
  );
};

export default StrategyBuilderDemo;
