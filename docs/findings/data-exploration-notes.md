# Phase 1: Data Exploration & Feature Engineering Notes

**Status:** Complete  
**Duration:** Initial exploration through feature engineering  
**Last Updated:** 2025-11-01

## Overview

This document captures all technical findings, insights, and design decisions from Phase 1 of the cross-border payments fraud detection and sanctions screening research project.

## Dataset Statistics

### IEEE-CIS Fraud Detection Dataset
- **Size:** 590,540 transactions
- **Features:** 394 columns (433 after engineering)
- **Fraud Rate:** 3.5% (20,663 fraudulent transactions)
- **Class Imbalance:** 1:29 (fraud:legitimate)
- **Missing Values:** 374/394 columns contain missing values
- **Data Quality:** No duplicate rows detected

### PaySim Mobile Money Dataset
- **Size:** 6.4M transactions
- **Features:** 11 columns
- **Fraud Rate:** 0.2% (8,213 fraudulent transactions)
- **Class Imbalance:** 1:500 (fraud:legitimate)
- **Transaction Types:** 5 types (CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER)

### OFAC Sanctions Lists
- **SDN List:** 13,178 entities
- **Consolidated List:** 26,172 entities
- **Total Unique Entities:** 39,350
- **Coverage:** Individuals, organizations, vessels, aircraft
- **Status:** Preprocessed and ready for fuzzy matching integration

## Cross-Dataset Insights

### Class Imbalance Comparison
Both IEEE-CIS (1:37) and PaySim (1:500) exhibit severe class imbalance requiring:
- Stratified sampling in train/validation/test splits
- Appropriate evaluation metrics (PR-AUC prioritized over accuracy)
- Class weighting or resampling strategies during training
- Proper cross-validation methodology

**Implication:** Model evaluation must use threshold-independent metrics (ROC-AUC, PR-AUC) and precision-recall analysis rather than accuracy-based metrics.

### Feature Coverage Analysis
- **IEEE-CIS:** 434 features enabling rich feature engineering and deep learning approaches
- **PaySim:** 11 features requiring domain-driven feature engineering (velocity, graph features)
- **Strategic Decision:** IEEE-CIS selected as primary dataset for initial modeling due to feature richness

### Compliance Integration Strategy
- OFAC sanctions data successfully preprocessed with name standardization
- 39,350 entities ready for fuzzy matching pipeline
- Country and date filters prepared for matching optimization
- Integration plan: Phase 3 after fraud model completion

### Modeling Strategy Implications
Side-by-side analysis reveals:
1. Algorithm selection must account for different imbalance ratios
2. Feature engineering approaches differ significantly (IEEE-CIS: selection, PaySim: creation)
3. Hyperparameter tuning requires imbalance-aware objective functions
4. Threshold selection must be business-driven, not default 0.5

### Deployment Planning
- Implemented conditional logic to handle missing/unloaded datasets gracefully
- Validation checks ensure pipeline robustness before production
- Dataset availability verification prevents silent failures

## Feature Engineering Insights

### Missing Value Strategy

**Problem:** 374 out of 394 columns (95%) contained missing values, with some columns >90% missing.

**Solution:**
- Dropped 12 columns with >90% missing values (3% of feature set)
- Imputed remaining features:
  - Numeric: Median imputation
  - Categorical: Mode imputation
- **Result:** Zero missing values in final dataset

**Production Consideration:** Missing value patterns in production data may differ from training; implement monitoring for imputation rate drift.

### Single-Transaction Edge Case

**Problem:** 3,444 cards (0.58% of unique cards) appeared only once in the dataset, causing NaN values in standard deviation calculations for card-level aggregation features.

**Solution:** Filled NaN standard deviations with 0 (semantically correct: zero variation for single transaction).

**Validation:** Post-processing checks confirmed all engineered features have zero missing values.

**Production Implication:** Real-time inference must handle first-time cards gracefully; consider separate treatment for cold-start cards.

### Feature Density Optimization

**Achievements:**
- Engineered 10 high-value features across 4 categories
- Increased feature count: 422 → 432 (+2.4%)
- Reduced memory footprint: 66MB → 59MB (-10.6%)
- Optimization method: Intelligent dtype casting (float64→float32, int64→int32)

**Engineered Feature Categories:**
1. **Temporal Features:** Hour of day, day of week for cyclic fraud patterns
2. **Velocity Features:** Transaction counts per card (1h, 24h windows)
3. **Device Reuse Features:** Email/device/address aggregations for multi-accounting detection
4. **Amount Statistics:** Per-card amount mean/std for behavioral anomaly detection

