// frontend/src/components/builder/types.ts

export type IndicatorType = 
  | 'RSI' 
  | 'MACD' 
  | 'Close' 
  | 'SMA' 
  | 'EMA' 
  | 'Bollinger_Bands' 
  | 'Stochastic' 
  | 'Williams_R' 
  | 'ATR' 
  | 'Volume';

export type OperatorType = 
  | 'less_than' 
  | 'greater_than' 
  | 'crosses_above' 
  | 'crosses_below'
  | 'equals'
  | 'not_equals'
  | 'between'
  | 'outside';

export type TimeUnit = 'days' | 'hours' | 'minutes';

// New types for enhanced exit conditions
export type StopLossType = 
  | 'fixed_percentage'    // Fixed percentage stop loss
  | 'fixed_dollar'        // Fixed dollar amount stop loss
  | 'trailing_percentage' // Trailing percentage stop loss
  | 'trailing_dollar'     // Trailing dollar amount stop loss
  | 'atr_based'           // ATR-based stop loss
  | 'support_resistance'; // Support/resistance based

export type TakeProfitType = 
  | 'fixed_percentage'    // Fixed percentage take profit
  | 'fixed_dollar'        // Fixed dollar amount take profit
  | 'risk_reward_ratio'   // Risk:Reward ratio based
  | 'indicator_based';    // Indicator-based take profit

// New types for entry conditions
export type PositionSizingType = 
  | 'fixed_percentage'    // Fixed percentage of portfolio
  | 'fixed_dollar'        // Fixed dollar amount
  | 'kelly_criterion'     // Kelly Criterion sizing
  | 'risk_based'          // Risk-based sizing (1-2% risk per trade)
  | 'volatility_based';   // Volatility-adjusted sizing

export interface EntryCondition {
  positionSizing: PositionSizingType;
  sizingValue: number;           // Percentage, dollar amount, or risk percentage
  maxPositionSize?: number;       // Maximum position size as percentage of portfolio
  riskPerTrade?: number;          // Risk per trade as percentage (for risk-based sizing)
  volatilityPeriod?: number;      // Period for volatility calculation
}

export interface StopLossConfig {
  type: StopLossType;
  value: number;           // Percentage, dollar amount, or ATR multiplier
  trailingActivation?: number; // Percentage profit to activate trailing stop
  atrPeriod?: number;      // ATR period for ATR-based stops
  supportResistanceLevel?: number; // Price level for support/resistance stops
}

export interface TakeProfitConfig {
  type: TakeProfitType;
  value: number;           // Percentage, dollar amount, or risk:reward ratio
  riskRewardRatio?: number; // Risk:Reward ratio (e.g., 1:2, 1:3)
  indicator?: IndicatorType; // For indicator-based take profit
  indicatorValue?: string;   // Indicator value for take profit
}

export interface ExitCondition {
  stopLoss: StopLossConfig;
  takeProfit: TakeProfitConfig;
}

export interface Condition {
  id: string;
  indicator: IndicatorType;
  operator: OperatorType;
  value: string;
  // For cross-indicator comparisons
  compareIndicator?: IndicatorType;
  compareValue?: string;
  // Additional parameters for indicators
  period?: number;
  fast_period?: number;
  slow_period?: number;
  signal_period?: number;
  upper_band?: number;
  lower_band?: number;
  k_period?: number;
  d_period?: number;
  // For comparison indicators
  comparePeriod?: number;
  compareFastPeriod?: number;
  compareSlowPeriod?: number;
  compareSignalPeriod?: number;
  compareUpperBand?: number;
  compareLowerBand?: number;
  compareKPeriod?: number;
  compareDPeriod?: number;
}

export interface StrategyConfiguration {
  conditions: Condition[];
  logicalOperator: 'AND' | 'OR';
  action: 'LONG' | 'SHORT';
  entryCondition: EntryCondition;
  exitCondition: ExitCondition;
}

// Indicator parameter definitions
export const INDICATOR_PARAMS = {
  RSI: { period: 14 },
  MACD: { fast_period: 12, slow_period: 26, signal_period: 9 },
  SMA: { period: 20 },
  EMA: { period: 20 },
  Bollinger_Bands: { period: 20, upper_band: 2, lower_band: 2 },
  Stochastic: { k_period: 14, d_period: 3 },
  Williams_R: { period: 14 },
  ATR: { period: 14 },
  Volume: {},
  Close: {}
} as const;

// Position sizing presets
export const POSITION_SIZING_PRESETS = [
  { label: '2% Portfolio', type: 'fixed_percentage', value: 2, description: 'Use 2% of portfolio per trade' },
  { label: '$1000 Fixed', type: 'fixed_dollar', value: 1000, description: 'Fixed $1000 per trade' },
  { label: '1% Risk', type: 'risk_based', value: 1, description: 'Risk 1% of portfolio per trade' },
  { label: 'Kelly Criterion', type: 'kelly_criterion', value: 0, description: 'Dynamic sizing based on win rate and odds' },
] as const;

// Stop loss presets
export const STOP_LOSS_PRESETS = [
  { label: '2% Stop Loss', type: 'fixed_percentage', value: 2, description: 'Fixed 2% stop loss' },
  { label: '5% Stop Loss', type: 'fixed_percentage', value: 5, description: 'Fixed 5% stop loss' },
  { label: '2x ATR Stop', type: 'atr_based', value: 2, description: 'Stop loss at 2x ATR from entry' },
  { label: '10% Trailing Stop', type: 'trailing_percentage', value: 10, description: 'Trailing 10% stop loss' },
] as const;

// Take profit presets
export const TAKE_PROFIT_PRESETS = [
  { label: '1:2 Risk:Reward', type: 'risk_reward_ratio', value: 2, description: 'Take profit at 2x the risk' },
  { label: '5% Profit Target', type: 'fixed_percentage', value: 5, description: 'Fixed 5% profit target' },
  { label: '10% Profit Target', type: 'fixed_percentage', value: 10, description: 'Fixed 10% profit target' },
  { label: 'RSI > 70 Exit', type: 'indicator_based', value: 70, indicator: 'RSI', description: 'Exit when RSI exceeds 70' },
] as const;

// Common indicator combinations for cross-comparisons
export const COMMON_CROSSES = [
  { label: 'SMA crosses EMA', indicator1: 'SMA', indicator2: 'EMA' },
  { label: 'EMA crosses SMA', indicator1: 'EMA', indicator2: 'SMA' },
  { label: 'Price crosses SMA', indicator1: 'Close', indicator2: 'SMA' },
  { label: 'Price crosses EMA', indicator1: 'Close', indicator2: 'EMA' },
  { label: 'RSI crosses 30', indicator1: 'RSI', indicator2: 'Close' },
  { label: 'RSI crosses 70', indicator1: 'RSI', indicator2: 'Close' },
  { label: 'MACD crosses Signal', indicator1: 'MACD', indicator2: 'MACD' },
  { label: 'Stochastic crosses 20', indicator1: 'Stochastic', indicator2: 'Close' },
  { label: 'Stochastic crosses 80', indicator1: 'Stochastic', indicator2: 'Close' },
] as const;