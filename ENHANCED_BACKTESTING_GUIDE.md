# Enhanced Backtesting System Guide

## Overview

The backtesting system has been completely enhanced to support the new strategy builder features, including advanced position sizing (entry conditions) and comprehensive stop loss/take profit management (risk management).

## New Features

### 1. Entry Conditions (Position Sizing)

The system now calculates position sizes based on sophisticated entry conditions:

#### Position Sizing Types:

- **Fixed Percentage**: Uses a fixed percentage of portfolio per trade
- **Fixed Dollar Amount**: Uses a fixed dollar amount per trade
- **Risk-Based Sizing**: Risks a specific percentage of portfolio per trade
- **Kelly Criterion**: Dynamic sizing based on win rate and odds
- **Volatility-Based**: Adjusts position size based on market volatility (ATR)

#### Implementation Details:

```python
def calculate_position_size(entry_condition: dict, current_portfolio_value: float,
                            current_price: float, atr_value: float = None) -> float:
    """Calculate position size based on entry conditions."""
    sizing_type = entry_condition.get('positionSizing', 'fixed_percentage')
    sizing_value = entry_condition.get('sizingValue', 2)

    if sizing_type == 'fixed_percentage':
        position_value = current_portfolio_value * (sizing_value / 100)
        max_position = entry_condition.get('maxPositionSize', 10)
        max_position_value = current_portfolio_value * (max_position / 100)
        return min(position_value, max_position_value)

    # ... other sizing types
```

### 2. Risk Management (Stop Loss & Take Profit)

#### Stop Loss Options:

- **Fixed Percentage**: Stop loss at specific percentage
- **Fixed Dollar Amount**: Stop loss at specific dollar amount
- **Trailing Percentage**: Dynamic trailing stop with activation threshold
- **ATR-Based**: Stop loss based on Average True Range multiplier
- **Support/Resistance**: Stop loss at specific price levels

#### Take Profit Options:

- **Fixed Percentage**: Take profit at specific percentage
- **Fixed Dollar Amount**: Take profit at specific dollar amount
- **Risk:Reward Ratio**: Take profit based on risk:reward ratio
- **Indicator-Based**: Exit based on technical indicator conditions

#### Implementation Details:

```python
def should_exit_position_enhanced(exit_condition: dict, position_type: str,
                                 entry_price: float, current_price: float, ...) -> tuple[bool, str]:
    """Enhanced exit condition checker that handles stop loss and take profit separately."""

    # Check stop loss conditions
    if 'stopLoss' in exit_condition:
        stop_loss = exit_condition['stopLoss']
        stop_loss_type = stop_loss.get('type', 'fixed_percentage')
        stop_loss_value = stop_loss.get('value', 5)

        # Handle different stop loss types...

    # Check take profit conditions
    if 'takeProfit' in exit_condition:
        take_profit = exit_condition['takeProfit']
        take_profit_type = take_profit.get('type', 'fixed_percentage')
        take_profit_value = take_profit.get('value', 10)

        # Handle different take profit types...
```

### 3. Enhanced Indicators

The system now provides multiple ATR periods for advanced stop loss calculations:

```python
# Calculate ATR with multiple periods for enhanced backtesting
df_copy["atr"] = calculate_atr(df_copy["High"], df_copy["Low"], close_prices)
df_copy["atr_5"] = calculate_atr(df_copy["High"], df_copy["Low"], close_prices, 5)
df_copy["atr_10"] = calculate_atr(df_copy["High"], df_copy["Low"], close_prices, 10)
df_copy["atr_14"] = calculate_atr(df_copy["High"], df_copy["Low"], close_prices, 14)
df_copy["atr_20"] = calculate_atr(df_copy["High"], df_copy["Low"], close_prices, 20)
df_copy["atr_50"] = calculate_atr(df_copy["High"], df_copy["Low"], close_prices, 50)
```

## Strategy Configuration Structure

### New Strategy Format:

