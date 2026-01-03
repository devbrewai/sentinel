# Case Study Summary

**Sentinel: AI fraud detection & sanctions screening for cross-border payments**

> **Research/educational use only** — Not production-ready.
> Models trained on IEEE-CIS data are restricted to non-commercial use.

## Overview

This open-source research case study demonstrates a low-latency pipeline for fraud detection and sanctions screening in cross-border payments. Built for Series A to C cross-border payments companies evaluating ML-based risk systems.

**Key achievements:**

- Real-time fraud scoring with **ROC-AUC 0.8861** (exceeds 0.85 target)
- Sanctions screening with **97.5% precision** and **<50ms latency**
- End-to-end API latency of **~30ms p95** (7x better than 200ms target)
- SHAP-based explainability for regulatory compliance
- Production-grade demo UI with batch processing and analytics

## Research context

**Challenge:** Financial companies need to detect fraud and screen sanctions in cross-border payments in real-time while minimizing false positives and maintaining compliance.

**Approach:** This case study explores ML engineering patterns and inference optimization techniques applicable to financial risk systems, using publicly available datasets (IEEE-CIS,PaySim, OFAC).

## Technical implementation

### Fraud detection

- **Model:** LightGBM gradient boosting (1.18 MB, 295 trees)
- **Features:** 429 engineered features including velocity counters, device reuse patterns, and amount statistics
- **Calibration:** Isotonic regression achieving ECE of 0.0050 (96.8% improvement)
- **Explainability:** SHAP TreeExplainer with <10ms inference overhead

### Sanctions screening

- **Algorithm:** RapidFuzz composite scoring (token set + token sort + partial ratio)
- **Index:** 39,350 OFAC entities (SDN + Consolidated lists)
- **Blocking:** Multi-strategy approach achieving 100% recall with 99% search space reduction
- **Decision logic:** Three-tier system (match ≥0.90, review 0.80-0.90, no match <0.80)

### Infrastructure

- **API:** FastAPI with async/await pattern for parallel execution
- **Cache:** Redis for velocity feature computation (1h/24h windows)
- **Database:** PostgreSQL for audit logging (compliance-ready)
- **Frontend:** Next.js 16 with React 19, Tailwind CSS, and Recharts

## Key findings

### Model performance

| Metric                | Value   | Target | Status                 |
| --------------------- | ------- | ------ | ---------------------- |
| Fraud ROC-AUC         | 0.8861  | ≥0.85  | Exceeds by 4.2%        |
| Fraud PR-AUC          | 0.4743  | ≥0.35  | Exceeds by 35.5%       |
| Calibration ECE       | 0.0050  | <0.10  | 50x better than target |
| Sanctions Precision@1 | 97.5%   | ≥95%   | Exceeds                |
| Sanctions Recall@top3 | 98.0%   | ≥98%   | Meets                  |
| Sanctions latency p95 | 47.51ms | <50ms  | Meets                  |
| API latency p95       | ~30ms   | <200ms | 7x better              |

### Business impact analysis

Cost-sensitive threshold optimization reveals:

- **Optimal threshold:** 0.4205 (not default 0.5)
- **Cost savings:** $225,625 (55.5% reduction from baseline)
- **Fraud capture rate:** 70.7% of fraud cases detected
- **Review rate:** 12.9% of transactions flagged for review

### Feature importance

Top contributing features (SHAP analysis):

1. C13 (card behavior patterns)
2. P_emaildomain (email reputation)
3. card_amt_mean (engineered velocity feature)
4. TransactionAmt (transaction amount)
5. C1 (card-level fraud signals)

**Key insight:** 70% of top-20 features are interpretable, enabling stakeholder communication despite anonymous V-features in the dataset.

## Demo application

The Next.js demo UI includes:

- **Dashboard:** Real-time transaction scoring with risk gauge visualization
- **Batch processing:** CSV upload for bulk screening (up to 100 transactions)
- **Analytics:** Transaction volume, risk distribution, latency trends, model metrics
- **Explainability:** SHAP feature contributions displayed per transaction
- **Compliance:** PDF report export with decision rationale and audit trail
- **Velocity indicators:** Card transaction frequency (1h/24h windows)

## Deliverables

- Jupyter notebooks (EDA, feature engineering, model training, sanctions evaluation)
- LightGBM fraud model with SHAP explainer and probability calibration
- Sanctions screening module with RapidFuzz fuzzy matching
- FastAPI inference service with Redis caching and PostgreSQL audit logging
- Next.js demo UI with batch processing and analytics
- Docker Compose configuration for local development
- Comprehensive documentation and architecture reference

## Limitations

**Current limitations:**

- Models trained on public/synthetic data (IEEE-CIS license restricts commercial use)
- Temporal concept drift observed (PR-AUC degrades over time splits)
- Cold-start problem for first-time cards (velocity features unavailable)
- 2% false negative rate in sanctions screening from edge-case typos

**For production use:**

- Retrain on proprietary or licensed transaction datasets
- Implement continuous monitoring and drift detection
- Add comprehensive security hardening and rate limiting
- Conduct thorough compliance review (GDPR, FCRA, AML/KYC)
- Scale infrastructure for production load (current: 422 queries/sec single-process)

## Dataset attribution

- **IEEE-CIS Fraud Dataset:** Non-commercial research use only (Kaggle competition)

- **PaySim:** Open synthetic mobile money dataset (Kaggle)
- **OFAC Lists:** Public domain (U.S. Treasury Department)

**License:** Apache 2.0 (code), with dataset-specific restrictions

**Repository:** [github.com/devbrewai/sentinel](https://github.com/devbrewai/sentinel)
