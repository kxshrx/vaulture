# Database Migration for Stripe Integration

## Overview

This migration adds payment-related fields to the `purchases` table to support proper Stripe integration.

## Changes Made

### New Fields in `purchases` table:

- `stripe_payment_intent_id` (String, unique, nullable) - Stripe Payment Intent ID
- `stripe_session_id` (String, unique, nullable) - Stripe Checkout Session ID
- `amount_paid` (Float) - Amount paid for the purchase
- `currency` (String, default 'usd') - Payment currency
- `payment_status` (Enum) - Payment status: pending, completed, failed, refunded
- `completed_at` (DateTime, nullable) - When payment was completed

### New Enum

- `PaymentStatus` enum with values: PENDING, COMPLETED, FAILED, REFUNDED

## Migration Steps

### For SQLite (Development)

If you're using SQLite for development, the easiest approach is to:

1. **Backup your existing database:**

   ```bash
   cp creators_platform.db creators_platform.db.backup
   ```

2. **Delete existing database and let it recreate:**

   ```bash
   rm creators_platform.db
   ```

3. **Restart your application** - SQLAlchemy will recreate the tables with the new schema.

### For PostgreSQL (Production)

If you have existing data you want to preserve, run these SQL commands:

```sql
-- Add payment status enum
CREATE TYPE paymentstatus AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Add new columns to purchases table
ALTER TABLE purchases
ADD COLUMN stripe_payment_intent_id VARCHAR UNIQUE,
ADD COLUMN stripe_session_id VARCHAR UNIQUE,
ADD COLUMN amount_paid FLOAT,
ADD COLUMN currency VARCHAR DEFAULT 'usd',
ADD COLUMN payment_status paymentstatus DEFAULT 'completed',
ADD COLUMN completed_at TIMESTAMP;

-- Update existing purchases to have completed status and completed_at timestamp
UPDATE purchases
SET payment_status = 'completed',
    completed_at = created_at,
    currency = 'usd'
WHERE payment_status IS NULL;

-- If you have product prices available, you can update amount_paid:
UPDATE purchases
SET amount_paid = products.price
FROM products
WHERE purchases.product_id = products.id
AND purchases.amount_paid IS NULL;
```

### Using Alembic (Recommended for Production)

If you're using Alembic for migrations, create a new migration:

```bash
alembic revision --autogenerate -m "Add Stripe payment fields to purchases"
alembic upgrade head
```

## Verification

After migration, verify the changes:

1. **Check table structure:**

   ```sql
   \d+ purchases  -- PostgreSQL
   .schema purchases  -- SQLite
   ```

2. **Test the application:**

   ```bash
   python test_stripe.py
   ```

3. **Check API endpoints:**
   - Visit `http://localhost:8000/docs` to see the updated API documentation
   - Test creating a purchase to ensure checkout sessions work

## Rollback Plan

If you need to rollback:

### SQLite

```bash
cp creators_platform.db.backup creators_platform.db
```

### PostgreSQL

```sql
-- Remove added columns
ALTER TABLE purchases
DROP COLUMN stripe_payment_intent_id,
DROP COLUMN stripe_session_id,
DROP COLUMN amount_paid,
DROP COLUMN currency,
DROP COLUMN payment_status,
DROP COLUMN completed_at;

-- Drop enum type
DROP TYPE paymentstatus;
```

## Notes

- All existing purchases will be marked as 'completed' after migration
- New purchases will go through the proper Stripe payment flow
- The `completed_at` field for existing purchases will be set to their `created_at` timestamp
- Test mode purchases will work immediately after migration
