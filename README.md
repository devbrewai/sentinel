# Sentinel: AI fraud detection & sanctions screening for cross-border payments

An open-source research case study from [Devbrew](https://www.devbrew.ai) demonstrating AI fraud detection and sanctions screening (using OFAC lists) for cross-border payments.

**[Read case study summary →](https://www.devbrew.ai/case-studies/sentinel)**

This reference pipeline combines public datasets (IEEE-CIS, PaySim, OFAC) with modern ML and API tooling to:

- Detect fraud in **card-not-present (CNP) transactions** using trained ML models
- Screen transaction parties against the **OFAC Sanctions Lists** with fuzzy-matching techniques
- Deliver explainable fraud risk scores in real time, with a latency target of **sub-200ms**

**Deliverables:**

- Notebooks for building and training fraud detection models and sanctions screeners
- A FastAPI service for real-time model inference
- A demo UI with fraud scores and explainability outputs
- Documentation and reference architecture

_Live demo available at [sentinel.devbrew.ai](https://sentinel.devbrew.ai)._

> [!WARNING] > **For research/educational use only**
>
> Models trained on IEEE-CIS data are restricted to **non-commercial use**.
> Production deployments require retraining on proprietary or licensed datasets.

**License:** Apache 2.0

## Data sources

- **Fraud detection**
  - [IEEE-CIS e-commerce fraud dataset](https://www.kaggle.com/c/ieee-fraud-detection) - research only (non-commercial license)
  - [PaySim synthetic mobile money dataset](https://www.kaggle.com/ntnu-testimon/paysim1) - open data
- **Sanctions screening**
  - [OFAC SDN and Consolidated Lists](https://sanctionslist.ofac.treas.gov/Home) - public domain

## Tech stack

- **Backend**: FastAPI, Python, LightGBM/XGBoost, Redis, PostgreSQL
- **Frontend**: Next.js, Tailwind, Vercel
- **Hosting**: Fly.io or Render (API), Vercel (UI) or any cloud service provider (e.g. AWS, GCP, Azure, DigitalOcean, Heroku, etc.)

## Repo structure

```
sentinel/
  ├── apps/
  │   ├── api/           # FastAPI scoring service
  │   └── web/           # Next.js demo UI
  ├── packages/
  │   ├── models/        # trained artifacts, ONNX exports
  │   └── shared/        # schemas, utils
  ├── data_catalog/      # dataset download scripts + notes
  ├── docs/
  │   ├── findings/      # phase-by-phase technical findings
  │   └── ...            # roadmap, requirements
  └── notebooks/         # EDA + model training
```

## Quickstart

### 1. Clone the repo

```bash
git clone https://github.com/devbrewai/sentinel.git
cd sentinel
```

### 2. Setup environment

**Using UV (recommended):**

```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies (creates .venv automatically)
uv sync

# Activate virtual environment
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows
```

**Or using pip:**

```bash
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows

uv pip install -e .         # Install from pyproject.toml
```

### 3. Run API locally

```bash
# Start infrastructure (Redis & Postgres)
make docker-up

# Run the API
make run-api
```

Run `make help` to see all available commands.

### 4. Run frontend

```bash
cd apps/web
npm install
npm run dev
```

## Demo

- Video walkthrough: [coming soon]
- Live demo endpoint (rate-limited): [sentinel.devbrew.ai](https://sentinel.devbrew.ai)

## Documentation

### Project planning

- [Research Requirements](./docs/research-requirements.md) — detailed case study specifications
- [Roadmap](./docs/roadmap.md) — project phases and success criteria

### Technical findings

- [Phase 1: Data Exploration](./docs/findings/data-exploration-notes.md) — dataset analysis, feature engineering insights
- [Phase 2: Model Training](./docs/findings/model-training-notes.md) — performance metrics, cost optimization, hyperparameter tuning
- [Phase 3: Sanctions Screening](./docs/findings/sanctions-screening-notes.md) — fuzzy matching implementation, blocking strategies, and performance evaluation

<!-- ### Results

- [Case Study Summary]: _planned_ "pending final results validation" -->

## Disclaimer

This repository is provided for **educational and research purposes only**.

- The **IEEE-CIS Fraud Dataset** is licensed for **non-commercial use only** and may not be redistributed or used to train commercial models.
- Any **trained model artifacts** derived from IEEE-CIS data are intended solely for demonstration and benchmarking.
- For production systems, you must retrain the pipeline on your own **proprietary or licensed datasets**.
- The **PaySim** and **OFAC Sanctions Lists** datasets are open/public and may be used more broadly, subject to their respective terms.

Devbrew makes no representations or warranties regarding the suitability of this code for production use. Use at your own risk and ensure compliance with all applicable laws, regulations, and dataset licenses.

## License

Apache 2.0 © Devbrew LLC. See [LICENSE](./LICENSE).

[NOTICE](./NOTICE) file includes dataset attributions.

## Contributing

Contributions are welcome!

- Open an issue for bugs or feature requests.
- Submit a PR following our contribution guidelines [here](./CONTRIBUTING.md).

## Contact

Questions about this research project? Reach out at **hello@devbrew.ai**

**Note:** We cannot provide commercial licensing for models trained on IEEE-CIS data due to dataset restrictions. For production fraud detection systems, contact us about building custom solutions with licensed data.
