# 🚀 STRIPE INTEGRATION - NO WEBHOOKS NEEDED (YET!)

Great news! You can test and use your Stripe integration **without setting up webhooks initially**. Here's how:

## 🎯 Phase 1: Basic Payment Integration (No Webhooks)

Your current setup can handle payments, but you'll need to manually check payment status or implement client-side confirmation.

### ✅ What Works Right Now:

1. **Create Checkout Sessions** - ✅ Working
2. **Process Payments** - ✅ Working
3. **Redirect Users** - ✅ Working
4. **Check Payment Status** - ✅ Working (via API calls)

### 🛠 Testing Without Webhooks

#### Step 1: Start Your Server

```bash
cd /Users/kxshrx/dev/vaulture
uvicorn app.main:app --reload
```

#### Step 2: Test Payment Creation

```bash
# Create a checkout session (replace with real JWT token)
curl -X POST "http://localhost:8000/purchase/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "success_url": "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
    "cancel_url": "http://localhost:3000/cancel"
  }'
```

#### Step 3: Check Payment Status

```bash
# After payment, check status using session ID
curl "http://localhost:8000/purchase/session/cs_test_SESSION_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔄 How It Works Without Webhooks

1. **User clicks Buy** → Your frontend calls `/purchase/{product_id}`
2. **Backend creates checkout** → Returns Stripe checkout URL
3. **User pays on Stripe** → Stripe processes payment
4. **User returns to success page** → Your frontend checks payment status
5. **Frontend polls API** → Calls `/purchase/session/{session_id}` to verify

### Frontend Integration Example:

```javascript
// 1. Create checkout session
async function buyProduct(productId) {
  const response = await fetch(`/purchase/${productId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/cancel`,
    }),
  });

  const { checkout_url, session_id } = await response.json();

  // Store session ID for later verification
  localStorage.setItem("payment_session_id", session_id);

  // Redirect to Stripe checkout
  window.location.href = checkout_url;
}

// 2. On success page, verify payment
async function verifyPayment() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  if (sessionId) {
    const response = await fetch(`/purchase/session/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const purchase = await response.json();

    if (purchase.payment_status === "completed") {
      // Payment successful! Show download link
      showSuccessMessage();
      redirectToDownload(purchase.product_id);
    } else {
      // Payment pending, keep checking
      setTimeout(verifyPayment, 2000); // Check again in 2 seconds
    }
  }
}
```

## 🎯 Phase 2: Add Webhooks Later (Recommended for Production)

Webhooks make the experience instant and more reliable. Here's how to set them up when ready:

### Step 1: Expose Your Local Server (for testing)

Use ngrok to make your local server accessible:

```bash
# Install ngrok if you haven't
brew install ngrok

# Expose your local server
ngrok http 8000
```

This gives you a public URL like: `https://abc123.ngrok.io`

### Step 2: Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Set URL to: `https://abc123.ngrok.io/purchase/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret

### Step 3: Update Your .env

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

### Step 4: Test Webhook

```bash
# Make a test payment and watch your server logs
# The webhook will automatically update purchase status
```

## 🧪 Testing Strategy

### Phase 1 Testing (No Webhooks):

1. Create checkout session via API
2. Use [Stripe test cards](https://stripe.com/docs/testing):
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Check payment status via API after payment

### Phase 2 Testing (With Webhooks):

1. Same as above, but status updates automatically
2. No need to poll for status changes
3. Instant download access after payment

## 🚨 Current Limitations (Without Webhooks)

- ⏰ **Slight delay**: User might need to wait/refresh to see purchase
- 🔄 **Manual checking**: Frontend needs to poll for payment status
- 📱 **Mobile issues**: Users might not return to success page

## ✅ Benefits of Adding Webhooks Later

- ⚡ **Instant updates**: Purchase status updates immediately
- 🔒 **Reliable**: Works even if user closes browser
- 📧 **Notifications**: Can send emails, trigger other actions
- 🛡️ **Secure**: Server-to-server communication

## 🎯 Recommendation

1. **Start without webhooks** - Get basic payments working
2. **Test thoroughly** - Use test cards and verify flow
3. **Add webhooks** - When ready for production or better UX

Your integration is solid! Webhooks are just the cherry on top. 🍒
