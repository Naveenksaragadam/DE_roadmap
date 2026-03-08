# FAANG-Level PySpark Engineering: Critical Skills Supplement

## Module 1: Production PySpark Patterns (60 minutes)

### 1.1 Advanced DataFrame Operations

```python
from pyspark.sql import SparkSession, Window
from pyspark.sql.functions import *
from pyspark.sql.types import *
import logging

spark = SparkSession.builder \
    .appName("ProductionDataProcessing") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .getOrCreate()

# Complex window operations for time series analysis
def detect_anomalies(df):
    window_spec = Window.partitionBy("user_id") \
        .orderBy("timestamp") \
        .rowsBetween(-10, 0)  # 10 previous rows + current
    
    return df.withColumn("rolling_avg", 
                        avg("amount").over(window_spec)) \
             .withColumn("rolling_std", 
                        stddev("amount").over(window_spec)) \
             .withColumn("z_score", 
                        (col("amount") - col("rolling_avg")) / col("rolling_std")) \
             .filter(abs(col("z_score")) > 3)  # Anomalies beyond 3 std devs

# Efficient deduplication for large datasets
def deduplicate_efficiently(df, key_cols, order_col):
    window_spec = Window.partitionBy(*key_cols).orderBy(desc(order_col))
    
    return df.withColumn("row_number", row_number().over(window_spec)) \
             .filter(col("row_number") == 1) \
             .drop("row_number")

# Handle nested JSON at scale
def flatten_nested_json(df, json_col):
    # Extract schema from sample
    sample_json = df.select(json_col).limit(1000).collect()
    schema = spark.read.json(spark.sparkContext.parallelize([row[json_col] for row in sample_json])).schema
    
    return df.withColumn("parsed", from_json(col(json_col), schema)) \
             .select("*", "parsed.*") \
             .drop("parsed", json_col)
```

### 1.2 Memory-Efficient Processing

```python
# Process massive datasets without OOM
def process_large_dataset_iteratively(input_path, output_path, batch_size=1000000):
    """Process data in chunks to avoid memory issues"""
    
    # Get total record count for progress tracking
    total_records = spark.read.parquet(input_path).count()
    
    # Process in batches
    for i in range(0, total_records, batch_size):
        batch_df = spark.read.parquet(input_path) \
            .limit(batch_size) \
            .offset(i)
        
        processed = expensive_transformation(batch_df)
        
        # Write with append mode
        processed.write.mode("append").parquet(f"{output_path}/batch_{i}")
        
        # Clear cache to free memory
        spark.catalog.clearCache()
        
        print(f"Processed batch {i//batch_size + 1}/{(total_records//batch_size) + 1}")

def expensive_transformation(df):
    """Memory-conscious transformation with checkpointing"""
    # Cache intermediate results strategically
    df.cache()
    
    # Complex aggregation
    result = df.groupBy("category", "region") \
               .agg(sum("revenue").alias("total_revenue"),
                    countDistinct("customer_id").alias("unique_customers"),
                    avg("order_value").alias("avg_order_value")) \
               .filter(col("total_revenue") > 1000000)
    
    # Checkpoint to break lineage
    result.checkpoint()
    
    return result

# Streaming with backpressure control
def create_streaming_job():
    return spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:9092") \
        .option("subscribe", "events") \
        .option("maxOffsetsPerTrigger", "100000") \
        .option("failOnDataLoss", "false") \
        .load() \
        .select(from_json(col("value").cast("string"), get_schema()).alias("data")) \
        .select("data.*")
```

### 1.3 Error Handling and Data Quality

