# Research Roadmap

**AI Fraud Detection & Sanctions Screening for Cross-Border Payments**

This roadmap outlines the phases, tasks, and success criteria for building this research case study from data preparation through final documentation.

**Status Legend:** 🟢 Complete | 🟡 In Progress | ⚪ Not Started

**Documentation Structure:** This roadmap tracks project status only. For detailed technical findings, performance metrics, and design decisions, see the [findings/](findings/) directory.

Last Updated: 2025-12-03

## Phase 1: Data Preparation & Exploration

**Status:** 🟢 Complete

### Tasks

- [x] Set up project structure and environment
- [x] Download all required datasets (IEEE-CIS, PaySim, OFAC)
- [x] Create data availability validation script
- [x] Build helper functions for data loading and quality analysis
- [x] Perform initial EDA on IEEE-CIS train data
- [x] Analyze PaySim dataset
- [x] Analyze OFAC sanctions lists (SDN + Consolidated)
- [x] Define missing value handling strategy (>90% missing columns)
- [x] Engineer fraud detection features:
  - [x] Velocity counters (transactions per user 1h/24h)
  - [x] Device reuse patterns
  - [x] BIN-IP mismatch detection
  - [x] Amount z-scores per merchant
- [x] Merge and prepare final training dataset
- [x] Save processed features to disk

**Success Criteria:**

- [x] All datasets loaded and validated
- [x] Data quality issues documented
- [x] Feature engineering complete
- [x] Clean dataset ready for model training

**Deliverables:**

- [x] Processed training dataset (432 features, 590K rows)
- [x] Feature engineering pipeline
- [x] Data quality validation suite
- [x] Comprehensive findings documentation

**Detailed Findings:** See [Phase 1 Findings](findings/data-exploration-notes.md) for technical insights, feature engineering decisions, and production considerations.

## Phase 2: Fraud Model Training

**Status:** 🟢 Complete

### Tasks

- [x] Split data (train/validation/test)
- [x] Handle class imbalance (class weights)
- [x] Train baseline model (LightGBM/XGBoost)
- [x] Hyperparameter tuning (Step 7) - Decision: Use baseline model
- [x] Evaluate model performance:
  - [x] ROC-AUC ≥ 0.85 (target)
  - [x] PR-AUC ≥ 0.35 (target)
  - [x] Confusion matrix analysis (3 thresholds)
  - [x] Precision-Recall-Threshold curves
  - [x] Cost-sensitive threshold optimization
  - [x] Feature importance analysis
  - [x] Comprehensive evaluation JSON
- [x] Calibrate probabilities (isotonic regression)
- [x] Implement SHAP explainability
- [x] Save model artifacts (baseline + evaluation + calibration + explainability)
- [x] Document model performance and limitations

**Success Criteria:**

- [x] ROC-AUC ≥ 0.85 on test set (achieved 0.8861)
- [x] PR-AUC ≥ 0.35 on test set (achieved 0.4743)
- [x] Probability calibration (ECE < 0.10 target, achieved 0.0050)
- [x] Model artifacts saved and versioned
- [x] Evaluation metrics documented

**Deliverables:**

- [x] Baseline model (LightGBM, 1.18 MB)
- [x] Comprehensive evaluation suite (confusion matrices, PR curves, cost analysis)
- [x] Business cost optimization ($225K savings at optimal threshold)
- [x] Hyperparameter tuning analysis (baseline selected via systematic diagnostics)
- [x] Model metadata with 13-section structure (MLOps-ready)
- [x] Probability calibration (isotonic regression, ECE=0.0050, 96.8% improvement)
- [x] SHAP explainability (TreeExplainer, 10K sample, <10ms inference overhead)

**Detailed Findings:** See [Phase 2 Findings](findings/model-training-notes.md) for performance metrics, cost analysis, hyperparameter tuning investigation, probability calibration results, SHAP explainability analysis, and model selection rationale.

## Phase 3: Sanctions Screening Module

**Status:** 🟢 Complete

### Tasks

- [x] Load and preprocess OFAC SDN list
- [x] Load and preprocess OFAC Consolidated list
- [x] Implement fuzzy matching (RapidFuzz)
- [x] Add country/program filters (date filter not available in CSV data)
- [x] Generate confidence scores (composite similarity scoring)
- [x] Implement tokenization and canonical forms
- [x] Implement multi-strategy blocking (first token, bucket, initials)
- [x] Validate blocking recall (100% achieved)
- [x] Validate similarity scoring (monotonicity, determinism, score range)
- [x] Validate filter functionality (post-scoring, audit logging, fallback)
- [x] Implement decision logic & thresholds (is_match, review, no_match)
- [x] Benchmark matching latency (p95 < 50ms target) - **Achieved: 3.06 ms (105.56x improvement)**
- [x] Test matching accuracy (precision@top1 ≥ 95%) - **Achieved: Precision@1 = 97.5%, Recall@top3 = 98.0%**
- [x] Implement evaluation protocol with labeled test set (250 queries)
- [x] Two-stage adaptive scoring optimization (p95: 47.51 ms, all targets met)
- [x] Document matching logic and edge cases
- [x] Implement Inference Wrapper (SanctionsScreener)
- [x] Save final artifacts (Screener pickle, Metadata JSON)

