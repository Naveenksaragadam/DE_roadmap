// Data Warehousing & Modeling — Topic Deep-Dive Content (Part 1: Schemas to OLAP)
export const warehouseContent = {
  'data-warehousing-0': {
    tutorial: {
      explanation: [
        'A Star Schema is the simplest and most widely used approach in dimensional modeling (Kimball methodology). It consists of a central Fact table (storing measurable metrics like sales or clicks) connected to multiple Dimension tables (storing descriptive attributes like time, product, or customer). It looks like a star with the fact table in the middle.',
        'A Snowflake Schema is a normalized variant of the Star Schema. The dimension tables are broken down into sub-dimensions (e.g., a "Product" dimension split into "Product", "Category", and "Brand" tables) to save storage space and enforce data integrity.',
        'A Galaxy Schema (or Fact Constellation) handles extremely complex enterprise environments. It consists of multiple Fact tables that share several conformed Dimension tables (e.g., both "Sales" and "Inventory" fact tables sharing a "Date" and "Product" dimension).',
      ],
      codeExamples: [
        {
          description: 'SQL implementation of a Star Schema query',
          code: `-- A typical Star Schema analytic query
-- Notice the simple, clean 1-hop joins from Fact to Dimensions
SELECT 
    d.year_month,
    p.category,
    c.segment,
    SUM(f.sales_amount) as total_revenue,
    COUNT(DISTINCT f.customer_key) as unique_buyers
FROM fact_sales f
JOIN dim_date d ON f.order_date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
JOIN dim_customer c ON f.customer_key = c.customer_key
WHERE d.year = 2024
GROUP BY 
    d.year_month, 
    p.category, 
    c.segment;`,
        },
        {
          description: 'Star Schema vs Snowflake Schema Performance Tradeoffs',
          code: `-- Snowflake Schema analytic query (requires more joins)
-- Generally slower in modern column-store databases
SELECT 
    p.product_name,
    c.category_name,    -- Requires joining to sub-dimension
    SUM(f.sales_amount)
FROM fact_sales f
JOIN dim_product p ON f.product_key = p.product_key
JOIN dim_category c ON p.category_key = c.category_key -- EXTRA JOIN
GROUP BY 
    p.product_name, 
    c.category_name;`,
        },
      ],
      keyTakeaways: [
        'Star Schema is heavily favored in modern data engineering (BigQuery, Snowflake). Storage is cheap, but compute (joins) is expensive. Denormalizing data into a Star Schema reduces complex joins.',
        'Snowflake Schema saves storage by normalizing dimensions (3rd Normal Form). It was popular in the 90s/00s when disk space was expensive, but is mostly an anti-pattern today for analytical workloads.',
        'Analytics engineers spend 80% of their time building and maintaining Star Schemas via dbt because they are intuitive for business users to query directly.',
      ],
    },
    crashCourse: {
      summary: 'Star Schema (1 fact table, 1-hop dimensions) is optimized for read performance and simplicity. Snowflake Schema (normalized dimensions requiring multi-hop joins) saves space but is slower. Modern data warehouses heavily favor Star Schemas because storage is cheap and compute is expensive.',
      quickFacts: [
        'Star Schema: Denormalized dimensions. Fast to query, intuitive for users.',
        'Snowflake Schema: Normalized dimensions (sub-dimensions). Slower to query, complex to navigate.',
        'Galaxy Schema/Fact Constellation: Multiple Fact tables sharing Conformed Dimensions.',
        'Conformed Dimension: A dimension shared across multiple business processes (e.g., Date, Product, Employee). Crucial for cross-department reporting.',
      ],
      tips: [
        'In FAANG interviews, if asked how to model analytics data, default immediately to a Star Schema unless explicitly constrained by storage or extreme update concurrency.',
      ],
    },
  },
  'data-warehousing-1': {
    tutorial: {
      explanation: [
        'The two foundational schools of thought in Data Warehousing are the Kimball Methodology (Bottom-Up) and the Inmon Methodology (Top-Down).',
        'Kimball (Bottom-Up): Focuses on delivering business value quickly. You build individual, department-specific "Data Marts" (using Star Schemas) first (e.g., a Sales mart, then an HR mart). Over time, these marts are integrated using "Conformed Dimensions" (shared tables like Date or Employee) to form the enterprise Data Warehouse intuitively. This is the dominant approach today (often implemented via dbt).',
        'Inmon (Top-Down): Focuses on an enterprise-wide single version of truth. You build a massive, normalized (3NF) Corporate Information Factory (CIF) first. All data is integrated centrally. Only then do you spin off departmental Data Marts for reporting. It is highly robust but extremely slow to deliver initial value, often leading to multi-year failed IT projects.',
      ],
      codeExamples: [
        {
          description: 'The "Enterprise Data Warehouse Bus Matrix" (Kimball Concept)',
          code: `# A crucial planning tool in the Kimball lifecycle
# Maps business processes (Facts) against entities (Dimensions)

| Business Process (Fact) | Date | Employee | Product | Store | Promotion |
|-------------------------|------|----------|---------|-------|-----------|
| Retail Sales            |   X  |    X     |    X    |   X   |     X     |
| Inventory Snapshot      |   X  |          |    X    |   X   |           |
| Store Returns           |   X  |    X     |    X    |   X   |           |

# "X" marks the "Conformed Dimensions". Because Sales and Inventory both 
# share the Date, Product, and Store dimensions, a business user can 
# easily write a query comparing Sales volume against Inventory on hand!`,
        },
      ],
      keyTakeaways: [
        'Kimball relies on dimensional modeling (Star Schemas) from the start. Data is denormalized for query performance and usability.',
        'Inmon relies on Entity-Relationship (ER) modeling (3NF) for the central warehouse. Data is normalized to eliminate redundancy and ensure integrity.',
        'The modern "Lakehouse" architecture often blends these: raw data lands in a lake (Bronze), is cleaned into a loosely normalized layer (Silver - loosely resembling Inmon), and is finally aggregated into Star Schema data marts for BI tools (Gold - strictly Kimball).',
      ],
    },
    crashCourse: {
      summary: 'Kimball (Bottom-Up) builds dimensional data marts (Star Schemas) first, integrating them via shared dimensions. It is agile and user-focused. Inmon (Top-Down) builds a giant normalized enterprise database first, then spins off data marts. It is rigid but highly integrated. Modern DE favors Kimball concepts.',
      quickFacts: [
        'Kimball: Bottom-Up. Dimensional modeling (Star Schemas). Agile delivery. Focuses on business process.',
        'Inmon: Top-Down. Normalized modeling (3NF). Monolithic delivery. Focuses on enterprise entity integration.',
        'Conformed Dimensions: The "glue" that holds a Kimball data warehouse together (shared dimensions like Date/Customer).',
        'Data Mart: A subset of a data warehouse focused on a single business line (e.g., Sales, HR).',
      ],
      tips: [
        'When designing a warehouse layout in an interview, draw the Bronze/Silver/Gold medallion architecture. Explain that Gold is your Kimball dimensional layer for business users.',
      ],
    },
  },
  'data-warehousing-2': {
    tutorial: {
      explanation: [
        'Fact tables store the quantitative metrics or measurements of a business process (e.g., dollars sold, clicks made, hours worked). They contain foreign keys that map to primary keys in Dimension tables. Fact tables are massive (billions of rows) but narrow (few columns).',
        'There are three primary types of Fact tables: Transactional (one row per event), Periodic Snapshot (one row per entity per time period, e.g., monthly checking account balance), and Accumulating Snapshot (one row per entity with multiple date columns tracking milestones, e.g., an order moving from Placed -> Shipped -> Delivered).',
        'Dimension tables store the descriptive context that surrounds a business process (the who, what, where, when, why). They contain text attributes used for filtering and grouping (e.g., Customer Name, Store Region, Product Category). Dimension tables are small (thousands of rows) but wide (many columns).',
      ],
      codeExamples: [
        {
          description: 'Fact Table Types Implementation',
          code: `-- 1. Transactional Fact (Most common. Event = Row)
CREATE TABLE fact_page_views (
    view_id BIGINT PRIMARY KEY,
    date_key INT,          -- FK to dim_date
    user_key INT,          -- FK to dim_user
    page_key INT,          -- FK to dim_page
    time_spent_seconds INT -- Metric (additive)
);

-- 2. Periodic Snapshot Fact (Status at a point in time)
-- Useful for fast reporting on current state without aggregating all history
CREATE TABLE fact_inventory_daily (
    date_key INT,          -- FK to dim_date
    product_key INT,       -- FK to dim_product
    store_key INT,         -- FK to dim_store
    quantity_on_hand INT,  -- Metric (semi-additive: cannot sum across time!)
    PRIMARY KEY (date_key, product_key, store_key)
);

-- 3. Accumulating Snapshot Fact (Tracking a workflow/pipeline)
-- Updated iteratively as the entity moves through stages
CREATE TABLE fact_order_fulfillment (
    order_key INT PRIMARY KEY,
    customer_key INT,
    order_placed_date_key INT,    -- Milestone 1
    payment_cleared_date_key INT, -- Milestone 2
    order_shipped_date_key INT,   -- Milestone 3
    order_delivered_date_key INT, -- Milestone 4
    total_fulfillment_days INT    -- Derived Metric
);`,
        },
      ],
      keyTakeaways: [
        'Metrics in fact tables have additive properties: Fully Additive (can sum across all dimensions, e.g., Sales Amount), Semi-Additive (can sum across some dimensions but not time, e.g., Bank Balance), and Non-Additive (cannot sum at all, must average or recalculate, e.g., Profit Margin %).',
        'Fact tables should almost never contain descriptive text attributes (put those in dimensions).',
        'Dimension tables should have a Surrogate Key (an arbitrary auto-incrementing integer) as their Primary Key, NOT the natural operational key (e.g., SSN or UserID) to handle Slowly Changing Dimensions.',
      ],
    },
    crashCourse: {
      summary: 'Fact tables hold the numbers (metrics) and foreign keys. They are huge and narrow. Dimension tables hold the text (context). They are small and wide. Facts are the "verbs" of your business; Dimensions are the "nouns".',
      quickFacts: [
        'Transactional Fact: One row per event. Most detailed grain. Fully additive.',
        'Periodic Snapshot Fact: Captures state at a regular interval (daily/monthly). Usually semi-additive.',
        'Accumulating Snapshot Fact: Tracks a workflow with multiple date milestones. Updated multiple times.',
        'A "Factless" Fact Table: Contains no metrics, just foreign keys! Used to track events (e.g., Student attended Class) or coverage (e.g., Product was on Promotion, even if 0 sold).',
      ],
      tips: [
        'In interviews: If asked to track an insurance claim pipeline (Received -> Reviewed -> Approved -> Paid), immediately propose an Accumulating Snapshot Fact table.',
      ],
    },
  },
  'data-warehousing-3': {
    tutorial: {
      explanation: [
        'Slowly Changing Dimensions (SCD) define how we handle updates to Dimension attributes over time (e.g., a customer gets married and changes their last name, or moves to a new state). How do we report on historical sales? Do we use their old state or new state?',
        'SCD Type 1 (Overwrite): The old value is simply overwritten with the new value. History is lost. All historical fact records will now point to the new state. Simple to implement, but bad for compliance.',
        'SCD Type 2 (Add New Row): The gold standard. A new row is inserted for the new state, and the old row is marked as expired using `valid_from` and `valid_to` timestamps. A new Surrogate Key is generated. This perfectly preserves historical accuracy.',
        'SCD Type 3 (Add New Column): Rare. Add a "previous_value" column to the existing row. Preserves only the current and immediately previous state.',
      ],
      codeExamples: [
        {
          description: 'Implementing SCD Type 2 tracking',
          code: `-- How an SCD Type 2 dimension appears in the database
-- Notice the Natural Key (user_id) repeats, but Surrogate Key (customer_key) is unique

SELECT customer_key, user_id, name, state, valid_from, valid_to, is_current 
FROM dim_customer WHERE user_id = 'U123';

/* Returns:
| customer_key | user_id | name     | state | valid_from | valid_to   | is_current |
|--------------|---------|----------|-------|------------|------------|------------|
| 1045         | U123    | John Doe | NY    | 2020-01-01 | 2023-05-15 | FALSE      |
| 8922         | U123    | John Doe | CA    | 2023-05-15 | 9999-12-31 | TRUE       |
*/

-- Joining a Fact table to an SCD Type 2 Dimension
-- Ensure you join on the FACT DATE falling BETWEEN the dimension validity dates!
SELECT 
    f.sales_amount,
    c.state as state_at_time_of_purchase
FROM fact_sales f
JOIN dim_customer c 
  ON f.user_id = c.user_id 
  AND f.order_date BETWEEN c.valid_from AND c.valid_to;
  
-- Note: In a true Kimball architecture, the ETL process resolves the SK, 
-- so the Fact table just stores the SK (1045 or 8922) directly:
SELECT f.sales_amount, c.state
FROM fact_sales f
JOIN dim_customer c ON f.customer_key = c.customer_key;`,
        },
      ],
      keyTakeaways: [
        'SCD Type 2 requires Surrogate Keys. You cannot use the operational/natural key as the Primary Key because there will be multiple rows for the same natural key over time.',
        'Implementing SCD Type 2 manually in SQL requires complex MERGE/UPSERT logic. Modern stacks use `dbt snapshot` which automates SCD Type 2 entirely.',
        'SCD Type 6 (1+2+3): A hybrid approach that stores the current value, historical value, and validity flags all in one row. Very complex to maintain.',
      ],
    },
    crashCourse: {
      summary: 'SCD methodologies handle changing dimension data. Type 1 overwrites data (history lost). Type 2 creates a new row with valid_from/valid_to dates (history preserved via Surrogate Keys). Type 2 is standard for modern data warehousing.',
      quickFacts: [
        'Type 0: Retain original (Never update).',
        'Type 1: Overwrite (Update in place, history destroyed).',
        'Type 2: Add new row (Track history via valid_from, valid_to, is_active flags). Requires Surrogate Keys.',
        'Type 3: Add new column (Track current and previous value only).',
        'Type 4: History Table (Rapidly changing dimensions placed in a separate mini-dimension).',
      ],
      tips: [
        'When asked "How would you handle a user changing their address?" immediately explain SCD Type 2 and sketch out the `valid_to` and `valid_from` columns.',
      ],
    },
  },
  'data-warehousing-4': {
    tutorial: {
      explanation: [
        'Data Vault 2.0 is highly specialized data modeling methodology designed strictly for the Enterprise Data Warehouse layer. Unlike Star Schemas (designed for BI/reporting) or 3NF (designed for OLTP applications), Data Vault is designed for absolute scalability, auditability, and massive parallel ingestion.',
        'It solves the problem of integrating dozens of distinct source systems into one warehouse without breaking existing models when a new source is added.',
        'It consists of three table types: Hubs (the core business keys, e.g., a hashed Customer ID), Links (the relationships/transactions between Hubs, e.g., Customer bought Product), and Satellites (the descriptive context/attributes attached to Hubs or Links, e.g., Customer Name, Product Price).',
      ],
      codeExamples: [
        {
          description: 'Data Vault Architectures (Hubs, Links, Satellites)',
          code: `-- 1. HUB: Stores only the unique business key and a hash
-- Hash keys allow parallel loading from multiple sources without locking
CREATE TABLE hub_customer (
    hk_customer VARCHAR(32) PRIMARY KEY, -- MD5 Hash of Natural Key
    bk_customer_id VARCHAR(50),          -- Business Key (Natural Key)
    load_timestamp TIMESTAMP,
    record_source VARCHAR(50)
);

-- 2. LINK: Stores relationships between Hubs (Many-to-Many resolution)
CREATE TABLE lnk_customer_order (
    hk_customer_order VARCHAR(32) PRIMARY KEY, -- Hash of both BKs
    hk_customer VARCHAR(32),                   -- FK to Hub
    hk_order VARCHAR(32),                      -- FK to Hub
    load_timestamp TIMESTAMP,
    record_source VARCHAR(50)
);

-- 3. SATELLITE: Stores ALL descriptive attributes and history (SCD Type 2)
-- Hubs and Links NEVER contain descriptive data, only Satellites do!
CREATE TABLE sat_customer_details (
    hk_customer VARCHAR(32),                   -- FK to Hub
    load_timestamp TIMESTAMP,                  -- Part of PK (for history)
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    hash_diff VARCHAR(32),                     -- Hash of all attributes to detect changes
    PRIMARY KEY (hk_customer, load_timestamp)
);`,
        },
      ],
      keyTakeaways: [
        'Data Vault heavily utilizes Hashing (e.g., MD5/SHA) to generate Primary Keys instead of auto-incrementing integers. This allows massively parallel, distributed ELT loading because sequences don\'t need to be coordinated across nodes.',
        'Data Vault is strictly insert-only. Updates are never performed. Changes are simply inserted as new records into Satellite tables (SCD Type 2 by default).',
        'Business users should NEVER query a Data Vault directly; it requires too many convoluted joins. Data Vaults exist in the Silver layer. You must build Star Schema views (Information Marts) on top of the Vault for users.',
      ],
    },
    crashCourse: {
      summary: 'Data Vault 2.0 is an enterprise integration modeling technique. It splits data into Hubs (business keys), Links (relationships), and Satellites (descriptive attributes). It is highly agile, insert-only, and extremely scalable for multi-source environments.',
      quickFacts: [
        'Hubs: Core business entities (No descriptive data).',
        'Links: Relationships between Hubs (No descriptive data).',
        'Satellites: Descriptive attributes and history for Hubs or Links.',
        'Hash Keys: Used instead of sequence IDs to enable parallel, uncoordinated loading.',
        'Insert-Only Architecture: Highly optimized for modern cloud data warehouses.',
      ],
      tips: [
        'Don\'t use Data Vault for a startup or a warehouse with 2-3 data sources. The engineering overhead is massive. It is meant for Fortune 500 companies migrating 50+ legacy systems into Snowflake.',
      ],
    },
  },
  'data-warehousing-5': {
    tutorial: {
      explanation: [
        'OLTP (Online Transaction Processing) systems are operational databases (Postgres, MySQL, Oracle) designed to process thousands of small, concurrent insert/update/delete transactions per second. They ensure absolute ACID compliance, support the day-to-day operations of an application, and are highly normalized (3NF) to avoid data anomalies.',
        'OLAP (Online Analytical Processing) systems are Data Warehouses (BigQuery, Snowflake, Redshift) designed to analyze massive datasets. They process a smaller number of massive, complex read queries spanning millions of rows. They are heavily denormalized (Star Schemas) and optimized for aggregation.',
        'The ETL/ELT pipeline is the bridge that extracts data from the OLTP application databases, transforms it, and loads it into the OLAP analytical data warehouse.',
      ],
      codeExamples: [
        {
          description: 'OLTP vs OLAP Design Paradigms',
          code: `-- === OLTP (Highly Normalized, Row-Store) ===
-- Designed to make updating a single record extremely fast and safe.
-- Example: A user updates their address.
BEGIN TRANSACTION;
UPDATE addresses SET zip = '90210' WHERE address_id = 455;
COMMIT;
-- Fast because the Database looks up the B-Tree index, finds the exact row,
-- locks it, updates it, and commits.


-- === OLAP (Denormalized, Column-Store) ===
-- Designed to aggregate massive amounts of data fast.
-- Example: Calculate average revenue per zip code over 5 years.
SELECT zip, AVG(revenue) 
FROM fact_aggregate_sales 
WHERE year BETWEEN 2018 AND 2023 
GROUP BY zip;
-- Fast because the Column-Store database only reads the 'zip', 'revenue', 
-- and 'year' columns from disk, ignoring the 100 other columns in the table.`,
        },
      ],
      keyTakeaways: [
        'Never run heavy analytical queries against an OLTP production database. A massive `GROUP BY` query can lock tables, consume all CPU/RAM, and bring down the live application facing customers.',
        'HTAP (Hybrid Transactional/Analytical Processing) is an emerging paradigm (e.g., Google AlloyDB, SingleStore) attempting to do both OLTP and OLAP in a single system, traditionally via in-memory computing.',
      ],
    },
    crashCourse: {
      summary: 'OLTP is for running the business (fast, small read/writes, normalized schemas). OLAP is for analyzing the business (slow, huge read aggregates, denormalized schemas). The Data Engineer builds the pipelines between them.',
      quickFacts: [
        'OLTP (Online Transaction Processing): Postgres, MySQL. 3rd Normal Form. Row-based storage. High concurrency, short transactions.',
        'OLAP (Online Analytical Processing): Snowflake, BigQuery. Star Schema/Denormalized. Column-based storage. Low concurrency, long complex queries.',
        'ETL/ELT: The process of moving data from OLTP to OLAP systems.',
      ],
      tips: [
        'Understand the storage differences: OLTP uses row-oriented storage (all data for an employee is stored contiguously on disk). OLAP uses columnar storage (all salaries for all employees are stored contiguously on disk).',
      ],
    },
  },
  'data-warehousing-6': {
    tutorial: {
      explanation: [
        'Database storage fundamentally dictates query performance. In a Row-Oriented database (Postgres, MySQL), data is stored on disk row-by-row. If you read a row, you must physically read every column of that row from disk into memory, even if you only need one column.',
        'In a Column-Oriented database (Redshift, BigQuery, Snowflake) and file format (Parquet, ORC), data is stored column-by-column. All first names are stored together; all ages are stored together.',
        'Column-stores are vastly superior for Analytics (OLAP) because 1) Analytics queries usually aggregate a few columns across millions of rows and can skip reading the unused columns entirely (Column Pruning), and 2) Storing identical data types contiguously allows for massive compression (e.g., Run-Length Encoding or Dictionary Encoding).',
      ],
      codeExamples: [
        {
          description: 'How data is laid out on a physical hard drive',
          code: `/* Given Table:
ID | Name | Age | Department
1  | Alex | 30  | Sales
2  | Bill | 45  | Eng
3  | Carl | 28  | Sales */

/* --- ROW STORE (OLTP) --- */
-- Disk Block 1: [1, Alex, 30, Sales, 2, Bill, 45, Eng, 3, Carl, 28, Sales]
-- Query: SELECT SUM(Age) FROM Table;
-- Engine behavior: Must read the ENTIRE disk block into memory just to find the ages. Massive I/O waste.
-- Great for: SELECT * FROM Table WHERE ID = 2; (Reads exactly one continuous chunk)

/* --- COLUMN STORE (OLAP) --- */
-- Disk Block 1 (ID):         [1, 2, 3]
-- Disk Block 2 (Name):       [Alex, Bill, Carl]
-- Disk Block 3 (Age):        [30, 45, 28] 
-- Disk Block 4 (Department): [Sales, Eng, Sales]
-- Query: SELECT SUM(Age) FROM Table;
-- Engine behavior: Only reads Disk Block 3! Skips Blocks 1, 2, 4 entirely. 75% reduction in I/O!
-- Great for: Analytics. 
-- Terrible for: INSERT INTO Table VALUES (4, Dan, 35, HR); (Requires writing to 4 separate disk locations!)`,
        },
      ],
      keyTakeaways: [
        'The #1 bottleneck in databases is Disk I/O (reading from hard drives). Column stores minimize I/O by only reading the necessary columns. This is fundamentally why BigQuery is faster than Postgres for analytics.',
        'Compression works incredibly well in column stores. If a column is "Status" and the values are [Active, Active, Active, Inactive, Active], Run-Length Encoding compresses it to [Active:3, Inactive:1, Active:1], saving massive disk space and RAM.',
        'Vectorized processing allows modern CPUs to process these compressed, continuous columnar data arrays using SIMD (Single Instruction, Multiple Data) execution, yielding blazing fast aggregations.',
      ],
    },
    crashCourse: {
      summary: 'Row-stores (Postgres) save data row-by-row, optimizing for fast inserts and "SELECT *". Column-stores (Snowflake/Parquet) save data column-by-column, optimizing for heavy aggregations by drastically reducing Disk I/O and enabling extreme compression.',
      quickFacts: [
        'Row-Store: Optimizes for writes (OLTP). Reads whole rows into memory.',
        'Column-Store: Optimizes for reads/aggregations (OLAP). Skips unqueried columns (Column Pruning).',
        'Compression benefits: Column stores compress extremely well because contiguous data is of the same type.',
        'Parquet & ORC: The de-facto columnar file formats used in data lakes/Spark.',
      ],
      tips: [
        'Never use `SELECT *` in a column-store database (like BigQuery or Snowflake). It forces the engine to scan every single column block from disk, destroying the primary performance benefit of the columnar architecture and costing you a lot of money in serverless environments.',
      ],
    },
  },
};
