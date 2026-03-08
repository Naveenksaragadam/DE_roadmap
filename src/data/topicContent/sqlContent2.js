// SQL (Advanced) — Topics 4-11
export const sqlContent2 = {
  'sql-advanced-4': {
    tutorial: {
      explanation: [
        'GROUP BY aggregates rows sharing values. HAVING filters after aggregation (WHERE filters before). GROUPING SETS, ROLLUP, and CUBE are extensions that compute multiple aggregation levels in a single query.',
        'GROUPING SETS lets you specify exactly which groupings to compute. ROLLUP creates a hierarchy of subtotals (great for reports). CUBE computes all possible combinations of grouping columns.',
      ],
      codeExamples: [
        { description: 'ROLLUP for hierarchical subtotals', code: `SELECT region, product, SUM(revenue) as total
FROM sales
GROUP BY ROLLUP(region, product);
-- Produces: (region, product), (region, NULL), (NULL, NULL)
-- i.e., detail + region subtotals + grand total` },
        { description: 'GROUPING SETS for custom aggregations', code: `SELECT region, product, quarter, SUM(revenue)
FROM sales
GROUP BY GROUPING SETS (
  (region, product),      -- sales by region+product
  (region, quarter),      -- sales by region+quarter
  (product),              -- sales by product only
  ()                      -- grand total
);` },
      ],
      keyTakeaways: [
        'ROLLUP(a,b,c) = GROUPING SETS((a,b,c),(a,b),(a),()) — hierarchical right-to-left rollup',
        'CUBE(a,b) = GROUPING SETS((a,b),(a),(b),()) — all 2^n combinations',
        'Use GROUPING() function to distinguish real NULLs from rollup NULLs',
        'HAVING filters groups; WHERE filters rows — different stages of execution',
      ],
    },
    crashCourse: {
      summary: 'ROLLUP creates hierarchical subtotals, CUBE gives all combinations, GROUPING SETS gives precise control over which aggregation levels to compute.',
      quickFacts: ['ROLLUP: right-to-left hierarchy', 'CUBE: all 2^n combinations', 'GROUPING SETS: explicit list', 'Use GROUPING() to detect rollup NULLs vs real NULLs'],
      tips: ['ROLLUP is perfect for financial reports with subtotals and grand totals'],
    },
  },
  'sql-advanced-5': {
    tutorial: {
      explanation: [
        'Slowly Changing Dimensions (SCD) track how dimension data changes over time. Type 1 overwrites the old value (loses history). Type 2 adds a new row with validity dates (preserves full history). Type 3 adds a column for the previous value (limited history).',
        'In modern warehouses, SCD Type 2 is implemented using MERGE (upsert) statements. The pattern: compare incoming data with current records, update the valid_to date on changed records, and insert new rows for the changes.',
      ],
      codeExamples: [
        { description: 'SCD Type 2 with MERGE', code: `-- Step 1: Close existing records that changed
MERGE INTO dim_customer tgt
USING stg_customer src ON tgt.customer_id = src.customer_id AND tgt.is_current = TRUE
WHEN MATCHED AND (tgt.city != src.city OR tgt.email != src.email)
THEN UPDATE SET
  tgt.valid_to = CURRENT_DATE,
  tgt.is_current = FALSE;

-- Step 2: Insert new records for changes
INSERT INTO dim_customer (customer_id, name, city, email, valid_from, valid_to, is_current)
SELECT s.customer_id, s.name, s.city, s.email, CURRENT_DATE, '9999-12-31', TRUE
FROM stg_customer s
LEFT JOIN dim_customer d ON s.customer_id = d.customer_id AND d.is_current = TRUE
WHERE d.customer_id IS NULL  -- new customers
   OR d.city != s.city OR d.email != s.email;  -- changed customers` },
      ],
      keyTakeaways: [
        'Type 1: simple overwrite — fast but loses history (good for corrections)',
        'Type 2: new row per change — preserves full history (most common for analytics)',
        'Type 3: add prev_value column — limited history (rarely used)',
        'Type 6 (hybrid): combines Type 1 + 2 + 3 for current + historical views',
        'Always include: valid_from, valid_to, is_current flag in Type 2 dimensions',
      ],
    },
    crashCourse: {
      summary: 'SCD manages dimension changes: Type 1 overwrites, Type 2 keeps full history with new rows, Type 3 stores previous value. Type 2 is the DE interview standard.',
      quickFacts: ['Type 1: UPDATE SET name = new_name (lose history)', 'Type 2: INSERT new row, close old with valid_to (keep history)', 'Type 3: ADD prev_city column (limited history)', 'MERGE statement handles upsert logic for SCD Type 2'],
      tips: ['In interviews, always discuss SCD Type 2 — it\'s the most frequently asked dimension pattern'],
    },
  },
  'sql-advanced-6': {
    tutorial: {
      explanation: [
        'Data skew occurs when one partition or join key has disproportionately more data than others, causing one task to take much longer. Broadcast joins send the smaller table to all nodes, eliminating shuffle of the larger table.',
        'Salting is a technique to handle skewed join keys: add a random suffix to the skewed key in both tables, join on the salted key, then aggregate to remove the salt.',
      ],
      codeExamples: [
        { description: 'Detecting and handling data skew', code: `-- Detect skew: find the most popular join keys
SELECT join_key, COUNT(*) as cnt
FROM large_table
GROUP BY join_key
ORDER BY cnt DESC LIMIT 20;

-- Salting technique for skewed keys in Spark SQL
-- 1. Add salt to skewed table
SELECT *, FLOOR(RAND() * 10) as salt FROM large_table
-- 2. Explode small table with all salt values
SELECT *, salt FROM small_table CROSS JOIN (SELECT EXPLODE(SEQUENCE(0,9)) as salt)
-- 3. Join on key + salt` },
      ],
      keyTakeaways: [
        'Broadcast join: small table (< 10MB) sent to all nodes — no shuffle needed',
        'Shuffle join: both tables redistributed by key — expensive for large tables',
        'Data skew = one partition has 10x+ more data → stragglers slow entire job',
        'Salting breaks up hot keys across multiple partitions — trades complexity for speed',
      ],
    },
    crashCourse: {
      summary: 'Data skew causes one partition to bottleneck. Use broadcast joins for small tables, salting for skewed keys.',
      quickFacts: ['Broadcast: send small table to all nodes', 'Shuffle: redistribute both tables by key', 'Skew: uneven data distribution → stragglers', 'Salt: add random value to break up hot keys'],
      tips: ['Check for skew first when a query stage takes 10x longer than others'],
    },
  },
  'sql-advanced-7': {
    tutorial: {
      explanation: [
        'Modern analytical SQL engines like Spark SQL, BigQuery, Presto/Trino, and Redshift each have unique optimization features. Understanding the differences helps you write optimal queries per platform.',
        'BigQuery: serverless, slot-based pricing, nested/repeated fields with UNNEST. Spark SQL: catalyst optimizer, predicate pushdown, AQE. Presto/Trino: federated queries across data sources.',
      ],
      codeExamples: [
        { description: 'Platform-specific SQL features', code: `-- BigQuery: UNNEST for nested arrays
SELECT user_id, event.name, event.timestamp
FROM events, UNNEST(event_list) as event
WHERE event.name = 'purchase';

-- Spark SQL: using hints
SELECT /*+ BROADCAST(small) */ l.*, s.name
FROM large_table l JOIN small_table s ON l.key = s.key;

-- Presto: approximate functions for speed
SELECT approx_distinct(user_id) as unique_users FROM events;` },
      ],
      keyTakeaways: [
        'BigQuery: optimize by partitioning + clustering; avoid SELECT *; use approximate functions',
        'Spark SQL: leverage AQE, predicate pushdown, and broadcast hints',
        'Presto/Trino: great for federated queries but watch memory limits',
        'All platforms: partition pruning is your best friend for query performance',
      ],
    },
    crashCourse: {
      summary: 'Each analytical engine has unique features: BigQuery (serverless, UNNEST), Spark SQL (catalyst, AQE), Presto (federated, approximate). Learn platform-specific optimizations.',
      quickFacts: ['BigQuery: partition by date, cluster by frequently filtered columns', 'Spark SQL: AQE auto-optimizes at runtime', 'Presto: approx_distinct() for fast cardinality', 'All: avoid SELECT *, use partition pruning'],
      tips: ['Know at least one cloud SQL engine deeply — most FAANG interviews let you choose'],
    },
  },
  'sql-advanced-8': {
    tutorial: {
      explanation: [
        'Gaps-and-islands is a classic SQL problem: finding consecutive sequences (islands) and breaks between them (gaps) in data. Common use cases: detecting user session gaps, finding consecutive login days, identifying outage periods.',
        'The core technique: subtract ROW_NUMBER from the value to create group identifiers. Consecutive values produce the same group ID.',
      ],
      codeExamples: [
        { description: 'Finding consecutive date ranges (islands)', code: `-- Find consecutive active days per user
WITH numbered AS (
  SELECT user_id, active_date,
    active_date - INTERVAL '1 day' * ROW_NUMBER() OVER (
      PARTITION BY user_id ORDER BY active_date
    ) as grp
  FROM user_activity
)
SELECT user_id,
  MIN(active_date) as streak_start,
  MAX(active_date) as streak_end,
  COUNT(*) as streak_length
FROM numbered
GROUP BY user_id, grp
ORDER BY streak_length DESC;` },
      ],
      keyTakeaways: [
        'Core trick: value - ROW_NUMBER() = constant for consecutive values',
        'Works for dates, integers, or any sequential values',
        'Common interview question — practice variations with different gap definitions',
        'For gaps: use LAG/LEAD to compare adjacent rows and find discontinuities',
      ],
    },
    crashCourse: {
      summary: 'Gaps-and-islands finds consecutive sequences by subtracting ROW_NUMBER from the value — consecutive items produce the same group ID.',
      quickFacts: ['Island: consecutive sequence of values', 'Gap: break between sequences', 'Technique: value - ROW_NUMBER() OVER (ORDER BY value) = group_id', 'Use LAG() for gap detection between consecutive rows'],
      tips: ['This is one of the most common DE SQL interview questions — practice until it\'s automatic'],
    },
  },
  'sql-advanced-9': {
    tutorial: {
      explanation: [
        'Funnel analysis tracks user progression through a series of steps (e.g., visit → signup → purchase). Window functions are essential because you need to ensure steps happen in order for the same user within a time window.',
        'The technique: self-join or window function approach comparing event sequences per user, ensuring each step occurs after the previous one.',
      ],
      codeExamples: [
        { description: 'Funnel analysis with window functions', code: `-- E-commerce funnel: view → cart → checkout → purchase
WITH funnel AS (
  SELECT user_id, event_type, event_time,
    LEAD(event_type) OVER (PARTITION BY user_id ORDER BY event_time) as next_step,
    LEAD(event_time) OVER (PARTITION BY user_id ORDER BY event_time) as next_time
  FROM events
  WHERE event_type IN ('view','cart','checkout','purchase')
)
SELECT
  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN user_id END) as step1_view,
  COUNT(DISTINCT CASE WHEN event_type = 'view' AND next_step = 'cart' THEN user_id END) as step2_cart,
  COUNT(DISTINCT CASE WHEN event_type = 'cart' AND next_step = 'checkout' THEN user_id END) as step3_checkout,
  COUNT(DISTINCT CASE WHEN event_type = 'checkout' AND next_step = 'purchase' THEN user_id END) as step4_purchase
FROM funnel;` },
      ],
      keyTakeaways: [
        'Funnel analysis answers: "what % of users complete each step in order?"',
        'Use LEAD/LAG to compare sequential events per user',
        'Always filter by time window — a purchase 30 days later may not be the same journey',
        'Calculate conversion rates: step_N / step_N-1 to find the biggest drop-off',
      ],
    },
    crashCourse: {
      summary: 'Funnel analysis uses LEAD/LAG to track ordered user progression through steps. Calculate drop-off rates between each step to identify conversion bottlenecks.',
      quickFacts: ['Funnel: ordered sequence of user actions (view → cart → purchase)', 'LEAD: look at next event for same user', 'Conversion rate: step_N_count / step_1_count', 'Always scope by session or time window'],
      tips: ['This pattern is asked constantly at e-commerce and ad-tech companies'],
    },
  },
  'sql-advanced-10': {
    tutorial: {
      explanation: [
        'PIVOT transforms rows into columns (converting unique values of one column into multiple output columns). UNPIVOT does the reverse — converts columns back into rows. Not all SQL dialects support PIVOT natively, but CASE WHEN achieves the same result universally.',
      ],
      codeExamples: [
        { description: 'Pivoting with CASE WHEN (works everywhere)', code: `-- Turn monthly rows into columns
SELECT product,
  SUM(CASE WHEN month = 'Jan' THEN revenue ELSE 0 END) as jan_rev,
  SUM(CASE WHEN month = 'Feb' THEN revenue ELSE 0 END) as feb_rev,
  SUM(CASE WHEN month = 'Mar' THEN revenue ELSE 0 END) as mar_rev
FROM monthly_sales
GROUP BY product;

-- Unpivot: columns back to rows (using UNION ALL)
SELECT product, 'Jan' as month, jan_rev as revenue FROM pivoted_sales
UNION ALL
SELECT product, 'Feb', feb_rev FROM pivoted_sales
UNION ALL
SELECT product, 'Mar', mar_rev FROM pivoted_sales;` },
      ],
      keyTakeaways: [
        'CASE WHEN + GROUP BY is the universal pivot pattern — works in every SQL dialect',
        'Native PIVOT syntax: SQL Server, Oracle, Snowflake (PIVOT keyword)',
        'BigQuery: use PIVOT operator or CASE WHEN + GROUP BY',
        'Unpivot with UNION ALL or LATERAL FLATTEN (Snowflake) or UNNEST (BigQuery)',
      ],
    },
    crashCourse: {
      summary: 'Pivot turns rows to columns using CASE WHEN + GROUP BY. Unpivot turns columns to rows using UNION ALL. Know both directions.',
      quickFacts: ['Pivot: SUM(CASE WHEN col = val THEN metric END) — universal pattern', 'PIVOT keyword: SQL Server, Oracle, Snowflake', 'Unpivot: UNION ALL each column, or use UNPIVOT keyword', 'BigQuery: use LATERAL FLATTEN or UNNEST for unpivoting'],
      tips: ['Practice both directions — interviews often give one and ask for the other'],
    },
  },
  'sql-advanced-11': {
    tutorial: {
      explanation: [
        'Modern data warehouses store semi-structured data (JSON, arrays) natively. Querying this data requires specific functions: JSON_EXTRACT, UNNEST for arrays, LATERAL FLATTEN, and path expressions.',
        'Understanding how to flatten nested structures into tabular format is critical for ETL pipelines that consume API responses, event data, and NoSQL exports.',
      ],
      codeExamples: [
        { description: 'Querying JSON in different platforms', code: `-- BigQuery: JSON and arrays
SELECT
  JSON_EXTRACT_SCALAR(payload, '$.user.name') as user_name,
  event.*
FROM raw_events, UNNEST(JSON_EXTRACT_ARRAY(payload, '$.events')) as event;

-- Snowflake: LATERAL FLATTEN
SELECT
  raw:user.name::STRING as user_name,
  f.value:event_type::STRING as event_type,
  f.value:timestamp::TIMESTAMP as event_ts
FROM raw_events, LATERAL FLATTEN(input => raw:events) f;

-- PostgreSQL: JSONB operators
SELECT payload->>'user_name' as name, payload->'address'->>'city' as city
FROM events WHERE payload->>'status' = 'active';` },
      ],
      keyTakeaways: [
        'BigQuery: JSON_EXTRACT_SCALAR for values, UNNEST for arrays, STRUCT for nested',
        'Snowflake: colon notation (raw:field), LATERAL FLATTEN for arrays, ::TYPE for casting',
        'Postgres: -> for JSON object, ->> for text extraction, @> for containment',
        'Always flatten to tabular format in staging layers — downstream queries should be simple SQL',
      ],
    },
    crashCourse: {
      summary: 'Each platform has unique JSON syntax: BigQuery (UNNEST), Snowflake (LATERAL FLATTEN), Postgres (-> / ->>). Flatten nested data in staging, query simply downstream.',
      quickFacts: ['BigQuery: JSON_EXTRACT_SCALAR, UNNEST', 'Snowflake: raw:field, LATERAL FLATTEN', 'Postgres: ->> for text, -> for object', 'Always flatten in staging layer for cleaner downstream SQL'],
      tips: ['Know JSON querying for at least one platform deeply — it comes up in every DE interview'],
    },
  },
};
