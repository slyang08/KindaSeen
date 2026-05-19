FROM python:3.12-slim

WORKDIR /app

# Create non-root user
RUN adduser --disabled-password --gecos "" appuser

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Switch to non-root user
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]