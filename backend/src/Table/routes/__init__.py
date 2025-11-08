
from fastapi import APIRouter
from .table_routes import table_router

__all__ = ["table_router"]

Table_Router = APIRouter()
Table_Router.include_router(table_router)