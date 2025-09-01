import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './HelpPage.css';

interface HelpSection {
  id: string;
  title: string;
  content: React.ReactNode;
  category: 'indicators' | 'entry-conditions' | 'exit-conditions' | 'concepts' | 'backtester-guide' | 'strategy-builder-guide';
}

const HelpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('indicators');
  const [showCategoryGrid, setShowCategoryGrid] = useState(true);

  // Handle URL parameters for direct navigation to specific categories
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && ['indicators', 'entry-conditions', 'exit-conditions', 'concepts', 'backtester-guide', 'strategy-builder-guide'].includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const helpSections: HelpSection[] = [
    // Technical Indicators
    {
      id: 'rsi',
      title: 'RSI (Relative Strength Index)',
      category: 'indicators',
      content: (
        <div>
          <h3>What is RSI?</h3>
          <p>RSI is a momentum oscillator that measures the speed and magnitude of price changes. It oscillates between 0 and 100.</p>
          
          <h3>How it works:</h3>
          <ul>
            <li><strong>Overbought:</strong> RSI above 70 indicates the asset may be overbought and due for a reversal</li>
            <li><strong>Oversold:</strong> RSI below 30 indicates the asset may be oversold and due for a bounce</li>
            <li><strong>Divergence:</strong> When price makes new highs but RSI doesn't, it may signal a reversal</li>
          </ul>
          
          <h3>Period parameter:</h3>
          <p>The period determines how many price bars are used in the calculation. A shorter period (like 14) makes RSI more sensitive to recent price changes, while a longer period (like 21) makes it less sensitive and smoother.</p>
          
          <h3>Common uses:</h3>
          <ul>
            <li>Identify overbought/oversold conditions</li>
            <li>Spot potential reversal points</li>
            <li>Confirm trend strength</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Entry Signal:</strong> Buy when RSI crosses above 30 (oversold) and price shows bullish candlestick patterns</li>
            <li><strong>Exit Signal:</strong> Sell when RSI reaches 70+ (overbought) or crosses below 70</li>
            <li><strong>Confirmation:</strong> Use with volume spikes and support/resistance levels</li>
            <li><strong>Risk Management:</strong> Set stop loss below recent swing lows when buying oversold</li>
            <li><strong>Trend Filter:</strong> Only buy oversold in uptrends, sell overbought in downtrends</li>
          </ul>
        </div>
      )
    },
    {
      id: 'macd',
      title: 'MACD (Moving Average Convergence Divergence)',
      category: 'indicators',
      content: (
        <div>
          <h3>What is MACD?</h3>
          <p>MACD is a trend-following momentum indicator that shows the relationship between two moving averages of an asset's price.</p>
          
          <h3>How it works:</h3>
          <ul>
            <li><strong>MACD Line:</strong> Difference between fast EMA and slow EMA</li>
            <li><strong>Signal Line:</strong> EMA of the MACD line</li>
            <li><strong>Histogram:</strong> Difference between MACD line and signal line</li>
          </ul>
          
          <h3>Parameters:</h3>
          <ul>
            <li><strong>Fast Period:</strong> Shorter EMA period (default 12) - more sensitive to recent price changes</li>
            <li><strong>Slow Period:</strong> Longer EMA period (default 26) - less sensitive, shows longer-term trend</li>
            <li><strong>Signal Period:</strong> EMA period for signal line (default 9) - smooths the MACD line</li>
          </ul>
          
          <h3>Common signals:</h3>
          <ul>
            <li>MACD crosses above signal line = bullish signal</li>
            <li>MACD crosses below signal line = bearish signal</li>
            <li>Histogram increasing = momentum building</li>
            <li>Histogram decreasing = momentum waning</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Entry Signal:</strong> Buy when MACD line crosses above signal line with increasing histogram</li>
            <li><strong>Exit Signal:</strong> Sell when MACD crosses below signal line or histogram starts decreasing</li>
            <li><strong>Trend Confirmation:</strong> Use MACD above/below zero line to confirm trend direction</li>
            <li><strong>Divergence Trading:</strong> Look for price making new highs while MACD makes lower highs (bearish divergence)</li>
            <li><strong>Momentum Filter:</strong> Only trade in the direction of the stronger MACD momentum</li>
          </ul>
        </div>
      )
    },
    {
      id: 'sma',
      title: 'SMA (Simple Moving Average)',
      category: 'indicators',
      content: (
        <div>
          <h3>What is SMA?</h3>
          <p>SMA is the average of closing prices over a specified period, calculated by summing all prices and dividing by the number of periods.</p>
          
          <h3>How it works:</h3>
          <p>SMA = (Price1 + Price2 + ... + PriceN) / N</p>
          
          <h3>Period parameter:</h3>
          <p>The period determines how many price bars are averaged. A shorter period (like 10) creates a more responsive line that follows price closely, while a longer period (like 50) creates a smoother line that shows the longer-term trend.</p>
          
          <h3>Common uses:</h3>
          <ul>
            <li>Identify trend direction (price above SMA = uptrend, below = downtrend)</li>
            <li>Support and resistance levels</li>
            <li>Crossovers with other moving averages</li>
            <li>Dynamic price targets</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Trend Following:</strong> Buy when price bounces off SMA support, sell when price breaks below SMA</li>
            <li><strong>Moving Average Crossovers:</strong> Use shorter SMA crossing above longer SMA as buy signal</li>
            <li><strong>Dynamic Support/Resistance:</strong> Set stop losses just below SMA for long positions</li>
            <li><strong>Price Targets:</strong> Use SMA as dynamic take profit levels that move with the trend</li>
            <li><strong>Filter:</strong> Only buy above SMA in uptrends, only sell below SMA in downtrends</li>
          </ul>
        </div>
      )
    },
    {
      id: 'ema',
      title: 'EMA (Exponential Moving Average)',
      category: 'indicators',
      content: (
        <div>
          <h3>What is EMA?</h3>
          <p>EMA is a type of moving average that gives more weight to recent prices, making it more responsive to recent price changes than SMA.</p>
          
          <h3>How it works:</h3>
          <p>EMA = (Current Price × Multiplier) + (Previous EMA × (1 - Multiplier))</p>
          <p>Where Multiplier = 2 / (Period + 1)</p>
          
          <h3>Period parameter:</h3>
          <p>Similar to SMA, but EMA responds faster to price changes. A shorter period makes it more sensitive, while a longer period makes it smoother.</p>
          
          <h3>Advantages over SMA:</h3>
          <ul>
            <li>Faster response to price changes</li>
            <li>Better for trending markets</li>
            <li>Reduces lag in signal generation</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Fast Entries:</strong> Use EMA crossovers for quicker entry signals than SMA</li>
            <li><strong>Trend Riding:</strong> Buy pullbacks to EMA in strong uptrends, sell rallies to EMA in downtrends</li>
            <li><strong>Dynamic Stops:</strong> Use EMA as trailing stop loss that follows price more closely</li>
            <li><strong>Momentum Confirmation:</strong> Price staying above EMA confirms uptrend strength</li>
            <li><strong>Breakout Trading:</strong> Enter when price breaks above EMA with volume confirmation</li>
          </ul>
        </div>
      )
    },
    {
      id: 'bollinger-bands',
      title: 'Bollinger Bands',
      category: 'indicators',
      content: (
        <div>
          <h3>What are Bollinger Bands?</h3>
          <p>Bollinger Bands consist of three lines: a middle band (SMA) and two outer bands that represent standard deviations from the middle band.</p>
          
          <h3>How it works:</h3>
          <ul>
            <li><strong>Middle Band:</strong> Simple Moving Average (usually 20-period)</li>
            <li><strong>Upper Band:</strong> Middle Band + (Standard Deviation × Multiplier)</li>
            <li><strong>Lower Band:</strong> Middle Band - (Standard Deviation × Multiplier)</li>
          </ul>
          
          <h3>Parameters:</h3>
          <ul>
            <li><strong>Period:</strong> Number of bars for the middle SMA (default 20)</li>
            <li><strong>Upper Band Multiplier:</strong> Standard deviation multiplier for upper band (default 2)</li>
            <li><strong>Lower Band Multiplier:</strong> Standard deviation multiplier for lower band (default 2)</li>
          </ul>
          
          <h3>Common uses:</h3>
          <ul>
            <li>Identify overbought/oversold conditions</li>
            <li>Measure volatility (bands widen = high volatility, narrow = low volatility)</li>
            <li>Spot potential reversal points</li>
            <li>Mean reversion strategies</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Mean Reversion:</strong> Buy when price touches lower band, sell when price touches upper band</li>
            <li><strong>Breakout Trading:</strong> Enter long when price breaks above upper band with volume</li>
            <li><strong>Volatility Expansion:</strong> Trade breakouts when bands are narrowing (low volatility)</li>
            <li><strong>Dynamic Targets:</strong> Use middle band (SMA) as take profit target</li>
            <li><strong>Stop Loss Placement:</strong> Set stops outside the opposite band for mean reversion trades</li>
          </ul>
        </div>
      )
    },
    {
      id: 'stochastic',
      title: 'Stochastic Oscillator',
      category: 'indicators',
      content: (
        <div>
          <h3>What is Stochastic?</h3>
          <p>Stochastic is a momentum indicator that compares a closing price to its price range over a specific period.</p>
          
          <h3>How it works:</h3>
          <ul>
            <li><strong>%K Line:</strong> Current position within the price range</li>
            <li><strong>%D Line:</strong> Smoothed version of %K (usually 3-period SMA)</li>
          </ul>
          
          <h3>Parameters:</h3>
          <ul>
            <li><strong>K Period:</strong> Number of bars for %K calculation (default 14)</li>
            <li><strong>D Period:</strong> Number of bars for %D smoothing (default 3)</li>
          </ul>
          
          <h3>Interpretation:</h3>
          <ul>
            <li>Values above 80 = overbought</li>
            <li>Values below 20 = oversold</li>
            <li>%K crosses above %D = bullish signal</li>
            <li>%K crosses below %D = bearish signal</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Oversold Bounces:</strong> Buy when %K crosses above %D below 20 level</li>
            <li><strong>Overbought Reversals:</strong> Sell when %K crosses below %D above 80 level</li>
            <li><strong>Divergence Trading:</strong> Look for price making new highs while Stochastic makes lower highs</li>
            <li><strong>Confirmation:</strong> Use with RSI and volume for stronger signals</li>
            <li><strong>Range Trading:</strong> Perfect for sideways markets with clear support/resistance</li>
          </ul>
        </div>
      )
    },
    {
      id: 'williams-r',
      title: 'Williams %R',
      category: 'indicators',
      content: (
        <div>
          <h3>What is Williams %R?</h3>
          <p>Williams %R is a momentum indicator that measures overbought and oversold levels, similar to Stochastic but inverted.</p>
          
          <h3>How it works:</h3>
          <p>%R = (Highest High - Close) / (Highest High - Lowest Low) × -100</p>
          
          <h3>Period parameter:</h3>
          <p>The period determines how many bars to look back for the highest high and lowest low. A shorter period makes it more sensitive to recent price action.</p>
          
          <h3>Interpretation:</h3>
          <ul>
            <li>Values above -20 = overbought</li>
            <li>Values below -80 = oversold</li>
            <li>Crosses above -80 = potential buy signal</li>
            <li>Crosses below -20 = potential sell signal</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Oversold Reversals:</strong> Buy when Williams %R crosses above -80 with bullish candlestick confirmation</li>
            <li><strong>Overbought Exits:</strong> Sell when Williams %R crosses below -20 or reaches -10</li>
            <li><strong>Trend Filter:</strong> Use in conjunction with moving averages to confirm trend direction</li>
            <li><strong>Multiple Timeframe:</strong> Check higher timeframe Williams %R for trend bias</li>
            <li><strong>Risk Management:</strong> Set stops below recent swing lows when buying oversold</li>
          </ul>
        </div>
      )
    },
    {
      id: 'atr',
      title: 'ATR (Average True Range)',
      category: 'indicators',
      content: (
        <div>
          <h3>What is ATR?</h3>
          <p>ATR measures market volatility by calculating the average of true ranges over a specified period.</p>
          
          <h3>How it works:</h3>
          <p>True Range = max(High - Low, |High - Previous Close|, |Low - Previous Close|)</p>
          <p>ATR = Average of True Range over N periods</p>
          
          <h3>Period parameter:</h3>
          <p>The period determines how many bars to average. A shorter period makes ATR more responsive to recent volatility changes.</p>
          
          <h3>Common uses:</h3>
          <ul>
            <li>Set dynamic stop losses (e.g., 2x ATR from entry)</li>
            <li>Measure market volatility</li>
            <li>Adjust position sizing based on volatility</li>
            <li>Identify potential breakout levels</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Dynamic Stop Losses:</strong> Set stops at 2-3x ATR from entry price for volatility-adjusted protection</li>
            <li><strong>Position Sizing:</strong> Reduce position size when ATR is high, increase when ATR is low</li>
            <li><strong>Breakout Trading:</strong> Enter when price breaks above resistance by 1x ATR with volume</li>
            <li><strong>Volatility Breakouts:</strong> Trade breakouts from low ATR periods (compression) to high ATR periods</li>
            <li><strong>Trailing Stops:</strong> Use ATR to set trailing stop distance that adapts to market conditions</li>
          </ul>
        </div>
      )
    },
    {
      id: 'volume',
      title: 'Volume',
      category: 'indicators',
      content: (
        <div>
          <h3>What is Volume?</h3>
          <p>Volume represents the number of shares or contracts traded during a specific time period.</p>
          
          <h3>How it works:</h3>
          <p>Volume confirms price movements - higher volume typically means stronger price moves and more conviction from traders.</p>
          
          <h3>Common uses:</h3>
          <ul>
            <li>Confirm price breakouts (high volume = stronger breakout)</li>
            <li>Identify potential reversals (divergence between price and volume)</li>
            <li>Measure market participation</li>
            <li>Validate trend strength</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Breakout Confirmation:</strong> Only trade breakouts with above-average volume for stronger moves</li>
            <li><strong>Volume Divergence:</strong> Exit positions when price rises but volume decreases (weak momentum)</li>
            <li><strong>Support/Resistance:</strong> High volume at key levels confirms their importance</li>
            <li><strong>Trend Validation:</strong> Strong trends show increasing volume on rallies, decreasing on pullbacks</li>
            <li><strong>Entry Timing:</strong> Enter trades when volume spikes confirm price action signals</li>
          </ul>
        </div>
      )
    },
    {
      id: 'close',
      title: 'Close Price',
      category: 'indicators',
      content: (
        <div>
          <h3>What is Close Price?</h3>
          <p>The closing price is the final price at which a security trades during a regular trading session.</p>
          
          <h3>How it works:</h3>
          <p>Close price is often used as a reference point for technical analysis and can be compared to other indicators or price levels.</p>
          
          <h3>Common uses:</h3>
          <ul>
            <li>Compare with moving averages</li>
            <li>Identify support/resistance levels</li>
            <li>Calculate price changes and returns</li>
            <li>Cross-reference with other indicators</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Moving Average Crossovers:</strong> Buy when close price crosses above SMA/EMA, sell when below</li>
            <li><strong>Support/Resistance:</strong> Use previous close prices as dynamic support and resistance levels</li>
            <li><strong>Price Action:</strong> Combine with candlestick patterns for entry and exit signals</li>
            <li><strong>Breakout Trading:</strong> Enter when close price breaks above key resistance levels</li>
            <li><strong>Risk Management:</strong> Set stop losses based on recent close price levels</li>
          </ul>
        </div>
      )
    },
    
    // Entry Conditions
    {
      id: 'position-sizing',
      title: 'Position Sizing',
      category: 'entry-conditions',
      content: (
        <div>
          <h3>What is Position Sizing?</h3>
          <p>Position sizing determines how much of your portfolio to risk on each trade, which is crucial for risk management.</p>
          
          <h3>Types of Position Sizing:</h3>
          
          <h4>Fixed Percentage</h4>
          <p>Use a fixed percentage of your portfolio for each trade (e.g., 2% per trade). This automatically adjusts position size as your portfolio grows or shrinks.</p>
          
          <h4>Fixed Dollar Amount</h4>
          <p>Risk a fixed dollar amount per trade regardless of portfolio size. Good for consistent risk exposure but doesn't scale with portfolio growth.</p>
          
          <h4>Kelly Criterion</h4>
          <p>Dynamic sizing based on your win rate and average win/loss ratio. Calculates the optimal percentage to risk for maximum long-term growth.</p>
          
          <h4>Risk-Based Sizing</h4>
          <p>Risk a fixed percentage of your portfolio per trade (typically 1-2%). Position size is calculated based on the distance to your stop loss.</p>
          
          <h4>Volatility-Based Sizing</h4>
          <p>Adjust position size based on market volatility. Larger positions in low volatility, smaller positions in high volatility.</p>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Fixed Percentage:</strong> Use 2-5% of portfolio per trade for consistent risk exposure</li>
            <li><strong>Risk-Based:</strong> Calculate position size based on stop loss distance (1-2% risk per trade)</li>
            <li><strong>Kelly Criterion:</strong> Use when you have reliable win rate and risk:reward data</li>
            <li><strong>Volatility Adjustment:</strong> Reduce size in high ATR periods, increase in low ATR periods</li>
            <li><strong>Portfolio Balance:</strong> Never risk more than 20% of portfolio across all open positions</li>
          </ul>
        </div>
      )
    },
    
    // Exit Conditions
    {
      id: 'stop-loss',
      title: 'Stop Loss',
      category: 'exit-conditions',
      content: (
        <div>
          <h3>What is Stop Loss?</h3>
          <p>A stop loss is an order that automatically closes a position when the price reaches a predetermined level to limit potential losses.</p>
          
          <h3>Types of Stop Loss:</h3>
          
          <h4>Fixed Percentage</h4>
          <p>Exit when price moves against you by a fixed percentage (e.g., 2% stop loss). Simple and effective for most traders.</p>
          
          <h4>Fixed Dollar Amount</h4>
          <p>Exit when you lose a fixed dollar amount. Good for consistent risk management but doesn't account for position size.</p>
          
          <h4>ATR-Based</h4>
          <p>Stop loss is set at a multiple of ATR from your entry price. Adapts to market volatility - wider stops in volatile markets, tighter in calm markets.</p>
          
          <h4>Support/Resistance Based</h4>
          <p>Place stop loss below key support levels (for longs) or above resistance levels (for shorts). Uses market structure for better stop placement.</p>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Fixed Percentage:</strong> Use 2-5% stop loss for most trades, adjust based on volatility</li>
            <li><strong>ATR-Based:</strong> Set stops at 2-3x ATR from entry for dynamic protection</li>
            <li><strong>Support/Resistance:</strong> Place stops below key support levels for longs, above resistance for shorts</li>
            <li><strong>Risk:Reward Ratio:</strong> Ensure stop loss distance allows for minimum 1:2 risk:reward</li>
            <li><strong>Trailing Stops:</strong> Move stops to breakeven after 1:1 risk:reward is achieved</li>
          </ul>
        </div>
      )
    },
    {
      id: 'trailing-stop',
      title: 'Trailing Stop',
      category: 'exit-conditions',
      content: (
        <div>
          <h3>What is a Trailing Stop?</h3>
          <p>A trailing stop automatically moves your stop loss in the direction of profit, helping you lock in gains while giving the trade room to breathe.</p>
          
          <h3>How it works:</h3>
          <ul>
            <li>Set an initial stop loss when you enter the trade</li>
            <li>As price moves in your favor, the stop loss moves up (for longs) or down (for shorts)</li>
            <li>If price reverses and hits the trailing stop, your position is closed with a profit</li>
          </ul>
          
          <h3>Types of Trailing Stops:</h3>
          
          <h4>Percentage Trailing Stop</h4>
          <p>Stop loss trails behind the current price by a fixed percentage. For example, a 5% trailing stop on a long position would move up as price rises, always staying 5% below the current price.</p>
          
          <h4>Dollar Amount Trailing Stop</h4>
          <p>Stop loss trails by a fixed dollar amount. Good for consistent risk management but may not adapt well to different price levels.</p>
          
          <h3>Advantages:</h3>
          <ul>
            <li>Lets profits run while protecting gains</li>
            <li>Automatically adjusts to market conditions</li>
            <li>Removes emotional decision-making from exit timing</li>
          </ul>
        </div>
      )
    },
    {
      id: 'take-profit',
      title: 'Take Profit',
      category: 'exit-conditions',
      content: (
        <div>
          <h3>What is Take Profit?</h3>
          <p>Take profit is an order that automatically closes a profitable position when the price reaches a predetermined target level.</p>
          
          <h3>Types of Take Profit:</h3>
          
          <h4>Fixed Percentage</h4>
          <p>Exit when price moves in your favor by a fixed percentage (e.g., 5% profit target). Simple and effective for consistent profit taking.</p>
          
          <h4>Fixed Dollar Amount</h4>
          <p>Exit when you achieve a fixed dollar profit. Good for consistent profit targets but doesn't account for position size.</p>
          
          <h4>Risk:Reward Ratio</h4>
          <p>Set profit target based on your risk. For example, if you risk 2% on a trade, you might set a 4% profit target for a 1:2 risk:reward ratio.</p>
          
          <h4>Indicator-Based</h4>
          <p>Exit based on technical indicator signals. For example, exit when RSI reaches overbought levels (70) or when price hits a moving average.</p>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Fixed Percentage:</strong> Use 5-10% profit targets for consistent profit taking</li>
            <li><strong>Risk:Reward Ratio:</strong> Set targets at 2-3x your risk for optimal risk management</li>
            <li><strong>Indicator-Based:</strong> Exit when RSI reaches 70+ or when price hits resistance levels</li>
            <li><strong>Trailing Take Profit:</strong> Move profit targets up as price moves in your favor</li>
            <li><strong>Partial Profits:</strong> Take 50% off at 1:1 risk:reward, let remaining position run</li>
          </ul>
        </div>
      )
    },
    
    // Trading Concepts
    {
      id: 'kelly-criterion',
      title: 'Kelly Criterion',
      category: 'concepts',
      content: (
        <div>
          <h3>What is the Kelly Criterion?</h3>
          <p>The Kelly Criterion is a mathematical formula that determines the optimal percentage of your portfolio to risk on each trade for maximum long-term growth.</p>
          
          <h3>Formula:</h3>
          <p>Kelly % = (W × R - L) / R</p>
          <p>Where:</p>
          <ul>
            <li>W = Win rate (probability of winning)</li>
            <li>R = Average win / Average loss ratio</li>
            <li>L = Loss rate (probability of losing = 1 - W)</li>
          </ul>
          
          <h3>Example:</h3>
          <p>If you win 60% of trades with an average win of $200 and average loss of $100:</p>
          <p>Kelly % = (0.6 × 2 - 0.4) / 2 = (1.2 - 0.4) / 2 = 0.4 = 40%</p>
          
          <h3>Important Notes:</h3>
          <ul>
            <li>Kelly Criterion can suggest very large position sizes</li>
            <li>Most traders use 1/4 to 1/2 of the Kelly percentage for safety</li>
            <li>Requires accurate win rate and risk:reward data</li>
                      <li>Best used as a guide, not a strict rule</li>
        </ul>
        
        <h3>How to incorporate into a strategy:</h3>
        <ul>
          <li><strong>Conservative Approach:</strong> Use 1/4 to 1/2 of Kelly percentage for safety</li>
          <li><strong>Data Requirements:</strong> Need at least 30-50 trades to calculate reliable win rate</li>
          <li><strong>Risk Management:</strong> Never exceed 25% of portfolio on any single trade</li>
          <li><strong>Dynamic Adjustment:</strong> Recalculate Kelly percentage monthly as performance changes</li>
          <li><strong>Portfolio Protection:</strong> Use Kelly as maximum position size, not recommended size</li>
        </ul>
      </div>
    )
  },
    {
      id: 'risk-management',
      title: 'Risk Management',
      category: 'concepts',
      content: (
        <div>
          <h3>What is Risk Management?</h3>
          <p>Risk management is the process of identifying, assessing, and controlling potential losses in your trading portfolio.</p>
          
          <h3>Key Principles:</h3>
          
          <h4>1. Never Risk More Than You Can Afford to Lose</h4>
          <p>Only trade with money you can afford to lose. Never use money needed for essential expenses.</p>
          
          <h4>2. Risk Per Trade Rule</h4>
          <p>Risk only 1-2% of your portfolio on any single trade. This ensures that even a series of losses won't significantly damage your capital.</p>
          
          <h4>3. Diversification</h4>
          <p>Don't put all your money in one asset or strategy. Spread risk across different markets, timeframes, and strategies.</p>
          
          <h4>4. Position Sizing</h4>
          <p>Size your positions based on your risk tolerance and the distance to your stop loss.</p>
          
          <h4>5. Use Stop Losses</h4>
          <p>Always use stop losses to limit potential losses. Never let a losing trade run indefinitely.</p>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Risk Per Trade:</strong> Never risk more than 1-2% of portfolio on any single trade</li>
            <li><strong>Portfolio Heat:</strong> Keep total open risk below 6% of portfolio at any time</li>
            <li><strong>Correlation Management:</strong> Avoid multiple positions in highly correlated assets</li>
            <li><strong>Stop Loss Discipline:</strong> Always use stop losses and never move them further away</li>
            <li><strong>Position Sizing:</strong> Calculate position size based on stop loss distance and risk percentage</li>
          </ul>
        </div>
      )
    },
    {
      id: 'trend-analysis',
      title: 'Trend Analysis',
      category: 'concepts',
      content: (
        <div>
          <h3>What is Trend Analysis?</h3>
          <p>Trend analysis is the study of price movement patterns to identify the direction and strength of market trends.</p>
          
          <h3>Types of Trends:</h3>
          
          <h4>Uptrend</h4>
          <p>Characterized by higher highs and higher lows. Price is generally moving upward over time.</p>
          
          <h4>Downtrend</h4>
          <p>Characterized by lower highs and lower lows. Price is generally moving downward over time.</p>
          
          <h4>Sideways/Ranging</h4>
          <p>Price moves within a horizontal range with no clear directional bias.</p>
          
          <h3>Trend Identification Tools:</h3>
          <ul>
            <li>Moving averages (price above/below MA)</li>
            <li>Trend lines (connecting highs or lows)</li>
            <li>Higher highs and higher lows (uptrend)</li>
            <li>Lower highs and lower lows (downtrend)</li>
            <li>Momentum indicators (RSI, MACD)</li>
          </ul>
          
          <h3>Trading with Trends:</h3>
          <ul>
            <li>Trend-following: Trade in the direction of the trend</li>
            <li>Counter-trend: Trade against the trend (higher risk)</li>
            <li>Breakout trading: Enter when price breaks out of a range</li>
          </ul>
          
          <h3>How to incorporate into a strategy:</h3>
          <ul>
            <li><strong>Trend Following:</strong> Use moving averages and higher highs/lows to identify trend direction</li>
            <li><strong>Entry Timing:</strong> Buy pullbacks in uptrends, sell rallies in downtrends</li>
            <li><strong>Breakout Trading:</strong> Enter when price breaks above resistance in uptrends or below support in downtrends</li>
            <li><strong>Risk Management:</strong> Set wider stops in trending markets, tighter stops in ranging markets</li>
            <li><strong>Multiple Timeframes:</strong> Use higher timeframe for trend bias, lower timeframe for entry timing</li>
          </ul>
        </div>
      )
    },

    // Backtester Guide
    {
      id: 'backtester-overview',
      title: 'Backtester Overview',
      category: 'backtester-guide',
      content: (
        <div>
          <h3>What is the Backtester?</h3>
          <p>The backtester allows you to test your trading strategies against historical market data to see how they would have performed in the past. This helps you validate your strategy before risking real money.</p>
          
          <h3>Key Benefits:</h3>
          <ul>
            <li><strong>Strategy Validation:</strong> Test if your strategy works before live trading</li>
            <li><strong>Performance Metrics:</strong> Get detailed statistics on returns, win rate, and risk</li>
            <li><strong>Risk Assessment:</strong> Understand potential drawdowns and volatility</li>
            <li><strong>Optimization:</strong> Fine-tune parameters for better performance</li>
          </ul>
          
          <h3>How to Access the Backtester:</h3>
          <ol>
            <li>Navigate to the Dashboard</li>
            <li>Click on "Backtest Strategy" or use the navigation menu</li>
            <li>You'll see the backtester interface with configuration options</li>
          </ol>
          
          <h3>What You'll Need:</h3>
          <ul>
            <li>A saved strategy (created in the Strategy Builder)</li>
            <li>Historical data for your chosen ticker and timeframe</li>
            <li>Starting capital amount</li>
            <li>Date range for testing</li>
          </ul>
        </div>
      )
    },
    {
      id: 'backtester-setup',
      title: 'Setting Up a Backtest',
      category: 'backtester-guide',
      content: (
        <div>
          <h3>Step-by-Step Backtest Setup</h3>
          
          <h4>1. Select Your Strategy</h4>
          <p>Choose from your saved strategies in the dropdown menu. You must have at least one strategy saved before you can run a backtest.</p>
          
          <h4>2. Choose Market Data</h4>
          <ul>
            <li><strong>Ticker:</strong> Select the asset you want to test (EURUSD, AAPL, BTC, etc.)</li>
            <li><strong>Timeframe:</strong> Choose the chart timeframe (1m, 5m, 15m, 1h, 4h, 1d)</li>
            <li><strong>Date Range:</strong> Set start and end dates for your test period</li>
          </ul>
          
          <h4>3. Configure Capital & Risk</h4>
          <ul>
            <li><strong>Starting Capital:</strong> Enter your initial portfolio value (e.g., $10,000)</li>
            <li><strong>Leverage:</strong> Choose leverage from 1x to 10x (higher leverage = higher risk)</li>
          </ul>
          
          <h4>4. Run the Backtest</h4>
          <p>Click "Run Backtest" and wait for the analysis to complete. This may take a few moments depending on the data size.</p>
          
          <h3>Important Notes:</h3>
          <ul>
            <li><strong>Tier Limitations:</strong> Free tier is limited to EURUSD and AAPL with 4h and 1d timeframes</li>
            <li><strong>Data Availability:</strong> Ensure your selected date range has sufficient historical data</li>
            <li><strong>Strategy Requirements:</strong> Your strategy must have at least one condition and action defined</li>
          </ul>
        </div>
      )
    },
    {
      id: 'backtester-results',
      title: 'Understanding Backtest Results',
      category: 'backtester-guide',
      content: (
        <div>
          <h3>Key Performance Metrics</h3>
          
          <h4>Total P&L</h4>
          <p>The overall percentage return of your strategy over the test period. Positive values indicate profit, negative values indicate loss.</p>
          
          <h4>Final Equity</h4>
          <p>Your portfolio value at the end of the backtest period, including all profits and losses.</p>
          
          <h4>Total Trades</h4>
          <p>The number of completed trades (entries and exits) during the test period.</p>
          
          <h4>Win Rate</h4>
          <p>The percentage of profitable trades. A higher win rate generally indicates a more reliable strategy.</p>
          
          <h3>Equity Curve Chart</h3>
          <p>The equity curve shows how your portfolio value changed over time. Look for:</p>
          <ul>
            <li><strong>Consistent Growth:</strong> Steady upward trend indicates a robust strategy</li>
            <li><strong>Drawdowns:</strong> Temporary declines in portfolio value</li>
            <li><strong>Volatility:</strong> How much the curve fluctuates</li>
          </ul>
          
          <h3>Trade History Table</h3>
          <p>Detailed log of every trade showing:</p>
          <ul>
            <li><strong>Date & Time:</strong> When the trade occurred</li>
            <li><strong>Type:</strong> LONG (buy) or EXIT (sell) signals</li>
            <li><strong>Price:</strong> Entry or exit price</li>
            <li><strong>Position Size:</strong> Amount invested in the trade</li>
            <li><strong>Leverage:</strong> Leverage used for the trade</li>
            <li><strong>Portfolio Value:</strong> Total portfolio value after the trade</li>
            <li><strong>P&L:</strong> Profit or loss for the trade</li>
            <li><strong>Exit Reason:</strong> Why the trade was closed (stop loss, take profit, signal)</li>
          </ul>
          
          <h3>Interpreting Results</h3>
          <ul>
            <li><strong>Good Strategy:</strong> Positive returns, reasonable drawdowns, consistent performance</li>
            <li><strong>High Risk:</strong> Large drawdowns, high volatility, inconsistent results</li>
            <li><strong>Overfitting:</strong> Excellent backtest results that may not work in live trading</li>
          </ul>
        </div>
      )
    },
    {
      id: 'backtester-tips',
      title: 'Backtesting Best Practices',
      category: 'backtester-guide',
      content: (
        <div>
          <h3>Best Practices for Reliable Results</h3>
          
          <h4>1. Use Sufficient Data</h4>
          <ul>
            <li>Test over at least 6-12 months of data</li>
            <li>Include different market conditions (bull, bear, sideways)</li>
            <li>Avoid testing on too little data (less than 3 months)</li>
          </ul>
          
          <h4>2. Realistic Parameters</h4>
          <ul>
            <li>Use realistic starting capital amounts</li>
            <li>Don't over-leverage (start with 1x-3x)</li>
            <li>Include transaction costs in your analysis</li>
          </ul>
          
          <h4>3. Multiple Timeframes</h4>
          <ul>
            <li>Test your strategy on different timeframes</li>
            <li>Higher timeframes (1d, 4h) are generally more reliable</li>
            <li>Lower timeframes (1m, 5m) may show more noise</li>
          </ul>
          
          <h4>4. Out-of-Sample Testing</h4>
          <ul>
            <li>Reserve some data for final validation</li>
            <li>Don't optimize parameters on the same data you test</li>
            <li>Test on completely unseen market conditions</li>
          </ul>
          
          <h4>5. Risk Management Focus</h4>
          <ul>
            <li>Pay attention to maximum drawdown</li>
            <li>Ensure your strategy can handle losing streaks</li>
            <li>Test with different position sizing methods</li>
          </ul>
          
          <h3>Common Pitfalls to Avoid</h3>
          <ul>
            <li><strong>Overfitting:</strong> Creating strategies that work perfectly on historical data but fail in live trading</li>
            <li><strong>Survivorship Bias:</strong> Only testing on assets that performed well</li>
            <li><strong>Look-Ahead Bias:</strong> Using future information in your strategy</li>
            <li><strong>Ignoring Costs:</strong> Not accounting for spreads, commissions, and slippage</li>
          </ul>
          
          <h3>When to Trust Your Results</h3>
          <ul>
            <li>Consistent performance across different time periods</li>
            <li>Reasonable drawdowns (less than 20-30%)</li>
                          <li>Good risk-adjusted returns (Sharpe ratio &gt; 1)</li>
            <li>Strategy works on multiple assets/timeframes</li>
          </ul>
        </div>
      )
    },

    // Strategy Builder Guide
    {
      id: 'strategy-builder-overview',
      title: 'Strategy Builder Overview',
      category: 'strategy-builder-guide',
      content: (
        <div>
          <h3>What is the Strategy Builder?</h3>
          <p>The Strategy Builder is a visual tool that lets you create custom trading strategies without coding. You can define market conditions, entry/exit rules, and risk management parameters using an intuitive interface.</p>
          
          <h3>Key Components:</h3>
          <ul>
            <li><strong>Trigger Conditions:</strong> Market conditions that must be met to trigger a trade</li>
            <li><strong>Action:</strong> What to do when conditions are met (buy or sell)</li>
            <li><strong>Entry Conditions:</strong> Position sizing and risk management for entries</li>
            <li><strong>Exit Conditions:</strong> Stop loss and take profit rules</li>
          </ul>
          
          <h3>How to Access the Strategy Builder:</h3>
          <ol>
            <li>Navigate to the Dashboard</li>
            <li>Click on "Strategy Builder" or use the navigation menu</li>
            <li>You'll see the builder interface with four main sections</li>
          </ol>
          
          <h3>Strategy Builder Interface:</h3>
          <ul>
            <li><strong>Header:</strong> Strategy name input and save/load options</li>
            <li><strong>Navigation Tabs:</strong> Switch between Conditions, Action, Entry, and Exit</li>
            <li><strong>Main Content:</strong> Configuration options for the selected section</li>
            <li><strong>Actions Bar:</strong> Save, load, and delete strategies</li>
          </ul>
        </div>
      )
    },
    {
      id: 'building-conditions',
      title: 'Building Trigger Conditions',
      category: 'strategy-builder-guide',
      content: (
        <div>
          <h3>Understanding Trigger Conditions</h3>
          <p>Trigger conditions are the foundation of your strategy. They define what market conditions must be present before your strategy will enter a trade.</p>
          
          <h3>Creating Conditions</h3>
          <h4>1. Add a Condition</h4>
          <p>Click the "Add Condition" button to create your first condition. Each condition has three parts:</p>
          <ul>
            <li><strong>Indicator:</strong> What to measure (RSI, MACD, Price, etc.)</li>
            <li><strong>Operator:</strong> How to compare (greater than, less than, crosses above, etc.)</li>
            <li><strong>Value:</strong> The threshold or comparison value</li>
          </ul>
          
          <h4>2. Configure Parameters</h4>
          <p>Many indicators have parameters you can adjust:</p>
          <ul>
            <li><strong>RSI:</strong> Period (default 14) - how many bars to calculate</li>
            <li><strong>MACD:</strong> Fast period, slow period, signal period</li>
            <li><strong>Moving Averages:</strong> Period for the average calculation</li>
            <li><strong>Bollinger Bands:</strong> Period and standard deviation multiplier</li>
          </ul>
          
          <h4>3. Set Comparison Values</h4>
          <p>Enter the values your indicator must meet:</p>
          <ul>
            <li><strong>RSI &gt; 70:</strong> RSI must be above 70 (overbought)</li>
            <li><strong>Price crosses above SMA:</strong> Price breaks above moving average</li>
            <li><strong>MACD &gt; 0:</strong> MACD line is above zero</li>
          </ul>
          
          <h3>Logical Operators</h3>
          <p>When you have multiple conditions, choose how they work together:</p>
          <ul>
            <li><strong>AND:</strong> All conditions must be true (more restrictive)</li>
            <li><strong>OR:</strong> Any condition can be true (more permissive)</li>
          </ul>
          
          <h3>Example Conditions</h3>
          <ul>
            <li><strong>RSI &lt; 30 AND Price &gt; SMA(20):</strong> Oversold in an uptrend</li>
            <li><strong>MACD crosses above Signal OR RSI &gt; 50:</strong> Momentum or strength</li>
            <li><strong>Price between Bollinger Lower and Middle:</strong> Mean reversion setup</li>
          </ul>
          
          <h3>Tips for Effective Conditions</h3>
          <ul>
            <li>Start simple with 1-2 conditions</li>
            <li>Use AND for confirmation, OR for flexibility</li>
            <li>Test different parameter values</li>
            <li>Avoid too many conditions (can overfit)</li>
          </ul>
        </div>
      )
    },
    {
      id: 'setting-actions',
      title: 'Setting Actions',
      category: 'strategy-builder-guide',
      content: (
        <div>
          <h3>Understanding Actions</h3>
          <p>Actions define what your strategy does when all trigger conditions are met. You can choose to go LONG (buy) or SHORT (sell) the asset.</p>
          
          <h3>Action Types</h3>
          
          <h4>LONG (Buy)</h4>
          <p>Your strategy will buy the asset when conditions are met. This is used for:</p>
          <ul>
            <li>Bullish strategies (expecting price to rise)</li>
            <li>Oversold bounces</li>
            <li>Breakout strategies</li>
            <li>Trend-following in uptrends</li>
          </ul>
          
          <h4>SHORT (Sell)</h4>
          <p>Your strategy will sell the asset when conditions are met. This is used for:</p>
          <ul>
            <li>Bearish strategies (expecting price to fall)</li>
            <li>Overbought reversals</li>
            <li>Breakdown strategies</li>
            <li>Trend-following in downtrends</li>
          </ul>
          
          <h3>Choosing the Right Action</h3>
          <p>Consider your market outlook and strategy logic:</p>
          <ul>
            <li><strong>Bullish Conditions + LONG:</strong> RSI oversold + uptrend = buy the dip</li>
            <li><strong>Bearish Conditions + SHORT:</strong> RSI overbought + downtrend = sell the rally</li>
            <li><strong>Breakout + LONG:</strong> Price breaks resistance = follow the breakout</li>
            <li><strong>Breakdown + SHORT:</strong> Price breaks support = follow the breakdown</li>
          </ul>
          
          <h3>Action Configuration</h3>
          <p>Simply click on LONG or SHORT to select your action. The selected action will be highlighted, and this will be used for all trades generated by your strategy.</p>
          
          <h3>Strategy Logic Examples</h3>
          <ul>
            <li><strong>Mean Reversion:</strong> Oversold conditions + LONG action</li>
            <li><strong>Momentum:</strong> Strong momentum + LONG action</li>
            <li><strong>Trend Following:</strong> Trend confirmation + LONG/SHORT based on direction</li>
            <li><strong>Breakout:</strong> Breakout conditions + LONG action</li>
          </ul>
        </div>
      )
    },
    {
      id: 'entry-conditions',
      title: 'Configuring Entry Conditions',
      category: 'strategy-builder-guide',
      content: (
        <div>
          <h3>Understanding Entry Conditions</h3>
          <p>Entry conditions determine how much capital to risk on each trade. This is crucial for risk management and position sizing.</p>
          
          <h3>Position Sizing Methods</h3>
          
          <h4>1. Fixed Percentage</h4>
          <p>Risk a fixed percentage of your portfolio on each trade.</p>
          <ul>
            <li><strong>Example:</strong> 2% of $10,000 = $200 per trade</li>
            <li><strong>Pros:</strong> Simple, scales with portfolio growth</li>
            <li><strong>Cons:</strong> Doesn't consider trade-specific risk</li>
          </ul>
          
          <h4>2. Fixed Dollar Amount</h4>
          <p>Risk a fixed dollar amount regardless of portfolio size.</p>
          <ul>
            <li><strong>Example:</strong> Always risk $500 per trade</li>
            <li><strong>Pros:</strong> Consistent risk exposure</li>
            <li><strong>Cons:</strong> Doesn't scale with portfolio growth</li>
          </ul>
          
          <h4>3. Risk-Based Sizing</h4>
          <p>Calculate position size based on stop loss distance.</p>
          <ul>
            <li><strong>Example:</strong> Risk 1% of portfolio, stop loss 2% away = 50% position</li>
            <li><strong>Pros:</strong> Consistent risk per trade</li>
            <li><strong>Cons:</strong> Requires stop loss calculation</li>
          </ul>
          
          <h4>4. Kelly Criterion</h4>
          <p>Optimal position sizing based on win rate and risk/reward ratio.</p>
          <ul>
            <li><strong>Formula:</strong> Kelly % = (Win Rate × Avg Win - Loss Rate × Avg Loss) / Avg Win</li>
            <li><strong>Pros:</strong> Mathematically optimal for long-term growth</li>
            <li><strong>Cons:</strong> Can suggest very large positions</li>
          </ul>
          
          <h4>5. Volatility-Based</h4>
          <p>Adjust position size based on market volatility (ATR).</p>
          <ul>
            <li><strong>Example:</strong> Larger positions in low volatility, smaller in high volatility</li>
            <li><strong>Pros:</strong> Adapts to market conditions</li>
            <li><strong>Cons:</strong> More complex to implement</li>
          </ul>
          
          <h3>Configuration Options</h3>
          <p>For each method, you can set:</p>
          <ul>
            <li><strong>Risk Per Trade:</strong> Percentage of portfolio to risk</li>
            <li><strong>Max Position Size:</strong> Maximum percentage of portfolio in one trade</li>
            <li><strong>Volatility Period:</strong> Number of days for ATR calculation</li>
          </ul>
          
          <h3>Best Practices</h3>
          <ul>
            <li>Start with 1-2% risk per trade</li>
            <li>Never risk more than 5% on a single trade</li>
            <li>Use max position size limits (10-20%)</li>
            <li>Consider using risk-based sizing for better risk management</li>
          </ul>
        </div>
      )
    },
    {
      id: 'exit-conditions',
      title: 'Configuring Exit Conditions',
      category: 'strategy-builder-guide',
      content: (
        <div>
          <h3>Understanding Exit Conditions</h3>
          <p>Exit conditions define when to close your positions to lock in profits or limit losses. This is essential for risk management.</p>
          
          <h3>Stop Loss Options</h3>
          
          <h4>1. Fixed Percentage</h4>
          <p>Exit when price moves against you by a fixed percentage.</p>
          <ul>
            <li><strong>Example:</strong> 5% stop loss on a $100 stock = exit at $95</li>
            <li><strong>Pros:</strong> Simple and effective</li>
            <li><strong>Cons:</strong> Doesn't adapt to volatility</li>
          </ul>
          
          <h4>2. Fixed Dollar Amount</h4>
          <p>Exit when you lose a fixed dollar amount.</p>
          <ul>
            <li><strong>Example:</strong> $200 stop loss regardless of position size</li>
            <li><strong>Pros:</strong> Consistent dollar risk</li>
            <li><strong>Cons:</strong> May be too tight or loose for different positions</li>
          </ul>
          
          <h4>3. Trailing Percentage</h4>
          <p>Stop loss that moves with favorable price movement.</p>
          <ul>
            <li><strong>Example:</strong> 5% trailing stop that activates after 3% profit</li>
            <li><strong>Pros:</strong> Locks in profits while letting winners run</li>
            <li><strong>Cons:</strong> Can exit too early in volatile markets</li>
          </ul>
          
          <h4>4. ATR-Based</h4>
          <p>Stop loss based on Average True Range (volatility).</p>
          <ul>
            <li><strong>Example:</strong> 2x ATR stop loss</li>
            <li><strong>Pros:</strong> Adapts to market volatility</li>
            <li><strong>Cons:</strong> Requires ATR calculation</li>
          </ul>
          
          <h4>5. Support/Resistance Level</h4>
          <p>Stop loss at key price levels.</p>
          <ul>
            <li><strong>Example:</strong> Stop below recent support level</li>
            <li><strong>Pros:</strong> Uses market structure</li>
            <li><strong>Cons:</strong> Requires manual level identification</li>
          </ul>
          
          <h3>Take Profit Options</h3>
          
          <h4>1. Fixed Percentage</h4>
          <p>Exit when price moves in your favor by a fixed percentage.</p>
          <ul>
            <li><strong>Example:</strong> 10% profit target</li>
            <li><strong>Pros:</strong> Simple profit taking</li>
            <li><strong>Cons:</strong> May exit too early or too late</li>
          </ul>
          
          <h4>2. Risk:Reward Ratio</h4>
          <p>Profit target based on your risk amount.</p>
          <ul>
            <li><strong>Example:</strong> 1:2 risk:reward (risk $100 to make $200)</li>
            <li><strong>Pros:</strong> Ensures positive expectancy</li>
            <li><strong>Cons:</strong> May not be achievable in all market conditions</li>
          </ul>
          
          <h4>3. Indicator-Based</h4>
          <p>Exit based on technical indicator signals.</p>
          <ul>
            <li><strong>Example:</strong> Exit when RSI reaches 70 (overbought)</li>
            <li><strong>Pros:</strong> Uses market momentum</li>
            <li><strong>Cons:</strong> May exit before full profit potential</li>
          </ul>
          
          <h3>Configuration Tips</h3>
          <ul>
            <li>Start with 2-5% stop losses</li>
            <li>Use 1:2 or 1:3 risk:reward ratios</li>
            <li>Consider trailing stops for trending markets</li>
            <li>Use ATR-based stops in volatile markets</li>
            <li>Test different exit combinations</li>
          </ul>
          
          <h3>Exit Strategy Examples</h3>
          <ul>
            <li><strong>Conservative:</strong> 3% stop loss + 6% profit target (1:2 ratio)</li>
            <li><strong>Aggressive:</strong> 5% stop loss + 15% profit target (1:3 ratio)</li>
            <li><strong>Trend Following:</strong> 2x ATR stop loss + trailing stop</li>
            <li><strong>Mean Reversion:</strong> 2% stop loss + RSI 70 exit</li>
          </ul>
        </div>
      )
    },
    {
      id: 'saving-strategies',
      title: 'Saving and Managing Strategies',
      category: 'strategy-builder-guide',
      content: (
        <div>
          <h3>Saving Your Strategy</h3>
          <p>Once you've configured your strategy, you need to save it before you can use it for backtesting.</p>
          
          <h4>1. Name Your Strategy</h4>
          <p>Enter a descriptive name in the strategy name field. Good names include:</p>
          <ul>
            <li>"RSI Oversold Bounce"</li>
            <li>"MACD Crossover Long"</li>
            <li>"Bollinger Band Mean Reversion"</li>
            <li>"Moving Average Trend Following"</li>
          </ul>
          
          <h4>2. Save the Strategy</h4>
          <p>Click the "Save Strategy" button. You'll see a confirmation message when it's saved successfully.</p>
          
          <h4>3. Verify Your Strategy</h4>
          <p>Make sure all sections are configured:</p>
          <ul>
            <li>✓ At least one trigger condition</li>
            <li>✓ Action selected (LONG or SHORT)</li>
            <li>✓ Entry conditions configured</li>
            <li>✓ Exit conditions configured</li>
          </ul>
          
          <h3>Loading Existing Strategies</h3>
          <p>To modify an existing strategy:</p>
          <ol>
            <li>Select the strategy from the "Load Strategy" dropdown</li>
            <li>The strategy will load with all its settings</li>
            <li>Make your modifications</li>
            <li>Save with the same name or a new name</li>
          </ol>
          
          <h3>Deleting Strategies</h3>
          <p>To remove a strategy you no longer need:</p>
          <ol>
            <li>Load the strategy you want to delete</li>
            <li>Click the "Delete" button</li>
            <li>Confirm the deletion in the popup</li>
            <li>The strategy will be permanently removed</li>
          </ol>
          
          <h3>Strategy Management Tips</h3>
          <ul>
            <li><strong>Version Control:</strong> Save different versions with descriptive names</li>
            <li><strong>Backup Important Strategies:</strong> Keep copies of your best-performing strategies</li>
            <li><strong>Documentation:</strong> Use clear names that describe the strategy logic</li>
            <li><strong>Testing:</strong> Always backtest before saving new strategies</li>
          </ul>
          
          <h3>Common Issues</h3>
          <ul>
            <li><strong>Can't Save:</strong> Make sure you have a strategy name and all required sections configured</li>
            <li><strong>Strategy Not Loading:</strong> Check that the strategy exists and you have permission to access it</li>
            <li><strong>Delete Failed:</strong> Make sure you're not trying to delete a strategy that's currently being used</li>
          </ul>
        </div>
      )
    },
    {
      id: 'strategy-examples',
      title: 'Strategy Examples',
      category: 'strategy-builder-guide',
      content: (
        <div>
          <h3>Example 1: RSI Oversold Bounce</h3>
          <p>A mean reversion strategy that buys when RSI indicates oversold conditions.</p>
          
          <h4>Trigger Conditions:</h4>
          <ul>
            <li>RSI &lt; 30 (oversold)</li>
            <li>Price &gt; SMA(20) (uptrend filter)</li>
          </ul>
          
          <h4>Action:</h4>
          <p>LONG (buy the dip)</p>
          
          <h4>Entry Conditions:</h4>
          <ul>
            <li>Position Sizing: Fixed Percentage (2%)</li>
            <li>Max Position Size: 10%</li>
          </ul>
          
          <h4>Exit Conditions:</h4>
          <ul>
            <li>Stop Loss: Fixed Percentage (3%)</li>
            <li>Take Profit: Risk:Reward Ratio (1:2)</li>
          </ul>
          
          <h3>Example 2: MACD Momentum Strategy</h3>
          <p>A trend-following strategy that trades MACD crossovers.</p>
          
          <h4>Trigger Conditions:</h4>
          <ul>
            <li>MACD crosses above Signal Line</li>
            <li>MACD &gt; 0 (bullish momentum)</li>
          </ul>
          
          <h4>Action:</h4>
          <p>LONG (follow the momentum)</p>
          
          <h4>Entry Conditions:</h4>
          <ul>
            <li>Position Sizing: Risk-Based (1% risk per trade)</li>
            <li>Max Position Size: 15%</li>
          </ul>
          
          <h4>Exit Conditions:</h4>
          <ul>
            <li>Stop Loss: ATR-Based (2x ATR)</li>
            <li>Take Profit: Trailing Stop (5% trailing, activates at 3% profit)</li>
          </ul>
          
          <h3>Example 3: Bollinger Band Breakout</h3>
          <p>A breakout strategy that trades when price breaks above Bollinger Bands.</p>
          
          <h4>Trigger Conditions:</h4>
          <ul>
            <li>Price crosses above Bollinger Upper Band</li>
                          <li>Volume &gt; SMA(20) (volume confirmation)</li>
          </ul>
          
          <h4>Action:</h4>
          <p>LONG (follow the breakout)</p>
          
          <h4>Entry Conditions:</h4>
          <ul>
            <li>Position Sizing: Kelly Criterion (max 20%)</li>
            <li>Risk Per Trade: 2%</li>
          </ul>
          
          <h4>Exit Conditions:</h4>
          <ul>
            <li>Stop Loss: Fixed Percentage (4%)</li>
            <li>Take Profit: Fixed Percentage (12%)</li>
          </ul>
          
          <h3>Example 4: Moving Average Crossover</h3>
          <p>A classic trend-following strategy using moving average crossovers.</p>
          
          <h4>Trigger Conditions:</h4>
          <ul>
            <li>SMA(10) crosses above SMA(20)</li>
            <li>Price &gt; SMA(50) (long-term trend filter)</li>
          </ul>
          
          <h4>Action:</h4>
          <p>LONG (follow the trend)</p>
          
          <h4>Entry Conditions:</h4>
          <ul>
            <li>Position Sizing: Volatility-Based (ATR period: 20)</li>
            <li>Max Position Size: 12%</li>
          </ul>
          
          <h4>Exit Conditions:</h4>
          <ul>
            <li>Stop Loss: Support/Resistance Level</li>
            <li>Take Profit: Risk:Reward Ratio (1:3)</li>
          </ul>
          
          <h3>Building Your Own Strategy</h3>
          <p>Start with these examples and modify them:</p>
          <ol>
            <li>Choose a strategy concept (mean reversion, momentum, breakout, trend-following)</li>
            <li>Select appropriate indicators for your concept</li>
            <li>Set logical conditions and operators</li>
            <li>Choose appropriate position sizing</li>
            <li>Configure risk management (stop loss and take profit)</li>
            <li>Test with backtesting</li>
            <li>Refine based on results</li>
          </ol>
        </div>
      )
    }
  ];

  const filteredSections = useMemo(() => {
    let filtered = helpSections.filter(section => section.category === selectedCategory);
    
    if (searchTerm) {
      filtered = filtered.filter(section => 
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (section.content && section.content.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [searchTerm, selectedCategory]);

  const categories = [
    { id: 'indicators', label: 'Technical Indicators', count: helpSections.filter(s => s.category === 'indicators').length },
    { id: 'entry-conditions', label: 'Entry Conditions', count: helpSections.filter(s => s.category === 'entry-conditions').length },
    { id: 'exit-conditions', label: 'Exit Conditions', count: helpSections.filter(s => s.category === 'exit-conditions').length },
    { id: 'concepts', label: 'Trading Concepts', count: helpSections.filter(s => s.category === 'concepts').length },
    { id: 'backtester-guide', label: 'Backtester Guide', count: helpSections.filter(s => s.category === 'backtester-guide').length },
    { id: 'strategy-builder-guide', label: 'Strategy Builder Guide', count: helpSections.filter(s => s.category === 'strategy-builder-guide').length }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryGrid(true);
  };

  const scrollToSection = (sectionId: string) => {
    console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      console.log('Element found, scrolling...');
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add a highlight effect
      element.classList.add('highlight-section');
      setTimeout(() => {
        element.classList.remove('highlight-section');
      }, 2000);
    } else {
      console.log('Element not found with ID:', sectionId);
      // Fallback: scroll to top
      setShowCategoryGrid(false);
    }
  };



  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      // Technical Indicators
      case 'rsi':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 7l3 3-3 3m4-4l3 3-3 3" />
          </svg>
        );
      case 'macd':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 7l3 3-3 3m4-4l3 3-3 3" />
          </svg>
        );
      case 'sma':
      case 'ema':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M6 6l3 3-3 3m6 0l3 3-3 3" />
          </svg>
        );
      case 'bollinger-bands':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M3 9h18M3 15h18" />
          </svg>
        );
      case 'stochastic':
      case 'williams-r':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
          </svg>
        );
      case 'atr':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M3 12h18M6 6l3 3-3 3m6 6l3 3-3 3" />
          </svg>
        );
      case 'volume':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        );
      case 'close':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      
      // Entry Conditions
      case 'position-sizing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      
      // Exit Conditions
      case 'stop-loss':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case 'trailing-stop':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M6 6l3 3-3 3m6 0l3 3-3 3" />
          </svg>
        );
      case 'take-profit':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" />
          </svg>
        );
      
      // Concepts
      case 'kelly-criterion':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
          </svg>
        );
      case 'risk-management':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case 'trend-analysis':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M6 6l3 3-3 3m6 0l3 3-3 3" />
          </svg>
        );
      
      // Backtester Guide - Better icons
      case 'backtester-overview':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'backtester-setup':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'backtester-results':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        );
      case 'backtester-tips':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        );
      
      // Strategy Builder Guide - Better icons
      case 'strategy-builder-overview':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 2.25L9 9l-6.75 6.75M15.75 2.25L9 9l-6.75 6.75" />
          </svg>
        );
      case 'building-conditions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case 'setting-actions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
          </svg>
        );
      case 'entry-conditions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        );
      case 'exit-conditions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case 'saving-strategies':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        );
      case 'strategy-examples':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.75l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
          </svg>
        );
      
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 004 6v2.25A2.25 2.25 0 006 10.5zm0 0h2.25A2.25 2.25 0 009 12.75v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V12.75A2.25 2.25 0 016 10.5z" />
          </svg>
        );
    }
  };

  const getCategoryDescription = (title: string) => {
    if (title.includes('RSI')) return 'Momentum oscillator for overbought/oversold conditions';
    if (title.includes('MACD')) return 'Trend-following momentum indicator';
    if (title.includes('SMA')) return 'Simple moving average for trend identification';
    if (title.includes('EMA')) return 'Exponential moving average for faster signals';
    if (title.includes('Bollinger')) return 'Volatility bands for price extremes';
    if (title.includes('Stochastic')) return 'Momentum indicator for reversal signals';
    if (title.includes('Williams')) return 'Oscillator for overbought/oversold levels';
    if (title.includes('ATR')) return 'Volatility measure for dynamic stops';
    if (title.includes('Volume')) return 'Trading volume for confirmation';
    if (title.includes('Close')) return 'Closing price for price analysis';
    if (title.includes('Position')) return 'Risk management and sizing strategies';
    if (title.includes('Stop Loss')) return 'Loss protection mechanisms';
    if (title.includes('Trailing')) return 'Dynamic stop loss strategies';
    if (title.includes('Take Profit')) return 'Profit-taking strategies';
    if (title.includes('Kelly')) return 'Optimal position sizing formula';
    if (title.includes('Risk Management')) return 'Portfolio protection principles';
    if (title.includes('Trend Analysis')) return 'Market direction identification';
    if (title.includes('Backtester Overview')) return 'Introduction to strategy backtesting';
    if (title.includes('Setting Up a Backtest')) return 'Step-by-step backtest configuration';
    if (title.includes('Understanding Backtest Results')) return 'How to interpret backtest performance';
    if (title.includes('Backtesting Best Practices')) return 'Tips for reliable backtest results';
    if (title.includes('Strategy Builder Overview')) return 'Introduction to visual strategy creation';
    if (title.includes('Building Trigger Conditions')) return 'Creating market condition rules';
    if (title.includes('Setting Actions')) return 'Defining buy/sell signals';
    if (title.includes('Configuring Entry Conditions')) return 'Position sizing and risk management';
    if (title.includes('Configuring Exit Conditions')) return 'Stop loss and take profit setup';
    if (title.includes('Saving and Managing Strategies')) return 'Strategy storage and organization';
    if (title.includes('Strategy Examples')) return 'Complete strategy templates and examples';
    return 'Click to learn more about this topic';
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Help & Documentation</h1>
        <p>Learn about technical indicators, trading strategies, and risk management concepts</p>
      </div>

      <div className="help-search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search for indicators, concepts, or strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="help-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <span className="category-label">{category.label}</span>
            <span className="category-count">{category.count}</span>
          </button>
        ))}
      </div>

      <div className="help-content">
        {filteredSections.length === 0 ? (
          <div className="no-results">
            <svg className="no-results-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <h3>No results found</h3>
            <p>Try adjusting your search terms or selecting a different category</p>
          </div>
        ) : (
          // Always show detailed sections, but conditionally show grid view above
          <>
            {showCategoryGrid && (
              // Category Grid View
              <div className="category-grid-view">
                <div className="grid-header">
                  <h2>{categories.find(c => c.id === selectedCategory)?.label}</h2>
                  <p>Click on any item to view detailed explanation</p>
                </div>
                <div className="category-grid">
                  {filteredSections.map(section => (
                    <div 
                      key={section.id} 
                      className="grid-item"
                      onClick={() => scrollToSection(section.id)}
                    >
                      <div className={`grid-item-icon ${section.category}`}>
                        {getSectionIcon(section.id)}
                      </div>
                      <h3>{section.title}</h3>
                      <p>{getCategoryDescription(section.title)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Detailed Sections View - Always visible */}
            {showCategoryGrid && (
              <div className="back-to-grid">
                <button 
                  className="back-to-grid-btn"
                  onClick={() => {
                    setShowCategoryGrid(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  Hide Grid View
                </button>
              </div>
            )}
            
            <div className="help-sections">
              {filteredSections.map(section => (
                <div key={section.id} id={section.id} className="help-section">
                  <div className="section-header">
                    <h2>{section.title}</h2>
                    <span className={`section-category ${section.category}`}>
                      {categories.find(c => c.id === selectedCategory)?.label}
                    </span>
                  </div>
                  <div className="section-content">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpPage;
