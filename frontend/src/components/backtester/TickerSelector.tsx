// frontend/src/components/backtester/TickerSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import './TickerSelector.css';

interface TickerSelectorProps {
  value: string;
  onChange: (ticker: string) => void;
  placeholder?: string;
  userTickers?: string[]; // Add prop for user's allowed tickers
}

interface AvailableData {
  tickers: string[];
  ticker_data: { [key: string]: string[] };
}

interface CategorizedTickers {
  forex: string[];
  crypto: string[];
  stocks: string[];
}

const TickerSelector: React.FC<TickerSelectorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search tickers...",
  userTickers
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableData, setAvailableData] = useState<AvailableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available tickers and timeframes
  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/available-data/');
        setAvailableData(response.data);
        setError('');
      } catch (err: any) {
        console.error('Error fetching available data:', err);
        setError('Failed to load available tickers');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableData();
  }, []);

  // Categorize tickers by type
  const categorizeTickers = (tickers: string[]): CategorizedTickers => {
    const categorized: CategorizedTickers = {
      forex: [],
      crypto: [],
      stocks: []
    };

    tickers.forEach(ticker => {
      if (ticker.includes('USDT') || ticker.includes('BTC') || ticker.includes('ETH')) {
        categorized.crypto.push(ticker);
      } else if (ticker.includes('USD') || ticker.includes('JPY') || ticker.includes('EUR') || ticker.includes('GBP') || ticker.includes('CHF') || ticker.includes('CAD') || ticker.includes('AUD') || ticker.includes('NZD')) {
        categorized.forex.push(ticker);
      } else {
        categorized.stocks.push(ticker);
      }
    });

    return categorized;
  };

  // Get categorized tickers respecting user permissions
  const getCategorizedTickers = () => {
    let availableTickers = availableData?.tickers || [];
    
    // Apply user ticker restrictions if provided
    if (userTickers) {
      availableTickers = availableTickers.filter(ticker => userTickers.includes(ticker));
    }
    
    return categorizeTickers(availableTickers);
  };

  // Filter tickers based on search and user permissions
  const getFilteredTickers = () => {
    let availableTickers = availableData?.tickers || [];
    
    // Apply user ticker restrictions if provided
    if (userTickers) {
      availableTickers = availableTickers.filter(ticker => userTickers.includes(ticker));
    }
    
    // Apply search filter
    return availableTickers.filter(ticker => 
      ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredTickers = getFilteredTickers();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTickerSelect = (ticker: string) => {
    onChange(ticker);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const getCategoryLabel = (ticker: string): string => {
    if (ticker.includes('USDT') || ticker.includes('BTC') || ticker.includes('ETH')) {
      return 'Crypto';
    } else if (ticker.includes('USD') || ticker.includes('JPY') || ticker.includes('EUR') || ticker.includes('GBP') || ticker.includes('CHF') || ticker.includes('CAD') || ticker.includes('AUD') || ticker.includes('NZD')) {
      return 'Forex';
    } else {
      return 'Stock';
    }
  };

  if (loading) {
    return (
      <div className="ticker-selector">
        <div className="ticker-input-container">
          <input
            type="text"
            value={value || ''}
            placeholder="Loading tickers..."
            className="ticker-input"
            disabled
          />
          <button className="ticker-dropdown-button" disabled>
            ▼
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticker-selector">
        <div className="ticker-input-container">
          <input
            type="text"
            value={value || ''}
            placeholder="Error loading tickers"
            className="ticker-input"
            disabled
          />
          <button className="ticker-dropdown-button" disabled>
            ▼
          </button>
        </div>
      </div>
    );
  }

  const categorizedTickers = getCategorizedTickers();

  return (
    <div className="ticker-selector" ref={dropdownRef}>
      <div className="ticker-input-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={value || placeholder}
          className="ticker-input"
        />
        <button 
          type="button"
          className="ticker-dropdown-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </button>
      </div>

      {isOpen && (
        <div className="ticker-dropdown">
          {/* Search Results */}
          {searchQuery && (
            <div className="ticker-results">
              <div className="results-header">Search Results</div>
              {filteredTickers.length === 0 ? (
                <div className="no-results">
                  No tickers found for "{searchQuery}"
                </div>
              ) : (
                filteredTickers.map(ticker => (
                  <div
                    key={ticker}
                    className={`ticker-option ${value === ticker ? 'selected' : ''}`}
                    onClick={() => handleTickerSelect(ticker)}
                  >
                    <div className="ticker-symbol">{ticker}</div>
                    <div className="ticker-info">
                      <div className="ticker-details">
                        <span className="ticker-category">
                          {getCategoryLabel(ticker)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* All Available Tickers by Category */}
          {!searchQuery && (
            <div className="category-display">
              {/* Forex Section */}
              {categorizedTickers.forex.length > 0 && (
                <div className="category-section">
                  <div className="category-header">
                    Forex ({categorizedTickers.forex.length})
                  </div>
                  <div className="category-tickers">
                    {categorizedTickers.forex.map(ticker => (
                      <button
                        key={ticker}
                        className={`category-ticker ${value === ticker ? 'selected' : ''}`}
                        onClick={() => handleTickerSelect(ticker)}
                      >
                        <div className="ticker-symbol">{ticker}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Crypto Section */}
              {categorizedTickers.crypto.length > 0 && (
                <div className="category-section">
                  <div className="category-header">
                    Crypto ({categorizedTickers.crypto.length})
                  </div>
                  <div className="category-tickers">
                    {categorizedTickers.crypto.map(ticker => (
                      <button
                        key={ticker}
                        className={`category-ticker ${value === ticker ? 'selected' : ''}`}
                        onClick={() => handleTickerSelect(ticker)}
                      >
                        <div className="ticker-symbol">{ticker}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stocks Section */}
              {categorizedTickers.stocks.length > 0 && (
                <div className="category-section">
                  <div className="category-header">
                    Stocks ({categorizedTickers.stocks.length})
                  </div>
                  <div className="category-tickers">
                    {categorizedTickers.stocks.map(ticker => (
                      <button
                        key={ticker}
                        className={`category-ticker ${value === ticker ? 'selected' : ''}`}
                        onClick={() => handleTickerSelect(ticker)}
                      >
                        <div className="ticker-symbol">{ticker}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TickerSelector; 