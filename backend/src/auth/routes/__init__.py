

"""Package exports for auth routes.

Expose the `auth_router` from the module-level `auth_routes.py` so callers
can import it as `from src.auth.routes import auth_router`.
"""

from .auth_routes import auth_router, get_current_user  # noqa: F401
from ..models.user import User

__all__ = ["auth_router", "get_current_user", "User"]

