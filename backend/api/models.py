from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
from datetime import timedelta
from django.utils import timezone

class UserProfile(models.Model):
    TIER_CHOICES = [
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('premium', 'Premium'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    email_verified = models.BooleanField(default=False)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    total_backtests = models.IntegerField(default=0)  # Track total backtests performed
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='free')
    
    def __str__(self):
        return f"{self.user.username}'s profile"
    
    def get_strategy_limit(self):
        """Get the maximum number of strategies allowed for this tier"""
        limits = {
            'free': 1,
            'pro': 5,
            'premium': 10,
        }
        return limits.get(self.tier, 1)
    
    def get_daily_backtest_limit(self):
        """Get the maximum number of backtests allowed per day for this tier"""
        limits = {
            'free': 3,
            'pro': 50,
            'premium': 100,
        }
        return limits.get(self.tier, 3)
    
    def get_allowed_timeframes(self):
        """Get the allowed timeframes for this tier"""
        limits = {
            'free': ['4h', '1d'],  # Free tier: only 4h and 1d
            'pro': ['15m', '30m', '1h', '4h', '1d'],  # Pro tier: 15m and above
            'premium': ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],  # Premium tier: 1m and above
        }
        return limits.get(self.tier, ['4h', '1d'])
    
    def get_allowed_tickers(self):
        """Get the allowed tickers for this tier"""
        limits = {
            'free': ['EURUSD', 'AAPL'],  # Free tier: only EURUSD and AAPL
            'pro': None,  # Pro tier: all tickers
            'premium': None,  # Premium tier: all tickers
        }
        return limits.get(self.tier, ['EURUSD', 'AAPL'])

class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Email verification for {self.user.username}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

# Signal to automatically create UserProfile when User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)

class Strategy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="strategies")
    name = models.CharField(max_length=100)
    configuration = models.JSONField() # This field stores the strategy's logic
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"'{self.name}' by {self.user.username}"

class Backtest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="backtests")
    strategy_name = models.CharField(max_length=100)
    ticker = models.CharField(max_length=10)
    start_date = models.DateField()
    end_date = models.DateField()
    timeframe = models.CharField(max_length=10)
    initial_cash = models.DecimalField(max_digits=12, decimal_places=2)
    leverage = models.DecimalField(max_digits=3, decimal_places=1)
    results = models.JSONField()  # Store all backtest results
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']  # Most recent first
        
    def __str__(self):
        return f"{self.strategy_name} on {self.ticker} ({self.start_date} to {self.end_date})"
    
    def get_pnl(self):
        """Extract P&L from results"""
        if self.results and 'stats' in self.results:
            return self.results['stats'].get('Return [%]', 'N/A')
        return 'N/A'
    
    def get_trade_count(self):
        """Extract trade count from results"""
        if self.results and 'stats' in self.results:
            return self.results['stats'].get('# Trades', 0)
        return 0
    
    def get_final_equity(self):
        """Extract final equity from results"""
        if self.results and 'stats' in self.results:
            return self.results['stats'].get('Equity Final [$]', 'N/A')
        return 'N/A'