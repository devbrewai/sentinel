# Fraud Detection API

FastAPI service for real-time fraud scoring and sanctions screening.

## Features

- **Fraud Scoring:** LightGBM model inference on 400+ features
- **Sanctions Screening:** Fuzzy matching against OFAC SDN/Consolidated lists (~40k names)
- **Real-time Velocity Features:** Redis-backed transaction counters
- **Audit Logging:** Async PostgreSQL logging for compliance
- **Low Latency:** <30ms p95 end-to-end

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Access to `packages/models/` artifacts (generated from notebooks)

### 1. Start Infrastructure

```bash
cd apps/api
docker-compose up -d redis db
```

### 2. Configure Environment

Copy the example environment file:

cp .env.example .envThen edit `.env` with your local settings.

### 3. Run the API

From the **project root**:

```bash
uvicorn apps.api.src.main:app --reload
```

### 4. Verify

```bash
curl http://localhost:8000/health
```

## Docker

### Build and Run

Build and run the full stack (API + Redis + Postgres):

```bash
cd apps/api
docker-compose up --build
```

### Configuration Note (Important)

The `docker-compose.yml` file is configured to **ignore your local `.env` file** for critical infrastructure connections (`DATABASE_URL`, `REDIS_URL`) to prevent conflicts between `localhost` (host machine) and internal container hostnames (`db`, `redis`).

- **Local Dev:** Uses `.env` (connecting to `localhost`).
- **Docker:** Uses hardcoded internal defaults in `docker-compose.yml`.

**Troubleshooting:**
If you see `ConnectionRefusedError` inside Docker, ensure you haven't modified `docker-compose.yml` to force usage of local environment variables that point to `localhost`.

## API Endpoints

| Method | Path            | Description         |
| ------ | --------------- | ------------------- |
| `GET`  | `/health`       | Health check        |
| `POST` | `/api/v1/score` | Score a transaction |

### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/score \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_123",
    "TransactionAmt": 150.00,
    "card_id": "card_abc",
    "sender_name": "John Doe",
    "sender_country": "US",
    "ProductCD": "W"
  }'
```

### Example Response

```json
{
  "transaction_id": "txn_123",
  "risk_score": 0.021,
  "risk_level": "low",
  "decision": "approve",
  "sanctions_match": false,
  "latency_ms": 25.3
}
```

## Project Structure

```
apps/api/
├── src/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Pydantic settings
│   ├── routers/
│   │   └── v1.py            # /score endpoint
│   ├── schemas/
│   │   ├── feature_factory.py  # Dynamic schema generation
│   │   └── requests.py      # Request/Response models
│   └── services/
│       ├── fraud_model.py   # LightGBM inference
│       ├── sanctions.py     # OFAC screening
│       ├── features.py      # Redis velocity counters
│       └── audit.py         # PostgreSQL audit logging
├── tests/
│   └── test_score.py
├── Dockerfile
└── docker-compose.yml
```

## Testing

### Run Unit Tests

```bash
python apps/api/tests/test_score.py
```

### Verified Rejection Test

To verify the full fraud/sanctions rejection logic, you can run this known positive match case:

```bash
curl -X POST http://localhost:8000/api/v1/score \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "txn_verify_reject",
    "TransactionAmt": 200.00,
    "sender_name": "Jhon Paul Castro Paez",
    "sender_country": "Colombia",
    "card_id": "card_rejected",
    "ProductCD": "W"
  }'
```

**Expected Response:**

```json
{
  "decision": "reject",
  "risk_level": "critical",
  "sanctions_match": true
}
```

## Performance

| Metric              | Target | Achieved |
| ------------------- | ------ | -------- |
| End-to-end latency  | <200ms | ~30ms    |
| Model inference     | <50ms  | <10ms    |
| Sanctions screening | <50ms  | ~25ms    |

## Environment Variables

| Variable                | Description                       | Default                       |
| ----------------------- | --------------------------------- | ----------------------------- |
| `REDIS_URL`             | Redis connection string           | `redis://localhost:6379/0`    |
| `DATABASE_URL`          | PostgreSQL connection string      | Required                      |
| `MODEL_PATH`            | Path to LightGBM model file       | Required                      |
| `SCREENER_PATH`         | Path to sanctions screener pickle | Required                      |
| `FEATURE_REGISTRY_PATH` | Path to feature registry JSON     | Required                      |
| `API_V1_STR`            | API version prefix                | `/api/v1`                     |
| `PROJECT_NAME`          | Project name for OpenAPI docs     | `Devbrew Fraud Detection API` |
