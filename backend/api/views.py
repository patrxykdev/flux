import os
from datetime import datetime
import pandas as pd
import numpy as np

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics

from django.contrib.auth.models import User
from .models import Strategy, Backtest
from .serializers import UserSerializer, StrategySerializer, BacktestSerializer
from .backtester import run_backtest
from .csv_data_loader import load_csv_data, get_available_tickers, get_available_timeframes

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

        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": serializer.data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

# api/views.py (add this new class)

class ProfileView(APIView):
    permission_classes = (IsAuthenticated,) # This is the key part!

    def get(self, request):
        # The user is available via request.user thanks to JWTAuthentication
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

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
            
            return Response({
                'tickers': tickers,
                'ticker_data': ticker_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error fetching available data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


