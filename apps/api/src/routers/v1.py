import time
import asyncio
from fastapi import APIRouter, BackgroundTasks
from apps.api.src.schemas.requests import TransactionRequest, ScoreResponse
from apps.api.src.services.fraud_model import fraud_model_service
from apps.api.src.services.sanctions import sanctions_service
from apps.api.src.services.features import feature_service
from apps.api.src.services.audit import audit_service
from apps.api.src.schemas.feature_factory import load_feature_registry

router = APIRouter()

# Load feature order once at startup
REGISTRY = load_feature_registry()

@router.post("/score", response_model=ScoreResponse)
async def score_transaction(request: TransactionRequest, background_tasks: BackgroundTasks):
    start_time = time.time()
    
    # 1. Run Sanctions Screening & Feature Fetching
    sanctions_task = asyncio.to_thread(
        sanctions_service.screen_name, 
        request.sender_name, 
        request.sender_country
    )
    features_task = feature_service.get_velocity_features(request.card_id)
    
    sanctions_result, velocity_features = await asyncio.gather(sanctions_task, features_task)

    # 2. Prepare Model Input
    # Convert the request object to a dict (excluding system fields)
    request_data = request.model_dump(by_alias=True)
    
    # Inject calculated velocity features into the data dict
    request_data["card1_txn_1.0h"] = velocity_features["velocity_1h"]
    request_data["card1_txn_24.0h"] = velocity_features["velocity_24h"]
    
    # 3. Run Fraud Model
    # Pass the dictionary directly; the service will convert to DataFrame
    risk_score = fraud_model_service.predict(request_data)
    
    # 4. Decision Logic
    is_sanctions_hit = len(sanctions_result.top_matches) > 0 and sanctions_result.top_matches[0].is_match
    
    risk_level = "low"
    decision = "approve"
    
    if is_sanctions_hit:
        risk_level = "critical"
        decision = "reject"
    elif risk_score > 0.8:
        risk_level = "high"
        decision = "reject"
    elif risk_score > 0.5:
        risk_level = "medium"
        decision = "review"

    # 5. Calculate Latency
    latency = (time.time() - start_time) * 1000
    
    # 6. Audit Log
    log_data = {
        "transaction_id": request.transaction_id,
        "input": request.model_dump(mode='json'), # safe serialization
        "risk_score": risk_score,
        "sanctions_match": is_sanctions_hit,
        "latency_ms": latency
    }
    background_tasks.add_task(audit_service.log_transaction, log_data)
    
    return ScoreResponse(
        transaction_id=request.transaction_id,
        risk_score=risk_score,
        risk_level=risk_level,
        decision=decision,
        sanctions_match=is_sanctions_hit,
        sanctions_details=sanctions_result.to_dict() if is_sanctions_hit else None,
        latency_ms=latency
    )