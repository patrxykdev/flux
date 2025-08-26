# Tier-Based Timeframe & Ticker Restrictions Implementation

## Overview

This implementation adds tier-based restrictions for both candle timeframes and tickers across the FluxTrader platform. Users are now limited to specific timeframes and tickers based on their subscription tier.

## Tier Restrictions

### Free Tier

- **Allowed timeframes**: `4h`, `1d` only
- **Allowed tickers**: `EURUSD`, `AAPL` only
- **Description**: Basic access with limited timeframe and ticker options for getting started

### Pro Tier

- **Allowed timeframes**: `15m`, `30m`, `1h`, `4h`, `1d`
- **Allowed tickers**: All tickers
- **Description**: Access to 15-minute and above timeframes for active traders

### Premium Tier

- **Allowed timeframes**: `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1d`
- **Allowed tickers**: All tickers
- **Description**: Full access to all timeframes including 1-minute data for serious traders

## Backend Changes

### 1. UserProfile Model (`backend/api/models.py`)

- Added `get_allowed_timeframes()` method to return timeframes based on user tier
- Added `get_allowed_tickers()` method to return tickers based on user tier
- Each tier has predefined timeframe and ticker restrictions

### 2. API Views (`backend/api/views.py`)

- **AvailableDataView**: Now filters both timeframes and tickers based on user tier when authenticated
- **UserTimeframesView**: Endpoint to get user's allowed timeframes
- **UserTickersView**: New endpoint to get user's allowed tickers
- **BacktestView**: Added validation to prevent backtests with unauthorized timeframes or tickers

### 3. URL Configuration (`backend/api/urls.py`)

- Added `/api/user-timeframes/` endpoint for fetching user timeframe permissions
- Added `/api/user-tickers/` endpoint for fetching user ticker permissions

## Frontend Changes

### 1. BacktestPage (`frontend/src/components/backtester/BacktestPage.tsx`)

- Added state for user timeframes, tickers, and tier
- Fetches both user timeframe and ticker permissions on component mount
- Timeframe selector now only shows allowed options
- Ticker selector now only shows allowed options
- Added tier indicators and upgrade hints for both selectors
- Automatically adjusts timeframe and ticker if current selections are not allowed

### 2. TickerSelector (`frontend/src/components/backtester/TickerSelector.tsx`)

- Added `userTickers` prop to filter available tickers based on user permissions
- Respects tier-based ticker restrictions when displaying options
- Maintains search functionality within allowed tickers

### 3. Styling (`frontend/src/components/backtester/BacktestPage.css`)

- Added CSS for tier indicators and upgrade hints
- Professional styling that matches the existing design

### 4. HomePage (`frontend/src/components/homepage/HomePage.tsx`)

- Updated pricing plan features to reflect new timeframe and ticker restrictions
- Clear communication of what each tier offers

## Security & Validation

### Backend Validation

- All backtest requests are validated against user's tier permissions for both timeframes and tickers
- Returns clear error messages when unauthorized timeframes or tickers are requested
- Prevents data access beyond user's subscription level

### Frontend Validation

- Timeframe and ticker selectors dynamically update based on user permissions
- Clear visual indicators of current tier and restrictions
- Helpful upgrade hints for users wanting more options

## User Experience

### Visual Indicators

- Tier badges displayed next to both timeframe and ticker selectors
- Upgrade hints with specific information about next tier benefits
- Consistent with existing white and blue color scheme

### Error Handling

- Clear error messages when unauthorized options are selected
- Automatic fallback to allowed options when possible
- Helpful upgrade suggestions

## Testing

The implementation has been tested to ensure:

- ✅ Free tier correctly restricted to 4h and 1d timeframes only
- ✅ Pro tier correctly allows 15m and above timeframes
- ✅ Premium tier correctly allows 1m and above timeframes
- ✅ Free tier correctly restricted to EURUSD and AAPL only
- ✅ Pro and Premium tiers correctly allow all tickers
- ✅ Backend validation prevents unauthorized access
- ✅ Frontend dynamically updates based on user permissions

## Future Enhancements

Potential improvements could include:

- Admin panel for managing tier restrictions
- Dynamic tier upgrades without page refresh
- Analytics on timeframe and ticker usage by tier
- A/B testing different restriction configurations
- Custom ticker packages for different tiers