```python
from pyspark.sql.functions import udf
from pyspark.sql.types import BooleanType

# Comprehensive error handling
def safe_divide(numerator, denominator):
    """UDF with error handling"""
    try:
        if denominator == 0:
            return None
        return float(numerator) / float(denominator)
    except (TypeError, ValueError):
        return None

safe_divide_udf = udf(safe_divide, FloatType())

def validate_and_clean_data(df):
    """Data validation with error tracking"""
    
    # Add validation columns
    validated_df = df.withColumn("valid_email", 
                                col("email").rlike(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')) \
                     .withColumn("valid_phone", 
                                col("phone").rlike(r'^\+?1?[0-9]{10,15}$')) \
                     .withColumn("valid_amount", 
                                col("amount").isNotNull() & (col("amount") > 0))
    
    # Separate valid and invalid records
    valid_records = validated_df.filter(
        col("valid_email") & col("valid_phone") & col("valid_amount")
    ).drop("valid_email", "valid_phone", "valid_amount")
    
    invalid_records = validated_df.filter(
        ~(col("valid_email") & col("valid_phone") & col("valid_amount"))
    )
    
    # Log validation metrics
    total_count = df.count()
    valid_count = valid_records.count()
    invalid_count = invalid_records.count()
    
    print(f"Total records: {total_count}")
    print(f"Valid records: {valid_count} ({valid_count/total_count*100:.2f}%)")
    print(f"Invalid records: {invalid_count} ({invalid_count/total_count*100:.2f}%)")
    
    return valid_records, invalid_records

# Quarantine bad data for investigation
def quarantine_bad_data(df, rules):
    """Separate data based on business rules"""
    
    good_data = df
    quarantined_data = None
    
    for rule_name, condition in rules.items():
        # Records that fail the rule
        failed = good_data.filter(~condition).withColumn("failure_reason", lit(rule_name))
        
        if quarantined_data is None:
            quarantined_data = failed
        else:
            quarantined_data = quarantined_data.union(failed)
        
        # Keep only records that pass the rule
        good_data = good_data.filter(condition)
    
    return good_data, quarantined_data
```

## Module 2: Performance Optimization Techniques (75 minutes)

### 2.1 Advanced Join Strategies

```python
# Broadcast join optimization
def optimize_dimension_joins(fact_df, dim_dfs, broadcast_threshold_mb=200):
    """Automatically broadcast small dimension tables"""
    
    result_df = fact_df
    
    for dim_name, (dim_df, join_key) in dim_dfs.items():
        # Estimate size
        dim_size_mb = estimate_dataframe_size_mb(dim_df)
        
        if dim_size_mb < broadcast_threshold_mb:
            print(f"Broadcasting {dim_name} ({dim_size_mb}MB)")
            result_df = result_df.join(broadcast(dim_df), join_key, "left")
        else:
            # Use bucketed join for large dimensions
            print(f"Using bucketed join for {dim_name} ({dim_size_mb}MB)")
            result_df = bucketed_join(result_df, dim_df, join_key)
    
    return result_df

def estimate_dataframe_size_mb(df):
    """Estimate DataFrame size in memory"""
    row_count = df.count()
    avg_row_size = df.limit(1000).toPandas().memory_usage(deep=True).sum() / 1000
    return (row_count * avg_row_size) / (1024 * 1024)

# Salting for skewed joins
def salt_skewed_join(left_df, right_df, join_key, salt_factor=10):
    """Handle data skew using salting technique"""
    
    # Add salt to both DataFrames
    salted_left = left_df.withColumn("salt", (rand() * salt_factor).cast("int")) \
                         .withColumn("salted_key", concat(col(join_key), lit("_"), col("salt")))
    
    # Replicate right DataFrame with all salt values
    salt_df = spark.range(salt_factor).withColumnRenamed("id", "salt")
    salted_right = right_df.crossJoin(salt_df) \
                          .withColumn("salted_key", concat(col(join_key), lit("_"), col("salt")))
    
    # Perform join on salted key
    result = salted_left.join(salted_right, "salted_key", "inner") \
                       .drop("salt", "salted_key")
    
    return result

# Bucketed tables for repeated joins
def create_bucketed_table(df, table_name, bucket_cols, num_buckets=200):
    """Create bucketed table for optimized joins"""
    
    df.write \
      .bucketBy(num_buckets, *bucket_cols) \
      .sortBy(*bucket_cols) \
      .option("path", f"/data/bucketed/{table_name}") \
      .saveAsTable(table_name)
```

### 2.2 Streaming Optimization

