import stripe
from typing import Optional, Dict, Any, List
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    @staticmethod
    def create_checkout_session(
        product_title: str, 
        product_description: str,
        price: float, 
        product_id: int,
        user_id: int,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None
    ) -> stripe.checkout.Session:
        """Create a Stripe checkout session for a product purchase"""
        
        # Use default URLs if not provided or if placeholder values are used
        if not success_url or success_url in ["string", ""]:
            success_url = f"{settings.STRIPE_SUCCESS_URL}?session_id={{CHECKOUT_SESSION_ID}}"
        if not cancel_url or cancel_url in ["string", ""]:
            cancel_url = settings.STRIPE_CANCEL_URL
        
        # Debug logging
        logger.info(f"Creating Stripe session with success_url: {success_url}")
        logger.info(f"Creating Stripe session with cancel_url: {cancel_url}")
            
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': product_title,
                            'description': product_description,
                        },
                        'unit_amount': int(price * 100),  # Convert to cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'product_id': str(product_id),
                    'user_id': str(user_id),
                },
                payment_intent_data={
                    'metadata': {
                        'product_id': str(product_id),
                        'user_id': str(user_id),
                    }
                }
            )
            logger.info(f"Created checkout session {session.id} for product {product_id}")
            return session
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating checkout session: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating checkout session: {str(e)}")
            raise
    
    @staticmethod
    def get_session(session_id: str) -> stripe.checkout.Session:
        """Retrieve a checkout session by ID"""
        try:
            return stripe.checkout.Session.retrieve(session_id)
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving session {session_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
        """Retrieve a payment intent by ID"""
        try:
            return stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving payment intent {payment_intent_id}: {str(e)}")
            raise
    
    @staticmethod
    def construct_webhook_event(payload: bytes, sig_header: str) -> stripe.Event:
        """Construct and verify a webhook event"""
        try:
            return stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error constructing webhook event: {str(e)}")
            raise
    
    @staticmethod
    def create_refund(payment_intent_id: str, amount: Optional[int] = None, reason: str = "requested_by_customer") -> stripe.Refund:
        """Create a refund for a payment intent"""
        try:
            refund_data = {
                'payment_intent': payment_intent_id,
                'reason': reason
            }
            if amount:
                refund_data['amount'] = amount
            
            refund = stripe.Refund.create(**refund_data)
            logger.info(f"Created refund {refund.id} for payment intent {payment_intent_id}")
            return refund
        except stripe.error.StripeError as e:
            logger.error(f"Error creating refund for {payment_intent_id}: {str(e)}")
            raise
    
    @staticmethod
    def list_payment_methods(customer_id: str) -> List[stripe.PaymentMethod]:
        """List payment methods for a customer"""
        try:
            return stripe.PaymentMethod.list(
                customer=customer_id,
                type="card"
            )
        except stripe.error.StripeError as e:
            logger.error(f"Error listing payment methods for customer {customer_id}: {str(e)}")
            raise
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None, metadata: Optional[Dict[str, str]] = None) -> stripe.Customer:
        """Create a new Stripe customer"""
        try:
            customer_data = {'email': email}
            if name:
                customer_data['name'] = name
            if metadata:
                customer_data['metadata'] = metadata
                
            customer = stripe.Customer.create(**customer_data)
            logger.info(f"Created customer {customer.id} for email {email}")
            return customer
        except stripe.error.StripeError as e:
            logger.error(f"Error creating customer for {email}: {str(e)}")
            raise
    
    @staticmethod
    def get_checkout_session_line_items(session_id: str) -> List[stripe.LineItem]:
        """Get line items for a checkout session"""
        try:
            return stripe.checkout.Session.list_line_items(session_id)
        except stripe.error.StripeError as e:
            logger.error(f"Error getting line items for session {session_id}: {str(e)}")
            raise

# Legacy function for backward compatibility
def create_checkout_session(product_title: str, price: float, success_url: str, cancel_url: str):
    """Legacy function - use StripeService.create_checkout_session instead"""
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': product_title,
                },
                'unit_amount': int(price * 100),  # Convert to cents
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url=success_url,
        cancel_url=cancel_url,
    )
    return session