```json
{
  "conditions": [...],
  "logicalOperator": "AND",
  "action": "LONG",
  "entryCondition": {
    "positionSizing": "fixed_percentage",
    "sizingValue": 2.0,
    "maxPositionSize": 10.0,
    "riskPerTrade": 1.0,
    "volatilityPeriod": 20
  },
  "exitCondition": {
    "stopLoss": {
      "type": "fixed_percentage",
      "value": 5.0,
      "trailingActivation": 3.0,
      "atrPeriod": 14,
      "supportResistanceLevel": 100.0
    },
    "takeProfit": {
      "type": "risk_reward_ratio",
      "value": 2.0,
      "riskRewardRatio": 2.0,
      "indicator": "RSI",
      "indicatorValue": "70"
    }
  }
}
```

## Backtesting Process

### 1. Strategy Validation

The system validates all new fields before running backtests:

- Entry conditions with position sizing
- Stop loss configuration
- Take profit configuration
- ATR periods and other parameters

### 2. Position Sizing Calculation

For each trade entry:

1. Calculate current portfolio value
2. Apply position sizing rules
3. Respect maximum position limits
4. Apply leverage if specified

### 3. Risk Management Monitoring

During position holding:

1. Monitor stop loss conditions continuously
2. Monitor take profit conditions continuously
3. Handle trailing stops with activation thresholds
4. Support ATR-based dynamic stops
5. Support indicator-based exits

### 4. Trade Execution

Enhanced trade tracking includes:

- Position size information
- Entry and exit reasons
- Stop loss and take profit triggers
- ATR-based calculations
- Risk:reward ratio tracking

## Example Strategies

### Conservative Strategy:

```json
{
  "entryCondition": {
    "positionSizing": "fixed_percentage",
    "sizingValue": 2.0,
    "maxPositionSize": 10.0
  },
  "exitCondition": {
    "stopLoss": {
      "type": "fixed_percentage",
      "value": 5.0
    },
    "takeProfit": {
      "type": "risk_reward_ratio",
      "value": 2.0,
      "riskRewardRatio": 2.0
    }
  }
}
```

### Aggressive Strategy:

```json
{
  "entryCondition": {
    "positionSizing": "risk_based",
    "sizingValue": 2.0,
    "riskPerTrade": 2.0,
    "maxPositionSize": 20.0
  },
  "exitCondition": {
    "stopLoss": {
      "type": "atr_based",
      "value": 2.0,
      "atrPeriod": 14
    },
    "takeProfit": {
      "type": "fixed_percentage",
      "value": 10.0
    }
  }
}
```

### Volatility-Adjusted Strategy:

```json
{
  "entryCondition": {
    "positionSizing": "volatility_based",
    "sizingValue": 3.0,
    "volatilityPeriod": 20,
    "maxPositionSize": 15.0
  },
  "exitCondition": {
    "stopLoss": {
      "type": "trailing_percentage",
      "value": 8.0,
      "trailingActivation": 5.0
    },
    "takeProfit": {
      "type": "indicator_based",
      "indicator": "RSI",
      "indicatorValue": "75"
    }
  }
}
```

## Testing

### Test Script:

A comprehensive test script (`test_enhanced_backtest.py`) is provided to verify:

- Strategy validation
- Position sizing calculations
- Stop loss and take profit execution
- ATR-based calculations
- Different position sizing strategies

### Running Tests:

```bash
cd backend
python test_enhanced_backtest.py
```

## Benefits

1. **Professional Risk Management**: Advanced position sizing and comprehensive stop loss options
2. **Flexibility**: Multiple exit strategies that can be combined
3. **Realistic Simulation**: ATR-based stops and volatility-adjusted sizing
4. **Risk Control**: Maximum position limits and risk per trade controls
5. **Performance Tracking**: Enhanced trade information and exit reason tracking

## Backward Compatibility

The system maintains backward compatibility with existing strategies:

- Legacy exit conditions are still supported
- Default values are provided for missing fields
- Existing backtest results remain valid

## Future Enhancements

- Portfolio correlation analysis
- Advanced risk metrics (Sharpe ratio, max drawdown)
- Backtesting integration with new conditions
- Strategy performance analytics
- Risk-adjusted position sizing algorithms

## Conclusion

The enhanced backtesting system now provides professional-grade trading strategy simulation with:

- Sophisticated position sizing based on multiple strategies
- Comprehensive stop loss and take profit management
- ATR-based dynamic stops
- Risk:reward ratio optimization
- Enhanced trade tracking and analysis

This system enables traders to create and test complex strategies with proper risk management, making it suitable for both retail and institutional trading applications.
