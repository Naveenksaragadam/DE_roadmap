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
        'Window functions execute AFTER WHERE, GROUP BY, and HAVING — they see the filtered/grouped result',
        'ROW_NUMBER for unique ranking, RANK for gaps after ties, DENSE_RANK for no gaps',
        'ROWS BETWEEN is row-based (exact count); RANGE BETWEEN is value-based (same values treated equally)',
        'Use LAG/LEAD for comparing current row with previous/next — essential for change detection',
        'NTILE(4) creates quartiles — useful for percentile-based analysis',
      ],
    },
    crashCourse: {
      summary: 'Window functions compute values across related rows without collapsing them. They use OVER() with optional PARTITION BY (grouping) and ORDER BY (sorting). The three ranking functions differ in tie handling.',
      quickFacts: [
        'ROW_NUMBER: always unique (1,2,3,4) even with ties',
        'RANK: gaps after ties (1,2,2,4)',
        'DENSE_RANK: no gaps (1,2,2,3)',
        'LAG(col, N, default): N rows back, LEAD(col, N, default): N rows forward',
        'FIRST_VALUE/LAST_VALUE: boundary values in the window frame',
        'Default frame: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
      ],
      tips: [
        'Always specify ORDER BY in OVER() for ranking functions — without it, results are non-deterministic',
        'For Top-N per group: use ROW_NUMBER() in a subquery, then filter WHERE row_num <= N',
        'LAST_VALUE needs ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING to work correctly',
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
        {
          description: 'Correlated subquery vs JOIN',
          code: `-- Correlated subquery (slower)
SELECT d.name, (SELECT COUNT(*) FROM employees e WHERE e.dept_id = d.id) as emp_count
FROM departments d;

-- Equivalent JOIN (faster)
SELECT d.name, COUNT(e.id) as emp_count
FROM departments d LEFT JOIN employees e ON d.id = e.dept_id
GROUP BY d.name;`,
        },
      ],
      keyTakeaways: [
        'CTEs improve readability — name each step of your transformation pipeline',
        'Recursive CTEs need: base case + UNION ALL + recursive step + termination condition',
        'Most databases limit recursion depth (default ~100) — use MAXRECURSION to override',
        'Prefer JOINs or window functions over correlated subqueries for performance',
      ],
    },
    crashCourse: {
      summary: 'CTEs (WITH clause) create named temporary results for cleaner SQL. Recursive CTEs traverse hierarchies with a base case + recursive step. Correlated subqueries run per outer row — powerful but slow.',
      quickFacts: [
        'CTE syntax: WITH cte_name AS (SELECT ...) SELECT * FROM cte_name',
        'CTEs can reference other CTEs defined before them (daisy-chaining)',
        'Recursive CTEs MUST use UNION ALL, not UNION',
        'Subquery types: scalar (one value), row (one row), table (many rows), correlated (references outer)',
      ],
      tips: [
        'Debug complex CTEs by running each CTE independently first',
        'Avoid SELECT * in production CTEs — explicitly list columns',
      ],
    },
  },
  'sql-advanced-2': {
    tutorial: {
      explanation: [
        'Set operations combine results from two or more SELECT statements. UNION combines and deduplicates. UNION ALL combines without deduplication (faster). INTERSECT returns rows common to both. EXCEPT returns rows in the first but not the second.',
        'For set operations to work, both queries must have the same number of columns with compatible data types. Column names come from the first query.',
      ],
      codeExamples: [
        {
          description: 'Set operations for deduplication',
          code: `-- Find customers who ordered but never returned anything
SELECT customer_id FROM orders
EXCEPT
SELECT customer_id FROM returns;

-- Find customers in both premium and loyalty programs
SELECT customer_id FROM premium_members
INTERSECT
SELECT customer_id FROM loyalty_members;

-- UNION ALL is faster when you know there are no duplicates
SELECT id, 'order' as source FROM orders
UNION ALL
SELECT id, 'return' as source FROM returns;`,
        },
      ],
      keyTakeaways: [
        'UNION removes duplicates (has sorting overhead); UNION ALL keeps all rows (much faster)',
        'EXCEPT is like set subtraction — order matters: A EXCEPT B ≠ B EXCEPT A',
        'Always prefer UNION ALL unless you specifically need deduplication',
        'In BigQuery: use EXCEPT DISTINCT; in some dialects: MINUS instead of EXCEPT',
      ],
    },
    crashCourse: {
      summary: 'UNION/INTERSECT/EXCEPT combine query results. UNION ALL is always faster than UNION. Use EXCEPT for "in A but not in B" patterns.',
      quickFacts: [
        'UNION: combines + deduplicates (slow)',
        'UNION ALL: combines without dedup (fast) — use this by default',
        'INTERSECT: rows in both queries',
        'EXCEPT: rows in first query but not second',
        'All operations require same column count and compatible types',
      ],
      tips: ['Use UNION ALL + GROUP BY for more control over deduplication logic than plain UNION'],
    },
  },
  'sql-advanced-3': {
    tutorial: {
      explanation: [
        'Query optimization starts with understanding EXPLAIN plans. Every SQL engine creates an execution plan showing how it will access data — which joins, which indexes, and in what order. Reading EXPLAIN output is the #1 skill for optimizing slow queries.',
        'Indexes are data structures (B-Tree, Hash, Bitmap) that speed up lookups. B-Tree is the default and handles equality and range queries. Hash indexes are fast for exact matches only. Bitmap indexes are great for low-cardinality columns (e.g., gender, status). Partitioning splits large tables by a key (date, region) so queries scan less data.',
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
-- Hash Join vs Nested Loop: join strategy
-- Rows: estimated vs actual (if very different, stats are stale → ANALYZE)`,
        },
        {
          description: 'Creating effective indexes',
          code: `-- Composite index for frequent query pattern
CREATE INDEX idx_orders_customer_date
ON orders (customer_id, created_at DESC);

-- Partial index for active records only
CREATE INDEX idx_active_orders
ON orders (status) WHERE status = 'active';

-- Covering index (includes all needed columns → index-only scan)
CREATE INDEX idx_orders_covering
ON orders (customer_id) INCLUDE (amount, status);`,
        },
      ],
      keyTakeaways: [
        'Always EXPLAIN ANALYZE before and after optimization — measure, don\'t guess',
        'Index column order matters in composite indexes — put equality conditions first, range last',
        'Too many indexes slow down writes — index only what you query frequently',
        'Partition by the column you filter most (usually date) — enables partition pruning',
        'VACUUM ANALYZE keeps statistics fresh — stale stats → bad query plans',
      ],
    },
    crashCourse: {
      summary: 'Use EXPLAIN to see query plans. Create indexes on frequently filtered columns. Partition large tables by date. Always measure performance before and after changes.',
      quickFacts: [
        'B-Tree: default index, handles = and range (<, >, BETWEEN)',
        'Hash: fast for equality only (=), not range queries',
        'Bitmap: great for low-cardinality (few distinct values)',
        'Composite index: leftmost prefix rule — (a,b,c) supports queries on (a), (a,b), (a,b,c)',
        'Partition pruning: skip irrelevant partitions entirely',
      ],
      tips: [
        'If EXPLAIN shows "Seq Scan" on a large table, you probably need an index',
        'Run ANALYZE after bulk inserts to update table statistics',
      ],
    },
  },
};
