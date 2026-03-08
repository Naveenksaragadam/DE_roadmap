// Python for DE — Topics 6-11
export const pythonContent2 = {
  'python-de-6': {
    tutorial: {
      explanation: [
        'Python performance matters when processing millions of records. Vectorization uses numpy/pandas operations on entire arrays instead of Python loops — 10-100x faster. Memory profiling identifies leaks. multiprocessing bypasses the GIL for CPU-bound work; threading is for I/O-bound work.',
      ],
      codeExamples: [
        { description: 'Vectorization vs loops', code: `import numpy as np
import pandas as pd

# SLOW: Python loop — 100x slower
result = [x * 2 + 1 for x in df['value']]

# FAST: Vectorized — uses C under the hood
result = df['value'] * 2 + 1

# SLOW: df.apply() — row-at-a-time
df['upper'] = df['name'].apply(lambda x: x.upper())

# FAST: vectorized string ops
df['upper'] = df['name'].str.upper()

# Memory profiling
from memory_profiler import profile
@profile
def process_large_file():
    df = pd.read_csv("huge.csv")  # shows memory per line` },
      ],
      keyTakeaways: [
        'Vectorize first, parallelize second — vectorization gives the biggest speedup',
        'multiprocessing.Pool for CPU-bound: data transformations, hashing, parsing',
        'threading for I/O-bound: API calls, file reads, DB queries',
        'Use sys.getsizeof() and memory_profiler to track memory usage',
      ],
    },
    crashCourse: {
      summary: 'Vectorize > parallelize. Use numpy/pandas operations on arrays, not Python loops. multiprocessing for CPU, threading for I/O.',
      quickFacts: ['Vectorized ops: 10-100x faster than Python loops', 'GIL: only one thread runs Python at a time', 'multiprocessing: separate processes, bypasses GIL', 'threading: shared memory, blocked by GIL for CPU'],
      tips: ['Profile first: python -m cProfile script.py or line_profiler for per-line timing'],
    },
  },
  'python-de-7': {
    tutorial: {
      explanation: [
        'Modern Python packaging uses pyproject.toml (replaces setup.py). Virtual environments isolate dependencies per project. Poetry manages dependencies and lockfiles. pip-tools is a lighter alternative.',
      ],
      codeExamples: [
        { description: 'Project setup with pyproject.toml', code: `# pyproject.toml
[project]
name = "my-pipeline"
version = "1.0.0"
requires-python = ">=3.10"
dependencies = [
    "pandas>=2.0",
    "pyarrow>=14.0",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

# Virtual environment setup
# python -m venv .venv
# source .venv/bin/activate
# pip install -e ".[dev]"

# Poetry (alternative)
# poetry init
# poetry add pandas pyarrow pydantic
# poetry install` },
      ],
      keyTakeaways: [
        'pyproject.toml is the modern standard — replaces setup.py/setup.cfg',
        'Always use virtual environments — never install to system Python',
        'Pin dependencies in lockfiles (poetry.lock, requirements.txt) for reproducibility',
        'Use pip-compile (pip-tools) for simple projects, Poetry for complex ones',
      ],
    },
    crashCourse: {
      summary: 'pyproject.toml for config, virtual environments for isolation, Poetry or pip-tools for dependency management. Always pin versions in production.',
      quickFacts: ['python -m venv .venv: create isolated environment', 'pip install -e ".": editable install for development', 'poetry.lock / requirements.txt: pinned dependencies', 'pip-compile: generates pinned requirements from unpinned'],
      tips: ['Use python -m pip instead of just pip to ensure correct Python version'],
    },
  },
  'python-de-8': {
    tutorial: {
      explanation: [
        'Most data pipelines consume REST APIs. The requests library handles HTTP, but production pipelines need: pagination (cursor or offset-based), rate limiting (respect API limits), retry logic (exponential backoff), and timeout handling.',
      ],
      codeExamples: [
        { description: 'Production-grade API consumption', code: `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session():
    session = requests.Session()
    retry = Retry(total=3, backoff_factor=1,
                  status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    return session

def fetch_paginated(base_url, params=None):
    session = create_session()
    all_data = []
    url = base_url
    while url:
        resp = session.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        all_data.extend(data["results"])
        url = data.get("next")  # cursor-based pagination
        params = None  # params only needed for first request
    return all_data` },
      ],
      keyTakeaways: [
        'Always set timeouts — requests without timeout can hang forever',
        'Use Session objects for connection pooling and persistent settings',
        'Implement exponential backoff retry: 1s → 2s → 4s between retries',
        'Handle pagination: cursor-based (next URL) is more reliable than offset-based',
        'Respect rate limits: check X-RateLimit-Remaining headers',
      ],
    },
    crashCourse: {
      summary: 'Use requests.Session() with retries, timeouts, and pagination. Always handle rate limits. For concurrent APIs, use aiohttp.',
      quickFacts: ['session.get(url, timeout=30): always set timeouts', 'HTTPAdapter + Retry: automatic retry on failures', 'resp.raise_for_status(): raises on 4xx/5xx', 'Pagination: follow "next" link until None'],
      tips: ['Log every API request/response status for debugging failed pipeline runs'],
    },
  },
  'python-de-9': {
    tutorial: {
      explanation: [
        'Production pipelines need robust error handling. Custom exceptions categorize failures (retryable vs fatal). Structured logging with the logging module enables filtering, searching, and alerting. Never use print() in production code.',
      ],
      codeExamples: [
        { description: 'Structured error handling for pipelines', code: `import logging
import json

# Configure structured logging
logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    level=logging.INFO
)
logger = logging.getLogger("pipeline.etl")

# Custom exceptions
class PipelineError(Exception):
    """Base exception for pipeline errors"""
    pass

class RetryableError(PipelineError):
    """Transient error — safe to retry"""
    pass

class FatalError(PipelineError):
    """Permanent error — do not retry"""
    pass

def extract(source):
    try:
        data = fetch_from_source(source)
        logger.info("Extracted %d records from %s", len(data), source)
        return data
    except ConnectionError as e:
        raise RetryableError(f"Transient connection error: {e}")
    except ValueError as e:
        raise FatalError(f"Schema violation: {e}")` },
      ],
      keyTakeaways: [
        'Custom exceptions: RetryableError vs FatalError — different handling strategies',
        'logging levels: DEBUG (dev) → INFO (normal) → WARNING (recoverable) → ERROR (failures)',
        'Never catch bare Exception — always catch specific types',
        'Add context to every log: record count, source, duration, error details',
        'Use structured logging (JSON) for log aggregation systems (ELK, CloudWatch)',
      ],
    },
    crashCourse: {
      summary: 'Custom exceptions for retry vs fatal errors. Use logging module, not print(). Add context (counts, sources, durations) to every log message.',
      quickFacts: ['logging.getLogger(__name__): one logger per module', 'WARNING: something unexpected but recovered', 'ERROR: something failed, needs attention', 'CRITICAL: system is unusable'],
      tips: ['Set up log rotation with RotatingFileHandler to prevent disk fills'],
    },
  },
  'python-de-10': {
    tutorial: {
      explanation: [
        'Data validation ensures data quality before it enters your warehouse. Pandera validates Pandas DataFrames with schema definitions. Great Expectations provides a broader validation framework with expectations, checkpoints, and data docs.',
      ],
      codeExamples: [
        { description: 'Pandera schema validation', code: `import pandera as pa
from pandera import Column, Check, DataFrameSchema

order_schema = DataFrameSchema({
    "order_id": Column(int, Check.greater_than(0), unique=True),
    "amount": Column(float, Check.in_range(0.01, 100000)),
    "status": Column(str, Check.isin(["pending", "completed", "cancelled"])),
    "email": Column(str, Check.str_matches(r"^[\\w.-]+@[\\w.-]+\\.\\w+$"), nullable=True),
})

# Validates at runtime — raises SchemaError with details
validated_df = order_schema.validate(raw_df)

# Great Expectations approach
import great_expectations as gx
context = gx.get_context()
validator = context.sources.pandas_default.read_dataframe(raw_df)
validator.expect_column_values_to_be_unique("order_id")
validator.expect_column_values_to_be_between("amount", 0.01, 100000)` },
      ],
      keyTakeaways: [
        'Pandera: lightweight, Pandas-native, define schemas as code — great for pipeline steps',
        'Great Expectations: full framework with data docs, profiling, and CI/CD integration',
        'Validate at boundaries: after extraction (raw), after transformation (clean), before loading',
        'Data contracts: agree on schemas between producers and consumers — enforce automatically',
      ],
    },
    crashCourse: {
      summary: 'Pandera for lightweight DataFrame validation. Great Expectations for full validation framework. Validate at every pipeline boundary.',
      quickFacts: ['Pandera: schema-as-code for Pandas/Polars', 'Great Expectations: expectations + checkpoints + data docs', 'Validate after extract, after transform, before load', 'Schema-on-read: validate when consuming, not when storing'],
      tips: ['Start with Pandera for simplicity, graduate to Great Expectations for enterprise needs'],
    },
  },
  'python-de-11': {
    tutorial: {
      explanation: [
        'CLI tools let your team run pipelines with arguments. Click and Typer are the two main libraries. Typer (built on Click) uses type hints for automatic argument parsing — less boilerplate. Use them to create pipeline management interfaces with subcommands.',
      ],
      codeExamples: [
        { description: 'Building a pipeline CLI with Typer', code: `import typer
from datetime import date
from enum import Enum

app = typer.Typer(help="Data Pipeline CLI")

class Environment(str, Enum):
    dev = "dev"
    staging = "staging"
    prod = "prod"

@app.command()
def run(
    pipeline: str = typer.Argument(help="Pipeline name"),
    start_date: date = typer.Option(date.today(), help="Start date"),
    env: Environment = typer.Option(Environment.dev, help="Environment"),
    dry_run: bool = typer.Option(False, help="Preview without executing"),
):
    """Run a data pipeline for a date range."""
    typer.echo(f"Running {pipeline} in {env.value} from {start_date}")
    if not dry_run:
        execute_pipeline(pipeline, start_date, env.value)

@app.command()
def backfill(
    pipeline: str = typer.Argument(help="Pipeline name"),
    days: int = typer.Option(7, help="Days to backfill"),
):
    """Backfill a pipeline for N days."""
    for i in range(days):
        run_date = date.today() - timedelta(days=i)
        execute_pipeline(pipeline, run_date)

if __name__ == "__main__":
    app()
# Usage: python cli.py run orders --env prod --start-date 2024-01-01` },
      ],
      keyTakeaways: [
        'Typer: type hints → automatic CLI parsing, less code than Click',
        'Use subcommands: run, backfill, validate, test — one CLI for all pipeline operations',
        'Add --dry-run flag to every pipeline CLI — essential for safe testing',
        'Use Enum types for constrained choices (environment, pipeline names)',
      ],
    },
    crashCourse: {
      summary: 'Typer for modern CLIs with type hints. Include subcommands (run, backfill) and --dry-run flags. Click is the more established alternative.',
      quickFacts: ['Typer: uses type hints for argument parsing', 'typer.Argument: positional args', 'typer.Option: named/optional args', 'app.command(): registers subcommand'],
      tips: ['Always add --help automatically (Typer does this) and --dry-run for safety'],
    },
  },
};