```python
# High-throughput Kafka processing
def create_optimized_kafka_stream(topics, batch_duration="30 seconds"):
    """Optimized Kafka stream processing"""
    
    return spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "kafka1:9092,kafka2:9092") \
        .option("subscribe", ",".join(topics)) \
        .option("maxOffsetsPerTrigger", "500000") \
        .option("fetchOffset.numRetries", "3") \
        .option("fetchOffset.retryIntervalMs", "1000") \
        .option("kafka.consumer.cache.capacity", "1000") \
        .load()

# Stateful streaming with watermarking
def process_user_sessions(events_df):
    """Process user sessions with proper state management"""
    
    return events_df \
        .withWatermark("event_time", "15 minutes") \
        .groupBy("user_id", 
                session_window(col("event_time"), "20 minutes")) \
        .agg(
            count("*").alias("event_count"),
            sum("revenue").alias("total_revenue"),
            collect_list("page_url").alias("pages_visited"),
            min("event_time").alias("session_start"),
            max("event_time").alias("session_end")
        ) \
        .withColumn("session_duration_minutes",
                   (col("session_end").cast("long") - col("session_start").cast("long")) / 60)

# Exactly-once semantics with Delta Lake
def write_stream_with_exactly_once(streaming_df, checkpoint_path, output_path):
    """Write stream with exactly-once guarantee"""
    
    def upsert_to_delta(batch_df, batch_id):
        """Custom upsert logic for each micro-batch"""
        
        if batch_df.count() > 0:
            # Use merge for upsert semantics
            from delta.tables import DeltaTable
            
            if DeltaTable.isDeltaTable(spark, output_path):
                delta_table = DeltaTable.forPath(spark, output_path)
                
                delta_table.alias("target").merge(
                    batch_df.alias("source"),
                    "target.user_id = source.user_id AND target.event_date = source.event_date"
                ).whenMatchedUpdateAll() \
                 .whenNotMatchedInsertAll() \
                 .execute()
            else:
                # First batch - just write
                batch_df.write.format("delta").save(output_path)
    
    return streaming_df.writeStream \
        .foreachBatch(upsert_to_delta) \
        .option("checkpointLocation", checkpoint_path) \
        .trigger(processingTime='30 seconds') \
        .start()
```

### 2.3 Adaptive Query Optimization

```python
# Enable all AQE features
def configure_adaptive_query_execution():
    """Configure Spark for optimal AQE performance"""
    
    spark.conf.set("spark.sql.adaptive.enabled", "true")
    spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
    spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
    spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "true")
    
    # Fine-tune AQE parameters
    spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "128MB")
    spark.conf.set("spark.sql.adaptive.coalescePartitions.minPartitionNum", "1")
    spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "10")
    spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256MB")

# Dynamic partition pruning optimization
def optimize_partition_pruning(fact_table, dim_table, partition_col):
    """Leverage dynamic partition pruning"""
    
    # Ensure fact table is partitioned
    partitioned_fact = spark.table(fact_table)
    dimension = spark.table(dim_table).filter(col("active") == True)
    
    # This will use dynamic partition pruning automatically
    result = partitioned_fact.join(
        dimension.select("id", "category"),
        partitioned_fact[partition_col] == dimension.id,
        "inner"
    )
    
    return result

# Custom cost-based optimization
def analyze_table_statistics(table_name):
    """Collect comprehensive table statistics"""
    
    # Analyze table for CBO
    spark.sql(f"ANALYZE TABLE {table_name} COMPUTE STATISTICS")
    spark.sql(f"ANALYZE TABLE {table_name} COMPUTE STATISTICS FOR ALL COLUMNS")
    
    # Get detailed statistics
    stats = spark.sql(f"DESCRIBE EXTENDED {table_name}").collect()
    
    for row in stats:
        if "Statistics" in row[0]:
            print(f"Table statistics: {row[1]}")
```

## Module 3: Cloud-Native PySpark (90 minutes)

### 3.1 AWS EMR Optimization

