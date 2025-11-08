
from fastapi import APIRouter
from .diagram_routes import diagram_router

__all__ = ["diagram_router"]


Diagram_Router = APIRouter()
Diagram_Router.include_router(diagram_router)