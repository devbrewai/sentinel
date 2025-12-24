from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .services.fraud_model import fraud_model_service
from .services.sanctions import sanctions_service
from .services.features import feature_service
from .routers.v1 import router
from .services.audit import audit_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup and connect to DBs
    print("Starting up: Loading models...")
    fraud_model_service.load_model()
    sanctions_service.load_screener()
    await feature_service.connect()
    await audit_service.init_db() # Initialize Audit DB Table
    yield
    # Shutdown and close connections
    print("Shutting down: Closing connections...")
    await feature_service.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the router with the correct prefix (/api/v1)
app.include_router(router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "0.1.0",
        "model_loaded": fraud_model_service.model is not None,
        "screener_loaded": sanctions_service.screener is not None
    }
