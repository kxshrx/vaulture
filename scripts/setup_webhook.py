#!/usr/bin/env python3
"""
Script to automatically set up Stripe webhook with ngrok URL
"""
import os
import requests
import json
import stripe
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_ngrok_url():
    """Get the current ngrok public URL"""
    try:
        response = requests.get("http://localhost:4040/api/tunnels")
        tunnels = response.json()
        
        for tunnel in tunnels.get("tunnels", []):
            if tunnel.get("proto") == "https":
                return tunnel.get("public_url")
        
        print("No HTTPS ngrok tunnel found")
        return None
    except Exception as e:
        print(f"Error getting ngrok URL: {e}")
        return None

def create_or_update_webhook(webhook_url):
    """Create or update Stripe webhook endpoint"""
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    
    if not stripe.api_key:
        print("Error: STRIPE_SECRET_KEY not found in environment variables")
        return False
    
    webhook_endpoint = f"{webhook_url}/purchase/webhook"
    
    try:
        # List existing webhooks
        webhooks = stripe.WebhookEndpoint.list()
        
        # Check if we already have a webhook for this endpoint
        existing_webhook = None
        for webhook in webhooks.data:
            if "ngrok" in webhook.url or "localhost" in webhook.url:
                existing_webhook = webhook
                break
        
        if existing_webhook:
            # Update existing webhook
            stripe.WebhookEndpoint.modify(
                existing_webhook.id,
                url=webhook_endpoint,
                enabled_events=[
                    "checkout.session.completed",
                    "payment_intent.succeeded",
                    "payment_intent.payment_failed"
                ]
            )
            print(f"✅ Updated existing webhook: {webhook_endpoint}")
            print(f"Webhook ID: {existing_webhook.id}")
        else:
            # Create new webhook
            webhook = stripe.WebhookEndpoint.create(
                url=webhook_endpoint,
                enabled_events=[
                    "checkout.session.completed",
                    "payment_intent.succeeded", 
                    "payment_intent.payment_failed"
                ]
            )
            print(f"✅ Created new webhook: {webhook_endpoint}")
            print(f"Webhook ID: {webhook.id}")
        
        return True
        
    except Exception as e:
        print(f"Error creating/updating webhook: {e}")
        return False

def main():
    print("🔧 Setting up Stripe webhook with ngrok...")
    
    # Get ngrok URL
    ngrok_url = get_ngrok_url()
    if not ngrok_url:
        print("❌ Could not get ngrok URL. Make sure ngrok is running on port 8000")
        return
    
    print(f"📡 Found ngrok URL: {ngrok_url}")
    
    # Create or update webhook
    if create_or_update_webhook(ngrok_url):
        print("🎉 Webhook setup complete!")
        print(f"🔗 Webhook URL: {ngrok_url}/purchase/webhook")
        print("\nYou can now test payments and the webhook will automatically process them.")
    else:
        print("❌ Webhook setup failed")

if __name__ == "__main__":
    main()
