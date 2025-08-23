// frontend/src/components/builder/ConditionRow.tsx
import React from 'react';
import type { Condition, IndicatorType, OperatorType } from './types';
import { useBuilderStore } from './builderStore';
import { INDICATOR_PARAMS } from './types';

interface ConditionRowProps {
  condition: Condition;
}

const ConditionRow: React.FC<ConditionRowProps> = ({ condition }) => {
  const { updateCondition, removeCondition } = useBuilderStore();
  
  const hasParams = INDICATOR_PARAMS[condition.indicator as keyof typeof INDICATOR_PARAMS] && 
    Object.keys(INDICATOR_PARAMS[condition.indicator as keyof typeof INDICATOR_PARAMS]).length > 0;

  const isCrossOperator = (operator: OperatorType) => {
    return operator === 'crosses_above' || operator === 'crosses_below';
  };

  const renderParameterInputs = () => {
    const params = INDICATOR_PARAMS[condition.indicator as keyof typeof INDICATOR_PARAMS];
    
    if (!params || Object.keys(params).length === 0) {
      return null;
    }

    return (
      <div className="parameter-inputs">
        <div className="parameter-header">
          <span className="parameter-title">Parameters</span>
        </div>
        <div className="parameter-grid">
          {Object.entries(params).map(([key, defaultValue]) => (
            <div key={key} className="parameter-input">
              <label>{key.replace('_', ' ').toUpperCase()}:</label>
              <input
                type="number"
                value={condition[key as keyof Condition] ?? defaultValue}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const value = inputValue === '' ? undefined : (parseInt(inputValue) || defaultValue);
                  updateCondition(condition.id, key as keyof Condition, value as any);
                }}
                min="1"
                max="200"
                className="parameter-field"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCrossComparisonInputs = () => {
    if (!isCrossOperator(condition.operator)) return null;

    return (
      <div className="cross-comparison-inputs">
        <div className="cross-header">
          <span className="cross-title">Cross Comparison</span>
        </div>
        <div className="cross-indicator-select">
          <label>Crosses:</label>
          <select 
            value={condition.compareIndicator || 'Close'}
            onChange={(e) => updateCondition(condition.id, 'compareIndicator', e.target.value as IndicatorType)}
            className="cross-select"
          >
            <option value="Close">Price</option>
            <option value="SMA">SMA</option>
            <option value="EMA">EMA</option>
            <option value="RSI">RSI</option>
            <option value="MACD">MACD</option>
            <option value="Stochastic">Stochastic</option>
            <option value="Williams_R">Williams %R</option>
            <option value="Bollinger_Bands">Bollinger Bands</option>
            <option value="ATR">ATR</option>
            <option value="Volume">Volume</option>
          </select>
        </div>
        
        {condition.compareIndicator && condition.compareIndicator !== 'Close' && (
          <div className="compare-parameter-inputs">
            {Object.entries(INDICATOR_PARAMS[condition.compareIndicator as keyof typeof INDICATOR_PARAMS] || {}).map(([key, defaultValue]) => (
              <div key={`compare_${key}`} className="parameter-input">
                <label>Compare {key.replace('_', ' ').toUpperCase()}:</label>
                <input
                  type="number"
                  value={String(condition[`compare${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof Condition] ?? defaultValue)}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const value = inputValue === '' ? undefined : (parseInt(inputValue) || defaultValue);
                    updateCondition(condition.id, `compare${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof Condition, value as string | number | undefined);
                  }}
                  min="1"
                  max="200"
                  className="parameter-field"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderValueInput = () => {
    if (isCrossOperator(condition.operator)) {
      return (
        <div className="value-input-wrapper">
          <input 
            type="text" 
            className="form-input value-input"
            placeholder="Value (optional)"
            value={condition.compareValue || ''}
            onChange={(e) => updateCondition(condition.id, 'compareValue', e.target.value)}
          />
        </div>
      );
    }

    if (condition.operator === 'between' || condition.operator === 'outside') {
      return (
        <div className="range-inputs">
          <div className="range-input-group">
            <label>Min</label>
            <input 
              type="text" 
              className="form-input value-input"
              placeholder="Min"
              value={condition.value}
              onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
            />
          </div>
          <div className="range-separator">
            <span>and</span>
          </div>
          <div className="range-input-group">
            <label>Max</label>
            <input 
              type="text" 
              className="form-input value-input"
              placeholder="Max"
              value={condition.compareValue || ''}
              onChange={(e) => updateCondition(condition.id, 'compareValue', e.target.value)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="value-input-wrapper">
        <input 
          type="text" 
          className="form-input value-input"
          placeholder="Value"
          value={condition.value}
          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="condition-row">
      <div className="condition-main">
        <div className="condition-indicator">
          <select 
            className="form-select indicator-select"
            value={condition.indicator}
            onChange={(e) => updateCondition(condition.id, 'indicator', e.target.value as IndicatorType)}
          >
            <option value="RSI">RSI</option>
            <option value="MACD">MACD</option>
            <option value="SMA">SMA</option>
            <option value="EMA">EMA</option>
            <option value="Bollinger_Bands">Bollinger Bands</option>
            <option value="Stochastic">Stochastic</option>
            <option value="Williams_R">Williams %R</option>
            <option value="ATR">ATR</option>
            <option value="Volume">Volume</option>
            <option value="Close">Price</option>
          </select>
        </div>
        
        <div className="condition-operator">
          <select 
            className="form-select operator-select"
            value={condition.operator}
            onChange={(e) => updateCondition(condition.id, 'operator', e.target.value as OperatorType)}
          >
            <option value="less_than">{'<'}</option>
            <option value="greater_than">{'>'}</option>
            <option value="equals">{'='}</option>
            <option value="not_equals">{'≠'}</option>
            <option value="crosses_above">Crosses Above</option>
            <option value="crosses_below">Crosses Below</option>
            <option value="between">Between</option>
            <option value="outside">Outside</option>
          </select>
        </div>
        
        <div className="condition-value">
          {renderValueInput()}
        </div>
      </div>
      
      {hasParams && renderParameterInputs()}
      {renderCrossComparisonInputs()}
      
      <div className="condition-actions">
        <button 
          onClick={() => removeCondition(condition.id)} 
          className="remove-button"
          title="Remove condition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConditionRow;