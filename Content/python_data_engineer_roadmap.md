# Complete Python Roadmap for Data Engineering

## Overview
This roadmap is designed to take you from Python beginner to data engineering expert through progressive stages. Each stage builds upon previous knowledge while introducing concepts crucial for data engineering workflows.

---

## Stage 1: Python Foundations (4-6 weeks)

### Core Python Concepts
- **Variables, data types, and operators**
- **Control structures (if/else, loops)**
- **Functions and scope**
- **Data structures (lists, dictionaries, sets, tuples)**
- **String manipulation and formatting**
- **File I/O operations**

### Essential Libraries
```python
# Built-in modules to master
import os
import sys
import json
import csv
import datetime
from pathlib import Path
```

### Data Engineering Applications
- **File operations**: Reading configuration files, processing data files
- **Path handling**: Managing file paths across different operating systems
- **Basic data parsing**: Converting between data formats

### Practical Projects

#### Project 1: Configuration Manager
```python
# Build a system to read/write configuration files
import json
import os
from pathlib import Path

class ConfigManager:
    def __init__(self, config_path):
        self.config_path = Path(config_path)
    
    def load_config(self):
        with open(self.config_path, 'r') as f:
            return json.load(f)
    
    def save_config(self, config):
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)
```

#### Project 2: CSV Data Processor
```python
# Process CSV files with error handling
import csv
from pathlib import Path

def process_sales_data(input_file, output_file):
    processed_data = []
    
    with open(input_file, 'r') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            # Clean and transform data
            row['total'] = float(row['quantity']) * float(row['price'])
            processed_data.append(row)
    
    with open(output_file, 'w', newline='') as outfile:
        fieldnames = processed_data[0].keys()
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(processed_data)
```

### Key Takeaways for Data Engineering
- File operations are fundamental for data ingestion
- Understanding data structures enables efficient data manipulation
- Path handling ensures cross-platform compatibility

---

## Stage 2: Intermediate Python & Error Handling (6-8 weeks)

### Core Python Concepts
- **Object-oriented programming (classes, inheritance)**
- **Exception handling and custom exceptions**
- **Context managers (with statements)**
- **Decorators and generators**
- **List/dict comprehensions**
- **Working with environment variables**

### Essential Libraries
```python
import os
import logging
import functools
import itertools
from typing import List, Dict, Optional
from dataclasses import dataclass
```

### Data Engineering Applications
- **Robust error handling**: Graceful failure recovery in data pipelines
- **Environment configuration**: Separating configuration from code
- **Logging**: Monitoring pipeline execution and debugging
- **Resource management**: Proper file/database connection handling

### Practical Projects

#### Project 3: Data Pipeline Framework
```python
import logging
import os
from typing import Any, Dict
from dataclasses import dataclass
from contextlib import contextmanager

@dataclass
class PipelineConfig:
    input_path: str
    output_path: str
    batch_size: int = 1000
    max_retries: int = 3

class DataPipelineError(Exception):
    """Custom exception for pipeline errors"""
    pass

class DataPipeline:
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.logger = self._setup_logging()
    
    def _setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger(__name__)
    
    @contextmanager
    def error_handler(self, operation: str):
        """Context manager for consistent error handling"""
        try:
            yield
        except Exception as e:
            self.logger.error(f"Error in {operation}: {str(e)}")
            raise DataPipelineError(f"Pipeline failed during {operation}")
    
    def process_batch(self, data_batch):
        with self.error_handler("batch processing"):
            # Process data batch
            processed_data = []
            for record in data_batch:
                processed_record = self.transform_record(record)
                processed_data.append(processed_record)
            return processed_data
    
    def transform_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        # Example transformation
        return {
            'id': record.get('id'),
            'processed_at': datetime.now().isoformat(),
            'data': record.get('data', '').upper()
        }
```

#### Project 4: Environment-Based Configuration
```python
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class DatabaseConfig:
    host: str
    port: int
    username: str
    password: str
    database: str
    
    @classmethod
    def from_env(cls):
        """Load configuration from environment variables"""
        return cls(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', '5432')),
            username=os.getenv('DB_USERNAME'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
    
    def validate(self):
        """Validate required configuration"""
        if not all([self.username, self.password, self.database]):
            raise ValueError("Missing required database configuration")
```

