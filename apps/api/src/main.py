from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.api.src.config import settings
from apps.api.src.services.fraud_model import fraud_model_service
from apps.api.src.services.sanctions import sanctions_service
from apps.api.src.services.features import feature_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup and connect to DBs
    print("Starting up: Loading models...")
    fraud_model_service.load_model()
    sanctions_service.load_screener()
    await feature_service.connect()
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

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "0.1.0",
        "model_loaded": fraud_model_service.model is not None,
        "screener_loaded": sanctions_service.screener is not None
    }
