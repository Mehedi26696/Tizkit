"""
Credits management service for TizKit application.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
from sqlmodel import Session, select
from ..models.credits import (
    UserCredits, 
    CreditTransaction, 
    ServicePricing, 
    UserSubscription,
    TransactionType, 
    ServiceType, 
    PlanType
)
from ..models.user import User
import logging

logger = logging.getLogger(__name__)


class CreditsService:
    """Service to manage user credits and transactions"""
    
    def __init__(self, session: Session):
        self.session = session
    
    # Default credit configurations
    DAILY_FREE_CREDITS = 50  # Free users get 50 credits daily
    PRO_UNLIMITED = -1  # Pro users have unlimited credits
    
    # Services that are completely free (no credits required)
    FREE_SERVICES = {
        ServiceType.AI_TEXT_IMPROVEMENT,
        ServiceType.AI_LATEX_FIXING,
    }
    
    # Default service costs (in credits) - only for services that require credits
    DEFAULT_SERVICE_COSTS = {
        ServiceType.OCR_TEXT_EXTRACTION: 10,
        ServiceType.LATEX_COMPILATION: 3,
        ServiceType.DIAGRAM_GENERATION: 5,
        ServiceType.TABLE_GENERATION: 3,
    }
    
    async def initialize_user_credits(self, user_id: UUID) -> UserCredits:
        """Initialize credits for a new user"""
        try:
            # Check if user already has credits
            existing_credits = self.session.exec(
                select(UserCredits).where(UserCredits.user_id == user_id)
            ).first()
            
            if existing_credits:
                return existing_credits
            
            # Create new credits record
            user_credits = UserCredits(
                user_id=user_id,
                daily_credits=self.DAILY_FREE_CREDITS,
                available_credits=self.DAILY_FREE_CREDITS,
                total_credits=self.DAILY_FREE_CREDITS,
                last_daily_reset=datetime.now()
            )
            
            self.session.add(user_credits)
            
            # Create transaction record
            await self._create_transaction(
                user_id=user_id,
                transaction_type=TransactionType.BONUS,
                credits_amount=self.DAILY_FREE_CREDITS,
                balance_before=0,
                balance_after=self.DAILY_FREE_CREDITS,
                description="Welcome bonus credits"
            )
            
            self.session.commit()
            return user_credits
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Failed to initialize credits for user {user_id}: {e}")
            raise
    
    async def get_user_credits(self, user_id: UUID) -> Optional[UserCredits]:
        """Get current credits for a user"""
        return self.session.exec(
            select(UserCredits).where(UserCredits.user_id == user_id)
        ).first()
    
    async def check_and_reset_daily_credits(self, user_id: UUID) -> UserCredits:
        """Check if daily credits need to be reset and reset them"""
        credits = await self.get_user_credits(user_id)
        
        if not credits:
            credits = await self.initialize_user_credits(user_id)
        
        # Check if 24 hours have passed since last reset
        if credits.last_daily_reset:
            time_since_reset = datetime.now() - credits.last_daily_reset
            if time_since_reset >= timedelta(hours=24):
                await self._reset_daily_credits(credits)
        else:
            await self._reset_daily_credits(credits)
        
        return credits
    
    async def _reset_daily_credits(self, credits: UserCredits):
        """Reset daily credits for free users"""
        try:
            # Get user's subscription
            subscription = self.session.exec(
                select(UserSubscription)
                .where(UserSubscription.user_id == credits.user_id)
                .where(UserSubscription.is_active == True)
            ).first()
            
            # Only reset for free users
            if not subscription or subscription.plan_type == PlanType.FREE:
                old_balance = credits.available_credits
                credits.daily_credits = self.DAILY_FREE_CREDITS
                credits.available_credits = credits.purchased_credits + self.DAILY_FREE_CREDITS
                credits.total_credits = credits.available_credits
                credits.last_daily_reset = datetime.now()
                credits.updated_at = datetime.now()
                
                # Create transaction
                await self._create_transaction(
                    user_id=credits.user_id,
                    transaction_type=TransactionType.DAILY_RESET,
                    credits_amount=self.DAILY_FREE_CREDITS,
                    balance_before=old_balance,
                    balance_after=credits.available_credits,
                    description="Daily free credits reset"
                )
                
                self.session.add(credits)
                self.session.commit()
                
        except Exception as e:
            self.session.rollback()
            logger.error(f"Failed to reset daily credits: {e}")
            raise
    
    async def check_credits_availability(self, user_id: UUID, service_type: ServiceType) -> Dict[str, Any]:
        """Check if user has enough credits for a service"""
        try:
            # AI services are completely free for everyone
            if service_type in self.FREE_SERVICES:
                return {
                    "has_credits": True,
                    "is_unlimited": True,
                    "credits_needed": 0,
                    "available_credits": -1,
                    "plan_type": "unlimited",
                    "service_free": True
                }
            
            # Get user subscription
            subscription = self.session.exec(
                select(UserSubscription)
                .where(UserSubscription.user_id == user_id)
                .where(UserSubscription.is_active == True)
            ).first()
            
            # Pro/Team users have unlimited access to all services
            if subscription and subscription.plan_type in [PlanType.PRO, PlanType.TEAM]:
                return {
                    "has_credits": True,
                    "is_unlimited": True,
                    "credits_needed": 0,
                    "available_credits": -1,
                    "plan_type": subscription.plan_type.value
                }
            
            # Check credits for free users on credit-based services
            credits = await self.check_and_reset_daily_credits(user_id)
            cost = await self.get_service_cost(service_type)
            
            return {
                "has_credits": credits.available_credits >= cost,
                "is_unlimited": False,
                "credits_needed": cost,
                "available_credits": credits.available_credits,
                "plan_type": PlanType.FREE.value
            }
            
        except Exception as e:
            logger.error(f"Failed to check credits availability: {e}")
            return {
                "has_credits": False,
                "is_unlimited": False,
                "credits_needed": 0,
                "available_credits": 0,
                "error": str(e)
            }
    
    async def consume_credits(self, user_id: UUID, service_type: ServiceType, extra_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Consume credits for a service usage"""
        try:
            # AI services are completely free - no tracking needed
            if service_type in self.FREE_SERVICES:
                return {
                    "success": True,
                    "credits_consumed": 0,
                    "remaining_credits": -1,
                    "is_unlimited": True,
                    "service_free": True
                }
            
            # Check availability for credit-based services
            availability = await self.check_credits_availability(user_id, service_type)
            
            if availability.get("is_unlimited") and not availability.get("service_free"):
                # Pro users don't consume credits, just log usage
                await self._create_transaction(
                    user_id=user_id,
                    transaction_type=TransactionType.USAGE,
                    service_type=service_type,
                    credits_amount=0,
                    balance_before=-1,
                    balance_after=-1,
                    description=f"Unlimited usage: {service_type.value}",
                    extra_data=extra_data
                )
                return {
                    "success": True,
                    "credits_consumed": 0,
                    "remaining_credits": -1,
                    "is_unlimited": True
                }
            
            if not availability.get("has_credits"):
                return {
                    "success": False,
                    "error": "Insufficient credits",
                    "credits_needed": availability.get("credits_needed", 0),
                    "available_credits": availability.get("available_credits", 0)
                }
            
            # Consume credits for free users
            credits = await self.get_user_credits(user_id)
            cost = await self.get_service_cost(service_type)
            
            old_balance = credits.available_credits
            credits.available_credits -= cost
            credits.used_credits += cost
            credits.updated_at = datetime.now()
            
            # Create transaction
            await self._create_transaction(
                user_id=user_id,
                transaction_type=TransactionType.USAGE,
                service_type=service_type,
                credits_amount=-cost,
                balance_before=old_balance,
                balance_after=credits.available_credits,
                description=f"Used {cost} credits for {service_type.value}",
                extra_data=extra_data
            )
            
            self.session.add(credits)
            self.session.commit()
            
            return {
                "success": True,
                "credits_consumed": cost,
                "remaining_credits": credits.available_credits,
                "is_unlimited": False
            }
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Failed to consume credits: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_service_cost(self, service_type: ServiceType) -> int:
        """Get credit cost for a service"""
        # AI services are always free
        if service_type in self.FREE_SERVICES:
            return 0
            
        pricing = self.session.exec(
            select(ServicePricing)
            .where(ServicePricing.service_type == service_type)
            .where(ServicePricing.is_active == True)
        ).first()
        
        if pricing:
            return pricing.credit_cost
        
        # Return default cost if not found in database
        return self.DEFAULT_SERVICE_COSTS.get(service_type, 5)
    
    async def add_credits(self, user_id: UUID, amount: int, transaction_type: TransactionType = TransactionType.PURCHASE, description: Optional[str] = None) -> Dict[str, Any]:
        """Add credits to user account (for purchases, bonuses, etc.)"""
        try:
            credits = await self.get_user_credits(user_id)
            if not credits:
                credits = await self.initialize_user_credits(user_id)
            
            old_balance = credits.available_credits
            credits.available_credits += amount
            credits.total_credits += amount
            
            if transaction_type == TransactionType.PURCHASE:
                credits.purchased_credits += amount
            
            credits.updated_at = datetime.now()
            
            # Create transaction
            await self._create_transaction(
                user_id=user_id,
                transaction_type=transaction_type,
                credits_amount=amount,
                balance_before=old_balance,
                balance_after=credits.available_credits,
                description=description or f"Added {amount} credits"
            )
            
            self.session.add(credits)
            self.session.commit()
            
            return {
                "success": True,
                "credits_added": amount,
                "new_balance": credits.available_credits
            }
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Failed to add credits: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _create_transaction(
        self,
        user_id: UUID,
        transaction_type: TransactionType,
        credits_amount: int,
        balance_before: int,
        balance_after: int,
        service_type: Optional[ServiceType] = None,
        description: Optional[str] = None,
        extra_data: Optional[Dict] = None
    ) -> CreditTransaction:
        """Create a credit transaction record"""
        transaction = CreditTransaction(
            user_id=user_id,
            transaction_type=transaction_type,
            service_type=service_type,
            credits_amount=credits_amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=description,
            extra_data=extra_data
        )
        
        self.session.add(transaction)
        return transaction
    
    async def get_credit_history(self, user_id: UUID, limit: int = 50, offset: int = 0) -> list[CreditTransaction]:
        """Get credit transaction history for a user"""
        return list(self.session.exec(
            select(CreditTransaction)
            .where(CreditTransaction.user_id == user_id)
            .order_by(CreditTransaction.created_at.desc())
            .limit(limit)
            .offset(offset)
        ).all())
    
    async def create_subscription(self, user_id: UUID, plan_type: PlanType, expires_at: Optional[datetime] = None) -> UserSubscription:
        """Create or update user subscription"""
        try:
            # Deactivate existing subscription
            existing = self.session.exec(
                select(UserSubscription)
                .where(UserSubscription.user_id == user_id)
                .where(UserSubscription.is_active == True)
            ).first()
            
            if existing:
                existing.is_active = False
                existing.updated_at = datetime.now()
                self.session.add(existing)
            
            # Create new subscription
            subscription = UserSubscription(
                user_id=user_id,
                plan_type=plan_type,
                expires_at=expires_at,
                is_active=True
            )
            
            self.session.add(subscription)
            self.session.commit()
            
            return subscription
            
        except Exception as e:
            self.session.rollback()
            logger.error(f"Failed to create subscription: {e}")
            raise