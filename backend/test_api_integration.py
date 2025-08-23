#!/usr/bin/env python3
"""
Test script for API integration to ensure backtesting works end-to-end.
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add the api directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from backtester import run_backtest

def create_test_strategy():
    """Create a simple test strategy."""
    return {
        'conditions': [
            {
                'id': '1',
                'indicator': 'RSI',
                'operator': 'less_than',
                'value': '30',
                'period': 14
            }
        ],
        'logicalOperator': 'AND',
        'action': 'LONG',
        'entryCondition': {
            'positionSizing': 'fixed_percentage',
            'sizingValue': 5.0,
            'maxPositionSize': 10.0
        },
        'exitCondition': {
            'stopLoss': {
                'type': 'fixed_percentage',
                'value': 3.0
            },
            'takeProfit': {
                'type': 'fixed_percentage',
                'value': 6.0
            }
        }
    }

def create_test_data():
    """Create realistic test data."""
    # Generate 100 days of sample data
    dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
    
    # Create realistic price data with some volatility
    np.random.seed(42)  # For reproducible results
    base_price = 100.0
    returns = np.random.normal(0, 0.02, 100)  # 2% daily volatility
    prices = [base_price]
    
    for ret in returns[1:]:
        new_price = prices[-1] * (1 + ret)
        prices.append(new_price)
    
    # Create OHLCV data
    data = []
    for i, (date, close) in enumerate(zip(dates, prices)):
        # Generate realistic OHLC from close price
        volatility = close * 0.01  # 1% intraday volatility
        
        high = close + abs(np.random.normal(0, volatility))
        low = close - abs(np.random.normal(0, volatility))
        open_price = close + np.random.normal(0, volatility * 0.5)
        volume = np.random.randint(1000000, 10000000)
        
        data.append({
            'Date': date,
            'Open': open_price,
            'High': high,
            'Low': low,
            'Close': close,
            'Volume': volume
        })
    
    df = pd.DataFrame(data)
    df.set_index('Date', inplace=True)
    return df

def test_api_integration():
    """Test the complete API integration."""
    print("Testing API integration...")
    
    # Create test data and strategy
    data = create_test_data()
    strategy = create_test_strategy()
    
    print(f"Test data shape: {data.shape}")
    print(f"Strategy conditions: {len(strategy['conditions'])}")
    
    # Test different scenarios
    test_cases = [
        {'cash': 10000, 'leverage': 1.0, 'description': 'Standard 1x leverage'},
        {'cash': 10000, 'leverage': 2.0, 'description': '2x leverage'},
        {'cash': 50000, 'leverage': 1.0, 'description': 'Higher capital 1x leverage'},
        {'cash': 5000, 'leverage': 1.0, 'description': 'Lower capital 1x leverage'},
    ]
    
    for test_case in test_cases:
        print(f"\n--- {test_case['description']} ---")
        
        try:
            results = run_backtest(
                data, 
                strategy, 
                initial_cash=test_case['cash'], 
                leverage=test_case['leverage']
            )
            
            if 'error' in results:
                print(f"❌ Failed: {results['error']}")
                continue
            
            # Verify results structure
            required_keys = ['stats', 'plot_data', 'trades']
            missing_keys = [key for key in required_keys if key not in results]
            
            if missing_keys:
                print(f"❌ Missing required keys: {missing_keys}")
                continue
            
            # Verify stats
            stats = results['stats']
            required_stats = ['Start', 'End', 'Equity Final [$]', 'Return [%]', '# Trades']
            missing_stats = [stat for stat in required_stats if stat not in stats]
            
            if missing_stats:
                print(f"❌ Missing required stats: {missing_stats}")
                continue
            
            # Verify plot data
            plot_data = results['plot_data']
            if 'equity_curve' not in plot_data or 'dates' not in plot_data:
                print("❌ Missing equity curve data")
                continue
            
            # Verify trades
            trades = results['trades']
            if not isinstance(trades, list):
                print("❌ Trades should be a list")
                continue
            
            # Print results
            print(f"✅ Success!")
            print(f"   Final equity: {stats['Equity Final [$]']}")
            print(f"   Total return: {stats['Return [%]']}")
            print(f"   Number of trades: {stats['# Trades']}")
            print(f"   Equity curve points: {len(plot_data['equity_curve'])}")
            print(f"   Date range: {stats['Start']} to {stats['End']}")
            
            # Verify portfolio doesn't go to zero unexpectedly
            final_equity_str = stats['Equity Final [$]']
            if isinstance(final_equity_str, str):
                final_equity = float(final_equity_str.replace(',', '').replace('$', ''))
            else:
                final_equity = float(final_equity_str)
            
            if final_equity <= 0:
                print(f"⚠️  Warning: Final equity is {final_equity} (should be positive)")
            elif final_equity < test_case['cash'] * 0.5:
                print(f"⚠️  Warning: Final equity {final_equity} is less than 50% of initial capital {test_case['cash']}")
            
        except Exception as e:
            print(f"❌ Exception: {e}")
            import traceback
            traceback.print_exc()

def main():
    """Run the API integration test."""
    print("🚀 Testing API Integration")
    print("=" * 50)
    
    test_api_integration()
    
    print("\n" + "=" * 50)
    print("✅ API integration test completed!")

if __name__ == "__main__":
    main()