```python
import boto3
from pyspark.sql import SparkSession

# EMR-optimized Spark configuration
def create_emr_optimized_spark():
    """Create Spark session optimized for EMR"""
    
    return SparkSession.builder \
        .appName("EMR-Optimized-Job") \
        .config("spark.hadoop.fs.s3a.aws.credentials.provider", 
                "com.amazonaws.auth.DefaultAWSCredentialsProviderChain") \
        .config("spark.hadoop.fs.s3a.fast.upload", "true") \
        .config("spark.hadoop.fs.s3a.multipart.size", "104857600") \
        .config("spark.hadoop.fs.s3a.fast.upload.buffer", "bytebuffer") \
        .config("spark.sql.execution.arrow.pyspark.enabled", "true") \
        .config("spark.sql.execution.arrow.maxRecordsPerBatch", "10000") \
        .config("spark.dynamicAllocation.enabled", "true") \
        .config("spark.dynamicAllocation.minExecutors", "10") \
        .config("spark.dynamicAllocation.maxExecutors", "1000") \
        .config("spark.dynamicAllocation.initialExecutors", "50") \
        .getOrCreate()

# S3 optimization patterns
def optimize_s3_operations(df, output_path):
    """Optimize S3 read/write operations"""
    
    # Coalesce partitions to optimize S3 writes
    optimized_partitions = max(1, df.rdd.getNumPartitions() // 4)
    
    df.coalesce(optimized_partitions) \
      .write \
      .mode("overwrite") \
      .option("compression", "snappy") \
      .option("maxRecordsPerFile", "1000000") \
      .parquet(output_path)

# Spot instance handling
def handle_spot_instance_interruption():
    """Handle spot instance interruptions gracefully"""
    
    try:
        # Your Spark processing logic here
        result = process_data()
        
        # Checkpoint frequently when using spot instances
        result.checkpoint()
        
        return result
        
    except Exception as e:
        if "SpotInstanceTerminating" in str(e):
            print("Spot instance terminating, saving progress...")
            # Save intermediate results
            save_intermediate_state()
            
            # Re-submit job with different instance types
            resubmit_with_on_demand_instances()
        else:
            raise e

# Auto-scaling configuration
emr_auto_scaling_policy = {
    "Constraints": {
        "MinCapacity": 2,
        "MaxCapacity": 100
    },
    "Rules": [
        {
            "Name": "ScaleOutMemoryPercentage",
            "Description": "Scale out if memory > 75%",
            "Action": {
                "SimpleScalingPolicyConfiguration": {
                    "AdjustmentType": "CHANGE_IN_CAPACITY",
                    "ScalingAdjustment": 5,
                    "CoolDown": 300
                }
            },
            "Trigger": {
                "CloudWatchAlarmDefinition": {
                    "ComparisonOperator": "GREATER_THAN",
                    "EvaluationPeriods": 2,
                    "MetricName": "MemoryPercentage",
                    "Namespace": "AWS/ElasticMapReduce",
                    "Period": 300,
                    "Statistic": "AVERAGE",
                    "Threshold": 75.0
                }
            }
        }
    ]
}
```

### 3.2 GCP Dataproc Patterns

```python
from google.cloud import dataproc_v1
from google.cloud import storage

# Dataproc cluster creation with optimal settings
def create_dataproc_cluster():
    """Create optimized Dataproc cluster"""
    
    cluster_config = {
        "cluster_name": "production-spark-cluster",
        "config": {
            "master_config": {
                "num_instances": 1,
                "machine_type_uri": "n1-standard-4",
                "disk_config": {
                    "boot_disk_type": "pd-ssd",
                    "boot_disk_size_gb": 100
                }
            },
            "worker_config": {
                "num_instances": 10,
                "machine_type_uri": "n1-highmem-8",
                "disk_config": {
                    "boot_disk_type": "pd-ssd",
                    "boot_disk_size_gb": 100
                }
            },
            "secondary_worker_config": {
                "num_instances": 50,
                "machine_type_uri": "n1-standard-4",
                "is_preemptible": True  # Use preemptible instances for cost savings
            },
            "software_config": {
                "image_version": "2.0-debian10",
                "properties": {
                    "spark:spark.dynamicAllocation.enabled": "true",
                    "spark:spark.dynamicAllocation.minExecutors": "10",
                    "spark:spark.dynamicAllocation.maxExecutors": "1000",
                    "spark:spark.sql.adaptive.enabled": "true",
                    "spark:spark.sql.adaptive.coalescePartitions.enabled": "true"
                }
            }
        }
    }
    
    return cluster_config

# GCS optimization
def optimize_gcs_operations():
    """Optimize Google Cloud Storage operations"""
    
    spark.conf.set("spark.hadoop.fs.gs.impl", "com.google.cloud.hadoop.fs.gcs.GoogleHadoopFileSystem")
    spark.conf.set("spark.hadoop.fs.gs.project.id", "your-project-id")
    spark.conf.set("spark.hadoop.fs.gs.auth.service.account.enable", "true")
    
    # Optimize for large files
    spark.conf.set("spark.hadoop.fs.gs.block.size", "134217728")  # 128MB blocks
    spark.conf.set("spark.hadoop.fs.gs.inputstream.buffer.size", "8388608")  # 8MB buffer
```

