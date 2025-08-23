// frontend/src/components/builder/EntryConditionSelector.tsx
import React, { useState } from 'react';
import type { EntryCondition, PositionSizingType } from './types';
import { POSITION_SIZING_PRESETS } from './types';
import './EntryConditionSelector.css';

interface EntryConditionSelectorProps {
  entryCondition: EntryCondition;
  onEntryConditionChange: (entryCondition: EntryCondition) => void;
}

const EntryConditionSelector: React.FC<EntryConditionSelectorProps> = ({
  entryCondition,
  onEntryConditionChange
}) => {
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetSelect = (preset: any) => {
    onEntryConditionChange({
      positionSizing: preset.type,
      sizingValue: preset.value,
      maxPositionSize: entryCondition.maxPositionSize || 10,
      riskPerTrade: entryCondition.riskPerTrade || 1,
      volatilityPeriod: entryCondition.volatilityPeriod || 20
    });
    setShowCustom(false);
  };

  const handleCustomChange = (field: keyof EntryCondition, value: any) => {
    onEntryConditionChange({
      ...entryCondition,
      [field]: value
    });
  };

  const renderCustomFields = () => {
    switch (entryCondition.positionSizing) {
      case 'fixed_percentage':
        return (
          <div className="custom-field">
            <label>Portfolio Percentage:</label>
            <input
              type="number"
              value={entryCondition.sizingValue || ''}
              onChange={(e) => handleCustomChange('sizingValue', parseFloat(e.target.value))}
              min="0.1"
              max="100"
              step="0.1"
              placeholder="2.0"
            />
            <span>%</span>
          </div>
        );

      case 'fixed_dollar':
        return (
          <div className="custom-field">
            <label>Dollar Amount:</label>
            <input
              type="number"
              value={entryCondition.sizingValue || ''}
              onChange={(e) => handleCustomChange('sizingValue', parseFloat(e.target.value))}
              min="1"
              step="1"
              placeholder="1000"
            />
            <span>$</span>
          </div>
        );

      case 'risk_based':
        return (
          <div className="custom-fields">
            <div className="custom-field">
              <label>Risk Per Trade:</label>
              <input
                type="number"
                value={entryCondition.riskPerTrade || ''}
                onChange={(e) => handleCustomChange('riskPerTrade', parseFloat(e.target.value))}
                min="0.1"
                max="5"
                step="0.1"
                placeholder="1.0"
              />
              <span>%</span>
            </div>
            <div className="custom-field">
              <label>Max Position Size:</label>
              <input
                type="number"
                value={entryCondition.maxPositionSize || ''}
                onChange={(e) => handleCustomChange('maxPositionSize', parseFloat(e.target.value))}
                min="1"
                max="50"
                step="1"
                placeholder="10"
              />
              <span>%</span>
            </div>
          </div>
        );

      case 'kelly_criterion':
        return (
          <div className="custom-field">
            <label>Max Position Size:</label>
            <input
              type="number"
              value={entryCondition.maxPositionSize || ''}
              onChange={(e) => handleCustomChange('maxPositionSize', parseFloat(e.target.value))}
              min="1"
              max="50"
              step="1"
              placeholder="10"
            />
            <span>%</span>
          </div>
        );

      case 'volatility_based':
        return (
          <div className="custom-fields">
            <div className="custom-field">
              <label>Volatility Period:</label>
              <input
                type="number"
                value={entryCondition.volatilityPeriod || ''}
                onChange={(e) => handleCustomChange('volatilityPeriod', parseInt(e.target.value))}
                min="5"
                max="100"
                step="1"
                placeholder="20"
              />
              <span>days</span>
            </div>
            <div className="custom-field">
              <label>Max Position Size:</label>
              <input
                type="number"
                value={entryCondition.maxPositionSize || ''}
                onChange={(e) => handleCustomChange('maxPositionSize', parseFloat(e.target.value))}
                min="1"
                max="50"
                step="1"
                placeholder="10"
              />
              <span>%</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getPositionSizingDescription = () => {
    switch (entryCondition.positionSizing) {
      case 'fixed_percentage':
        return `${entryCondition.sizingValue}% of portfolio`;
      case 'fixed_dollar':
        return `$${entryCondition.sizingValue} fixed amount`;
      case 'risk_based':
        return `${entryCondition.riskPerTrade}% risk per trade (max ${entryCondition.maxPositionSize}% position)`;
      case 'kelly_criterion':
        return `Kelly Criterion (max ${entryCondition.maxPositionSize}% position)`;
      case 'volatility_based':
        return `Volatility-adjusted (${entryCondition.volatilityPeriod} day period, max ${entryCondition.maxPositionSize}% position)`;
      default:
        return 'Not configured';
    }
  };

  return (
    <div className="entry-condition-selector">
      <h4>Position Sizing</h4>
      <p className="entry-description">
        Define how much capital to allocate to each trade based on your risk management strategy.
      </p>

      {/* Preset Buttons */}
      <div className="entry-presets">
        {POSITION_SIZING_PRESETS.map((preset, index) => (
          <button
            key={index}
            className={`preset-button ${entryCondition.positionSizing === preset.type ? 'selected' : ''}`}
            onClick={() => handlePresetSelect(preset)}
          >
            <div className="preset-label">{preset.label}</div>
            <div className="preset-description">{preset.description}</div>
          </button>
        ))}
      </div>

      {/* Custom Configuration */}
      <div className="custom-entry-section">
        <button
          className="custom-toggle-button"
          onClick={() => setShowCustom(!showCustom)}
        >
          {showCustom ? 'Hide' : 'Show'} Custom Configuration
        </button>

        {showCustom && (
          <div className="custom-entry-config">
            <div className="custom-field">
              <label>Sizing Type:</label>
              <select
                value={entryCondition.positionSizing}
                onChange={(e) => handleCustomChange('positionSizing', e.target.value as PositionSizingType)}
              >
                <option value="fixed_percentage">Fixed Percentage</option>
                <option value="fixed_dollar">Fixed Dollar Amount</option>
                <option value="risk_based">Risk-Based Sizing</option>
                <option value="kelly_criterion">Kelly Criterion</option>
                <option value="volatility_based">Volatility-Based</option>
              </select>
            </div>

            {renderCustomFields()}
          </div>
        )}
      </div>

      {/* Current Selection Display */}
      <div className="current-entry-display">
        <strong>Current Sizing:</strong> {getPositionSizingDescription()}
      </div>
    </div>
  );
};

export default EntryConditionSelector;