### Key Takeaways for Data Engineering
- Exception handling prevents pipeline crashes and enables monitoring
- Environment variables enable flexible deployment configurations
- Logging provides visibility into pipeline execution
- Context managers ensure proper resource cleanup

---

## Stage 3: Advanced Python & Concurrency (8-10 weeks)

### Core Python Concepts
- **Threading and multiprocessing**
- **Async programming (asyncio)**
- **Memory management and optimization**
- **Unit testing and test-driven development**
- **Packaging and dependency management**
- **Performance profiling**

### Essential Libraries
```python
import threading
import multiprocessing
import asyncio
import concurrent.futures
import unittest
import pytest
import time
from queue import Queue
```

### Data Engineering Applications
- **Parallel processing**: Handling large datasets efficiently
- **Asynchronous operations**: Non-blocking I/O operations
- **Testing**: Ensuring pipeline reliability
- **Performance optimization**: Handling high-volume data processing

### Practical Projects

#### Project 5: Parallel Data Processor
```python
import multiprocessing
import concurrent.futures
from typing import List, Callable, Any
import time

class ParallelDataProcessor:
    def __init__(self, num_workers: int = None):
        self.num_workers = num_workers or multiprocessing.cpu_count()
    
    def process_files_parallel(self, file_paths: List[str], 
                             processor_func: Callable) -> List[Any]:
        """Process multiple files in parallel"""
        with concurrent.futures.ProcessPoolExecutor(max_workers=self.num_workers) as executor:
            # Submit all tasks
            future_to_file = {
                executor.submit(processor_func, file_path): file_path 
                for file_path in file_paths
            }
            
            results = []
            for future in concurrent.futures.as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    result = future.result()
                    results.append(result)
                    print(f"Processed {file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
            
            return results
    
    def process_data_chunks(self, data: List[Any], 
                          processor_func: Callable, 
                          chunk_size: int = 1000) -> List[Any]:
        """Process data in parallel chunks"""
        chunks = [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            futures = [executor.submit(processor_func, chunk) for chunk in chunks]
            results = []
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    results.extend(result)
                except Exception as e:
                    print(f"Error processing chunk: {e}")
            
            return results
```

#### Project 6: Async API Data Collector
```python
import asyncio
import aiohttp
import time
from typing import List, Dict, Any

class AsyncDataCollector:
    def __init__(self, rate_limit: float = 1.0):
        self.rate_limit = rate_limit  # requests per second
        self.semaphore = asyncio.Semaphore(10)  # max concurrent requests
    
    async def fetch_data(self, session: aiohttp.ClientSession, 
                        url: str) -> Dict[str, Any]:
        """Fetch data from a single URL with rate limiting"""
        async with self.semaphore:
            try:
                await asyncio.sleep(1 / self.rate_limit)  # Rate limiting
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {'url': url, 'data': data, 'status': 'success'}
                    else:
                        return {'url': url, 'error': f"HTTP {response.status}", 'status': 'error'}
            except Exception as e:
                return {'url': url, 'error': str(e), 'status': 'error'}
    
    async def collect_data_batch(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Collect data from multiple URLs asynchronously"""
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch_data(session, url) for url in urls]
            results = await asyncio.gather(*tasks)
            return results

# Usage example
async def main():
    collector = AsyncDataCollector(rate_limit=5.0)  # 5 requests per second
    urls = [f"https://api.example.com/data/{i}" for i in range(100)]
    
    start_time = time.time()
    results = await collector.collect_data_batch(urls)
    end_time = time.time()
    
    successful = len([r for r in results if r['status'] == 'success'])
    print(f"Collected {successful}/{len(urls)} records in {end_time - start_time:.2f} seconds")
```

