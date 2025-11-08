 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from contextlib import asynccontextmanager
import logging

from src.utils.database import test_database_connection
from starlette.concurrency import run_in_threadpool



from src.auth.routes import auth_router as _auth_router


version = "1.0.0"
 

logger = logging.getLogger("tizkit")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: run startup and shutdown logic here.

    Startup: test DB connection and log results.
    Shutdown: perform any cleanup if needed.
    """
    # STARTUP
    try:
        logger.info("Lifespan startup: testing database connection...")
        # test_database_connection is synchronous (using sync DB engine). Run it in threadpool.
        ok = await run_in_threadpool(test_database_connection)
        if ok:
            logger.info("Database connection successful at startup")
        else:
            logger.warning("Database connection test returned False at startup")
    except Exception as e:
        logger.exception(f"Database connection test failed during startup: {e}")

    yield

    # SHUTDOWN
    try:
        logger.info("Lifespan shutdown: cleaning up resources...")
    except Exception:
        logger.exception("Exception during shutdown cleanup")


app = FastAPI(
    title="TizKit",
    description="A helper software for latex document generation and management.",
    version=version,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)






@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify that the API is running."""
    return {"status": "ok", "version": version}


 
try:
    app.include_router(_auth_router, prefix="/auth", tags=["auth"])
except Exception:
    logger.exception("Failed to include auth router")


# Diagram routes
try:
    from src.Diagram.routes import diagram_router as _diagram_router
    app.include_router(_diagram_router, prefix="/diagram", tags=["diagram"])
except Exception:
    logger.exception("Failed to import/include diagram router")


# Table routes
try:
    from src.Table.routes import table_router as _table_router
    app.include_router(_table_router, prefix="/table", tags=["table"])
except Exception:
    logger.exception("Failed to import/include table router")


# ImageToLatex routes (package bundles multiple routers)
try:
    from src.ImageToLatex.routes import ImageToLatex_Router as _imagetolatex_router
    app.include_router(_imagetolatex_router, prefix="/image-to-latex", tags=["image-to-latex"])
except Exception:
    logger.exception("Failed to import/include ImageToLatex router")


# Attempt to generate the OpenAPI schema now to catch and log schema
# generation errors early (helps diagnose why /docs may hang).
try:
    _ = app.openapi()
except Exception:
    logger.exception("Failed to generate OpenAPI schema")
 


 

