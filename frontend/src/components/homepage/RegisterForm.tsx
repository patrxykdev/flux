// frontend/src/components/RegisterForm.tsx
import React, { useState } from 'react';
import api from '../../api';
import { AxiosError } from 'axios';
import GoogleOAuth from './GoogleOAuth';
import './AuthForm.css';

interface RegisterFormProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      await api.post('/api/register/', formData);
      // Registration was successful
      setIsSuccess(true);
      setMessage('Registration successful! You can now log in using the button at the top of the page.');
    } catch (error) {
        const err = error as AxiosError<{ [key: string]: string[] }>;
        // Handle validation errors from the backend (e.g., username taken)
        if (err.response) {
          const errorMessages = Object.values(err.response.data).flat().join(' ');
          setMessage(`Error: ${errorMessages}`);
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

  // If registration is successful, we show a success message instead of the form.
  if (isSuccess) {
    return (
      <div className="auth-card">
        {onClose && (
          <button className="form-close-button" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <h2>Welcome to Flux Trader! 🎉</h2>
        <div className="form-success-message">
          <p style={{ margin: 0 }}>{message}</p>
        </div>
        <div className="auth-footer">
          <p>You can now <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }}>sign in</a> to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      {onClose && (
        <button className="form-close-button" onClick={onClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <h2>Create Your Account</h2>
      <p className="auth-subtitle">Join thousands of traders using Flux Trader</p>
      
      <GoogleOAuth 
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        mode="register"
      />

      <div className="auth-divider">
        <span>or sign up with email</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reg-username">Username</label>
          <input 
            id="reg-username" 
            className="form-input" 
            type="text" 
            name="username" 
            placeholder="Choose a unique username" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <input 
            id="reg-email" 
            className="form-input" 
            type="email" 
            name="email" 
            placeholder="you@example.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input 
            id="reg-password" 
            className="form-input" 
            type="password" 
            name="password" 
            placeholder="Create a strong password" 
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }}>Sign in</a></p>
      </div>
    </div>
  );
};

export default RegisterForm;