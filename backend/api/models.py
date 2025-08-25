from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
from datetime import timedelta
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    email_verified = models.BooleanField(default=False)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

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