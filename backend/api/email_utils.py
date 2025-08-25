import os
import resend
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string

# Configure Resend
resend.api_key = settings.RESEND_API_KEY

def send_verification_email(user, verification_token):
    """
    Send email verification email using Resend
    """
    try:
        # Create verification URL
        verification_url = f"{settings.FRONTEND_URL or 'http://localhost:5173'}/verify-email?token={verification_token}"
        
        # Email content with FluxTrader branding
        subject = "Welcome to FluxTrader! Verify Your Email"
        
        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to FluxTrader</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f8fafc;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }}
                .header {{
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }}
                .header p {{
                    margin: 10px 0 0 0;
                    font-size: 16px;
                    opacity: 0.9;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .welcome-text {{
                    font-size: 18px;
                    color: #374151;
                    margin-bottom: 30px;
                    line-height: 1.7;
                }}
                .verification-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 20px 0;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
                }}
                .verification-button:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
                }}
                .features {{
                    margin: 30px 0;
                    text-align: left;
                }}
                .feature {{
                    display: flex;
                    align-items: center;
                    margin: 15px 0;
                    padding: 15px;
                    background-color: #f8fafc;
                    border-radius: 8px;
                    border-left: 4px solid #3b82f6;
                }}
                .feature-icon {{
                    width: 24px;
                    height: 24px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 15px;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                }}
                .feature-text {{
                    color: #374151;
                    font-size: 16px;
                }}
                .footer {{
                    background-color: #f8fafc;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }}
                .footer p {{
                    margin: 0;
                    color: #6b7280;
                    font-size: 14px;
                }}
                .manual-link {{
                    margin-top: 20px;
                    font-size: 14px;
                    color: #6b7280;
                }}
                .manual-link a {{
                    color: #3b82f6;
                    text-decoration: none;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to FluxTrader!</h1>
                    <p>Your journey to smarter trading starts here</p>
                </div>
                
                <div class="content">
                    <div class="welcome-text">
                        Hi <strong>{user.username}</strong>!<br>
                        Thank you for joining FluxTrader. We're excited to have you on board!
                    </div>
                    
                    <a href="{verification_url}" class="verification-button">
                        Verify Your Email Address
                    </a>
                    
                    <div class="features">
                        <div class="feature">
                            <div class="feature-icon">1</div>
                            <div class="feature-text">Advanced Strategy Builder</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">2</div>
                            <div class="feature-text">Comprehensive Backtesting</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">3</div>
                            <div class="feature-text">Real-time Market Data</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">4</div>
                            <div class="feature-text">Lightning-fast Execution</div>
                        </div>
                    </div>
                    
                    <div class="manual-link">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{verification_url}">{verification_url}</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This link will expire in 24 hours for security reasons.</p>
                    <p>If you didn't create an account with FluxTrader, you can safely ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Welcome to FluxTrader!
        
        Hi {user.username}!
        
        Thank you for joining FluxTrader. We're excited to have you on board!
        
        To complete your registration, please verify your email address by clicking the link below:
        
        {verification_url}
        
        This link will expire in 24 hours for security reasons.
        
        If you didn't create an account with FluxTrader, you can safely ignore this email.
        
        Best regards,
        The FluxTrader Team
        """
        
        # Send email using Resend
        response = resend.Emails.send({
            "from": "FluxTrader <noreply@fluxtrader.xyz>",
            "to": [user.email],
            "subject": subject,
            "html": html_content,
            "text": text_content
        })
        
        return response
        
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        return None

def send_welcome_email(user):
    """
    Send welcome email after email verification
    """
    try:
        subject = "Welcome to FluxTrader! Your Account is Now Active"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to FluxTrader</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f8fafc;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }}
                .header {{
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .success-message {{
                    font-size: 18px;
                    color: #374151;
                    margin-bottom: 30px;
                    line-height: 1.7;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 20px 0;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
                }}
                .cta-button:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
                }}
                .next-steps {{
                    margin: 30px 0;
                    text-align: left;
                }}
                .step {{
                    display: flex;
                    align-items: center;
                    margin: 15px 0;
                    padding: 15px;
                    background-color: #f0f9ff;
                    border-radius: 8px;
                    border-left: 4px solid #3b82f6;
                }}
                .step-number {{
                    width: 32px;
                    height: 32px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 15px;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                }}
                .step-text {{
                    color: #374151;
                    font-size: 16px;
                }}
                .footer {{
                    background-color: #f8fafc;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }}
                .footer p {{
                    margin: 0;
                    color: #6b7280;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Account Verified Successfully!</h1>
                </div>
                
                <div class="content">
                    <div class="success-message">
                        Congratulations <strong>{user.username}</strong>!<br>
                        Your FluxTrader account is now fully activated and ready to use.
                    </div>
                    
                    <a href="{settings.FRONTEND_URL or 'http://localhost:5173'}/dashboard" class="cta-button">
                        Go to Dashboard
                    </a>
                    
                    <div class="next-steps">
                        <h3>Next Steps to Get Started:</h3>
                        
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-text">Explore the Strategy Builder to create your first trading strategy</div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-text">Run backtests on historical data to validate your strategies</div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-text">Monitor your portfolio performance and track your progress</div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">4</div>
                            <div class="step-text">Join our community and share insights with fellow traders</div>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Happy trading!</p>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Account Verified Successfully!
        
        Congratulations {user.username}!
        
        Your FluxTrader account is now fully activated and ready to use.
        
        Next Steps to Get Started:
        1. Explore the Strategy Builder to create your first trading strategy
        2. Run backtests on historical data to validate your strategies
        3. Monitor your portfolio performance and track your progress
        4. Join our community and share insights with fellow traders
        
        Happy trading!
        
        Best regards,
        The FluxTrader Team
        """
        
        # Send email using Resend
        response = resend.Emails.send({
            "from": "FluxTrader <noreply@fluxtrader.xyz>",
            "to": [user.email],
            "subject": subject,
            "html": html_content,
            "text": text_content
        })
        
        return response
        
    except Exception as e:
        print(f"Error sending welcome email: {str(e)}")
        return None
