from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Strategy, Backtest, UserProfile, EmailVerification

class UserProfileSerializer(serializers.ModelSerializer):
    tier = serializers.CharField(read_only=True)
    strategy_limit = serializers.SerializerMethodField()
    daily_backtest_limit = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['email_verified', 'email_verification_sent_at', 'tier', 'strategy_limit', 'daily_backtest_limit']
    
    def get_strategy_limit(self, obj):
        return obj.get_strategy_limit()
    
    def get_daily_backtest_limit(self, obj):
        return obj.get_daily_backtest_limit()

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    email_verified = serializers.BooleanField(read_only=True)
    tier = serializers.CharField(source='profile.tier', read_only=True)
    strategy_limit = serializers.IntegerField(source='profile.strategy_limit', read_only=True)
    daily_backtest_limit = serializers.IntegerField(source='profile.daily_backtest_limit', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile', 'email_verified', 'tier', 'strategy_limit', 'daily_backtest_limit']
        extra_kwargs = {'password': {'write_only': True}} # Password shouldn't be readable

    def validate_email(self, value):
        """
        Validate that the email is unique across all users.
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """
        Validate that the username is unique across all users.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        # Use the create_user method to handle password hashing
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # UserProfile is automatically created by Django signals
        # No need to manually create it here
        
        return user

class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerification
        fields = ['token', 'created_at', 'expires_at', 'is_used']
        read_only_fields = ['token', 'created_at', 'expires_at', 'is_used']

class StrategySerializer(serializers.ModelSerializer):
    class Meta:
        model = Strategy
        fields = ['id', 'name', 'configuration', 'created_at', 'updated_at']
        read_only_fields = ['user']
    
    def validate(self, data):
        """
        Custom validation to check strategy limits before creation.
        """
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user
            current_strategy_count = Strategy.objects.filter(user=user).count()
            strategy_limit = user.profile.get_strategy_limit()
            
            if current_strategy_count >= strategy_limit:
                raise serializers.ValidationError(
                    f"You have reached your strategy limit of {strategy_limit} for your {user.profile.tier.title()} tier. "
                    f"Please upgrade your plan to create more strategies."
                )
        
        return data

class BacktestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Backtest
        fields = ['id', 'strategy_name', 'ticker', 'start_date', 'end_date', 'timeframe', 'initial_cash', 'leverage', 'results', 'created_at']
        read_only_fields = ['user']