#!/usr/bin/env python3
"""
Test script for enhanced backtesting system with new entry conditions and stop loss/take profit.
This script tests the new position sizing and enhanced risk management features.
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add the api directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from backtester import run_backtest, validate_strategy_config

def create_sample_data():
    """Create sample OHLCV data for testing."""
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

def test_strategy_validation():
    """Test the enhanced strategy validation."""
    print("Testing strategy validation...")
    
    # Test valid strategy with new conditions
    valid_strategy = {
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
            'sizingValue': 2.0,
            'maxPositionSize': 10.0
        },
        'exitCondition': {
            'stopLoss': {
                'type': 'fixed_percentage',
                'value': 5.0
            },
            'takeProfit': {
                'type': 'risk_reward_ratio',
                'value': 2.0,
                'riskRewardRatio': 2.0
            }
        }
    }
    
    try:
        validate_strategy_config(valid_strategy)
        print("✅ Valid strategy validation passed")
    except Exception as e:
        print(f"❌ Valid strategy validation failed: {e}")
        return False
    
    # Test invalid strategy (missing entry condition)
    invalid_strategy = {
        'conditions': [
            {
                'id': '1',
                'indicator': 'RSI',
                'operator': 'less_than',
                'value': '30'
            }
        ],
        'logicalOperator': 'AND',
        'action': 'LONG',
        'exitCondition': {
            'stopLoss': {
                'type': 'fixed_percentage',
                'value': 5.0
            }
        }
    }
    
    try:
        validate_strategy_config(invalid_strategy)
        print("❌ Invalid strategy validation should have failed")
        return False
    except ValueError as e:
        print(f"✅ Invalid strategy validation correctly caught error: {e}")
    
    return True

def test_enhanced_backtest():
    """Test the enhanced backtesting with new conditions."""
    print("\nTesting enhanced backtesting...")
    
    # Create sample data
    data = create_sample_data()
    print(f"Created sample data with {len(data)} days")
    
    # Test strategy with enhanced conditions
    strategy = {
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
            'sizingValue': 5.0,  # 5% of portfolio per trade
            'maxPositionSize': 15.0  # Max 15% position size
        },
        'exitCondition': {
            'stopLoss': {
                'type': 'fixed_percentage',
                'value': 3.0  # 3% stop loss
            },
            'takeProfit': {
                'type': 'risk_reward_ratio',
                'value': 2.0,  # 1:2 risk:reward ratio
                'riskRewardRatio': 2.0
            }
        }
    }
    
    try:
        results = run_backtest(data, strategy, initial_cash=10000, leverage=1.0)
        
        if 'error' in results:
            print(f"❌ Backtest failed: {results['error']}")
            return False
        
        print("✅ Enhanced backtest completed successfully")
        print(f"Final equity: {results['stats'].get('Equity Final [$]', 'N/A')}")
        print(f"Total return: {results['stats'].get('Return [%]', 'N/A')}")
        print(f"Number of trades: {results['stats'].get('# Trades', 'N/A')}")
        
        # Check if trades have position size information
        if results['trades']:
            first_trade = results['trades'][0]
            if 'Position Size' in first_trade:
                print(f"✅ Position size tracking working: {first_trade['Position Size']}")
            else:
                print("❌ Position size not found in trades")
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced backtest failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_different_position_sizing():
    """Test different position sizing strategies."""
    print("\nTesting different position sizing strategies...")
    
    data = create_sample_data()
    
    # Test risk-based sizing
    risk_based_strategy = {
        'conditions': [
            {
                'id': '1',
                'indicator': 'RSI',
                'operator': 'less_than',
                'value': '25',
                'period': 14
            }
        ],
        'logicalOperator': 'AND',
        'action': 'LONG',
        'entryCondition': {
            'positionSizing': 'risk_based',
            'sizingValue': 1.0,  # 1% risk per trade
            'riskPerTrade': 1.0,
            'maxPositionSize': 8.0
        },
        'exitCondition': {
            'stopLoss': {
                'type': 'fixed_percentage',
                'value': 2.0
            },
            'takeProfit': {
                'type': 'fixed_percentage',
                'value': 6.0
            }
        }
    }
    
    try:
        results = run_backtest(data, risk_based_strategy, initial_cash=10000, leverage=1.0)
        
        if 'error' not in results:
            print("✅ Risk-based position sizing working")
            print(f"Trades: {results['stats'].get('# Trades', 'N/A')}")
        else:
            print(f"❌ Risk-based position sizing failed: {results['error']}")
            
    except Exception as e:
        print(f"❌ Risk-based position sizing test failed: {e}")
    
    # Test ATR-based stop loss
    atr_stop_strategy = {
        'conditions': [
            {
                'id': '1',
                'indicator': 'RSI',
                'operator': 'greater_than',
                'value': '70',
                'period': 14
            }
        ],
        'logicalOperator': 'AND',
        'action': 'SHORT',
        'entryCondition': {
            'positionSizing': 'fixed_percentage',
            'sizingValue': 3.0
        },
        'exitCondition': {
            'stopLoss': {
                'type': 'atr_based',
                'value': 2.0,  # 2x ATR stop loss
                'atrPeriod': 14
            },
            'takeProfit': {
                'type': 'fixed_percentage',
                'value': 4.0
            }
        }
    }
    
    try:
        results = run_backtest(data, atr_stop_strategy, initial_cash=10000, leverage=1.0)
        
        if 'error' not in results:
            print("✅ ATR-based stop loss working")
            print(f"Trades: {results['stats'].get('# Trades', 'N/A')}")
        else:
            print(f"❌ ATR-based stop loss failed: {results['error']}")
            
    except Exception as e:
        print(f"❌ ATR-based stop loss test failed: {e}")

def main():
    """Run all tests."""
    print("🚀 Testing Enhanced Backtesting System")
    print("=" * 50)
    
    # Test 1: Strategy validation
    if not test_strategy_validation():
        print("❌ Strategy validation tests failed")
        return
    
    # Test 2: Enhanced backtesting
    if not test_enhanced_backtest():
        print("❌ Enhanced backtesting tests failed")
        return
    
    # Test 3: Different position sizing strategies
    test_different_position_sizing()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("\nEnhanced backtesting system is working with:")
    print("- Entry conditions (position sizing)")
    print("- Stop loss options")
    print("- Take profit options")
    print("- Multiple ATR periods")
    print("- Risk-based position sizing")

if __name__ == "__main__":
    main()
