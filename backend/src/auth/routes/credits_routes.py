"""
Credits and subscription API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, timedelta

from ..services.credits_service import CreditsService
from ..models.credits import ServiceType, PlanType, TransactionType
from ..schemas.credits_schemas import (
    CreditsResponse,
    CreditTransactionResponse,
    ServicePricingResponse,
    ConsumeCreditsRequest,
    AddCreditsRequest,
    CreateSubscriptionRequest
)
from ...utils.database import get_session
from . import get_current_user, User

credits_router = APIRouter()


@credits_router.get("/credits", response_model=CreditsResponse)
async def get_user_credits(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user credits and subscription info"""
    try:
        credits_service = CreditsService(session)
        
        # Check and reset daily credits if needed
        credits = await credits_service.check_and_reset_daily_credits(current_user.id)
        
        # Get subscription info
        from sqlmodel import select
        from ..models.credits import UserSubscription
        
        subscription = session.exec(
            select(UserSubscription)
            .where(UserSubscription.user_id == current_user.id)
            .where(UserSubscription.is_active == True)
        ).first()
        
        is_unlimited = False
        plan_type = PlanType.FREE.value
        
        if subscription and subscription.plan_type in [PlanType.PRO, PlanType.TEAM]:
            is_unlimited = True
            plan_type = subscription.plan_type.value
        
        return CreditsResponse(
            total_credits=credits.total_credits,
            available_credits=credits.available_credits,
            used_credits=credits.used_credits,
            daily_credits=credits.daily_credits,
            purchased_credits=credits.purchased_credits,
            is_unlimited=is_unlimited,
            plan_type=plan_type,
            last_daily_reset=credits.last_daily_reset
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get credits: {str(e)}"
        )


@credits_router.post("/credits/check")
async def check_service_availability(
    service_type: ServiceType,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Check if user can use a specific service"""
    try:
        credits_service = CreditsService(session)
        availability = await credits_service.check_credits_availability(
            current_user.id, 
            service_type
        )
        
        return availability
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check service availability: {str(e)}"
        )


@credits_router.post("/credits/consume")
async def consume_credits(
    request: ConsumeCreditsRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Consume credits for service usage"""
    try:
        credits_service = CreditsService(session)
        result = await credits_service.consume_credits(
            current_user.id, 
            request.service_type,
            request.extra_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=result.get("error", "Insufficient credits")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to consume credits: {str(e)}"
        )


@credits_router.post("/credits/add")
async def add_credits(
    request: AddCreditsRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Add credits to user account (admin only or payment integration)"""
    try:
        credits_service = CreditsService(session)
        result = await credits_service.add_credits(
            current_user.id,
            request.amount,
            request.transaction_type or TransactionType.PURCHASE,
            request.description
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to add credits")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add credits: {str(e)}"
        )


@credits_router.get("/credits/history", response_model=List[CreditTransactionResponse])
async def get_credit_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get user's credit transaction history"""
    try:
        credits_service = CreditsService(session)
        transactions = await credits_service.get_credit_history(
            current_user.id,
            limit,
            offset
        )
        
        return [
            CreditTransactionResponse(
                id=t.id,
                transaction_type=t.transaction_type.value,
                service_type=t.service_type.value if t.service_type else None,
                credits_amount=t.credits_amount,
                balance_before=t.balance_before,
                balance_after=t.balance_after,
                description=t.description,
                created_at=t.created_at
            )
            for t in transactions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get credit history: {str(e)}"
        )


@credits_router.get("/pricing", response_model=List[ServicePricingResponse])
async def get_service_pricing(
    session: Session = Depends(get_session)
):
    """Get pricing for all services"""
    try:
        credits_service = CreditsService(session)
        pricing = []
        
        for service_type in ServiceType:
            cost = await credits_service.get_service_cost(service_type)
            
            # Add different descriptions based on whether service is free or not
            if service_type in credits_service.FREE_SERVICES:
                description = f"{service_type.value.replace('_', ' ').title()} - FREE ♾️"
            else:
                description = f"Credits required for {service_type.value.replace('_', ' ').title()}"
            
            pricing.append(ServicePricingResponse(
                service_type=service_type.value,
                credit_cost=cost,
                description=description
            ))
        
        return pricing
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pricing: {str(e)}"
        )


@credits_router.post("/subscription")
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create or update user subscription (payment integration needed)"""
    try:
        credits_service = CreditsService(session)
        
        # Calculate expiry date
        expires_at = None
        if request.plan_type != PlanType.FREE:
            if request.billing_period == "monthly":
                expires_at = datetime.now() + timedelta(days=30)
            elif request.billing_period == "yearly":
                expires_at = datetime.now() + timedelta(days=365)
        
        subscription = await credits_service.create_subscription(
            current_user.id,
            request.plan_type,
            expires_at
        )
        
        return {
            "success": True,
            "subscription_id": subscription.id,
            "plan_type": subscription.plan_type.value,
            "expires_at": subscription.expires_at
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}"
        )