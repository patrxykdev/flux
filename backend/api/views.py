import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, serializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics

from django.contrib.auth.models import User
from django.utils import timezone
from .models import Strategy, Backtest, UserProfile, EmailVerification
from .serializers import UserSerializer, StrategySerializer, BacktestSerializer, EmailVerificationSerializer
from .backtester import run_backtest
from .csv_data_loader import load_csv_data, get_available_tickers, get_available_timeframes
from .email_utils import send_verification_email, send_welcome_email

def fetch_csv_data(ticker, start_date, end_date, timeframe):
    """Fetch data from local CSV files"""
    try:
        data, data_range_info = load_csv_data(ticker, start_date, end_date, timeframe)
        return data, data_range_info
    except Exception as e:
        raise ValueError(f"CSV data loading error: {str(e)}")





def fetch_market_data(ticker, start_date, end_date, timeframe):
    """
    Fetch market data from local CSV files.
    """
    try:
        print(f"Loading CSV data for {ticker}")
        data, data_range_info = fetch_csv_data(ticker, start_date, end_date, timeframe)
        print(f"Successfully loaded CSV data: {data.shape}")
        return data, data_range_info
    except Exception as e:
        error_msg = f"CSV data loading failed: {str(e)}"
        print(error_msg)
        raise ValueError(error_msg)

