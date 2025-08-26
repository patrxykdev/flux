// frontend/src/components/builder/builderStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import api from '../../api';
import type { Condition, StrategyConfiguration, IndicatorType, ExitCondition, EntryCondition } from './types';

interface BuilderState {
  conditions: Condition[];
  logicalOperator: 'AND' | 'OR';
  action: 'LONG' | 'SHORT';
  entryCondition: EntryCondition;
  exitCondition: ExitCondition;
  savedStrategies: Array<{ id: number; name: string }>;
  
  // Actions
  setLogicalOperator: (operator: 'AND' | 'OR') => void;
  setAction: (action: 'LONG' | 'SHORT') => void;
  setEntryCondition: (entryCondition: EntryCondition) => void;
  setExitCondition: (exitCondition: ExitCondition) => void;
  addCondition: () => void;
  updateCondition: (id: string, field: keyof Condition, value: any) => void;
  removeCondition: (id: string) => void;
  resetBuilder: () => void;
  saveStrategy: (name: string) => Promise<any>;
  fetchSavedStrategies: () => Promise<void>;
  loadStrategy: (id: number) => any;
  deleteStrategy: (strategyId: number) => Promise<void>;
}

const initialState = {
  conditions: [{ 
    id: nanoid(), 
    indicator: 'RSI' as IndicatorType, 
    operator: 'less_than' as const, 
    value: '30',
    period: 14
  }],
  logicalOperator: 'AND' as const,
  action: 'LONG' as const,
  entryCondition: {
    positionSizing: 'fixed_percentage' as const,
    sizingValue: 2,
    maxPositionSize: 10
  },
  exitCondition: {
    type: 'manual' as const,
    stopLoss: {
      type: 'fixed_percentage' as const,
      value: 5
    },
    takeProfit: {
      type: 'risk_reward_ratio' as const,
      value: 2,
      riskRewardRatio: 2
    }
  },
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...initialState,
  savedStrategies: [],

  setLogicalOperator: (operator) => set({ logicalOperator: operator }),
  setAction: (action) => set({ action: action }),
  setEntryCondition: (entryCondition) => set({ entryCondition }),
  setExitCondition: (exitCondition) => set({ exitCondition }),
  
  addCondition: () => {
    const newCondition: Condition = { 
      id: nanoid(), 
      indicator: 'MACD', 
      operator: 'crosses_above', 
      value: 'Signal Line',
      fast_period: 12,
      slow_period: 26,
      signal_period: 9
    };
    set(state => ({ conditions: [...state.conditions, newCondition] }));
  },
  
  updateCondition: (id, field, value) => {
    set(state => ({ 
      conditions: state.conditions.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      ) 
    }));
  },
  
  removeCondition: (id) => {
    set(state => ({ conditions: state.conditions.filter(c => c.id !== id) }));
  },
  
  resetBuilder: () => set(initialState),
  
  saveStrategy: async (name) => {
    const { conditions, logicalOperator, action, entryCondition, exitCondition, fetchSavedStrategies } = get();
    const trimmedName = name.trim();
    if (!trimmedName || conditions.length === 0) { 
      throw new Error('Please provide a name and add at least one condition.'); 
    }
    if (get().savedStrategies.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) { 
      throw new Error(`A strategy named "${trimmedName}" already exists.`); 
    }
    const strategyConfiguration: StrategyConfiguration = { 
      conditions, 
      logicalOperator, 
      action, 
      entryCondition,
      exitCondition 
    };
    
    try {
      const response = await api.post('/api/strategies/', { name: trimmedName, configuration: strategyConfiguration });
      fetchSavedStrategies();
      return response;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        // Check if it's a strategy limit error
        const errorData = error.response.data;
        if (errorData && typeof errorData === 'object') {
          // If it's a non-field error (like strategy limit), use that message
          if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
            throw new Error(errorData.non_field_errors[0]);
          }
          // If it's a general error message
          if (errorData.detail) {
            throw new Error(errorData.detail);
          }
          // If it's a validation error with a specific message
          if (errorData.error) {
            throw new Error(errorData.error);
          }
          // Check if the error message contains strategy limit information
          if (errorData.name && Array.isArray(errorData.name)) {
            const nameError = errorData.name[0];
            if (nameError && typeof nameError === 'string' && nameError.includes('strategy limit')) {
              throw new Error(nameError);
            }
          }
        }
      }
      // For other errors, create a user-friendly error message
      if (error.response?.status) {
        throw new Error(`Request failed with status ${error.response.status}. Please try again.`);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }
  },

  fetchSavedStrategies: async () => {
    try {
      const response = await api.get('/api/strategies/');
      set({ savedStrategies: response.data });
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
  },

  loadStrategy: async (strategyId) => {
    try {
      const response = await api.get(`/api/strategies/${strategyId}/`);
      const strategy = response.data;
      
      // Update the builder state with the loaded strategy
      set({
        conditions: strategy.configuration.conditions || [],
        logicalOperator: strategy.configuration.logicalOperator || 'AND',
        action: strategy.configuration.action || 'LONG',
        entryCondition: strategy.configuration.entryCondition || initialState.entryCondition,
        exitCondition: strategy.configuration.exitCondition || initialState.exitCondition
      });
      
      return strategy;
    } catch (error) {
      console.error('Failed to load strategy:', error);
      return null;
    }
  },

  deleteStrategy: async (strategyId) => {
    if (!strategyId) return;
    await api.delete(`/api/strategies/${strategyId}/`);
    get().fetchSavedStrategies();
    get().resetBuilder();
  }
}));