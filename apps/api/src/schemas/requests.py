from pydantic import BaseModel, Field
from typing import Optional, List, Any
from .feature_factory import ModelFeatures


class TransactionRequest(ModelFeatures):
    """
    Production-grade schema that includes:
    1. Core business fields (required for processing)
    2. All 400+ model features (dynamically loaded from registry)
    """
    # Core business fields
    transaction_id: str = Field(..., description="Unique ID for the transaction")
    transaction_amt: float = Field(..., gt=0, alias="TransactionAmt", description="Transaction amount (mapped to TransactionAmt)")
    card_id: str = Field(..., description="Unique identifier for the card (used for velocity)")

    # PII for Sanctions Screening (Not features for the fraud model, but required for compliance)
    sender_name: str = Field(..., description="Full name of the sender")
    sender_country: Optional[str] = Field(None, description="ISO country code of sender")

    # Note: The 400+ fields from ModelFeatures are automatically included here.
    # Clients can send "V1": 1.23, "card4": "visa", etc.


class FeatureContribution(BaseModel):
    """A single feature's contribution to the risk score."""
    name: str = Field(..., description="Feature name")
    value: Optional[Any] = Field(None, description="Feature value used in prediction")
    contribution: float = Field(..., description="SHAP contribution (positive = increases risk)")


class VelocityFeatures(BaseModel):
    """Velocity-based features computed from Redis."""
    transactions_1h: int = Field(..., description="Number of transactions in last 1 hour")
    transactions_24h: int = Field(..., description="Number of transactions in last 24 hours")


class ScoreResponse(BaseModel):
    transaction_id: str
    risk_score: float
    risk_level: str  # "low", "medium", "high", "critical"
    decision: str    # "approve", "review", "reject"

    # Sanctions info
    sanctions_match: bool
    sanctions_details: Optional[dict] = None

    # Explainability - SHAP feature importance
    top_features: Optional[List[FeatureContribution]] = Field(
        None, description="Top contributing features with SHAP values"
    )

    # Velocity features
    velocity: Optional[VelocityFeatures] = Field(
        None, description="Velocity-based transaction counts"
    )

    # Performance
    latency_ms: float


class BatchTransactionItem(BaseModel):
    """Simplified transaction item for batch processing."""
    transaction_id: str = Field(..., description="Unique ID for the transaction")
    sender_name: str = Field(..., description="Full name of the sender")
    transaction_amt: float = Field(..., gt=0, alias="TransactionAmt", description="Transaction amount")
    card_id: str = Field(..., description="Card identifier for velocity tracking")
    sender_country: Optional[str] = Field(None, description="ISO country code of sender")
    product_cd: Optional[str] = Field(None, alias="ProductCD", description="Product code")

    model_config = {"populate_by_name": True}


class BatchRequest(BaseModel):
    """Request schema for batch transaction screening."""
    transactions: List[BatchTransactionItem] = Field(
        ..., min_length=1, max_length=100, description="List of transactions to screen (max 100)"
    )


class BatchResultItem(BaseModel):
    """Result for a single transaction in batch processing."""
    transaction_id: str
    sender_name: str
    amount: float
    risk_score: float
    risk_level: str
    decision: str
    sanctions_match: bool
    latency_ms: float


class BatchResponse(BaseModel):
    """Response schema for batch transaction screening."""
    results: List[BatchResultItem]
    total_processed: int
    total_latency_ms: float


# Analytics schemas
class AnalyticsSummary(BaseModel):
    """Summary metrics for analytics."""
    total_screened: int
    avg_latency_ms: float
    fraud_detected: int
    sanctions_hits: int
    fraud_rate: float
    sanctions_rate: float


class DailyVolumeItem(BaseModel):
    """Daily transaction volume data point."""
    day: str
    transactions: int
    flagged: int


class RiskDistributionItem(BaseModel):
    """Risk distribution data point."""
    name: str
    value: int
    color: str


class LatencyTrendItem(BaseModel):
    """Latency trend data point."""
    hour: str
    p50: float
    p95: float


class ModelMetrics(BaseModel):
    """Fraud model performance metrics."""
    roc_auc: float
    precision: float
    recall: float
    f1_score: float


class SanctionsMetrics(BaseModel):
    """Sanctions screening performance metrics."""
    precision_at_1: float
    avg_latency_ms: float


class AnalyticsResponse(BaseModel):
    """Complete analytics response."""
    summary: AnalyticsSummary
    daily_volume: List[DailyVolumeItem]
    risk_distribution: List[RiskDistributionItem]
    latency_trend: List[LatencyTrendItem]
    model_metrics: ModelMetrics
    sanctions_metrics: SanctionsMetrics