#### Project 7: Comprehensive Testing Suite
```python
import unittest
import pytest
from unittest.mock import Mock, patch, MagicMock
import tempfile
import json
from pathlib import Path

class TestDataPipeline(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures"""
        self.test_data = [
            {'id': 1, 'name': 'Alice', 'value': 100},
            {'id': 2, 'name': 'Bob', 'value': 200}
        ]
    
    def test_data_transformation(self):
        """Test data transformation logic"""
        pipeline = DataPipeline(mock_config)
        result = pipeline.transform_record({'id': 1, 'data': 'test'})
        
        self.assertIn('id', result)
        self.assertIn('processed_at', result)
        self.assertEqual(result['data'], 'TEST')
    
    @patch('builtins.open')
    def test_file_processing(self, mock_open):
        """Test file processing with mocked file operations"""
        mock_open.return_value.__enter__.return_value.read.return_value = json.dumps(self.test_data)
        
        pipeline = DataPipeline(mock_config)
        result = pipeline.process_file('test.json')
        
        self.assertEqual(len(result), 2)
        mock_open.assert_called_once()
    
    def test_error_handling(self):
        """Test error handling"""
        pipeline = DataPipeline(mock_config)
        
        with self.assertRaises(DataPipelineError):
            pipeline.process_batch(None)  # Should raise error
    
    def test_integration_with_temp_files(self):
        """Integration test using temporary files"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(self.test_data, f)
            temp_path = f.name
        
        try:
            pipeline = DataPipeline(PipelineConfig(
                input_path=temp_path,
                output_path='output.json'
            ))
            result = pipeline.run()
            self.assertIsNotNone(result)
        finally:
            Path(temp_path).unlink()  # Clean up

# Pytest examples
@pytest.fixture
def sample_data():
    return [{'id': i, 'value': i * 10} for i in range(5)]

@pytest.fixture
def data_processor():
    return DataProcessor(batch_size=2)

def test_batch_processing(data_processor, sample_data):
    batches = list(data_processor.create_batches(sample_data))
    assert len(batches) == 3  # 5 items, batch_size=2
    assert len(batches[-1]) == 1  # Last batch has remainder

@pytest.mark.parametrize("input_data,expected", [
    ([1, 2, 3], 6),
    ([10, 20], 30),
    ([], 0),
])
def test_sum_values(input_data, expected):
    result = sum_values(input_data)
    assert result == expected
```

### Key Takeaways for Data Engineering
- Multiprocessing enables handling of large datasets
- Async programming improves I/O-bound operation performance
- Testing ensures pipeline reliability and maintainability
- Performance optimization is crucial for production systems

---

## Stage 4: Data Engineering Specific Applications (10-12 weeks)

### Core Libraries & Frameworks
```python
# HTTP and API interaction
import requests
import httpx  # async HTTP client

# Database connectivity
import sqlalchemy
import psycopg2  # PostgreSQL
import pymongo   # MongoDB
import redis

# Data processing
import pandas as pd
import numpy as np
import pyarrow  # Columnar data

# Scheduling and automation
import schedule
import celery
from airflow import DAG

# Cloud services
import boto3     # AWS
import azure.storage.blob  # Azure
from google.cloud import storage  # GCP

# Message queues
import pika      # RabbitMQ
from kafka import KafkaProducer, KafkaConsumer
```

### Advanced Data Engineering Concepts

