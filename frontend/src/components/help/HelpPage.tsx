import React, { useState, useMemo } from 'react';
import './HelpPage.css';

interface HelpSection {
  id: string;
  title: string;
  content: React.ReactNode;
  category: 'indicators' | 'entry-conditions' | 'exit-conditions' | 'concepts';
}

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('indicators');
  const [showCategoryGrid, setShowCategoryGrid] = useState(true);

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
    { id: 'concepts', label: 'Trading Concepts', count: helpSections.filter(s => s.category === 'concepts').length }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'indicators':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        );
      case 'entry-conditions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'exit-conditions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'concepts':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      <div className="grid-item-icon">
                        {getCategoryIcon(section.category)}
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
