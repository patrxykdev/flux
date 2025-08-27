#!/usr/bin/env python3
"""
Database Connection Test Script
This script tests the database connection with SSL disabled.
Run this to verify your database configuration before starting Django.
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

def test_database_connection():
    """Test the database connection"""
    try:
        from django.db import connection
        from django.db.utils import OperationalError
        
        print("Testing database connection...")
        print(f"Database engine: {connection.settings_dict['ENGINE']}")
        print(f"Database host: {connection.settings_dict.get('HOST', 'N/A')}")
        print(f"Database port: {connection.settings_dict.get('PORT', 'N/A')}")
        print(f"Database name: {connection.settings_dict.get('NAME', 'N/A')}")
        print(f"Database user: {connection.settings_dict.get('USER', 'N/A')}")
        
        # Test connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ Database connection successful!")
            print(f"PostgreSQL version: {version[0]}")
            
            # Test if tables exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            print(f"Available tables: {[table[0] for table in tables]}")
            
    except OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=== Database Connection Test ===")
    success = test_database_connection()
    
    if success:
        print("\n✅ Database connection test passed!")
        print("You can now run Django migrations and start the server.")
    else:
        print("\n❌ Database connection test failed!")
        print("Please check your DATABASE_URL and SSL configuration.")
        sys.exit(1)
