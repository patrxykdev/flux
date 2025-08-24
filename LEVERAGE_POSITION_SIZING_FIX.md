# Leverage Position Sizing Fix

## Problem Identified

When applying leverage to position sizing, the trade position size was not being calculated properly. The issue was in the cash limit check logic in the `PortfolioSimulator` class.

### What Was Wrong

**Before (Broken Logic)**:

```python
# Apply leverage to determine how many shares we can control
leveraged_shares_value = base_position_value * self.leverage

# Ensure we don't exceed available cash
if leveraged_shares_value > self.cash:  # ❌ WRONG: Checking leveraged value against cash
    # Cap at 95% of available cash to leave buffer
    leveraged_shares_value = self.cash * 0.95
    base_position_value = leveraged_shares_value / self.leverage  # ❌ WRONG: Reducing base position
```

**The Problem**:

1. We calculate base position: $10,000 (100% of portfolio)
2. We apply leverage: $10,000 × 2 = $20,000 worth of shares
3. We check if $20,000 > $10,000 (it is!)
4. We cap it at 95% of cash ($9,500)
5. We recalculate base position as $9,500 / 2 = $4,750

**Result**: Instead of getting 2x leverage on $10,000, we get 2x leverage on only $4,750, severely limiting the leverage effect.

### Example of the Bug

- **Portfolio**: $10,000
- **Position Size**: 100% of portfolio
- **Leverage**: 2x
- **Expected**: Use $10,000 cash to control $20,000 worth of shares
- **Actual**: Use $4,750 cash to control $9,500 worth of shares
- **Impact**: Leverage effect was artificially capped, not working as intended

## Solution Applied

**After (Fixed Logic)**:

```python
# Apply leverage to determine how many shares we can control
leveraged_shares_value = base_position_value * self.leverage

# Ensure we have enough cash for the BASE position (not the leveraged amount)
# The leverage allows us to control more shares with the same cash
if base_position_value > self.cash:  # ✅ CORRECT: Checking base position against cash
    # Cap at 95% of available cash to leave buffer
    base_position_value = self.cash * 0.95
    leveraged_shares_value = base_position_value * self.leverage  # ✅ CORRECT: Recalculating leveraged value
```

**How It Works Now**:

1. Calculate base position: $10,000 (100% of portfolio)
2. Apply leverage: $10,000 × 2 = $20,000 worth of shares
3. Check if $10,000 > $10,000 (it's not!)
4. No capping needed - leverage works as expected
5. Use $10,000 cash to control $20,000 worth of shares

**Result**: Full 2x leverage effect achieved, using $10,000 cash to control $20,000 worth of shares.

## What This Fixes

✅ **Proper Leverage Application**: Leverage now works as expected, allowing you to control more shares with the same cash

✅ **No Artificial Capping**: The leverage effect is no longer artificially limited by the cash check

✅ **Correct Cash Management**: Only the base position amount is deducted from cash, not the leveraged amount

✅ **Expected Behavior**: 2x leverage on $10,000 now gives you $20,000 worth of shares, not $9,500

✅ **Correct Position Size Display**: Trade history now shows the leveraged position size (e.g., $30,000 for 3x leverage on $10,000) instead of just the base cash amount

## Testing Verification

The fix has been tested with multiple scenarios:

- **Small Portfolio, High Leverage**: $1,000 portfolio, 100% position, 5x leverage → $5,000 worth of shares
- **Medium Portfolio, Medium Leverage**: $5,000 portfolio, 50% position, 2x leverage → $5,000 worth of shares
- **Large Portfolio, Low Leverage**: $50,000 portfolio, 25% position, 1.5x leverage → $18,750 worth of shares
- **Full Portfolio, High Leverage**: $10,000 portfolio, 100% position, 10x leverage → $100,000 worth of shares

All test cases now show the correct leverage multiplier being achieved.

## Files Modified

- `backend/api/backtester.py` - Fixed the leverage logic in the `PortfolioSimulator` class
- Updated trade history display to show leveraged position size instead of base position size
- Added better debug logging to make leverage calculations transparent

## Impact

This fix ensures that when you apply leverage to your trading strategy:

- You get the full leverage effect you expect
- Position sizes are calculated correctly
- Cash management remains safe and logical
- The system behaves as a trader would expect with leverage

The leverage position sizing should now work correctly for all your backtesting scenarios.
