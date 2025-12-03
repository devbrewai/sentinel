# Phase 4 Findings: API Service & Infrastructure

**Status:** In Progress
**Last Updated:** 2025-12-03

## 1. Overview

This document details the technical implementation decisions for the FastAPI service that serves the fraud detection model and sanctions screening module. The primary goal was to create a production-ready inference engine with sub-200ms latency, robust audit logging, and strict schema validation.

## 2. Key Technical Decisions

### 2.1 Production-Grade Dynamic Schema Generation

**The Challenge:**
The fraud detection model (LightGBM) trained on the IEEE-CIS dataset expects an input vector of **432 specific features** (e.g., `TransactionAmt`, `card1`, `C1`...`C14`, `V1`...`V339`).

- Manually defining a Pydantic model with 400+ fields is error-prone and hard to maintain.
- Accepting "any JSON" (`Dict[str, Any]`) is not production-grade because it bypasses validation (types, missing fields).

**The Solution:**
We implemented a **Dynamic Schema Factory** (`apps/api/src/schemas/feature_factory.py`) that:

1.  Reads the `feature_registry.json` artifact generated during the Feature Engineering phase.
2.  Programmatically constructs a Pydantic `BaseModel` using `pydantic.create_model`.
3.  Enforces correct types (`float` for numeric features, `str` for categorical).
4.  Handles `None` values explicitly (mapping them to `NaN` for the model).

**Code Snippet:**

```python
# Dynamically creating the Pydantic model from metadata
FeatureModel = create_model("ModelFeatures", **fields)
```

**Impact:**

- **Maintainability:** If the model is retrained with different features, we only need to update `feature_registry.json`, and the API schema updates automatically.
- **Reliability:** The API strictly validates that the client is sending the exact data structure the model was trained on.

### 2.2 Parallel Execution for Low Latency

**The Challenge:**
We have two distinct, potentially slow operations per request:

1.  **Sanctions Screening:** A CPU-bound fuzzy matching operation against ~40k names.
2.  **Feature Fetching:** An I/O-bound Redis operation to fetch velocity counters.

**The Solution:**
We utilized Python's `asyncio` to run these tasks in parallel within the request handler.

**Architecture:**

```python
# Running CPU-bound and I/O-bound tasks concurrently
sanctions_task = asyncio.to_thread(sanctions_service.screen_name, ...)
features_task = feature_service.get_velocity_features(...)

results = await asyncio.gather(sanctions_task, features_task)
```

**Performance:**

- Reduces the theoretical floor of the request latency from `sum(tasks)` to `max(tasks)`.
- Critical for meeting the <200ms p95 SLA.

### 2.3 Secure Configuration Management

**The Challenge:**
Ensuring secrets (DB passwords, API keys) are never hardcoded, even in a research demo, while maintaining ease of use.

**The Solution:**
We used `pydantic-settings` with strict field definitions (`Field(...)`) to enforce that secrets must be provided via environment variables or a `.env` file.

- **No Defaults:** The app crashes at startup if `REDIS_URL` or `DATABASE_URL` are missing, preventing accidental insecure deployments.
- **Developer Experience:** A `.env` file is supported for local development.

### 2.4 Non-Blocking Audit Logging

**The Challenge:**
Every transaction must be logged to PostgreSQL for compliance, but DB writes are relatively slow (10-50ms) and should not delay the API response.

**The Solution:**
We implemented a **Background Task** pattern using `FastAPI.BackgroundTasks` combined with `SQLAlchemy` async engine.

- The API returns the response to the client immediately after inference.
- The audit log is written to the DB asynchronously after the response is sent.

## 3. Performance & Metrics (Preliminary)

| Metric | Target | Status |
|Refinement needed|
| **End-to-End Latency** | < 200ms p95 | _Pending final load test_ |
| **Sanctions Latency** | < 50ms p95 | ✅ Achieved (~47ms) |
| **Model Inference** | < 50ms | ✅ Achieved (LightGBM is fast) |

## 4. Next Steps

- [ ] **Full Load Testing:** Run `locust` or `wrk` to benchmark p95 latency under load (100+ RPS).
- [ ] **Containerization:** Finalize the Dockerfile for the API service.
- [ ] **Demo UI Integration:** Connect the Next.js frontend to this API.
