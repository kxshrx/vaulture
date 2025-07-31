# 🔥 STRIPE INTEGRATION SETUP GUIDE

Your Vaulture backend already has **complete Stripe payment integration**! You just need to configure your API keys.

## ✅ What's Already Implemented

Your backend includes:

- **Complete Payment Flow**: Checkout sessions, payment processing, webhooks
- **Secure Handling**: Payment intent tracking, failure handling, refunds
- **User Experience**: Purchase history, statistics, download access control
- **Error Handling**: Comprehensive error management and logging

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test)
2. Make sure you're in **Test Mode** (toggle in top-left)
3. Navigate to **Developers** → **API Keys**
4. Copy these keys:
   - **Secret key** (starts with `sk_test_`)
   - **Publishable key** (starts with `pk_test_`)

### Step 2: Update Environment Variables

Edit your `.env` file and replace these lines:

```bash
# Replace these placeholder values with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### Step 3: Test Your Setup

Run the test script to verify everything works:

```bash
python test_stripe_comprehensive.py
```

### Step 4: Set Up Webhooks (For Production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set URL to: `https://yourdomain.com/purchase/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
5. Copy the webhook signing secret
6. Update your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## 🧪 Testing Your Integration

### Test Cards (Use these for testing)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Authentication Required**: `4000 0025 0000 3155`

### API Testing Flow

1. **Create Checkout Session**:

   ```bash
   curl -X POST "http://localhost:8000/purchase/1" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"success_url": "http://localhost:3000/success", "cancel_url": "http://localhost:3000/cancel"}'
   ```

2. **Check Purchase Status**:

   ```bash
   curl "http://localhost:8000/purchase/session/cs_test_session_id" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **View User Purchases**:
   ```bash
   curl "http://localhost:8000/purchase/mypurchases" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 🛡️ Security Features

Your integration includes:

- ✅ **Webhook Signature Verification**
- ✅ **Payment Intent Validation**
- ✅ **User Authorization Checks**
- ✅ **Duplicate Purchase Prevention**
- ✅ **Secure File Access Control**

## 🔄 Payment Flow

1. **User clicks "Buy"** → Frontend calls `POST /purchase/{product_id}`
2. **Backend creates checkout** → Returns Stripe checkout URL
3. **User pays on Stripe** → Stripe handles payment securely
4. **Stripe sends webhook** → Backend marks purchase complete
5. **User gets access** → Can download via `GET /download/{product_id}`

## 📱 Frontend Integration

Your frontend needs to:

1. **Get checkout URL** from `POST /purchase/{product_id}`
2. **Redirect user** to the returned `checkout_url`
3. **Handle success/cancel** pages with session validation
4. **Check purchase status** via `GET /purchase/session/{session_id}`

Example frontend code:

```javascript
// Create checkout session
const response = await fetch("/purchase/123", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    success_url: window.location.origin + "/success",
    cancel_url: window.location.origin + "/cancel",
  }),
});

const { checkout_url } = await response.json();
window.location.href = checkout_url;
```

## 🚨 Troubleshooting

### "Invalid API Key" Error

- Check that your `STRIPE_SECRET_KEY` starts with `sk_test_`
- Ensure no extra spaces or quotes in `.env` file
- Verify you're in test mode in Stripe Dashboard

### Webhook Issues

- Use ngrok for local development: `ngrok http 8000`
- Update webhook URL to your ngrok URL
- Check webhook logs in Stripe Dashboard

### Payment Not Completing

- Verify webhook events are configured correctly
- Check your application logs for webhook processing errors
- Ensure webhook secret matches your `.env` file

## 🎯 Production Checklist

Before going live:

- [ ] Switch to live Stripe keys (`sk_live_` and `pk_live_`)
- [ ] Update webhook URL to your production domain
- [ ] Configure proper success/cancel URLs
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts
- [ ] Configure proper error logging

## 💡 Additional Features

Your backend supports advanced features:

- **Refunds**: `StripeService.create_refund(payment_intent_id)`
- **Customer Management**: `StripeService.create_customer(email, name)`
- **Purchase Analytics**: `GET /purchase/stats`
- **Payment Methods**: Multiple card support via Stripe

## 🔗 Useful Links

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/test)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Stripe Documentation](https://stripe.com/docs)

---

**Your payment integration is enterprise-ready!** 🚀 Just add your API keys and you're good to go.