#### Project 8: API Rate Limiter and Data Extractor
```python
import time
import requests
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from threading import Lock
from collections import deque
import logging

@dataclass
class RateLimitConfig:
    requests_per_second: float
    burst_limit: int
    timeout: float = 30.0

class TokenBucketRateLimiter:
    """Thread-safe token bucket rate limiter"""
    
    def __init__(self, config: RateLimitConfig):
        self.rate = config.requests_per_second
        self.capacity = config.burst_limit
        self.tokens = config.burst_limit
        self.last_update = time.time()
        self.lock = Lock()
    
    def acquire(self) -> bool:
        """Acquire a token for making a request"""
        with self.lock:
            now = time.time()
            # Add tokens based on elapsed time
            elapsed = now - self.last_update
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
            self.last_update = now
            
            if self.tokens >= 1:
                self.tokens -= 1
                return True
            return False
    
    def wait_for_token(self):
        """Wait until a token is available"""
        while not self.acquire():
            time.sleep(0.1)

class APIDataExtractor:
    def __init__(self, base_url: str, rate_config: RateLimitConfig):
        self.base_url = base_url
        self.rate_limiter = TokenBucketRateLimiter(rate_config)
        self.session = requests.Session()
        self.logger = logging.getLogger(__name__)
    
    def extract_paginated_data(self, endpoint: str, 
                             params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Extract all data from a paginated API endpoint"""
        all_data = []
        page = 1
        
        while True:
            self.rate_limiter.wait_for_token()
            
            current_params = params.copy() if params else {}
            current_params['page'] = page
            
            try:
                response = self.session.get(
                    f"{self.base_url}/{endpoint}",
                    params=current_params,
                    timeout=30
                )
                response.raise_for_status()
                
                data = response.json()
                
                if not data.get('results'):
                    break
                
                all_data.extend(data['results'])
                self.logger.info(f"Extracted page {page}, total records: {len(all_data)}")
                
                if not data.get('next'):
                    break
                
                page += 1
                
            except requests.RequestException as e:
                self.logger.error(f"API request failed: {e}")
                break
        
        return all_data
    
    def extract_with_retry(self, endpoint: str, max_retries: int = 3) -> Optional[Dict[str, Any]]:
        """Extract data with exponential backoff retry"""
        for attempt in range(max_retries):
            try:
                self.rate_limiter.wait_for_token()
                
                response = self.session.get(f"{self.base_url}/{endpoint}")
                response.raise_for_status()
                return response.json()
                
            except requests.RequestException as e:
                wait_time = 2 ** attempt  # Exponential backoff
                self.logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s")
                time.sleep(wait_time)
        
        self.logger.error(f"Failed to extract data after {max_retries} attempts")
        return None
```

#### Project 9: Database Connection Manager
```python
import sqlalchemy as sa
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from typing import List, Dict, Any, Optional
import pandas as pd
import logging

class DatabaseManager:
    def __init__(self, connection_string: str, pool_size: int = 10):
        self.engine = create_engine(
            connection_string,
            pool_size=pool_size,
            max_overflow=20,
            pool_pre_ping=True,  # Validate connections
            echo=False
        )
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.metadata = MetaData()
        self.logger = logging.getLogger(__name__)
    
    @contextmanager
    def get_session(self):
        """Provide a transactional scope around operations"""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            self.logger.error(f"Database transaction failed: {e}")
            raise
        finally:
            session.close()
    
    def bulk_insert_dataframe(self, df: pd.DataFrame, table_name: str, 
                            if_exists: str = 'append', chunk_size: int = 10000):
        """Efficiently insert DataFrame to database"""
        try:
            df.to_sql(
                table_name,
                self.engine,
                if_exists=if_exists,
                index=False,
                chunksize=chunk_size,
                method='multi'  # Use executemany for better performance
            )
            self.logger.info(f"Inserted {len(df)} records into {table_name}")
        except Exception as e:
            self.logger.error(f"Failed to insert data: {e}")
            raise
    
    def execute_query(self, query: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Execute a query and return results as list of dictionaries"""
        with self.engine.connect() as conn:
            result = conn.execute(sa.text(query), params or {})
            columns = result.keys()
            return [dict(zip(columns, row)) for row in result.fetchall()]
    
    def upsert_records(self, table_name: str, records: List[Dict[str, Any]], 
                      conflict_columns: List[str]):
        """Upsert records (insert or update on conflict)"""
        if not records:
            return
        
        # This is PostgreSQL-specific; adapt for other databases
        table = Table(table_name, self.metadata, autoload_with=self.engine)
        
        with self.engine.connect() as conn:
            for record in records:
                stmt = sa.dialects.postgresql.insert(table).values(**record)
                
                # Create update dictionary excluding conflict columns
                update_dict = {
                    col.name: stmt.excluded[col.name]
                    for col in table.columns
                    if col.name not in conflict_columns
                }
                
                stmt = stmt.on_conflict_do_update(
                    index_elements=conflict_columns,
                    set_=update_dict
                )
                
                conn.execute(stmt)
            conn.commit()
```

