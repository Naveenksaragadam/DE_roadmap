# Data Modeling Masterclass: FAANG-Level Senior Data Engineer Guide

## Table of Contents
1. Star Schema vs Snowflake Schema
2. Advanced Schema Patterns
3. Double Fact Tables Explained
4. FAANG-Level Interview Questions
5. Practical Case Studies
6. Performance Optimization Strategies

---

## 1. Star Schema vs Snowflake Schema

### Star Schema

**Definition:** A denormalized schema where fact tables are surrounded by dimension tables in a star-like pattern. Dimension tables are not normalized.

**When to Prefer Star Schema:**

- **Query Performance Priority:** Fewer joins mean faster query execution
- **BI Tool Compatibility:** Most BI tools optimize for star schemas
- **Simple Business Logic:** Straightforward relationships without complex hierarchies
- **Read-Heavy Workloads:** OLAP systems where query speed matters more than storage
- **Data Warehouse Environments:** Redshift, BigQuery, Snowflake (ironically) all favor star schemas
- **User Accessibility:** Business analysts need to write their own queries
- **Predictable Query Patterns:** Known reporting requirements

**Advantages:**
- Simpler queries with fewer joins (typically 1 join per dimension)
- Better query performance due to reduced join complexity
- Easier for end users to understand and navigate
- Better indexing strategies possible
- Optimal for aggregate queries and rollups

**Disadvantages:**
- Data redundancy in dimension tables
- Higher storage costs
- Update anomalies if not managed properly
- ETL complexity to maintain denormalized state

**Real-World Example (E-commerce):**
```
FACT_SALES
├─ DIM_CUSTOMER (customer_id, name, email, city, state, country, segment)
├─ DIM_PRODUCT (product_id, name, category, subcategory, brand, supplier)
├─ DIM_DATE (date_id, date, day, month, quarter, year, is_holiday)
└─ DIM_STORE (store_id, name, city, state, region, manager)
```

---

### Snowflake Schema

**Definition:** A normalized schema where dimension tables are broken into sub-dimensions, creating a snowflake-like pattern with multiple levels of relationships.

**When to Prefer Snowflake Schema:**

- **Storage Optimization Critical:** Normalized tables reduce redundancy
- **Complex Hierarchies:** Multi-level dimensional hierarchies (product → category → department → division)
- **Frequent Dimension Updates:** Easier to update normalized dimensions
- **Data Integrity Priority:** Normalization reduces update anomalies
- **Diverse Query Patterns:** When queries need different levels of granularity
- **Compliance Requirements:** Need to track dimension history separately
- **Limited Storage Budget:** Cloud costs or on-premise storage constraints

**Advantages:**
- Reduced data redundancy
- Lower storage requirements
- Easier to maintain referential integrity
- Better suited for slowly changing dimensions (SCD) Type 2
- Cleaner separation of concerns

**Disadvantages:**
- More complex queries with additional joins
- Slower query performance
- Harder for business users to understand
- More complex ETL processes
- Potential for join performance issues

**Real-World Example (E-commerce Normalized):**
```
FACT_SALES
├─ DIM_CUSTOMER → DIM_CITY → DIM_STATE → DIM_COUNTRY
├─ DIM_PRODUCT → DIM_SUBCATEGORY → DIM_CATEGORY → DIM_DEPARTMENT
├─ DIM_DATE → DIM_MONTH → DIM_QUARTER → DIM_YEAR
└─ DIM_STORE → DIM_REGION
```

---

### Decision Matrix: Star vs Snowflake

| Criterion | Star Schema | Snowflake Schema |
|-----------|-------------|------------------|
| Query Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Storage Efficiency | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| ETL Complexity | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| User Friendliness | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Maintenance | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Data Integrity | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 2. Advanced Schema Patterns

### Hybrid Schema (Galaxy Schema)

Combines multiple fact tables sharing common dimensions. Used in large enterprises.

```
DIM_DATE ←─┬─→ FACT_SALES
           ├─→ FACT_INVENTORY
           └─→ FACT_RETURNS

DIM_PRODUCT ←─┬─→ FACT_SALES
              ├─→ FACT_INVENTORY
              └─→ FACT_RETURNS
```

**When to Use:**
- Multiple business processes sharing dimensions
- Enterprise data warehouses
- Complex analytical requirements across domains

### Constellation Schema (Fact Constellation)

Multiple fact tables with overlapping dimensions but different measures.

**Real Example (Retail Analytics):**
- FACT_SALES (revenue, units_sold, discount)
- FACT_INVENTORY (stock_level, reorder_point)
- FACT_CUSTOMER_ACTIVITY (page_views, cart_adds)
- All share: DIM_DATE, DIM_PRODUCT, DIM_CUSTOMER

---

## 3. Double Fact Tables (Factless Fact Tables & Multi-Fact Schemas)

### What Are Double Fact Tables?

This term can refer to two different patterns:

#### Pattern 1: Factless Fact Tables

**Definition:** Fact tables that record events but contain no measurable numeric facts, only foreign keys to dimensions.

**Use Cases:**

1. **Event Tracking:**
```sql
FACT_STUDENT_ATTENDANCE
- student_id (FK)
- course_id (FK)
- date_id (FK)
- classroom_id (FK)
-- No measures, just recording the event occurred
```

2. **Eligibility/Coverage:**
```sql
FACT_INSURANCE_COVERAGE
- policy_id (FK)
- customer_id (FK)
- date_id (FK)
- coverage_type_id (FK)
-- Tracks what's covered, not amounts
```

3. **Promotion Coverage:**
```sql
FACT_PROMOTION_COVERAGE
- promotion_id (FK)
- product_id (FK)
- store_id (FK)
- date_id (FK)
-- Records which products were on promotion
```

