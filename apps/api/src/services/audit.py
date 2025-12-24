import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Float, Boolean, Integer, JSON, DateTime
from datetime import datetime
from ..config import settings

Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    input_payload = Column(JSON)
    risk_score = Column(Float)
    sanctions_match = Column(Boolean)
    latency_ms = Column(Float)

class AuditService:
    def __init__(self):
        db_url = str(settings.DATABASE_URL).replace("postgresql://", "postgresql+asyncpg://")
        self.engine = create_async_engine(db_url, echo=False)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def init_db(self, max_retries: int = 5, retry_delay: float = 2.0):
        """Initialize database with retry logic for Docker container startup."""
        for attempt in range(max_retries):
            try:
                async with self.engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                print("Database connection established successfully")
                return
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"Database connection attempt {attempt + 1}/{max_retries} failed: {e}")
                    print(f"Retrying in {retry_delay} seconds...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 1.5  # Exponential backoff
                else:
                    print(f"Failed to connect to database after {max_retries} attempts")
                    raise

    async def log_transaction(self, data: dict):
        async with self.async_session() as session:
            log_entry = AuditLog(
                transaction_id=data.get("transaction_id"),
                input_payload=data.get("input"),
                risk_score=data.get("risk_score"),
                sanctions_match=data.get("sanctions_match"),
                latency_ms=data.get("latency_ms")
            )
            session.add(log_entry)
            await session.commit()

audit_service = AuditService()

