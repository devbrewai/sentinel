# Research Case Study Requirements

**Sentinel: AI Fraud Detection & Sanctions Screening for Cross-Border Payments**

## Overview

This project is an **open-source research case study** demonstrating AI fraud detection and sanctions screening concepts for cross-border payments.

The deliverable is a **reference implementation and demo** that:

- Scores card-not-present (CNP) transactions for fraud risk using public datasets.
- Screens names against OFAC sanctions lists using fuzzy matching.
- Returns a fraud risk score, top contributing features, and any sanctions matches.
- Targets end-to-end latency **under 200 ms**.

> [!WARNING]
>
> > **For research/educational use only**
>
> Models trained on IEEE-CIS data are restricted to **non-commercial use**.
> Production deployments require retraining on proprietary or licensed datasets.

Repo: `devbrewai/ai-fraud-detection-cross-border-payments`  
License: **Apache 2.0**

## Target Audience

- **Fintech startups** and **financial institutions** evaluating fraud detection and sanctions screening approaches.
- **Engineering teams** at payments companies exploring ML pipeline architectures for financial risk.
- **Data scientists** in the finance industry studying feature engineering and model explainability.
- **Researchers and students** investigating financial crime prevention systems.
- **Open-source contributors** interested in reference implementations.

## Research Focus

This case study explores how to build a low-latency pipeline for:

- **Fraud detection** in card-not-present (CNP) transactions using public and synthetic datasets.
- **Sanctions screening** against OFAC lists with fuzzy matching.

The goal is to demonstrate practical ML engineering patterns, feature design, and real-time inference techniques applicable to financial risk systems.

## Objectives & Success Criteria

**Objectives**

- Train and serve a fraud detection model using public datasets (IEEE-CIS, PaySim).
- Implement fuzzy sanctions list matching with clear audit output.
- Build a demo UI to visualize the pipeline and model explainability.
- Document the approach for educational and research purposes.

**Success Criteria**

- Fraud model ROC-AUC ≥ 0.85 on test set.
- End-to-end latency ≤ 200 ms p95 (demonstration target).
- Clear documentation of methodology, limitations, and dataset restrictions.
- Reproducible notebooks and code for learning purposes.

## Data Sources

- **Fraud detection**:

  - [IEEE-CIS e-commerce fraud dataset](https://www.kaggle.com/c/ieee-fraud-detection) — **non-commercial research use only**. Cannot be redistributed or used for commercial model training.
  - [PaySim synthetic mobile money dataset](https://www.kaggle.com/ntnu-testimon/paysim1) — open data for research.

- **Sanctions screening**:
  - [OFAC SDN and Consolidated Lists](https://sanctionslist.ofac.treas.gov/Home) — public domain.

> **Compliance Note**: Any models or artifacts derived from IEEE-CIS data are for demonstration and benchmarking only. Commercial use requires retraining on licensed datasets.

## Deliverables

1. **Fraud Detection Model**

   - Gradient boosting (LightGBM/XGBoost).
   - Features: velocity counters, device reuse, BIN–IP mismatch, z-scored amounts.
   - Calibrated probabilities + cost-based threshold.

2. **Sanctions Screening Module**

   - Token-based fuzzy matching (e.g. RapidFuzz).
   - Country/date filters.
   - Confidence score + best candidate match.

3. **API Service** (FastAPI)

   - Endpoint `/score` → returns JSON with risk_score, top_features, sanctions_match.
   - Redis cache for velocity counters.
   - Logging + audit storage in Postgres.

4. **Demo Web App** (Next.js, Vercel)

   - Input form for transactions.
   - Gauge for fraud risk.
   - SHAP/feature importance panel.
   - Sanctions match card.

5. **Documentation & Learning Materials**
   - Training notebook (EDA, feature engineering, model training).
   - Model artifact + inference wrapper.
   - Demo walkthrough and screenshots.
   - Reference architecture and methodology documentation.

## Technical Requirements

### Reference Stack

- **Backend**: FastAPI, Python, LightGBM/XGBoost
- **Caching**: Redis (velocity features)
- **Storage**: PostgreSQL (audit logs, sanctions lists)
- **Frontend**: Next.js + Tailwind
- **Hosting**: Fly.io/Render (API), Vercel (UI), or any cloud provider

> **Note**: This stack demonstrates concepts. Production systems would require additional hardening, monitoring, and infrastructure.

### Design Goals

- Target latency: ≤ 200 ms p95 (demonstration benchmark).
- Model explainability: SHAP feature importances for transparency.
- Basic audit logging of requests/responses.
- Security best practices: environment variables for secrets, API authentication.

> **Note**: These are demonstration targets, not production SLAs.

## Project Structure

```
sentinel/
  ├── apps/
  │   ├── api/           # FastAPI scoring service
  │   └── web/           # Next.js demo UI
  ├── packages/
  │   ├── models/        # trained artifacts, ONNX exports
  │   └── shared/        # schemas, utils
  ├── data_catalog/      # dataset download scripts + notes
  ├── docs/              # PRD, one-pagers, ROI, architecture
  └── notebooks/         # EDA + model training
```

## Development Timeline

- **Phase 1** → Data exploration, ingestion, and feature engineering.
- **Phase 2** → Fraud model training and sanctions screening module.
- **Phase 3** → API service, demo UI, and documentation.

## Research Outcomes

This case study demonstrates:

- Feature engineering patterns for fraud detection in CNP transactions.
- Fuzzy matching techniques for sanctions screening.
- Low-latency ML inference architecture.
- Model explainability and interpretability approaches.

Results are based on public/synthetic datasets and serve as educational benchmarks only.

## Licensing & Attribution

- **Code License**: Apache 2.0
- **Dataset Restrictions**:

  - **IEEE-CIS**: Non-commercial research use only. Models trained on this data cannot be used commercially.
  - **PaySim**: Open data, available for research and educational use.
  - **OFAC**: Public domain.

- **NOTICE file** includes:
  - Devbrew as project originator.
  - Full attribution and license terms for all datasets.
  - Disclaimer regarding research/educational use only.

> **Critical**: Any derivative models or artifacts from IEEE-CIS data inherit the non-commercial restriction.
