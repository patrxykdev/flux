import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import ReactECharts from 'echarts-for-react';
import TickerSelector from './TickerSelector';
import RecentBacktests from './RecentBacktests';
import './BacktestPage.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';

interface SavedStrategy { id: number; name: string; }
interface BacktestResults { 
  stats: any; 
  plot_data: any; 
  trades: Array<{
    Date: string;
    Type: string;
    Price: string;
    Portfolio: string;
    'P&L': string;
    Leverage: string;
    'Position Size': string;
    'Exit Reason': string;
  }>;
}

const BacktestPage: React.FC = () => {
  const [strategies, setStrategies] = useState<SavedStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [ticker, setTicker] = useState('EURUSD');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeframe, setTimeframe] = useState('1d');
  const [cash, setCash] = useState('10000');
  const [leverage, setLeverage] = useState('1');
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [error, setError] = useState('');
  const [showRecentBacktests, setShowRecentBacktests] = useState(false);
  const [userTimeframes, setUserTimeframes] = useState<string[]>(['4h', '1d']); // Default to free tier
  const [userTier, setUserTier] = useState<string>('free');
  const [userTickers, setUserTickers] = useState<string[]>(['EURUSD', 'AAPL']); // Default to free tier

  // Helper to parse and format dates for backend
  const parseDate = (date: string | Date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return format(date, 'yyyy-MM-dd');
  };

  useEffect(() => {
    api.get('/api/strategies/').then(res => {
      console.log('Raw response:', res);
      console.log('Response data:', res.data);
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      setStrategies(res.data);
    }).catch((err) => {
      console.error('Error loading strategies:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError('Could not load strategies.');
    });
  }, []);

  // Fetch user timeframes based on tier
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        // Fetch user timeframes
        const timeframesResponse = await api.get('/api/user-timeframes/');
        const { tier: timeframeTier, allowed_timeframes } = timeframesResponse.data;
        
        // Fetch user tickers
        const tickersResponse = await api.get('/api/user-tickers/');
        const { allowed_tickers } = tickersResponse.data;
        
        // Both should have the same tier
        const userTier = timeframeTier;
        setUserTier(userTier);
        setUserTimeframes(allowed_timeframes);
        setUserTickers(allowed_tickers);
        
        // Update timeframe if current selection is not allowed
        if (!allowed_timeframes.includes(timeframe)) {
          setTimeframe(allowed_timeframes[0] || '1d');
        }
        
        // Update ticker if current selection is not allowed
        if (allowed_tickers && !allowed_tickers.includes(ticker)) {
          setTicker(allowed_tickers[0] || 'EURUSD');
        }
      } catch (err) {
        console.error('Error fetching user permissions:', err);
        // Keep default permissions on error
      }
    };

    fetchUserPermissions();
  }, [timeframe, ticker]);

  const handleRunBacktest = async () => {
    if (!selectedStrategy) {
      setError('Please select a strategy.');
      return;
    }
    
    // Validate inputs
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol.');
      return;
    }
    
    const cashAmount = parseFloat(cash);
    if (isNaN(cashAmount) || cashAmount <= 0) {
      setError('Please enter a valid starting capital amount.');
      return;
    }
    
    const leverageAmount = parseFloat(leverage);
    if (isNaN(leverageAmount) || leverageAmount < 1 || leverageAmount > 10) {
      setError('Leverage must be between 1x and 10x.');
      return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResults(null);
    
    try {
      const response = await api.post('/api/backtest/', {
        strategy_id: selectedStrategy,
        ticker: ticker.trim().toUpperCase(),
        start_date: parseDate(startDate),
        end_date: parseDate(endDate),
        timeframe,
        cash: cashAmount,
        leverage: leverageAmount,
      });
      
      // Check if the response contains an error
      if (response.data.error) {
        setError(response.data.error);
        return;
      }
      
      setResults(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An unknown error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ECharts configuration object for the equity curve chart
  const getChartOptions = () => {
    if (!results) return {};
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: results.plot_data.dates },
      yAxis: { type: 'value', scale: true, axisLabel: { formatter: '${value}' } },
      series: [{
          name: 'Portfolio Value',
          type: 'line',
          data: results.plot_data.equity_curve,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#0D6EFD', width: 2 },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(13, 110, 253, 0.3)' }, { offset: 1, color: 'rgba(13, 110, 253, 0)' }]
            }
          }
      }]
    };
  };

  const calculateWinRate = (trades: Array<{ Type: string; 'P&L': string }> | undefined) => {
    if (!trades || trades.length === 0) return 0;

    let winningTrades = 0;
    let totalCompletedTrades = 0;

    trades.forEach(trade => {
      // Only count exit trades (completed trades)
      if (trade.Type.includes('EXIT') || trade.Type.includes('MARGIN CALL')) {
        totalCompletedTrades++;
        
        // Check if P&L is positive (winning trade)
        if (trade['P&L'] && trade['P&L'] !== '—') {
          // Extract the dollar amount from P&L string (e.g., "+$150.00 (+15.0%)")
          const pnlMatch = trade['P&L'].match(/^([+-])\$([\d,]+\.?\d*)/);
          if (pnlMatch) {
            const sign = pnlMatch[1];
            const amount = parseFloat(pnlMatch[2].replace(/,/g, ''));
            
            // A trade is a win if it has a positive dollar amount
            if (sign === '+' && amount > 0) {
              winningTrades++;
            }
          }
        }
      }
    });

    return totalCompletedTrades > 0 ? Math.round((winningTrades / totalCompletedTrades) * 100) : 0;
  };

  return (
    <div className="backtest-wrapper">
      <header className="backtest-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-to-dashboard-button">← Back to Dashboard</Link>
        </div>
        <div className="header-right">
          <button 
            onClick={() => setShowRecentBacktests(true)} 
            className="recent-backtests-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"></path>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
            </svg>
            Recent Backtests
          </button>
        </div>
      </header>
      <main className="backtest-content">
        <div className="page-header">
          <h1>Backtest Strategy</h1>
          <p className="page-subtitle">Test your trading strategy against historical data to validate performance</p>
        </div>
        
        <div className="backtest-setup-container">
          <div className="setup-card">
            <div className="setup-header">
              <div className="setup-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div className="setup-title">
                <h2>Strategy Configuration</h2>
                <p>Configure your trading strategy parameters and market settings</p>
              </div>
            </div>

            <div className="setup-form">
              <div className="form-section">
                <h3>Strategy & Market</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="strategy-select">Strategy</label>
                    <select 
                      id="strategy-select"
                      value={selectedStrategy} 
                      onChange={(e) => {
                        console.log('Strategy selected:', e.target.value);
                        setSelectedStrategy(e.target.value);
                      }}
                      className="form-select"
                    >
                      <option value="" disabled>Choose a strategy...</option>
                      {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="ticker-select">
                      Ticker 
                      <span className="tier-indicator">({userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier)</span>
                    </label>
                    <TickerSelector 
                      value={ticker} 
                      onChange={setTicker}
                      placeholder="Search tickers..."
                      userTickers={userTickers}
                    />
                    {userTier === 'free' && (
                      <div className="tier-upgrade-hint">
                        💡 Free tier limited to EURUSD and AAPL. Upgrade to Pro or Premium for access to all tickers
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="timeframe-select">
                      Timeframe 
                      <span className="tier-indicator">({userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier)</span>
                    </label>
                    <select 
                      id="timeframe-select"
                      value={timeframe} 
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="form-select"
                    >
                      {userTimeframes.includes('1m') && <option value="1m">1 Minute</option>}
                      {userTimeframes.includes('5m') && <option value="5m">5 Minute</option>}
                      {userTimeframes.includes('15m') && <option value="15m">15 Minute</option>}
                      {userTimeframes.includes('30m') && <option value="30m">30 Minute</option>}
                      {userTimeframes.includes('1h') && <option value="1h">1 Hour</option>}
                      {userTimeframes.includes('4h') && <option value="4h">4 Hour</option>}
                      {userTimeframes.includes('1d') && <option value="1d">1 Day</option>}
                    </select>
                    {userTier === 'free' && (
                      <div className="tier-upgrade-hint">
                        💡 Upgrade to Pro for access to 15m+ timeframes, or Premium for 1m+ timeframes
                      </div>
                    )}
                    {userTier === 'pro' && (
                      <div className="tier-upgrade-hint">
                        💡 Upgrade to Premium for access to 1m and 5m timeframes
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Date Range</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="start-date">Start Date</label>
                    <DatePicker
                      id="start-date"
                      selected={startDate ? parseISO(startDate) : null}
                      onChange={date => {
                        if (!date) return;
                        const formatted = format(date, 'yyyy-MM-dd');
                        setStartDate(formatted);
                      }}
                      maxDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                      showPopperArrow={false}
                      className="form-datepicker"
                      calendarClassName="custom-calendar"
                      placeholderText="Select start date"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="end-date">End Date</label>
                    <DatePicker
                      id="end-date"
                      selected={endDate ? parseISO(endDate) : null}
                      onChange={date => {
                        if (!date) return;
                        const formatted = format(date, 'yyyy-MM-dd');
                        if (date > new Date()) {
                          setEndDate(format(new Date(), 'yyyy-MM-dd'));
                        } else {
                          setEndDate(formatted);
                        }
                      }}
                      maxDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                      showPopperArrow={false}
                      className="form-datepicker"
                      calendarClassName="custom-calendar"
                      placeholderText="Select end date"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Capital & Risk</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="capital-input">Starting Capital</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">$</span>
                      <input 
                        id="capital-input"
                        type="number" 
                        value={cash} 
                        onChange={(e) => setCash(e.target.value)} 
                        placeholder="10,000"
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="leverage-select">Leverage</label>
                    <select 
                      id="leverage-select"
                      value={leverage} 
                      onChange={(e) => setLeverage(e.target.value)}
                      className="form-select"
                    >
                      <option value="1">1x (No Leverage)</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="5">5x</option>
                      <option value="10">10x</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  onClick={handleRunBacktest} 
                  disabled={isLoading || !selectedStrategy} 
                  className="run-backtest-button"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Running Backtest...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 3l14 9-14 9V3z"/>
                      </svg>
                      Run Backtest
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <div className="error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div className="error-content">
              <h4>Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h3>Running Backtest</h3>
              <p>Please wait while we analyze your strategy...</p>
            </div>
          </div>
        )}

        {results && (
          <div className="results-container">
            <h2>Backtest Results</h2>
            
            {/* Enhanced Backtest Summary */}
            <div className="enhanced-summary-grid">
              <div className="summary-card primary">
                <div className="summary-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                </div>
                <div className="summary-content">
                  <h3>Total P&L</h3>
                  <div className={`summary-value ${parseFloat(results.stats['Return [%]']) >= 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(results.stats['Return [%]']) >= 0 ? '+' : ''}{results.stats['Return [%]']}%
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                </div>
                <div className="summary-content">
                  <h3>Final Equity</h3>
                  <div className="summary-value">
                    {results.stats['Equity Final [$]']}
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                </div>
                <div className="summary-content">
                  <h3>Total Trades</h3>
                  <div className="summary-value">
                    {results.stats['# Trades']}
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="summary-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                  </svg>
                </div>
                <div className="summary-content">
                  <h3>Win Rate</h3>
                  <div className="summary-value">
                    {calculateWinRate(results.trades)}%
                  </div>
                </div>
              </div>
            </div>

            <h3>Equity Curve</h3>
            <div className="chart-container">
              <ReactECharts option={getChartOptions()} style={{ height: '400px', width: '100%' }} notMerge={true} lazyUpdate={true} />
            </div>

            {/* Enhanced Trades Table */}
            {results.trades && results.trades.length > 0 && (
              <div className="trades-section">
                <h3>Trade History</h3>
                <div className="trades-table-container">
                  <table className="trades-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Position Size</th>
                        <th>Leverage</th>
                        <th>Portfolio Value</th>
                        <th>P&L</th>
                        <th>Exit Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.trades.map((trade, index) => {
                        // Determine exit reason based on trade type
                        let exitReason = '';
                        if (trade.Type === 'LONG' || trade.Type === 'SHORT') {
                          exitReason = 'Signal Entry';
                        } else if (trade.Type.includes('EXIT')) {
                          // Check if it's a stop loss or take profit exit
                          if (trade.Type.includes('MARGIN CALL')) {
                            exitReason = 'Margin Call';
                          } else {
                            exitReason = trade['Exit Reason'] || 'Signal Exit';
                          }
                        }
                        
                        // Determine trade type styling
                        const isEntry = trade.Type === 'LONG' || trade.Type === 'SHORT';
                        const isExit = trade.Type.includes('EXIT');
                        
                        return (
                          <tr key={index} className={`trade-row ${isEntry ? 'entry' : isExit ? 'exit' : 'margin-call'}`}>
                            <td className="trade-date">{trade.Date}</td>
                            <td className="trade-type">
                              <span className={`trade-type-badge ${isEntry ? 'entry' : isExit ? 'exit' : 'margin-call'}`}>
                                {trade.Type}
                              </span>
                            </td>
                            <td className="trade-price">${trade.Price}</td>
                            <td className="trade-size">{trade['Position Size']}</td>
                            <td className="trade-leverage">{trade.Leverage}</td>
                            <td className="trade-portfolio">{trade.Portfolio}</td>
                            <td className={`trade-pnl ${trade['P&L'] !== '—' ? (trade['P&L'].includes('+') ? 'positive' : 'negative') : ''}`}>
                              {trade['P&L']}
                            </td>
                            <td className="trade-reason">
                              <span className="exit-reason-badge">
                                {exitReason}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      {showRecentBacktests && <RecentBacktests isOpen={showRecentBacktests} onClose={() => setShowRecentBacktests(false)} />}
    </div>
  );
};

export default BacktestPage;