### 3.3 Kubernetes Deployment

```python
# Kubernetes Spark job submission
kubernetes_config = {
    "apiVersion": "sparkoperator.k8s.io/v1beta2",
    "kind": "SparkApplication",
    "metadata": {
        "name": "pyspark-production-job",
        "namespace": "spark-jobs"
    },
    "spec": {
        "type": "Python",
        "pythonVersion": "3",
        "mode": "cluster",
        "image": "gcr.io/company/spark-python:3.4.0",
        "imagePullPolicy": "Always",
        "mainApplicationFile": "s3a://spark-jobs/main.py",
        "arguments": ["--input-path", "s3a://data/input", "--output-path", "s3a://data/output"],
        "sparkVersion": "3.4.0",
        "restartPolicy": {
            "type": "OnFailure",
            "onFailureRetries": 3,
            "onFailureRetryInterval": 10,
            "onSubmissionFailureRetries": 5,
            "onSubmissionFailureRetryInterval": 20
        },
        "driver": {
            "cores": 2,
            "coreLimit": "2000m",
            "memory": "4g",
            "memoryOverhead": "1g",
            "serviceAccount": "spark-driver-sa",
            "env": [
                {
                    "name": "AWS_REGION",
                    "value": "us-west-2"
                }
            ]
        },
        "executor": {
            "cores": 4,
            "coreLimit": "4000m",
            "memory": "8g",
            "memoryOverhead": "2g",
            "instances": 20
        },
        "dynamicAllocation": {
            "enabled": True,
            "initialExecutors": 10,
            "minExecutors": 5,
            "maxExecutors": 100
        },
        "monitoring": {
            "exposeDriverMetrics": True,
            "exposeExecutorMetrics": True,
            "prometheus": {
                "jmxExporterJar": "/opt/spark/jars/jmx_prometheus_javaagent.jar",
                "port": 8090
            }
        }
    }
}

# Resource quotas and limits
resource_quota = {
    "apiVersion": "v1",
    "kind": "ResourceQuota",
    "metadata": {
        "name": "spark-quota",
        "namespace": "spark-jobs"
    },
    "spec": {
        "hard": {
            "requests.cpu": "1000",
            "requests.memory": "2000Gi",
            "limits.cpu": "2000",
            "limits.memory": "4000Gi",
            "persistentvolumeclaims": "10"
        }
    }
}
```

## Module 4: System Design Patterns (90 minutes)

### 4.1 Real-Time Data Pipeline Architecture

```python
# Lambda architecture implementation
class LambdaArchitecture:
    def __init__(self, spark_session):
        self.spark = spark_session
        
    def batch_layer(self, input_path, output_path):
        """Batch processing for historical data"""
        return self.spark.read.parquet(input_path) \
            .groupBy("user_id", date_format("timestamp", "yyyy-MM-dd").alias("date")) \
            .agg(
                sum("amount").alias("total_amount"),
                count("*").alias("transaction_count"),
                avg("amount").alias("avg_amount")
            ) \
            .write.mode("overwrite").partitionBy("date").parquet(output_path)
    
    def speed_layer(self, kafka_stream):
        """Real-time stream processing"""
        return kafka_stream \
            .withWatermark("timestamp", "5 minutes") \
            .groupBy("user_id", window("timestamp", "1 hour")) \
            .agg(
                sum("amount").alias("realtime_total"),
                count("*").alias("realtime_count")
            ) \
            .writeStream \
            .outputMode("update") \
            .format("delta") \
            .option("checkpointLocation", "/checkpoints/realtime") \
            .start()
    
    def serving_layer(self, batch_path, realtime_path):
        """Combine batch and real-time views"""
        batch_view = self.spark.read.parquet(batch_path)
        realtime_view = self.spark.read.format("delta").load(realtime_path)
        
        # Merge views with conflict resolution
        return batch_view.alias("batch").join(
            realtime_view.alias("rt"),
            ["user_id"], "full_outer"
        ).select(
            coalesce(col("batch.user_id"), col("rt.user_id")).alias("user_id"),
            (coalesce(col("batch.total_amount"), lit(0)) + 
             coalesce(col("rt.realtime_total"), lit(0))).alias("total_amount"),
            (coalesce(col("batch.transaction_count"), lit(0)) + 
             coalesce(col("rt.realtime_count"), lit(0))).alias("transaction_count")
        )

# Kappa architecture (stream-only)
def create_kappa_pipeline():
    """Pure streaming architecture"""
    
    # Single stream processing pipeline handles all data
    stream = spark.readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "kafka:9092") \
        .option("subscribe", "raw_events") \
        .load()
    
    # Process with different time windows
    hourly_aggregates = stream \
        .withWatermark("timestamp", "1 hour") \
        .groupBy(window("timestamp", "1 hour"), "user_id") \
        .agg(sum("amount").alias("hourly_total"))
    
    daily_aggregates = stream \
        .withWatermark("timestamp", "1 day") \
        .groupBy(window("timestamp", "1 day"), "user_id") \
        .agg(sum("amount").alias("daily_total"))
    
    # Write to different sinks
    hourly_query = hourly_aggregates.writeStream \
        .format("delta") \
        .outputMode("append") \
        .option("path", "/data/hourly") \
        .start()
    
    daily_query = daily_aggregates.writeStream \
        .format("delta") \
        .outputMode("append") \
        .option("path", "/data/daily") \
        .start()
    
    return [hourly_query, daily_query]
```