#### Project 10: Data Pipeline Scheduler
```python
import schedule
import time
import logging
from datetime import datetime, timedelta
from typing import Callable, Dict, Any, List
from dataclasses import dataclass
from enum import Enum
import json
from pathlib import Path

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"

@dataclass
class TaskResult:
    task_name: str
    status: TaskStatus
    start_time: datetime
    end_time: datetime = None
    error_message: str = None
    
    @property
    def duration(self) -> timedelta:
        if self.end_time:
            return self.end_time - self.start_time
        return timedelta(0)

class PipelineScheduler:
    def __init__(self, log_file: str = "pipeline.log"):
        self.tasks: Dict[str, Callable] = {}
        self.task_history: List[TaskResult] = []
        self.logger = self._setup_logging(log_file)
        self.running = False
    
    def _setup_logging(self, log_file: str) -> logging.Logger:
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def register_task(self, name: str, func: Callable, schedule_string: str):
        """Register a task with the scheduler"""
        self.tasks[name] = func
        
        # Parse schedule string and set up schedule
        if schedule_string.startswith("every"):
            parts = schedule_string.split()
            if len(parts) >= 3:
                interval = int(parts[1]) if parts[1].isdigit() else 1
                unit = parts[2]
                
                if unit.startswith("minute"):
                    schedule.every(interval).minutes.do(self._run_task, name)
                elif unit.startswith("hour"):
                    schedule.every(interval).hours.do(self._run_task, name)
                elif unit.startswith("day"):
                    schedule.every(interval).days.do(self._run_task, name)
        
        self.logger.info(f"Registered task '{name}' with schedule '{schedule_string}'")
    
    def _run_task(self, task_name: str):
        """Execute a single task with error handling and logging"""
        if task_name not in self.tasks:
            self.logger.error(f"Task '{task_name}' not found")
            return
        
        task_result = TaskResult(
            task_name=task_name,
            status=TaskStatus.RUNNING,
            start_time=datetime.now()
        )
        
        self.logger.info(f"Starting task: {task_name}")
        
        try:
            self.tasks[task_name]()
            task_result.status = TaskStatus.SUCCESS
            task_result.end_time = datetime.now()
            self.logger.info(f"Task '{task_name}' completed successfully in {task_result.duration}")
            
        except Exception as e:
            task_result.status = TaskStatus.FAILED
            task_result.end_time = datetime.now()
            task_result.error_message = str(e)
            self.logger.error(f"Task '{task_name}' failed: {e}")
        
        self.task_history.append(task_result)
    
    def run_scheduler(self):
        """Start the scheduler loop"""
        self.running = True
        self.logger.info("Pipeline scheduler started")
        
        try:
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            self.logger.info("Scheduler stopped by user")
        finally:
            self.running = False
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        self.running = False
    
    def get_task_status(self, hours: int = 24) -> List[TaskResult]:
        """Get task execution history for the last N hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        return [
            result for result in self.task_history
            if result.start_time >= cutoff
        ]
    
    def export_task_history(self, filepath: str):
        """Export task history to JSON file"""
        history_data = []
        for result in self.task_history:
            history_data.append({
                'task_name': result.task_name,
                'status': result.status.value,
                'start_time': result.start_time.isoformat(),
                'end_time': result.end_time.isoformat() if result.end_time else None,
                'duration_seconds': result.duration.total_seconds(),
                'error_message': result.error_message
            })
        
        with open(filepath, 'w') as f:
            json.dump(history_data, f, indent=2)

# Usage example
def daily_sales_pipeline():
    """Example data pipeline task"""
    print("Running daily sales data processing...")
    # Your pipeline logic here
    time.sleep(5)  # Simulate work
    print("Sales pipeline completed!")

def hourly_monitoring():
    """Example monitoring task"""
    print("Running system monitoring...")
    # Monitoring logic here
    print("Monitoring completed!")

# Set up scheduler
scheduler = PipelineScheduler()
scheduler.register_task("daily_sales", daily_sales_pipeline, "every 1 day")
scheduler.register_task("hourly_monitor", hourly_monitoring, "every 1 hour")

# Start scheduler (in production, this would run as a daemon)
# scheduler.run_scheduler()
```