**Why Use Factless Facts:**
- Track events without measurable metrics
- Enable "didn't happen" queries (students who didn't attend)
- Record relationships and eligibility
- Foundation for later aggregation

**Interview Trick:** "How would you find students who were eligible for a class but didn't attend?"
- Need both factless fact (eligibility) and regular fact (attendance)
- Query: Eligible students NOT IN attended students for that date

---

#### Pattern 2: Multiple Fact Tables with Shared Dimensions

**Definition:** When you have two or more fact tables at different grain levels or measuring different processes.

**Common Scenarios:**

1. **Transaction vs Aggregate Facts:**
```
FACT_DAILY_SALES (grain: day, store, product)
- date_id, store_id, product_id
- daily_revenue, daily_units

FACT_MONTHLY_SALES (grain: month, store, product)
- month_id, store_id, product_id
- monthly_revenue, monthly_units, avg_daily_revenue
```

2. **Different Business Processes:**
```
FACT_ORDER_HEADER (grain: order)
- order_id, customer_id, date_id
- order_total, shipping_cost

FACT_ORDER_LINE (grain: order line item)
- order_id, product_id, date_id
- quantity, line_amount, discount
```

**When to Use Multiple Fact Tables:**
- Different granularity requirements
- Different business processes
- Performance optimization (pre-aggregated facts)
- Different update frequencies

**Critical Design Principle:** Maintain conformed dimensions across fact tables so you can drill across facts.

---

### Conformed Dimensions vs Non-Conformed

**Conformed Dimensions:** Shared dimensions with identical structure across fact tables.

**Benefits:**
- Enable cross-fact analysis
- Consistent business definitions
- Reusable ETL processes

**Example Problem (FAANG Interview):**
"You have FACT_WEB_SESSIONS and FACT_APP_SESSIONS. The web team stores location as IP-derived city, the app team uses GPS coordinates. How do you create conformed DIM_LOCATION?"

**Solution:**
- Create standard DIM_LOCATION with hierarchies (lat/long, city, state, country)
- Map both IP-derived and GPS to standard location hierarchy
- Handle discrepancies in ETL with geocoding service
- Document and version mapping logic

---

## 4. FAANG-Level Interview Questions

### Category A: Schema Design Fundamentals

**Q1: Design a data model for YouTube's video analytics**

**Expected Answer Components:**
- Fact tables: FACT_VIDEO_VIEWS (grain: individual view event)
  - Measures: watch_duration_seconds, video_length_seconds, completion_rate, ad_revenue
  - Degenerate dimensions: session_id, video_position_at_start
- Dimensions: DIM_VIDEO, DIM_USER, DIM_DATE_TIME (minute grain), DIM_DEVICE, DIM_GEOGRAPHY, DIM_REFERRAL_SOURCE
- Justification for star vs snowflake
- Slowly Changing Dimension handling (video metadata changes)
- Partitioning strategy (by date)
- Late-arriving fact handling

**Advanced Follow-up:** "How would you handle counting unique viewers across time periods without double-counting?"
- Introduce DIM_USER_DAILY_SNAPSHOT for active users
- Use HyperLogLog for approximate distinct counts at scale
- Separate fact table for unique viewer counts (pre-aggregated)

---

**Q2: Design a schema for Uber's ride-hailing platform**

**Key Complexity Points:**
- Multiple fact tables needed:
  - FACT_RIDE_REQUEST (includes cancelled/declined rides)
  - FACT_COMPLETED_RIDE
  - FACT_DRIVER_AVAILABILITY (factless or time-series)
  - FACT_PRICING_SURGE (snapshot fact)
  
- Shared dimensions: DIM_DRIVER, DIM_RIDER, DIM_LOCATION (pickup/dropoff with hierarchy), DIM_DATE_TIME, DIM_VEHICLE

- **Tricky aspects:**
  - Role-playing dimensions (pickup_location_id, dropoff_location_id both FK to DIM_LOCATION)
  - Handling dynamic pricing as fact or dimension
  - Real-time vs batch processing considerations
  - Geospatial indexing for location queries

**Expected Discussion:**
- Lambda architecture (real-time + batch)
- Grain definition: individual ride request vs completed ride
- How to track driver state changes (factless fact or SCD Type 2)

---

**Q3: Amazon's product catalog with reviews and recommendations**

**Multi-Layered Challenge:**

1. **Product Hierarchy Handling:**
   - Star: Denormalized DIM_PRODUCT with all category levels
   - Snowflake: DIM_PRODUCT → DIM_SUBCATEGORY → DIM_CATEGORY → DIM_DEPARTMENT
   - Trade-off: Category navigation queries vs storage

2. **Multiple Fact Tables:**
   - FACT_PRODUCT_REVIEW (grain: individual review)
   - FACT_PRODUCT_SALES (grain: order line item)
   - FACT_PRODUCT_PAGE_VIEW (grain: page view event)
   - FACT_PRODUCT_RECOMMENDATION (factless: which products recommended together)

3. **Slowly Changing Dimensions:**
   - Product attributes change (price, availability, category)
   - Type 2 SCD for price history
   - Type 1 SCD for minor attribute corrections

**Advanced Question:** "How do you model 'people who bought X also bought Y' recommendations?"
- Bridge table pattern: BRIDGE_PRODUCT_RECOMMENDATION
- Or factless fact: FACT_RECOMMENDATION_COVERAGE linking products
- Include confidence score as degenerate dimension or mini-dimension

---

### Category B: Advanced Patterns & Performance

**Q4: Slowly Changing Dimensions - Deep Dive**

**Scenario:** "Design dimension tables for Netflix's content catalog where movie ratings, genres, and availability change over time."

**Expected Coverage:**

**Type 0 (Retain Original):** Original release date never changes
**Type 1 (Overwrite):** Typos in movie title just overwrite
**Type 2 (Add Row):** Rating changes from PG to PG-13, need history
```sql
DIM_CONTENT
- content_key (surrogate key)
- content_id (natural key)
- title
- rating
- effective_date
- expiration_date
- is_current_flag
```

**Type 3 (Add Column):** Track previous value only
```sql
current_rating, previous_rating
```

**Type 4 (Mini-Dimension):** Rapidly changing attributes split out
```sql
DIM_CONTENT (slowly changing: title, genre)
DIM_CONTENT_VOLATILE (rapidly changing: popularity_score, trending_rank)
```

**Type 6 (Hybrid 1+2+3):** Current values in all records plus history

**Interview Trick:** "What if a movie's genre changes from 'Drama' to 'Drama, Thriller'? How do you query for all Drama movies across time?"
- Need bridge table for multi-valued attributes
- Or array/JSON column with indexing strategy

---

**Q5: Fact Table Grain Mistakes**

**Scenario:** "Your team built FACT_SALES with grain: date, product, store. But some products sold in bundles. How do you fix the model?"

**This Tests:**
- Understanding that bundles violate grain (one transaction, multiple products)
- Options:
  1. Change grain to order_line_item (add degenerate dimension: order_id)
  2. Create FACT_BUNDLE_SALES separately
  3. Use bridge table: BRIDGE_ORDER_PRODUCTS

**Correct Answer:** Add order_id as degenerate dimension, change grain to order line item level. Bundles become multiple rows with same order_id.

**Follow-up:** "How do you prevent double-counting revenue in reports?"
- Use DISTINCT order_id for order-level metrics
- Keep line_amount for product-level analysis
- Create order_header fact for order-level metrics

---

**Q6: Handling Real-Time and Historical Data**

**Scenario:** "Design a model for Spotify's listening history that supports both real-time dashboards and historical trend analysis."

**Expected Solution:**

**Lambda Architecture Approach:**
1. **Speed Layer (Real-time):**
   - FACT_LISTENING_STREAM (append-only, micro-batches)
   - Partitioned by timestamp
   - Minimal transformations

2. **Batch Layer (Historical):**
   - FACT_LISTENING_DAILY_AGG (pre-aggregated)
   - Full transformations and data quality checks

3. **Serving Layer:**
   - Materialized views combining speed + batch
   - Query routing based on time range

**Key Design Decisions:**
- Grain: Individual song play event vs. aggregated by hour/day
- Late-arriving data handling (event_time vs processing_time)
- Deduplication strategy for exactly-once processing
- Partitioning and clustering strategy

**Advanced Follow-up:** "User listens to same song 10 times in a row. Do you store 10 rows or 1 row with count=10?"
- Answer depends on requirements:
  - If need replay analysis: 10 rows with sequence number
  - If only aggregate metrics: 1 row with count and timestamps array
  - Hybrid: Session-based aggregation with detail table for deep dives

---

### Category C: Tricky Design Scenarios

**Q7: Role-Playing Dimensions**

**Scenario:** "In a flight booking system, you have origin airport and destination airport. Both are airports. How do you model this?"

**Wrong Answer:** Two separate dimension tables (DIM_ORIGIN_AIRPORT, DIM_DESTINATION_AIRPORT)

**Correct Answer:** 
```sql
FACT_FLIGHT_BOOKING
- booking_id
- origin_airport_key (FK to DIM_AIRPORT)
- destination_airport_key (FK to DIM_AIRPORT)
- departure_date_key (FK to DIM_DATE)
- arrival_date_key (FK to DIM_DATE)
- flight_duration_minutes

DIM_AIRPORT (single table, referenced multiple times)
- airport_key
- airport_code
- airport_name
- city
- country
- timezone
```

**This is role-playing dimension pattern:** Same dimension used in multiple contexts.

**Other Examples:**
- Order date, ship date, delivery date → same DIM_DATE
- Bill-to customer, ship-to customer → same DIM_CUSTOMER
- Sender, receiver in messages → same DIM_USER

**Interview Depth:** "How do you write a query for 'flights from California to New York'?"
```sql
SELECT f.*, 
       origin.state as origin_state,
       dest.state as dest_state
FROM FACT_FLIGHT_BOOKING f
JOIN DIM_AIRPORT origin ON f.origin_airport_key = origin.airport_key
JOIN DIM_AIRPORT dest ON f.destination_airport_key = dest.airport_key
WHERE origin.state = 'CA' AND dest.state = 'NY'
```

---

**Q8: Degenerate Dimensions**

**Scenario:** "You're modeling e-commerce orders. Where do you put order_number, invoice_number, and tracking_number?"

**Key Insight:** These are dimensional attributes (text, used for filtering/grouping) but creating separate dimension tables would be wasteful.

**Solution:** Store as degenerate dimensions (attributes in fact table with no corresponding dimension table)

```sql
FACT_ORDER
- order_date_key (FK)
- customer_key (FK)
- product_key (FK)
- order_number (degenerate dimension)
- invoice_number (degenerate dimension)
- tracking_number (degenerate dimension)
- order_amount (measure)
- quantity (measure)
```

**When to Use Degenerate Dimensions:**
- Transaction identifiers
- Unique codes/numbers
- High cardinality, low-value attributes
- No need for descriptive attributes beyond the ID itself

**Interview Trap:** "Should customer_email be a degenerate dimension?"
- NO - emails have related attributes (customer name, address, segment)
- Belongs in DIM_CUSTOMER
- Degenerate dimensions are typically just IDs with no other attributes

---

**Q9: Junk Dimensions**

**Scenario:** "Your FACT_SALES has 10 yes/no flags: is_weekend_sale, is_promotional, has_discount, is_loyalty_member, is_online_order, etc. How do you model this?"

**Bad Approach:** 10 separate dimension tables or 10 columns in fact

**Good Approach:** Junk Dimension (combining low-cardinality flags)

```sql
DIM_TRANSACTION_FLAGS
- flag_key (surrogate key)
- is_weekend_sale (Y/N)
- is_promotional (Y/N)
- has_discount (Y/N)
- is_loyalty_member (Y/N)
- is_online_order (Y/N)
-- Pre-populate all possible combinations (2^5 = 32 rows max)

FACT_SALES
- transaction_flag_key (FK to DIM_TRANSACTION_FLAGS)
- ... other dimensions and measures
```

**Benefits:**
- Reduces fact table width
- Makes flags easier to query
- Can pre-compute combinations

**Caveat:** Only works with low cardinality. With 10 binary flags, you'd have 2^10 = 1024 combinations (manageable). With 20 flags, 2^20 = 1M rows (not practical).

**Interview Follow-up:** "What if you add an 11th flag later?"
- Need to rebuild junk dimension with new combinations
- Or create second junk dimension (DIM_TRANSACTION_FLAGS_2)
- This is why careful planning needed upfront

---

**Q10: Bridge Tables for Many-to-Many**

**Scenario:** "A Netflix movie can have multiple genres, and a genre applies to multiple movies. How do you model this in dimensional modeling?"

**Solution: Bridge Table Pattern**

```sql
DIM_MOVIE
- movie_key
- movie_id
- title
- release_date

DIM_GENRE
- genre_key
- genre_id
- genre_name

BRIDGE_MOVIE_GENRE
- movie_key (FK)
- genre_key (FK)
- genre_weight (e.g., primary genre = 1.0, secondary = 0.5)

FACT_MOVIE_VIEW
- movie_key (FK to DIM_MOVIE)
- user_key
- date_key
- view_count
```

**Query Example:** "Total views for Drama genre movies"
```sql
SELECT g.genre_name, SUM(f.view_count * b.genre_weight) as weighted_views
FROM FACT_MOVIE_VIEW f
JOIN BRIDGE_MOVIE_GENRE b ON f.movie_key = b.movie_key
JOIN DIM_GENRE g ON b.genre_key = g.genre_key
WHERE g.genre_name = 'Drama'
GROUP BY g.genre_name
```

**Critical Point:** genre_weight prevents double-counting when movie has multiple genres.

**Other Use Cases:**
- Product tags/attributes
- Employee skills
- Customer segments
- Account hierarchies (one account, multiple groups)

---

### Category D: Performance & Scale

**Q11: Partitioning Strategy**

**Scenario:** "You have 5 years of daily sales data (500M rows). Design the partitioning and indexing strategy for optimal query performance."

**Expected Answer:**

**Partitioning:**
```sql
-- Partition by date (monthly or daily based on data volume)
PARTITION BY RANGE (sale_date)
(
  PARTITION p202301 VALUES LESS THAN ('2023-02-01'),
  PARTITION p202302 VALUES LESS THAN ('2023-03-01'),
  ...
)

-- Or hash partition on high-cardinality column if date not selective
PARTITION BY HASH (customer_id) PARTITIONS 16;

-- Or composite: partition by date, sub-partition by region
```

**Clustering Keys (Snowflake/BigQuery):**
```sql
CLUSTER BY (sale_date, store_id, product_id)
-- Aligned with common query patterns
```

**Indexing:**
```sql
-- Dimension tables: unique index on natural key
CREATE UNIQUE INDEX idx_product_natural ON DIM_PRODUCT(product_id);

-- Fact tables: bitmap indexes on low-cardinality FKs (Oracle)
CREATE BITMAP INDEX idx_fact_product ON FACT_SALES(product_key);

-- Covering indexes for common queries
CREATE INDEX idx_sales_performance 
ON FACT_SALES(sale_date, store_key, product_key, sales_amount);
```

**Trade-offs Discussion:**
- Partition pruning vs partition management overhead
- Monthly vs daily partitions (daily = more partitions but better pruning)
- Index maintenance cost on inserts
- Storage overhead of indexes vs query performance gain

---

**Q12: Aggregation Tables (OLAP Cubes)**

**Scenario:** "Analysts run the same 'monthly sales by region and category' query 1000 times daily. It takes 30 seconds each time. How do you optimize?"

**Solution: Pre-Aggregated Fact Tables**

```sql
-- Base fact (grain: transaction)
FACT_SALES_DETAIL
- date_key, store_key, product_key
- sales_amount, quantity, cost

-- Monthly aggregate (grain: month, region, category)
FACT_SALES_MONTHLY_AGG
- month_key, region_key, category_key
- total_sales_amount, total_quantity, total_cost
- transaction_count, avg_sales_amount

-- Quarterly aggregate (grain: quarter, region, category)
FACT_SALES_QUARTERLY_AGG
- quarter_key, region_key, category_key
- total_sales_amount, ...
```

**Materialized View Alternative:**
```sql
CREATE MATERIALIZED VIEW mv_monthly_sales AS
SELECT 
  DATE_TRUNC('month', sale_date) as month,
  r.region_name,
  c.category_name,
  SUM(sales_amount) as total_sales
FROM FACT_SALES_DETAIL f
JOIN DIM_STORE s ON f.store_key = s.store_key
JOIN DIM_REGION r ON s.region_key = r.region_key
JOIN DIM_PRODUCT p ON f.product_key = p.product_key
JOIN DIM_CATEGORY c ON p.category_key = c.category_key
GROUP BY 1,2,3;

-- Refresh strategy
REFRESH MATERIALIZED VIEW mv_monthly_sales; -- Full refresh
-- Or incremental refresh in modern warehouses
```

**Design Decisions:**
- How many aggregation levels? (Too many = storage cost, too few = no benefit)
- Aggregate aware querying (query layer automatically uses right aggregation level)
- Refresh strategy: Real-time, hourly, daily?
- Handling late-arriving data in aggregates

**Interview Depth:** "How do you decide which aggregations to pre-compute?"
- Analyze query patterns (most frequent dimensions + grain)
- Calculate storage cost vs compute savings
- Use 80/20 rule: aggregate for 20% of patterns that cover 80% of queries
- Modern cloud warehouses (BigQuery, Snowflake) auto-optimize this

---

**Q13: Data Vault Modeling**

**Scenario:** "Your company needs audit trails, wants to track all source system changes, and demands high flexibility for future requirements. Star schema feels limiting. What do you suggest?"

**Answer: Data Vault 2.0**

**Core Components:**

1. **Hubs (Business Keys):**
```sql
HUB_CUSTOMER
- customer_hub_key (hash of business key)
- customer_id (business key)
- load_date
- record_source
```

2. **Links (Relationships):**
```sql
LINK_CUSTOMER_ORDER
- link_key (hash of hub keys)
- customer_hub_key (FK)
- order_hub_key (FK)
- load_date
- record_source
```

3. **Satellites (Descriptive Attributes):**
```sql
SAT_CUSTOMER_DETAILS
- customer_hub_key (FK)
- load_date (part of PK)
- customer_name
- email
- phone
- load_end_date
- record_source

SAT_CUSTOMER_PREFERENCES
- customer_hub_key (FK)
- load_date (part of PK)
- preferred_language
- marketing_opt_in
```

**When to Use Data Vault:**
- Heavily audited industries (finance, healthcare)
- Multiple source systems with overlapping data
- Need full history of all changes
- Agile development with changing requirements
- Compliance requirements (GDPR, SOX)

**Trade-offs:**
- Much more complex than star schema
- Requires presentation layer (transform to star for BI)
- Higher storage costs
- Steep learning curve

**Interview Question:** "How is Data Vault different from just doing SCD Type 2 on all dimensions?"
- Data Vault separates relationship tracking (Links) from attribute tracking (Satellites)
- Multiple Satellites per Hub enable tracking different rates of change
- Auditability built into model (load_date, record_source everywhere)
- Can track many-to-many relationships natively with Links

---

### Category E: Real-World Complexity

**Q14: Handling PII and GDPR Compliance**

**Scenario:** "Design a dimensional model for user analytics that allows deleting all PII for a specific user to comply with GDPR right-to-erasure."

**Challenges:**
- Fact tables reference dimension keys (can't just delete dimension row)
- Need to preserve analytics while removing PII
- Must be able to prove deletion

**Solution Approaches:**

**Approach 1: Surrogate Keys with Tombstoning**
```sql
DIM_CUSTOMER
- customer_key (surrogate, never reused)
- customer_id (business key, can be nulled)
- name (can be masked)
- email (can be masked)
- is_deleted (flag)
- deleted_date

-- On deletion request:
UPDATE DIM_CUSTOMER 
SET customer_id = NULL,
    name = 'DELETED USER',
    email = 'deleted@example.com',
    is_deleted = TRUE,
    deleted_date = CURRENT_DATE
WHERE customer_id = '12345';

-- Fact tables still reference customer_key, analytics preserved
-- But PII is gone
```

**Approach 2: Separate PII Tables**
```sql
DIM_CUSTOMER_ANONYMOUS
- customer_key
- customer_segment
- region
- join_date_key
- is_deleted

DIM_CUSTOMER_PII (separate, encrypted)
- customer_key
- name (encrypted)
- email (encrypted)
- phone (encrypted)

-- On deletion: drop row from PII table only
-- Analytics table remains intact
```

**Approach 3: Crypto-Shredding**
- Encrypt PII with user-specific keys
- Store keys separately
- On deletion, destroy the key (data becomes unrecoverable)

**Interview Follow-up:** "How do you handle facts that directly contain PII like IP addresses?"
- Never store raw PII in facts
- Store hashed/anonymized versions
- Or use reference to PII dimension that can be purged
- For IP: store geolocation dimension reference, not IP itself

---

**Q15: Multi-Currency Handling**

**Scenario:** "Stripe processes payments in 135 currencies. Design a schema that allows reporting in any currency with historical accuracy."

**Challenge:** Exchange rates change daily. Can't just convert at query time using current rates.

**Solution:**

```sql
FACT_TRANSACTION
- transaction_id
- transaction_date_key
- customer_key
- transaction_amount_local (in customer's currency)
- transaction_currency_code
- transaction_amount_usd (converted at transaction time)
- exchange_rate_used
- exchange_rate_date_key

DIM_CURRENCY
- currency_key
- currency_code (USD, EUR, GBP)
- currency_name
- currency_symbol

FACT_EXCHANGE_RATE (snapshot fact)
- from_currency_key
- to_currency_key
- date_key
- exchange_rate
- rate_source (central bank, market close, etc.)
```

**Design Decisions:**

1. **Store Both Local and Normalized:**
   - Always keep original currency amount (legal/audit requirement)
   - Also store converted amount using rate at transaction time
   - Never recalculate historical conversions

2. **Multiple Conversion Targets:**
   - Store USD conversion for US-based company
   - Could also store EUR for European division
   - Or compute on-the-fly for other currencies using FACT_EXCHANGE_RATE

3. **Rate Source Tracking:**
   - Different rates for different purposes (spot rate, accounting rate)
   - Track which rate was used for auditability

**Query Example:**
```sql
-- Total sales in EUR for today (need today's rate)
SELECT 
  SUM(f.transaction_amount_usd * er.exchange_rate) as total_eur
FROM FACT_TRANSACTION f
JOIN FACT_EXCHANGE_RATE er 
  ON er.from_currency_code = 'USD' 
  AND er.to_currency_code = 'EUR'
  AND er.date_key = CURRENT_DATE_KEY
WHERE f.transaction_date_key = CURRENT_DATE_KEY;
```

---

**Q16: Temporal Data and Time Travel**

**Scenario:** "Build a pricing analytics system that can answer 'What was the price of Product X on date Y?' for any historical date."

**This requires Type 2 SCD with proper temporal tracking:**

```sql
DIM_PRODUCT_PRICE_HISTORY
- product_price_key (surrogate)
- product_id (natural key)
- product_name
- current_price
- valid_from_date
- valid_to_date (NULL if current)
- is_current_record (flag)
- version_number

-- Query: What was iPhone 13 price on 2023-05-15?
SELECT product_name, current_price
FROM DIM_PRODUCT_PRICE_HISTORY
WHERE product_id = 'IPHONE13'
  AND valid_from_date <= '2023-05-15'
  AND (valid_to_date > '2023-05-15' OR valid_to_date IS NULL);
```

**Advanced Pattern: Bi-Temporal Modeling**

When you need to track both:
- **Valid Time:** When the fact was true in reality
- **Transaction Time:** When the fact was recorded in the system

```sql
DIM_PRODUCT_BITEMPORAL
- product_key
- product_id
- product_name
- price
- valid_from_date (when price actually changed)
- valid_to_date
- transaction_from_date (when we learned about it)
- transaction_to_date
- is_current_valid
- is_current_transaction
```

**Use Case:** Late-arriving corrections
- Price changed on Jan 1st (valid time)
- We didn't learn about it until Jan 15th (transaction time)
- Need to restate reports for Jan 1-15

**Interview Question:** "How do you handle corrections to historical data without losing the original incorrect values?"
- Bi-temporal model preserves both what we thought (transaction time) and what actually happened (valid time)
- Can reconstruct "what we knew as of any date"
- Critical for financial auditing

---

**Q17: Large Dimension Problem (High Cardinality)**

**Scenario:** "DIM_CUSTOMER has 500 million rows. Queries joining to fact tables are slow. What do you do?"

**Problem:** Large dimensions don't fit in memory, cause performance issues.

**Solutions:**

**Solution 1: Dimension Partitioning**
```sql
-- Partition dimension by active status
DIM_CUSTOMER_ACTIVE (hot data, frequently accessed)
DIM_CUSTOMER_INACTIVE (cold data, archived)

-- Query optimizer uses partition pruning
SELECT * FROM FACT_SALES f
JOIN DIM_CUSTOMER_ACTIVE c ON f.customer_key = c.customer_key
WHERE f.sale_date >= CURRENT_DATE - 90;
```

**Solution 2: Mini-Dimensions**
```sql
-- Split off frequently changing attributes
DIM_CUSTOMER_STABLE (changes rarely: birth_date, registration_date)
DIM_CUSTOMER_DEMOGRAPHICS (changes occasionally: segment, status, tier)

-- Fact references both
FACT_SALES
- customer_stable_key
- customer_demographics_key
- date_key
- sales_amount
```

**Solution 3: Outrigger Dimensions**
```sql
-- Move low-cardinality attributes to separate dimension
DIM_CUSTOMER (500M rows)
- customer_key
- customer_id
- name
- email
- customer_segment_key (FK to outrigger)

DIM_CUSTOMER_SEGMENT (100 rows)
- segment_key
- segment_name
- segment_tier
- discount_rate

-- Queries filtering on segment can use small dimension
```

**Solution 4: Shrunken Dimensions**
```sql
-- Aggregated dimension for summary reports
DIM_CUSTOMER_ROLLUP (10M rows, one per ZIP code)
- customer_rollup_key
- zip_code
- city
- state
- customer_count

FACT_SALES_DAILY_AGG
- date_key
- customer_rollup_key (instead of individual customer)
- total_sales
```

**Interview Depth:** "When does the large dimension problem become critical?"
- Generally when dimension > 10% of fact table size
- Or when dimension doesn't fit in available memory
- Modern columnar databases handle this better than row-stores
- Depends on query patterns (selective filters help)

---

**Q18: Graph Relationships in Dimensional Model**

**Scenario:** "Model LinkedIn's connection network: users connected to other users, where connections have attributes like connection date and strength."

**Challenge:** Dimensional modeling isn't designed for graph relationships.

**Hybrid Approach:**

```sql
-- Traditional dimensions
DIM_USER
- user_key
- user_id
- name
- location
- industry

-- Graph relationship as factless fact
FACT_USER_CONNECTION
- user1_key (FK to DIM_USER)
- user2_key (FK to DIM_USER)
- connection_date_key
- connection_strength (degenerate dimension: weak/medium/strong)
- is_bidirectional (flag)

-- Activity facts
FACT_USER_INTERACTION
- initiating_user_key
- receiving_user_key
- interaction_date_key
- interaction_type_key
- engagement_score
```

**For Graph Queries:**
- Extract to graph database (Neo4j) for path finding, clustering
- Use dimensional model for aggregate analytics
- Keep synchronized via ETL

**Alternative:** Use bridge table for hierarchical relationships:
```sql
BRIDGE_USER_NETWORK
- user_key
- connected_user_key
- degrees_of_separation (1 = direct, 2 = friend-of-friend, etc.)
- paths_count
```

**Interview Question:** "How would you find all 2nd-degree connections for a user?"
```sql
-- Using bridge table (pre-computed)
SELECT connected_user_key
FROM BRIDGE_USER_NETWORK
WHERE user_key = 12345 AND degrees_of_separation = 2;

-- Using recursive CTE (compute on-the-fly)
WITH RECURSIVE connections AS (
  -- Direct connections
  SELECT user2_key as connected_user, 1 as degree
  FROM FACT_USER_CONNECTION
  WHERE user1_key = 12345
  
  UNION ALL
  
  -- Indirect connections
  SELECT f.user2_key, c.degree + 1
  FROM connections c
  JOIN FACT_USER_CONNECTION f ON c.connected_user = f.user1_key
  WHERE c.degree < 2
)
SELECT * FROM connections WHERE degree = 2;
```

---

## 5. Practical Case Studies

### Case Study 1: Netflix Viewing Analytics

**Business Requirements:**
- Track what users watch, when, and for how long
- Recommendations based on viewing patterns
- Content performance analysis
- A/B testing of UI features
- Subscriber churn prediction

**Dimensional Model Design:**

```sql
-- Core viewing fact
FACT_VIEWING_SESSION
- session_key (surrogate)
- session_id (degenerate dimension)
- user_key (FK to DIM_USER)
- content_key (FK to DIM_CONTENT)
- device_key (FK to DIM_DEVICE)
- start_datetime_key (FK to DIM_DATE_TIME)
- end_datetime_key
- geo_location_key (FK to DIM_GEO)
- viewing_duration_seconds (measure)
- content_duration_seconds (measure)
- completion_percentage (measure)
- average_bitrate (measure)
- buffering_events (measure)
- quality_score (measure)

-- Content dimension with SCD Type 2
DIM_CONTENT
- content_key
- content_id
- title
- content_type (movie, series, episode)
- series_key (FK for episodes)
- season_number
- episode_number
- genre_keys (array or bridge table)
- maturity_rating
- release_date
- effective_date (SCD)
- expiration_date (SCD)
- is_current

-- User dimension with mini-dimension pattern
DIM_USER_STABLE
- user_stable_key
- user_id
- registration_date
- country_of_registration

DIM_USER_SUBSCRIPTION
- user_subscription_key
- subscription_plan
- subscription_status
- subscription_tier
- payment_status
- effective_date
- is_current

-- Bridge for many-to-many genres
BRIDGE_CONTENT_GENRE
- content_key
- genre_key
- genre_rank (primary=1, secondary=2)
- weight_factor

-- Snapshot fact for active subscribers
FACT_SUBSCRIPTION_SNAPSHOT
- snapshot_date_key
- user_key
- subscription_status
- plan_type
- monthly_recurring_revenue
- tenure_days

-- A/B test assignment (factless fact)
FACT_AB_TEST_ASSIGNMENT
- user_key
- test_key
- variant_key
- assignment_date_key
```

**Key Design Decisions:**

1. **Grain Choice:** Individual viewing session (not aggregated)
   - Allows detailed analysis of viewing patterns
   - Can aggregate up as needed
   - Supports recommendation algorithms

2. **Slowly Changing Dimensions:**
   - Content metadata changes (genre reclassification, maturity rating updates)
   - User subscription changes (Type 2 SCD in mini-dimension)

3. **Junk Dimension for Flags:**
```sql
DIM_VIEWING_FLAGS
- viewing_flag_key
- is_auto_played
- is_resumed_session
- is_downloaded_content
- playback_quality (SD/HD/4K)
```

4. **Performance Optimization:**
   - Partition FACT_VIEWING_SESSION by date (daily partitions)
   - Cluster by user_key for user-level queries
   - Pre-aggregate to FACT_VIEWING_DAILY for dashboards

**Sample Analytical Queries:**

```sql
-- Content completion rate by genre
SELECT 
  g.genre_name,
  AVG(f.completion_percentage) as avg_completion,
  COUNT(DISTINCT f.session_id) as total_sessions
FROM FACT_VIEWING_SESSION f
JOIN BRIDGE_CONTENT_GENRE b ON f.content_key = b.content_key
JOIN DIM_GENRE g ON b.genre_key = g.genre_key
WHERE f.start_datetime_key >= '2024-01-01'
GROUP BY g.genre_name
ORDER BY avg_completion DESC;

-- Churn prediction features
SELECT 
  u.user_id,
  COUNT(DISTINCT f.content_key) as unique_content_watched,
  SUM(f.viewing_duration_seconds)/3600.0 as total_hours_watched,
  AVG(f.completion_percentage) as avg_completion,
  MAX(d.date) as last_viewing_date,
  CURRENT_DATE - MAX(d.date) as days_since_last_view
FROM FACT_VIEWING_SESSION f
JOIN DIM_USER_STABLE u ON f.user_key = u.user_stable_key
JOIN DIM_DATE d ON f.start_datetime_key = d.date_key
WHERE d.date >= CURRENT_DATE - 90
GROUP BY u.user_id;
```

---

### Case Study 2: Stripe Payment Processing Platform

**Business Requirements:**
- Process millions of transactions across 135 currencies
- Support multiple payment methods (card, bank transfer, wallet)
- Handle refunds, disputes, and chargebacks
- Multi-tenant (serve thousands of merchants)
- Real-time fraud detection
- Revenue recognition and accounting

**Complex Dimensional Model:**

```sql
-- Core transaction fact
FACT_PAYMENT_TRANSACTION
- transaction_key
- transaction_id (degenerate)
- merchant_key (FK to DIM_MERCHANT)
- customer_key (FK to DIM_CUSTOMER)
- payment_method_key (FK to DIM_PAYMENT_METHOD)
- transaction_datetime_key (FK to DIM_DATE_TIME)
- currency_key (FK to DIM_CURRENCY)
- transaction_type_key (FK to DIM_TRANSACTION_TYPE)
- amount_local_currency (measure)
- amount_usd (measure)
- exchange_rate (degenerate)
- processing_fee (measure)
- net_amount (measure)
- transaction_status (SCD Type 1: pending/succeeded/failed)
- failure_code
- failure_message
- risk_score (measure)
- is_disputed (flag)

-- Refund/reversal fact (separate grain)
FACT_REFUND
- refund_key
- refund_id (degenerate)
- original_transaction_key (FK to FACT_PAYMENT_TRANSACTION)
- refund_datetime_key
- refund_amount_local
- refund_amount_usd
- refund_reason_key

-- Dispute/chargeback fact
FACT_DISPUTE
- dispute_key
- dispute_id (degenerate)
- transaction_key (FK)
- dispute_date_key
- dispute_amount
- dispute_reason_key
- dispute_status_key
- resolution_date_key
- won_lost (flag)

-- Merchant hierarchy
DIM_MERCHANT
- merchant_key
- merchant_id
- merchant_name
- industry_key (FK to DIM_INDUSTRY)
- country_key
- account_created_date
- account_status
- risk_tier
- effective_date (SCD Type 2)
- is_current

-- Payment method with tokenization
DIM_PAYMENT_METHOD
- payment_method_key
- payment_method_token (hashed/encrypted)
- payment_type (card/bank/wallet)
- card_brand (Visa/MC/Amex)
- card_last_4
- card_expiry_month_year
- bank_name
- customer_key (FK)
- is_default_method
- created_date
- is_active

-- Transaction type dimension
DIM_TRANSACTION_TYPE
- transaction_type_key
- type_code (charge, refund, payout, transfer)
- type_description
- accounting_category

-- Junk dimension for transaction attributes
DIM_TRANSACTION_FLAGS
- transaction_flag_key
- is_3d_secure_verified
- is_recurring_payment
- is_international
- is_high_risk_country
- settlement_status (pending/settled/failed)
```

**Advanced Patterns Used:**

1. **Multi-Currency Handling:**
   - Store both local and USD amounts
   - Exchange rate at transaction time
   - Separate FACT_EXCHANGE_RATE for time-travel queries

2. **Multiple Fact Tables at Different Grains:**
   - FACT_PAYMENT_TRANSACTION (grain: individual payment)
   - FACT_REFUND (grain: individual refund)
   - FACT_DISPUTE (grain: individual dispute)
   - FACT_MERCHANT_DAILY_SUMMARY (grain: merchant + day)

3. **Conformed Dimensions:**
   - DIM_MERCHANT shared across all fact tables
   - DIM_CURRENCY shared across all fact tables
   - Enables cross-fact analysis

4. **PCI Compliance:**
   - Payment method details encrypted
   - Tokenization for card numbers
   - Separate PII dimension that can be purged

**Daily Aggregate for Performance:**

```sql
FACT_MERCHANT_DAILY_SUMMARY
- merchant_key
- date_key
- currency_key
- transaction_count (measure)
- total_volume_local (measure)
- total_volume_usd (measure)
- total_fees (measure)
- successful_count (measure)
- failed_count (measure)
- refund_count (measure)
- dispute_count (measure)
- average_transaction_amount (measure)
- unique_customers (measure - HyperLogLog)
```

**Sample Queries:**

```sql
-- Merchant revenue with refunds
SELECT 
  m.merchant_name,
  SUM(t.amount_usd) as gross_revenue,
  SUM(r.refund_amount_usd) as total_refunds,
  SUM(t.amount_usd) - SUM(r.refund_amount_usd) as net_revenue
FROM FACT_PAYMENT_TRANSACTION t
JOIN DIM_MERCHANT m ON t.merchant_key = m.merchant_key
LEFT JOIN FACT_REFUND r ON t.transaction_key = r.original_transaction_key
WHERE t.transaction_datetime_key >= '2024-01-01'
  AND t.transaction_status = 'succeeded'
GROUP BY m.merchant_name;

-- Fraud detection features
SELECT 
  t.transaction_id,
  t.risk_score,
  COUNT(*) OVER (
    PARTITION BY t.customer_key 
    ORDER BY t.transaction_datetime_key 
    RANGE BETWEEN INTERVAL '1 hour' PRECEDING AND CURRENT ROW
  ) as transactions_last_hour,
  SUM(t.amount_usd) OVER (
    PARTITION BY pm.card_last_4
    ORDER BY t.transaction_datetime_key
    RANGE BETWEEN INTERVAL '24 hours' PRECEDING AND CURRENT ROW
  ) as card_volume_24h
FROM FACT_PAYMENT_TRANSACTION t
JOIN DIM_PAYMENT_METHOD pm ON t.payment_method_key = pm.payment_method_key;
```

---

### Case Study 3: Amazon E-Commerce Platform

**Business Requirements:**
- Product catalog with complex hierarchies
- Inventory across multiple warehouses
- Pricing with promotions and dynamic pricing
- Customer behavior tracking (browsing, cart, purchase)
- Seller marketplace (3P sellers)
- Product reviews and ratings
- Recommendations engine

**Dimensional Model:**

```sql
-- Product catalog with snowflake pattern
DIM_PRODUCT
- product_key
- product_id (ASIN)
- product_title
- brand_key (FK to DIM_BRAND)
- subcategory_key (FK to subcategory hierarchy)
- base_price
- product_status (active/discontinued)
- release_date
- effective_date (SCD Type 2)
- expiration_date
- is_current

-- Category hierarchy (snowflake)
DIM_SUBCATEGORY → DIM_CATEGORY → DIM_DEPARTMENT

-- Seller dimension
DIM_SELLER
- seller_key
- seller_id
- seller_name
- seller_type (1P=Amazon, 3P=Marketplace)
- seller_rating
- country_key
- effective_date (SCD Type 2)

-- Dynamic pricing snapshot fact
FACT_PRICE_SNAPSHOT
- product_key
- seller_key
- date_key
- hour_of_day
- current_price (measure)
- list_price (measure)
- discount_percent (measure)
- is_promotion_active
- promotion_key
- competitor_min_price (measure)
- inventory_level (measure)

-- Customer browsing fact
FACT_PRODUCT_VIEW
- session_key (degenerate)
- customer_key
- product_key
- datetime_key
- page_type (search/category/product detail)
- view_duration_seconds
- scroll_depth_percent
- clicked_from_recommendation

-- Add to cart fact
FACT_CART_ADD
- cart_event_key
- session_key (degenerate)
- customer_key
- product_key
- seller_key
- datetime_key
- quantity
- price_at_add
- removed_from_cart (flag, updated if removed)
- purchased (flag, updated if purchased)

-- Order header fact
FACT_ORDER_HEADER
- order_key
- order_id (degenerate)
- customer_key
- order_datetime_key
- shipping_address_key
- order_total_amount
- shipping_cost
- tax_amount
- promotion_discount
- payment_method_key
- order_status_key

-- Order line fact (different grain)
FACT_ORDER_LINE
- order_line_key
- order_key (FK to FACT_ORDER_HEADER)
- product_key
- seller_key
- quantity
- unit_price
- line_total_amount
- line_discount
- fulfillment_center_key

-- Product review fact
FACT_PRODUCT_REVIEW
- review_key
- review_id (degenerate)
- product_key
- customer_key
- review_date_key
- star_rating (1-5)
- verified_purchase (flag)
- helpful_votes
- total_votes
- review_length_chars

-- Inventory snapshot fact
FACT_INVENTORY_SNAPSHOT
- product_key
- seller_key
- fulfillment_center_key
- date_key
- available_quantity
- reserved_quantity
- in_transit_quantity
- reorder_point
- days_of_supply
```

**Complex Patterns:**

1. **Funnel Analysis (Multiple Fact Tables):**
   - View → Cart Add → Purchase
   - Each stage is separate fact table
   - Link via session_key or customer_key + datetime window

```sql
-- Conversion funnel query
WITH viewed AS (
  SELECT DISTINCT customer_key, product_key, date_key
  FROM FACT_PRODUCT_VIEW
  WHERE date_key = '2024-01-15'
),
carted AS (
  SELECT DISTINCT customer_key, product_key, date_key
  FROM FACT_CART_ADD
  WHERE date_key = '2024-01-15'
),
purchased AS (
  SELECT DISTINCT ol.customer_key, ol.product_key, oh.order_datetime_key
  FROM FACT_ORDER_LINE ol
  JOIN FACT_ORDER_HEADER oh ON ol.order_key = oh.order_key
  WHERE oh.order_datetime_key = '2024-01-15'
)
SELECT 
  COUNT(DISTINCT v.customer_key) as viewed_users,
  COUNT(DISTINCT c.customer_key) as carted_users,
  COUNT(DISTINCT p.customer_key) as purchased_users,
  COUNT(DISTINCT c.customer_key)::FLOAT / COUNT(DISTINCT v.customer_key) as view_to_cart_rate,
  COUNT(DISTINCT p.customer_key)::FLOAT / COUNT(DISTINCT c.customer_key) as cart_to_purchase_rate
FROM viewed v
LEFT JOIN carted c ON v.customer_key = c.customer_key AND v.product_key = c.product_key
LEFT JOIN purchased p ON c.customer_key = p.customer_key AND c.product_key = p.product_key;
```

2. **Recommendation Coverage (Factless Fact):**

```sql
FACT_RECOMMENDATION_COVERAGE
- recommendation_algorithm_key
- source_product_key
- recommended_product_key
- date_generated_key
- confidence_score
```

3. **Price History with SCD Type 2:**
   - Use FACT_PRICE_SNAPSHOT for hourly prices
   - Or DIM_PRODUCT with SCD Type 2 for major price changes
   - Trade-off: storage vs query complexity

---

## 6. Performance Optimization Strategies

### Strategy 1: Partition Pruning

**Technique:** Design partitioning scheme aligned with query patterns

```sql
-- Partition fact table by date
CREATE TABLE FACT_SALES (
  sale_date DATE,
  customer_id INT,
  amount DECIMAL(10,2)
)
PARTITION BY RANGE (sale_date) (
  PARTITION p_2024_q1 VALUES LESS THAN ('2024-04-01'),
  PARTITION p_2024_q2 VALUES LESS THAN ('2024-07-01'),
  PARTITION p_2024_q3 VALUES LESS THAN ('2024-10-01'),
  PARTITION p_2024_q4 VALUES LESS THAN ('2025-01-01')
);

-- Query automatically prunes partitions
SELECT SUM(amount)
FROM FACT_SALES
WHERE sale_date BETWEEN '2024-01-01' AND '2024-03-31';
-- Only scans p_2024_q1 partition
```

**Best Practices:**
- Partition on most selective filter column (usually date)
- Keep partition size between 10GB-50GB for optimal performance
- Use partition exchange for loading new data
- Archive old partitions to cheaper storage

---

### Strategy 2: Columnar Storage and Compression

**Modern Cloud Warehouses (Snowflake, BigQuery, Redshift):**

```sql
-- Redshift: Define sort and distribution keys
CREATE TABLE FACT_SALES (
  sale_date DATE,
  customer_key INT,
  product_key INT,
  amount DECIMAL(10,2)
)
DISTSTYLE KEY
DISTKEY (customer_key)  -- Distribute by customer for customer analysis
SORTKEY (sale_date, customer_key);  -- Sort by common query pattern

-- BigQuery: Clustering
CREATE TABLE FACT_SALES (
  sale_date DATE,
  customer_key INT64,
  product_key INT64,
  amount NUMERIC
)
PARTITION BY sale_date
CLUSTER BY customer_key, product_key;
```

**Compression Benefits:**
- Low-cardinality dimensions compress 10-20x
- Date columns compress well with delta encoding
- Numeric measures compress with run-length encoding

---

### Strategy 3: Materialized Views and Summary Tables

```sql
-- Materialized view for common aggregation
CREATE MATERIALIZED VIEW mv_daily_sales_summary AS
SELECT 
  DATE_TRUNC('day', sale_datetime) as sale_date,
  customer_segment,
  product_category,
  SUM(sale_amount) as total_sales,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT customer_id) as unique_customers
FROM FACT_SALES f
JOIN DIM_CUSTOMER c ON f.customer_key = c.customer_key
JOIN DIM_PRODUCT p ON f.product_key = p.product_key
GROUP BY 1,2,3;

-- Refresh strategy
REFRESH MATERIALIZED VIEW mv_daily_sales_summary;  -- Full refresh
-- Or incremental refresh in Snowflake/BigQuery
```

**When to Use:**
- Repeating aggregations (same GROUP BY)
- Complex joins across many tables
- Calculation-heavy queries (running totals, complex formulas)

**Trade-offs:**
- Storage cost vs query speed
- Refresh frequency vs data freshness
- Maintenance overhead

---

### Strategy 4: Index Strategy for Dimensions

```sql
-- Unique index on natural key
CREATE UNIQUE INDEX idx_customer_natural 
ON DIM_CUSTOMER(customer_id);

-- Covering index for common queries
CREATE INDEX idx_customer_segment 
ON DIM_CUSTOMER(customer_segment)
INCLUDE (customer_name, customer_tier);

-- Bitmap index for low-cardinality columns (Oracle, PostgreSQL)
CREATE BITMAP INDEX idx_product_category 
ON DIM_PRODUCT(category_id);
```

**Best Practices:**
- Always index dimension natural keys (business keys)
- Index foreign keys in fact tables (controversial - depends on DB)
- Avoid over-indexing (slows inserts, wastes storage)
- Use filtered indexes for common subsets

---

### Strategy 5: Query Optimization Patterns

**Avoid Cartesian Products:**
```sql
-- BAD: Missing join condition
SELECT *
FROM FACT_SALES f, DIM_CUSTOMER c
WHERE f.sale_date = '2024-01-01';  -- Missing f.customer_key = c.customer_key

-- GOOD: Explicit join
SELECT *
FROM FACT_SALES f
JOIN DIM_CUSTOMER c ON f.customer_key = c.customer_key
WHERE f.sale_date = '2024-01-01';
```

**Push Down Filters:**
```sql
-- BAD: Filter after aggregation
SELECT customer_segment, total_sales
FROM (
  SELECT c.customer_segment, SUM(f.sale_amount) as total_sales
  FROM FACT_SALES f
  JOIN DIM_CUSTOMER c ON f.customer_key = c.customer_key
  GROUP BY c.customer_segment
)
WHERE total_sales > 100000;

-- GOOD: Filter before aggregation when possible
SELECT c.customer_segment, SUM(f.sale_amount) as total_sales
FROM FACT_SALES f
JOIN DIM_CUSTOMER c ON f.customer_key = c.customer_key
WHERE f.sale_date >= '2024-01-01'  -- Pushed down
GROUP BY c.customer_segment
HAVING SUM(f.sale_amount) > 100000;
```

**Use Approximate Aggregations for Large Datasets:**
```sql
-- Exact distinct count (slow on billions of rows)
SELECT COUNT(DISTINCT customer_id) FROM FACT_SALES;

-- Approximate distinct count (HyperLogLog, 2% error, 100x faster)
SELECT APPROX_COUNT_DISTINCT(customer_id) FROM FACT_SALES;
```

---

## 7. Tricky FAANG Interview Questions

### Question Set 1: Design Challenges

**Q19: "Design a schema for Google Maps that tracks user navigation sessions, including route search, turn-by-turn navigation, and location check-ins."**

**What They're Testing:**
- Understanding of geospatial data
- Event streaming vs batch processing
- High-cardinality dimensions (lat/long)
- Real-time vs historical analytics

**Key Discussion Points:**
- Grain: Individual GPS ping vs aggregated route segment
- Location dimension: Hierarchical (lat/long → geohash → city → region) or clustered
- Route as dimension vs degenerate dimension
- Handling real-time updates (speed layer + batch layer)

---

**Q20: "You have a fact table with 10 billion rows. A new requirement needs you to add a new dimension. How do you add the dimension key to the existing fact table without downtime?"**

**What They're Testing:**
- Understanding of production systems
- ETL strategies
- Performance considerations

**Answer Approach:**
1. **Shadow Column Pattern:**
   - Add new column with NULL values (no rewrite)
   - Backfill in batches during off-peak hours
   - Update ETL to populate for new rows
   - Switch reporting queries when backfill complete

2. **Partition Exchange:**
   - Create new fact table with new dimension
   - Process partitions one by one
   - Exchange old partition with new partition
   - Zero downtime with partition switching

3. **View Abstraction:**
   - Create view that LEFT JOINs new dimension
   - Gradually backfill underlying table
   - View hides incomplete data

---

**Q21: "Design a dimensional model that supports 'What-If' analysis for financial planning. Users need to model different scenarios and compare them."**

**What They're Testing:**
- Understanding of scenario modeling
- Version control in data models
- Comparative analysis patterns

**Solution:**

```sql
DIM_SCENARIO
- scenario_key
- scenario_id
- scenario_name
- scenario_type (actual/budget/forecast)
- created_by_user
- created_date
- is_active

FACT_FINANCIAL_PLAN
- scenario_key (FK - key addition!)
- account_key
- date_key
- department_key
- amount
- notes

-- Query: Compare scenarios
SELECT 
  a.account_name,
  SUM(CASE WHEN s.scenario_name = 'Actual' THEN f.amount END) as actual,
  SUM(CASE WHEN s.scenario_name = 'Budget_2024' THEN f.amount END) as budget,
  SUM(CASE WHEN s.scenario_name = 'Forecast_Aggressive' THEN f.amount END) as forecast_high
FROM FACT_FINANCIAL_PLAN f
JOIN DIM_SCENARIO s ON f.scenario_key = s.scenario_key
JOIN DIM_ACCOUNT a ON f.account_key = a.account_key
WHERE f.date_key BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY a.account_name;
```

---

### Question Set 2: Debugging & Troubleshooting

**Q22: "Analysts report that revenue totals in the data warehouse don't match the source system. How do you debug this?"**

**Systematic Approach:**

1. **Check Row Counts:**
```sql
-- Source system
SELECT COUNT(*) FROM source_orders WHERE order_date = '2024-01-15';

-- Data warehouse
SELECT COUNT(*) FROM FACT_SALES WHERE date_key = '2024-01-15';
```

2. **Check Sum Totals:**
```sql
SELECT SUM(order_amount) FROM source_orders WHERE order_date = '2024-01-15';
SELECT SUM(sale_amount) FROM FACT_SALES WHERE date_key = '2024-01-15';
```

3. **Common Issues:**
   - Duplicate rows in fact table (missing unique constraint)
   - NULL foreign keys not filtered out
   - Currency conversion errors
   - Timezone issues (order_date at midnight vs actual order_datetime)
   - Late-arriving facts not included
   - Refunds/cancellations handled differently
   - Join fanout (many-to-many joins creating duplicates)

4. **Reconciliation Query:**
```sql
-- Find mismatched orders
SELECT s.order_id, s.amount as source_amount, f.sale_amount as dw_amount
FROM source_orders s
FULL OUTER JOIN FACT_SALES f ON s.order_id = f.order_id
WHERE s.amount <> f.sale_amount OR s.order_id IS NULL OR f.order_id IS NULL;
```

---

**Q23: "Your star schema query runs in 2 seconds on 1 million rows but takes 5 minutes on 100 million rows. It doesn't scale linearly. Why?"**

**What They're Testing:**
- Understanding of query execution plans
- Database internals knowledge
- Performance troubleshooting

**Common Causes:**

1. **Statistics Out of Date:**
   - Optimizer chooses wrong join order
   - Solution: ANALYZE/UPDATE STATISTICS

2. **Memory Spilling:**
   - Hash joins exceed available memory
   - Spilling to disk causes 100x slowdown
   - Solution: Increase work_mem, or redesign to filter earlier

3. **Wrong Join Strategy:**
   - Using nested loop instead of hash join
   - Solution: Force hash join with query hints

4. **Partition Pruning Not Working:**
   - Full table scan instead of partition scan
   - Solution: Ensure filter on partition key in WHERE clause

5. **Lock Contention:**
   - At scale, concurrent queries block each other
   - Solution: Use MVCC databases or read replicas

**Debugging Steps:**
```sql
EXPLAIN ANALYZE
SELECT ...  -- Get actual execution plan with timings

-- Check for sequential scans
-- Check estimated vs actual rows (statistics issue)
-- Check for sorts/spills to disk
```

---

### Question Set 3: Advanced Modeling Concepts

**Q24: "Explain the difference between a Fact table and an Accumulating Snapshot Fact table. When would you use each?"**

**Transaction Fact Table:**
- Grain: One row per event/transaction
- Immutable rows (insert-only)
- Example: FACT_ORDER (one row when order placed)

**Periodic Snapshot Fact:**
- Grain: One row per time period (daily/weekly/monthly)
- Captures state at regular intervals
- Example: FACT_ACCOUNT_BALANCE (daily snapshot of all accounts)

**Accumulating Snapshot Fact:**
- Grain: One row per entity through its lifecycle
- Multiple date columns for milestones
- Rows UPDATE as entity progresses
- Example: Order fulfillment pipeline

```sql
FACT_ORDER_FULFILLMENT (Accumulating Snapshot)
- order_key (one row per order)
- order_placed_date_key
- payment_confirmed_date_key
- shipped_date_key
- delivered_date_key
- returned_date_key (nullable)
- order_to_ship_days (derived)
- ship_to_deliver_days (derived)
- total_order_cycle_days (derived)
- current_status_key

-- Row updates as order progresses:
-- Initially: only order_placed_date_key populated
-- After payment: payment_confirmed_date_key updated
-- After shipping: shipped_date_key updated
-- etc.
```

**When to Use Each:**

| Type | Use Case | Examples |
|------|----------|----------|
| Transaction | Track individual events | Sales, clicks, logins |
| Periodic Snapshot | Track state over time | Inventory levels, account balances |
| Accumulating Snapshot | Track pipeline/workflow | Order fulfillment, loan approval, support tickets |

---

**Q25: "How do you handle a dimension that has both Type 1 and Type 2 changes for different attributes?"**

**Scenario:** Customer dimension where:
- Email updates should overwrite (Type 1)
- Address changes need history (Type 2)
- Loyalty tier changes need history (Type 2)

**Solution: Hybrid SCD**

```sql
DIM_CUSTOMER
- customer_key (surrogate)
- customer_id (natural key)
- email (Type 1 - updates in place)
- phone (Type 1)
- address_line_1 (Type 2)
- city (Type 2)
- state (Type 2)
- loyalty_tier (Type 2)
- effective_date
- expiration_date
- is_current

-- When email changes:
UPDATE DIM_CUSTOMER 
SET email = 'newemail@example.com'
WHERE customer_id = '12345' AND is_current = TRUE;

-- When address changes:
-- 1. Expire current record
UPDATE DIM_CUSTOMER
SET expiration_date = CURRENT_DATE - 1, is_current = FALSE
WHERE customer_id = '12345' AND is_current = TRUE;

-- 2. Insert new record with new address
INSERT INTO DIM_CUSTOMER (customer_key, customer_id, email, address_line_1, ...)
VALUES (NEW_KEY, '12345', 'current_email@example.com', 'new_address', ...);
```

**Alternative: Split into Multiple Dimensions (Mini-Dimension Pattern):**
```sql
DIM_CUSTOMER_STABLE (Type 1 attributes)
- customer_key
- customer_id
- email
- phone

DIM_CUSTOMER_ADDRESS (Type 2 attributes)
- address_key
- customer_id
- address_line_1
- city, state, zip
- effective_date, expiration_date

DIM_CUSTOMER_LOYALTY (Type 2 attributes)
- loyalty_key
- customer_id
- loyalty_tier
- points_balance
- effective_date, expiration_date
```

---

**Q26: "Design a model that supports both transactional reporting (who bought what) and analytical reporting (product affinity analysis) efficiently."**

**Challenge:** Different query patterns need different optimizations

**Solution: Dual-Purpose Model with Aggregates**

```sql
-- Transactional detail (narrow, fast inserts)
FACT_ORDER_DETAIL
- order_id
- line_number
- product_key
- quantity
- line_amount
-- Optimized for: Individual order lookups, operational reporting

-- Analytical aggregate (wide, pre-computed metrics)
FACT_PRODUCT_SALES_DAILY
- date_key
- product_key
- customer_segment_key
- total_quantity
- total_revenue
- unique_customers
-- Optimized for: Trend analysis, dashboards

-- Product affinity (specialized for market basket analysis)
FACT_PRODUCT_AFFINITY
- product_a_key
- product_b_key
- date_key
- co_occurrence_count
- lift_score
- confidence_score
-- Optimized for: Recommendation engines, cross-sell analysis
```

**Benefits:**
- Transactional fact for detailed queries (small subset of data)
- Aggregated fact for analytical queries (scan entire dataset)
- Affinity fact for specialized algorithms

---

## 8. Rapid-Fire Interview Questions

**Q27:** "What's the maximum number of dimension tables you've seen in a single star schema, and what were the challenges?"

**Expected Answer:** 15-25 dimensions is common in enterprise models. Challenges include query complexity for users, join performance, dimension synchronization in ETL.

---

**Q28:** "How do you handle a dimension update that arrives after the fact has already been loaded?"

**Answer:** 
- If Type 1 SCD: Simply update dimension, fact references are via surrogate key
- If Type 2 SCD: Need to create new dimension version, then decide:
  - Option A: Update fact table's dimension key (if within correction window)
  - Option B: Leave as-is (fact shows historical context at transaction time)
  - Best practice: Use effective_date in joins to get correct dimension version

---

**Q29:** "Difference between a wide table (OBT - One Big Table) and a star schema?"

**Answer:**
- **OBT:** All dimensions denormalized into fact table (super wide)
  - Pros: No joins, simple queries, good for BI tools
  - Cons: Massive redundancy, slow updates, huge storage
  - Use case: Small datasets, read-heavy, simplicity priority

- **Star Schema:** Dimensions separate from facts
  - Pros: Normalized storage, flexible, standard pattern
  - Cons: Requires joins
  - Use case: Enterprise data warehouses

---

**Q30:** "How do you version your dimensional model schema as requirements change?"

**Answer:**
- Semantic versioning for schema (v1.0, v1.1, v2.0)
- Breaking changes (remove column, change grain): Major version
- Non-breaking (add column, new dimension): Minor version
- Maintain backward compatibility with views
- Document changes in schema registry
- Use blue/green deployment for major changes

---

## 9. Interview Preparation Checklist

### Core Concepts to Master
- ✅ Star vs Snowflake trade-offs (with specific scenarios)
- ✅ All SCD types (0-6) with practical examples
- ✅ Fact table types: Transaction, Periodic Snapshot, Accumulating Snapshot
- ✅ Grain definition and why it's critical
- ✅ Conformed dimensions and their importance
- ✅ Role-playing dimensions
- ✅ Degenerate dimensions
- ✅ Junk dimensions
- ✅ Bridge tables for many-to-many
- ✅ Factless fact tables

### Advanced Patterns
- ✅ Galaxy/Constellation schema
- ✅ Data Vault basics
- ✅ Lambda architecture for real-time + batch
- ✅ Bi-temporal modeling
- ✅ Handling PII and GDPR compliance
- ✅ Multi-currency in global systems
- ✅ Large dimension problems and solutions

### Performance & Scale
- ✅ Partitioning strategies
- ✅ Indexing best practices
- ✅ Materialized views and summary tables
- ✅ Query optimization techniques
- ✅ Handling billions of rows
- ✅ Real-time vs batch trade-offs

### Practice Exercises

1. **Design from Scratch:**
   - Pick a familiar app (Twitter, Airbnb, DoorDash)
   - Design complete dimensional model
   - Justify grain, SCD strategy, partitioning
   - Write 5 analytical queries

2. **Troubleshooting:**
   - Given a broken model, identify issues
   - Revenue reconciliation problems
   - Performance degradation diagnosis

3. **Trade-off Analysis:**
   - Star vs Snowflake for specific scenario
   - Storage vs query performance
   - Real-time vs batch processing
   - Normalization vs denormalization

### Communication Tips for Interviews

1. **Start with Clarifying Questions:**
   - "What are the key business questions we need to answer?"
   - "What's the expected data volume and growth?"
   - "What are the query patterns - primarily analytical or operational?"
   - "Are there real-time requirements or is daily batch acceptable?"

2. **Think Aloud:**
   - Verbalize your thought process
   - Discuss trade-offs explicitly
   - Mention alternatives you're considering

3. **Draw Diagrams:**
   - Sketch the model on whiteboard/paper
   - Show relationships with arrows
   - Label grains clearly

4. **Discuss Edge Cases:**
   - Late-arriving data
   - Duplicates
   - NULL handling
   - Data quality issues

5. **Connect to Business Value:**
   - "This design enables the marketing team to analyze conversion funnels"
   - "This optimization reduces query costs by 80%"
   - "This approach supports our GDPR compliance requirements"

---

## 10. Final Key Takeaways

### Golden Rules of Dimensional Modeling

1. **Grain is King:** Define it precisely, document it, never violate it
2. **Conformed Dimensions are Critical:** Enable cross-fact analysis
3. **Denormalize for Query Performance:** But understand the trade-offs
4. **Design for Questions, Not Sources:** Start with business requirements
5. **Facts are Immutable, Dimensions Evolve:** Use appropriate SCD types
6. **One Source of Truth:** Canonical dimensions across all marts
7. **Performance Through Aggregation:** Pre-compute common queries
8. **Partition on Access Patterns:** Align with how data is queried
9. **Index Wisely:** Too few = slow queries, too many = slow loads
10. **Document Everything:** Future you (and your team) will thank you

### Common Interview Mistakes to Avoid

❌ Jumping to design without understanding requirements
❌ Confusing grain with level of detail
❌ Not considering data volume and scale
❌ Forgetting about slowly changing dimensions
❌ Ignoring late-arriving data scenarios
❌ Over-normalizing in a data warehouse
❌ Under-estimating ETL complexity
❌ Not discussing trade-offs
❌ Assuming all facts are additive
❌ Forgetting about NULL handling

### What Sets Apart Senior vs Junior Engineers

**Junior Engineer:**
- Designs basic star schema
- Understands conceptual model
- Can implement given design

**Senior Engineer:**
- Anticipates future requirements and designs for flexibility
- Quantifies trade-offs (storage vs performance vs complexity)
- Considers entire data pipeline (source → ETL → model → consumption)
- Designs for scale from day one
- Handles edge cases proactively
- Balances idealism with pragmatism
- Communicates trade-offs to stakeholders
- Mentors others on modeling decisions

---

## Resources for Continued Learning

**Books:**
- "The Data Warehouse Toolkit" by Ralph Kimball (Bible of dimensional modeling)
- "Star Schema: The Complete Reference" by Christopher Adamson
- "Building the Data Warehouse" by William Inmon

**Online Resources:**
- Kimball Group website and design tips
- AWS, GCP, Snowflake data modeling best practices docs
- dbt (data build tool) documentation on dimensional modeling

**Practice:**
- Build dimensional models for public datasets (e.g., NYC Taxi, Citibike)
- Contribute to open-source analytics projects
- Reverse-engineer popular SaaS applications

**Stay Current:**
- Modern data stack evolution (dbt, Fivetran, Airbyte)
- Cloud warehouse optimizations (BigQuery BI Engine, Snowflake clustering)
- Real-time streaming patterns (Kafka, Flink with Iceberg)
- Lakehouse architectures (Delta Lake, Apache Iceberg)

---

**Good luck with your interviews! Remember: Data modeling is both art and science. There's rarely one "right" answer - what matters is understanding trade-offs and justifying your choices based on business requirements, scale, and team capabilities.**