"""
Credits and subscription models for TizKit application.
"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from sqlmodel import SQLModel, Field, Column, String, Boolean, ForeignKey, Relationship
import sqlalchemy.dialects.postgresql as pg
import uuid
from decimal import Decimal
from enum import Enum


class PlanType(str, Enum):
    """Subscription plan types"""
    FREE = "free"
    PRO = "pro" 
    TEAM = "team"


class TransactionType(str, Enum):
    """Credit transaction types"""
    PURCHASE = "purchase"
    USAGE = "usage"
    REFUND = "refund"
    BONUS = "bonus"
    DAILY_RESET = "daily_reset"


class ServiceType(str, Enum):
    """Service types that consume credits"""
    OCR_TEXT_EXTRACTION = "ocr_text_extraction"
    LATEX_COMPILATION = "latex_compilation"
    AI_TEXT_IMPROVEMENT = "ai_text_improvement"
    AI_LATEX_FIXING = "ai_latex_fixing"
    DIAGRAM_GENERATION = "diagram_generation"
    TABLE_GENERATION = "table_generation"
    FLOWCHART_GENERATION = "flowchart_generation"


class UserSubscription(SQLModel, table=True):
    """User subscription and plan details"""
    __tablename__ = "user_subscriptions"
    
    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4
        )
    )
    user_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    plan_type: PlanType = Field(
        sa_column=Column(
            pg.ENUM(PlanType),
            nullable=False,
            default=PlanType.FREE
        )
    )
    is_active: bool = Field(default=True)
    started_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )
    expires_at: Optional[datetime] = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=True
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )


class UserCredits(SQLModel, table=True):
    """User current credits balance"""
    __tablename__ = "user_credits"
    
    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4
        )
    )
    user_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True
        )
    )
    total_credits: int = Field(default=0)
    used_credits: int = Field(default=0) 
    available_credits: int = Field(default=0)
    daily_credits: int = Field(default=0)  # Free daily credits
    purchased_credits: int = Field(default=0)  # Purchased credits
    last_daily_reset: Optional[datetime] = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=True
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )


class CreditTransaction(SQLModel, table=True):
    """Credit transaction history"""
    __tablename__ = "credit_transactions"
    
    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4
        )
    )
    user_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    transaction_type: TransactionType = Field(
        sa_column=Column(
            pg.ENUM(TransactionType),
            nullable=False
        )
    )
    service_type: Optional[ServiceType] = Field(
        sa_column=Column(
            pg.ENUM(ServiceType),
            nullable=True
        )
    )
    credits_amount: int = Field()  # Positive for additions, negative for usage
    balance_before: int = Field()
    balance_after: int = Field()
    description: Optional[str] = Field(
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    extra_data: Optional[dict] = Field(
        sa_column=Column(
            pg.JSON,
            nullable=True
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )


class ServicePricing(SQLModel, table=True):
    """Pricing configuration for different services"""
    __tablename__ = "service_pricing"
    
    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4
        )
    )
    service_type: ServiceType = Field(
        sa_column=Column(
            pg.ENUM(ServiceType),
            nullable=False,
            unique=True
        )
    )
    credit_cost: int = Field()  # Credits required for this service
    plan_type: PlanType = Field(
        sa_column=Column(
            pg.ENUM(PlanType),
            nullable=False,
            default=PlanType.FREE
        )
    )
    is_active: bool = Field(default=True)
    description: Optional[str] = Field(
        sa_column=Column(
            pg.TEXT,
            nullable=True
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )