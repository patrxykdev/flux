// frontend/src/components/LoginForm.tsx
import React, { useState } from 'react';
import api from '../../api';
import { AxiosError } from 'axios';
import GoogleOAuth from './GoogleOAuth';
import './AuthForm.css';

interface LoginFormProps {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    try {
      // The login endpoint is /api/token/
      const response = await api.post('/api/token/', formData);
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      // Login was successful, so we reload the page to show the Profile view
      window.location.reload();
    } catch (error) {
      const err = error as AxiosError<{ detail?: string }>;
      // Handle common authentication errors from the backend
      if (err.response && err.response.data?.detail) {
        setMessage(`Error: ${err.response.data.detail}`);
      } else {
        setMessage('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (response: any) => {
    setMessage(response.message);
  };

  const handleGoogleError = (error: any) => {
    console.error('Google authentication error:', error);
    setMessage('Google authentication failed. Please try again.');
  };

  return (
    <div className="auth-card">
      {onClose && (
        <button className="form-close-button" onClick={onClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Sign in to your Flux Trader account</p>
      
      <GoogleOAuth 
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        mode="login"
      />

      <div className="auth-divider">
        <span>or sign in with email</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-username">Username</label>
          <input 
            id="login-username" 
            className="form-input" 
            type="text" 
            name="username" 
            placeholder="Enter your username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input 
            id="login-password" 
            className="form-input" 
            type="password" 
            name="password" 
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
        </div>
        
        {message && (
          <div className={message.includes('Error') ? 'form-error-message' : 'form-success-message'}>
            {message}
          </div>
        )}
        
        <button 
          className={`form-button ${isLoading ? 'loading' : ''}`} 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister?.(); }}>Sign up</a></p>
      </div>
    </div>
  );
};

export default LoginForm;