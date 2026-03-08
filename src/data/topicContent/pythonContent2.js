// Python for DE — Topics 6-11
export const pythonContent2 = {
  'python-de-6': {
    tutorial: {
      explanation: [
        'Processing 10 million records row-by-row is the easiest way to grind a pipeline to a halt. Python performance optimization centers around three main concepts: Vectorization, Multiprocessing, and Memory Profiling.',
        'Vectorization uses operations built in optimized C (NumPy/Pandas arrays) rather than pure python loops, yielding 10-100x speedups. Multiprocessing bypasses the Global Interpreter Lock (GIL) to execute CPU-bound work concurrently across multiple CPU cores.',
      ],
      codeExamples: [
        {
          description: 'Vectorization vs Parallel Multiprocessing',
          code: `import pandas as pd
import numpy as np
import concurrent.futures
import multiprocessing

# 1. Vectorization (Frictionless 100x Speedup)
df = pd.DataFrame({'value': np.random.randint(0, 100, 1000000)})

# SLOW: pure python row-by-row loop (df.apply is basically a hidden loop)
# df['result'] = df['value'].apply(lambda x: x * 2 + 1)

# FAST: Array Vectorization (pushes math to underlying C execution)
df['result'] = df['value'] * 2 + 1  # Instant execution

# 2. Parallelizing CPU-Heavy Tasks (Bypassing the GIL)
def expensive_cpu_task(data_chunk):
    # Simulate heavy parsing, hashing, or non-vectorizable math
    return [sum(i * i for i in range(10000)) for x in data_chunk]

def process_parallel(large_data_list):
    # Determine max available CPU cores 
    workers = multiprocessing.cpu_count()
    
    # Split data into chunks to distribute across core processes
    chunk_size = len(large_data_list) // workers
    chunks = [large_data_list[i:i + chunk_size] for i in range(0, len(large_data_list), chunk_size)]
    
    results = []
    # Spin up identical separate python processes for each chunk
    with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as executor:
        for output in executor.map(expensive_cpu_task, chunks):
            results.extend(output)
    return results`
        },
      ],
      keyTakeaways: [
        'Vectorize first, parallelize second. Vectorization is nearly free and requires no complex process synchronization.',
        'The GIL (Global Interpreter Lock) prevents multiple Python threads from executing Python bytecodes at once. Meaning standard `threading` does not speed up math/CPU work.',
        '`multiprocessing.Pool` or `concurrent.futures.ProcessPoolExecutor` spawn entirely new Python processes, each with their own GIL, enabling true parallel CPU crunching.',
        'If a data processing script crashes silently, it is almost certainly the Linux OOM (Out Of Memory) Killer shutting it down. Profile memory with `memory_profiler`.',
      ],
    },
    crashCourse: {
      summary: 'Never use df.apply() or for-loops on large data sets if a mathematical vectorized operator is available. Use ProcessPoolExecutor for CPU-heavy tasks to bypass the GIL.',
      quickFacts: [
        'Vectorization: Math on entire NumPy arrays simultaneously (10-100x faster)',
        'GIL: Global Interpreter Lock prevents parallel Python thread execution',
        'Multiprocessing: Separate processes, standalone Memory & GIL',
        'memory_profiler: Line-by-line RAM utilization CLI tool'
      ],
      tips: ['If you are orchestrating complex parallel chunks of Pandas DataFrames, just use Dask or PySpark instead of hand-rolling `multiprocessing` code.'],
    },
  },
  'python-de-7': {
    tutorial: {
      explanation: [
        'Reproducibility is the bedrock of modern Data Engineering. If a pipeline works on your Mac but fails on the production Airflow worker, you have a packaging and dependency problem.',
        '`requirements.txt` and `setup.py` are legacy constructs. Modern python uses `pyproject.toml` as the singular source of truth for packaging, and tools like `Poetry` or `pip-tools` to manage virtual environments and deterministically lock specific dependency versions.',
      ],
      codeExamples: [
        {
          description: 'Modern Pyproject.toml and Dependency Locking',
          code: `# 1. The Modern Configuration File: pyproject.toml
[project]
name = "data-lake-pipeline"
version = "1.0.0"
description = "Nightly ETL export to Snowflake"
requires-python = ">=3.10"

# Main dependencies for production
dependencies = [
    "pandas>=2.0.0",
    "pyarrow>=14.0.0",
    "boto3>=1.30.0",
    "snowflake-connector-python>=3.0.0"
]

[project.optional-dependencies]
# Dependencies ONLY needed for local development tests
dev = [
    "pytest>=7.4.0",
    "black>=23.0",
    "mypy>=1.5"
]

# 2. Virtual Environment Lifecycle (Standard venv & pip)
# $ python3 -m venv .venv              # Create isolated environment
# $ source .venv/bin/activate          # Activate it
# $ pip install -e ".[dev]"            # Install local package + dev dependencies eagerly

# 3. Best Practice: Poetry
# Poetry handles venvs and resolves dependency conflicts automatically.
# $ poetry init                        # Generates pyproject.toml
# $ poetry add pydantic                # Installs to venv and updates pyproject
# $ poetry lock                        # Freezes exact sub-dependency versions
# $ poetry install                     # Install everything perfectly in CI/CD`
        },
      ],
      keyTakeaways: [
        'Never `pip install` globally to your system python. Always create isolated Virtual Environments for every single project (`.venv`).',
        '`pyproject.toml` is the standardized replacement for `setup.py` and `setup.cfg`.',
        'A lockfile (`poetry.lock` or a compiled `requirements.txt`) ensures that passing CI/CD tests today guarantee the pipeline won\'t break tomorrow due to a sub-dependency updating unexpectedly.',
      ],
    },
    crashCourse: {
      summary: 'Use Virtual Environments religiously to isolate packages. Manage your project metadata in `pyproject.toml`. Freeze your specific dependency versions using a lockfile via Poetry or pip-tools.',
      quickFacts: [
        'python -m venv .venv : create a local isolated environment',
        'pip install -e "." : Editable install for the current directory modular code',
        'poetry.lock : File guaranteeing deterministic, exact dependency versions',
        'pyproject.toml : The unified modern python config file'
      ],
      tips: ['If your team isn\'t ready for the weight of Poetry, you can use `pip-compile` (from pip-tools) to generate a deeply version-locked requirements.txt from your pyproject.toml dependencies.'],
    },
  },
  'python-de-8': {
    tutorial: {
      explanation: [
        'Data extraction pipelines inevitably pull from external REST APIs (Salesforce, Stripe, Zendesk). A naive `requests.get()` will fail due to network hiccups, timeout, or hit rate limits, crashing the pipeline.',
        'Production grade API-consumption requires three features: Retry Logic (with exponential backoff 2s → 4s → 8s) to survive transient errors, explicit Timeouts to prevent hanging forever, and Token Bucket Rate-Limiters to actively restrict outbound requests.',
      ],
      codeExamples: [
        {
          description: 'Production Extractor: Retries, Timeouts, Rate Limits',
          code: `import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from threading import Lock

class APIDataExtractor:
    def __init__(self, base_url: str, requests_per_sec: float = 5.0):
        self.base_url = base_url
        self.rate = requests_per_sec
        self.last_call = 0.0
        self.lock = Lock()
        
        # 1. Mount a robust Session with automatic Exponential Backoff
        self.session = requests.Session()
        # Retry up to 5 times on connection drops or specific 500-level errors
        retries = Retry(total=5, backoff_factor=1.5, 
                        status_forcelist=[429, 500, 502, 503, 504])
        adapter = HTTPAdapter(max_retries=retries)
        self.session.mount("https://", adapter)
        
    def _enforce_rate_limit(self):
        # 2. Thread-safe rate limiter (token bucket style)
        with self.lock:
            elapsed = time.time() - self.last_call
            left_to_wait = (1.0 / self.rate) - elapsed
            if left_to_wait > 0:
                time.sleep(left_to_wait)
            self.last_call = time.time()

    def extract_paginated(self, endpoint: str):
        # 3. Robust Pagination Consumer
        all_data = []
        url = f"{self.base_url}/{endpoint}"
        
        while url:
            self._enforce_rate_limit()
            # 4. ALWAYS set a strict timeout. Without it, python can hang infinitely.
            resp = self.session.get(url, timeout=30)
            resp.raise_for_status() # Throw error if we get a 401 Unauthorized etc
            
            data = resp.json()
            all_data.extend(data.get("results", []))
            
            # Follow cursor-based pagination
            url = data.get("next_page_token")
            
        return all_data`
        },
      ],
      keyTakeaways: [
        'Never issue raw `requests.get()`. Always use a `requests.Session()` mounted with a custom `HTTPAdapter` that automatically executes retries and exponential backoff.',
        'If you do not specify a explicit `timeout=30`, a misconfigured API server can hold your connection hostage forever, completely hanging your Airflow worker node.',
        'Cursor-based pagination (where the API gives you the exact URL of the `next` page) is much safer and faster than offset-based pagination (`?page=20`).',
        'Actively rate limit your outbound requests `time.sleep()` to prevent getting banned with continuous `429 Too Many Requests` API errors.',
      ],
    },
    crashCourse: {
      summary: 'Data extraction APIs fail frequently. Build a resilient `requests.Session()` with an HTTPAdapter invoking exponential backoff rules. Enforce timeouts and throttle loops.',
      quickFacts: [
        'timeout=30 : Hard abort network waits after 30 seconds',
        'HTTPAdapter + Retry : Automates catching 502/503 errors and sleeping to retry',
        'resp.raise_for_status() : Immediately raise Exception on bad 4xx/5xx responses',
        'Cursor Pagination : Following explicit "next_url" links from payloads'
      ],
      tips: ['If an API returns a `Retry-After` header when issuing a 429, read it and sleep for exactly that long before retrying instead of blindly guessing.'],
    },
  },
  'python-de-9': {
    tutorial: {
      explanation: [
        'When a pipeline orchestrating millions of rows fails at 3 AM, a raw python traceback is useless. Production environments require Structured Error Handling and Structured JSON Logging.',
        'Never use `print()`. `print()` doesn\'t tell you the timestamp, the severity level (INFO vs ERROR), or the module. Furthermore, logs must be shipped to centralized aggregators like Datadog, ELK, or CloudWatch, which universally prefer parsing dictionary/JSON formatted logs.',
      ],
      codeExamples: [
        {
          description: 'Structured Logging and Custom Exceptions',
          code: `import logging
import json
from datetime import datetime

# 1. Custom Exceptions for Explicit Intent
class PipelineError(Exception):
    """Base exception"""
class RetryableTransientError(PipelineError):
    """Network drop, deadlocks - safe to retry the whole DAG"""
class FatalSchemaError(PipelineError):
    """Bad data format - DO NOT retry, alert a human"""

# 2. Configure Structured JSON Logging
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "module": record.module,
            "message": record.getMessage(),
            "pipeline_run_id": getattr(record, "run_id", "unknown")
        }
        # Dump stack trace if an Exception caused this log
        if record.exc_info:
            log_obj["traceback"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

logger = logging.getLogger("etl_payment_job")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# 3. Usage inside the pipeline
def process_payments(raw_payments):
    try:
        # Business logic here
        logger.info(f"Successfully processed batch of {len(raw_payments)}", 
                    extra={"run_id": "dag-5432"})
                    
    except KeyError as e:
        # Logs as FATAL with full traceback, then throws the Custom Exception
        logger.error(f"Missing critical field in payload: {e}")
        raise FatalSchemaError(f"Aborting batch due to bad schema: {e}")`
        },
      ],
      keyTakeaways: [
        'Use the `logging` module. Discard `print()` entirely. Define levels: `DEBUG` (local troubleshooting), `INFO` (milestones like batch complete), `WARNING` (transient failures recovered), `ERROR` (job failure).',
        'Structured Logging outputs logs as JSON strings instead of plain text, allowing centralized log aggregations to instantly make them searchable by attributes like `pipeline_run_id` or `level`.',
        'Deriving Custom Exceptions (e.g., `FatalSchemaError`) allows orchestrators like Airflow to cleanly decide if they should retry the task, or immediately hard-fail and page the on-call engineer.',
      ],
    },
    crashCourse: {
      summary: 'Replace print() with logging. Log everything structural as JSON. Use explicit Custom Exceptions to categorize if a pipeline failure is transient (retry) or fatal (alert).',
      quickFacts: [
        'logging.getLogger(__name__) : Initialize a module-specific logger',
        'INFO/ERROR/WARNING : Standard severity grading levels',
        'JSONFormatter : Ensures logs can be queried easily in Datadog or ELK',
        'Custom Exceptions : Classes inheriting from Exception for explicit error routing'
      ],
      tips: ['Pass your environment execution IDs (like an Airflow DAG RUN ID) as `extra={"run_id": ...}` into your logger so you can filter thousands of logs to a single execution trace.'],
    },
  },
  'python-de-10': {
    tutorial: {
      explanation: [
        'Garbage In, Garbage Out. Data Validation is the act of enforcing strict contracts on DataFrames before inserting them into a Data Warehouse. If a source system suddenly changes a `status` enumeration from "completed" to "COMP", it will silently corrupt downstream dashboards unless caught.',
        'Pandera natively integrates with Pandas/Polars to execute vectorized schema assertions aggressively inside the pipeline execution. Great Expectations provides a higher-level framework generating HTML Data Docs and complex cross-table constraints.',
      ],
      codeExamples: [
        {
          description: 'Vectorized DataFrame Validation with Pandera',
          code: `import pandas as pd
import pandera as pa
from pandera import Column, Check, DataFrameSchema

# 1. Define the Data Contract (Schema)
# Checks are vectorized and execute extraordinarily fast
transaction_schema = DataFrameSchema({
    # Column must exist, must be int, and must not have nulls
    "transaction_id": Column(int, Check.greater_than(0), nullable=False, unique=True),
    
    # Must be float, bounded between realistic thresholds
    "amount": Column(float, Check.in_range(0.01, 500000.00)),
    
    # Enum validation: catch silent schema drifts
    "status": Column(str, Check.isin(["pending", "settled", "failed"])),
    
    # Regex validation for messy string inputs
    "customer_email": Column(str, Check.str_matches(r"^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$"), nullable=True),
    
    # Custom business logic check
    "discount_applied": Column(float, nullable=True)
})

# 2. Applying the Contract to incoming data
def load_to_warehouse(df_raw: pd.DataFrame):
    try:
        # Validate data. Throws SchemaError instantly if ANY row violates the contract.
        df_clean = transaction_schema.validate(df_raw)
        
        # If we reach here, the data is guaranteed pristine
        print(f"Validated {len(df_clean)} records. Inserting into Snowflake...")
        
    except pa.errors.SchemaError as exc:
        # Intercept the violation to log exact row indices that failed the checks
        print(f"Data Quality Violation detected in column: {exc.schema.name}")
        print(f"Failing rows:\\n {exc.failure_cases}")
        raise`
        },
      ],
      keyTakeaways: [
        '`Pandera` uses a "Schema as Code" philosophy. Since it executes natively on Pandas/Polars primitives, validating a million rows takes fractions of a second.',
        '`Great Expectations` takes a "Testing framework" philosophy, allowing you to define Expected behaviors, run checkpoints, and auto-generate readable Data Quality HTML reports for business stakeholders.',
        'Implement validation directly after Extraction (checking source schema rules) and immediately before Loading (checking business logic transformations).',
      ],
    },
    crashCourse: {
      summary: 'Data Validation enforces contracts. Use Pandera for aggressive, fast DataFrame column/type/enum checking. Use Great Expectations for robust enterprise-wide data quality reporting.',
      quickFacts: [
        'Pandera Schema: Pythonic definitions enforcing Dtypes, bounds, and nullability',
        'Check.isin() : Validates strict enumerations mapping',
        'Great Expectations: Broad tool generating Data Quality HTML "Data Docs"',
        'Schema-on-read : Validate immediately after loading data from API/CSV'
      ],
      tips: ['If a data pipeline has no validation, it is not production-ready. Always at least enforce strict Not-Null uniqueness on Primary Keys.'],
    },
  },
  'python-de-11': {
    tutorial: {
      explanation: [
        'Pipelines frequently require manual intervention: executing ad-hoc backfills, dry-running transformations, or triggering specific modular exports. Wrapping your python module in a Command Line Interface (CLI) handles this elegantly.',
        '`Typer` (built heavily on `Click`) is the modern standard for this. It utilizes python Type Hints to automatically parse flags, validate inputs, generate `--help` documentation, and dispatch subcommands with practically zero boilerplate code.',
      ],
      codeExamples: [
        {
          description: 'Building a Subcommand CLI with Typer',
          code: `import typer
from typing import Optional
from datetime import date, timedelta
from enum import Enum

# Instantiate the CLI App container
app = typer.Typer(help="Core Sales Data Pipeline Execution CLI")

# Enums are automatically converted to restricted CLI dropdown choices
class Environment(str, Enum):
    dev = "dev"
    staging = "staging"
    prod = "prod"

# 1. Subcommand: Run Standard Job
@app.command("run")
def execute_pipeline(
    # Typer uses Type Hints to automatically require a String arguments
    table_name: str = typer.Argument(..., help="Target DW table to process"),
    
    # Options automatically become flags (e.g. --env prod)
    env: Environment = typer.Option(Environment.dev, help="Execution target"),
    target_date: date = typer.Option(date.today(), help="Format: YYYY-MM-DD"),
    
    # Booleans automatically become switches (e.g. --dry-run)
    dry_run: bool = typer.Option(False, "--dry-run", help="Log output without DB writes")
):
    """Execute the standard daily transformation for a specified table."""
    typer.echo(f"Initializing {table_name} pipeline for {target_date} on {env.value}")
    if dry_run:
        typer.secho("DRY RUN ACTIVE: No data will be written", fg=typer.colors.YELLOW)
        return
    # _execute_core_logic(table_name, target_date, env)

# 2. Subcommand: Mass Backfill
@app.command("backfill")
def mass_backfill(
    table_name: str,
    days_back: int = typer.Option(7, help="Number of historical days to process")
):
    """Iteratively execute the pipeline bridging historical gaps."""
    for i in range(days_back):
        historical_date = date.today() - timedelta(days=i)
        typer.echo(f"Backfilling {historical_date}...")

if __name__ == "__main__":
    # Hooks the CLI so it can execute when run via \`python cli.py\`
    app()
    
# Example CLI usages from Terminal:
# $ python etl_cli.py --help
# $ python etl_cli.py run dim_users --env prod --dry-run
# $ python etl_cli.py backfill fct_sales --days-back 30`
        },
      ],
      keyTakeaways: [
        'CLI\'s turn fragile scripts into robust reusable tools. Operations teams can invoke your `backfill` command with `--days-back 30` without ever needing to read or edit the underlying python code.',
        '`Typer` replaces standard `argparse`. Since it reads standard Python Typehints (`variable: int`), you get automatic type casting, input validation, and CLI `--help` generation for free.',
        'Always implement a `--dry-run` flag in data pipelines that logs the planned destructive/write actions without actually executing SQL `INSERT/UPDATE`s to the database.',
      ],
    },
    crashCourse: {
      summary: 'Wrap pipeline modules in robust CLIs using Typer/Click. Leverage subcommands (run, backfill, clear) and always implement a --dry-run switch for safe manual testing.',
      quickFacts: [
        'Typer : Constructs CLIs by analyzing typehints',
        '@app.command() : Register a function as a distinct CLI subcommand',
        'typer.Option : Defines optional --flags',
        '--dry-run : Crucial safety mechanism for any pipeline'
      ],
      tips: ['If compiling pipelines into containerized Docker images, setting your Typer app as the `ENTRYPOINT` makes running ad-hoc pipeline tasks drastically more intuitive.'],
    },
  },
};