### Velocity Computation Performance

**Challenge:** Card-level velocity features (1h/24h rolling windows) are computationally expensive on 590K transactions.

**Training Performance:** Acceptable for batch processing (one-time computation).

**Production Considerations:**
- Real-time inference requires sub-100ms latency
- **Recommendation:** Pre-compute velocity features with Redis/cache layer
- Update strategy: Event-driven updates on each transaction
- Fallback: Use 0 for velocity features on first-time cards

### Data Quality Validation

**Implementation:** Automated validation suite with 8 check categories:
1. Missing value detection
2. Duplicate row identification
3. Data type validation
4. Range validation (amounts >0, probabilities in [0,1])
5. Feature count verification
6. Class balance reporting
7. Memory usage tracking
8. Feature engineering output validation

**Impact:** Caught missing values in engineered features before model training, preventing downstream pipeline failures.

**Production Best Practice:** Validation gates at each pipeline stage prevent cascading failures and ensure data quality SLAs.

### Production State Management

**Stateful Features Requiring Infrastructure:**

1. **Velocity Features (card_velocity_1h, card_velocity_24h)**
   - Requires: Redis/cache layer with TTL-based expiry
   - Update frequency: Real-time on each transaction
   - Retention: 24-hour sliding window

2. **Device Aggregation Features**
   - Requires: Persistent storage (PostgreSQL/similar)
   - Update frequency: Batch updates (hourly/daily acceptable)
   - Retention: Full history with periodic archival

3. **Card Statistics (card_amount_mean, card_amount_std)**
   - Requires: Incremental computation or periodic recomputation
   - Update frequency: Near-real-time (5-minute batches acceptable)
   - Retention: Rolling 90-day window recommended

**Architecture Recommendation:** Dual-layer caching (Redis for hot data, PostgreSQL for cold data) with feature store pattern (Feast/Tecton).

## Development Best Practices

### Helper Function Validation

**Approach:** Built reusable helper functions with validation tests during exploration phase.

**Test Coverage:**
- Data loading functions
- Quality analysis utilities
- Visualization generators
- Feature engineering pipelines

**Post-Development Strategy:** Replace verbose test cells with minimal validation checks in production notebooks while maintaining safety guarantees.

**Benefit:** Ensures code correctness during rapid exploration without cluttering final notebooks.

### Reproducibility Standards

**Implemented:**
- Deterministic random seeds across all operations
- Environment specification (pyproject.toml with locked dependencies)
- Data versioning metadata (MD5 checksums)
- Comprehensive logging of all transformations

**Production Benefit:** Enables audit trail for regulatory compliance and debugging.

## Key Metrics Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Training Samples | 590,540 | N/A | ✓ |
| Features (Final) | 432 | N/A | ✓ |
| Missing Values | 0 | 0 | ✓ |
| Memory Footprint | 59 MB | <100 MB | ✓ |
| Fraud Rate | 3.5% | N/A | ✓ |
| Class Imbalance | 1:29 | Documented | ✓ |

## Limitations & Known Issues

1. **Temporal Coverage:** Dataset represents transactions from specific time period; fraud patterns evolve
2. **Feature Anonymization:** V-features (anonymous) limit interpretability for stakeholder communication
3. **Geographic Bias:** Dataset may not represent all geographic fraud patterns
4. **Cold Start:** First-time cards have limited feature signal (velocity=0, no statistics)
5. **Velocity Features:** Computationally expensive for real-time inference without caching infrastructure

## Next Phase Inputs

**Artifacts for Phase 2 (Model Training):**
- `data_catalog/processed/train_features.parquet` (432 features, 590K rows)
- `data_catalog/processed/feature_registry.json` (feature metadata)
- `data_catalog/processed/feature_engineering_metadata.json` (transformation log)
- `data_catalog/processed/exploration_metadata.json` (data quality report)

**Phase 2 Requirements:**
- Implement stratified temporal split (train: 60%, val: 20%, test: 20%)
- Apply class weighting (1:29 imbalance ratio)
- Target metrics: ROC-AUC ≥0.85, PR-AUC ≥0.35
- Maintain temporal ordering to detect concept drift

## References

- **Dataset:** IEEE-CIS Fraud Detection (Kaggle Competition)
- **Notebook:** `notebooks/01_data_exploration.ipynb`
- **Notebook:** `notebooks/02_feature_engineering.ipynb`
- **Metadata:** `data_catalog/processed/*.json`

