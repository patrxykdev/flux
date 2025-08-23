// frontend/src/components/builder/ExitConditionSelector.tsx
import React, { useState } from 'react';
import type { ExitCondition, StopLossType, TakeProfitType, StopLossConfig, TakeProfitConfig } from './types';
import { STOP_LOSS_PRESETS, TAKE_PROFIT_PRESETS } from './types';
import './ExitConditionSelector.css';

interface ExitConditionSelectorProps {
  exitCondition: ExitCondition;
  onExitConditionChange: (exitCondition: ExitCondition) => void;
}

const ExitConditionSelector: React.FC<ExitConditionSelectorProps> = ({
  exitCondition,
  onExitConditionChange
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [activeTab, setActiveTab] = useState<'stopLoss' | 'takeProfit'>('stopLoss');

  // Ensure stopLoss and takeProfit exist with default values
  const ensureDefaultConfig = () => {
    if (!exitCondition.stopLoss) {
      onExitConditionChange({
        ...exitCondition,
        stopLoss: {
          type: 'fixed_percentage',
          value: 5
        }
      });
    }
    if (!exitCondition.takeProfit) {
      onExitConditionChange({
        ...exitCondition,
        takeProfit: {
          type: 'risk_reward_ratio',
          value: 2,
          riskRewardRatio: 2
        }
      });
    }
  };

  const handleStopLossPresetSelect = (preset: any) => {
    onExitConditionChange({
      ...exitCondition,
      stopLoss: {
        type: preset.type,
        value: preset.value,
        trailingActivation: preset.type.includes('trailing') ? 5 : undefined,
        atrPeriod: preset.type === 'atr_based' ? 14 : undefined
      }
    });
  };

  const handleTakeProfitPresetSelect = (preset: any) => {
    onExitConditionChange({
      ...exitCondition,
      takeProfit: {
        type: preset.type,
        value: preset.value,
        riskRewardRatio: preset.type === 'risk_reward_ratio' ? preset.value : undefined,
        indicator: preset.indicator,
        indicatorValue: preset.indicator ? preset.value.toString() : undefined
      }
    });
  };

  const handleStopLossChange = (field: keyof StopLossConfig, value: any) => {
    const currentStopLoss = exitCondition.stopLoss || { type: 'fixed_percentage', value: 5 };
    onExitConditionChange({
      ...exitCondition,
      stopLoss: {
        ...currentStopLoss,
        [field]: value
      }
    });
  };

  const handleTakeProfitChange = (field: keyof TakeProfitConfig, value: any) => {
    const currentTakeProfit = exitCondition.takeProfit || { type: 'risk_reward_ratio', value: 2, riskRewardRatio: 2 };
    onExitConditionChange({
      ...exitCondition,
      takeProfit: {
        ...currentTakeProfit,
        [field]: value
      }
    });
  };

  const renderStopLossFields = () => {
    const stopLoss = exitCondition.stopLoss;
    if (!stopLoss) return null;

    switch (stopLoss.type) {
      case 'fixed_percentage':
        return (
          <div className="custom-field">
            <label>Stop Loss Percentage:</label>
            <input
              type="number"
              value={stopLoss.value || ''}
              onChange={(e) => handleStopLossChange('value', parseFloat(e.target.value))}
              min="0.1"
              max="50"
              step="0.1"
              placeholder="5.0"
            />
            <span>%</span>
          </div>
        );

      case 'fixed_dollar':
        return (
          <div className="custom-field">
            <label>Stop Loss Amount:</label>
            <input
              type="number"
              value={stopLoss.value || ''}
              onChange={(e) => handleStopLossChange('value', parseFloat(e.target.value))}
              min="0.01"
              step="0.01"
              placeholder="100.00"
            />
            <span>$</span>
          </div>
        );

      case 'trailing_percentage':
        return (
          <div className="custom-fields">
            <div className="custom-field">
              <label>Trailing Percentage:</label>
              <input
                type="number"
                value={stopLoss.value || ''}
                onChange={(e) => handleStopLossChange('value', parseFloat(e.target.value))}
                min="0.1"
                max="50"
                step="0.1"
                placeholder="5.0"
              />
              <span>%</span>
            </div>
            <div className="custom-field">
              <label>Activation Profit:</label>
              <input
                type="number"
                value={stopLoss.trailingActivation || ''}
                onChange={(e) => handleStopLossChange('trailingActivation', parseFloat(e.target.value))}
                min="0.1"
                max="50"
                step="0.1"
                placeholder="5.0"
              />
              <span>%</span>
            </div>
          </div>
        );

      case 'atr_based':
        return (
          <div className="custom-fields">
            <div className="custom-field">
              <label>ATR Multiplier:</label>
              <input
                type="number"
                value={stopLoss.value || ''}
                onChange={(e) => handleStopLossChange('value', parseFloat(e.target.value))}
                min="0.5"
                max="10"
                step="0.1"
                placeholder="2.0"
              />
              <span>x ATR</span>
            </div>
            <div className="custom-field">
              <label>ATR Period:</label>
              <input
                type="number"
                value={stopLoss.atrPeriod || ''}
                onChange={(e) => handleStopLossChange('atrPeriod', parseInt(e.target.value))}
                min="5"
                max="100"
                step="1"
                placeholder="14"
              />
              <span>days</span>
            </div>
          </div>
        );

      case 'support_resistance':
        return (
          <div className="custom-field">
            <label>Price Level:</label>
            <input
              type="number"
              value={stopLoss.supportResistanceLevel || ''}
              onChange={(e) => handleStopLossChange('supportResistanceLevel', parseFloat(e.target.value))}
              min="0.01"
              step="0.01"
              placeholder="100.00"
            />
            <span>$</span>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTakeProfitFields = () => {
    const takeProfit = exitCondition.takeProfit;
    if (!takeProfit) return null;

    switch (takeProfit.type) {
      case 'fixed_percentage':
        return (
          <div className="custom-field">
            <label>Profit Target Percentage:</label>
            <input
              type="number"
              value={takeProfit.value || ''}
              onChange={(e) => handleTakeProfitChange('value', parseFloat(e.target.value))}
              min="0.1"
              max="100"
              step="0.1"
              placeholder="10.0"
            />
            <span>%</span>
          </div>
        );

      case 'fixed_dollar':
        return (
          <div className="custom-field">
            <label>Profit Target Amount:</label>
            <input
              type="number"
              value={takeProfit.value || ''}
              onChange={(e) => handleTakeProfitChange('value', parseFloat(e.target.value))}
              min="0.01"
              step="0.01"
              placeholder="200.00"
            />
            <span>$</span>
          </div>
        );

      case 'risk_reward_ratio':
        return (
          <div className="custom-field">
            <label>Risk:Reward Ratio:</label>
            <input
              type="number"
              value={takeProfit.riskRewardRatio || ''}
              onChange={(e) => handleTakeProfitChange('riskRewardRatio', parseFloat(e.target.value))}
              min="0.5"
              max="10"
              step="0.1"
              placeholder="2.0"
            />
            <span>1:</span>
          </div>
        );

      case 'indicator_based':
        return (
          <div className="custom-fields">
            <div className="custom-field">
              <label>Indicator:</label>
              <select
                value={takeProfit.indicator || 'RSI'}
                onChange={(e) => handleTakeProfitChange('indicator', e.target.value)}
              >
                <option value="RSI">RSI</option>
                <option value="Stochastic">Stochastic</option>
                <option value="Williams_R">Williams %R</option>
                <option value="MACD">MACD</option>
              </select>
            </div>
            <div className="custom-field">
              <label>Exit Value:</label>
              <input
                type="number"
                value={takeProfit.indicatorValue || ''}
                onChange={(e) => handleTakeProfitChange('indicatorValue', e.target.value)}
                placeholder="70"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getExitDescription = () => {
    let description = '';
    
    if (exitCondition.stopLoss) {
      const sl = exitCondition.stopLoss;
      switch (sl.type) {
        case 'fixed_percentage':
          description += `${sl.value}% Stop Loss`;
          break;
        case 'fixed_dollar':
          description += `$${sl.value} Stop Loss`;
          break;
        case 'trailing_percentage':
          description += `${sl.value}% Trailing Stop (activates at ${sl.trailingActivation}% profit)`;
          break;
        case 'atr_based':
          description += `${sl.value}x ATR Stop (${sl.atrPeriod} day period)`;
          break;
        case 'support_resistance':
          description += `Stop at $${sl.supportResistanceLevel}`;
          break;
      }
    }

    if (exitCondition.takeProfit) {
      if (description) description += ' + ';
      const tp = exitCondition.takeProfit;
      switch (tp.type) {
        case 'fixed_percentage':
          description += `${tp.value}% Profit Target`;
          break;
        case 'fixed_dollar':
          description += `$${tp.value} Profit Target`;
          break;
        case 'risk_reward_ratio':
          description += `1:${tp.riskRewardRatio} Risk:Reward`;
          break;
        case 'indicator_based':
          description += `${tp.indicator} > ${tp.indicatorValue} Exit`;
          break;
      }
    }

    return description || 'No exit conditions configured';
  };

  // Ensure default config when component mounts
  React.useEffect(() => {
    ensureDefaultConfig();
  }, []);

  return (
    <div className="exit-condition-selector">
      <h4>Risk Management</h4>
      <p className="exit-description">
        Define stop loss and take profit levels to manage your risk and lock in profits.
      </p>

      {/* Stop Loss and Take Profit Tabs */}
      <div className="exit-tabs">
        <button
          className={`exit-tab ${activeTab === 'stopLoss' ? 'active' : ''}`}
          onClick={() => setActiveTab('stopLoss')}
        >
          Stop Loss
        </button>
        <button
          className={`exit-tab ${activeTab === 'takeProfit' ? 'active' : ''}`}
          onClick={() => setActiveTab('takeProfit')}
        >
          Take Profit
        </button>
      </div>

      {/* Stop Loss Section */}
      {activeTab === 'stopLoss' && (
        <div className="exit-section">
          <h5>Stop Loss Options</h5>
          <div className="exit-presets">
            {STOP_LOSS_PRESETS.map((preset, index) => (
              <button
                key={index}
                className={`preset-button ${exitCondition.stopLoss?.type === preset.type && 
                  exitCondition.stopLoss?.value === preset.value ? 'selected' : ''}`}
                onClick={() => handleStopLossPresetSelect(preset)}
              >
                <div className="preset-label">{preset.label}</div>
                <div className="preset-description">{preset.description}</div>
              </button>
            ))}
          </div>

          <div className="custom-exit-section">
            <button
              className="custom-toggle-button"
              onClick={() => setShowCustom(!showCustom)}
            >
              {showCustom ? 'Hide' : 'Show'} Custom Stop Loss
            </button>

            {showCustom && (
              <div className="custom-exit-config">
                <div className="custom-field">
                  <label>Stop Loss Type:</label>
                  <select
                    value={exitCondition.stopLoss?.type || 'fixed_percentage'}
                    onChange={(e) => {
                      if (!exitCondition.stopLoss) {
                        onExitConditionChange({
                          ...exitCondition,
                          stopLoss: { type: e.target.value as StopLossType, value: 5 }
                        });
                      } else {
                        handleStopLossChange('type', e.target.value as StopLossType);
                      }
                    }}
                  >
                    <option value="fixed_percentage">Fixed Percentage</option>
                    <option value="fixed_dollar">Fixed Dollar Amount</option>
                    <option value="trailing_percentage">Trailing Percentage</option>
                    <option value="atr_based">ATR-Based</option>
                    <option value="support_resistance">Support/Resistance Level</option>
                  </select>
                </div>

                {renderStopLossFields()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Take Profit Section */}
      {activeTab === 'takeProfit' && (
        <div className="exit-section">
          <h5>Take Profit Options</h5>
          <div className="exit-presets">
            {TAKE_PROFIT_PRESETS.map((preset, index) => (
              <button
                key={index}
                className={`preset-button ${exitCondition.takeProfit?.type === preset.type && 
                  exitCondition.takeProfit?.value === preset.value ? 'selected' : ''}`}
                onClick={() => handleTakeProfitPresetSelect(preset)}
              >
                <div className="preset-label">{preset.label}</div>
                <div className="preset-description">{preset.description}</div>
              </button>
            ))}
          </div>

          <div className="custom-exit-section">
            <button
              className="custom-toggle-button"
              onClick={() => setShowCustom(!showCustom)}
            >
              {showCustom ? 'Hide' : 'Show'} Custom Take Profit
            </button>

            {showCustom && (
              <div className="custom-exit-config">
                <div className="custom-field">
                  <label>Take Profit Type:</label>
                  <select
                    value={exitCondition.takeProfit?.type || 'fixed_percentage'}
                    onChange={(e) => {
                      if (!exitCondition.takeProfit) {
                        onExitConditionChange({
                          ...exitCondition,
                          takeProfit: { type: e.target.value as TakeProfitType, value: 10 }
                        });
                      } else {
                        handleTakeProfitChange('type', e.target.value as TakeProfitType);
                      }
                    }}
                  >
                    <option value="fixed_percentage">Fixed Percentage</option>
                    <option value="fixed_dollar">Fixed Dollar Amount</option>
                    <option value="risk_reward_ratio">Risk:Reward Ratio</option>
                    <option value="indicator_based">Indicator-Based</option>
                  </select>
                </div>

                {renderTakeProfitFields()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      <div className="current-exit-display">
        <strong>Current Risk Management:</strong> {getExitDescription()}
      </div>
    </div>
  );
};

export default ExitConditionSelector; 