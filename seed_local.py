"""Quick script to seed local database"""
import sys
sys.path.insert(0, '.')

# Force local database
import os
os.environ.pop('DATABASE_URL', None)

from backend.startup import create_tables, seed_database

if __name__ == "__main__":
    create_tables()
    seed_database()
