# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Sentinel is an open-source research case study demonstrating AI fraud detection and sanctions screening for cross-border payments. It combines public datasets (IEEE-CIS, PaySim, OFAC) to detect CNP transaction fraud, screen against OFAC sanctions lists, and deliver explainable risk scores with sub-200ms latency.

**Important:** Models trained on IEEE-CIS data are restricted to non-commercial research use only.

## Repository structure

- `apps/api/` - FastAPI scoring service (Python 3.11+)
- `apps/web/` - Next.js 16 demo UI (React 19, TypeScript)
- `packages/models/` - Trained model artifacts (LightGBM, SHAP explainer, sanctions screener)
- `packages/compliance/` - Sanctions screening module (RapidFuzz)
- `notebooks/` - Research notebooks (01-05: EDA → Model Training → Sanctions)
- `data_catalog/` - Dataset management (processed data committed, raw data gitignored)

## Development commands

### Make targets (recommended)

```bash
make help          # Show all available commands
make docker-up     # Start Redis & Postgres containers
make docker-down   # Stop Docker containers
make run-api       # Start FastAPI server (requires docker-up first)
make run-web       # Start Next.js frontend (uses bun)
make test          # Run API tests
make lint          # Run ruff linting
```

### API (Python/FastAPI)

```bash
# Install dependencies (from project root)
uv sync
source .venv/bin/activate

# Run API with hot-reload (must run from project root for packages imports)
PYTHONPATH=apps/api uvicorn src.main:app --reload

# Run all tests
PYTHONPATH=apps/api pytest apps/api/tests -v

# Run a single test file
PYTHONPATH=apps/api pytest apps/api/tests/test_score.py -v

# Run a specific test function
PYTHONPATH=apps/api pytest apps/api/tests/test_score.py::test_scenario -v

# Linting
ruff check .
```

### Web (Next.js)

```bash
cd apps/web
bun install        # or: npm install
bun run dev        # Development server
bun run build      # Production build
bun run lint       # ESLint
```

### Notebooks

```bash
# Run Jupyter from project root (ensures correct Python path)
jupyter notebook notebooks/
```

## Architecture

### API service architecture

The API uses a service-based architecture with FastAPI:

- **FraudModelService** (`services/fraud_model.py`): LightGBM inference + SHAP explanations
- **SanctionsService** (`services/sanctions.py`): Fuzzy matching against OFAC lists
- **FeatureService** (`services/features.py`): Redis-backed velocity counters (1h/24h windows)
- **AuditService** (`services/audit.py`): Async PostgreSQL audit logging

Key patterns:

- Sanctions screening and Redis features run concurrently via `asyncio.gather()`
- Models loaded once at startup via FastAPI lifespan context manager
- Dynamic request schema generated from `data_catalog/processed/feature_registry.json`
- Background audit logging with `BackgroundTasks` to avoid blocking responses

### Scoring request flow

1. Request arrives at `/api/v1/score` with transaction data
2. **Concurrent execution**: Sanctions screening (CPU-bound, via `asyncio.to_thread`) and Redis velocity features run in parallel
3. Request data merged with velocity features → passed to LightGBM model
4. SHAP explainer generates top contributing features
5. Decision logic: sanctions hit → reject; risk_score > 0.8 → reject; > 0.5 → review; else → approve
6. Audit log written async via `BackgroundTasks`
7. Response returned with risk score, decision, SHAP explanations, and latency

### API endpoints

| Method | Path                | Description              |
| ------ | ------------------- | ------------------------ |
| `GET`  | `/health`           | Health check             |
| `POST` | `/api/v1/score`     | Score single transaction |
| `POST` | `/api/v1/batch`     | Score batch (max 100)    |
| `GET`  | `/api/v1/analytics` | Get analytics            |

**Interactive docs:** Once the API is running, Swagger UI is available at `http://localhost:8000/docs`

### Environment configuration

Copy `apps/api/.env.example` to `apps/api/.env` and configure:

- `REDIS_URL` - Redis connection (default: `redis://localhost:6379/0`)
- `DATABASE_URL` - PostgreSQL connection
- `MODEL_PATH` - Path to LightGBM model (`packages/models/fraud_baseline_v1.txt`)
- `SCREENER_PATH` - Path to sanctions screener pickle
- `EXPLAINER_PATH` - Path to SHAP explainer
- `FEATURE_REGISTRY_PATH` - Path to feature registry JSON

**Docker note:** `docker-compose.yml` overrides `DATABASE_URL` and `REDIS_URL` to use container hostnames (`db`, `redis`) instead of `localhost`.

## Code quality

### Python

- Line length: 100 characters
- Target version: Python 3.11
- Tools: `ruff` for linting
- Async mode enabled for pytest

### Commits

Follow Angular commit conventions. Format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

**Subject rules:**

- Use imperative, present tense: "add feature" not "added" or "adds"
- Don't capitalize the first letter
- Don't end with a period
- Lines should not exceed 100 characters

**Body:** Explain motivation for the change, use bullet points

**Footer:** Reference issues with `Fixes #123` or `Closes #456`

**Examples:**

```
fix(api): handle empty request payloads

Prevent API crash when payload is missing by adding validation.

Fixes #42
```

```
feat(model): add SHAP explainability

- Include SHAP values for fraud model predictions
- Display top contributing features in demo UI

Closes #101
```
