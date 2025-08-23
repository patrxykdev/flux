from django.db import models
from django.contrib.auth.models import User

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