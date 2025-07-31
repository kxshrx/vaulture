#!/usr/bin/env python3
"""
Test script for Stripe integration
Run this to test if your Stripe configuration is working correctly
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

def test_stripe_configuration():
    """Test basic Stripe configuration"""
    print("🔧 Testing Stripe Configuration...")
    print(f"✓ Stripe Secret Key: {'✓ Set' if settings.STRIPE_SECRET_KEY else '✗ Missing'}")
    print(f"✓ Stripe Publishable Key: {'✓ Set' if settings.STRIPE_PUBLISHABLE_KEY else '✗ Missing'}")
    print(f"✓ Stripe Webhook Secret: {'✓ Set' if settings.STRIPE_WEBHOOK_SECRET else '✗ Missing'}")
    
    if not settings.STRIPE_SECRET_KEY:
        print("❌ Stripe secret key is required!")
        return False
    
    try:
        # Test API connection
        account = stripe.Account.retrieve()
        display_name = getattr(account, 'display_name', None) or getattr(account, 'business_profile', {}).get('name', account.id)
        livemode = getattr(account, 'livemode', False)
        print(f"✓ Connected to Stripe account: {display_name}")
        print(f"✓ Test mode: {'Yes' if not livemode else 'No'}")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to Stripe: {str(e)}")
        return False

def test_checkout_session_creation():
    """Test creating a checkout session"""
    print("\n💳 Testing Checkout Session Creation...")
    
    try:
        session = StripeService.create_checkout_session(
            product_title="Test Product",
            product_description="This is a test product",
            price=9.99,
            product_id=1,
            user_id=1,
            success_url="https://example.com/success",
            cancel_url="https://example.com/cancel"
        )
        
        print(f"✓ Checkout session created: {session.id}")
        print(f"✓ Checkout URL: {session.url}")
        print(f"✓ Expires at: {session.expires_at}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create checkout session: {str(e)}")
        return False

def main():
    """Run all Stripe tests"""
    print("🚀 Vaulture Stripe Integration Test\n")
    
    # Test configuration
    config_ok = test_stripe_configuration()
    
    if not config_ok:
        print("\n❌ Stripe configuration failed. Please check your environment variables.")
        return False
    
    # Test checkout session creation
    checkout_ok = test_checkout_session_creation()
    
    if config_ok and checkout_ok:
        print("\n✅ All tests passed! Stripe integration is working correctly.")
        print("\n📋 Next steps:")
        print("1. Set up your Stripe webhook endpoint: /purchase/webhook")
        print("2. Configure your webhook to send these events:")
        print("   - checkout.session.completed")
        print("   - payment_intent.succeeded")
        print("   - payment_intent.payment_failed")
        print("3. Update your frontend to redirect to the checkout URLs")
        return True
    else:
        print("\n❌ Some tests failed. Please check your Stripe configuration.")
        return False

if __name__ == "__main__":
    main()
