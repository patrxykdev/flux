import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './AuthForm.css';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('No verification token provided.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.get(`/api/verify-email/?token=${token}`);
      setVerificationStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setVerificationStatus('error');
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An error occurred during verification. Please try again.');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const email = searchParams.get('email');
      if (!email) {
        setMessage('Email address not found. Please try registering again.');
        return;
      }

      await api.post('/api/resend-verification/', { email });
      setMessage('Verification email sent successfully! Please check your inbox.');
      setCanResend(false);
      setResendCountdown(300); // 5 minutes
    } catch (error: any) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('Failed to resend verification email. Please try again.');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="auth-card">
        <div className="verification-loading">
          <div className="spinner"></div>
          <h2>Verifying Your Email</h2>
          <p>Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="auth-card">
        <div className="verification-success">
          <div className="success-icon">🎉</div>
          <h2>Email Verified Successfully!</h2>
          <p>{message}</p>
          <div className="verification-info">
            <p>You will be redirected to the login page shortly...</p>
            <p>Your account is now fully activated and ready to use!</p>
          </div>
          <button 
            className="form-button" 
            onClick={() => navigate('/')}
            style={{ marginTop: '20px' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Email Verification Failed</h2>
      <div className="verification-info">
        <p>{message}</p>
        <p>Please check your email for the verification link or request a new one.</p>
      </div>
      
      <button 
        className="form-button" 
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px' }}
      >
        Back to Login
      </button>
      
      <div className="auth-footer">
        <p>Didn't receive the email?</p>
        <button 
          className="resend-button"
          onClick={handleResendVerification}
          disabled={!canResend}
        >
          {canResend 
            ? 'Resend Verification Email' 
            : `Resend available in ${formatTime(resendCountdown)}`
          }
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;
