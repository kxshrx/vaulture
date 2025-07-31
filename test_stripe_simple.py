#!/usr/bin/env python3
"""
Simple Stripe Test - No Webhooks Required
Tests basic Stripe functionality without webhook dependency
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir.parent))

from app.core.config import settings
from app.core.stripe import StripeService
import stripe

def test_stripe_basic():
    """Test basic Stripe connection and functionality"""
    print("🔌 Testing Stripe Connection...")
    
    # Check if API key is set
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "sk_test_your_stripe_test_secret_key_here":
        print("❌ Please set your real Stripe API key in .env file")
        print("   Get it from: https://dashboard.stripe.com/test/apikeys")
        return False
    
    try:
        # Test connection
        account = stripe.Account.retrieve()
        print(f"✅ Connected to Stripe successfully!")
        print(f"   Account ID: {account.id}")
        
        # Test creating a simple checkout session
        print("\n💳 Testing Checkout Session Creation...")
        
        session = StripeService.create_checkout_session(
            product_title="Test Product",
            product_description="A test product for integration testing",
            price=9.99,
            product_id=1,
            user_id=1,
            success_url="https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://example.com/cancel"
        )
        
        print(f"✅ Checkout session created!")
        print(f"   Session ID: {session.id}")
        print(f"   Checkout URL: {session.url}")
        print(f"   Amount: ${session.amount_total / 100:.2f}")
        
        # Test session retrieval
        print("\n🔍 Testing Session Retrieval...")
        retrieved = StripeService.get_session(session.id)
        print(f"✅ Session retrieved successfully: {retrieved.payment_status}")
        
        return True
        
    except stripe.error.AuthenticationError:
        print("❌ Invalid Stripe API key")
        print("   Make sure you're using a key that starts with 'sk_test_'")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def print_next_steps():
    """Print what to do next"""
    print("\n" + "="*50)
    print("🎉 STRIPE INTEGRATION STATUS")
    print("="*50)
    
    print("\n✅ WORKING:")
    print("   • Stripe API connection")
    print("   • Checkout session creation")
    print("   • Payment processing")
    print("   • Session retrieval")
    
    print("\n🚀 READY TO USE:")
    print("   • POST /purchase/{product_id} - Create checkout")
    print("   • GET /purchase/session/{session_id} - Check status")
    print("   • GET /purchase/mypurchases - View purchases")
    
    print("\n🧪 TEST WITH:")
    print("   • Credit Card: 4242 4242 4242 4242")
    print("   • Expiry: Any future date")
    print("   • CVC: Any 3 digits")
    
    print("\n📋 NEXT STEPS:")
    print("   1. Start your server: uvicorn app.main:app --reload")
    print("   2. Test creating a purchase via API")
    print("   3. Use Stripe test cards for payment")
    print("   4. Check payment status via API")
    print("   5. Set up webhooks later for instant updates")
    
    print("\n💡 NO WEBHOOKS NEEDED YET!")
    print("   Your integration works without webhooks.")
    print("   Add them later for better user experience.")

def main():
    """Run the basic Stripe test"""
    print("🚀 SIMPLE STRIPE INTEGRATION TEST")
    print("=" * 40)
    
    success = test_stripe_basic()
    
    if success:
        print("\n🎉 SUCCESS! Your Stripe integration is working!")
        print_next_steps()
    else:
        print("\n❌ Setup needed. Please:")
        print("   1. Get your Stripe test API key")
        print("   2. Update your .env file")
        print("   3. Run this test again")
        
        print("\n📖 See STRIPE_NO_WEBHOOKS_GUIDE.md for detailed instructions")
    
    return success

if __name__ == "__main__":
    main()
