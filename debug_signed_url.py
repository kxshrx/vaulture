#!/usr/bin/env python3
"""
Debug the Supabase signed URL issue
"""

import os
from dotenv import load_dotenv

def debug_signed_url():
    load_dotenv()
    
    print("🔍 Debugging Supabase Signed URL Issue")
    print("=" * 40)
    
    try:
        from backend.core.supabase import get_supabase_admin_client
        
        client = get_supabase_admin_client()
        
        # Test file that should exist (we can create one for testing)
        test_filename = "debug-test.txt"
        bucket_name = "product-files"
        
        print(f"📦 Testing bucket: {bucket_name}")
        print(f"📄 Test file: {test_filename}")
        
        # First, create a test file
        print(f"\n1. Creating test file...")
        try:
            upload_response = client.storage.from_(bucket_name).upload(
                test_filename, 
                b"test content for debugging",
                file_options={"upsert": "true"}
            )
            print(f"   ✅ Test file created")
        except Exception as e:
            print(f"   ❌ Upload failed: {e}")
            return
        
        # Now test signed URL creation
        print(f"\n2. Testing signed URL creation...")
        try:
            # Try the current method
            response = client.storage.from_(bucket_name).create_signed_url(
                test_filename, 60
            )
            print(f"   ✅ Signed URL created successfully")
            print(f"   🔗 Response type: {type(response)}")
            print(f"   📋 Response keys: {list(response.keys()) if isinstance(response, dict) else 'Not a dict'}")
            
            if isinstance(response, dict):
                for key, value in response.items():
                    print(f"      {key}: {str(value)[:100]}...")
        
        except Exception as e:
            print(f"   ❌ Signed URL failed: {e}")
            print(f"   🔧 Error type: {type(e)}")
            
            # Try alternative method
            print(f"\n3. Trying alternative signed URL method...")
            try:
                response = client.storage.from_(bucket_name).create_signed_url(
                    path=test_filename, 
                    expires_in=60
                )
                print(f"   ✅ Alternative method worked")
                print(f"   🔗 Response: {response}")
            except Exception as e2:
                print(f"   ❌ Alternative also failed: {e2}")
        
        # Clean up
        print(f"\n4. Cleaning up test file...")
        try:
            client.storage.from_(bucket_name).remove([test_filename])
            print(f"   ✅ Test file removed")
        except Exception as e:
            print(f"   ⚠️  Cleanup failed: {e}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_signed_url()
