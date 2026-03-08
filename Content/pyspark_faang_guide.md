# PySpark FAANG Interview Reference Guide

## Table of Contents
1. [Fundamentals](#fundamentals)
2. [Core API Mastery](#core-api-mastery)
3. [Performance Optimization](#performance-optimization)
4. [Advanced Processing](#advanced-processing)
5. [MLlib & Productionization](#mllib--productionization)
6. [Interview Question Patterns](#interview-question-patterns)
7. [Configuration Cheat Sheet](#configuration-cheat-sheet)

---

## Fundamentals

### Spark Architecture
```
Driver Program
├── SparkContext
├── DAG Scheduler → TaskScheduler
└── Cluster Manager
    ├── Executor 1 (Worker Node)
    │   ├── Task 1 → Cache/Storage
    │   └── Task 2
    └── Executor 2 (Worker Node)
        ├── Task 3
        └── Task 4
```

**Key Points:**
- Driver: Single point of failure, holds SparkContext
- Executors: JVM processes, execute tasks in parallel
- DAG: Directed Acyclic Graph of RDD transformations
- Stages: Bounded by shuffle operations (wide transformations)

### RDD Lineage vs DataFrame Execution Plan
```python
# RDD Lineage (physical execution path)
rdd = sc.textFile("data.txt")
words = rdd.flatMap(lambda line: line.split())
word_counts = words.map(lambda word: (word, 1)).reduceByKey(lambda a, b: a + b)
print(word_counts.toDebugString())  # Shows lineage graph

# DataFrame Execution Plan (logical + physical)
df = spark.read.text("data.txt")
word_counts = df.select(explode(split(col("value"), " ")).alias("word")) \
                .groupBy("word").count()
word_counts.explain(extended=True)  # Shows all plans
```

### Lazy Evaluation Deep Dive
**Transformations** (lazy):
- `map`, `filter`, `flatMap`, `union`, `join`, `groupBy`
- Build execution plan, no computation

**Actions** (eager):
- `collect`, `count`, `take`, `save`, `foreach`
- Trigger job execution

```python
# Logical Plan → Optimized Logical Plan → Physical Plan → Code Generation
df.explain("extended")  # Shows all optimization phases
```

### SparkSession Initialization
```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("FAANG_Interview_App") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .config("spark.sql.adaptive.skewJoin.enabled", "true") \
    .config("spark.sql.execution.arrow.pyspark.enabled", "true") \
    .config("spark.executor.memory", "8g") \
    .config("spark.executor.cores", "4") \
    .config("spark.sql.shuffle.partitions", "200") \
    .config("spark.default.parallelism", "100") \
    .getOrCreate()
```

---

## Core API Mastery

### RDDs - Advanced Operations

#### Transformations
```python
# mapPartitions - Process entire partitions
def process_partition(iterator):
    # Expensive setup once per partition
    model = load_ml_model()
    for record in iterator:
        yield model.predict(record)

rdd.mapPartitions(process_partition)

# treeReduce - Hierarchical reduction (O(log n) depth)
rdd.treeReduce(lambda x, y: x + y, depth=3)

# Custom partitioner
class CustomPartitioner:
    def __init__(self, num_partitions):
        self.num_partitions = num_partitions
    
    def getPartition(self, key):
        return hash(key) % self.num_partitions

rdd.partitionBy(CustomPartitioner(10))
```

#### Actions
```python
# fold - With zero value
rdd.fold(0, lambda acc, x: acc + x)

# aggregate - Different types for accumulator and combiner
rdd.aggregate(
    (0, 0),  # Zero value: (sum, count)
    lambda acc, x: (acc[0] + x, acc[1] + 1),  # Seq op
    lambda acc1, acc2: (acc1[0] + acc2[0], acc1[1] + acc2[1])  # Comb op
)
```

#### Partitioning Strategies
```python
# Range partitioning (for sorted data)
rdd.partitionBy(RangePartitioner(numPartitions=10, rdd))

# Hash partitioning (default)
rdd.partitionBy(HashPartitioner(numPartitions=10))

# Custom partitioning for skewed data
class SkewPartitioner:
    def getPartition(self, key):
        if key in high_frequency_keys:
            return hash(key) % (num_partitions // 2)
        return (num_partitions // 2) + (hash(key) % (num_partitions // 2))
```

### DataFrames - Advanced DSL

#### Complex Expressions
```python
from pyspark.sql.functions import *
from pyspark.sql.types import *

# expr() for complex SQL expressions
df.select(expr("CASE WHEN age > 21 THEN 'adult' ELSE 'minor' END as category"))

# selectExpr() for SQL-like column expressions
df.selectExpr(
    "name",
    "age * 2 as double_age",
    "substr(name, 1, 1) as first_initial"
)

# Complex type handling
schema = StructType([
    StructField("user", StructType([
        StructField("id", IntegerType()),
        StructField("profile", MapType(StringType(), StringType()))
    ])),
    StructField("events", ArrayType(StructType([
        StructField("timestamp", TimestampType()),
        StructField("action", StringType())
    ])))
])

# Accessing nested data
df.select(
    col("user.id").alias("user_id"),
    col("user.profile")["email"].alias("email"),
    explode(col("events")).alias("event")
).select(
    "user_id", "email",
    col("event.timestamp"), col("event.action")
)
```

#### Window Functions
```python
from pyspark.sql.window import Window

# Ranking functions
window = Window.partitionBy("department").orderBy(desc("salary"))
df.withColumn("rank", row_number().over(window)) \
  .withColumn("dense_rank", dense_rank().over(window)) \
  .withColumn("percent_rank", percent_rank().over(window))

# Analytical functions
window = Window.partitionBy("department").orderBy("date") \
               .rowsBetween(Window.unboundedPreceding, Window.currentRow)
df.withColumn("running_sum", sum("amount").over(window)) \
  .withColumn("running_avg", avg("amount").over(window))

# Lead/Lag
window = Window.partitionBy("user_id").orderBy("timestamp")
df.withColumn("next_action", lead("action", 1).over(window)) \
  .withColumn("prev_action", lag("action", 1).over(window))
```

### Catalyst Optimizer

#### Plan Visualization
```python
# Show all optimization phases
df.explain("extended")

# Explain modes
df.explain("simple")    # Physical plan only
df.explain("extended")  # Logical, optimized logical, and physical plans
df.explain("codegen")   # Java code generation
df.explain("cost")      # Cost-based optimization stats
df.explain("formatted") # Formatted physical plan
```

#### UDF Performance Pitfalls
```python
# ❌ Python UDF (slow - serialization overhead)
from pyspark.sql.functions import udf
@udf(returnType=StringType())
def slow_udf(s):
    return s.upper()

# ✅ Built-in function (vectorized)
df.select(upper(col("name")))

# ✅ SQL expression (compiled)
df.select(expr("upper(name)"))

# ✅ Pandas UDF (vectorized Python)
from pyspark.sql.functions import pandas_udf
import pandas as pd

@pandas_udf(returnType=StringType())
def vectorized_upper(s: pd.Series) -> pd.Series:
    return s.str.upper()
```

---

## Performance Optimization

### Join Strategies

#### Broadcast Hash Join
```python
# Automatic broadcast (< spark.sql.autoBroadcastJoinThreshold = 10MB)
small_df.join(large_df, "key")  # Spark decides

# Explicit broadcast
from pyspark.sql.functions import broadcast
large_df.join(broadcast(small_df), "key")

# Configuration
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "100MB")
```

#### Sort Merge Join
```python
# Default for large tables
# Both sides sorted and partitioned by join key
df1.join(df2, "key")  # Uses SMJ if both sides are large

# Optimize by pre-sorting
df1_sorted = df1.sortWithinPartitions("key")
df2_sorted = df2.sortWithinPartitions("key")
result = df1_sorted.join(df2_sorted, "key")
```

#### Bucket Join
```python
# Pre-partition and sort data during write
df1.write \
   .bucketBy(10, "key") \
   .sortBy("key") \
   .saveAsTable("bucketed_table1")

df2.write \
   .bucketBy(10, "key") \
   .sortBy("key") \
   .saveAsTable("bucketed_table2")

# Join without shuffle
bucketed_df1 = spark.table("bucketed_table1")
bucketed_df2 = spark.table("bucketed_table2")
result = bucketed_df1.join(bucketed_df2, "key")  # No shuffle!
```

### Data Skew Solutions

#### Salting Technique
```python
import random
from pyspark.sql.functions import rand, lit, array, explode

# Detect skew
key_counts = df.groupBy("key").count()
skewed_keys = key_counts.filter(col("count") > threshold).select("key")

# Salt skewed keys
SALT_BUCKETS = 100

def add_salt(df, join_keys, salt_buckets):
    return df.withColumn("salt", (rand() * salt_buckets).cast("int")) \
             .withColumn("salted_key", concat_ws("_", col("key"), col("salt")))

# For dimension table, duplicate with all salt values
def replicate_with_salt(df, salt_buckets):
    salts = [lit(i) for i in range(salt_buckets)]
    return df.withColumn("salt", explode(array(*salts))) \
             .withColumn("salted_key", concat_ws("_", col("key"), col("salt")))

# Apply salting
salted_fact = add_salt(fact_df, ["key"], SALT_BUCKETS)
replicated_dim = replicate_with_salt(dim_df, SALT_BUCKETS)
result = salted_fact.join(replicated_dim, "salted_key")
```

#### Isolated Broadcast Map
```python
# Handle mixed skew scenario
def skew_join(large_df, small_df, join_key, skew_threshold=1000):
    # Identify skewed keys
    key_counts = large_df.groupBy(join_key).count()
    skewed_keys = key_counts.filter(col("count") > skew_threshold) \
                           .select(join_key).rdd.map(lambda x: x[0]).collect()
    
    # Split large DataFrame
    skewed_large = large_df.filter(col(join_key).isin(skewed_keys))
    normal_large = large_df.filter(~col(join_key).isin(skewed_keys))
    
    # Split small DataFrame
    skewed_small = small_df.filter(col(join_key).isin(skewed_keys))
    normal_small = small_df.filter(~col(join_key).isin(skewed_keys))
    
    # Normal join with broadcast
    normal_result = normal_large.join(broadcast(normal_small), join_key)
    
    # Skewed join with salting
    salted_result = add_salt(skewed_large, [join_key], 100) \
                   .join(replicate_with_salt(skewed_small, 100), "salted_key")
    
    return normal_result.unionByName(salted_result.drop("salt", "salted_key"))
```

### Storage Levels & Caching
```python
from pyspark import StorageLevel

# Memory-only (fastest, risky for large datasets)
df.persist(StorageLevel.MEMORY_ONLY)

# Memory + Disk (recommended for most cases)
df.persist(StorageLevel.MEMORY_AND_DISK)

# Serialized (save memory, CPU overhead)
df.persist(StorageLevel.MEMORY_AND_DISK_SER)

# Off-heap (Tungsten, no GC pressure)
df.persist(StorageLevel.OFF_HEAP)

# Replication (fault tolerance)
df.persist(StorageLevel.MEMORY_AND_DISK_2)

# Check cache status
spark.catalog.cacheTable("table_name")
spark.catalog.isCached("table_name")
spark.catalog.uncacheTable("table_name")
```

### Tungsten Optimization

#### Whole-Stage Code Generation
```python
# Check if code generation is enabled
spark.conf.get("spark.sql.codegen.wholeStage")  # Should be 'true'

# Disable for debugging
spark.conf.set("spark.sql.codegen.wholeStage", "false")

# View generated code
df.explain("codegen")
```

#### Memory Management Formulas
```python
# Executor memory allocation
total_executor_memory = executor_memory_gb * 1024  # MB
executor_memory_fraction = 0.6  # Default spark.executor.memory.fraction
storage_fraction = 0.5  # spark.executor.memory.storageFraction

execution_memory = total_executor_memory * executor_memory_fraction * (1 - storage_fraction)
storage_memory = total_executor_memory * executor_memory_fraction * storage_fraction
user_memory = total_executor_memory * (1 - executor_memory_fraction)

# Optimal partition size calculation
target_partition_size_mb = 128  # Sweet spot
num_partitions = total_data_size_mb / target_partition_size_mb

# Shuffle partition sizing
total_cores = num_executors * executor_cores
optimal_shuffle_partitions = total_cores * 2  # 2-3x cores
```

### Cost-Based Optimization (CBO)
```python
# Enable CBO
spark.conf.set("spark.sql.cbo.enabled", "true")
spark.conf.set("spark.sql.cbo.joinReorder.enabled", "true")
spark.conf.set("spark.sql.cbo.planStats.enabled", "true")

# Collect table statistics
spark.sql("ANALYZE TABLE my_table COMPUTE STATISTICS")
spark.sql("ANALYZE TABLE my_table COMPUTE STATISTICS FOR COLUMNS col1, col2")

# Check statistics
spark.sql("DESCRIBE EXTENDED my_table").show()
```

### Garbage Collection Tuning
```python
# G1GC configuration (recommended for Spark)
gc_configs = {
    "spark.executor.extraJavaOptions": 
        "-XX:+UseG1GC "
        "-XX:MaxGCPauseMillis=200 "
        "-XX:G1HeapRegionSize=16m "
        "-XX:+G1PrintRegionRememberedSetInfo "
        "-XX:+PrintGC "
        "-XX:+PrintGCDetails "
        "-XX:+PrintGCTimeStamps"
}

# Apply configuration
for key, value in gc_configs.items():
    spark.conf.set(key, value)
```

---

## Advanced Processing

### Structured Streaming

#### Basic Stream Processing
```python
from pyspark.sql.streaming import *

# Read from Kafka
kafka_df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "events") \
    .option("startingOffsets", "latest") \
    .load()

# Parse JSON data
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType, TimestampType

schema = StructType([
    StructField("user_id", StringType()),
    StructField("event_time", TimestampType()),
    StructField("event_type", StringType())
])

events_df = kafka_df.select(
    from_json(col("value").cast("string"), schema).alias("data")
).select("data.*")
```

#### Event-time vs Processing-time
```python
# Event-time windowing
windowed_counts = events_df \
    .withWatermark("event_time", "10 minutes") \
    .groupBy(
        window(col("event_time"), "5 minutes", "1 minute"),  # 5-min window, 1-min slide
        col("event_type")
    ).count()

# Processing-time trigger
query = windowed_counts.writeStream \
    .outputMode("update") \
    .trigger(processingTime="30 seconds") \
    .format("console") \
    .start()

# Event-time trigger (once watermark passes)
query = windowed_counts.writeStream \
    .outputMode("append") \
    .trigger(once=True) \
    .format("console") \
    .start()
```

#### Watermarking Strategy
```python
# Late data handling
events_with_watermark = events_df \
    .withWatermark("event_time", "1 hour")  # Allow 1 hour late data

# Watermark formula: max_event_time - watermark_delay
# Events older than this are dropped

# Monitor watermark
def monitor_watermark(batch_df, batch_id):
    watermark = batch_df.sparkSession.streams.get(query.id).lastProgress.get("eventTime", {}).get("watermark")
    print(f"Batch {batch_id}: Watermark = {watermark}")
    
query = events_df.writeStream \
    .foreachBatch(monitor_watermark) \
    .start()
```

#### Stateful Operations
```python
from pyspark.sql.streaming.state import GroupState, GroupStateTimeout

# mapGroupsWithState for custom stateful processing
def update_user_session(key, values, state: GroupState):
    if state.hasTimedOut:
        # Handle timeout
        final_session = state.get()
        state.remove()
        return final_session
    
    # Update state with new events
    if state.exists:
        current_session = state.get()
    else:
        current_session = {"user_id": key[0], "events": [], "start_time": None}
    
    for event in values:
        current_session["events"].append(event)
        if not current_session["start_time"]:
            current_session["start_time"] = event.timestamp
    
    # Set timeout (30 minutes of inactivity)
    state.setTimeoutDuration("30 minutes")
    state.update(current_session)
    
    return current_session

# Apply stateful transformation
user_sessions = events_df \
    .groupBy("user_id") \
    .mapGroupsWithState(
        outputMode=OutputMode.Update(),
        timeoutConf=GroupStateTimeout.ProcessingTimeTimeout
    )(update_user_session)
```

### Delta Lake Fundamentals

#### ACID Transactions
```python
from delta.tables import DeltaTable

# Create Delta table
df.write.format("delta").save("/path/to/delta-table")

# Load Delta table
delta_df = spark.read.format("delta").load("/path/to/delta-table")

# Upsert (merge) operation
deltaTable = DeltaTable.forPath(spark, "/path/to/delta-table")

deltaTable.alias("target").merge(
    updates_df.alias("source"),
    "target.id = source.id"
).whenMatchedUpdate(set={
    "name": "source.name",
    "updated_at": "current_timestamp()"
}).whenNotMatchedInsert(values={
    "id": "source.id",
    "name": "source.name",
    "created_at": "current_timestamp()"
}).execute()
```

#### Time Travel
```python
# Read historical versions
df_v0 = spark.read.format("delta").option("versionAsOf", 0).load("/path/to/delta-table")
df_yesterday = spark.read.format("delta").option("timestampAsOf", "2023-01-01").load("/path/to/delta-table")

# Show table history
deltaTable.history().show()

# Vacuum old files (7 days retention)
deltaTable.vacuum(retentionHours=168)
```

### GraphX Fundamentals

#### Pregel API
```python
from pyspark.graphx import Graph

# Create graph from edges
edges_rdd = sc.parallelize([
    (1, 2, {"weight": 1.0}),
    (2, 3, {"weight": 2.0}),
    (1, 3, {"weight": 3.0})
])

vertices_rdd = sc.parallelize([
    (1, {"name": "Alice"}),
    (2, {"name": "Bob"}),
    (3, {"name": "Charlie"})
])

graph = Graph(vertices_rdd, edges_rdd)

# PageRank
pagerank_graph = graph.pageRank(resetProb=0.15, tol=0.01)

# Connected components
cc_graph = graph.connectedComponents()
```

---

## MLlib & Productionization

### Feature Engineering Pipelines
```python
from pyspark.ml import Pipeline
from pyspark.ml.feature import VectorAssembler, StandardScaler, StringIndexer, OneHotEncoder
from pyspark.ml.classification import LogisticRegression

# Feature engineering pipeline
string_indexer = StringIndexer(inputCol="category", outputCol="category_index")
one_hot_encoder = OneHotEncoder(inputCol="category_index", outputCol="category_vec")
assembler = VectorAssembler(
    inputCols=["numeric_feature1", "numeric_feature2", "category_vec"],
    outputCol="features"
)
scaler = StandardScaler(inputCol="features", outputCol="scaled_features")

# ML pipeline
lr = LogisticRegression(featuresCol="scaled_features", labelCol="label")

pipeline = Pipeline(stages=[
    string_indexer,
    one_hot_encoder,
    assembler,
    scaler,
    lr
])

# Fit pipeline
model = pipeline.fit(train_df)
predictions = model.transform(test_df)
```

### Distributed Model Training
```python
from pyspark.ml.classification import RandomForestClassifier
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.tuning import CrossValidator, ParamGridBuilder

# Stratified sampling for imbalanced datasets
def stratified_split(df, label_col, train_ratio=0.8, seed=42):
    fractions = df.select(label_col).distinct().rdd.map(lambda x: (x[0], train_ratio)).collectAsMap()
    train_df = df.sampleBy(label_col, fractions, seed)
    test_df = df.subtract(train_df)
    return train_df, test_df

train_df, test_df = stratified_split(df, "label")

# Hyperparameter tuning
rf = RandomForestClassifier(featuresCol="features", labelCol="label")
paramGrid = ParamGridBuilder() \
    .addGrid(rf.numTrees, [10, 50, 100]) \
    .addGrid(rf.maxDepth, [5, 10, 15]) \
    .build()

evaluator = BinaryClassificationEvaluator()
crossval = CrossValidator(
    estimator=rf,
    estimatorParamMaps=paramGrid,
    evaluator=evaluator,
    numFolds=5
)

cv_model = crossval.fit(train_df)
```

### Model Serialization & Production
```python
# Save model
model.write().overwrite().save("/path/to/model")

# Load model
from pyspark.ml import PipelineModel
loaded_model = PipelineModel.load("/path/to/model")

# Batch scoring
batch_predictions = loaded_model.transform(new_data_df)

# Real-time scoring with structured streaming
stream_predictions = loaded_model.transform(streaming_df)
```

### Hyperopt Integration
```python
from hyperopt import hp, fmin, tpe, Trials, STATUS_OK
from hyperopt.spark import SparkTrials

def objective(params):
    rf = RandomForestClassifier(
        featuresCol="features",
        labelCol="label",
        numTrees=int(params['numTrees']),
        maxDepth=int(params['maxDepth'])
    )
    
    model = rf.fit(train_df)
    predictions = model.transform(test_df)
    
    evaluator = BinaryClassificationEvaluator()
    auc = evaluator.evaluate(predictions)
    
    return {'loss': -auc, 'status': STATUS_OK}

space = {
    'numTrees': hp.choice('numTrees', [10, 50, 100, 200]),
    'maxDepth': hp.choice('maxDepth', [5, 10, 15, 20])
}

# Distributed hyperparameter optimization
spark_trials = SparkTrials(parallelism=4)
best = fmin(fn=objective, space=space, algo=tpe.suggest, max_evals=50, trials=spark_trials)
```

---

## Interview Question Patterns

### 1. Architecture Questions
**Q: Explain what happens when you call `df.count()` on a large dataset.**

A: 
1. Driver submits job to DAG scheduler
2. DAG scheduler creates stages based on shuffle boundaries  
3. TaskScheduler assigns tasks to executors
4. Each executor processes its partitions locally
5. Partial counts returned to driver
6. Driver aggregates final result

**Q: How does Spark handle fault tolerance?**

A: RDD lineage + checkpointing
- Narrow transformations: Recompute lost partitions from parent RDDs
- Wide transformations: May need to recompute multiple partitions
- Checkpointing: Breaks lineage chain for iterative algorithms
- Driver failure: Restart entire application (unless using external cluster manager)

### 2. Performance Questions
**Q: Your Spark job is stuck at 199/200 tasks completed. What's the issue?**

A: Data skew. Solutions:
```python
# 1. Identify skewed keys
df.groupBy("key").count().orderBy(desc("count")).show(10)

# 2. Apply salting
df.withColumn("salt", (rand() * 100).cast("int")) \
  .withColumn("salted_key", concat(col("key"), lit("_"), col("salt")))

# 3. Use adaptive query execution (Spark 3.0+)
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
```

**Q: How would you optimize a join between a 100GB and 1GB dataset?**

A: Broadcast the smaller dataset:
```python
large_df.join(broadcast(small_df), "key")
```
Verify broadcast size: `spark.conf.get("spark.sql.autoBroadcastJoinThreshold")`

### 3. Memory Questions  
**Q: Your job is getting OOM errors. How do you debug and fix?**

A:
1. **Check partition sizes:**
```python
def partition_size_mb(df):
    return df.rdd.mapPartitions(lambda x: [len(list(x))]).collect()
```

2. **Increase partitions:**
```python
df.repartition(df.rdd.getNumPartitions() * 2)
```

3. **Adjust memory allocation:**
```python
# Increase executor memory
spark.conf.set("spark.executor.memory", "8g")
# Increase driver memory for collect operations
spark.conf.set("spark.driver.memory", "4g")
```

### 4. Streaming Questions
**Q: Design a real-time fraud detection system.**

A:
```python
# Windowed fraud detection
fraud_features = kafka_stream \
    .withWatermark("timestamp", "5 minutes") \
    .groupBy("user_id", window("timestamp", "10 minutes")) \
    .agg(
        count("*").alias("txn_count"),
        sum("amount").alias("total_amount"),
        countDistinct("merchant").alias("unique_merchants")
    ) \
    .filter(col("txn_count") > 10 | col("total_amount") > 5000)
```

### 5. SQL Optimization
**Q: This query is slow. How do you optimize it?**
```sql
SELECT * FROM large_table a 
JOIN small_table b ON a.key = b.key 
WHERE a.date >= '2023-01-01'
```

A: 
1. **Push down filters:** Filter before join
2. **Broadcast join:** Small table broadcast
3. **Partition pruning:** Partition by date
4. **Column pruning:** Select only needed columns

```python
# Optimized version
filtered_large = large_df.filter(col("date") >= "2023-01-01")
result = filtered_large.join(broadcast(small_df), "key") \
                      .select("needed_col1", "needed_col2")
```

---

## Configuration Cheat Sheet

### Memory Configuration
```python
configs = {
    # Executor Configuration
    "spark.executor.memory": "8g",  # Total executor memory
    "spark.executor.cores": "4",    # CPU cores per executor
    "spark.executor.memoryFraction": "0.6",  # Fraction for execution/storage
    "spark.executor.memoryStorageFraction": "0.5",  # Storage vs execution
    
    # Driver Configuration  
    "spark.driver.memory": "4g",
    "spark.driver.cores": "2",
    "spark.driver.maxResultSize": "2g",
    
    # Parallelism
    "spark.default.parallelism": "200",  # RDD partitions (2-3x cores)
    "spark.sql.shuffle.partitions": "200",  # DataFrame partitions
    
    # Adaptive Query Execution (Spark 3.0+)
    "spark.sql.adaptive.enabled": "true",
    "spark.sql.adaptive.coalescePartitions.enabled": "true", 
    "spark.sql.adaptive.skewJoin.enabled": "true",
    
    # Broadcast Configuration
    "spark.sql.autoBroadcastJoinThreshold": "100MB",
    
    # Serialization
    "spark.serializer": "org.apache.spark.serializer.KryoSerializer",
    
    # Garbage Collection
    "spark.executor.extraJavaOptions": "-XX:+UseG1GC -XX:MaxGCPauseMillis=200",
    
    # Network & IO
    "spark.network.timeout": "800s",
    "spark.sql.broadcastTimeout": "36000",
    "spark.storage.memoryMapThreshold": "2m",
    
    # Dynamic Allocation
    "spark.dynamicAllocation.enabled": "true",
    "spark.dynamicAllocation.minExecutors": "1",
    "spark.dynamicAllocation.maxExecutors": "50",
    "spark.dynamicAllocation.initialExecutors": "10"
}
```

### Performance Tuning Matrix
| Dataset Size | Executors | Executor Memory | Cores/Executor | Partitions |
|--------------|-----------|----------------|----------------|------------|
| < 1GB        | 2-4       | 2-4g          | 2-4            | 50-100     |
| 1-10GB       | 4-8       | 4-8g          | 4-5            | 100-200    |
| 10-100GB     | 10-20     | 6-12g         | 4-5            | 200-400    |
| 100GB+       | 20-50     | 8-16g         | 4-6            | 400-800    |

### Anti-Patterns to Avoid

#### 1. Collect() Misuse
```python
# ❌ Never collect large datasets
large_df.collect()  # OOM risk

# ✅ Use actions appropriately  
large_df.count()
large_df.take(10)
large_df.write.parquet("output")
```

#### 2. Improper Partitioning
```python
# ❌ Too few partitions (underutilization)
df.coalesce(1)  # Single partition

# ❌ Too many partitions (overhead)
df.repartition(10000)  # Excessive partitions

# ✅ Right-size partitions
target_partition_size = 128  # MB
num_partitions = estimated_size_mb / target_partition_size
df.repartition(int(num_partitions))
```

#### 3. Shuffle-Heavy Operations
```python
# ❌ Multiple shuffles
df.groupBy("key1").sum("value") \
  .join(other_df, "key2") \
  .groupBy("key3").avg("result")

# ✅ Minimize shuffles
df.join(other_df, "key") \  # Combine operations
  .groupBy("key").agg(sum("value1"), avg("value2"))
```

#### 4. Inefficient UDFs
```python
# ❌ Python UDF for simple operations
@udf(returnType=IntegerType())
def add_one(x):
    return x + 1

# ✅ Use built-in functions
df.withColumn("new_col", col("old_col") + 1)
```

### Optimization Decision Tree
```
Query Performance Issue?
├── High Memory Usage?
│   ├── Yes → Check partition sizes → Repartition/Increase memory
│   └── No → Continue
├── Long Stage Duration?
│   ├── Data Skew? → Apply salting/isolated broadcast
│   ├── Large Shuffles? → Optimize joins/use broadcast
│   └── CPU Bound? → Increase parallelism
├── Driver Issues?
│   ├── collect() operations? → Replace with distributed operations
│   ├── Broadcast variables too large? → Reduce size/partition
│   └── Driver memory? → Increase spark.driver.memory
└── Serialization Issues?
    ├── Python UDFs? → Replace with SQL expressions
    ├── Complex objects? → Use simpler data types
    └── Kryo serializer? → Enable and register classes
```

### Advanced Spark 3.x Features

#### Adaptive Query Execution (AQE)
```python
# Enable AQE features
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "true")

# Runtime join strategy switching
spark.conf.set("spark.sql.adaptive.join.enabled", "true")

# Skew join optimization thresholds
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256MB")
```

#### Dynamic Partition Pruning
```python
# Automatically enabled in Spark 3.0+
fact_df.join(
    dimension_df.filter(col("region") == "US"), 
    "dimension_key"
)  # Spark automatically prunes partitions in fact_df based on dimension filter
```

#### Bloom Filter Joins
```python
# Enable bloom filter for join optimization
spark.conf.set("spark.sql.optimizer.runtime.bloomFilter.enabled", "true")
spark.conf.set("spark.sql.optimizer.runtime.bloomFilter.expectedNumItems", "1000000")
spark.conf.set("spark.sql.optimizer.runtime.bloomFilter.numBits", "8388608")
```

### Production Best Practices

#### 1. Resource Management
```python
# Cluster resource allocation formula
cluster_total_cores = num_nodes * cores_per_node
cluster_total_memory = num_nodes * memory_per_node

# Leave resources for OS and other services
available_cores = cluster_total_cores * 0.9
available_memory = cluster_total_memory * 0.9

# Executor sizing (avoid too large executors - GC issues)
max_executor_cores = 5
executor_cores = min(max_executor_cores, available_cores // num_executors)
executor_memory = (available_memory // num_executors) - 1  # 1GB for overhead
```

#### 2. Security Configuration
```python
security_configs = {
    # Kerberos authentication
    "spark.kerberos.keytab": "/path/to/keytab",
    "spark.kerberos.principal": "user@REALM.COM",
    
    # SSL/TLS
    "spark.ssl.enabled": "true",
    "spark.ssl.keyStore": "/path/to/keystore",
    "spark.ssl.trustStore": "/path/to/truststore",
    
    # Encryption
    "spark.io.encryption.enabled": "true",
    "spark.network.crypto.enabled": "true",
    "spark.authenticate": "true"
}
```

#### 3. Monitoring & Logging
```python
# Enable event logs
spark.conf.set("spark.eventLog.enabled", "true")
spark.conf.set("spark.eventLog.dir", "hdfs://namenode:port/spark-logs")

# Custom metrics
from pyspark.util import AccumulatorParam
import json

class JsonAccumulatorParam(AccumulatorParam):
    def zero(self, value):
        return {}
    
    def addInPlace(self, dict1, dict2):
        dict1.update(dict2)
        return dict1

metrics_accumulator = spark.sparkContext.accumulator({}, JsonAccumulatorParam())

def track_partition_metrics(partition):
    partition_size = len(list(partition))
    metrics_accumulator.add({"partition_size": partition_size})
    return []

df.foreachPartition(track_partition_metrics)
print(f"Metrics: {metrics_accumulator.value}")
```

#### 4. Unit Testing
```python
import unittest
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, IntegerType, StringType

class SparkTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spark = SparkSession.builder \
            .appName("UnitTest") \
            .master("local[2]") \
            .config("spark.sql.warehouse.dir", "/tmp/spark-warehouse") \
            .getOrCreate()
    
    @classmethod
    def tearDownClass(cls):
        cls.spark.stop()
    
    def test_data_transformation(self):
        # Test data
        schema = StructType([
            StructField("id", IntegerType(), True),
            StructField("name", StringType(), True)
        ])
        test_data = [(1, "Alice"), (2, "Bob")]
        df = self.spark.createDataFrame(test_data, schema)
        
        # Apply transformation
        result_df = df.withColumn("name_upper", upper(col("name")))
        
        # Assert results
        result = result_df.collect()
        self.assertEqual(result[0]["name_upper"], "ALICE")
        self.assertEqual(result[1]["name_upper"], "BOB")

if __name__ == "__main__":
    unittest.main()
```

#### 5. CI/CD Pipeline
```python
# pytest-spark integration
import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark_session():
    return SparkSession.builder \
        .appName("pytest-spark") \
        .master("local[2]") \
        .getOrCreate()

def test_aggregation(spark_session):
    df = spark_session.createDataFrame([(1, 10), (2, 20)], ["id", "value"])
    result = df.agg({"value": "sum"}).collect()[0][0]
    assert result == 30
```

### Cost Optimization Strategies

#### 1. Spot Instance Handling
```python
# Handle spot instance interruptions
def handle_spot_interruption(df, checkpoint_path):
    return df.writeStream \
        .option("checkpointLocation", checkpoint_path) \
        .option("path", "s3://bucket/output") \
        .trigger(processingTime="1 minute") \
        .start()
```

#### 2. Storage Cost Optimization
```python
# Columnar storage for analytics
df.write \
  .mode("overwrite") \
  .option("compression", "snappy") \
  .partitionBy("year", "month") \
  .parquet("s3://data-lake/table")

# Delta Lake for ACID + compression
df.write \
  .format("delta") \
  .option("optimizeWrite", "true") \
  .option("autoCompact", "true") \
  .save("s3://data-lake/delta-table")
```

#### 3. Compute Cost Optimization
```python
# Right-size cluster based on workload
def calculate_optimal_cluster(data_size_gb, processing_time_minutes):
    # Target: Process within time limit
    required_throughput = data_size_gb / processing_time_minutes  # GB/min
    
    # Each executor processes ~0.5GB/min (adjust based on complexity)
    executor_throughput = 0.5
    required_executors = required_throughput / executor_throughput
    
    # Add buffer for failures
    return int(required_executors * 1.2)
```

### Final Interview Tips

#### 1. Common Gotchas
- **Lazy evaluation:** Transformations don't execute until action
- **Lineage:** RDDs remember their computation graph  
- **Serialization:** Objects sent to workers must be serializable
- **Driver bottlenecks:** collect(), broadcast variables, accumulators
- **Shuffle operations:** groupBy, join, distinct, repartition

#### 2. Performance Red Flags
- Single partition processing (coalesce(1))
- Python UDFs without vectorization
- Cartesian joins (missing join condition)
- Collecting large datasets to driver
- Not caching reused DataFrames

#### 3. Architecture Deep Dive
```
Spark Application
├── Driver (SparkContext)
│   ├── DAG Scheduler (stages from RDD graph)
│   ├── Task Scheduler (assigns tasks to executors)  
│   └── Block Manager (manages distributed storage)
└── Executors (Worker Processes)
    ├── Task threads
    ├── Block Manager (caching, storage)
    └── Shuffle Manager (data exchange)
```

#### 4. Memory Deep Dive
```
Executor JVM Memory
├── Reserved Memory (300MB fixed)
├── User Memory (40% default)
│   └── User data structures, Spark internal metadata
├── Spark Memory (60% default)
│   ├── Storage Memory (50% of Spark Memory)
│   │   └── Cached RDDs, DataFrames, Broadcasts
│   └── Execution Memory (50% of Spark Memory)
│       └── Shuffles, joins, sorts, aggregations
```

This completes the comprehensive PySpark FAANG interview reference guide. The document covers all essential concepts from basic RDD operations to advanced streaming and production optimization techniques. Use it as a study guide and quick reference during technical interviews.