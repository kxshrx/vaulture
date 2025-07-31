from typing import Dict, Any
from sqlalchemy.orm import Session
from app.core.stripe import StripeService
from app.services.purchase_service import PurchaseService
from app.models.purchase import PaymentStatus
import stripe
import logging

logger = logging.getLogger(__name__)

class StripeWebhookService:
    
    @staticmethod
    def handle_webhook_event(
        db: Session,
        payload: bytes,
        sig_header: str
    ) -> Dict[str, Any]:
        """Process Stripe webhook events"""
        
        try:
            # Construct and verify the event
            event = StripeService.construct_webhook_event(payload, sig_header)
            
            logger.info(f"Received Stripe webhook event: {event['type']}")
            
            # Handle different event types
            if event['type'] == 'checkout.session.completed':
                return StripeWebhookService._handle_checkout_completed(db, event)
            
            elif event['type'] == 'payment_intent.succeeded':
                return StripeWebhookService._handle_payment_succeeded(db, event)
            
            elif event['type'] == 'payment_intent.payment_failed':
                return StripeWebhookService._handle_payment_failed(db, event)
            
            elif event['type'] == 'charge.dispute.created':
                return StripeWebhookService._handle_dispute_created(db, event)
            
            else:
                logger.info(f"Unhandled event type: {event['type']}")
                return {"message": f"Unhandled event type: {event['type']}"}
                
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            raise ValueError("Invalid signature")
        
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            raise
    
    @staticmethod
    def _handle_checkout_completed(db: Session, event: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful checkout session completion"""
        
        session = event['data']['object']
        session_id = session['id']
        payment_intent_id = session.get('payment_intent')
        
        logger.info(f"Processing checkout completion for session: {session_id}")
        
        try:
            # Complete the purchase
            purchase = PurchaseService.complete_purchase(
                db=db,
                session_id=session_id,
                payment_intent_id=payment_intent_id
            )
            
            logger.info(f"Purchase {purchase.id} completed successfully")
            
            return {
                "message": "Purchase completed successfully",
                "purchase_id": purchase.id,
                "payment_status": purchase.payment_status.value
            }
            
        except Exception as e:
            logger.error(f"Error completing purchase for session {session_id}: {str(e)}")
            raise
    
    @staticmethod
    def _handle_payment_succeeded(db: Session, event: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful payment intent"""
        
        payment_intent = event['data']['object']
        payment_intent_id = payment_intent['id']
        
        logger.info(f"Payment succeeded for payment intent: {payment_intent_id}")
        
        # This is typically handled by checkout.session.completed
        # but we can use this as a backup or for additional processing
        
        return {
            "message": "Payment succeeded",
            "payment_intent_id": payment_intent_id
        }
    
    @staticmethod
    def _handle_payment_failed(db: Session, event: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed payment intent"""
        
        payment_intent = event['data']['object']
        payment_intent_id = payment_intent['id']
        
        logger.warning(f"Payment failed for payment intent: {payment_intent_id}")
        
        # Find purchase by payment_intent_id and mark as failed
        from app.models.purchase import Purchase
        purchase = db.query(Purchase).filter(
            Purchase.stripe_payment_intent_id == payment_intent_id
        ).first()
        
        if purchase:
            purchase.payment_status = PaymentStatus.FAILED
            db.commit()
            
            logger.info(f"Marked purchase {purchase.id} as failed")
            
            return {
                "message": "Purchase marked as failed",
                "purchase_id": purchase.id,
                "payment_status": purchase.payment_status.value
            }
        
        return {
            "message": "Payment failed - no matching purchase found",
            "payment_intent_id": payment_intent_id
        }
    
    @staticmethod
    def _handle_dispute_created(db: Session, event: Dict[str, Any]) -> Dict[str, Any]:
        """Handle chargeback/dispute creation"""
        
        dispute = event['data']['object']
        charge_id = dispute['charge']
        
        logger.warning(f"Dispute created for charge: {charge_id}")
        
        # You might want to notify the creator or take other actions
        # For now, just log it
        
        return {
            "message": "Dispute logged",
            "charge_id": charge_id
        }
