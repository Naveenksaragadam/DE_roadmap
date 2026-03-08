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
  'python-de-6': {
    tutorial: {
      explanation: [
        'Performance optimization in Python involves understanding vectorization, memory profiling, and choosing the right concurrency model (multiprocessing vs threading).',
        'Because of the Global Interpreter Lock (GIL), threading in Python is only useful for I/O-bound tasks (like waiting on network responses). For CPU-bound tasks (complex calculations, parsing huge files), you must use multiprocessing to utilize multiple CPU cores.',
        'Vectorization involves bypassing Python loops entirely and letting underlying C libraries (like NumPy/Pandas native methods) execute operations in bulk.'
      ],
      codeExamples: [
        { description: 'Multiprocessing vs Threading', code: `import concurrent.futures
import time

def cpu_bound_task(data_chunk):
    # e.g., heavy math, complex JSON parsing
    return sum(i * i for i in data_chunk)

def process_heavy_data(data_chunks):
    # Use ProcessPool for CPU-bound tasks (bypasses GIL)
    with concurrent.futures.ProcessPoolExecutor() as executor:
        results = list(executor.map(cpu_bound_task, data_chunks))
    return results

def io_bound_task(url):
    # e.g., downloading files, API calls
    import requests
    return requests.get(url).status_code

def process_api_calls(urls):
    # Use ThreadPool for I/O-bound tasks
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(io_bound_task, urls))
    return results` },
      ],
      keyTakeaways: [
        'Stop using standard `for` loops on large lists of numbers; use numpy arrays or pandas Series operations instead (vectorization).',
        'Threading is for I/O tasks. Multiprocessing is for CPU tasks. Using Threading for CPU tasks actually makes Python slower due to GIL contention.',
        'Use the `memory_profiler` library (`@profile` decorator) to find exactly which lines are eating up RAM in your pipeline.',
      ],
    },
    crashCourse: {
      summary: 'Optimize Python data pipelines by vectorizing math/string operations, using ThreadPools for API calls, and ProcessPools for heavy parsing.',
      quickFacts: [
        'GIL: Global Interpreter Lock. Prevents multiple Python threads from executing Python bytecodes at once.',
        '`concurrent.futures`: The modern way to handle multi-threading/processing in standard library.',
        'Vectorization: Submitting a single array operation to C instead of looping in Python.',
      ],
      tips: [
        'When using `multiprocessing`, chunk your data so the IPC (Inter-Process Communication) overhead doesn\'t ruin your performance gains.',
      ],
    },
  },
  'python-de-7': {
    tutorial: {
      explanation: [
        'Proper packaging ensures your data pipelines are reproducible across environments (Dev vs Prod, Mac vs Linux). The standard modern approach replaces random `requirements.txt` files with `pyproject.toml` using tools like Poetry or modern pip.',
        'Virtual environments prevent dependency hell (e.g. Airflow needs SQLAlchemy 1.4, but your custom script needs 2.0). Poetry handles dependency resolution, locking, and virtual environments all in one tool.',
      ],
      codeExamples: [
        { description: 'Modern Python Packaging (pyproject.toml)', code: `# Example pyproject.toml configuration using Poetry
[tool.poetry]
name = "my-data-pipeline"
version = "0.1.0"
description = "ETL pipeline for customer data"
authors = ["Data Engineer <de@company.com>"]

[tool.poetry.dependencies]
python = "^3.10"
pandas = "^2.0.0"
sqlalchemy = "^2.0.15"
pydantic = "^2.0.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.3.1"
black = "^23.3.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"` },
      ],
      keyTakeaways: [
        '`pyproject.toml` is the PEP 518 standard. It replaces `setup.py` and `requirements.txt`.',
        'Requirements lock files (`poetry.lock` or `Pipfile.lock`) guarantee that Prod installs the exact same sub-dependency versions that you tested in Dev.',
        'Avoid installing global pip packages. Every project should have an isolated `venv`.',
      ],
    },
    crashCourse: {
      summary: 'Use Poetry and `pyproject.toml` to manage dependencies cleanly. Lockfiles guarantee deterministic builds across environments.',
      quickFacts: [
        '`pyproject.toml`: The configuration file containing project metadata and dependencies.',
        'Lockfile: Contains the exact resolved hashes and versions of every recursive dependency.',
        'Virtual Environment (`venv`): An isolated python binary and `site-packages` directory.',
      ],
      tips: [
        'In Dockerfiles, you can use `pip install -r <(poetry export -f requirements.txt)` to install dependencies without installing Poetry itself in the production container.',
      ],
    },
  },
  'python-de-8': {
    tutorial: {
      explanation: [
        'Data Engineers frequently extract data from REST APIs. Because APIs fail, rate-limit, and paginate, your extraction code must handle these gracefully. Using `requests` with robust retry logic (via `urllib3` or `tenacity`) is essential.',
        'Pagination implies fetching multiple "pages" of records. Rate limiting requires tracking your request speed or responding dynamically to `HTTP 429 Too Many Requests`.',
      ],
      codeExamples: [
        { description: 'Robust API Extraction with Retries', code: `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def get_robust_session():
    session = requests.Session()
    # Retry on 429 (Rate Limit), 500, 502, 503, 504
    retry_strategy = Retry(
        total=5,
        backoff_factor=1, # 1s, 2s, 4s, 8s, 16s...
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

def fetch_all_pages(base_url, endpoint):
    session = get_robust_session()
    all_records = []
    url = f"{base_url}/{endpoint}"
    
    while url:
        response = session.get(url)
        response.raise_for_status()
        data = response.json()
        
        all_records.extend(data.get('results', []))
        
        # Follow the 'next' URL link typically provided in APIs
        url = data.get('next') 
        
    return all_records` },
      ],
      keyTakeaways: [
        'Never write raw `requests.get()` without wrapping it in retry logic for production pipelines. Network blips happen constantly.',
        'Use Exponential Backoff. If an API is overwhelmed, spamming it instantly will just get you blocked. Wait 1 second, then 2, then 4.',
        '`requests.Session()` reuses the underlying TCP connection, speeding up multiple requests significantly.',
      ],
    },
    crashCourse: {
      summary: 'API ingestion requires handling pagination and temporary failures. Use `requests.Session` with `urllib3.util.retry` to automatically handle HTTP 429s and 5xx errors with exponential backoff.',
      quickFacts: [
        'HTTP 429: Too Many Requests. You are rate-limited.',
        'Exponential Backoff: Doubling the wait time between retry attempts.',
        'TCP Connection Pooling: Achieved by using `requests.Session()`.',
      ],
      tips: [
        'If an API returns a `Retry-After` header during a 429, `urllib3` will automatically respect it if you configure the Retry adapter correctly!',
      ],
    },
  },
  'python-de-9': {
    tutorial: {
      explanation: [
        'Silent failures corrupt data lakes. A good DE pipeline explicitly defines custom exceptions, logs structured error metadata, and raises alerts rather than quietly skipping bad data.',
        'Using the built-in `logging` module properly (with formatters and handlers) instead of `print()` ensures your Airflow/CloudWatch logs are searchable. Structured JSON logging is becoming the industry standard so tools like Datadog/ELK can parse the logs.',
      ],
      codeExamples: [
        { description: 'Custom Exceptions and Logging', code: `import logging
import json

# Setup structured console logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("sales_pipeline")

# Custom Exceptions categorize failures properly!
class PipelineError(Exception): pass
class DataQualityError(PipelineError): pass
class APIConnectionError(PipelineError): pass

def process_file(file_path):
    try:
        # simulate reading
        if "corrupt" in file_path:
            raise DataQualityError(f"Missing mandatory 'user_id' in {file_path}")
            
    except DataQualityError as e:
        # We might log this but NOT stop the whole pipeline
        logger.error(json.dumps({
            "event": "data_quality_failure",
            "file": file_path,
            "error": str(e)
        }))
        # Optional: send to Dead Letter Queue (DLQ)
    except Exception as e:
        # Unexpected errors SHOULD stop the pipeline
        logger.critical(f"Unexpected crash processing {file_path}: {e}")
        raise` },
      ],
      keyTakeaways: [
        'Create custom Exception classes spanning from `DataQualityError` to `DatabaseTimeout`. It makes `try/except` blocks much cleaner than catching base `Exception`.',
        'Use Structured Logging (JSON strings in log messages) so massive log aggregators can filter errors by exact machine, file, or job_id.',
        'Handle anticipated errors (like one bad row) by sending it to a Dead Letter file, but raise unexpected errors so the pipeline genuinely fails.',
      ],
    },
    crashCourse: {
      summary: 'Avoid `print()`; use `logging`. Group related pipeline failures using custom Exception classes. Use JSON formatted logging so downstream monitoring tools can parse error metadata.',
      quickFacts: [
        '`logging.getLogger(__name__)`: Standard way to instantiate a logger per file.',
        'Log Levels: DEBUG, INFO, WARNING, ERROR, CRITICAL.',
        'Dead Letter Queue (DLQ): A destination (file/table) for rows that failed validation, allowing the pipeline to continue.',
      ],
      tips: [
        'Call `logger.exception("message")` inside an `except` block. It automatically attaches the full stack trace to the log message!',
      ],
    },
  },
  'python-de-10': {
    tutorial: {
      explanation: [
        'Data Validation pipelines ensure that "Trash" doesn\'t get loaded into your warehouse (Garbage In, Garbage Out). Tools like Pandera (DataFrame validation) or Great Expectations (enterprise data testing) define explicit schemas and checks.',
        'These tools check for Nulls in strictly non-null columns, value ranges (age > 0), referential integrity, and correct string formats via regex.',
      ],
      codeExamples: [
        { description: 'DataFrame Validation with Pandera', code: `import pandas as pd
import pandera as pa
from pandera import Column, Check

# Define a strict schema for your incoming CSV/DataFrame
sales_schema = pa.DataFrameSchema({
    "transaction_id": Column(int, unique=True),
    "user_id": Column(int, Check.greater_than(0)),
    "amount": Column(float, Check.ge(0.0)),
    "status": Column(str, Check.isin(["completed", "pending", "failed"])),
    "email": Column(str, Check.str_matches(r"^\\S+@\\S+\\.\\S+$"), nullable=True)
})

# Incoming data
df = pd.DataFrame({
    "transaction_id": [1, 2],
    "user_id": [101, -5], # -5 will fail!
    "amount": [50.5, 20.0],
    "status": ["completed", "unknown"], # 'unknown' will fail!
    "email": ["test@test.com", None]
})

try:
    validated_df = sales_schema.validate(df, lazy=True)
except pa.errors.SchemaErrors as err:
    print("Data Validation Failed! Issues found:")
    print(err.failure_cases)` },
      ],
      keyTakeaways: [
        'Pandera is lightweight and perfect for in-memory Python scripts evaluating Pandas/Polars dataframes.',
        'Great Expectations is a heavy-duty framework perfect for scanning massive SQL tables dynamically in Airflow/dbt prior to moving data to Prod.',
        'Using `lazy=True` in Pandera collects ALL errors before crashing, rather than stopping at the very first bad row.',
      ],
    },
    crashCourse: {
      summary: 'Validate incoming data strictly to prevent data warehouse corruption. Use Pandera for quick DataFrame checks and Great Expectations for massive warehouse/lake validation.',
      quickFacts: [
        'Schema Validation: Checking types, ranges, uniqueness, and regex matching.',
        'Pandera: Fast, Pythonic DataFrame validation (Pandas/Polars/PySpark).',
        'Great Expectations: Declarative JSON-based data testing for large platforms.',
      ],
      tips: [
        'Run your data validation *after* generic extraction but *before* transformation/loading. Halt the pipeline if the source schema drifted.',
      ],
    },
  },
  'python-de-11': {
    tutorial: {
      explanation: [
        'Data Engineers write a lot of ad-hoc scripts to backfill data, trigger jobs, or clean buckets. Turning these scripts into proper Command Line Interfaces (CLIs) makes them reusable across the team without hardcoding variables.',
        'The `Click` library or its modern wrapper `Typer` (by the creator of FastAPI) uses Python Type Hints to automatically generate CLI arguments, options, and help menus.',
      ],
      codeExamples: [
        { description: 'Building a Pipeline CLI with Typer', code: `import typer
from datetime import datetime
from typing import Optional

app = typer.Typer(help="Data Engineering Pipeline CLI")

@app.command()
def backfill(
    table: str = typer.Argument(..., help="The target warehouse table"),
    start_date: datetime = typer.Option(..., "--start", formats=["%Y-%m-%d"]),
    end_date: datetime = typer.Option(..., "--end", formats=["%Y-%m-%d"]),
    force: bool = typer.Option(False, "--force", "-f", help="Overwrite existing data")
):
    """
    Run a historical backfill for a specific table.
    """
    typer.echo(f"Starting backfill for {table}")
    typer.echo(f"Range: {start_date.date()} to {end_date.date()}")
    if force:
        typer.secho("FORCE MODE ACTIVE: Overwriting data!", fg=typer.colors.RED)
    
    # run_backfill(table, start_date, end_date, force)

if __name__ == "__main__":
    app()

# Using it in terminal:
# python cli.py backfill users --start 2024-01-01 --end 2024-02-01 -f` },
      ],
      keyTakeaways: [
        '`argparse` is standard but clunky. `Click` and `Typer` make extremely professional CLIs with colorized text and automatic `--help`.',
        'A unified CLI repository (`mycompany-data-cli`) is a great way to consolidate random scripts into a single organized tool installed on dev laptops.',
        'Always include dry-run modes (`--dry-run`) in destructive CLI commands so users can verify what will be deleted or inserted before running.',
      ],
    },
    crashCourse: {
      summary: 'Convert your utility scripts into professional CLIs using `Typer` or `Click`. Expose arguments cleanly so other team members (and CI/CD pipelines) can execute your code safely.',
      quickFacts: [
        'Typer: Modern CLI library based on Python Type Hints.',
        'Argument: Mandatory input (e.g., table name).',
        'Option: Optional flags, usually boolean or with defaults (e.g., `--dry-run`).',
      ],
      tips: [
        'Use Type Hints natively in Typer. If you hint `date: datetime`, Typer automatically parses "2024-01-01" strings into python Datetime objects for you!',
      ],
    },
  },
};
