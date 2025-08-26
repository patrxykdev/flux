// frontend/src/components/RegisterForm.tsx
import React, { useState, useEffect } from 'react';
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
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [selectedTier, setSelectedTier] = useState('free');

  // Get the selected tier from localStorage when component mounts
  useEffect(() => {
    const tier = localStorage.getItem('selectedTier') || 'free';
    setSelectedTier(tier);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      // Include tier information in the registration data
      const registrationData = {
        ...formData,
        tier: selectedTier
      };
      
      const response = await api.post('/api/register/', registrationData);
      
      if (response.data.email_verification_sent) {
        setIsSuccess(true);
        setEmailVerificationSent(true);
        setMessage('Registration successful! Please check your email to verify your account before logging in.');
      } else {
        setIsSuccess(true);
        setEmailVerificationSent(false);
        setMessage('Registration successful! However, we couldn\'t send the verification email. Please contact support.');
      }
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

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await api.post('/api/resend-verification/', { email: formData.email });
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error: any) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to resend verification email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
        
        {emailVerificationSent && (
          <div className="verification-info">
            <p>📧 Check your email inbox for the verification link</p>
            <p>Click the link in the email to activate your account</p>
            <p>Can't find the email? Check your spam folder</p>
          </div>
        )}
        
        <div className="auth-footer">
          {emailVerificationSent ? (
            <>
              <p>Didn't receive the email?</p>
              <button 
                className="resend-button"
                onClick={handleResendVerification}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <p style={{ marginTop: '16px' }}>
                Already verified? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }}>Sign in</a>
              </p>
            </>
          ) : (
            <p>You can now <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }}>sign in</a> to your account.</p>
          )}
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
      
      {selectedTier !== 'free' && (
        <div className="selected-tier-info">
          <p>Selected Plan: <strong>{selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}</strong></p>
        </div>
      )}
      
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