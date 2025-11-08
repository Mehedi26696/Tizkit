

"""Package exports for auth routes.

Expose the `auth_router` from the module-level `auth_routes.py` so callers
can import it as `from src.auth.routes import auth_router`.
"""

from .auth_routes import auth_router  # noqa: F401

__all__ = ["auth_router"]

