from pydantic import BaseModel, Field
from typing import Optional
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

class ScoreResponse(BaseModel):
    transaction_id: str
    risk_score: float
    risk_level: str  # "low", "medium", "high", "critical"
    decision: str    # "approve", "review", "reject"
    
    # Sanctions info
    sanctions_match: bool
    sanctions_details: Optional[dict] = None
    
    # Explanation
    latency_ms: float