#### Project 11: Comprehensive ETL Pipeline
```python
import pandas as pd
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod
import json
from pathlib import Path
import boto3
from datetime import datetime

@dataclass
class ETLConfig:
    source_type: str  # 'api', 'database', 'file', 's3'
    source_config: Dict[str, Any]
    target_type: str  # 'database', 'file', 's3'
    target_config: Dict[str, Any]
    transformations: List[str]
    batch_size: int = 10000

class DataSource(ABC):
    @abstractmethod
    def extract(self, config: Dict[str, Any]) -> pd.DataFrame:
        pass

class DatabaseSource(DataSource):
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    def extract(self, config: Dict[str, Any]) -> pd.DataFrame:
        query = config['query']
        params = config.get('params', {})
        
        with self.db_manager.get_session() as session:
            return pd.read_sql(query, session.bind, params=params)

class S3Source(DataSource):
    def __init__(self):
        self.s3_client = boto3.client('s3')
    
    def extract(self, config: Dict[str, Any]) -> pd.DataFrame:
        bucket = config['bucket']
        key = config['key']
        file_format = config.get('format', 'csv')
        
        # Download file from S3
        local_path = f"/tmp/{Path(key).name}"
        self.s3_client.download_file(bucket, key, local_path)
        
        if file_format == 'csv':
            return pd.read_csv(local_path)
        elif file_format == 'parquet':
            return pd.read_parquet(local_path)
        else:
            raise ValueError(f"Unsupported file format: {file_format}")

class DataTransformer:
    @staticmethod
    def clean_nulls(df: pd.DataFrame) -> pd.DataFrame:
        """Remove rows with null values in critical columns"""
        return df.dropna()
    
    @staticmethod
    def normalize_dates(df: pd.DataFrame, date_columns: List[str]) -> pd.DataFrame:
        """Normalize date columns to consistent format"""
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        return df
    
    @staticmethod
    def add_audit_columns(df: pd.DataFrame) -> pd.DataFrame:
        """Add audit columns for tracking"""
        df['processed_at'] = datetime.now()
        df['data_source'] = 'etl_pipeline'
        return df
    
    @staticmethod
    def apply_business_rules(df: pd.DataFrame, rules: Dict[str, Any]) -> pd.DataFrame:
        """Apply business-specific transformation rules"""
        # Example: filter data based on date range
        if 'date_filter' in rules:
            start_date = pd.to_datetime(rules['date_filter']['start'])
            end_date = pd.to_datetime(rules['date_filter']['end'])
            date_col = rules['date_filter']['column']
            
            if date_col in df.columns:
                df = df[(df[date_col] >= start_date) & (df[date_col] <= end_date)]
        
        return df

class ETLPipeline:
    def __init__(self, config: ETLConfig):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.transformer = DataTransformer()
        
        # Initialize data sources
        self.sources = {
            'database': DatabaseSource(DatabaseManager(config.source_config.get('connection_string'))),
            's3': S3Source(),
            'file': FileSource()
        }
    
    def run(self) -> Dict[str, Any]:
        """Execute the complete ETL pipeline"""
        start_time = datetime.now()
        self.logger.info("Starting ETL pipeline")
        
        try:
            # Extract
            self.logger.info("Starting data extraction")
            df = self._extract_data()
            self.logger.info(f"Extracted {len(df)} records")
            
            # Transform
            self.logger.info("Starting data transformation")
            df_transformed = self._transform_data(df)
            self.logger.info(f"Transformed data: {len(df_transformed)} records")
            
            # Load
            self.logger.info("Starting data loading")
            self._load_data(df_transformed)
            
            end_time = datetime.now()
            duration = end_time - start_time
            
            result = {
                'status': 'success',
                'records_processed': len(df_transformed),
                'duration_seconds': duration.total_seconds(),
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat()
            }
            
            self.logger.info(f"ETL pipeline completed successfully: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"ETL pipeline failed: {str(e)}")
            return {
                'status': 'failed',
                'error': str(e),
                'start_time': start_time.isoformat(),
                'end_time': datetime.now().isoformat()
            }
    
    def _extract_data(self) -> pd.DataFrame:
        """Extract data from configured source"""
        source_type = self.config.source_type
        if source_type not in self.sources:
            raise ValueError(f"Unsupported source type: {source_type}")
        
        return self.sources[source_type].extract(self.config.source_config)
    
    def _transform_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply all configured transformations"""
        for