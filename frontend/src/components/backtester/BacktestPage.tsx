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
        <h1>Backtest a Strategy</h1>
        
        <div className="backtest-setup-card">
          <div className="setup-row">
            <div className="setup-group">
              <label>Strategy</label>
              <select value={selectedStrategy} onChange={(e) => {
                console.log('Strategy selected:', e.target.value);
                setSelectedStrategy(e.target.value);
              }}>
                <option value="" disabled>Select a strategy...</option>
                {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="setup-group">
              <label>Ticker</label>
              <TickerSelector 
                value={ticker} 
                onChange={setTicker}
                placeholder="Search tickers..."
              />
            </div>
            
            <div className="setup-group">
              <label>Timeframe</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="5m">5 Minute</option>
                <option value="15m">15 Minute</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
              </select>
            </div>
          </div>
          
          <div className="setup-row">
            <div className="setup-group">
              <label>Start Date</label>
              <DatePicker
                selected={startDate ? parseISO(startDate) : null}
                onChange={date => {
                  if (!date) return;
                  const formatted = format(date, 'yyyy-MM-dd');
                  setStartDate(formatted);
                }}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
                showPopperArrow={false}
                className="custom-datepicker"
                calendarClassName="custom-calendar"
              />
            </div>
            
            <div className="setup-group">
              <label>End Date</label>
              <DatePicker
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
                className="custom-datepicker"
                calendarClassName="custom-calendar"
              />
            </div>
            
            <div className="setup-group">
              <label>Starting Capital</label>
              <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="$10,000" />
            </div>
            
            <div className="setup-group">
              <label>Leverage</label>
              <select value={leverage} onChange={(e) => setLeverage(e.target.value)}>
                <option value="1">1x (No Leverage)</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="5">5x</option>
                <option value="10">10x</option>
              </select>
            </div>
            
            <div className="setup-group">
              <label>&nbsp;</label>
              <button onClick={handleRunBacktest} disabled={isLoading} className="run-backtest-btn">
                {isLoading ? 'Running...' : 'Run Backtest'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading && <div className="loading-spinner"></div>}

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