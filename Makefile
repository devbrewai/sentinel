.PHONY: help run-api run-web test lint docker-up docker-down clean

# Default target
help:
	@echo "Sentinel - AI Fraud Detection & Sanctions Screening"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  run-api      Start the FastAPI server (requires Redis & Postgres)"
	@echo "  run-web      Start the Next.js frontend"
	@echo "  test         Run API tests"
	@echo "  lint         Run code linting"
	@echo "  docker-up    Start Redis & Postgres containers"
	@echo "  docker-down  Stop Docker containers"
	@echo "  clean        Remove Python cache files"

# Run the FastAPI server
run-api:
	PYTHONPATH=apps/api uvicorn src.main:app --reload

# Run the Next.js frontend
run-web:
	cd apps/web && bun run dev

# Run tests
test:
	PYTHONPATH=apps/api pytest apps/api/tests -v

# Run linting
lint:
	ruff check .

# Start infrastructure containers
docker-up:
	docker-compose -f apps/api/docker-compose.yml up -d redis db

# Stop infrastructure containers
docker-down:
	docker-compose -f apps/api/docker-compose.yml down

# Clean Python cache
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
