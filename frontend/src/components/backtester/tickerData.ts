// frontend/src/components/backtester/tickerData.ts

export interface TickerOption {
  symbol: string;
  name: string;
  category: string;
  currentPrice: string; // Current market price
  description?: string;
}

export const tickerOptions: TickerOption[] = [
  // Top 5 Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', currentPrice: '$185.64', description: 'Consumer electronics and software' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Stocks', currentPrice: '$248.50', description: 'Electric vehicles and clean energy' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Stocks', currentPrice: '$468.25', description: 'S&P 500 index fund' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Stocks', currentPrice: '$142.80', description: 'Semiconductor manufacturing' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Stocks', currentPrice: '$875.28', description: 'Graphics processing and AI' },

  // Top 5 Forex Pairs
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex', currentPrice: '1.0895', description: 'Most traded currency pair' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Forex', currentPrice: '148.25', description: 'Major currency pair' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'Forex', currentPrice: '1.2650', description: 'Cable currency pair' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'Forex', currentPrice: '0.8645', description: 'Safe haven currency pair' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'Forex', currentPrice: '0.6580', description: 'Commodity currency pair' },

  // Top 3 Cryptocurrencies
  { symbol: 'BTCUSD', name: 'Bitcoin', category: 'Crypto', currentPrice: '$43,250', description: 'Digital gold, first cryptocurrency' },
  { symbol: 'ETHUSD', name: 'Ethereum', category: 'Crypto', currentPrice: '$2,680', description: 'Smart contract platform' },
  { symbol: 'SOLUSD', name: 'Solana', category: 'Crypto', currentPrice: '$98.45', description: 'High-performance blockchain' },
];

export const categories = [
  'Stocks',
  'Forex', 
  'Crypto'
];

export const getTickersByCategory = (category: string) => {
  return tickerOptions.filter(ticker => ticker.category === category);
};

export const searchTickers = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return tickerOptions.filter(ticker => 
    ticker.symbol.toLowerCase().includes(lowerQuery) ||
    ticker.name.toLowerCase().includes(lowerQuery) ||
    ticker.description?.toLowerCase().includes(lowerQuery)
  );
}; 