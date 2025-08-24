import os
import pandas as pd
from datetime import datetime
import glob

def load_csv_data(ticker: str, start_date: str, end_date: str, timeframe: str) -> tuple:
    """
    Load CSV data from local files instead of external APIs.
    
    Args:
        ticker: Ticker symbol (e.g., 'EURUSD')
        start_date: Start date in 'YYYY-MM-DD' format
        end_date: End date in 'YYYY-MM-DD' format
        timeframe: Timeframe ('1m', '5m', '15m', '30m', '1h', '4h', '1d')
    
    Returns:
        tuple: (dataframe, data_range_info)
    """
    
    # Map frontend timeframes to directory names
    timeframe_map = {
        '1m': '1m',
        '5m': '5m', 
        '15m': '15m',
        '30m': '30m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d'
    }
    
    if timeframe not in timeframe_map:
        raise ValueError(f"Unsupported timeframe: {timeframe}. Supported: {list(timeframe_map.keys())}")
    
    # Construct path to CSV files - use absolute path from project root
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_dir = os.path.join(project_root, 'data', 'csv', ticker.lower(), timeframe_map[timeframe])
    
    if not os.path.exists(csv_dir):
        raise ValueError(f"CSV directory not found: {csv_dir}")
    
    # Find CSV files in the directory
    csv_files = glob.glob(os.path.join(csv_dir, '*.csv'))
    
    if not csv_files:
        raise ValueError(f"No CSV files found in {csv_dir}")
    
    # Load and combine all CSV files
    all_data = []
    
    for csv_file in csv_files:
        try:
            # Read CSV with tab separator and no header
            df = pd.read_csv(csv_file, sep='\t', header=None, 
                           names=['Date', 'Open', 'High', 'Low', 'Close', 'Volume'])
            
            # Convert date column to datetime
            df['Date'] = pd.to_datetime(df['Date'])
            
            # Set date as index
            df.set_index('Date', inplace=True)
            
            all_data.append(df)
            
        except Exception as e:
            print(f"Warning: Could not read {csv_file}: {e}")
            continue
    
    if not all_data:
        raise ValueError(f"Could not read any CSV files from {csv_dir}")
    
    # Combine all data
    data = pd.concat(all_data, axis=0)
    
    # Remove duplicates and sort by date
    data = data.sort_index().drop_duplicates()
    
    # Filter by date range
    start_dt = pd.to_datetime(start_date)
    end_dt = pd.to_datetime(end_date)
    
    data = data[(data.index >= start_dt) & (data.index <= end_dt)]
    
    if data.empty:
        raise ValueError(f"No data found for {ticker} in the specified date range")
    
    # Ensure we have all required columns
    required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
    missing_columns = [col for col in required_columns if col not in data.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    
    # Validate data quality
    if len(data) < 30:
        raise ValueError(f"Insufficient data for {ticker}. Need at least 30 data points, got {len(data)}.")
    
    # Add data range info
    data_range_info = {
        'requested_start': start_date,
        'requested_end': end_date,
        'actual_start': data.index.min().strftime('%Y-%m-%d'),
        'actual_end': data.index.max().strftime('%Y-%m-%d'),
        'data_points': len(data),
        'source': 'csv_local'
    }
    
    return data, data_range_info

def get_available_tickers() -> list:
    """Get list of available tickers from the data directory."""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(project_root, 'data', 'csv')
    if not os.path.exists(data_dir):
        return []
    
    tickers = []
    for item in os.listdir(data_dir):
        if os.path.isdir(os.path.join(data_dir, item)):
            tickers.append(item.upper())
    
    return tickers

def get_available_timeframes(ticker: str) -> list:
    """Get list of available timeframes for a specific ticker."""
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ticker_dir = os.path.join(project_root, 'data', 'csv', ticker.lower())
    if not os.path.exists(ticker_dir):
        return []
    
    timeframes = []
    for item in os.listdir(ticker_dir):
        if os.path.isdir(os.path.join(ticker_dir, item)):
            timeframes.append(item)
    
    return timeframes
