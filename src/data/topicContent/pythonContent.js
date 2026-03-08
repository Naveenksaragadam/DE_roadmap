// Python for Data Engineering — Topic Deep-Dive Content
export const pythonContent = {
  'python-de-0': {
    tutorial: {
      explanation: [
        'Pandas is the universal standard for interactive data analysis, cleaning, and preprocessing. However, for memory constraints or very large datasets (>1GB), it hits a wall. This is where Polars shines. Polars is a newer DataFrame library written in Rust that utilizes lazy evaluation (building an execution plan before running), similar to Spark. It\'s often 10-50x faster and sidesteps Python\'s Global Interpreter Lock (GIL).',
        'As a modern Data Engineer, you must know both. Use Pandas to maintain legacy code or for small ad-hoc analyses. Use Polars for new, high-performance local or single-node data pipelines.',
      ],
      codeExamples: [
        {
          description: 'Pandas vs Polars Data Processing Comparison',
          code: `# Pandas (Eager Execution)
import pandas as pd

df = pd.read_parquet("large_events.parquet")
# Operations execute immediately, creating intermediate copies in memory
result_pd = (df[df['status'] == 'active']
    .groupby('user_id')['amount']
    .sum()
    .reset_index()
    .sort_values('amount', ascending=False))

# Polars (Lazy Execution - 10-50x faster, less memory)
import polars as pl

# scan_parquet defers execution and only loads needed columns/rows
result_pl = (pl.scan_parquet("large_events.parquet")
    .filter(pl.col("status") == "active")
    .group_by("user_id")
    .agg(pl.col("amount").sum())
    .sort("amount", descending=True)
    .collect())  # Execution is optimized and triggered here`
        },
      ],
      keyTakeaways: [
        'Pandas executes eagerly and loads entire datasets into memory. It is incredibly feature-rich but scales poorly to massive data.',
        'Polars executes lazily (via .scan_parquet() and .collect()). It analyzes the entire query plan to prune columns and push filters down before executing.',
        'Never use df.apply() for row-wise operations in Pandas—it falls back to a slow Python loop. Always use vectorized operations (like .str or math operators).',
        'For data larger than a single machine\'s RAM (>50GB+), graduate from Pandas/Polars to distributed systems like Apache Spark or Ray.',
      ],
    },
    crashCourse: {
      summary: 'Pandas for rich <=1GB interactive work. Polars for extremely fast, lazy-evaluated local processing of larger datasets. Vectorize everything.',
      quickFacts: [
        'pd.read_parquet() > pd.read_csv() (massively faster I/O)',
        'Polars uses lazy evaluation; collect() executes the DAG',
        '.loc (label-based) vs .iloc (position-based) indexing in Pandas',
        'df.memory_usage(deep=True) to profile DataFrame size'
      ],
      tips: ['If a Pandas pipeline keeps throwing MemoryError, try migrating the core transformation logic to Polars before begging for a bigger EC2 instance.'],
    },
  },
  'python-de-1': {
    tutorial: {
      explanation: [
        'A data pipeline is only as fast as its slowest I/O operation. Choosing the correct file format and knowing how to interact with it is critical. JSON and CSV are human-readable but bloated, slow to parse, and lack strict schema enforcement.',
        'Parquet is the gold standard for analytical (OLAP) workloads. It stores data by column, natively compresses data tightly, and embeds schema/types directly. Knowing how to stream or chunk files in Python prevents blowing out server memory.',
      ],
      codeExamples: [
        {
          description: 'Efficient CSV Chunking & Parquet Writing',
          code: `import pandas as pd
import pyarrow.parquet as pq
import pyarrow as pa
import csv

# 1. Chunking massive CSVs to avoid memory crashes
def process_massive_csv(input_path, output_path):
    chunk_size = 100000
    # Create the target file (overwrite) with the header First
    with open(output_path, 'w') as f:
        pass
        
    for chunk in pd.read_csv(input_path, chunksize=chunk_size):
        # ... perform cleaning/transforms on the chunk ...
        cleaned_chunk = chunk.dropna()
        
        # Append chunk to file without loading the whole file into RAM
        cleaned_chunk.to_csv(output_path, mode='a', header=False, index=False)

# 2. Writing Parquet with PyArrow (Industry Standard)
# Parquet preserves data types (e.g. datetime) unlike CSV
def write_analytics_data(df, path):
    table = pa.Table.from_pandas(df)
    # Snappy compression is the optimal balance of speed and size
    pq.write_table(table, path, compression='snappy')`
        },
      ],
      keyTakeaways: [
        'Parquet is columnar and highly compressed. Use it for data warehouse loads and analytical querying.',
        'Avro is row-based and embeds a schema block at the top. Use it for streaming pipelines (Kafka) where you write row-by-row.',
        'JSON and CSV should be avoided for internal analytical storage, but are unavoidably common for APIs and legacy exports.',
        'When dealing with memory limits, use pd.read_csv(chunksize=N) to iterate over a massive file rather than reading it wholesale.',
      ],
    },
    crashCourse: {
      summary: 'Parquet for analytics (columnar). Avro for streaming (row-based). CSV/JSON for APIs only. Read large files in chunks to save memory.',
      quickFacts: [
        'Parquet: Columnar, Snappy compression, self-describing schema',
        'Avro: Row-based, highly splittable, great for Kafka',
        'chunksize=N: Processes files in memory-safe batches'
      ],
      tips: ['Use the built-in python `csv` module (csv.DictReader) for processing simple CSVs when you don\'t want to pull in the massive Pandas library dependency.'],
    },
  },
  'python-de-2': {
    tutorial: {
      explanation: [
        'Data Engineering requires robust, maintainable code. Object-Oriented Programming (OOP) allows you to encapsulate logic, states, and configurations into structured classes. Concepts like Inheritance and Polymorphism allow you to build reusable abstract base classes for data extractors (e.g. BaseExtractor → S3Extractor, PostgresExtractor).',
        'Furthermore, Context Managers (the `with` statement) are the only safe way to handle external resources like database connections or file handlers to ensure they are properly closed even if your pipeline crashes.',
      ],
      codeExamples: [
        {
          description: 'OOP Pipeline Config & Context Managers',
          code: `import json
from pathlib import Path
from dataclasses import dataclass
from contextlib import contextmanager
import logging

# 1. Dataclasses: Perfect for strongly-typed configuration objects
@dataclass
class PipelineConfig:
    input_path: str
    output_path: str
    batch_size: int = 1000
    max_retries: int = 3

# 2. Base Class Architecture
class DataPipeline:
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.logger = logging.getLogger(__name__)
    
    # 3. Custom Context Manager (Yields control, guarantees cleanup)
    @contextmanager
    def error_handler(self, operation: str):
        """Context manager for consistent error handling and logging"""
        try:
            self.logger.info(f"Starting {operation}")
            yield  # Execution jumps back to the main block here
            self.logger.info(f"Successfully finished {operation}")
        except Exception as e:
            self.logger.error(f"Fatal Error in {operation}: {str(e)}")
            raise e
    
    def process_batch(self, data):
        # The context manager wraps the execution safely
        with self.error_handler("batch processing"):
            return [str(record).upper() for record in data]`
        },
      ],
      keyTakeaways: [
        '@dataclass is the clean, modern pythonic way to define data containers and configuration objects, reducing boilerplate __init__ code.',
        'Context Managers (`with` blocks) guarantee execution of cleanup code (like closing a database cursor). You can create your own with the @contextmanager decorator.',
        'Generators (`yield`) drastically reduce memory footprint by yielding one record at a time instead of materializing a multi-million element list in Python memory.',
      ],
    },
    crashCourse: {
      summary: 'Structure pipelines with classes for reusability. Use @dataclass for configs. Implement context managers (@contextmanager) to guarantee safe DB/file connection cleanup.',
      quickFacts: [
        '@dataclass: auto-generates __init__ and __repr__',
        'Context Managers: `with open()...` ensures safe auto-closing',
        'Generators: use `yield` instead of `return` list to save RAM',
        'Abstract Base Classes (abc): Force subclasses to implement specific methods'
      ],
      tips: ['If you find yourself writing `try...finally: cursor.close()`, you should write a custom context manager to handle the cleanup automatically.'],
    },
  },
  'python-de-3': {
    tutorial: {
      explanation: [
        'Data engineering pipelines are often heavily I/O bound: waiting on API endpoints, waiting on slow database queries, or waiting for files to download from S3. Using standard synchronous Python means your CPU sits idle while waiting.',
        'Asynchronous programming (`asyncio` and `aiohttp`) solves this by allowing a single Python thread to context-switch away from networking tasks while they wait, sending off hundreds of concurrent requests simultaneously. This can speed up API extraction pipelines by orders of magnitude.',
      ],
      codeExamples: [
        {
          description: 'High-Performance Async API Extraction',
          code: `import asyncio
import aiohttp
import time

class AsyncDataCollector:
    def __init__(self, rate_limit: float = 1.0):
        # Ensure we don't accidentally DDOS the API
        self.rate_limit = rate_limit 
        # Semaphore restricts max concurrent flights to 10
        self.semaphore = asyncio.Semaphore(10)
    
    async def fetch_data(self, session: aiohttp.ClientSession, url: str):
        async with self.semaphore:
            try:
                await asyncio.sleep(1 / self.rate_limit) # rate limit backoff
                async with session.get(url) as response:
                    # Non-blocking wait for JSON parsing
                    data = await response.json()
                    return {'url': url, 'data': data, 'status': 'success'}
            except Exception as e:
                return {'url': url, 'error': str(e), 'status': 'error'}
    
    async def collect_batch(self, urls):
        # Share a single robust connection session
        async with aiohttp.ClientSession() as session:
            # Create async tasks for all URLs
            tasks = [self.fetch_data(session, url) for url in urls]
            # Execute them concurrently, waiting for all to finish
            results = await asyncio.gather(*tasks)
            return results

# Invocation:
# urls = [f"https://api.example.com/data/{i}" for i in range(100)]
# results = asyncio.run(collector.collect_batch(urls))`
        },
      ],
      keyTakeaways: [
        'Synchronous code (like the standard `requests` library) blocks execution entirely while waiting on the network.',
        'Async code (`aiohttp`, `asyncio`) requires functions to be defined with `async def` and called via `await`.',
        'When firing hundreds of concurrent requests, you MUST implement rate-limiting and Semaphores to avoid getting ban-hammered 429 Too Many Requests errors from APIs.',
        '`asyncio.gather(*tasks)` is the primary mechanism for executing a list of asynchronous operations simultaneously.',
      ],
    },
    crashCourse: {
      summary: 'Use asyncio and aiohttp for massive concurrent I/O operations (like fetching 10,000 pages of an API). Never use it for CPU-heavy tasks like math.',
      quickFacts: [
        'async def: declares an async function (coroutine)',
        'await: non-blocking pause until the result returns',
        'asyncio.gather(): runs multiple tasks concurrently',
        'aiohttp: the async alternative to the requests library'
      ],
      tips: ['Asyncio only bypasses I/O bottlenecks. If your code is CPU-bound (e.g. parsing massive CSVs or running complex Pandas math), use multiprocessing instead.'],
    },
  },
  'python-de-4': {
    tutorial: {
      explanation: [
        'Without tests, a data pipeline is just a liability waiting to break production on a Saturday. Data engineers must test transformation logic independently of the database or network dependencies.',
        'The `pytest` framework is the industry standard. Concepts include writing small unit tests, heavily utilizing Test Fixtures to inject mock data, and Mocking/Patching to forge fake API responses or database connections so tests run fast and offline.',
      ],
      codeExamples: [
        {
          description: 'Testing Pipelines with Pytest, Fixtures, and Mocks',
          code: `import pytest
from unittest.mock import patch, MagicMock
# Assuming we have a pipeline module to test:
# from pipeline import process_data_chunk, fetch_api_data

# 1. Fixtures: Provide reusable mock data states for testing
@pytest.fixture
def sample_sales_data():
    return [
        {'id': 1, 'amount': 100, 'status': 'active'},
        {'id': 2, 'amount': -50, 'status': 'refunded'},
        {'id': 3, 'amount': 300, 'status': 'active'}
    ]

# 2. Testing complex logic locally using the fixture
def test_process_data_chunk_filters_refunds(sample_sales_data):
    # Action
    results = process_data_chunk(sample_sales_data)
    
    # Assertions
    assert len(results) == 2
    assert all(r['status'] == 'active' for r in results)
    assert sum(r['amount'] for r in results) == 400

# 3. Mocking external dependencies
# We use @patch to hijack the 'requests.get' function
@patch('pipeline.requests.get')
def test_fetch_api_handles_404(mock_get):
    # Setup the forged mock response
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_get.return_value = mock_response
    
    # Run our function and assert it raises our custom exception
    with pytest.raises(SystemExit):
        fetch_api_data("http://fake-api.com")
    
    # Verify the mock was actually called once
    mock_get.assert_called_once_with("http://fake-api.com")`
        },
      ],
      keyTakeaways: [
        'A unit test validates a microscopic piece of isolated logic. An integration test validates that components (like the code and the live database) work together.',
        'Use `@pytest.fixture` to define reusable sets of mock data (JSON dictionaries, temporary DataFrames) to inject into your tests.',
        '`unittest.mock.patch` allows you to intercept calls to external systems (like S3, APIs, or DBs) and force them to return specific fake data without hitting the network.',
      ],
    },
    crashCourse: {
      summary: 'Robust pipelines require pytest. Use fixtures for setting up fake pipeline data inputs, and use Mocking/Patching to isolate code from external databases/APIs during tests.',
      quickFacts: [
        'pytest: The standard python testing framework',
        '@pytest.fixture: Setup functions prioritizing isolated mock data',
        '@patch: Hijacks an import path to intercept external networking calls',
        'pytest.raises(): Assert that an error is correctly thrown'
      ],
      tips: ['If your tests are taking more than 5 seconds to run, you are probably accidentally doing live integration tests against a database instead of mocking the connections.'],
    },
  },
  'python-de-5': {
    tutorial: {
      explanation: [
        'Python is dynamically typed, which is great for rapid scripts but terrifying for enterprise data pipelines where a mistyped JSON payload can cascade into downstream data warehouse corruption.',
        'Type Hints allow you to declare the expected schematic structure of data (e.g. `List[Dict[str, int]]`). Pydantic is a powerful library that takes this further—it actively enforces and validates Data Validation at runtime. If an API returns an integer where Pydantic expected a string-date, it strictly halts the pipeline before bad data enters the system.',
      ],
      codeExamples: [
        {
          description: 'Type Hints and Runtime Data Validation with Pydantic',
          code: `from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, ValidationError, Field, confloat

# 1. Standard execution Type Hints (purely for IDEs/Linters like Mypy)
def format_event(event_id: int, payload: Dict[str, Any]) -> str:
    return f"Event {event_id}: {payload}"

# 2. Pydantic Runtime Schema Validation Models
class UserEventSchema(BaseModel):
    # Strictly enforce types. Coerces valid types (e.g. string "123" to integer 123)
    user_id: int 
    event_type: str = Field(..., min_length=3, max_length=50) # Strict length boundaries
    # Ensures value is between 0 and 1000
    amount_spent: confloat(ge=0.0, le=1000.0) 
    # Optional explicitly allows None/Null values
    signup_date: Optional[datetime] = None

# 3. Enforcing the Schema on raw upstream JSON data
raw_api_payload = {
    "user_id": "8472",      # Pydantic will auto-coerce this string to an int
    "event_type": "click",
    "amount_spent": 45.50
}

try:
    # Instantiate the model to validate. Will throw ValidationError if schema fails.
    validated_record = UserEventSchema(**raw_api_payload)
    print(validated_record.user_id) # Type safely outputs: 8472 (int)
except ValidationError as e:
    print(f"Data Schema Violation! Aborting pipeline batch: {e}")`
        },
      ],
      keyTakeaways: [
        'Standard Type Hints (`def extract(url: str) -> dict:`) do not actually stop python from running if you pass an integer. They are strictly for static analyzer tools like `mypy` and IDE autocompletion.',
        'Pydantic models (`BaseModel`) execute heavy runtime data validation. They are fundamentally "Data Contracts" in modern Python data engineering.',
        'Pydantic will attempt to automatically coerce minor type infractions (converting a string "4.5" to a float 4.5), solving many standard data loading headaches.',
      ],
    },
    crashCourse: {
      summary: 'Use Type Hints for structural readability. Use Pydantic BaseModel classes to enforce strict data schemas (Contracts) and validate JSON/API responses at runtime before persisting them to the data warehouse.',
      quickFacts: [
        'typing module: List[], Dict[], Optional[], Any',
        'mypy: CLI tool to statically check type hints',
        'Pydantic BaseModel: Active, runtime data validation and coercion',
        'Optional[str]: explicitly flags a column/variable as nullable'
      ],
      tips: ['Combine Pydantic for row-wise API JSON validation, and Pandera/Great Expectations for massive DataFrame batch validation.'],
    },
  },
};