### 4.2 Data Lake Architecture

```python
# Medallion architecture (Bronze-Silver-Gold)
class MedallionArchitecture:
    def __init__(self, spark_session):
        self.spark = spark_session
    
    def bronze_layer(self, raw_data_path):
        """Raw data ingestion with minimal transformation"""
        return self.spark.read.json(raw_data_path) \
            .withColumn("ingestion_timestamp", current_timestamp()) \
            .withColumn("file_name", input_file_name()) \
            .write \
            .format("delta") \
            .mode("append") \
            .option("mergeSchema", "true") \
            .save("/datalake/bronze/events")
    
    def silver_layer(self, bronze_path):
        """Cleaned and validated data"""
        bronze_df = self.spark.read.format("delta").load(bronze_path)
        
        # Data quality rules
        quality_rules = {
            "valid_user_id": col("user_id").isNotNull(),
            "valid_timestamp": col("timestamp").isNotNull(),
            "valid_amount": col("amount") > 0,
            "valid_email": col("email").rlike(r'^[\w\.-]+@[\w\.-]+\.\w+$')
        }
        
        # Apply transformations
        cleaned_df = bronze_df \
            .filter(reduce(lambda a, b: a & b, quality_rules.values())) \
            .withColumn("user_id", col("user_id").cast("string")) \
            .withColumn("timestamp", to_timestamp("timestamp")) \
            .withColumn("amount", col("amount").cast("decimal(10,2)")) \
            .dropDuplicates(["user_id", "timestamp", "transaction_id"])
        
        return cleaned_df.write \
            .format("delta") \
            .mode("overwrite") \
            .partitionBy("date") \
            .save("/datalake/silver/events")
    
    def gold_layer(self, silver_path):
        """Business-ready aggregated data"""
        silver_df = self.spark.read.format("delta").load(silver_path)
        
        # Business aggregations
        user_metrics = silver_df.groupBy("user_id") \
            .agg(
                sum("amount").alias("total_spent"),
                count("*").alias("transaction_count"),
                avg("amount").alias("avg_transaction"),
                min("timestamp").alias("first_transaction"),
                max("timestamp").alias("last_transaction")
            )
        
        # Feature engineering for ML
        user_features = user_metrics \
            .withColumn("days_active", 
                       datediff(col("last_transaction"), col("first_transaction"))) \
            .withColumn("transactions_per_day",
                       col("transaction_count") / greatest(col("days_active"), lit(1))) \
            .withColumn("customer_segment",
                       when(col("total_spent") > 10000, "high_value")
                       .when(col("total_spent") > 1000, "medium_value")
                       .otherwise("low_value"))
        
        return user_features.write \
            .format("delta") \
            .mode("overwrite") \
            .save("/datalake/gold/user_features")

# CDC (Change Data Capture) processing
def process_cdc_data(