# ... (The rest of your views: RegisterView, ProfileView, StrategyViewSet, etc.) ...


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Set tier based on request data (default to 'free' if not specified)
        tier = request.data.get('tier', 'free')
        if tier in ['free', 'pro', 'premium']:
            user.profile.tier = tier
            user.profile.save()

        # Create email verification
        verification = EmailVerification.objects.create(user=user)
        
        # Send verification email
        email_sent = send_verification_email(user, verification.token)
        
        if email_sent:
            # Update user profile to track verification email sent
            user.profile.email_verification_sent_at = timezone.now()
            user.profile.save()
            
            return Response({
                "message": "Registration successful! Please check your email to verify your account.",
                "user": serializer.data,
                "email_verification_sent": True
            }, status=status.HTTP_201_CREATED)
        else:
            # If email fails, still create the user but inform them
            return Response({
                "message": "Registration successful! However, we couldn't send the verification email. Please contact support.",
                "user": serializer.data,
                "email_verification_sent": False
            }, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)
    
    def get(self, request):
        token = request.query_params.get('token')
        
        if not token:
            return Response({"error": "Verification token is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            verification = EmailVerification.objects.get(token=token, is_used=False)
            
            if verification.is_expired():
                return Response({"error": "Verification token has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark verification as used
            verification.is_used = True
            verification.save()
            
            # Mark user's email as verified
            user = verification.user
            user.profile.email_verified = True
            user.profile.save()
            
            # Send welcome email
            send_welcome_email(user)
            
            return Response({
                "message": "Email verified successfully! Welcome to FluxTrader!",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except EmailVerification.DoesNotExist:
            return Response({"error": "Invalid verification token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResendVerificationEmailView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            # Check if email is already verified
            if user.profile.email_verified:
                return Response({"error": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if we sent a verification email recently (within last 5 minutes)
            if user.profile.email_verification_sent_at:
                time_since_last_email = timezone.now() - user.profile.email_verification_sent_at
                if time_since_last_email.total_seconds() < 300:  # 5 minutes
                    return Response({"error": "Please wait 5 minutes before requesting another verification email."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new verification
            verification = EmailVerification.objects.create(user=user)
            
            # Send verification email
            email_sent = send_verification_email(user, verification.token)
            
            if email_sent:
                # Update user profile
                user.profile.email_verification_sent_at = timezone.now()
                user.profile.save()
                
                return Response({
                    "message": "Verification email sent successfully! Please check your inbox."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to send verification email. Please try again later."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            return Response({"error": "No user found with this email address."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# api/views.py (add this new class)

class ProfileView(APIView):
    permission_classes = (IsAuthenticated,) # This is the key part!

    def get(self, request):
        # The user is available via request.user thanks to JWTAuthentication
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile information"""
        user = request.user
        data = request.data
        
        try:
            # Update basic user fields
            if 'username' in data and data['username'] != user.username:
                # Check if username is already taken
                if User.objects.filter(username=data['username']).exclude(id=user.id).exists():
                    return Response({"error": "Username is already taken."}, status=status.HTTP_400_BAD_REQUEST)
                user.username = data['username']
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'email' in data and data['email'] != user.email:
                # Check if email is already taken
                if User.objects.filter(email=data['email']).exclude(id=user.id).exists():
                    return Response({"error": "Email is already taken."}, status=status.HTTP_400_BAD_REQUEST)
                user.email = data['email']
                # Reset email verification status
                user.profile.email_verified = False
                user.profile.save()
            
            # Update password if provided
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            # Update tier if provided
            if 'tier' in data and data['tier'] in ['free', 'pro', 'premium']:
                user.profile.tier = data['tier']
                user.profile.save()
            
            user.save()
            
            # Update profile picture if provided
            if 'profile_picture' in data:
                # Handle profile picture update logic here
                # For now, we'll just acknowledge it
                pass
            
            serializer = UserSerializer(user)
            return Response({
                "message": "Profile updated successfully!",
                "user": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": f"Failed to update profile: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class StrategyViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows a user's strategies to be viewed,
    created, updated, or deleted.
    """
    serializer_class = StrategySerializer
    permission_classes = [IsAuthenticated] # Ensures only logged-in users can access

    def get_queryset(self):
        """
        This view should return a list of all the strategies
        for the currently authenticated user.
        """
        return Strategy.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically associate the strategy with the logged-in user upon creation.
        """
        serializer.save(user=self.request.user)


class BacktestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            strategy_id = request.data.get('strategy_id')
            ticker = request.data.get('ticker', 'AAPL')
            start_date = request.data.get('start_date', '2022-01-01')
            end_date = request.data.get('end_date', '2023-01-01')
            timeframe = request.data.get('timeframe', 'day') # Polygon uses 'day', 'hour', 'minute'
            cash = int(request.data.get('cash', 10000))
            leverage = float(request.data.get('leverage', 1.0))

            # Validate inputs
            if not strategy_id:
                return Response({"error": "Strategy ID is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            if cash <= 0:
                return Response({"error": "Initial cash must be positive."}, status=status.HTTP_400_BAD_REQUEST)
            
            if leverage < 1.0 or leverage > 10.0:
                return Response({"error": "Leverage must be between 1x and 10x."}, status=status.HTTP_400_BAD_REQUEST)
            
            if not ticker or not ticker.strip():
                return Response({"error": "Ticker symbol is required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                strategy = Strategy.objects.get(id=strategy_id, user=request.user)
            except Strategy.DoesNotExist:
                return Response({"error": "Strategy not found."}, status=status.HTTP_404_NOT_FOUND)

            # --- DATA FETCHING WITH FALLBACK STRATEGY ---
            try:
                data, data_range_info = fetch_market_data(ticker, start_date, end_date, timeframe)
                
                # Debug: Print the actual columns we received
                print(f"Debug: Data columns: {list(data.columns)}")
                print(f"Debug: Data shape: {data.shape}")
                print(f"Debug: Sample data:\n{data.head()}")
                print(f"Debug: Data source: {data_range_info.get('source', 'unknown')}")
                
                # Check if we have the required 'Close' column
                if 'Close' not in data.columns:
                    available_columns = list(data.columns)
                    return Response({
                        "error": f"Data format error: 'Close' column not found. Available columns: {available_columns}. Please check your data source."
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Ensure we have all required columns
                required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
                missing_columns = [col for col in required_columns if col not in data.columns]
                if missing_columns:
                    return Response({
                        "error": f"Missing required columns: {missing_columns}. Available columns: {list(data.columns)}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Validate data quality
                if data.empty:
                    return Response({"error": f"No valid data found for {ticker} in the specified date range."}, status=status.HTTP_400_BAD_REQUEST)
                
                if len(data) < 30:  # Need at least 30 data points for indicators
                    return Response({"error": f"Insufficient data for {ticker}. Need at least 30 data points, got {len(data)}."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if the requested timeframe is allowed for the user's tier
                user_tier = request.user.profile.tier
                allowed_timeframes = request.user.profile.get_allowed_timeframes()
                if timeframe not in allowed_timeframes:
                    return Response({
                        "error": f"Timeframe '{timeframe}' is not available for your current tier '{user_tier}'. "
                                f"Your tier allows: {', '.join(allowed_timeframes)}. "
                                f"Please upgrade your plan to access more timeframes."
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Check if the requested ticker is allowed for the user's tier
                allowed_tickers = request.user.profile.get_allowed_tickers()
                if allowed_tickers is not None and ticker not in allowed_tickers:
                    return Response({
                        "error": f"Ticker '{ticker}' is not available for your current tier '{user_tier}'. "
                                f"Your tier allows: {', '.join(allowed_tickers)}. "
                                f"Please upgrade your plan to access more tickers."
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Check if the requested date range matches the available data range
                requested_start = pd.to_datetime(start_date)
                requested_end = pd.to_datetime(end_date)
                actual_start = pd.to_datetime(data_range_info['actual_start'])
                actual_end = pd.to_datetime(data_range_info['actual_end'])

                # Calculate the coverage of the requested range
                requested_days = (requested_end - requested_start).days
                actual_days = (actual_end - actual_start).days
                
                # Debug logging
                print(f"Debug: Requested range: {start_date} to {end_date} ({requested_days} days)")
                print(f"Debug: Actual data range: {data_range_info['actual_start']} to {data_range_info['actual_end']} ({actual_days} days)")
                
                # Calculate what percentage of the requested range we actually have
                # We'll consider it a full range if we have at least 80% of the requested days
                # and the actual range overlaps significantly with the requested range
                coverage_threshold = 0.8  # 80% coverage
                
                # Check if the actual range significantly overlaps with the requested range
                overlap_start = max(requested_start, actual_start)
                overlap_end = min(requested_end, actual_end)
                overlap_days = max(0, (overlap_end - overlap_start).days)
                
                # Calculate coverage percentage
                coverage_percentage = overlap_days / requested_days if requested_days > 0 else 0
                
                # Debug logging
                print(f"Debug: Overlap: {overlap_start} to {overlap_end} ({overlap_days} days)")
                print(f"Debug: Coverage percentage: {coverage_percentage:.1%}")
                
                # Determine if this is a significant portion of the requested range
                is_significant_coverage = coverage_percentage >= coverage_threshold
                
                # Check if we have limited overlap with the requested range
                # This should be based on overlap, not total actual days
                is_limited_data = overlap_days < (requested_days * 0.5)  # Less than 50% overlap
                
                if is_limited_data or not is_significant_coverage:
                    # Check if there's no overlap at all
                    if overlap_days == 0:
                        message = f"⚠️ No data available for requested range. You requested {start_date} to {end_date}, but data is only available from {data_range_info['actual_start']} to {data_range_info['actual_end']} for {ticker}."
                    else:
                        message = f"⚠️ Limited data available for requested range. You requested {start_date} to {end_date} ({requested_days} days), but only {overlap_days} days overlap with available data from {data_range_info['actual_start']} to {data_range_info['actual_end']} for {ticker}."
                    
                    data_range_message = {
                        'warning': True,
                        'message': message,
                        'requested_range': f"{start_date} to {end_date}",
                        'available_range': f"{data_range_info['actual_start']} to {data_range_info['actual_end']}",
                        'data_points': data_range_info['data_points'],
                        'data_source': data_range_info['source'],
                        'coverage_percentage': round(coverage_percentage * 100, 1),
                        'overlap_days': overlap_days
                    }
                elif coverage_percentage >= 0.95:  # 95% or more coverage
                    data_range_message = {
                        'warning': False,
                        'message': f"✅ Full data range available: {start_date} to {end_date}",
                        'requested_range': f"{start_date} to {end_date}",
                        'available_range': f"{data_range_info['actual_start']} to {data_range_info['actual_end']}",
                        'data_points': data_range_info['data_points'],
                        'data_source': data_range_info['source'],
                        'coverage_percentage': round(coverage_percentage * 100, 1)
                    }
                else:
                    data_range_message = {
                        'warning': False,
                        'message': f"📊 Partial data range available: {data_range_info['actual_start']} to {data_range_info['actual_end']} (requested {start_date} to {end_date})",
                        'requested_range': f"{start_date} to {end_date}",
                        'available_range': f"{data_range_info['actual_start']} to {data_range_info['actual_end']}",
                        'data_points': data_range_info['data_points'],
                        'data_source': data_range_info['source'],
                        'coverage_percentage': round(coverage_percentage * 100, 1)
                    }

            except Exception as e:
                error_msg = str(e)
                if "API key" in error_msg.lower():
                    return Response({"error": "Invalid API key. Please check your Alpha Vantage or Polygon API configuration."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                elif "not found" in error_msg.lower() or "invalid" in error_msg.lower():
                    return Response({"error": f"Invalid ticker symbol: {ticker}. Please check the symbol and try again."}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": f"Could not fetch market data from Polygon, yfinance, or Alpha Vantage: {error_msg}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # --- RUN THE BACKTESTING ENGINE ---
            try:
                print(f"DEBUG: Strategy configuration: {strategy.configuration}")
                print(f"DEBUG: Initial cash: ${cash:,.2f}")
                print(f"DEBUG: Leverage: {leverage}x")
                
                results = run_backtest(data, strategy.configuration, cash, leverage)
                
                # Check if backtest returned an error
                if 'error' in results:
                    print(f"Error: {results['error']}")
                    return Response({"error": results['error']}, status=status.HTTP_400_BAD_REQUEST)
                
                if 'Equity Final [$]' not in results:
                    print("Warning: 'Equity Final [$]' not found in results. This might indicate no trades were made.")
                    print("Full results:", results)
                else:
                    print(results)
                

                
                # Save backtest results to database
                try:
                    # Increment total backtests counter first
                    # Check daily backtest limit based on user tier
                    today = timezone.now().date()
                    today_backtests = Backtest.objects.filter(
                        user=request.user,
                        created_at__date=today
                    ).count()
                    
                    daily_limit = request.user.profile.get_daily_backtest_limit()
                    if today_backtests >= daily_limit:
                        return Response({
                            "error": f"You have reached your daily backtest limit of {daily_limit} for your {request.user.profile.tier.title()} tier. "
                            f"Please upgrade your plan or try again tomorrow."
                        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
                    
                    user_profile = request.user.profile
                    user_profile.total_backtests += 1
                    user_profile.save()
                    
                    # Delete oldest backtests if user has more than 10
                    user_backtests = Backtest.objects.filter(user=request.user)
                    if user_backtests.count() >= 10:
                        oldest_backtest = user_backtests.order_by('created_at').first()
                        if oldest_backtest:
                            oldest_backtest.delete()
                    
                    # Create new backtest record
                    backtest = Backtest.objects.create(
                        user=request.user,
                        strategy_name=strategy.name,
                        ticker=ticker.upper(),
                        start_date=start_date,
                        end_date=end_date,
                        timeframe=timeframe,
                        initial_cash=cash,
                        leverage=leverage,
                        results=results
                    )
                    print(f"Backtest saved with ID: {backtest.id}")
                except Exception as save_error:
                    print(f"Warning: Could not save backtest to database: {save_error}")
                    # Don't fail the request if saving fails
                
                return Response(results, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({"error": f"An error occurred during the backtest: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecentBacktestsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get the last 10 backtests for the authenticated user"""
        try:
            backtests = Backtest.objects.filter(user=request.user)[:10]
            serializer = BacktestSerializer(backtests, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error fetching backtests: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AvailableDataView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to see available data
    
    def get(self, request):
        """Get available tickers and timeframes from CSV data"""
        try:
            tickers = get_available_tickers()
            
            # Get timeframes for each ticker
            ticker_data = {}
            for ticker in tickers:
                timeframes = get_available_timeframes(ticker)
                ticker_data[ticker] = timeframes
            
            # If user is authenticated, filter timeframes based on tier
            if request.user.is_authenticated:
                user_tier = request.user.profile.tier
                allowed_timeframes = request.user.profile.get_allowed_timeframes()
                allowed_tickers = request.user.profile.get_allowed_tickers()
                
                # Filter timeframes for each ticker based on user tier
                for ticker in ticker_data:
                    ticker_data[ticker] = [tf for tf in ticker_data[ticker] if tf in allowed_timeframes]
                
                # Filter tickers based on user tier
                if allowed_tickers is not None:  # None means all tickers allowed
                    tickers = [ticker for ticker in tickers if ticker in allowed_tickers]
                    # Also filter the ticker_data to only include allowed tickers
                    ticker_data = {ticker: timeframes for ticker, timeframes in ticker_data.items() if ticker in allowed_tickers}
            
            return Response({
                'tickers': tickers,
                'ticker_data': ticker_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error fetching available data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserTimeframesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get allowed timeframes for the authenticated user based on their tier"""
        try:
            user_tier = request.user.profile.tier
            allowed_timeframes = request.user.profile.get_allowed_timeframes()
            
            return Response({
                'tier': user_tier,
                'allowed_timeframes': allowed_timeframes
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error fetching user timeframes: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserTickersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get allowed tickers for the authenticated user based on their tier"""
        try:
            user_tier = request.user.profile.tier
            allowed_tickers = request.user.profile.get_allowed_tickers()
            
            return Response({
                'tier': user_tier,
                'allowed_tickers': allowed_tickers
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error fetching user tickers: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive dashboard statistics for the authenticated user"""
        try:
            user = request.user
            
            # Get user's backtests
            backtests = Backtest.objects.filter(user=user)
            
            if not backtests.exists():
                return Response({
                    'portfolio_summary': {
                        'total_backtests': 0,
                        'total_strategies': 0,
                        'best_win_rate': 0,
                        'best_strategy_return': 0,
                        'total_pnl': 0
                    },
                    'top_strategies': [],
                    'recent_backtests': []
                }, status=status.HTTP_200_OK)
            
            # Calculate portfolio summary
            total_backtests = user.profile.total_backtests  # Use the total counter instead of stored count
            total_strategies = Strategy.objects.filter(user=user).count()
            
            # Calculate total P&L and find best strategy return
            total_pnl = 0
            best_strategy_return = 0
            
            for backtest in backtests:
                if backtest.results and 'stats' in backtest.results:
                    stats = backtest.results['stats']
                    if 'Return [%]' in stats:
                        return_pct = float(stats['Return [%]'])
                        total_pnl += return_pct
                        if return_pct > best_strategy_return:
                            best_strategy_return = return_pct
            
            # Get top performing strategies
            strategy_performance = {}
            for backtest in backtests:
                strategy_name = backtest.strategy_name
                if strategy_name not in strategy_performance:
                    strategy_performance[strategy_name] = {
                        'name': strategy_name,
                        'total_return': 0,
                        'backtest_count': 0,
                        'win_count': 0,
                        'avg_return': 0
                    }
                
                if backtest.results and 'stats' in backtest.results:
                    stats = backtest.results['stats']
                    if 'Return [%]' in stats:
                        return_pct = float(stats['Return [%]'])
                        strategy_performance[strategy_name]['total_return'] += return_pct
                        strategy_performance[strategy_name]['backtest_count'] += 1
                        if return_pct > 0:
                            strategy_performance[strategy_name]['win_count'] += 1
            
            # Calculate averages and find best win rate
            best_win_rate = 0
            for strategy in strategy_performance.values():
                if strategy['backtest_count'] > 0:
                    strategy['avg_return'] = strategy['total_return'] / strategy['backtest_count']
                    strategy['win_rate'] = (strategy['win_count'] / strategy['backtest_count']) * 100
                    if strategy['win_rate'] > best_win_rate:
                        best_win_rate = strategy['win_rate']
            
            # Ensure best_win_rate is always a valid number
            if not isinstance(best_win_rate, (int, float)) or best_win_rate < 0:
                best_win_rate = 0
            
            # Get top 3 strategies by total return
            top_strategies = sorted(
                strategy_performance.values(), 
                key=lambda x: x['total_return'], 
                reverse=True
            )[:3]
            
            # Get 3 most recent backtests for display
            recent_backtests_data = []
            for backtest in backtests.order_by('-created_at')[:3]:
                if backtest.results and 'stats' in backtest.results:
                    stats = backtest.results['stats']
                    
                    recent_backtests_data.append({
                        'id': backtest.id,
                        'strategy_name': backtest.strategy_name,
                        'ticker': backtest.ticker,
                        'return_pct': stats.get('Return [%]', 'N/A'),
                        'final_equity': stats.get('Equity Final [$]', 'N/A'),
                        'trade_count': stats.get('# Trades', 0),
                        'created_at': backtest.created_at,
                        'timeframe': backtest.timeframe,
                        'leverage': backtest.leverage,
                        'results': backtest.results  # Include full results for chart
                    })
            
            return Response({
                'portfolio_summary': {
                    'total_backtests': total_backtests,
                    'total_strategies': total_strategies,
                    'best_win_rate': round(best_win_rate, 1),
                    'best_strategy_return': round(best_strategy_return, 2),
                    'total_pnl': round(total_pnl, 2)
                },
                'top_strategies': top_strategies,
                'recent_backtests': recent_backtests_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": f"Error fetching dashboard stats: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


