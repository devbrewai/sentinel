# Technical Findings

This directory contains detailed technical findings, performance metrics, and design decisions from each phase of the research project. These documents are separated from the [main roadmap](../roadmap.md) to maintain clean status tracking while preserving comprehensive technical documentation.

## Documentation Structure

### Phase 1: Data Exploration & Feature Engineering
**Status:** Complete

[Phase 1 Findings](data-exploration-notes.md)

**Key Topics:**
- Dataset statistics (IEEE-CIS, PaySim, OFAC)
- Cross-dataset insights and modeling strategy
- Feature engineering decisions and optimizations
- Missing value handling and edge cases
- Production state management considerations

**Key Metrics:**
- 590K transactions, 432 features, 1:29 class imbalance
- 0 missing values after processing
- 59 MB memory footprint (10.6% reduction from raw data)

---

### Phase 2: Model Training & Evaluation
**Status:** Complete

[Phase 2 Findings](model-training-notes.md)

**Key Topics:**
- Baseline model performance and architecture
- Comprehensive evaluation suite (confusion matrices, PR curves)
- Cost-sensitive threshold optimization
- Hyperparameter tuning investigation and diagnostics
- Model selection rationale (baseline vs tuned)
- Probability calibration (isotonic regression)
- SHAP explainability (global and local)
- Feature importance analysis
- Production deployment guidelines

**Key Metrics:**
- Test ROC-AUC: 0.8861 (exceeds 0.85 target by 4.2%)
- Test PR-AUC: 0.4743 (exceeds 0.35 target by 35.5%)
- Cost savings: $225,625 (55.5% reduction at optimal threshold)
- Model size: 1.18 MB (enables low-latency inference)
- Calibration ECE: 0.0050 (96.8% improvement, 50x better than 0.10 target)
- SHAP computation: <20s for 10K sample, <10ms inference overhead

**Business Impact:**
- Optimal threshold: 0.4205
- Fraud capture: 70.7% (2,875/4,067 cases)
- Review rate: 12.9% (15,250/118,205 transactions)
- Cost per transaction: $1.53 (vs $3.44 baseline)
- Regulatory compliance: GDPR/FCRA explainability requirements met
- Operational efficiency: 20-30% fraud analyst review time savings (via SHAP)

---

### Phase 3: Sanctions Screening Module
**Status:** In progress

[Sanctions Screening Notes](sanctions-screening-notes.md)

**Key Topics:**
- OFAC data integration (SDN + Consolidated lists)
- Text normalization and tokenization with stopword filtering
- Multi-strategy blocking (first token, token bucket, initials signature)
- Fuzzy matching implementation (RapidFuzz composite scoring)
- Country and program filters with audit logging
- Decision logic & thresholds (is_match ≥ 0.90, review ≥ 0.80, no_match < 0.80)
- Latency optimization (vectorized scoring, LRU caching, candidate capping)
- Two-stage adaptive scoring for recall/latency balance
- Evaluation protocol with labeled test set

**Key Metrics:**
- Precision@1: 97.5% (exceeds ≥95% target by 2.5%)
- Recall@top3: 98.0% (exceeds ≥98% target)
- Latency p95: 49.63 ms (meets <50ms target)
- Latency p50: 23.56 ms (optimized fast-path)
- Blocking recall: 100% (exceeds ≥99.5% target)
- Search space reduction: ~99% (39,350 → ~200-500 candidates)
- Dataset: 39,350 name records from 18,310 unique sanctioned entities
- Throughput: 422 queries/sec (single process)

**Business Impact:**
- Three-tier decision system enables automated processing for high-confidence matches
- Review band (0.80-0.90) flags ambiguous cases for manual review
- Low-latency screening (p95: 49.63ms) enables real-time payment processing
- Comprehensive audit logging supports compliance requirements
- Country/program filters reduce false positives for corridor-specific screening

---

## Document Conventions

### Audience
Technical documentation for:
- ML engineers and data scientists
- Financial institution technical evaluators
- Fintech startup engineering teams
- Technical due diligence reviewers

### Structure Standards
Each findings document includes:
1. **Overview:** Phase scope and completion status
2. **Key Findings:** Technical insights and metrics
3. **Limitations:** Known issues and constraints
4. **Next Phase Inputs:** Artifacts and requirements for subsequent phases
5. **References:** Links to notebooks, artifacts, and related docs

### Update Frequency
- Findings documents are updated at phase completion
- In-progress phases receive incremental updates as major milestones complete
- Last updated dates tracked at document level


## Contributing to Findings

When adding findings:
1. Maintain consistent structure across phase documents
2. Include both technical metrics and business implications
3. Document limitations and edge cases explicitly
4. Cross-reference related notebooks and artifacts
5. Update this README with new phase findings as they complete

---

**Last Updated:** 2025-11-18 (Phase 3 Complete)  
**Project:** AI Fraud Detection for Cross-Border Payments & Sanctions Screening Research Case Study  
**Organization:** Devbrew

