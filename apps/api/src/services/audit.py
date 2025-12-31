import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Float, Boolean, Integer, JSON, DateTime, text
from datetime import datetime, timedelta, timezone
from ..config import settings

Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
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

    async def get_analytics(self) -> dict:
        """Get comprehensive analytics from audit logs."""
        async with self.async_session() as session:
            now = datetime.now(timezone.utc)
            seven_days_ago = now - timedelta(days=7)
            twenty_four_hours_ago = now - timedelta(hours=24)

            # Summary metrics
            summary_result = await session.execute(
                text("""
                    SELECT
                        COUNT(*) as total_screened,
                        COALESCE(AVG(latency_ms), 0) as avg_latency,
                        COUNT(*) FILTER (WHERE risk_score > 0.8) as fraud_detected,
                        COUNT(*) FILTER (WHERE sanctions_match = true) as sanctions_hits
                    FROM audit_logs
                """)
            )
            summary = summary_result.fetchone()

            # Daily volume (last 7 days)
            daily_result = await session.execute(
                text("""
                    SELECT
                        TO_CHAR(timestamp, 'Dy') as day,
                        DATE(timestamp) as date,
                        COUNT(*) as transactions,
                        COUNT(*) FILTER (WHERE risk_score > 0.5 OR sanctions_match = true) as flagged
                    FROM audit_logs
                    WHERE timestamp >= :seven_days_ago
                    GROUP BY DATE(timestamp), TO_CHAR(timestamp, 'Dy')
                    ORDER BY DATE(timestamp)
                """),
                {"seven_days_ago": seven_days_ago}
            )
            daily_volume = [
                {"day": row.day, "transactions": row.transactions, "flagged": row.flagged}
                for row in daily_result.fetchall()
            ]

            # Risk distribution
            risk_result = await session.execute(
                text("""
                    SELECT
                        CASE
                            WHEN sanctions_match = true THEN 'critical'
                            WHEN risk_score > 0.8 THEN 'high'
                            WHEN risk_score > 0.5 THEN 'medium'
                            ELSE 'low'
                        END as risk_level,
                        COUNT(*) as count
                    FROM audit_logs
                    GROUP BY
                        CASE
                            WHEN sanctions_match = true THEN 'critical'
                            WHEN risk_score > 0.8 THEN 'high'
                            WHEN risk_score > 0.5 THEN 'medium'
                            ELSE 'low'
                        END
                """)
            )
            risk_distribution_raw = {row.risk_level: row.count for row in risk_result.fetchall()}
            risk_distribution = [
                {"name": "Low", "value": risk_distribution_raw.get("low", 0), "color": "#10b981"},
                {"name": "Medium", "value": risk_distribution_raw.get("medium", 0), "color": "#f59e0b"},
                {"name": "High", "value": risk_distribution_raw.get("high", 0), "color": "#f97316"},
                {"name": "Critical", "value": risk_distribution_raw.get("critical", 0), "color": "#ef4444"},
            ]

            # Latency trend (last 24 hours, grouped by 4-hour intervals)
            latency_result = await session.execute(
                text("""
                    SELECT
                        TO_CHAR(DATE_TRUNC('hour', timestamp) -
                            (EXTRACT(HOUR FROM timestamp)::int % 4) * INTERVAL '1 hour',
                            'HH24:MI') as hour,
                        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as p50,
                        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95
                    FROM audit_logs
                    WHERE timestamp >= :twenty_four_hours_ago
                    GROUP BY DATE_TRUNC('hour', timestamp) -
                        (EXTRACT(HOUR FROM timestamp)::int % 4) * INTERVAL '1 hour'
                    ORDER BY DATE_TRUNC('hour', timestamp) -
                        (EXTRACT(HOUR FROM timestamp)::int % 4) * INTERVAL '1 hour'
                """),
                {"twenty_four_hours_ago": twenty_four_hours_ago}
            )
            latency_trend = [
                {"hour": row.hour, "p50": round(row.p50 or 0, 1), "p95": round(row.p95 or 0, 1)}
                for row in latency_result.fetchall()
            ]

            # If no latency data, provide default structure
            if not latency_trend:
                latency_trend = [
                    {"hour": "00:00", "p50": 0, "p95": 0},
                    {"hour": "04:00", "p50": 0, "p95": 0},
                    {"hour": "08:00", "p50": 0, "p95": 0},
                    {"hour": "12:00", "p50": 0, "p95": 0},
                    {"hour": "16:00", "p50": 0, "p95": 0},
                    {"hour": "20:00", "p50": 0, "p95": 0},
                ]

            total_screened = summary.total_screened or 0

            return {
                "summary": {
                    "total_screened": total_screened,
                    "avg_latency_ms": round(summary.avg_latency or 0, 1),
                    "fraud_detected": summary.fraud_detected or 0,
                    "sanctions_hits": summary.sanctions_hits or 0,
                    "fraud_rate": round((summary.fraud_detected or 0) / total_screened * 100, 2) if total_screened > 0 else 0,
                    "sanctions_rate": round((summary.sanctions_hits or 0) / total_screened * 100, 2) if total_screened > 0 else 0,
                },
                "daily_volume": daily_volume,
                "risk_distribution": risk_distribution,
                "latency_trend": latency_trend,
                # Static model metrics (from training, not runtime)
                "model_metrics": {
                    "roc_auc": 0.8861,
                    "precision": 0.82,
                    "recall": 0.79,
                    "f1_score": 0.805,
                },
                "sanctions_metrics": {
                    "precision_at_1": 0.975,
                    "avg_latency_ms": 12.3,
                },
            }

audit_service = AuditService()

