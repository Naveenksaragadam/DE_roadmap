// Apache Spark — Topic Deep-Dive Content (Part 2: Streaming, K8s, Optimization)
export const sparkContent2 = {
  'apache-spark-7': {
    tutorial: {
      explanation: [
        'Structured Streaming is Spark\'s scalable, fault-tolerant streaming engine built on the Spark SQL engine. You can express streaming computations the same way you express batch computations on static data.',
        'It uses a micro-batch processing model where the data stream is processed as a continuous series of small batch jobs. You define watermarks to handle late-arriving data and stateful operations (like running aggregations over a time window).',
      ],
      codeExamples: [
        {
          description: 'Stateful streaming with events and watermarking',
          code: `from pyspark.sql.functions import window

# Read from Kafka
events_df = spark.readStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "localhost:9092") \\
    .option("subscribe", "clickstream") \\
    .load()

# Stateful processing with sliding window
# Watermark handles late data (up to 15 mins late allowed)
session_aggregates = events_df \\
    .withWatermark("event_time", "15 minutes") \\
    .groupBy(
        "user_id", 
        # 20-minute windows, ticking every 10 minutes
        window("event_time", "20 minutes", "10 minutes")
    ) \\
    .agg(
        count("*").alias("interactions"),
        sum("purchase_amount").alias("revenue")
    )

# Write to console or Delta table
query = session_aggregates.writeStream \\
    .outputMode("update") \\
    .format("console") \\
    .trigger(processingTime='1 minute') \\
    .start()
    
query.awaitTermination()`,
        },
      ],
      keyTakeaways: [
        'Watermarks are critical for stateful streaming. They tell Spark when it is safe to drop old state from memory. Without watermarks, a stateful streaming job will eventually crash with an OutOfMemory error.',
        'Output modes: `append` (only new rows), `update` (only changed rows/aggregations), and `complete` (writes the entire state table every trigger).',
        'Use `trigger(processingTime=...)` to control the micro-batch interval, or `trigger(availableNow=True)` for incremental batch processing (great for cost-savings).',
      ],
    },
    crashCourse: {
      summary: 'Structured Streaming treats live data streams as an unbounded append-only table. It uses micro-batching to guarantee end-to-end exactly-once fault tolerance via checkpointing and Write Ahead Logs (WAL).',
      quickFacts: [
        'Micro-batch engine: ~100ms latency minimum. Not appropriate for ultra-low (<10ms) latency needs.',
        'Watermark: A moving threshold of time dictating how late data can arrive before being discarded.',
        'Checkpointing: Required for streaming to recover gracefully from failure.',
        'Triggers: Define the timing of stream processing (Continuous, ProcessingTime, Once/AvailableNow).',
      ],
      tips: [
        'Never run a production streaming job without `option("checkpointLocation", "s3://...")` — without it, the stream cannot resume after a cluster restart.',
      ],
    },
  },
  'apache-spark-8': {
    tutorial: {
      explanation: [
        'Delta Lake is an open-source storage layer that brings ACID (Atomicity, Consistency, Isolation, Durability) transactions to Apache Spark and big data workloads on data lakes (S3/HDFS).',
        'Traditional Parquet files on S3 cannot be safely updated or deleted concurrently. Delta Lake wraps Parquet files with a transaction log (the `_delta_log` directory) containing JSON and Checkpoint files. When Spark reads a Delta table, it uses this log to assemble the correct point-in-time snapshot of the data.',
      ],
      codeExamples: [
        {
          description: 'Delta Lake UPSERT (MERGE INTO) pattern',
          code: `from delta.tables import DeltaTable

# The target Delta table we want to update
delta_table = DeltaTable.forPath(spark, "s3://warehouse/users_delta")

# The incoming micro-batch of updates/inserts
updates_df = spark.read.parquet("s3://incoming/daily_users")

# Execute ACID Merge (Upsert)
delta_table.alias("target") \\
    .merge(
        updates_df.alias("source"),
        "target.user_id = source.user_id"
    ) \\
    .whenMatchedUpdate(set = {
        "email": "source.email",
        "last_login": "source.last_login",
        "status": "source.status"
    }) \\
    .whenNotMatchedInsertAll() \\
    .execute()

# Delta enables Time Travel (query historical versions)
df_yesterday = spark.read.format("delta") \\
    .option("versionAsOf", 10) \\
    .load("s3://warehouse/users_delta")`,
        },
      ],
      keyTakeaways: [
        'Delta enables reliable UPSERTS (MERGE) and DELETES on data lakes, which is essential for GDPR compliance and CDC (Change Data Capture) pipelines.',
        'Time Travel: Because Delta retains old Parquet files, you can query older versions of a table for debugging or rollback.',
        'OPTIMIZE and VACUUM commands are required maintenance in Delta. `OPTIMIZE` compacts small files. `VACUUM` physically deletes old historical files to save storage costs.',
      ],
    },
    crashCourse: {
      summary: 'Delta Lake turns a Data Lake into a Lakehouse. It provides ACID transactions, scalable metadata handling, and unifies streaming and batch data processing on top of existing data lakes.',
      quickFacts: [
        'Transaction Log (`_delta_log`): The source of truth for ACID guarantees.',
        'Merge/Upsert: Safely update existing records without rewriting entire partitions.',
        'Time Travel: Select data "As Of" a specific timestamp or version number.',
        'Schema Enforcement/Evolution: Prevents bad writes; allows safe addition of new columns (`mergeSchema="true"`).',
      ],
      tips: [
        'Always schedule a daily `VACUUM` job (e.g., retain 7 days of history) to prevent S3 storage costs from exploding due to kept historical files.',
        'Run `OPTIMIZE table ZORDER BY (frequently_filtered_col)` to drastically speed up read performance.',
      ],
    },
  },
  'apache-spark-9': {
    tutorial: {
      explanation: [
        'Deploying Spark traditionally meant managing large, static Hadoop YARN clusters. Modern data engineering relies heavily on deploying Spark natively on Kubernetes (K8s).',
        'In Kubernetes, you submit a job using the `spark-submit` command or the Spark Operator. The K8s API server creates a Pod for the Spark Driver. The Driver then requests K8s to launch Executor Pods. When the job finishes, the Executor Pods are destroyed, ensuring zero idle resource cost.',
      ],
      codeExamples: [
        {
          description: 'Submitting a Spark Job to K8s via Spark Operator',
          code: `# YAML definition for Kubernetes SparkApplication
apiVersion: "sparkoperator.k8s.io/v1beta2"
kind: SparkApplication
metadata:
  name: pyspark-production-job
  namespace: spark-jobs
spec:
  type: Python
  mode: cluster
  image: "gcr.io/company/spark-python:3.4.0"
  mainApplicationFile: "s3a://spark-jobs/main.py"
  sparkVersion: "3.4.0"
  driver:
    cores: 2
    memory: "4g"
    serviceAccount: spark-driver-sa
  executor:
    cores: 4
    memory: "8g"
    instances: 20
  dynamicAllocation:
    enabled: true
    initialExecutors: 5
    maxExecutors: 50`,
        },
      ],
      keyTakeaways: [
        'K8s provides perfect isolation. Dependencies are baked into Docker images, preventing "dependency hell" across different Spark jobs running on the same cluster.',
        'Dynamic Allocation is critical for cost savings in the cloud: Spark scales Executor Pods up when the task backlog grows, and scales them down when idle.',
        'Unlike YARN, Kubernetes native deployment treats Spark jobs equally alongside web services and databases.',
      ],
    },
    crashCourse: {
      summary: 'Kubernetes is the modern standard for Spark orchestration. It uses Docker images to isolate dependencies and dynamically provisions and destroys Driver and Executor Pods to maximize resource efficiency.',
      quickFacts: [
        'Driver Pod: Coordinates the job. If it dies, the job fails.',
        'Executor Pods: Dynamically spun up by the Driver to process data.',
        'Spark Operator: A K8s extension (CRD) that manages the lifecycle of Spark applications declaratively.',
        'Dynamic Allocation: Automatically scaling executors up/down based on workload.',
      ],
      tips: [
        'Ensure your K8s node groups are autoscaling so K8s can actually give Spark the new Pods it requests.',
        'Use AWS EMR on EKS or GCP Dataproc on GKE for managed K8s Spark experiences without the operational overhead.',
      ],
    },
  },
  'apache-spark-10': {
    tutorial: {
      explanation: [
        'The Spark UI is your primary diagnostic tool running on port 4040 of the Driver. It visualizes the execution of your jobs, stages, and tasks, alongside environmental configuration and memory usage.',
        'The most critical tabs are: "SQL" (to view the Catalyst execution DAG with metrics for each node), "Stages" (to find skewed tasks or GC pauses), and "Executors" (to see memory utilization, shuffle writes, and active tasks per node).',
      ],
      codeExamples: [
        {
          description: 'Key metrics to look for in the Spark UI',
          code: `# 1. Locating Stragglers (Data Skew)
# In the "Stages" tab -> Look at the "Summary Metrics" percentiles.
# If Min/25th/Median times are 2 seconds, but Max time is 5 minutes...
# YOU HAVE DATA SKEW. 
# Action: Implement Salting or Broadcast Join.

# 2. Garbage Collection (GC) Thrashing
# In the "Executors" tab -> Look at "Task Time" vs "GC Time". 
# If GC Time > 10% of Task Time, your executors are constantly pausing 
# to free memory instead of computing data.
# Action: Increase executor memory or reduce partition size.

# 3. Spill to Disk
# In "Executors" -> Look for "Spill (Memory)" and "Spill (Disk)".
# Spark couldn't fit the shuffle/sort block in memory, so it wrote to temp disk.
# This causes massive I/O slowdowns.
# Action: Increase spark.sql.shuffle.partitions to make chunks smaller.`,
        },
      ],
      keyTakeaways: [
        'A Spark Stage is a boundary created by a network shuffle (e.g., a `.join()` or `.groupBy()`). Tasks within a stage run strictly in parallel without network communication.',
        'If a job fails, always look at the Stages tab, find the failed stage, and read the exception from the specific failed Task. The Driver error log is often just generic "Task Failed" noise.',
      ],
    },
    crashCourse: {
      summary: 'The Spark UI (port 4040) is essential for profiling jobs. It provides visual DAGs, task-level execution times to identify skew, and memory metrics to identify GC overhead or spilling.',
      quickFacts: [
        'SQL Tab: Visualizes physical execution plan and total rows output per step.',
        'Jobs Tab: High-level overview of Actions triggered.',
        'Stages Tab: Visualizes tasks and shuffle boundaries. The best place for finding skew.',
        'Executors Tab: Memory usage, thread dumps, GC time, and disk spills per node.',
        'Spill (Disk/Memory): Extremely slow; means your partitions are too large for executor memory.',
      ],
      tips: [
        'When writing complex Spark SQL, add `.withColumn("debug", lit("step_1"))` checkpoints. This makes the step visible as a named node in the Catalyst DAG visualization.',
      ],
    },
  },
  'apache-spark-11': {
    tutorial: {
      explanation: [
        'Adaptive Query Execution (AQE) is Spark 3.0\'s flagship optimization feature. Unlike earlier versions where Catalyst created a plan upfront and stuck to it, AQE dynamically adjusts the query plan at runtime using exact statistics gathered during execution.',
        'AQE uses the exact size of data output by shuffle stages to perform three major optimizations: 1) Dynamically coalescing shuffle partitions, 2) Dynamically switching join strategies, and 3) Dynamically optimizing skewed joins.',
      ],
      codeExamples: [
        {
          description: 'Configuring Adaptive Query Execution (AQE)',
          code: `# Enable AQE (Default in Spark 3.2+)
spark.conf.set("spark.sql.adaptive.enabled", "true")

# 1. Dynamic Partition Coalescing
# Merges tiny partitions after a shuffle into optimally sized ones
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "128MB")

# 2. Dynamic Join Strategy Swap
# If a filter reduces a table to < 10MB during runtime, AQE switches 
# a slow Sort-Merge Join into a fast Broadcast Hash Join mid-flight!
spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "true")

# 3. Dynamic Skew Join Optimization
# AQE detects straggler partitions during runtime and automatically 
# splits them into smaller sub-partitions to eliminate the straggler.
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")`,
        },
      ],
      keyTakeaways: [
        'Before AQE, predicting exact partition sizes after complex filters was impossible, leading to either OOMs or millions of tiny partitions. AQE solves this by waiting until the shuffle completes, measuring the data, and adjusting the next stage.',
        'Skew join optimization is revolutionary: it automatically splits a single massive skewed partition into smaller tasks and replicates the corresponding dimension key to match, saving you from writing complex manual salting code.',
      ],
    },
    crashCourse: {
      summary: 'AQE changes query plans at runtime based on actual data sizes. It automatically merges tiny partitions, converts sort-merge joins to broadcast joins if data shrinks, and fixes data skew on the fly.',
      quickFacts: [
        'Available in Spark 3.0+, enabled by default in Spark 3.2+.',
        'Coalescing: Combines small post-shuffle partitions to prevent the "small files" problem.',
        'Demotion: Converts Sort Merge Join to Broadcast Hash Join if a runtime filter makes a table very small.',
        'Anti-Skew: Automatically detects and splits massive partitions that are slowing down the job.',
      ],
      tips: [
        'Always leave AQE enabled. If your job performs worse with AQE (rare), check if you have excessive User Defined Functions (UDFs) which block Catalyst and AQE from seeing statistics.',
      ],
    },
  },
  'apache-spark-12': {
    tutorial: {
      explanation: [
        'A UDF (User Defined Function) allows you to execute arbitrary Python/Scala code row-by-row in a DataFrame. However, Python UDFs are notorious performance killers in PySpark.',
        'When you use a Python UDF, Spark must serialize the data out of the optimized JVM memory space, send it through a local socket to a Python worker process on the executor, run the python function, serialize the result, and send it back to the JVM. This causes massive serialization overhead.',
        'Pandas UDFs (Vectorized UDFs) use Apache Arrow to transfer data in memory-efficient batches instead of row-by-row, offering 10x-100x performance improvements over standard Python UDFs.',
      ],
      codeExamples: [
        {
          description: 'Built-in functions vs Standard UDF vs Pandas UDF',
          code: `from pyspark.sql.functions import udf, pandas_udf, col, upper
import pandas as pd

# 1. Built-in Function (FASTEST - Runs in JVM directly via Tungsten)
# ALWAYS TRY THIS FIRST.
df.select(upper(col("name")).alias("name_upper"))

# 2. Standard Python UDF (SLOWEST - JVM to Python serialization per row)
# Use ONLY if absolutely unavoidable logic impossible in SQL.
@udf(returnType="string")
def to_upper_udf(name):
    # This runs millions of times context-switching between JVM and Python
    return name.upper() if name else None

df.select(to_upper_udf(col("name")).alias("name_upper"))

# 3. Pandas Vectorized UDF (FAST - Uses Apache Arrow in batches)
# Use for complex Python libraries (scikit-learn, scipy)
@pandas_udf("string")
def to_upper_pandas(names: pd.Series) -> pd.Series:
    # Processes thousands of rows at once in a pandas Series
    return names.str.upper()

df.select(to_upper_pandas(col("name")).alias("name_upper"))`,
        },
      ],
      keyTakeaways: [
        'Spark\'s built-in SQL functions (`pyspark.sql.functions`) are written in Scala and execute quickly inside the JVM. Because Catalyst understands them, it can optimize them (e.g. pushdown filters).',
        'Standard Python UDFs act as a complete black box to the Catalyst Optimizer. Spark cannot optimize UDF logic.',
        'If you must write custom logic, check if you can express it using nested SQL `when().otherwise()` or `expr()` first. If not, write a Pandas UDF, not a standard UDF.',
      ],
    },
    crashCourse: {
      summary: 'Built-in SQL functions are optimized by Catalyst and run in the JVM very fast. Standard Python UDFs serialize data back and forth to a Python process, killing performance. Pandas UDFs use Arrow for fast batch processing.',
      quickFacts: [
        'Built-in functions (Scala/JVM): Lightning fast, natively optimized.',
        'Python UDF: Slow, row-by-row serialization overhead, black box to optimizer.',
        'Pandas/Vectorized UDF: Batch processing using Apache Arrow, 10-100x faster than standard UDFs.',
        'Apache Arrow: In-memory columnar data format that eliminates serialization overhead between JVM and Python.',
      ],
      tips: [
        'Many developers write UDFs for JSON parsing. Don\'t! Spark has incredibly fast native `from_json`, `get_json_object`, and `to_json` functions.',
      ],
    },
  },
  'apache-spark-13': {
    tutorial: {
      explanation: [
        'Spark memory is divided into explicit regions. Total Executor Memory consists of Reserved Memory (hardcoded 300MB), User Memory (for your custom Python objects/UDFs), and the Spark Memory Fraction (default 60%).',
        'The Spark Memory Fraction is further dynamically divided into Storage Memory (for cached dataframes via `persist()`) and Execution Memory (scratch space for shuffling, joining, sorting, and aggregations).',
      ],
      codeExamples: [
        {
          description: 'Executor Tuning for Memory Efficiency',
          code: `# Spark configuration parameters passed during spark-submit

# Total container memory requested from Yarn/K8s
# Needs overhead factor because JVM/Python process takes extra off-heap memory
--executor-memory 8g
# Overhead is roughly 10% of executor-memory
--executor-memoryOverhead 1g

# If you are doing massive SortMergeJoins and seeing "Spill to Disk"
# You might want to dedicate more memory to Spark Execution vs User Objects
--conf spark.memory.fraction=0.8

# If you are heavily aggressive with caching/persistence
# Change how much of the Spark Memory Fraction is guaranteed for Storage
--conf spark.memory.storageFraction=0.6 # Default is 0.5 (50%)

# Essential memory troubleshooting flag in PySpark
# Enables off-heap execution arrays
--conf spark.memory.offHeap.enabled=true
--conf spark.memory.offHeap.size=2g`,
        },
      ],
      keyTakeaways: [
        'If execution memory runs out during a heavy sort or groupBy, Spark safely spills intermediate data to local disk. This prevents failure but destroys performance.',
        'If storage memory runs out while caching, Spark will evict old blocks using LRU (Least Recently Used), or spill them to disk depending on your `StorageLevel`.',
        'If User Memory runs out (e.g. accumulating massive arrays in a Python UDF), the executor will throw an OutOfMemoryError (OOM) and crash.',
      ],
    },
    crashCourse: {
      summary: 'Executor memory is split into Execution (for shuffle/sort), Storage (for caching), and User (for custom code). Balancing these prevents OOM crashes and disk spills.',
      quickFacts: [
        'Execution Memory: Used for short-lived data during joins, sorts, aggregations.',
        'Storage Memory: Used for cached data (`df.cache()`). Shares boundary dynamically with Execution memory.',
        'User Memory: Used by your custom PySpark python objects and UDFs.',
        'Off-heap Memory: Project Tungsten\'s way of bypassing Java Garbage Collection for raw speed.',
        'OOM Driver: Caused by calling `collect()` on huge data.',
        'OOM Executor: Caused by massive UDF arrays or extreme data skew in a single partition.',
      ],
      tips: [
        'If your job fails with "Container killed by YARN for exceeding memory limits", increase `spark.yarn.executor.memoryOverhead` instead of `spark.executor.memory`. The PySpark python worker process requires off-heap overhead!',
      ],
    },
  },
};
