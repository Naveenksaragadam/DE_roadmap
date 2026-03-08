// Apache Spark — Topic Deep-Dive Content (Part 1: Fundamentals to Joins)
export const sparkContent = {
  'apache-spark-0': {
    tutorial: {
      explanation: [
        'Apache Spark is a unified analytics engine for large-scale data processing. Its architecture consists of a central Driver program and multiple Executors distributed across a cluster. The cluster manager (YARN, Kubernetes, or Standalone) allocates resources.',
        'When you submit code, the Driver translates it into a Directed Acyclic Graph (DAG) of stages. Stages are defined by "shuffle" boundaries where data must move across the network. Each stage contains tasks that are executed in parallel by Executors on partitions of the data.',
      ],
      codeExamples: [
        {
          description: 'Creating a SparkSession with optimal configurations',
          code: `from pyspark.sql import SparkSession

# The SparkSession is the entry point for DataFrame/SQL APIs
spark = SparkSession.builder \\
    .appName("ProductionDataProcessing") \\
    # Enable Adaptive Query Execution
    .config("spark.sql.adaptive.enabled", "true") \\
    # Dynamic partition coalescing
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \\
    .getOrCreate()
    
# Check configuration
print(f"App Name: {spark.sparkContext.appName}")
print(f"Master: {spark.sparkContext.master}")`,
        },
      ],
      keyTakeaways: [
        'The Driver is the brain: it maintains state, translates code to tasks, and schedules them.',
        'Executors are the muscle: they execute tasks and store data in memory/disk.',
        'A job contains stages (separated by shuffles). A stage contains tasks (one per partition).',
        'If the Driver runs out of memory (OOM), the entire application crashes.',
      ],
    },
    crashCourse: {
      summary: 'Spark\'s architecture uses a Driver to manage the application and Executors to run tasks in parallel. The physical execution plan is Job → Stage → Task.',
      quickFacts: [
        'Driver: Runs the main() function, creates SparkContext, manages the DAG Scheduler',
        'Executor: Worker nodes that run tasks and cache data',
        'Cluster Manager: Allocates resources (K8s, YARN, Mesos, Standalone)',
        'DAG (Directed Acyclic Graph): The execution plan of transformations',
        'Stage: A set of tasks that can run together without a shuffle',
        'Task: The smallest unit of work, runs on a single data partition',
      ],
      tips: [
        'Never use `collect()` on large DataFrames, it brings all data back to the Driver and causes OOM.',
        'Set `spark.driver.memory` carefully based on how much data you intend to `collect()` or broadcast.',
      ],
    },
  },
  'apache-spark-1': {
    tutorial: {
      explanation: [
        'Spark has three primary data abstractions. RDDs (Resilient Distributed Datasets) are the original, low-level API with no schema or optimization. They are fault-tolerant via lineage tracking.',
        'DataFrames are distributed collections of data organized into named columns, like a table. They use the Catalyst Optimizer to automatically optimize your code before execution.',
        'Datasets (Scala/Java only) combine the type-safety of RDDs with the optimizations of DataFrames. As a Python developer, you will exclusively use DataFrames, which are actually `Dataset[Row]` under the hood.',
      ],
      codeExamples: [
        {
          description: 'DataFrame API vs RDD API',
          code: `# RDD approach (Slow, manual optimization needed)
# Avoid this unless doing very complex custom mapping
rdd = spark.sparkContext.textFile("data.csv")
mapped_rdd = rdd.map(lambda line: line.split(",")) \\
                .filter(lambda cols: int(cols[2]) > 25)

# DataFrame approach (Fast, Catalyst Optimizer)
# ALWAYS prefer this for structured/semi-structured data
df = spark.read.csv("data.csv", header=True, inferSchema=True)
filtered_df = df.filter(df.age > 25) \\
                .select("name", "age")`,
        },
      ],
      keyTakeaways: [
        'DataFrames provide massive performance benefits over RDDs due to the Catalyst Optimizer and Tungsten execution engine.',
        'RDDs serialize data using standard language serializers (e.g., pickle in Python), which is slow. DataFrames serialize using Tungsten (off-heap memory), which is incredibly fast.',
        'PySpark only supports RDDs and DataFrames. Datasets require a strongly-typed language (JVM).',
      ],
    },
    crashCourse: {
      summary: 'Use DataFrames for 99% of your Spark work. They are faster, optimized automatically by Catalyst, and handle memory more efficiently via Tungsten than low-level RDDs.',
      quickFacts: [
        'RDD (Resilient Distributed Dataset): Low-level, schema-less, no optimization',
        'DataFrame: High-level, tabular with schema, heavily optimized by Catalyst',
        'Dataset: Strongly-typed DataFrame (JVM languages only)',
        'Lineage: The graph of operations to apply to a dataset (how Spark ensures fault tolerance)',
      ],
      tips: [
        'If you find yourself using `.rdd.map()` on a DataFrame, pause and look for a built-in SQL function first. Built-in functions are always faster.',
      ],
    },
  },
  'apache-spark-2': {
    tutorial: {
      explanation: [
        'Spark operations are strictly divided into Transformations and Actions. Transformations (like `filter`, `select`, `join`) are lazy — they do not execute immediately. Instead, they just add to the DAG lineage.',
        'Actions (like `count`, `show`, `write`) are eager. They trigger the actual execution of the DAG. Spark waits until an action is called so the Catalyst Optimizer can look at the whole DAG and find the most efficient execution plan (e.g., combining filters, pushing down predicates to the database).',
      ],
      codeExamples: [
        {
          description: 'Lazy Evaluation in practice',
          code: `# --- TRANSFORMATIONS (Lazy) ---
# Nothing executes here. Spark just builds the execution plan.
df = spark.read.parquet("sales.parquet")
filtered_df = df.filter(col("amount") > 1000)
grouped_df = filtered_df.groupBy("region")
result_df = grouped_df.agg(sum("amount"))

# Spark realizes it only needs "amount" and "region" columns
# It will push this column pruning down to the Parquet reader

# --- ACTION (Eager) ---
# Now the whole DAG executes!
result_df.write.parquet("output.parquet")`,
        },
      ],
      keyTakeaways: [
        'Lazy evaluation is what makes Spark fast: the optimizer sees the big picture before doing any work.',
        'Predicate pushdown: Spark pushes filters down to the source (e.g., Parquet file) so it only reads the required data.',
        'Column pruning: Spark only reads the columns needed for the final action.',
        'If you have multiple actions relying on the same transformations, Spark will recompute the whole DAG from the source file for EACH action unless you cache the intermediate result.',
      ],
    },
    crashCourse: {
      summary: 'Transformations build the logical execution plan but don\'t execute. Actions trigger the actual computation. This lazy model allows Spark to optimize the full query.',
      quickFacts: [
        'Narrow Transformations (No shuffle): map, filter, select',
        'Wide Transformations (Network shuffle required): join, groupBy, distinct, repartition',
        'Actions: count, collect, show, write, take',
        'Execution flows: Action triggers Job → Job creates DAG → DAG splits to Stages → Stages split to Tasks',
      ],
      tips: [
        'If a fast query suddenly takes a long time after adding a `show()` or `count()`, it\'s not the action that\'s slow — it\'s the execution of massive transformation lineage preceding it.',
      ],
    },
  },
  'apache-spark-3': {
    tutorial: {
      explanation: [
        'Spark SQL is the module for structured data processing. It relies on the Catalyst Optimizer, a rule-based and cost-based framework that transforms user code into an optimized physical execution plan.',
        'The journey of a query: Unresolved Logical Plan → (Analysis via Catalog) → Resolved Logical Plan → (Logical Optimization) → Optimized Logical Plan → (Physical Planning) → Multiple Physical Plans → (Cost Model) → Selected Physical Plan → (Code Generation via Tungsten) → Execution.',
      ],
      codeExamples: [
        {
          description: 'Viewing the execution plan with Explain',
          code: `df = spark.table("fact_sales") \\
          .join(spark.table("dim_date"), "date_id") \\
          .filter(col("year") == 2023)

# View the actual plan Catalyst created (read bottom to top)
df.explain("formatted")
# OR
df.explain(True) # Shows Logical, Optimized, and Physical plans

# Catalyst optimizations you might see:
# 1. Filter Pushdown: moving the 'year=2023' filter before the join
# 2. Column Pruning: dropping unused columns early
# 3. Join Strategy Selection: choosing BroadcastHashJoin over SortMergeJoin`,
        },
      ],
      keyTakeaways: [
        'It doesn\'t matter whether you use SQL string queries (`spark.sql("SELECT...")`) or DataFrame API (`df.select().filter()`) — Catalyst generates the exact same underlying bytecode.',
        'Tungsten is the execution engine that takes the physical plan and generates highly optimized Java bytecode for execution directly on bare metal memory.',
        'Project Tungsten avoids JVM object overhead by managing memory explicitly off-heap.',
      ],
    },
    crashCourse: {
      summary: 'The Catalyst Optimizer converts high-level DataFrame code into an optimized physical execution plan. Tungsten then generates bare-metal bytecode to execute it.',
      quickFacts: [
        'Catalyst: Rule-based & Cost-based optimizer',
        'Tungsten: Execution engine, off-heap memory management, whole-stage code generation',
        'Predicate Pushdown: Pushing filters as close to the data source as possible',
        'Explain Plan: Use `df.explain()` to see exactly how Spark will execute your query',
      ],
      tips: [
        'Always read `explain` plans from bottom to top (source to result).',
        'If you use a Python UDF (User Defined Function), Catalyst cannot look inside it to optimize it! It acts as a black box.',
      ],
    },
  },
  'apache-spark-4': {
    tutorial: {
      explanation: [
        'Joins are the most expensive operations in Spark due to data shuffling across the network. Spark primarily uses two strategies: Broadcast Hash Join (fast, no shuffle) and Sort Merge Join (slower, requires shuffle).',
        'Sort Merge Join happens when joining two large tables. Data is shuffled across the network so identical keys end up on the same executor, then sorted, then merged. Broadcast Join happens when joining a large table with a small table (<10MB default). The small table is broadcast to all executors, completely eliminating the network shuffle.',
      ],
      codeExamples: [
        {
          description: 'Optimizing joins (from FAANG PySpark Guide)',
          code: `from pyspark.sql.functions import broadcast, rand, concat, lit

# 1. Explicit Broadcast Join (Forces Spark to broadcast the small table)
fact_df = spark.table("massive_fact_table")
dim_df = spark.table("small_dimension_table")

# Eliminates the shuffle phase entirely!
result = fact_df.join(broadcast(dim_df), "category_id")

# 2. Handling Data Skew with Salting
def salt_skewed_join(left_df, right_df, join_key, salt_factor=10):
    # Add salt (0-9) to the skewed large table
    salted_left = left_df.withColumn("salt", (rand() * salt_factor).cast("int")) \\
                         .withColumn("salted_key", concat(col(join_key), lit("_"), col("salt")))
    
    # Replicate the small right DataFrame with all possible salt values
    salt_df = spark.range(salt_factor).withColumnRenamed("id", "salt")
    salted_right = right_df.crossJoin(salt_df) \\
                           .withColumn("salted_key", concat(col(join_key), lit("_"), col("salt")))
    
    # Perform join evenly across cluster, then drop salt
    return salted_left.join(salted_right, "salted_key").drop("salt", "salted_key")`,
        },
      ],
      keyTakeaways: [
        'Data skew (where one join key has millions of rows while others have few) causes the "straggler problem" where one executor takes 90% of the job time.',
        'Resolve skew via: 1) Broadcast join (if one table is small), 2) Salting (adding random suffixes to split the large key), or 3) Adaptive Query Execution (AQE skew handling).',
        'Configure broadcast threshold: `spark.sql.autoBroadcastJoinThreshold`. Default is 10MB.',
      ],
    },
    crashCourse: {
      summary: 'Data shuffling during joins is Spark\'s biggest bottleneck. Avoid shuffles by broadcasting small tables. Handle data skew (straggler tasks) using salting or AQE.',
      quickFacts: [
        'Sort Merge Join (SMJ): Default for large tables. Requires shuffle and sort.',
        'Broadcast Hash Join (BHJ): Small table sent to all executors. NO shuffle. Super fast.',
        'Data Skew: When one partition holds significantly more data than others.',
        'Salting: Adding a random integer to a skewed join key to distribute the processing.',
      ],
      tips: [
        'If a stage halts at 99% completion for a long time, you likely have data skew in a join key.',
        'Use `broadcast(df)` explicitly if you know a table is small enough (< 200MB) but Spark isn\'t broadcasting it automatically.',
      ],
    },
  },
  'apache-spark-5': {
    tutorial: {
      explanation: [
        'Partitioning dictates how data is distributed across the cluster. Too few partitions means not fully utilizing your executors (wasted CPU). Too many partitions causes overwhelming scheduling overhead and tiny files.',
        'Rule of thumb: Aim for ~2-3x the number of total cores in your cluster, with partitions around 128MB-200MB each in memory.',
        'Use `repartition()` when you need to increase partitions or change data distribution (causes a full shuffle). Use `coalesce()` when reducing partitions (minimizes shuffles by merging local partitions).',
      ],
      codeExamples: [
        {
          description: 'Repartition vs Coalesce',
          code: `# Check current partitions
print(df.rdd.getNumPartitions())

# 1. Increasing partitions (Causes a full network shuffle)
# Useful when current partitions are too large or data is skewed
df_balanced = df.repartition(200)

# Repartitioning by a specific column (to optimize a future join/groupby)
df_clustered = df.repartition("country")

# 2. Decreasing partitions (Much faster, no cross-executor shuffle)
# Useful before writing to avoid the "small files problem"
df_writer = df.coalesce(10)
df_writer.write.parquet("s3://bucket/output/")

# Spark 3.0+ AQE dynamic coalescing
# Automatically merges small partitions post-shuffle to optimal sizes
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")`,
        },
      ],
      keyTakeaways: [
        'The "Small Files Problem": writing 10,000 tiny files to S3/HDFS destroys read performance. Always use `coalesce()` before writing to disk.',
        '`repartition()` creates partitions of equal size (balances skew).',
        '`spark.sql.shuffle.partitions` defaults to 200. This is the number of partitions created after any wide transformation (join/groupby). Change this based on your data size!',
      ],
    },
    crashCourse: {
      summary: 'Partitioning controls parallelism. Use `repartition` (requires shuffle) to increase parallelism or fix skew. Use `coalesce` (no shuffle) to reduce partitions before writing to avoid small files.',
      quickFacts: [
        '`df.rdd.getNumPartitions()`: find out how many partitions you have',
        '`repartition(n)`: Causes full shuffle, balances data evenly',
        '`coalesce(n)`: Merges local partitions without shuffling, only used to decrease partitions',
        '`spark.sql.shuffle.partitions`: Default 200. Tune this! (Data size / 128MB = target)',
      ],
      tips: [
        'If processing 10GB of data, 200 shuffle partitions = 50MB per partition (good). If processing 100GB, 200 partitions = 500MB per partition (bad, will likely OOM). Scale the setting up!',
      ],
    },
  },
  'apache-spark-6': {
    tutorial: {
      explanation: [
        'Caching stores intermediate DataFrames in memory so they don\'t need to be recomputed if called by multiple actions. This cuts off the DAG lineage from re-executing from the source.',
        '`cache()` is shorthand for `persist(StorageLevel.MEMORY_AND_DISK)`. If memory is full, Spark spills the data to local executor disk.',
        'Checkpointing is a more aggressive mechanism. It actually writes the DataFrame to a definitive storage layer (like HDFS/S3) and completely truncates the DAG lineage. This is crucial for very long iterative algorithms or streaming state.',
      ],
      codeExamples: [
        {
          description: 'Caching vs Checkpointing',
          code: `from pyspark import StorageLevel

# 1. Caching (Saves to executor memory/disk)
# Useful when 'df' will be used in multiple subsequent actions
df = spark.read.parquet("very_large_dataset") \\
          .groupBy("category").agg(sum("sales"))
          
# Cache the intermediate state
df.persist(StorageLevel.MEMORY_AND_DISK)
# Ensure execution happens
df.count()

# These will now hit the cache instead of recalculating the groupBy
df.filter(col("category") == 'A').show()
df.filter(col("category") == 'B').show()

# Don't forget to free memory!
df.unpersist()

# 2. Checkpointing (Truncates lineage, writes to HDFS/S3)
# Set directory first
spark.sparkContext.setCheckpointDir("s3://bucket/checkpoints/")

df_complex = do_50_complex_transformations(source_df)
# Actually writes to S3 and breaks the 50-step DAG lineage
checkpointed_df = df_complex.checkpoint()`,
        },
      ],
      keyTakeaways: [
        'Do not aggressively cache everything. Spark\'s memory fraction for execution is shared with storage. Over-caching causes out-of-memory errors or aggressive spilling to disk.',
        'Caching is lazy! It only actually caches the data when the FIRST action is called. You often see `df.cache(); df.count()` to force materialization.',
        'Checkpointing is used when DAG lineage becomes so long that a failure would be catastrophic to recalculate, or when doing highly iterative ML algorithms.',
      ],
    },
    crashCourse: {
      summary: 'Use `cache()` when you reuse a DataFrame in multiple actions to avoid recomputing the whole DAG. Use `checkpoint()` to save explicitly to distributed storage and truncate the DAG lineage entirely.',
      quickFacts: [
        '`cache()`: Default MEMORY_AND_DISK (PySpark) or MEMORY_ONLY (Scala/Java)',
        '`persist(level)`: Let\'s you specify storage levels (e.g. MEMORY_AND_DISK_SER)',
        '`unpersist()`: Removes data from cache to free memory',
        'Checkpoint: Truncates DAG, saves to reliable storage (HDFS/S3), survives job failures',
      ],
      tips: [
        'Always `unpersist()` DataFrames as soon as you are done with them. Don\'t rely on Spark\'s LRU (Least Recently Used) cache eviction.',
      ],
    },
  },
};
