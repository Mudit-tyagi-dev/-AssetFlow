# Stage 1: Build dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system compilation packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install python dependencies to user directory to preserve size
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final minimal runtime image
FROM python:3.11-slim AS runner

WORKDIR /app

# Install runtime PostgreSQL client library
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder stage
COPY --from=builder /root/.local /root/.local
COPY . .

# Setup environment variables
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Expose FastAPI server port
EXPOSE 8000

# Run as non-root user for production security
RUN useradd -u 1000 -m appuser && chown -R appuser:appuser /app
USER appuser

# Run server on all interfaces
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
