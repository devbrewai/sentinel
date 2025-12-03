import os
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, RedisDsn

class Settings(BaseSettings):
    # App
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Devbrew Fraud API"
    # Database
    REDIS_URL: RedisDsn = os.getenv("REDIS_URL")
    POSTGRES_URL: PostgresDsn = os.getenv("POSTGRES_URL")
    # Models
    MODEL_PATH: str = os.getenv("MODEL_PATH")
    SCREENER_PATH: str = os.getenv("SCREENER_PATH")

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",
    }

settings = Settings()