**Success Criteria:**

- [x] Fuzzy matching working with confidence scores
- [x] Country/program filters implemented (date filter not applicable)
- [x] Decision thresholds implemented (is_match ≥ 0.90, review ≥ 0.80)
- [x] Matching latency <50ms (achieved: 47.51 ms p95 with two-stage adaptive scoring)
- [x] Matching accuracy Precision@1 ≥ 95% (achieved: 97.5%)
- [x] Matching accuracy Recall@top3 ≥ 98% (achieved: 98.0%)
- [x] Production artifacts saved and versioned

## Phase 4: API Service & Infrastructure

**Status:** 🟡 In Progress

### Tasks

- [x] Build FastAPI service structure
- [x] Implement `/score` endpoint
- [x] Integrate fraud model inference
- [x] Integrate sanctions screening
- [x] Set up Redis for velocity feature caching
- [x] Set up PostgreSQL for audit logging
- [x] Implement API authentication (via Pydantic Settings/Env vars)
- [x] Add request/response logging (Audit Service)
- [ ] Benchmark end-to-end latency
- [x] Write API tests

**Success Criteria:**

- [x] API returns risk_score, top_features, sanctions_match
- [ ] End-to-end latency ≤ 200ms p95
- [x] Audit logs stored in PostgreSQL
- [x] Redis caching working for velocity features

## Phase 5: Demo UI

**Status:** ⚪ Not Started

### Tasks

- [ ] Set up Next.js project
- [ ] Build transaction input form
- [ ] Display fraud risk gauge
- [ ] Display SHAP feature importance
- [ ] Display sanctions match results
- [ ] Style with Tailwind CSS
- [ ] Connect to API backend
- [ ] Test end-to-end flow
- [ ] Deploy demo (Vercel)

**Success Criteria:**

- [ ] Working demo UI with real-time scoring
- [ ] All visualizations functional
- [ ] Deployed and accessible

## Phase 6: Documentation & Case Study Summary

**Status:** ⚪ Not Started

### Tasks

- [ ] Document methodology in notebooks
- [ ] Write case study summary with findings
- [ ] Document limitations and future work
- [ ] Create architecture diagrams
- [ ] Write deployment guide
- [ ] Update README with final results
- [ ] Verify all dataset attributions and licenses

**Success Criteria:**

- [ ] Complete documentation of approach
- [ ] Case study summary published
- [ ] Reproducible setup instructions
- [ ] All compliance requirements met

## Overall Success Criteria

- [x] Fraud model ROC-AUC ≥ 0.85 (achieved 0.8861)
- [x] Fraud model PR-AUC ≥ 0.35 (achieved 0.4743)
- [x] Probability calibration ECE < 0.10 (achieved 0.0050)
- [x] Comprehensive model evaluation with business metrics
- [x] Sanctions screening latency <50ms (achieved 47.51 ms p95)
- [x] Sanctions screening Precision@1 ≥ 95% (achieved 97.5%)
- [x] Sanctions screening Recall@top3 ≥ 98% (achieved 98.0%)
- [ ] End-to-end latency ≤ 200ms p95 (pending API integration, sanctions component ready)
- [x] Clear documentation of methodology and limitations
- [x] Reproducible notebooks and code
- [ ] Working demo with all components integrated
- [x] IEEE-CIS license compliance verified

## Next Steps

**Current Focus:** Phase 4 (API Service & Infrastructure) - FastAPI integration of fraud detection and sanctions screening modules.

**Recent Completion:**

- **Phase 3: Sanctions Screening** (Complete ✅)
  - [x] OFAC data loading and normalization
  - [x] Tokenization and canonical forms
  - [x] Multi-strategy blocking (100% recall)
  - [x] Similarity scoring (RapidFuzz composite)
  - [x] Country and program filters
  - [x] Decision logic & thresholds
  - [x] Latency optimization (p95 = 47.51 ms)
  - [x] Evaluation protocol (Precision@1 = 97.5%, Recall@top3 = 98.0%)
  - [x] Production artifacts (Screener Pickle, Metadata)

**Immediate Actions:**

1. **Phase 4: API Service** (~8-12 hours)

   - [ ] FastAPI service structure
   - [ ] Model inference integration
   - [ ] Redis/PostgreSQL setup

2. **Phase 5: Demo UI** (~6-8 hours)

   - [ ] Next.js application
   - [ ] Real-time scoring interface
   - [ ] Deployment (Vercel)

3. **Phase 6: Final Documentation** (~3-4 hours)
   - [ ] Case study summary
   - [ ] Architecture diagrams
   - [ ] Deployment guide

**For detailed progress and technical insights:** See [Phase 1 Findings](findings/data-exploration-notes.md), [Phase 2 Findings](findings/model-training-notes.md), and [Phase 3 Findings](findings/sanctions-screening-notes.md).
