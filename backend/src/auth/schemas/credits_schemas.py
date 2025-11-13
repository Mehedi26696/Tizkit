"""
Pydantic schemas for credits and subscription API.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from ..models.credits import ServiceType, PlanType, TransactionType


class CreditsResponse(BaseModel):
    """Response schema for user credits"""
    total_credits: int
    available_credits: int  
    used_credits: int
    daily_credits: int
    purchased_credits: int
    is_unlimited: bool
    plan_type: str
    last_daily_reset: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConsumeCreditsRequest(BaseModel):
    """Request schema for consuming credits"""
    service_type: ServiceType
    extra_data: Optional[Dict[str, Any]] = None


class AddCreditsRequest(BaseModel):
    """Request schema for adding credits"""
    amount: int = Field(..., gt=0, description="Number of credits to add")
    transaction_type: Optional[TransactionType] = TransactionType.PURCHASE
    description: Optional[str] = None


class CreditTransactionResponse(BaseModel):
    """Response schema for credit transactions"""
    id: UUID
    transaction_type: str
    service_type: Optional[str] = None
    credits_amount: int
    balance_before: int
    balance_after: int
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ServicePricingResponse(BaseModel):
    """Response schema for service pricing"""
    service_type: str
    credit_cost: int
    description: Optional[str] = None


class CreateSubscriptionRequest(BaseModel):
    """Request schema for creating subscription"""
    plan_type: PlanType
    billing_period: str = Field(..., pattern="^(monthly|yearly)$")
    payment_method_id: Optional[str] = None  # For payment processor integration


class SubscriptionResponse(BaseModel):
    """Response schema for subscription info"""
    id: UUID
    plan_type: str
    is_active: bool
    started_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ServiceUsageStats(BaseModel):
    """Usage statistics for services"""
    service_type: str
    usage_count: int
    credits_consumed: int
    last_used: Optional[datetime] = None


class UsageDashboard(BaseModel):
    """Dashboard data for user usage"""
    current_credits: CreditsResponse
    recent_transactions: list[CreditTransactionResponse]
    service_usage: list[ServiceUsageStats]
    subscription: Optional[SubscriptionResponse] = None