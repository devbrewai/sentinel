import os
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, RedisDsn, Field

class Settings(BaseSettings):
    API_V1_STR: str = Field("/api/v1", description="API Version string")
    PROJECT_NAME: str = Field("Devbrew Fraud Detection API", description="Project Name")
    
    # Load required values from .env file, API will fail to start if these are missing
    # Database connection strings
    REDIS_URL: RedisDsn = Field(..., description="Redis connection string")
    DATABASE_URL: PostgresDsn = Field(..., description="PostgreSQL connection string")
    # Model paths
    MODEL_PATH: str = Field(..., description="Path to the fraud model file")
    SCREENER_PATH: str = Field(..., description="Path to the sanctions screener pickle")

    # Feature registry path
    FEATURE_REGISTRY_PATH: str = Field(..., description="Path to the feature registry JSON")
    
    model_config = {
        # Load values from .env file
        "env_file": "apps/api/.env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()