#!/usr/bin/env python3
"""
Test the actual download flow
"""

import os
from dotenv import load_dotenv

def test_download_flow():
    load_dotenv()
    
    print("🔍 Testing Download Flow")
    print("=" * 30)
    
    try:
        from backend.services.storage_service import StorageService
        
        storage = StorageService()
        
        # Test with a file that might exist
        test_files = [
            "test-file.txt",
            "debug-test.txt", 
            "nonexistent-file.pdf"
        ]
        
        for file_path in test_files:
            print(f"\n📄 Testing: {file_path}")
            try:
                signed_url = storage.get_signed_url(file_path, expires_in=60)
                print(f"   ✅ Success: {signed_url[:80]}...")
            except Exception as e:
                print(f"   ❌ Failed: {e}")
        
        # Let's also check what files actually exist
        print(f"\n📦 Files in product-files bucket:")
        try:
            files = storage.supabase.storage.from_(storage.bucket_name).list()
            if files:
                for file in files[:5]:  # Show first 5
                    print(f"   - {file.get('name', file)}")
            else:
                print(f"   (empty)")
        except Exception as e:
            print(f"   ❌ Error listing files: {e}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_download_flow()
