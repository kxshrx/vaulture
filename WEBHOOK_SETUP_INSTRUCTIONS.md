# 🪝 STRIPE WEBHOOK SETUP INSTRUCTIONS

## Step 3: Create Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks
2. **Make sure you're in Test Mode** (toggle in top-left corner)
3. **Click "Add endpoint"**
4. **Fill in the details**:

   **Endpoint URL**: `https://YOUR_NGROK_URL.ngrok.io/purchase/webhook`
   
   *(Replace YOUR_NGROK_URL with the URL from your ngrok terminal)*

5. **Select Events to Send**:
   Click "Select events" and choose:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.dispute.created`

6. **Click "Add endpoint"**

7. **Copy the Signing Secret**:
   - After creating, click on your new webhook
   - In the "Signing secret" section, click "Reveal"
   - Copy the secret (starts with `whsec_`)

## Step 4: Update Your .env File

Add the webhook secret to your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_paste_your_secret_here
```

## Step 5: Test the Webhook

Once you've completed the above steps, your webhook integration will be complete!

The webhook endpoint is already implemented in your code at:
`POST /purchase/webhook`

## What Happens Next

1. When someone makes a payment on Stripe
2. Stripe automatically sends a webhook to your server
3. Your server validates the webhook signature
4. Your server updates the purchase status in the database
5. User immediately gets access to their purchase

## Verification

After setup, you can test by:
1. Creating a purchase via your API
2. Completing payment with test card: `4242 4242 4242 4242`
3. Checking that purchase status updates automatically
4. No manual verification needed!

---

**Once you complete these steps, come back and I'll help you test the webhook integration!**
