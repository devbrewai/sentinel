# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies required for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy files required for pip install to build the project
COPY pyproject.toml README.md ./
COPY packages ./packages

# Install dependencies into a temporary directory
# Note: We install the 'dev' dependencies for now to run tests, 
# but in strict prod you'd split this.
RUN pip install --user --no-cache-dir . ".[dev]"

# Stage 2: Runtime
FROM python:3.11-slim AS runtime

# Environment variables
# PYTHONPATH includes /app for packages.compliance and /app/apps/api for src package
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app:/app/apps/api

WORKDIR /app

# Install runtime libraries for LightGBM (libgomp1 is critical)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security (Fintech Requirement)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy installed python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Update PATH to include installed binaries
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy project source code
# We copy the specific apps and packages required
COPY apps/api ./apps/api
COPY packages ./packages
COPY data_catalog/processed/feature_registry.json ./data_catalog/processed/feature_registry.json

# Ownership change
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
