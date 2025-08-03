#!/usr/bin/env python3
"""
Quick test to verify RLS is disabled and uploads should work
"""

import os
from dotenv import load_dotenv

def test_rls_status():
    load_dotenv()
    
    print("🔧 Testing Supabase Storage RLS Status")
    print("=" * 45)
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        client = create_client(supabase_url, service_key)
        
        # Test upload permissions for both buckets
        buckets = ['product-files', 'product-images']
        
        for bucket_name in buckets:
            print(f"\n📦 Testing {bucket_name}:")
            
            try:
                # Try to list files (this tests basic access)
                files = client.storage.from_(bucket_name).list()
                print(f"   ✅ Bucket accessible ({len(files)} files)")
                
                # Try a small test upload to check RLS
                test_content = b"test file content"
                test_filename = f"test-{bucket_name}.txt"
                
                try:
                    response = client.storage.from_(bucket_name).upload(
                        test_filename, 
                        test_content,
                        file_options={"upsert": "true"}  # Overwrite if exists
                    )
                    
                    print(f"   ✅ Upload test successful!")
                    
                    # Clean up test file
                    client.storage.from_(bucket_name).remove([test_filename])
                    print(f"   🧹 Test file cleaned up")
                    
                except Exception as upload_error:
                    if "violates row-level security policy" in str(upload_error):
                        print(f"   ❌ RLS is still ENABLED - uploads blocked")
                        print(f"   💡 Go disable RLS for this bucket in Supabase dashboard")
                    else:
                        print(f"   ❌ Upload failed: {upload_error}")
                
            except Exception as e:
                print(f"   ❌ Bucket access failed: {e}")
        
        print(f"\n🎯 Next Steps:")
        print(f"If you see 'RLS is still ENABLED' above:")
        print(f"1. Go to: {supabase_url.replace('https://', 'https://supabase.com/dashboard/project/')}")
        print(f"2. Storage → Settings")  
        print(f"3. For each bucket: Edit → Uncheck RLS → Save")
        print(f"4. Try uploading in your app again")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_rls_status()
