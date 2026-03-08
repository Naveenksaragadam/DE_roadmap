// SQL (Advanced) — Topic Deep-Dive Content
export const sqlContent = {
  'sql-advanced-0': {
    tutorial: {
      explanation: [
        'Window functions are one of the most powerful SQL features and are heavily tested in DE interviews. Unlike GROUP BY which collapses rows, window functions compute values across a set of rows related to the current row WITHOUT reducing the result set.',
        'ROW_NUMBER assigns a unique sequential integer. RANK assigns the same number to ties but leaves gaps (1,2,2,4). DENSE_RANK assigns the same number to ties without gaps (1,2,2,3). LAG/LEAD access previous/next rows. NTILE divides rows into N buckets. FIRST_VALUE/LAST_VALUE get boundary values.',
        'The OVER() clause defines the window: PARTITION BY groups rows (like GROUP BY but without collapsing), ORDER BY sorts within each partition, and ROWS/RANGE BETWEEN defines the frame (which rows to include in the calculation).',
      ],
      codeExamples: [
        {
          description: 'Window functions comparison',
          code: `-- Compare ROW_NUMBER, RANK, DENSE_RANK
SELECT
  employee_id,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as row_num,
  RANK()       OVER (PARTITION BY department ORDER BY salary DESC) as rank_val,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dense_rank_val,
  LAG(salary)  OVER (PARTITION BY department ORDER BY salary DESC) as prev_salary,
  LEAD(salary) OVER (PARTITION BY department ORDER BY salary DESC) as next_salary
FROM employees;`,
        },
        {
          description: 'Running total with ROWS BETWEEN',
          code: `-- Running total of revenue per customer
SELECT
  customer_id, order_date, amount,
  SUM(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) as running_total
FROM orders;`,
        },
      ],
      keyTakeaways: [
        'Window functions execute AFTER WHERE, GROUP BY, and HAVING — they see the filtered/grouped result.',
        'ROW_NUMBER for unique ranking, RANK for gaps after ties, DENSE_RANK for no gaps.',
        'ROWS BETWEEN is row-based (exact count); RANGE BETWEEN is value-based (same values treated equally).',
        'Use LAG/LEAD for comparing current row with previous/next — essential for change detection.',
      ],
    },
    crashCourse: {
      summary: 'Window functions compute values across related rows without collapsing them. They use OVER() with optional PARTITION BY (grouping) and ORDER BY (sorting).',
      quickFacts: [
        'ROW_NUMBER: always unique (1,2,3,4) even with ties',
        'RANK: gaps after ties (1,2,2,4)',
        'DENSE_RANK: no gaps (1,2,2,3)',
        'LAG(col, N, default) / LEAD(col, N, default)',
        'Default frame: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
      ],
      tips: [
        'Always specify ORDER BY in OVER() for ranking functions — without it, results are non-deterministic',
        'For Top-N per group: use ROW_NUMBER() in a subquery, then filter WHERE row_num <= N',
      ],
    },
  },
  'sql-advanced-1': {
    tutorial: {
      explanation: [
        'Common Table Expressions (CTEs) are temporary named result sets defined with the WITH keyword. They make complex queries readable, reusable, and debuggable. Non-recursive CTEs are like inline views; recursive CTEs can traverse hierarchies and generate series.',
        'Correlated subqueries reference the outer query and execute once per outer row (like a nested loop). They are powerful but can be slow on large datasets. Always consider if a JOIN or window function can replace a correlated subquery.',
      ],
      codeExamples: [
        {
          description: 'Recursive CTE — employee hierarchy',
          code: `WITH RECURSIVE org_chart AS (
  -- Base case: top-level managers
  SELECT id, name, manager_id, 1 as level
  FROM employees WHERE manager_id IS NULL

  UNION ALL

  -- Recursive step: find direct reports
  SELECT e.id, e.name, e.manager_id, oc.level + 1
  FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT * FROM org_chart ORDER BY level, name;`,
        },
      ],
      keyTakeaways: [
        'CTEs improve readability — name each step of your transformation pipeline.',
        'Recursive CTEs need: base case + UNION ALL + recursive step + termination condition.',
        'Prefer JOINs or window functions over correlated subqueries for performance.',
      ],
    },
    crashCourse: {
      summary: 'CTEs (WITH clause) create named temporary results for cleaner SQL. Recursive CTEs traverse hierarchies. Correlated subqueries run per outer row — powerful but slow.',
      quickFacts: [
        'CTE syntax: WITH cte_name AS (SELECT ...) SELECT * FROM cte_name',
        'CTEs can reference other CTEs defined before them (daisy-chaining)',
        'Recursive CTEs MUST use UNION ALL, not UNION',
      ],
      tips: [
        'Debug complex CTEs by running each CTE independently first',
      ],
    },
  },
  'sql-advanced-2': {
    tutorial: {
      explanation: [
        'Set operations combine results from two or more SELECT statements. UNION combines and deduplicates. UNION ALL combines without deduplication (faster). INTERSECT returns rows common to both. EXCEPT returns rows in the first but not the second.',
      ],
      codeExamples: [
        {
          description: 'Set operations comparison',
          code: `-- Find customers who ordered but never returned anything
SELECT customer_id FROM orders
EXCEPT
SELECT customer_id FROM returns;

-- UNION ALL is faster when you know there are no duplicates
SELECT id, 'order' as source FROM orders
UNION ALL
SELECT id, 'return' as source FROM returns;`,
        },
      ],
      keyTakeaways: [
        'UNION removes duplicates (sorting overhead); UNION ALL keeps all rows (much faster).',
        'EXCEPT is like set subtraction (order matters).',
        'Always prefer UNION ALL unless you specifically need deduplication.',
      ],
    },
    crashCourse: {
      summary: 'UNION ALL is always faster than UNION because it skips the deduplication sort. Use EXCEPT for "in A but not in B" queries.',
      quickFacts: [
        'UNION: deduplicates (slow)',
        'UNION ALL: keeps all (fast) — use this by default',
        'EXCEPT: rows in first query but not second',
      ],
      tips: ['Use UNION ALL + GROUP BY for more control over deduplication logic than plain UNION'],
    },
  },
  'sql-advanced-3': {
    tutorial: {
      explanation: [
        'Query optimization starts with understanding EXPLAIN plans. Every SQL engine creates an execution plan showing how it will access data — which joins, which indexes, and in what order.',
        'Indexes are data structures (B-Tree, Hash, Bitmap) that speed up lookups. B-Tree is the default and handles equality and range queries. Hash indexes are fast for exact matches only.',
      ],
      codeExamples: [
        {
          description: 'Reading an EXPLAIN plan',
          code: `-- PostgreSQL EXPLAIN ANALYZE (shows actual execution time)
EXPLAIN ANALYZE
SELECT o.*, c.name
FROM orders o JOIN customers c ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01'
  AND c.country = 'US';

-- Key things to look for in output:
-- Seq Scan: full table scan (bad for large tables)
-- Index Scan: using an index (good)
-- Hash Join vs Nested Loop: join strategy`,
        },
      ],
      keyTakeaways: [
        'Always EXPLAIN ANALYZE before and after optimization — measure, don\'t guess.',
        'Index column order matters in composite indexes — put equality conditions first, range last.',
        'Too many indexes slow down writes.',
      ],
    },
    crashCourse: {
      summary: 'Use EXPLAIN to see query plans. Create indexes on frequently filtered columns. Always measure performance before and after changes.',
      quickFacts: [
        'B-Tree: default index, handles = and range (<, >, BETWEEN)',
        'Composite index: leftmost prefix rule',
      ],
      tips: [
        'If EXPLAIN shows "Seq Scan" on a large table, you probably need an index.',
      ],
    },
  },
  'sql-advanced-4': {
    tutorial: {
      explanation: [
        'Beyond simple GROUP BY, advanced aggregations allow you to generate sub-totals and grand totals in a single query.',
        'GROUPING SETS lets you specify exactly which combinations of columns to group by. ROLLUP automatically creates hierarchical sub-totals (e.g. Year -> Month -> Day). CUBE generates every possible mathematically combination of groups.',
      ],
      codeExamples: [
        {
          description: 'ROLLUP and CUBE',
          code: `-- Rollup creates hierarchical subtotals
-- Output will have rows for (dept, is_active), just (dept), and () [grand total]
SELECT dept_id, is_active, COUNT(*) 
FROM employees 
GROUP BY ROLLUP(dept_id, is_active);

-- Cube creates all possible combinations
-- Output includes totals for isolated (is_active) without dept
SELECT dept_id, is_active, COUNT(*) 
FROM employees 
GROUP BY CUBE(dept_id, is_active);

-- Explicit Grouping Sets
SELECT dept_id, is_active, COUNT(*)
FROM employees
GROUP BY GROUPING SETS ((dept_id), (is_active), ());`,
        },
      ],
      keyTakeaways: [
        'ROLLUP is perfect for time-series hierarchies (Year, Quarter, Month).',
        'CUBE is perfect for cross-tabular reports where you need every intersection.',
        'The nulls generated by these functions in the grouping columns represent "All Values". Use the `GROUPING()` function to distinguish between a generated total row vs an actual NULL value in the data.',
      ],
    },
    crashCourse: {
      summary: 'Advanced aggregations (ROLLUP, CUBE, GROUPING SETS) allow you to compute multiple levels of subtotals and grand totals in a single pass over the data, rather than UNIONing multiple queries together.',
      quickFacts: [
        'ROLLUP(a,b,c): Groups by (a,b,c), (a,b), (a), and ()',
        'CUBE(a,b): Groups by (a,b), (a), (b), and ()',
        'GROUPING SETS: Explicitly defines exactly which groupings you want',
      ],
      tips: [
        'These functions are heavily used in pre-computing Data Warehouse reporting tables to serve BI dashboards fast.',
      ],
    },
  },
  'sql-advanced-5': {
    tutorial: {
      explanation: [
        'In SQL, managing Slowly Changing Dimensions (SCD Type 2) or simply syncing dimension tables requires the MERGE (or UPSERT) statement.',
        'MERGE allows you to perform an INSERT, UPDATE, or DELETE in a single atomic transaction based on a join condition between a target table and a source table.',
      ],
      codeExamples: [
        {
          description: 'SQL MERGE (Upsert)',
          code: `-- Standard Postgres UPSERT (On Conflict)
INSERT INTO employees (id, name, email, salary)
VALUES (1, 'John Doe', 'john@email.com', 75000)
ON CONFLICT (id) 
DO UPDATE SET 
    salary = EXCLUDED.salary, 
    email = EXCLUDED.email;

-- Standard ANSI MERGE (Used in Snowflake/BigQuery)
MERGE INTO target_customers t
USING source_updates s
ON t.customer_id = s.customer_id
WHEN MATCHED AND t.hash_diff != s.hash_diff THEN
  UPDATE SET t.email = s.email, t.updated_at = CURRENT_DATE
WHEN NOT MATCHED THEN
  INSERT (customer_id, email, updated_at)
  VALUES (s.customer_id, s.email, CURRENT_DATE);`,
        },
      ],
      keyTakeaways: [
        'Postgres uses `ON CONFLICT DO UPDATE` (Upsert), whereas Data Warehouses like Snowflake/BigQuery use the ANSI standard `MERGE INTO`.',
        'In a MERGE statement, comparing every column for updates is slow. Calculate an MD5 hash of the row (`hash_diff`) in both source and target, and only UPDATE `WHEN t.hash != s.hash`.',
      ],
    },
    crashCourse: {
      summary: 'MERGE (or UPSERT) intelligently inserts new rows or updates existing rows in a single command, preventing primary key violations and optimizing dimension loading.',
      quickFacts: [
        'Postgres Upsert: `INSERT ... ON CONFLICT DO UPDATE`',
        'ANSI Merge: `MERGE INTO target USING source ON ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT`',
        '`EXCLUDED`: In Postgres, the magic table holding the row that was attempted to be inserted.',
      ],
      tips: [
        'Always filter your source data for duplicates before initiating a MERGE. A MERGE will fail if the source query provides two rows attempting to update the exact same target row.',
      ],
    },
  },
  'sql-advanced-6': {
    tutorial: {
      explanation: [
        'When joining tables, if one join key has 90% of the data (e.g. `customer_id = 0` for "Guest" checkouts), standard distributed JOIN algorithms will fail because a single node must process that massive key (Data Skew).',
        'Two SQL techniques exist to fix this: Broadcast Joins and Salting.',
        'Salting involves adding a random number string to the skewed key in the large table, and replicating the small table N times with matching random numbers, forcing the database to distribute the skewed key across N nodes.',
      ],
      codeExamples: [
        {
          description: 'Manual SQL Salting for Skew',
          code: `-- 1. Add salt (0-9) to the huge skewed Fact table
WITH salted_facts AS (
    SELECT 
        *, 
        CONCAT(customer_id, '_', FLOOR(RANDOM() * 10)) as salted_key
    FROM fact_sales
),

-- 2. Explode the small Dimension table to match all 10 salts!
-- (Cross join with a generated series 0-9)
salted_dims AS (
    SELECT 
        d.*, 
        CONCAT(d.customer_id, '_', s.num) as salted_key
    FROM dim_customer d
    CROSS JOIN GENERATE_SERIES(0,9) as s(num)
)

-- 3. Perform the join evenly!
SELECT f.*, d.name
FROM salted_facts f
JOIN salted_dims d ON f.salted_key = d.salted_key;`,
        },
      ],
      keyTakeaways: [
        'Salting is a fallback. If the dimension table is small enough (<100MB), force a Broadcast Join instead (e.g. `/*+ MAPJOIN(dim) */` in Hive/Presto).',
        'Modern engines like Spark 3.0 Adaptive Query Execution and Snowflake handle skew automatically, meaning you rarely write manual salting SQL today, but it remains a classic interview question.',
      ],
    },
    crashCourse: {
      summary: 'Data Skew causes "straggler tasks" in distributed SQL queries. Fix it by broadcasting the small table to all nodes (no shuffle) or by appending random "Salt" to the keys to force distribution.',
      quickFacts: [
        'Data Skew: A non-uniform distribution of keys (e.g., millions of NULLs).',
        'Broadcast Join: Sends the small table everywhere. Solves skew instantly.',
        'Salting: Appending RAND() to keys to manually chop a massive partition into smaller pieces.',
      ],
      tips: [
        'If an interviewer asks how to spot skew, say "I look at the query execution details—if 99% of tasks finish in 10 seconds, but 1 task takes 45 minutes, it is definitely data skew."',
      ],
    },
  },
  'sql-advanced-7': {
    tutorial: {
      explanation: [
        'Analytical SQL differs from transactional SQL in scale and syntax. Engines like BigQuery, Snowflake, and Trino/Presto have specialized functions for array manipulation, structural typing, and approximations.',
        'Approximation functions like `APPROX_COUNT_DISTINCT()` use HyperLogLog algorithms to provide a 99% accurate count on billions of rows in seconds, whereas exact `COUNT(DISTINCT id)` could take hours due to memory constraints.',
      ],
      codeExamples: [
        {
          description: 'Array Functions & Approximations',
          code: `-- ARRAY aggregation (Postgres/Presto/Snowflake)
-- Condense multiple rows of tags into a single list
SELECT 
    user_id, 
    ARRAY_AGG(DISTINCT tag_name ORDER BY tag_name) as tags
FROM user_tags
GROUP BY user_id;

-- Approximations (BigQuery/Snowflake/Presto)
-- Super fast distinctive counting on billions of rows
SELECT 
    country,
    APPROX_COUNT_DISTINCT(device_id) as approx_unique_devices
FROM mobile_telemetry
GROUP BY country;`,
        },
      ],
      keyTakeaways: [
        'When doing ad-hoc analysis on massive data lakes, exact precision is rarely needed. Embrace `APPROX_COUNT_DISTINCT` and `APPROX_QUANTILES` to save compute costs and return results instantly.',
        '`ARRAY_AGG` combined with `ARRAY_TO_STRING` is incredibly powerful for flattening 1-to-many relationships without increasing the row count.',
      ],
    },
    crashCourse: {
      summary: 'Analytical DBs provide functions for working at massive scale. Use `ARRAY_AGG` to flatten data instead of joining rows identically. Use `APPROX_` functions for lightning-fast distinct counting using HyperLogLog.',
      quickFacts: [
        '`ARRAY_AGG()`: Condenses 10 rows into 1 row containing an array of 10 items.',
        '`APPROX_COUNT_DISTINCT()`: HyperLogLog algorithm. Accurate to ~99%, uses 1/1000th the memory of COUNT DISTINCT.',
      ],
      tips: [
        'In Presto/Athena interviews, mention that you would use `APPROX_COUNT_DISTINCT` for initial data exploration on S3 to prevent query timeouts.',
      ],
    },
  },
  'sql-advanced-8': {
    tutorial: {
      explanation: [
        'The "Gaps and Islands" problem is a classic SQL interview challenge. You are given a sequence of dates or sequential IDs, and you must identify consecutive sequences ("Islands") and the breaks between them ("Gaps").',
        'Most commonly, this is solved by utilizing the difference between `ROW_NUMBER()` and the sequential column (e.g. integer Date or ID). Within a consecutive sequence, both the value and the `ROW_NUMBER()` increment by 1. Therefore, their difference remains constant!',
      ],
      codeExamples: [
        {
          description: 'Solving Gaps and Islands with ROW_NUMBER',
          code: `WITH base_data AS (
    -- Input: 1, 2, 3, 6, 7, 8
    SELECT login_date FROM user_logins WHERE user_id = 99
),
numbered_data AS (
    -- date - row_number = constant group id!
    SELECT 
        login_date,
        login_date - CAST(ROW_NUMBER() OVER(ORDER BY login_date) AS INT) as island_id
    FROM base_data
)
-- Aggregate by the constant island_id
SELECT 
    MIN(login_date) as start_of_streak,
    MAX(login_date) as end_of_streak,
    COUNT(*) as streak_length
FROM numbered_data
GROUP BY island_id;`,
        },
      ],
      keyTakeaways: [
        'The "difference between value and row_number" grouping trick is the most elegant solution. Memorize this pattern for interviews.',
        'An alternative method uses `LAG(login_date)` to find dates where the difference from the previous date is > 1. That signifies a "Gap" and the start of a new "Island".',
      ],
    },
    crashCourse: {
      summary: 'Gaps and Islands analysis groups consecutive rows of data into "streaks" (Islands) and finds the missing rows in between (Gaps). It is heavily used in sessionization and user engagement metrics.',
      quickFacts: [
        'Island: A consecutive sequence of data points (e.g. logged in 5 days in a row).',
        'Gap: A break in the sequence.',
        'The Grouping Trick: `Value - ROW_NUMBER() = Constant Island ID`.',
      ],
      tips: [
        'Whenever a question asks to find "User streaks", "Consecutive days", or "Session groupings", immediately think "Gaps and Islands".',
      ],
    },
  },
  'sql-advanced-9': {
    tutorial: {
      explanation: [
        'Funnel analysis tracks user progression through a series of sequential events (e.g., Homepage -> Cart -> Checkout -> Purchase).',
        'You build this in SQL by isolating users who performed Step 1, then using `LEFT JOIN` or Window Functions (like `LEAD()` or conditional aggregations) to see if they performed Step 2 within a specific time boundary.',
      ],
      codeExamples: [
        {
          description: 'Funnel Analysis with Conditional Aggregation',
          code: `-- E-commerce 3-step funnel
WITH user_events AS (
    SELECT 
        user_id,
        MIN(CASE WHEN event = 'home_page' THEN timestamp END) as step1_time,
        MIN(CASE WHEN event = 'add_to_cart' THEN timestamp END) as step2_time,
        MIN(CASE WHEN event = 'purchase' THEN timestamp END) as step3_time
    FROM telemetry_logs
    GROUP BY user_id
)
SELECT 
    COUNT(step1_time) as home_visitors,
    -- Step 2 must happen AFTER Step 1
    COUNT(CASE WHEN step2_time > step1_time THEN 1 END) as cart_adders,
    -- Step 3 must happen AFTER Step 2
    COUNT(CASE WHEN step3_time > step2_time THEN 1 END) as purchasers
FROM user_events;`,
        },
      ],
      keyTakeaways: [
        'For extremely large funnels, doing infinite Self-Joins destroys performance. Conditional Aggregation (`SUM(CASE WHEN...)`) allows you to calculate the whole funnel in a single pass of the data.',
        'Strict funnels require step 2 to happen sequentially after step 1. Loose funnels just verify both events happened at any point.',
      ],
    },
    crashCourse: {
      summary: 'Funnel queries find the drop-off rate of users moving between sequential product stages. Optimize them using a single `GROUP BY` with `MIN(CASE WHEN)` arrays rather than heavy `LEFT JOIN` chains.',
      quickFacts: [
        'Funnel Drop-off: (Users in Step N-1) - (Users in Step N).',
        'Conversion Rate: (Users in Step N) / (Users in Step N-1).',
        'Conditional Aggregation: The fastest way to build funnels.',
      ],
      tips: [
        'If asked to restrict the funnel to "Checking out within 24 hours of adding to cart", simply add `AND step3_time <= step2_time + INTERVAL \'24 hours\'` to your CASE condition.',
      ],
    },
  },
  'sql-advanced-10': {
    tutorial: {
      explanation: [
        'Pivoting converts rows into columns (turning tall data into wide data). Unpivoting converts columns into rows (wide to tall).',
        'While specialized `PIVOT` and `UNPIVOT` operators exist in Snowflake/SQL Server, you can universally achieve Pivoting in any dialect using `SUM(CASE WHEN...)` or `MAX(CASE WHEN...)`.',
      ],
      codeExamples: [
        {
          description: 'Universal Pivot using CASE WHEN',
          code: `-- Original "Tall" Data:
-- User | Month | Revenue
-- John | Jan   | 100
-- John | Feb   | 200

-- Pivoted "Wide" Data:
SELECT 
    user,
    SUM(CASE WHEN month = 'Jan' THEN revenue ELSE 0 END) as jan_revenue,
    SUM(CASE WHEN month = 'Feb' THEN revenue ELSE 0 END) as feb_revenue,
    SUM(CASE WHEN month = 'Mar' THEN revenue ELSE 0 END) as mar_revenue
FROM sales
GROUP BY user;

-- Result:
-- User | jan_revenue | feb_revenue | mar_revenue
-- John | 100         | 200         | 0`,
        },
      ],
      keyTakeaways: [
        'The universal pivot (`GROUP BY` + `SUM(CASE WHEN)`) is an absolute staple of data engineering, especially for flattening out Entity-Attribute-Value (EAV) tables into standard transactional tables.',
        'Unpivoting (Wide to Tall) universally involves `CROSS JOIN`ing the table with a static array of column names, or using multiple `UNION ALL` statements.',
      ],
    },
    crashCourse: {
      summary: 'Pivoting turns row values into column headers. The most reliable, cross-compatible way to pivot is by aggregating with `CASE WHEN`.',
      quickFacts: [
        'Pivot: Rows -> Columns (Tall to Wide). E.g., making month names the columns.',
        'Unpivot: Columns -> Rows (Wide to Tall).',
        'Max/Sum(Case When): The universal Pivot idiom in Postgres, MySQL, BigQuery, etc.',
      ],
      tips: [
        'If an interviewer asks to transpose a table, immediately start writing `SUM(CASE WHEN condition THEN value ELSE 0 END)`.',
      ],
    },
  },
  'sql-advanced-11': {
    tutorial: {
      explanation: [
        'Modern data engineering heavily involves querying semi-structured data (JSON) directly within the database without preprocessing it.',
        'Postgres provides the `->` and `->>` operators for extracting JSON. Data warehouses like Snowflake use `LATERAL FLATTEN` to explode a JSON array into rows. BigQuery uses `UNNEST()`.',
      ],
      codeExamples: [
        {
          description: 'Extracting and Flattening JSON',
          code: `-- 1. Postgres JSON Extraction
-- '->' returns JSON object, '->>' returns plain text
SELECT 
    id,
    payload->>'customer_name' as name,
    CAST(payload->'address'->>'zip' AS INT) as zip_code
FROM dynamic_events;

-- 2. Flattening / Exploding a JSON Array (Presto / BigQuery syntax)
-- payload = { "items": ["shoes", "shirt", "hat"] }
SELECT 
    e.id, 
    items.item_name
FROM dynamic_events e
-- Explodes the array into 3 separate rows!
CROSS JOIN UNNEST(e.payload.items) AS items(item_name);`,
        },
      ],
      keyTakeaways: [
        'JSON data types in databases (like Postgres `JSONB` or Snowflake `VARIANT`) store the document parsed in a binary format, allowing indexing (`GIN` indexes) and extremely fast lookups.',
        'Unnesting or Flattening is the action of taking a single row containing a JSON array of 5 items, and turning it into 5 separate rows joined to the original parent row data. Crucial for converting JSON events into relational tables.',
      ],
    },
    crashCourse: {
      summary: 'Data warehouses treat JSON natively. You can extract nested values using path operators, and explode arrays into relational rows using UNNEST or LATERAL FLATTEN.',
      quickFacts: [
        'JSONB: The binary JSON data type in Postgres. Highly optimized.',
        '`->>`: Postgres operator to extract JSON value as text.',
        'UNNEST() / Flatten: Function that takes an array and turns it into rows.',
      ],
      tips: [
        'In data pipelines, prefer loading the raw JSON payload into a `VARIANT` column, and then using ELT (dbt) views to parse the JSON paths into proper SQL columns visually.',
      ],
    },
  },
};
