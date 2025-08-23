// frontend/src/components/backtester/TickerSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { tickerOptions, categories, searchTickers } from './tickerData';
import type { TickerOption } from './tickerData';
import './TickerSelector.css';

interface TickerSelectorProps {
  value: string;
  onChange: (ticker: string) => void;
  placeholder?: string;
}

const TickerSelector: React.FC<TickerSelectorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search tickers..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter tickers based on search
  const filteredTickers = searchTickers(searchQuery);

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

  const handleTickerSelect = (ticker: TickerOption) => {
    onChange(ticker.symbol);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Stocks':
        return '📈';
      case 'Forex':
        return '💱';
      case 'Crypto':
        return '₿';
      default:
        return '📊';
    }
  };

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
                    key={ticker.symbol}
                    className={`ticker-option ${value === ticker.symbol ? 'selected' : ''}`}
                    onClick={() => handleTickerSelect(ticker)}
                  >
                    <div className="ticker-symbol">{ticker.symbol}</div>
                    <div className="ticker-info">
                      <div className="ticker-name">{ticker.name}</div>
                      <div className="ticker-details">
                        <span className="ticker-category">{getCategoryIcon(ticker.category)} {ticker.category}</span>
                        <span className="ticker-price">{ticker.currentPrice}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Category-based Display */}
          {!searchQuery && (
            <div className="category-display">
              {categories.map(category => {
                const categoryTickers = tickerOptions.filter(t => t.category === category);
                return (
                  <div key={category} className="category-section">
                    <div className="category-header">
                      {getCategoryIcon(category)} {category}
                    </div>
                    <div className="category-tickers">
                      {categoryTickers.map(ticker => (
                        <button
                          key={ticker.symbol}
                          className={`category-ticker ${value === ticker.symbol ? 'selected' : ''}`}
                          onClick={() => handleTickerSelect(ticker)}
                        >
                          <div className="ticker-symbol">{ticker.symbol}</div>
                          <div className="ticker-price">{ticker.currentPrice}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TickerSelector; 