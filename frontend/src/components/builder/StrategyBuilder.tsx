// frontend/src/components/builder/StrategyBuilder.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuilderStore } from './builderStore';
import { useAuth } from '../../contexts/AuthContext';
import ConditionRow from './ConditionRow';
import EntryConditionSelector from './EntryConditionSelector';
import ExitConditionSelector from './ExitConditionSelector';
import './StrategyBuilder.css';
import toast from 'react-hot-toast';
import ConfirmationToast from '../common/ConfirmationToast';

const StrategyBuilder: React.FC = () => {
  const [strategyName, setStrategyName] = useState('');
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | ''>('');
  const [activeSection, setActiveSection] = useState<'conditions' | 'action' | 'entry' | 'exit'>('conditions');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    conditions, logicalOperator, action, entryCondition, exitCondition,
    setLogicalOperator, setAction, setEntryCondition, setExitCondition, addCondition,
    saveStrategy, resetBuilder,
    savedStrategies, fetchSavedStrategies, loadStrategy, deleteStrategy
  } = useBuilderStore();

  const handleSaveStrategy = () => {
    const promise = saveStrategy(strategyName);

    toast.promise(promise, {
      loading: 'Saving strategy...',
      success: (response) => {
        return `Strategy "${(response as any).data.name}" saved successfully!`;
      },
      error: (err) => {
        return err.toString();
      },
    }, {
      className: 'flux-toast',
      success: {
        className: 'flux-toast-success',
        iconTheme: { primary: '#fff', secondary: '#198754' },
      },
      error: {
        className: 'flux-toast-error',
        iconTheme: { primary: '#fff', secondary: '#dc3545' },
      },
    });
  };

  useEffect(() => {
    fetchSavedStrategies().catch(error => {
      console.error("Failed to fetch strategies", error);
      if (error.response?.status === 401) {
        logout();
        navigate('/', { replace: true });
      }
    });
    return () => {
      resetBuilder();
    };
  }, [fetchSavedStrategies, resetBuilder]);

  const switchToSection = (section: 'conditions' | 'action' | 'entry' | 'exit') => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'conditions':
        return (
          <section className="builder-section">
            <div className="section-header">
              <div className="section-content">
                <h3>Trigger Conditions</h3>
                <p>Define the market conditions that must be met to trigger an action.</p>
              </div>
            </div>
            
            <div className="conditions-list">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="condition-group">
                  <ConditionRow condition={condition} />
                  {index < conditions.length - 1 && (
                    <div className="logical-operator-selector">
                      <select 
                        value={logicalOperator} 
                        onChange={(e) => setLogicalOperator(e.target.value as 'AND' | 'OR')} 
                        className="form-select small"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button onClick={addCondition} className="add-condition-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Condition
            </button>
          </section>
        );

      case 'action':
        return (
          <section className="builder-section">
            <div className="section-header">
              <div className="section-content">
                <h3>Action</h3>
                <p>Define what action to take when all conditions are met.</p>
              </div>
            </div>
            
            <div className="action-selector">
              <span className="action-label">When conditions are met:</span>
              <div className="action-buttons">
                <button
                  className={`action-button long-button ${action === 'LONG' ? 'selected' : ''}`}
                  onClick={() => setAction('LONG')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18,15 12,9 6,15"/>
                  </svg>
                  LONG
                </button>
                <button
                  className={`action-button short-button ${action === 'SHORT' ? 'selected' : ''}`}
                  onClick={() => setAction('SHORT')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                  SHORT
                </button>
              </div>
            </div>
          </section>
        );

      case 'entry':
        return (
          <section className="builder-section">
            <div className="section-header">
              <div className="section-content">
                <h3>Entry Conditions</h3>
                <p>Define position sizing and risk management for your trades.</p>
              </div>
            </div>
            
            <EntryConditionSelector 
              entryCondition={entryCondition}
              onEntryConditionChange={setEntryCondition}
            />
          </section>
        );

      case 'exit':
        return (
          <section className="builder-section">
            <div className="section-header">
              <div className="section-content">
                <h3>Risk Management</h3>
                <p>Define stop loss and take profit levels to manage your risk and lock in profits.</p>
              </div>
            </div>
            
            <ExitConditionSelector 
              exitCondition={exitCondition}
              onExitConditionChange={setExitCondition}
            />
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="builder-wrapper">
      {/* Enhanced Header */}
      <header className="builder-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-to-dashboard-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <div className="header-center">
          <h1 className="builder-title">Strategy Builder</h1>
          <p className="builder-subtitle">Create and customize your trading strategies</p>
        </div>

        <div className="header-right">
          <div className="strategy-loader">
            <select
              className="form-select strategy-select"
              value={selectedStrategyId}
              onChange={async (e) => {
                const id = Number(e.target.value);
                setSelectedStrategyId(id);
                const loadedStrategy = await loadStrategy(id);
                if (loadedStrategy) {
                  setStrategyName(loadedStrategy.name);
                }
              }}
            >
              <option value="" disabled>Load Strategy</option>
              {savedStrategies.map(strategy => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Strategy Actions Bar */}
      <div className="strategy-actions-bar">
        <div className="strategy-input-group">
          <div className="input-wrapper">
            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <input 
              type="text" 
              placeholder="Enter strategy name..." 
              className="strategy-name-input" 
              value={strategyName} 
              onChange={(e) => setStrategyName(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="strategy-buttons">
          <button 
            className="save-strategy-button" 
            onClick={handleSaveStrategy}
            disabled={!strategyName.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            Save Strategy
          </button>
          
          {selectedStrategyId && (
            <button 
              className="delete-strategy-button"
              onClick={() => {
                toast(
                  (t) => (
                    <ConfirmationToast
                      toastId={t.id}
                      message="Are you sure you want to delete this strategy?"
                      onConfirm={() => {
                        const deletePromise = deleteStrategy(Number(selectedStrategyId));
                        toast.promise(
                          deletePromise,
                          {
                            loading: 'Deleting...',
                            success: () => {
                              setStrategyName('');
                              setSelectedStrategyId('');
                              return 'Strategy deleted.';
                            },
                            error: 'Could not delete strategy.',
                          },
                          {
                            className: 'flux-toast-danger',
                            success: { className: 'flux-toast-success' },
                            error: { className: 'flux-toast-error' },
                          }
                        );
                      }}
                    />
                  ),
                  { 
                    duration: Infinity, 
                    style: {
                      background: '#D9534F',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                    },
                  }
                );
              }}
              title="Delete this strategy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="builder-navigation">
        <button 
          className={`nav-tab ${activeSection === 'conditions' ? 'active' : ''}`}
          onClick={() => switchToSection('conditions')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          Conditions
        </button>
        <button 
          className={`nav-tab ${activeSection === 'action' ? 'active' : ''}`}
          onClick={() => switchToSection('action')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Action
        </button>
        <button 
          className={`nav-tab ${activeSection === 'entry' ? 'active' : ''}`}
          onClick={() => switchToSection('entry')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          Entry
        </button>
        <button 
          className={`nav-tab ${activeSection === 'exit' ? 'active' : ''}`}
          onClick={() => switchToSection('exit')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Exit
        </button>
      </nav>

      <main className="builder-main-content">
        <div className="builder-form-card">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default StrategyBuilder;