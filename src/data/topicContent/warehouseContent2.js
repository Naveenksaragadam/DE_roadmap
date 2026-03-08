// Data Warehousing & Modeling — Topic Deep-Dive Content (Part 2: dbt to Serverless)
export const warehouseContent2 = {
  'data-warehousing-7': {
    tutorial: {
      explanation: [
        'Historically, data was Processed before being loaded: Extract, Transform, Load (ETL). You pulled data from an OLTP database, transformed it on a dedicated middle-tier server (like Informatica or Spark), and then loaded the clean data into the Data Warehouse.',
        'With the rise of massive cloud data warehouses (Snowflake, BigQuery), computing power became cheap and virtually infinite. This shifted the paradigm to Extract, Load, Transform (ELT).',
        'In ELT, you dump raw, messy data directly into the warehouse (the "Extract & Load" part, often via Fivetran or Airbyte). Then, you use the warehouse\'s own massive parallel compute engine to "Transform" the data using SQL (specifically, via dbt).',
      ],
      codeExamples: [
        {
          description: 'ETL vs ELT architectures',
          code: `# --- 1. The Legacy ETL Architecture ---
# Logic lives outside the warehouse in Python/Java/Scala 
Source_DB -> Airflow -> [Spark Cluster (Heavy Transforms)] -> Clean_Data_in_Redshift
# Problems: 
# - Maintaining the heavy Spark middle-tier is expensive and hard.
# - The warehouse is just a dumb storage bucket until the end.

# --- 2. The Modern ELT Architecture ---
# Logic lives inside the warehouse in SQL via dbt
Source_DB -> Fivetran -> [Raw_Data_in_Snowflake] -> dbt (SQL Transforms) -> Clean_Data_in_Snowflake
# Benefits:
# - No middle-tier to maintain.
# - Fivetran handles the annoying "Loader" part natively.
# - Analytics Engineers just write SQL (dbt) inside Snowflake.`,
        },
      ],
      keyTakeaways: [
        'ELT democratized Data Engineering. Because transformations are done entirely in SQL inside the warehouse, Data Analysts (rebranded as Analytics Engineers) can build the entire pipeline without needing to know Java, Scala, or Spark.',
        'The only exception to ELT today is massive unstructured data (e.g., streaming logs or image processing), which still requires ETL tools like Spark before landing in the warehouse.',
      ],
    },
    crashCourse: {
      summary: 'ETL transforms data outside the warehouse before loading. ELT loads raw data into the warehouse first, then transforms it using the warehouse\'s own SQL engine. Modern data stacks (Snowflake + dbt) rely entirely on ELT.',
      quickFacts: [
        'ETL (Extract, Transform, Load): Legacy, heavy middle-tier compute, good for unstructured data.',
        'ELT (Extract, Load, Transform): Modern, leverage cloud DWH compute, empowers SQL users.',
        'Fivetran / Airbyte: The "E" and "L" components (Extract and Load) of the modern stack.',
        'dbt (data build tool): The "T" component (Transform) of the modern stack.',
      ],
      tips: [
        'If a company uses Snowflake or BigQuery, assume they are using ELT.',
      ],
    },
  },
  'data-warehousing-8': {
    tutorial: {
      explanation: [
        'dbt (data build tool) is fundamentally a SQL compilation and execution framework that brings software engineering best practices to SQL data modeling.',
        'Instead of writing dozens of complex stored procedures or raw `CREATE TABLE AS SELECT` (CTAS) statements, you write modular `SELECT` statements in dbt. dbt handles the boilerplate DDL (creating the tables/views) automatically.',
        'Crucially, dbt brings version control (Git), testing, documentation, and dependency management (DAGs) to your SQL queries via Jinja templating.',
      ],
      codeExamples: [
        {
          description: 'A standard dbt model (`dim_customers.sql`)',
          code: `-- dbt uses Jinja templating to reference other tables dynamically
-- This is how dbt builds the execution DAG!

{{ config(
    materialized='table',
    tags=['hourly_run']
) }}

WITH source_customers AS (
    -- Reference the RAW source data landed by Fivetran
    SELECT * FROM {{ source('salesforce', 'raw_customers') }}
),

source_orders AS (
    -- Reference ANOTHER dbt model we built previously
    SELECT * FROM {{ ref('stg_orders') }}
),

customer_aggregates AS (
    SELECT
        customer_id,
        MIN(order_date) as first_order_date,
        SUM(amount) as lifetime_value
    FROM source_orders
    GROUP BY 1
)

SELECT
    c.id as customer_key,
    c.email,
    c.status,
    a.first_order_date,
    a.lifetime_value
FROM source_customers c
LEFT JOIN customer_aggregates a ON c.id = a.customer_id`,
        },
      ],
      keyTakeaways: [
        'dbt models are just `.sql` files containing a single `SELECT` statement.',
        'The `{{ ref(\'model_name\') }}` function is the magic. It tells dbt what order to run the SQL files in. If `dim_customers` refs `stg_orders`, dbt knows it MUST run `stg_orders` before `dim_customers`.',
        'Materializations (`table`, `view`, `incremental`) dictate how dbt runs the query in the database. `incremental` is crucial for massive tables, appending only new rows instead of rewriting the whole table daily.',
      ],
    },
    crashCourse: {
      summary: 'dbt transforms raw data into clean Star Schemas inside the data warehouse using templated SQL. It brings Git, testing, and dependency mapping to analytical SQL.',
      quickFacts: [
        'Model: A single .sql file containing one `SELECT` statement.',
        'Jinja Templating ({{ ... }}): Allows writing programmatic SQL with variables and loops.',
        '`ref()` function: The cornerstone of dbt. Links models together to automatically build a DAG.',
        'Materialization: How the model is built in the DB (table, view, incremental, ephemeral).',
      ],
      tips: [
        'A strong dbt project follows the Medallion Architecture: `sources/stg` (Bronze) -> `int` (Silver/Normalizing) -> `marts/fct/dim` (Gold/Kimball Star Schemas).',
      ],
    },
  },
  'data-warehousing-9': {
    tutorial: {
      explanation: [
        'While columnar storage improves performance significantly, scanning an entire column of a multi-terabyte table is still expensive. Partitioning and Clustering are techniques to physically organize data on disk to skip reading massive chunks of data entirely.',
        'Partitioning splits a large table into smaller, physical directory buckets (usually by Day or Month). If you query `WHERE date = "2024-01-01"`, the engine only scans that specific folder and ignores 99% of the disk. Note: Never partition on high-cardinality columns like `user_id` (creates millions of tiny files).',
        'Clustering (or Z-Ordering) sorts the data within those partitions based on specific columns (e.g., `user_id` or `country`). The engine keeps track of the min/max values of those columns per disk block. If a query filters on `user_id = 500`, the engine skips any block where the max ID is < 500 or min ID is > 500.',
      ],
      codeExamples: [
        {
          description: 'Creating Partitioned and Clustered Tables (BigQuery Syntax)',
          code: `-- 1. Partitioning (Physical buckets)
-- Crucial for time-series data (Fact tables)
CREATE TABLE my_dataset.fact_events (
    event_id STRING,
    event_timestamp TIMESTAMP,
    user_id STRING,
    country STRING
)
PARTITION BY DATE(event_timestamp); -- Buckets data by day

-- 2. Clustering (Sorting within buckets)
-- Crucial for highly-filtered dimensions
CREATE TABLE my_dataset.fact_events (
    event_id STRING,
    event_timestamp TIMESTAMP,
    user_id STRING,
    country STRING
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY country, user_id; -- Sorts first by country, then user_id

-- 3. Query Execution Behavior
-- Query: "Find events for US users on Jan 1st"
SELECT * FROM my_dataset.fact_events
WHERE DATE(event_timestamp) = '2024-01-01' 
  AND country = 'US' AND user_id = 'U123';
-- Execution: 
-- 1. Partition filter ignores all folders except '2024-01-01'.
-- 2. Cluster filter skips all blocks in that folder not containing 'US' and 'U123'.
-- Result: Scans 5MB instead of 5TB.`,
        },
      ],
      keyTakeaways: [
        'Partitioning is macroscopic (folders). Clustering is microscopic (sorting within folders).',
        'You should cluster on columns that are frequently used in `JOIN` conditions or `WHERE` filters.',
        'In Snowflake, there is no explicit partitioning like Hive/BigQuery. There are only "Micro-partitions", and you use "Clustering Keys" to instruct Snowflake how to sort data across them.',
      ],
    },
    crashCourse: {
      summary: 'Partitioning physically groups data into buckets (usually by date). Clustering sorts data within those buckets. Together, they allow the query engine to completely skip scanning irrelevant data blocks, saving massive time and money.',
      quickFacts: [
        'Partitioning: Good for low-cardinality values with even distribution (Dates, Months).',
        'Clustering: Good for high-cardinality values frequently filtered upon (User ID, Zip Code).',
        'Micro-partitions (Snowflake): Automatic, immutable chunks of clustered data (50MB-500MB).',
        'Z-Ordering (Databricks): A multi-dimensional clustering technique that works well across multiple columns without a strict hierarchy.',
      ],
      tips: [
        'If a BigQuery query costs $50 to run without filters, adding a `WHERE` clause on an unpartitioned column will STILL cost $50. It must scan the entire column anyway. Adding a `WHERE` clause on a partitioned column drops the cost drastically.',
      ],
    },
  },
  'data-warehousing-10': {
    tutorial: {
      explanation: [
        'A Standard View is just saved SQL. When you query `SELECT * FROM my_view`, the database executes the underlying complex SQL text at runtime. It saves no compute power; it just saves you from typing out the logic.',
        'A Materialized View (MV) is pre-computed data explicitly saved to disk. When you query `SELECT * FROM mv_sales`, the database reads the already-finished results directly from disk. The complex aggregations and joins are skipped entirely.',
        'The trade-off is freshness. Standard views compute on live data (always accurate). Materialized views must be refreshed periodically (e.g., hourly). If new data lands in the base table, the MV is instantly "stale" until the next refresh.',
      ],
      codeExamples: [
        {
          description: 'Standard View vs Materialized View',
          code: `-- 1. Standard View (Logical)
-- Always accurate, always slow on large data.
CREATE VIEW v_daily_sales AS
    SELECT date, SUM(amount) as sales 
    FROM massive_fact_table 
    GROUP BY date;
    
-- When calling this, the massive SUM() happens right now!
SELECT * FROM v_daily_sales WHERE date = '2024-01-01';


-- 2. Materialized View (Physical)
-- Super fast, but requires background refreshes.
CREATE MATERIALIZED VIEW mv_daily_sales AS
    SELECT date, SUM(amount) as sales 
    FROM massive_fact_table 
    GROUP BY date;

-- When calling this, no SUM() happens. It just reads disk!
SELECT * FROM mv_daily_sales WHERE date = '2024-01-01';

-- Manually refresh the data (Postgres syntax)
REFRESH MATERIALIZED VIEW mv_daily_sales;`,
        },
      ],
      keyTakeaways: [
        'Modern data warehouses (Snowflake, BigQuery) have automated materialized views. When you query the MV, BigQuery automatically combines the pre-computed MV results on disk WITH any new delta rows from the base table computed on the fly. This gives you blazing fast queries with zero staleness.',
        'Materialized views are ideal for dashboards (Tableau, Looker) that execute the exact same heavy aggregations thousands of times per day.',
        'dbt `materialized=\'view\'` creates a standard logical view. dbt `materialized=\'table\'` is effectively creating a manually populated materialized view.',
      ],
    },
    crashCourse: {
      summary: 'Views are saved SQL queries executed at runtime (slow, always fresh data). Materialized Views are pre-calculated tables saved to disk (fast, potentially stale data).',
      quickFacts: [
        'Standard View: Logical construct. Computes upon `SELECT`. Always fresh.',
        'Materialized View (MV): Physical table. Pre-computed. Must be refreshed.',
        'Query Rewrite (Snowflake/BigQuery): If you query a base table, but an MV exists that satisfies the query, the optimizer will silently rewrite your query to use the faster MV without you knowing!',
      ],
      tips: [
        'Do not create Materialized Views for everything. They consume storage space and cost money/compute cycles every time they refresh in the background.',
      ],
    },
  },
  'data-warehousing-11': {
    tutorial: {
      explanation: [
        'The massive paradigm shift of the 2010s was separating Storage from Compute in data warehousing (pioneered by Snowflake and BigQuery).',
        'In legacy systems (Teradata, on-prem Hadoop), storage and compute were tightly coupled on the same hardware. If you ran out of processing power, you had to buy a new server with more hard drives, even if you didn\'t need storage. This led to massive wasted resources.',
        'Snowflake stores your data centrally in AWS S3 or Google Cloud Storage (in its custom micro-partition format). When you run a query, Snowflake spins up a "Virtual Warehouse" (a cluster of EC2 compute nodes). These nodes pull the requested data from S3, compute it in memory, return the result, and immediately spin down.',
      ],
      codeExamples: [
        {
          description: 'Leveraging independent compute in Snowflake',
          code: `-- 1. Data load from external stage (Requires compute)
-- Spin up a small warehouse just to load data
USE WAREHOUSE load_wh_xsmall;
COPY INTO fact_sales FROM @s3_stage/sales.csv;

-- 2. Massive Analytical Query (Requires heavy compute)
-- Spin up a massive warehouse for 5 seconds to crunch billions of rows
ALTER WAREHOUSE analytics_wh SET WAREHOUSE_SIZE = 'X-LARGE';
USE WAREHOUSE analytics_wh;
SELECT complex_math(), SUM() FROM fact_sales GROUP BY ...;

-- Automatically suspends after 60 seconds of inactivity!
ALTER WAREHOUSE analytics_wh SET AUTO_SUSPEND = 60;

-- 3. Concurrent Dashboard Users
-- Instead of a huge warehouse, we need multiple small ones to handle 
-- 1000 Tableau users without queueing.
-- Snowflake "Multi-cluster Virtual Warehouses" automatically horizontally 
-- scales by spinning up duplicate 'SMALL' warehouses during morning rush hour.`,
        },
      ],
      keyTakeaways: [
        'Separating storage and compute means you only pay for storage indefinitely (which is extremely cheap). You only pay for compute for the exact seconds a query runs.',
        'Concurrency is solved: You can have the Data Engineering team load data using `Warehouse_A`, the Data Science team train models using `Warehouse_B`, and the CEO run dashboards on `Warehouse_C`. All three hit the exact same underlying S3 storage simultaneously with ZERO resource contention or locks.',
      ],
    },
    crashCourse: {
      summary: 'Modern cloud data warehouses separate cheap cloud storage (S3) from elastic compute engines. This allows you to scale storage infinitely and spin up compute clusters on-demand for exactly as long as needed, eliminating resource contention between teams.',
      quickFacts: [
        'Tightly Coupled (Legacy): Compute + Storage on same servers. Must scale both together. Expensive.',
        'Separated (Modern): Compute pulled from S3. Scale storage infinitely. Scale compute elastically per second.',
        'Virtual Warehouse (Snowflake): An independent compute cluster attached to central storage.',
        'Zero-Copy Cloning (Snowflake): Instantly duplicate a 10TB table for a dev environment without copying the underlying data, because the metadata pointers just point to the same S3 files.',
      ],
      tips: [
        'In interviews: Emphasize that separation of compute and storage solves the "Noisy Neighbor" problem (where one heavy data load slows down everyone else\'s queries).',
      ],
    },
  },
  'data-warehousing-12': {
    tutorial: {
      explanation: [
        'Change Data Capture (CDC) is a technique used to identify and capture changes made to data in a database and deliver those changes in real-time to a downstream process (like a Data Warehouse).',
        'Instead of running a heavy batch job every night (`SELECT * FROM table WHERE updated_at > yesterday`), CDC directly reads the database\'s internal Write-Ahead Log (WAL in Postgres, Binlog in MySQL).',
        'Because it reads the transaction log natively, CDC introduces near-zero load on the production OLTP database and captures every single state change, including rapidly deleted records that a batch job would miss.',
      ],
      codeExamples: [
        {
          description: 'Debezium CDC Architecture',
          code: `# Debezium is the open-source industry standard for CDC
# Built on top of Apache Kafka Source Connectors

1. User UPDATEs cart in Postgres.
2. Postgres writes the change to the WAL (Write-Ahead Log) for durability.
3. Debezium Connector reads the WAL in millisecond near-real-time.
4. Debezium generates a JSON event:
{
    "op": "u", # 'u' = update, 'c' = create, 'd' = delete
    "before": {"id": 1, "item": "shoes", "qty": 1},
    "after": {"id": 1, "item": "shoes", "qty": 2},
    "source": {"db": "prod", "table": "carts", "ts_ms": 16900000}
}
5. Debezium pushes this JSON event to a Kafka Topic.
6. Snowflake/BigQuery consumes the Kafka topic and UPSERTs into the Warehouse.`,
        },
      ],
      keyTakeaways: [
        'CDC allows for real-time (streaming) ELT architectures.',
        'Batch ELT is subject to "Watermark Issues" (what if a slow transaction committed late but had an older `updated_at` timestamp? Your batch job misses it). Log-based CDC captures it perfectly in sequential order.',
        'Implementing CDC usually requires Debezium + Kafka. However, managed ELT tools like Fivetran and Airbyte now offer log-based CDC natively with just a few clicks.',
      ],
    },
    crashCourse: {
      summary: 'Change Data Capture (CDC) streams row-level changes (Inserts/Updates/Deletes) from operational databases to the data warehouse in real-time by reading the database\'s internal transaction logs (WAL/Binlog).',
      quickFacts: [
        'Batch Extract (Legacy): Query database periodically with `WHERE updated_at > X`. Puts heavy load on DB. Misses transient deletes.',
        'Log-based CDC (Modern): Reads Postgres WAL or MySQL Binlog. Near-zero impact on DB. Captures every state change.',
        'Debezium: The most popular open-source CDC connector.',
        'Payload: CDC events usually include the `before` state and the `after` state of the row.',
      ],
      tips: [
        'CDC is the bridge between OLTP (transactional databases) and Streaming architectures. It allows legacy monoliths to emit streaming events without needing application code changes.',
      ],
    },
  },
  'data-warehousing-13': {
    tutorial: {
      explanation: [
        'Because Data Warehouses govern business-critical KPIs (Revenue, User Growth), the data must be trustworthy. Data quality testing is integrated directly into the CI/CD pipeline of modern data stacks.',
        'dbt natively supports generic tests (e.g., asserting a column is `not_null`, `unique`, or `accepted_values`) and singular tests (custom SQL queries that should return 0 rows if passing).',
        'Great Expectations (GE) is another popular open-source framework used earlier in the pipeline (e.g., in Airflow or Spark) to validate data schemas, statistical distribution of values, and ranges before the data even enters the data warehouse.',
      ],
      codeExamples: [
        {
          description: 'Implementing Data Quality Tests with dbt',
          code: `# schema.yml (dbt Testing Definitions)

version: 2

models:
  - name: fact_orders
    description: "One row per completed order"
    columns:
      - name: order_id
        description: "Primary key"
        tests:
          - unique
          - not_null

      - name: status
        tests:
          - accepted_values:
              values: ['placed', 'shipped', 'delivered', 'returned']

      - name: customer_id
        tests:
          - not_null
          # Referential integrity check! Guarantees the customer 
          # actually exists in the dim_customers table.
          - relationships:
              to: ref('dim_customers')
              field: id

# dbt runs these tests by automatically wrapping the logic into 
# "SELECT * FROM fact_orders WHERE order_id IS NULL". 
# If it returns any rows, the test fails!`,
        },
      ],
      keyTakeaways: [
        'Never trust upstream software engineers. An API update will inevitably change a column type or start sending NULLs. Automated testing catches this before inaccurate dashboards reach the CEO.',
        'A strong pipeline runs tests on the staging (`stg_`) models first. If staging tests fail, the DAG aborts and the downstream production (`fact/dim`) models are not updated, preventing the corruption from spreading.',
      ],
    },
    crashCourse: {
      summary: 'Data Quality testing ensures that pipelines fail gracefully when upstream schemas or distributions change unexpectedly. dbt provides built-in testing for uniqueness, nulls, and relationships.',
      quickFacts: [
        'Data Profiling: Analyzing data to understand its distribution and constraints before writing tests.',
        'dbt generic tests: `unique`, `not_null`, `accepted_values`, `relationships`.',
        'Singular Test: A custom SQL query that fails if it returns more than 0 rows.',
        'Data Contract: An agreement between the software engineers producing data and the data engineers consuming it regarding expected schemas.',
      ],
      tips: [
        'At minimum, every primary key in your data warehouse should have a `unique` and `not_null` test attached to it. Every foreign key should have a `relationships` test to preserve referential integrity.',
      ],
    },
  },
};
