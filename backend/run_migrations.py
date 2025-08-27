#!/usr/bin/env python3
"""
Migration Runner Script
This script runs Django migrations after the database connection is established.
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django
django.setup()

def run_migrations():
    """Run Django migrations"""
    try:
        from django.core.management import execute_from_command_line
        
        print("Running Django migrations...")
        
        # Run migrations
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Migrations completed successfully!")
        
        # Show migration status
        execute_from_command_line(['manage.py', 'showmigrations'])
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=== Django Migration Runner ===")
    success = run_migrations()
    
    if success:
        print("\n✅ All migrations completed!")
        print("Your Django app should now work properly.")
    else:
        print("\n❌ Migrations failed!")
        print("Please check the error messages above.")
        sys.exit(1)
