// frontend/src/components/backtester/TickerSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import './TickerSelector.css';

interface TickerSelectorProps {
  value: string;
  onChange: (ticker: string) => void;
  placeholder?: string;
}

interface AvailableData {
  tickers: string[];
  ticker_data: { [key: string]: string[] };
}

const TickerSelector: React.FC<TickerSelectorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search tickers..." 
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

  // Filter tickers based on search
  const filteredTickers = availableData?.tickers.filter(ticker => 
    ticker.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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

  const getCategoryIcon = (ticker: string) => {
    if (ticker.includes('USD') && ticker.length > 3) {
      return '₿'; // Crypto
    } else if (ticker.includes('USD') || ticker.includes('JPY') || ticker.includes('EUR')) {
      return '💱'; // Forex
    } else {
      return '📈'; // Stocks
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
                          {getCategoryIcon(ticker)} {ticker.includes('USD') && ticker.length > 3 ? 'Crypto' : 
                           ticker.includes('USD') || ticker.includes('JPY') || ticker.includes('EUR') ? 'Forex' : 'Stock'}
                        </span>
                        <span className="ticker-timeframes">
                          {availableData?.ticker_data[ticker]?.join(', ') || 'No timeframes'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* All Available Tickers */}
          {!searchQuery && (
            <div className="category-display">
              <div className="category-section">
                <div className="category-header">
                  📊 Available Tickers ({availableData?.tickers.length || 0})
                </div>
                <div className="category-tickers">
                  {availableData?.tickers.map(ticker => (
                    <button
                      key={ticker}
                      className={`category-ticker ${value === ticker ? 'selected' : ''}`}
                      onClick={() => handleTickerSelect(ticker)}
                    >
                      <div className="ticker-symbol">{ticker}</div>
                      <div className="ticker-timeframes">
                        {availableData?.ticker_data[ticker]?.slice(0, 3).join(', ')}
                        {availableData?.ticker_data[ticker]?.length > 3 && '...'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TickerSelector; 