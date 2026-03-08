// Python for Data Engineering — Topic Deep-Dive Content
export const pythonContent = {
  'python-de-0': {
    tutorial: {
      explanation: [
        'Pandas is the standard for data manipulation but struggles with large datasets (>1GB). Polars is a newer alternative written in Rust that is 10-50x faster and uses lazy evaluation like Spark. For DE, know both — Pandas for legacy codebases, Polars for new high-performance pipelines.',
        'Key Pandas operations: read_csv/parquet, filter with .loc/.query(), transform with .apply()/.assign(), aggregate with .groupby(), merge/join with .merge(). Always prefer vectorized operations over .apply() — they use optimized C/numpy under the hood.',
      ],
      codeExamples: [
        { description: 'Pandas vs Polars comparison', code: `# Pandas
import pandas as pd
df = pd.read_parquet("events.parquet")
result = (df[df['status'] == 'active']
    .groupby('user_id')['amount']
    .sum()
    .reset_index()
    .sort_values('amount', ascending=False))

# Polars (10-50x faster)
import polars as pl
result = (pl.scan_parquet("events.parquet")  # lazy!
    .filter(pl.col("status") == "active")
    .group_by("user_id")
    .agg(pl.col("amount").sum())
    .sort("amount", descending=True)
    .collect())  # execution happens here` },
      ],
      keyTakeaways: [
        'Pandas: great for < 1GB, mature ecosystem, Jupyter-friendly',
        'Polars: 10-50x faster, lazy evaluation, better memory usage, no GIL issues',
        'Never use df.apply() for row-wise ops — use vectorized .str, .dt, arithmetic',
        'For very large data (>10GB): use PySpark or Dask instead',
      ],
    },
    crashCourse: {
      summary: 'Pandas for < 1GB interactive work, Polars for high-performance processing. Vectorize operations, avoid .apply(). For >10GB, use PySpark.',
      quickFacts: ['pd.read_parquet() > pd.read_csv() for performance', 'Polars uses lazy evaluation — collect() triggers execution', '.loc for label-based indexing, .iloc for position-based', 'groupby().agg() for multi-column aggregations'],
      tips: ['Profile memory with df.memory_usage(deep=True) before scaling decisions'],
    },
  },
  'python-de-1': {
    tutorial: {
      explanation: [
        'Data engineers work with multiple file formats daily. Parquet (columnar, compressed, schema) is the DE standard. Avro (row-based, schema evolution) is common in Kafka/streaming. ORC is like Parquet but Hive-optimized. JSON/CSV for interchange but inefficient for analytics.',
        'Key decisions: Use Parquet for analytical workloads (column pruning). Use Avro for streaming/Kafka (fast serialization, schema registry). Use CSV/JSON only for external APIs and human-readable exports.',
      ],
      codeExamples: [
        { description: 'Reading and writing different formats', code: `import pandas as pd
import pyarrow.parquet as pq
import json

# Parquet — the DE standard
df = pd.read_parquet("data.parquet", columns=["id", "amount"])  # column pruning!
df.to_parquet("output.parquet", compression="snappy", index=False)

# Read specific row groups for large files
pf = pq.ParquetFile("large.parquet")
for batch in pf.iter_batches(batch_size=10000):
    chunk = batch.to_pandas()
    process(chunk)

# JSON Lines (one JSON object per line — great for streaming)
with open("events.jsonl") as f:
    for line in f:  # memory efficient — one line at a time
        event = json.loads(line)
        process(event)` },
      ],
      keyTakeaways: [
        'Parquet: columnar, compressed, schema-embedded — always the default for analytics',
        'Avro: row-based, fast serialization — ideal for Kafka and streaming',
        'CSV: human readable but no types, no compression — avoid for production pipelines',
        'JSON Lines (.jsonl): one object per line — easy to stream and parallelize',
        'Always use compression: Snappy (fast) for Parquet, Gzip (smaller) for cold storage',
      ],
    },
    crashCourse: {
      summary: 'Parquet for analytics (columnar, compressed). Avro for streaming (row-based, schema evolution). CSV/JSON for interchange only. Always compress.',
      quickFacts: ['Parquet: columnar, Snappy compression, ~10x smaller than CSV', 'Avro: row-based, schema in header, Kafka standard', 'ORC: Hive-optimized columnar (similar to Parquet)', 'JSON Lines: one JSON per line — streamable'],
      tips: ['Specify columns= when reading Parquet — column pruning is free performance'],
    },
  },
  'python-de-2': {
    tutorial: {
      explanation: [
        'Python OOP enables building maintainable, reusable pipeline components. Classes encapsulate ETL logic. Decorators add cross-cutting concerns (logging, retries, timing). Context managers ensure cleanup. Generators enable memory-efficient processing.',
        'In DE, you use classes for pipeline steps, decorators for monitoring/retries, context managers for DB connections and file handles, and generators for streaming large datasets without loading everything into memory.',
      ],
      codeExamples: [
        { description: 'DE-focused OOP patterns', code: `from functools import wraps
import time, logging

# Decorator for retrying failed pipeline steps
def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logging.warning(f"Attempt {attempt+1} failed: {e}")
                    if attempt < max_attempts - 1:
                        time.sleep(delay * (2 ** attempt))  # exponential backoff
                    else:
                        raise
        return wrapper
    return decorator

# Context manager for DB connections
class DatabaseConnection:
    def __init__(self, conn_string):
        self.conn_string = conn_string
    def __enter__(self):
        self.conn = create_connection(self.conn_string)
        return self.conn
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()

# Generator for streaming large files
def read_chunks(filepath, chunk_size=10000):
    with open(filepath) as f:
        chunk = []
        for line in f:
            chunk.append(line)
            if len(chunk) >= chunk_size:
                yield chunk
                chunk = []
        if chunk:
            yield chunk` },
      ],
      keyTakeaways: [
        'Decorators: @retry, @timer, @log — add behavior without modifying function code',
        'Context managers: with statement guarantees cleanup (DB connections, file handles, locks)',
        'Generators: yield produces values lazily — O(1) memory for processing large streams',
        '@wraps(func): preserves original function name/docstring in decorators — always use it',
      ],
    },
    crashCourse: {
      summary: 'Classes for pipeline components, decorators for cross-cutting concerns, context managers for resource cleanup, generators for memory-efficient streaming.',
      quickFacts: ['@decorator syntax = syntactic sugar for func = decorator(func)', 'with statement calls __enter__ then __exit__ (even on error)', 'yield pauses function, produces value, resumes on next()', '@wraps preserves function metadata through decoration'],
      tips: ['Use contextlib.contextmanager for simple context managers without writing a full class'],
    },
  },
  'python-de-3': {
    tutorial: {
      explanation: [
        'Async Python enables concurrent I/O operations — perfect for pipelines that call multiple APIs, databases, or services simultaneously. asyncio is the standard library; aiohttp is the async HTTP client.',
        'Key concept: async functions don\'t run in parallel (Python GIL prevents true parallelism for CPU-bound work). They run concurrently — while one waits for I/O (network, disk), others execute. This is ideal for I/O-bound DE workloads.',
      ],
      codeExamples: [
        { description: 'Concurrent API calls with asyncio', code: `import asyncio
import aiohttp

async def fetch_data(session, url):
    async with session.get(url) as response:
        return await response.json()

async def fetch_all_endpoints(base_url, endpoints):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_data(session, f"{base_url}/{ep}") for ep in endpoints]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in results if not isinstance(r, Exception)]

# Run: fetches all endpoints concurrently (not sequentially!)
endpoints = ["users", "orders", "products", "inventory"]
data = asyncio.run(fetch_all_endpoints("https://api.example.com", endpoints))
# 4 API calls in ~1 request time instead of 4x` },
      ],
      keyTakeaways: [
        'async/await is for I/O-bound concurrency, not CPU-bound parallelism',
        'asyncio.gather() runs multiple coroutines concurrently — huge speedup for API calls',
        'Use aiohttp for async HTTP, asyncpg for async PostgreSQL, aioboto3 for async AWS',
        'For CPU-bound work: use multiprocessing or ProcessPoolExecutor instead',
      ],
    },
    crashCourse: {
      summary: 'async/await enables concurrent I/O (APIs, DBs). asyncio.gather() runs multiple coroutines at once. Not for CPU-bound work — use multiprocessing for that.',
      quickFacts: ['async def: declares coroutine', 'await: yields control while waiting for I/O', 'asyncio.gather(): run multiple tasks concurrently', 'asyncio.run(): entry point for async code'],
      tips: ['Profile whether your bottleneck is I/O (→ asyncio) or CPU (→ multiprocessing)'],
    },
  },
  'python-de-4': {
    tutorial: {
      explanation: [
        'Testing data pipelines is non-negotiable for production systems. pytest is the standard framework — use fixtures for test setup, parametrize for multiple test cases, and mock for isolating external dependencies (APIs, databases).',
        'DE-specific testing: test transformations with known input→output pairs, test schema validation, test edge cases (empty data, nulls, duplicates), and test idempotency (running twice produces same result).',
      ],
      codeExamples: [
        { description: 'Testing a data pipeline step', code: `import pytest
from unittest.mock import patch, MagicMock
from pipeline import transform_orders

@pytest.fixture
def sample_orders():
    return [
        {"id": 1, "amount": 100, "status": "completed"},
        {"id": 2, "amount": 0, "status": "cancelled"},
        {"id": 3, "amount": 50, "status": "completed"},
    ]

def test_transform_filters_cancelled(sample_orders):
    result = transform_orders(sample_orders)
    assert len(result) == 2
    assert all(r["status"] == "completed" for r in result)

def test_transform_handles_empty():
    assert transform_orders([]) == []

@pytest.mark.parametrize("amount,expected", [(100, True), (0, False), (-1, False)])
def test_is_valid_amount(amount, expected):
    assert is_valid_amount(amount) == expected

@patch("pipeline.fetch_from_api")
def test_extract_with_mock_api(mock_fetch):
    mock_fetch.return_value = [{"id": 1, "name": "test"}]
    result = extract_data()
    assert len(result) == 1
    mock_fetch.assert_called_once()` },
      ],
      keyTakeaways: [
        'pytest fixtures: reusable test setup, scoped (function/module/session)',
        '@pytest.mark.parametrize: run same test with multiple inputs — DRY tests',
        'unittest.mock.patch: replace external calls with controlled responses',
        'Test idempotency: run transformation twice, assert same result',
        'Test edge cases: empty input, nulls, duplicates, schema violations',
      ],
    },
    crashCourse: {
      summary: 'pytest for test framework, fixtures for setup, parametrize for multiple cases, mock for isolating external dependencies. Always test transformations, schemas, and edge cases.',
      quickFacts: ['@pytest.fixture: reusable test data/setup', '@pytest.mark.parametrize: multiple test cases in one function', '@patch: mock external dependencies', 'conftest.py: shared fixtures across test files'],
      tips: ['Run pytest with -v --tb=short for concise output, --cov for coverage reports'],
    },
  },
  'python-de-5': {
    tutorial: {
      explanation: [
        'Type hints and Pydantic enforce data contracts at the code level. Type hints document expected types; Pydantic validates them at runtime. This catches schema mismatches early — before bad data flows through your pipeline.',
        'In DE, use Pydantic models to validate API responses, config files, and data records. Use dataclasses for internal data transfer objects.',
      ],
      codeExamples: [
        { description: 'Pydantic for data validation', code: `from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

class OrderEvent(BaseModel):
    order_id: int
    customer_id: int
    amount: float
    currency: str = "USD"
    created_at: datetime
    discount: Optional[float] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("amount must be positive")
        return round(v, 2)

# Validates at runtime — catches bad data immediately
event = OrderEvent(order_id=1, customer_id=42, amount=99.99, created_at="2024-01-15T10:30:00")

# This raises ValidationError with clear message
# OrderEvent(order_id="abc", customer_id=42, amount=-10, created_at="bad")` },
      ],
      keyTakeaways: [
        'Type hints: documentation + IDE support; Pydantic: runtime validation',
        'Pydantic BaseModel validates types, converts compatible values, raises clear errors',
        'Use field_validator for custom business logic (positive amounts, valid domains)',
        'dataclasses: lightweight containers without validation; Pydantic: full validation',
      ],
    },
    crashCourse: {
      summary: 'Type hints document expectations, Pydantic validates at runtime. Use Pydantic for API responses and data records, dataclasses for internal containers.',
      quickFacts: ['BaseModel: auto-validates types on instantiation', 'field_validator: custom validation logic', 'Optional[Type]: None-able fields', 'model_validate(dict): parse dict to model'],
      tips: ['Pydantic v2 is 5-50x faster than v1 — always use v2 for new projects'],
    },
  },
};
