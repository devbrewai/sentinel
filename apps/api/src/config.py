import os
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, RedisDsn, Field

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DevBrew Fraud API"
    
    # Load required values from .env file, API will fail to start if these are missing
    # Database connection strings
    REDIS_URL: RedisDsn = Field(..., description="Redis connection string")
    DATABASE_URL: PostgresDsn = Field(..., description="PostgreSQL connection string")
    # Model paths
    MODEL_PATH: str = Field(..., description="Path to the fraud model file")
    SCREENER_PATH: str = Field(..., description="Path to the sanctions screener pickle")
    
    model_config = {
        # Load values from .env file
        "env_file": "apps/api/.env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()