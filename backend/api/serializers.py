from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Strategy, Backtest, UserProfile, EmailVerification

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['email_verified', 'email_verification_sent_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    email_verified = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'profile', 'email_verified']
        extra_kwargs = {'password': {'write_only': True}} # Password shouldn't be readable

    def create(self, validated_data):
        # Use the create_user method to handle password hashing
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
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

class BacktestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Backtest
        fields = ['id', 'strategy_name', 'ticker', 'start_date', 'end_date', 'timeframe', 'initial_cash', 'leverage', 'results', 'created_at']
        read_only_fields = ['user']