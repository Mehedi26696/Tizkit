"""
Middleware and decorators for credit-based service protection.
"""

from functools import wraps
from typing import Callable, Any
from fastapi import HTTPException, status, Depends
from sqlmodel import Session

from ..services.credits_service import CreditsService
from ..models.credits import ServiceType

from ...utils.database import get_session
from ..routes import get_current_user, User


def require_credits(service_type: ServiceType, auto_consume: bool = True):
    """
    Decorator to protect API endpoints with credit requirements.
    
    Args:
        service_type: Type of service that requires credits
        auto_consume: Whether to automatically consume credits on successful execution
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract dependencies from kwargs
            current_user: User = kwargs.get('current_user')
            session: Session = kwargs.get('session')
            
            if not current_user or not session:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing required dependencies for credit check"
                )
            
            credits_service = CreditsService(session)
            
            # AI services are always free - skip credit checking
            if service_type in credits_service.FREE_SERVICES:
                # Execute the original function directly
                return await func(*args, **kwargs)
            
            # Check if user has enough credits for credit-based services
            availability = await credits_service.check_credits_availability(
                current_user.id, 
                service_type
            )
            
            if not availability.get("has_credits") and not availability.get("is_unlimited"):
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "error": "Insufficient credits",
                        "service": service_type.value,
                        "credits_needed": availability.get("credits_needed", 0),
                        "available_credits": availability.get("available_credits", 0),
                        "plan_type": availability.get("plan_type", "free")
                    }
                )
            
            # Execute the original function
            try:
                result = await func(*args, **kwargs)
                
                # Auto-consume credits if successful and enabled
                if auto_consume:
                    consumption_result = await credits_service.consume_credits(
                        current_user.id,
                        service_type,
                        {"endpoint": func.__name__, "auto_consumed": True}
                    )
                    
                    if not consumption_result.get("success"):
                        # Log the error but don't fail the request since service was already provided
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.warning(
                            f"Failed to consume credits after successful service execution: "
                            f"{consumption_result.get('error')}"
                        )
                
                return result
                
            except Exception as e:
                # Don't consume credits if the service failed
                raise e
        
        return wrapper
    return decorator


class CreditChecker:
    """Dependency class for credit checking without auto-consumption"""
    
    def __init__(self, service_type: ServiceType):
        self.service_type = service_type
    
    async def __call__(
        self,
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
    ) -> dict:
        """Check credits availability for a service"""
        credits_service = CreditsService(session)
        
        # AI services are always free - skip checking
        if self.service_type in credits_service.FREE_SERVICES:
            return {
                "credits_service": credits_service,
                "availability": {
                    "has_credits": True,
                    "is_unlimited": True,
                    "service_free": True
                },
                "user_id": current_user.id
            }
        
        availability = await credits_service.check_credits_availability(
            current_user.id, 
            self.service_type
        )
        
        if not availability.get("has_credits") and not availability.get("is_unlimited"):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "error": "Insufficient credits",
                    "service": self.service_type.value,
                    "credits_needed": availability.get("credits_needed", 0),
                    "available_credits": availability.get("available_credits", 0),
                    "plan_type": availability.get("plan_type", "free")
                }
            )
        
        return {
            "credits_service": credits_service,
            "availability": availability,
            "user_id": current_user.id
        }


def create_credit_checker(service_type: ServiceType):
    """Factory function to create credit checker dependencies"""
    return CreditChecker(service_type)