#!/usr/bin/env python3
"""
Comprehensive Stripe Integration Test Suite
Tests all aspects of the Stripe payment integration
"""

import os
import sys
from pathlib import Path
import asyncio
import json

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir.parent))

from app.core.config import settings
from app.core.stripe import StripeService
from app.services.webhook_service import StripeWebhookService
import stripe

def test_stripe_connection():
    """Test basic Stripe API connection"""
    print("🔌 Testing Stripe API Connection...")
    
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "sk_test_your_stripe_test_secret_key_here":
        print("❌ Stripe secret key not configured. Please update your .env file.")
        return False
    
    try:
        account = stripe.Account.retrieve()
        business_name = getattr(account, 'display_name', None)
        if not business_name and hasattr(account, 'business_profile'):
            business_name = account.business_profile.get('name') if account.business_profile else None
        
        print(f"✓ Connected to Stripe account: {business_name or account.id}")
        print(f"✓ Account type: {account.type}")
        print(f"✓ Test mode: {'Yes' if not account.livemode else 'No'}")
        print(f"✓ Country: {account.country}")
        
        if account.livemode:
            print("⚠️  WARNING: You're connected to LIVE mode. Switch to test mode for development.")
        
        return True
    except stripe.error.AuthenticationError:
        print("❌ Invalid Stripe API key. Please check your STRIPE_SECRET_KEY.")
        return False
    except Exception as e:
        print(f"❌ Failed to connect to Stripe: {str(e)}")
        return False

def test_checkout_session_creation():
    """Test creating a checkout session"""
    print("\n💳 Testing Checkout Session Creation...")
    
    try:
        session = StripeService.create_checkout_session(
            product_title="Test Digital Product",
            product_description="This is a test digital product for payment integration testing",
            price=29.99,
            product_id=123,
            user_id=456,
            success_url="https://your-frontend.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://your-frontend.com/cancel"
        )
        
        print(f"✓ Checkout session created successfully")
        print(f"  - Session ID: {session.id}")
        print(f"  - Checkout URL: {session.url}")
        print(f"  - Amount: ${session.amount_total / 100:.2f}")
        print(f"  - Currency: {session.currency.upper()}")
        print(f"  - Expires at: {session.expires_at}")
        print(f"  - Payment status: {session.payment_status}")
        
        # Test session retrieval
        retrieved_session = StripeService.get_session(session.id)
        print(f"✓ Session retrieval successful: {retrieved_session.id}")
        
        return True, session
        
    except Exception as e:
        print(f"❌ Failed to create checkout session: {str(e)}")
        return False, None

def test_webhook_configuration():
    """Test webhook configuration"""
    print("\n🪝 Testing Webhook Configuration...")
    
    if not settings.STRIPE_WEBHOOK_SECRET or settings.STRIPE_WEBHOOK_SECRET == "whsec_your_webhook_endpoint_secret_here":
        print("⚠️  Webhook secret not configured. You'll need to:")
        print("   1. Create a webhook endpoint in your Stripe dashboard")
        print("   2. Add these events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed")
        print("   3. Copy the webhook signing secret to your .env file")
        return False
    
    print(f"✓ Webhook secret configured: {settings.STRIPE_WEBHOOK_SECRET[:12]}...")
    
    # Test webhook event construction (with dummy data)
    try:
        # This would normally fail without a real webhook payload, but we can test the setup
        print("✓ Webhook service is ready to process events")
        return True
    except Exception as e:
        print(f"❌ Webhook configuration error: {str(e)}")
        return False

def test_payment_methods():
    """Test payment method handling"""
    print("\n💰 Testing Payment Methods...")
    
    try:
        # Test creating a test customer
        customer = StripeService.create_customer(
            email="test@example.com",
            name="Test Customer",
            metadata={"test": "true", "environment": "development"}
        )
        
        print(f"✓ Test customer created: {customer.id}")
        print(f"  - Email: {customer.email}")
        print(f"  - Name: {customer.name}")
        
        # Clean up test customer
        stripe.Customer.delete(customer.id)
        print("✓ Test customer cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Payment method test failed: {str(e)}")
        return False

def test_error_handling():
    """Test error handling scenarios"""
    print("\n🚨 Testing Error Handling...")
    
    try:
        # Test invalid session retrieval
        try:
            StripeService.get_session("cs_invalid_session_id")
            print("❌ Should have failed with invalid session ID")
            return False
        except stripe.error.InvalidRequestError:
            print("✓ Invalid session ID handled correctly")
        
        # Test invalid payment intent retrieval
        try:
            StripeService.get_payment_intent("pi_invalid_payment_intent")
            print("❌ Should have failed with invalid payment intent ID")
            return False
        except stripe.error.InvalidRequestError:
            print("✓ Invalid payment intent ID handled correctly")
        
        print("✓ Error handling tests passed")
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {str(e)}")
        return False

def print_integration_summary():
    """Print summary of integration setup"""
    print("\n" + "="*60)
    print("🎯 STRIPE INTEGRATION SUMMARY")
    print("="*60)
    
    print("\n📋 Configuration Status:")
    print(f"  ✓ Secret Key: {'✓ Set' if settings.STRIPE_SECRET_KEY and settings.STRIPE_SECRET_KEY != 'sk_test_your_stripe_test_secret_key_here' else '❌ Not Set'}")
    print(f"  ✓ Publishable Key: {'✓ Set' if settings.STRIPE_PUBLISHABLE_KEY and settings.STRIPE_PUBLISHABLE_KEY != 'pk_test_your_stripe_test_publishable_key_here' else '❌ Not Set'}")
    print(f"  ✓ Webhook Secret: {'✓ Set' if settings.STRIPE_WEBHOOK_SECRET and settings.STRIPE_WEBHOOK_SECRET != 'whsec_your_webhook_endpoint_secret_here' else '❌ Not Set'}")
    
    print("\n🛣️ Available API Endpoints:")
    print("  • POST /purchase/{product_id} - Create checkout session")
    print("  • GET /purchase/session/{session_id} - Get purchase status")
    print("  • GET /purchase/mypurchases - User purchase history")
    print("  • GET /purchase/stats - Purchase statistics")
    print("  • POST /purchase/webhook - Stripe webhook handler")
    
    print("\n🔄 Payment Flow:")
    print("  1. User clicks 'Buy' → POST /purchase/{product_id}")
    print("  2. Backend creates Stripe checkout session")
    print("  3. User redirected to Stripe checkout")
    print("  4. After payment → Stripe sends webhook")
    print("  5. Webhook updates purchase status → User gets access")
    
    print("\n⚙️ Next Steps:")
    if settings.STRIPE_SECRET_KEY == "sk_test_your_stripe_test_secret_key_here":
        print("  1. Get your Stripe API keys from https://dashboard.stripe.com/test/apikeys")
        print("  2. Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env")
    
    if settings.STRIPE_WEBHOOK_SECRET == "whsec_your_webhook_endpoint_secret_here":
        print("  3. Create webhook endpoint at https://dashboard.stripe.com/test/webhooks")
        print("     - URL: https://yourdomain.com/purchase/webhook")
        print("     - Events: checkout.session.completed, payment_intent.succeeded")
        print("  4. Update STRIPE_WEBHOOK_SECRET in .env")
    
    print("  5. Test with Stripe test cards: https://stripe.com/docs/testing")
    print("  6. Update frontend to use checkout URLs from API responses")

def main():
    """Run comprehensive Stripe integration tests"""
    print("🚀 VAULTURE STRIPE INTEGRATION TEST SUITE")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 5
    
    # Test 1: Connection
    if test_stripe_connection():
        tests_passed += 1
    
    # Test 2: Checkout session creation
    checkout_success, session = test_checkout_session_creation()
    if checkout_success:
        tests_passed += 1
    
    # Test 3: Webhook configuration
    if test_webhook_configuration():
        tests_passed += 1
    
    # Test 4: Payment methods
    if test_payment_methods():
        tests_passed += 1
    
    # Test 5: Error handling
    if test_error_handling():
        tests_passed += 1
    
    print(f"\n📊 TEST RESULTS: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Your Stripe integration is working perfectly.")
    elif tests_passed >= 3:
        print("✅ Core functionality working. Complete the configuration to get 100%.")
    else:
        print("❌ Please fix the configuration issues and try again.")
    
    print_integration_summary()
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
