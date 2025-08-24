#!/usr/bin/env python3
"""
Test script to verify position sizing is working correctly
"""

# Import the function we want to test
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'api'))

from backtester import calculate_position_size

def test_position_sizing():
    """Test position sizing with different configurations"""
    
    # Test case 1: 100% of portfolio, no maxPositionSize
    print("=== Test 1: 100% of portfolio, no maxPositionSize ===")
    entry_condition = {
        'positionSizing': 'fixed_percentage',
        'sizingValue': 100
    }
    portfolio_value = 10000
    current_price = 1.15
    
    result = calculate_position_size(entry_condition, portfolio_value, current_price)
    print(f"Expected: $10,000, Got: ${result:,.2f}")
    print(f"Success: {result == 10000}")
    print()
    
    # Test case 2: 100% of portfolio, maxPositionSize = 100
    print("=== Test 2: 100% of portfolio, maxPositionSize = 100 ===")
    entry_condition = {
        'positionSizing': 'fixed_percentage',
        'sizingValue': 100,
        'maxPositionSize': 100
    }
    
    result = calculate_position_size(entry_condition, portfolio_value, current_price)
    print(f"Expected: $10,000, Got: ${result:,.2f}")
    print(f"Success: {result == 10000}")
    print()
    
    # Test case 3: 100% of portfolio, maxPositionSize = 10 (should cap at 10%)
    print("=== Test 3: 100% of portfolio, maxPositionSize = 10 (should cap) ===")
    entry_condition = {
        'positionSizing': 'fixed_percentage',
        'sizingValue': 100,
        'maxPositionSize': 10
    }
    
    result = calculate_position_size(entry_condition, portfolio_value, current_price)
    print(f"Expected: $1,000 (capped), Got: ${result:,.2f}")
    print(f"Success: {result == 1000}")
    print()
    
    # Test case 4: 50% of portfolio, no maxPositionSize
    print("=== Test 4: 50% of portfolio, no maxPositionSize ===")
    entry_condition = {
        'positionSizing': 'fixed_percentage',
        'sizingValue': 50
    }
    
    result = calculate_position_size(entry_condition, portfolio_value, current_price)
    print(f"Expected: $5,000, Got: ${result:,.2f}")
    print(f"Success: {result == 5000}")
    print()

if __name__ == "__main__":
    test_position_sizing()
