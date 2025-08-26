import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  username: string;
  email: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface TierInfo {
  name: string;
  price: string;
  features: string[];
  strategyLimit: number;
  backtestLimit: number;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isUpdatingTier, setIsUpdatingTier] = useState(false);
  const [stats, setStats] = useState<{ total_strategies: number; total_backtests: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Tier information
  const tiers: Record<string, TierInfo> = {
    free: {
      name: 'Free',
      price: 'Free',
      features: ['Basic strategy building', 'Limited backtests', 'Community support'],
      strategyLimit: 1,
      backtestLimit: 3
    },
    pro: {
      name: 'Pro',
      price: '$9.99/month',
      features: ['Advanced strategy building', 'More backtests', 'Priority support', 'Advanced indicators'],
      strategyLimit: 5,
      backtestLimit: 50
    },
    premium: {
      name: 'Premium',
      price: '$19.99/month',
      features: ['Unlimited strategies', 'Unlimited backtests', 'Premium support', 'All indicators', 'Custom alerts'],
      strategyLimit: 10,
      backtestLimit: 100
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      setProfileData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        // Keep password fields empty
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    }
  }, [user, isOpen]);

  // Fetch stats when subscription tab is opened
  useEffect(() => {
    if (isOpen && activeTab === 'subscription' && user) {
      fetchStats();
    }
  }, [isOpen, activeTab, user]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await api.get('/api/dashboard-stats/');
      setStats(response.data.portfolio_summary);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const updateData: any = {};
      if (profileData.username !== user?.username) updateData.username = profileData.username;
      if (profileData.email !== user?.email) updateData.email = profileData.email;

      if (Object.keys(updateData).length === 0) {
        setMessage({ text: 'No changes to save', type: 'error' });
        return;
      }

      const response = await api.put('/api/profile/', updateData);
      
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (profileData.new_password !== profileData.confirm_password) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    if (profileData.new_password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await api.put('/api/profile/', {
        password: profileData.new_password
      });
      
      setMessage({ text: 'Password updated successfully!', type: 'success' });
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update password';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierChange = async (newTier: string) => {
    if (newTier === user?.profile?.tier) {
      setMessage({ text: 'You are already on this tier', type: 'error' });
      return;
    }

    setIsUpdatingTier(true);
    setMessage(null);

    try {
      const response = await api.put('/api/profile/', {
        tier: newTier
      });
      
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      // Refresh stats after tier change
      await fetchStats();
      
      setMessage({ text: `Successfully upgraded to ${tiers[newTier].name} tier!`, type: 'success' });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update tier';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsUpdatingTier(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header-tabs">
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </button>
            <button 
              className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Security
            </button>
            <button 
              className={`settings-tab ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Subscription
            </button>
          </div>
          <button className="settings-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={profileData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              <button 
                className="settings-save-btn"
                onClick={handleProfileUpdate}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Change Password</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={profileData.current_password}
                    onChange={(e) => handleInputChange('current_password', e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={profileData.new_password}
                    onChange={(e) => handleInputChange('new_password', e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={profileData.confirm_password}
                    onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <button 
                className="settings-save-btn"
                onClick={handlePasswordChange}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="settings-section">
              <h3>Subscription Plans</h3>
              <div className="current-tier-info">
                <div className="current-tier-badge">
                  <span className="tier-label">Current Plan:</span>
                  <span className={`tier-name ${user?.profile?.tier || 'free'}`}>
                    {tiers[user?.profile?.tier || 'free'].name}
                  </span>
                </div>
                <div className="tier-limits">
                  <div className="limit-item">
                    <span className="limit-label">Strategies:</span>
                    <span className="limit-value">
                      {isLoadingStats ? (
                        <span className="loading-dots">...</span>
                      ) : (
                        `${stats?.total_strategies || 0} / ${tiers[user?.profile?.tier || 'free'].strategyLimit}`
                      )}
                    </span>
                  </div>
                  <div className="limit-item">
                    <span className="limit-label">Daily Backtests:</span>
                    <span className="limit-value">
                      {isLoadingStats ? (
                        <span className="loading-dots">...</span>
                      ) : (
                        `${stats?.total_backtests || 0} / ${tiers[user?.profile?.tier || 'free'].backtestLimit}`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tier-cards">
                {Object.entries(tiers).map(([tierKey, tier]) => (
                  <div 
                    key={tierKey} 
                    className={`tier-card ${user?.profile?.tier === tierKey ? 'current' : ''} ${tierKey}`}
                  >
                    <div className="tier-header">
                      <h4 className="tier-name">{tier.name}</h4>
                      <div className="tier-price">{tier.price}</div>
                    </div>
                    
                    <div className="tier-features">
                      <ul>
                        {tier.features.map((feature, index) => (
                          <li key={index}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="tier-limits">
                      <div className="limit-item">
                        <span className="limit-label">Strategies:</span>
                        <span className="limit-value">{tier.strategyLimit}</span>
                      </div>
                      <div className="limit-item">
                        <span className="limit-label">Daily Backtests:</span>
                        <span className="limit-value">{tier.backtestLimit}</span>
                      </div>
                    </div>

                    {user?.profile?.tier !== tierKey && (
                      <button
                        className={`tier-upgrade-btn ${tierKey}`}
                        onClick={() => handleTierChange(tierKey)}
                        disabled={isUpdatingTier}
                      >
                        {isUpdatingTier ? 'Updating...' : tierKey === 'free' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                    
                    {user?.profile?.tier === tierKey && (
                      <div className="current-tier-indicator">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        Current Plan
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
