-- =====================================================
-- POSTGRESQL MEGA CHEAT SHEET - SQL INTERVIEW PREP
-- =====================================================

-- =====================================================
-- 1. DATABASE & TABLE OPERATIONS
-- =====================================================

-- Create Database
CREATE DATABASE mydb;
CREATE DATABASE IF NOT EXISTS mydb;

-- Drop Database
DROP DATABASE mydb;
DROP DATABASE IF EXISTS mydb;

-- Connect to Database
\c mydb;

-- Create Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    dept_id INT,
    salary NUMERIC(10,2),
    hire_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_dept FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- Create Table from Query
CREATE TABLE high_earners AS
SELECT * FROM employees WHERE salary > 100000;

-- Temporary Table
CREATE TEMP TABLE temp_data (id INT, value TEXT);

-- Alter Table
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);
ALTER TABLE employees DROP COLUMN phone;
ALTER TABLE employees RENAME COLUMN name TO full_name;
ALTER TABLE employees ALTER COLUMN salary SET NOT NULL;
ALTER TABLE employees ALTER COLUMN salary DROP NOT NULL;
ALTER TABLE employees RENAME TO staff;

-- Drop Table
DROP TABLE employees;
DROP TABLE IF EXISTS employees CASCADE;

-- Truncate Table
TRUNCATE TABLE employees;
TRUNCATE TABLE employees RESTART IDENTITY CASCADE;

-- =====================================================
-- 2. BASIC QUERIES
-- =====================================================

-- Select All
SELECT * FROM employees;

-- Select Specific Columns
SELECT name, salary FROM employees;

-- Distinct Values
SELECT DISTINCT dept_id FROM employees;
SELECT DISTINCT ON (dept_id) dept_id, name FROM employees ORDER BY dept_id, salary DESC;

-- Where Clause
SELECT * FROM employees WHERE salary > 50000;
SELECT * FROM employees WHERE dept_id = 3 AND is_active = TRUE;
SELECT * FROM employees WHERE dept_id IN (1, 2, 3);
SELECT * FROM employees WHERE salary BETWEEN 40000 AND 80000;
SELECT * FROM employees WHERE name LIKE 'John%';
SELECT * FROM employees WHERE name ILIKE 'john%'; -- Case insensitive
SELECT * FROM employees WHERE email IS NULL;
SELECT * FROM employees WHERE email IS NOT NULL;

-- Order By
SELECT * FROM employees ORDER BY salary DESC;
SELECT * FROM employees ORDER BY dept_id ASC, salary DESC;
SELECT * FROM employees ORDER BY salary DESC NULLS LAST;

-- Limit & Offset
SELECT * FROM employees LIMIT 10;
SELECT * FROM employees LIMIT 10 OFFSET 20;
SELECT * FROM employees ORDER BY id OFFSET 5 ROWS FETCH FIRST 10 ROWS ONLY;

-- =====================================================
-- 3. INSERT, UPDATE, DELETE
-- =====================================================

-- Insert Single Row
INSERT INTO employees (name, email, dept_id, salary)
VALUES ('John Doe', 'john@email.com', 1, 75000);

-- Insert Multiple Rows
INSERT INTO employees (name, email, dept_id, salary)
VALUES 
    ('Jane Smith', 'jane@email.com', 2, 80000),
    ('Bob Johnson', 'bob@email.com', 1, 65000);

-- Insert from Select
INSERT INTO high_earners
SELECT * FROM employees WHERE salary > 100000;

-- Insert with Returning
INSERT INTO employees (name, email, dept_id, salary)
VALUES ('Alice Brown', 'alice@email.com', 3, 90000)
RETURNING id, name;

-- Update
UPDATE employees SET salary = 80000 WHERE id = 1;
UPDATE employees SET salary = salary * 1.1 WHERE dept_id = 2;
UPDATE employees SET dept_id = 3, salary = 95000 WHERE id = 5;

-- Update with Returning
UPDATE employees SET salary = salary * 1.05 
WHERE dept_id = 1 
RETURNING id, name, salary;

-- Delete
DELETE FROM employees WHERE id = 10;
DELETE FROM employees WHERE hire_date < '2020-01-01';

-- Delete with Returning
DELETE FROM employees WHERE dept_id = 5 RETURNING *;

-- Upsert (Insert or Update)
INSERT INTO employees (id, name, email, salary)
VALUES (1, 'John Doe', 'john@email.com', 75000)
ON CONFLICT (id) 
DO UPDATE SET salary = EXCLUDED.salary, email = EXCLUDED.email;

-- =====================================================
-- 4. AGGREGATE FUNCTIONS
-- =====================================================

-- Count
SELECT COUNT(*) FROM employees;
SELECT COUNT(DISTINCT dept_id) FROM employees;
SELECT COUNT(*) FILTER (WHERE salary > 70000) FROM employees;

-- Sum
SELECT SUM(salary) FROM employees;
SELECT SUM(salary) FILTER (WHERE dept_id = 1) FROM employees;

-- Average
SELECT AVG(salary) FROM employees;
SELECT ROUND(AVG(salary), 2) FROM employees;

-- Min/Max
SELECT MIN(salary), MAX(salary) FROM employees;
SELECT MIN(hire_date), MAX(hire_date) FROM employees;

-- Standard Deviation & Variance
SELECT STDDEV(salary), VARIANCE(salary) FROM employees;
SELECT STDDEV_POP(salary), VAR_POP(salary) FROM employees;

-- String Aggregation
SELECT STRING_AGG(name, ', ') FROM employees;
SELECT STRING_AGG(name, ', ' ORDER BY name) FROM employees;
SELECT dept_id, STRING_AGG(name, ', ') FROM employees GROUP BY dept_id;

-- Array Aggregation
SELECT ARRAY_AGG(name) FROM employees;
SELECT dept_id, ARRAY_AGG(name ORDER BY salary DESC) FROM employees GROUP BY dept_id;

-- JSON Aggregation
SELECT JSON_AGG(employees) FROM employees;
SELECT JSONB_AGG(employees ORDER BY salary DESC) FROM employees;

-- =====================================================
-- 5. GROUP BY & HAVING
-- =====================================================

-- Basic Group By
SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id;
SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id;

-- Multiple Columns
SELECT dept_id, is_active, COUNT(*) 
FROM employees 
GROUP BY dept_id, is_active;

-- Having Clause
SELECT dept_id, AVG(salary) as avg_sal
FROM employees 
GROUP BY dept_id
HAVING AVG(salary) > 70000;

-- Group By with Rollup
SELECT dept_id, COUNT(*) 
FROM employees 
GROUP BY ROLLUP(dept_id);

-- Group By with Cube
SELECT dept_id, is_active, COUNT(*) 
FROM employees 
GROUP BY CUBE(dept_id, is_active);

-- Grouping Sets
SELECT dept_id, is_active, COUNT(*)
FROM employees
GROUP BY GROUPING SETS ((dept_id), (is_active), ());

-- =====================================================
-- 6. JOINS
-- =====================================================

-- Inner Join
SELECT e.name, d.dept_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- Left Join (Left Outer Join)
SELECT e.name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- Right Join (Right Outer Join)
SELECT e.name, d.dept_name
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;

-- Full Outer Join
SELECT e.name, d.dept_name
FROM employees e
FULL OUTER JOIN departments d ON e.dept_id = d.id;

-- Cross Join
SELECT e.name, d.dept_name
FROM employees e
CROSS JOIN departments d;

-- Self Join
SELECT e1.name as employee, e2.name as manager
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.id;

-- Multiple Joins
SELECT e.name, d.dept_name, l.city
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id
INNER JOIN locations l ON d.location_id = l.id;

-- Using Clause (when column names match)
SELECT e.name, d.dept_name
FROM employees e
INNER JOIN departments d USING (dept_id);

-- Natural Join (auto-match column names)
SELECT * FROM employees NATURAL JOIN departments;

-- Lateral Join (correlated subquery in FROM)
SELECT d.dept_name, top_emp.name, top_emp.salary
FROM departments d
LEFT JOIN LATERAL (
    SELECT name, salary 
    FROM employees e 
    WHERE e.dept_id = d.id 
    ORDER BY salary DESC 
    LIMIT 3
) top_emp ON true;

-- =====================================================
-- 7. SUBQUERIES
-- =====================================================

-- Subquery in WHERE
SELECT name FROM employees 
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Subquery with IN
SELECT name FROM employees 
WHERE dept_id IN (SELECT id FROM departments WHERE location = 'NY');

-- Subquery with EXISTS
SELECT name FROM employees e
WHERE EXISTS (
    SELECT 1 FROM projects p WHERE p.emp_id = e.id
);

-- Subquery with NOT EXISTS
SELECT name FROM employees e
WHERE NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.emp_id = e.id
);

-- Subquery in SELECT
SELECT 
    name,
    salary,
    (SELECT AVG(salary) FROM employees) as avg_salary
FROM employees;

-- Correlated Subquery
SELECT name, salary
FROM employees e1
WHERE salary > (
    SELECT AVG(salary) 
    FROM employees e2 
    WHERE e2.dept_id = e1.dept_id
);

-- Subquery in FROM
SELECT dept, avg_sal
FROM (
    SELECT dept_id as dept, AVG(salary) as avg_sal
    FROM employees
    GROUP BY dept_id
) sub
WHERE avg_sal > 70000;

-- ANY/SOME
SELECT name FROM employees
WHERE salary > ANY (SELECT salary FROM employees WHERE dept_id = 1);

-- ALL
SELECT name FROM employees
WHERE salary > ALL (SELECT salary FROM employees WHERE dept_id = 1);

-- =====================================================
-- 8. COMMON TABLE EXPRESSIONS (CTEs)
-- =====================================================

-- Basic CTE
WITH high_earners AS (
    SELECT * FROM employees WHERE salary > 80000
)
SELECT name, salary FROM high_earners;

-- Multiple CTEs
WITH 
    dept_avg AS (
        SELECT dept_id, AVG(salary) as avg_sal
        FROM employees
        GROUP BY dept_id
    ),
    high_depts AS (
        SELECT dept_id FROM dept_avg WHERE avg_sal > 70000
    )
SELECT e.name, e.salary
FROM employees e
INNER JOIN high_depts h ON e.dept_id = h.dept_id;

-- Recursive CTE (Employee Hierarchy)
WITH RECURSIVE emp_hierarchy AS (
    -- Base case
    SELECT id, name, manager_id, 1 as level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees e
    INNER JOIN emp_hierarchy eh ON e.manager_id = eh.id
)
SELECT * FROM emp_hierarchy ORDER BY level, name;

-- Recursive CTE (Number Series)
WITH RECURSIVE numbers AS (
    SELECT 1 as n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 10
)
SELECT * FROM numbers;

-- CTE with UPDATE
WITH updated_rows AS (
    UPDATE employees 
    SET salary = salary * 1.1 
    WHERE dept_id = 1
    RETURNING *
)
SELECT COUNT(*) FROM updated_rows;

-- =====================================================
-- 9. WINDOW FUNCTIONS
-- =====================================================

-- ROW_NUMBER
SELECT 
    name, 
    dept_id, 
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as row_num
FROM employees;

-- ROW_NUMBER with PARTITION BY
SELECT 
    name, 
    dept_id, 
    salary,
    ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) as dept_rank
FROM employees;

-- RANK (gaps in ranking)
SELECT 
    name, 
    salary,
    RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- DENSE_RANK (no gaps in ranking)
SELECT 
    name, 
    salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) as dense_rank
FROM employees;

-- NTILE (divide into N buckets)
SELECT 
    name, 
    salary,
    NTILE(4) OVER (ORDER BY salary DESC) as quartile
FROM employees;

-- LAG (previous row value)
SELECT 
    name, 
    salary,
    LAG(salary) OVER (ORDER BY hire_date) as prev_salary,
    salary - LAG(salary) OVER (ORDER BY hire_date) as diff
FROM employees;

-- LAG with offset and default
SELECT 
    name, 
    salary,
    LAG(salary, 2, 0) OVER (ORDER BY hire_date) as two_rows_back
FROM employees;

-- LEAD (next row value)
SELECT 
    name, 
    salary,
    LEAD(salary) OVER (ORDER BY hire_date) as next_salary
FROM employees;

-- FIRST_VALUE
SELECT 
    name, 
    dept_id,
    salary,
    FIRST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY salary DESC) as highest_in_dept
FROM employees;

-- LAST_VALUE (with proper frame)
SELECT 
    name, 
    dept_id,
    salary,
    LAST_VALUE(salary) OVER (
        PARTITION BY dept_id 
        ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as lowest_in_dept
FROM employees;

-- NTH_VALUE
SELECT 
    name, 
    salary,
    NTH_VALUE(salary, 2) OVER (ORDER BY salary DESC) as second_highest
FROM employees;

-- Cumulative SUM
SELECT 
    name, 
    salary,
    SUM(salary) OVER (ORDER BY hire_date) as cumulative_payroll
FROM employees;

-- Running Average
SELECT 
    name, 
    salary,
    AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg
FROM employees;

-- Window Frames
SELECT 
    name,
    salary,
    -- Default: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    SUM(salary) OVER (ORDER BY salary) as sum1,
    -- Rows frame
    SUM(salary) OVER (ORDER BY salary ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) as sum2,
    -- Range frame
    SUM(salary) OVER (ORDER BY salary RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING) as sum3,
    -- Groups frame
    SUM(salary) OVER (ORDER BY dept_id GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW) as sum4
FROM employees;

-- PERCENT_RANK
SELECT 
    name, 
    salary,
    PERCENT_RANK() OVER (ORDER BY salary) as pct_rank
FROM employees;

-- CUME_DIST (cumulative distribution)
SELECT 
    name, 
    salary,
    CUME_DIST() OVER (ORDER BY salary) as cum_dist
FROM employees;

-- Named Window
SELECT 
    name,
    dept_id,
    salary,
    ROW_NUMBER() OVER w as row_num,
    RANK() OVER w as rank,
    AVG(salary) OVER w as avg_sal
FROM employees
WINDOW w AS (PARTITION BY dept_id ORDER BY salary DESC);

-- =====================================================
-- 10. STRING FUNCTIONS
-- =====================================================

-- Concatenation
SELECT 'Hello' || ' ' || 'World';
SELECT CONCAT('Hello', ' ', 'World');
SELECT CONCAT_WS(', ', 'John', 'Doe', 'Engineer');

-- Length
SELECT LENGTH('Hello');
SELECT CHAR_LENGTH('Hello');
SELECT OCTET_LENGTH('Hello');

-- Case Conversion
SELECT UPPER('hello');
SELECT LOWER('HELLO');
SELECT INITCAP('hello world');

-- Trim
SELECT TRIM('  hello  ');
SELECT LTRIM('  hello  ');
SELECT RTRIM('  hello  ');
SELECT TRIM(BOTH 'x' FROM 'xxxhelloxxx');
SELECT TRIM(LEADING 'x' FROM 'xxxhello');
SELECT TRIM(TRAILING 'x' FROM 'helloxxx');

-- Substring
SELECT SUBSTRING('Hello World' FROM 1 FOR 5);
SELECT SUBSTRING('Hello World', 7, 5);
SELECT LEFT('Hello World', 5);
SELECT RIGHT('Hello World', 5);

-- Position
SELECT POSITION('World' IN 'Hello World');
SELECT STRPOS('Hello World', 'World');

-- Replace
SELECT REPLACE('Hello World', 'World', 'PostgreSQL');
SELECT TRANSLATE('Hello', 'el', 'ip');

-- Padding
SELECT LPAD('123', 6, '0');
SELECT RPAD('123', 6, '0');

-- Repeat
SELECT REPEAT('*', 5);

-- Reverse
SELECT REVERSE('Hello');

-- Split String
SELECT SPLIT_PART('one,two,three', ',', 2);
SELECT STRING_TO_ARRAY('one,two,three', ',');
SELECT REGEXP_SPLIT_TO_ARRAY('one two  three', '\s+');
SELECT REGEXP_SPLIT_TO_TABLE('one,two,three', ',');

-- Format
SELECT FORMAT('Hello %s, you have %s messages', 'John', 5);
SELECT FORMAT('Value: %I', 'table_name'); -- Identifier
SELECT FORMAT('Value: %L', 'some''value'); -- Literal

-- ASCII & CHR
SELECT ASCII('A');
SELECT CHR(65);

-- MD5 & Encoding
SELECT MD5('password');
SELECT ENCODE('text', 'base64');
SELECT DECODE('dGV4dA==', 'base64');

-- Quote
SELECT QUOTE_IDENT('table name');
SELECT QUOTE_LITERAL('O''Reilly');
SELECT QUOTE_NULLABLE(NULL);

-- Overlay
SELECT OVERLAY('Txxxxas' PLACING 'hom' FROM 2 FOR 4);

-- String Comparison
SELECT 'abc' < 'abd';
SELECT 'hello' LIKE 'h%';
SELECT 'hello' ILIKE 'H%';
SELECT 'hello' SIMILAR TO 'h.llo';

-- =====================================================
-- 11. DATE & TIME FUNCTIONS
-- =====================================================

-- Current Date/Time
SELECT CURRENT_DATE;
SELECT CURRENT_TIME;
SELECT CURRENT_TIMESTAMP;
SELECT NOW();
SELECT CLOCK_TIMESTAMP(); -- Changes during statement execution
SELECT TRANSACTION_TIMESTAMP();
SELECT STATEMENT_TIMESTAMP();
SELECT TIMEOFDAY(); -- String format

-- Date/Time Parts
SELECT EXTRACT(YEAR FROM CURRENT_DATE);
SELECT EXTRACT(MONTH FROM CURRENT_DATE);
SELECT EXTRACT(DAY FROM CURRENT_DATE);
SELECT EXTRACT(HOUR FROM CURRENT_TIMESTAMP);
SELECT EXTRACT(MINUTE FROM CURRENT_TIMESTAMP);
SELECT EXTRACT(SECOND FROM CURRENT_TIMESTAMP);
SELECT EXTRACT(DOW FROM CURRENT_DATE); -- Day of week (0=Sunday)
SELECT EXTRACT(DOY FROM CURRENT_DATE); -- Day of year
SELECT EXTRACT(WEEK FROM CURRENT_DATE);
SELECT EXTRACT(QUARTER FROM CURRENT_DATE);
SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP); -- Seconds since 1970

-- Date/Time Parts (alternative)
SELECT DATE_PART('year', CURRENT_DATE);
SELECT DATE_PART('month', CURRENT_DATE);

-- Date Truncation
SELECT DATE_TRUNC('year', CURRENT_TIMESTAMP);
SELECT DATE_TRUNC('month', CURRENT_TIMESTAMP);
SELECT DATE_TRUNC('day', CURRENT_TIMESTAMP);
SELECT DATE_TRUNC('hour', CURRENT_TIMESTAMP);
SELECT DATE_TRUNC('minute', CURRENT_TIMESTAMP);
SELECT DATE_TRUNC('week', CURRENT_TIMESTAMP);
SELECT DATE_TRUNC('quarter', CURRENT_TIMESTAMP);

-- Date Arithmetic
SELECT CURRENT_DATE + INTERVAL '1 day';
SELECT CURRENT_DATE - INTERVAL '1 week';
SELECT CURRENT_TIMESTAMP + INTERVAL '2 hours 30 minutes';
SELECT CURRENT_DATE + 7; -- Add 7 days
SELECT CURRENT_DATE - 7; -- Subtract 7 days
SELECT '2024-01-01'::date - '2023-01-01'::date; -- Days between

-- Age
SELECT AGE(CURRENT_DATE, '2000-01-01'::date);
SELECT AGE('2000-01-01'::date); -- Age from current date

-- Make Date/Time
SELECT MAKE_DATE(2024, 1, 15);
SELECT MAKE_TIME(14, 30, 0);
SELECT MAKE_TIMESTAMP(2024, 1, 15, 14, 30, 0);
SELECT MAKE_TIMESTAMPTZ(2024, 1, 15, 14, 30, 0);

-- To Char (Formatting)
SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD');
SELECT TO_CHAR(CURRENT_DATE, 'Day, DD Month YYYY');
SELECT TO_CHAR(CURRENT_TIMESTAMP, 'HH24:MI:SS');
SELECT TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS');
SELECT TO_CHAR(1234.5, '9999.99');
SELECT TO_CHAR(1234.5, 'FM9999.00'); -- Fill mode

-- To Date/Timestamp
SELECT TO_DATE('2024-01-15', 'YYYY-MM-DD');
SELECT TO_TIMESTAMP('2024-01-15 14:30:00', 'YYYY-MM-DD HH24:MI:SS');

-- JUSTIFY
SELECT JUSTIFY_DAYS(INTERVAL '35 days');
SELECT JUSTIFY_HOURS(INTERVAL '27 hours');
SELECT JUSTIFY_INTERVAL(INTERVAL '1 mon -1 hour');

-- Overlaps
SELECT (DATE '2024-01-01', DATE '2024-01-10') OVERLAPS 
       (DATE '2024-01-05', DATE '2024-01-15');

-- Generate Series (dates)
SELECT * FROM GENERATE_SERIES(
    '2024-01-01'::date, 
    '2024-01-10'::date, 
    '1 day'::interval
);

-- Time Zones
SELECT CURRENT_TIMESTAMP AT TIME ZONE 'UTC';
SELECT CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York';
SELECT TIMEZONE('UTC', CURRENT_TIMESTAMP);

-- =====================================================
-- 12. NUMERIC/MATH FUNCTIONS
-- =====================================================

-- Basic Math
SELECT 10 + 5;
SELECT 10 - 5;
SELECT 10 * 5;
SELECT 10 / 5;
SELECT 10 % 3; -- Modulo
SELECT 10 ^ 2; -- Power
SELECT |/ 25; -- Square root
SELECT ||/ 27; -- Cube root
SELECT @ -5; -- Absolute value
SELECT 5 !; -- Factorial

-- Math Functions
SELECT ABS(-15);
SELECT CEIL(4.3);
SELECT CEILING(4.3);
SELECT FLOOR(4.9);
SELECT ROUND(4.567, 2);
SELECT TRUNC(4.567, 2);
SELECT SIGN(-5);

-- Power & Roots
SELECT POWER(2, 10);
SELECT SQRT(25);
SELECT CBRT(27);

-- Exponential & Logarithm
SELECT EXP(1);
SELECT LN(2.718); -- Natural log
SELECT LOG(100); -- Base 10 log
SELECT LOG(2, 8); -- Custom base log

-- Trigonometry
SELECT PI();
SELECT SIN(PI()/2);
SELECT COS(0);
SELECT TAN(PI()/4);
SELECT ASIN(1);
SELECT ACOS(0);
SELECT ATAN(1);
SELECT ATAN2(1, 1);

-- Degrees & Radians
SELECT DEGREES(PI());
SELECT RADIANS(180);

-- Random
SELECT RANDOM(); -- 0 to 1
SELECT RANDOM() * 100; -- 0 to 100
SELECT FLOOR(RANDOM() * 100 + 1)::INT; -- Integer 1 to 100
SELECT SETSEED(0.5); -- Set random seed

-- Rounding
SELECT DIV(10, 3); -- Integer division
SELECT MOD(10, 3); -- Modulo

-- Width Bucket (histogram)
SELECT WIDTH_BUCKET(salary, 30000, 100000, 5) as bucket
FROM employees;

-- GCD & LCM
SELECT GCD(12, 18);
SELECT LCM(12, 18);

-- Min/Max (of values)
SELECT GREATEST(1, 5, 3, 9, 2);
SELECT LEAST(1, 5, 3, 9, 2);

-- Scale & Precision
SELECT SCALE(123.456::numeric);
SELECT MIN_SCALE(123.456::numeric);
SELECT TRIM_SCALE(123.456::numeric);

-- =====================================================
-- 13. CONDITIONAL EXPRESSIONS
-- =====================================================

-- CASE (Simple)
SELECT 
    name,
    CASE dept_id
        WHEN 1 THEN 'Engineering'
        WHEN 2 THEN 'Sales'
        WHEN 3 THEN 'Marketing'
        ELSE 'Other'
    END as department
FROM employees;

-- CASE (Searched)
SELECT 
    name,
    salary,
    CASE 
        WHEN salary < 50000 THEN 'Low'
        WHEN salary BETWEEN 50000 AND 80000 THEN 'Medium'
        WHEN salary > 80000 THEN 'High'
        ELSE 'Unknown'
    END as salary_grade
FROM employees;

-- COALESCE (first non-null)
SELECT COALESCE(NULL, NULL, 'default', 'value');
SELECT name, COALESCE(phone, email, 'No contact') FROM employees;

-- NULLIF (return NULL if equal)
SELECT NULLIF(10, 10); -- Returns NULL
SELECT NULLIF(10, 5);  -- Returns 10
SELECT salary / NULLIF(hours, 0) FROM employees; -- Avoid division by zero

-- GREATEST & LEAST
SELECT GREATEST(1, 5, 3, NULL); -- Returns 5 (ignores NULL)
SELECT LEAST(1, 5, 3, NULL);    -- Returns 1 (ignores NULL)

-- =====================================================
-- 14. ARRAY FUNCTIONS
-- =====================================================

-- Create Array
SELECT ARRAY[1, 2, 3, 4, 5];
SELECT '{1,2,3,4,5}'::INT[];

-- Array Subscript
SELECT ARRAY[1,2,3,4,5][3]; -- Returns 3 (1-indexed)

-- Array Slice
SELECT ARRAY[1,2,3,4,5][2:4]; -- Returns {2,3,4}

-- Array Length
SELECT ARRAY_LENGTH(ARRAY[1,2,3,4,5], 1);
SELECT CARDINALITY(ARRAY[1,2,3,4,5]);

-- Array Dimensions
SELECT ARRAY_DIMS(ARRAY[[1,2],[3,4]]);
SELECT ARRAY_NDIMS(ARRAY[[1,2],[3,4]]);

-- Array Position
SELECT ARRAY_POSITION(ARRAY['a','b','c'], 'b');
SELECT ARRAY_POSITIONS(ARRAY['a','b','c','b'], 'b');

-- Array Append/Prepend
SELECT ARRAY_APPEND(ARRAY[1,2,3], 4);
SELECT ARRAY_PREPEND(0, ARRAY[1,2,3]);

-- Array Concatenation
SELECT ARRAY[1,2,3] || ARRAY[4,5,6];
SELECT ARRAY_CAT(ARRAY[1,2,3], ARRAY[4,5,6]);

-- Array Remove
SELECT ARRAY_REMOVE(ARRAY[1,2,3,2], 2);

-- Array Replace
SELECT ARRAY_REPLACE(ARRAY[1,2,3,2], 2, 99);

-- Array to String
SELECT ARRAY_TO_STRING(ARRAY['a','b','c'], ',');
SELECT ARRAY_TO_STRING(ARRAY['a',NULL,'c'], ',', 'NULL');

-- String to Array
SELECT STRING_TO_ARRAY('a,b,c', ',');

-- Unnest (expand array to rows)
SELECT UNNEST(ARRAY[1,2,3,4,5]);
SELECT UNNEST(ARRAY['a','b','c']) WITH ORDINALITY;

-- ANY/ALL with Arrays
SELECT * FROM employees WHERE dept_id = ANY(ARRAY[1,2,3]);
SELECT * FROM employees WHERE salary > ALL(ARRAY[50000,60000,70000]);

-- Array Overlap
SELECT ARRAY[1,2,3] && ARRAY[3,4,5]; -- Returns true
SELECT ARRAY[1,2] @> ARRAY[1]; -- Contains
SELECT ARRAY[1] <@ ARRAY[1,2]; -- Contained by

-- =====================================================
-- 15. JSON/JSONB FUNCTIONS
-- =====================================================

-- Create JSON
SELECT '{"name":"John","age":30}'::JSON;
SELECT '{"name":"John","age":30}'::JSONB;

-- Build JSON
SELECT JSON_BUILD_OBJECT('name', 'John', 'age', 30);
SELECT JSON_BUILD_ARRAY(1, 2, 3, 4, 5);
SELECT JSONB_BUILD_OBJECT('name', 'John', 'age', 30);

-- JSON Operators
SELECT '{"a":1,"b":2}'::JSON -> 'a'; -- Get as JSON
SELECT '{"a":1,"b":2}'::JSON ->> 'a'; -- Get as text
SELECT '{"a":{"b":1}}'::JSON -> 'a' -> 'b';
SELECT '{"a":{"b":1}}'::JSON #> '{a,b}'; -- Path as JSON
SELECT '{"a":{"b":1}}'::JSON #>> '{a,b}'; -- Path as text

-- Array Element
SELECT '[1,2,3,4]'::JSON -> 2; -- 3 (0-indexed)
SELECT '[1,2,3,4]'::JSON ->> 2; -- '3'

-- Check Existence
SELECT '{"a":1,"b":2}'::JSONB ? 'a'; -- Key exists
SELECT '{"a":1,"b":2}'::JSONB ?| ARRAY['a','c']; -- Any key exists
SELECT '{"a":1,"b":2}'::JSONB ?& ARRAY['a','b']; -- All keys exist

-- Contains
SELECT '{"a":1,"b":2}'::JSONB @> '{"a":1}'::JSONB;
SELECT '{"a":1}'::JSONB <@ '{"a":1,"b":2}'::JSONB;

-- Delete Key
SELECT '{"a":1,"b":2,"c":3}'::JSONB - 'b';
SELECT '{"a":1,"b":2,"c":3}'::JSONB - ARRAY['b','c'];

-- Concatenate
SELECT '{"a":1}'::JSONB || '{"b":2}'::JSONB;

-- JSON Functions
SELECT JSON_TYPEOF('{"a":1}'::JSON);
SELECT JSON_ARRAY_LENGTH('[1,2,3]'::JSON);
SELECT JSONB_ARRAY_LENGTH('[1,2,3]'::JSONB);

-- JSON Keys/Elements
SELECT JSON_OBJECT_KEYS('{"a":1,"b":2}'::JSON);
SELECT JSONB_OBJECT_KEYS('{"a":1,"b":2}'::JSONB);
SELECT JSON_ARRAY_ELEMENTS('[1,2,3]'::JSON);
SELECT JSON_ARRAY_ELEMENTS_TEXT('[1,2,3]'::JSON);

-- JSON to Record
SELECT * FROM JSON_TO_RECORD('{"a":1,"b":"hello"}'::JSON) AS x(a INT, b TEXT);
SELECT * FROM JSON_TO_RECORDSET('[{"a":1,"b":"foo"},{"a":2,"b":"bar"}]'::JSON) 
AS x(a INT, b TEXT);

-- JSON Each
SELECT * FROM JSON_EACH('{"a":1,"b":2}'::JSON);
SELECT * FROM JSON_EACH_TEXT('{"a":1,"b":2}'::JSON);
SELECT * FROM JSONB_EACH('{"a":1,"b":2}'::JSONB);

-- JSON Populate
CREATE TEMP TABLE emp_type (name TEXT, age INT);
SELECT * FROM JSON_POPULATE_RECORD(NULL::emp_type, '{"name":"John","age":30}'::JSON);
SELECT * FROM JSON_POPULATE_RECORDSET(NULL::emp_type, 
    '[{"name":"John","age":30},{"name":"Jane","age":25}]'::JSON);

-- JSONB Set/Insert
SELECT JSONB_SET('{"a":1,"b":2}'::JSONB, '{c}', '3'::JSONB);
SELECT JSONB_SET('{"a":{"b":1}}'::JSONB, '{a,b}', '2'::JSONB);
SELECT JSONB_INSERT('{"a":1}'::JSONB, '{b}', '2'::JSONB);

-- JSONB Pretty
SELECT JSONB_PRETTY('{"a":1,"b":{"c":2}}'::JSONB);

-- JSON Strip Nulls
SELECT JSON_STRIP_NULLS('{"a":1,"b":null,"c":3}'::JSON);

-- JSON Path (SQL/JSON)
SELECT JSONB_PATH_EXISTS('{"a":1,"b":2}'::JSONB, '$.a');
SELECT JSONB_PATH_QUERY('[1,2,3,4,5]'::JSONB, '$[*] ? (@ > 2)');
SELECT JSONB_PATH_QUERY_ARRAY('[1,2,3,4,5]'::JSONB, '$[*] ? (@ > 2)');

-- Row to JSON
SELECT ROW_TO_JSON(employees) FROM employees LIMIT 1;
SELECT ROW_TO_JSON(row(name, salary)) FROM employees LIMIT 1;

-- =====================================================
-- 16. REGULAR EXPRESSIONS (REGEX)
-- =====================================================

-- Match (returns boolean)
SELECT 'hello123' ~ '[0-9]+'; -- Case sensitive
SELECT 'HELLO123' ~* '[a-z]+'; -- Case insensitive
SELECT 'hello' !~ '[0-9]+'; -- Does not match
SELECT 'HELLO' !~* '[0-9]+'; -- Does not match (case insensitive)

-- Extract
SELECT SUBSTRING('hello123world' FROM '[0-9]+');
SELECT SUBSTRING('Price: $123.45' FROM '\$([0-9.]+)');

-- Replace
SELECT REGEXP_REPLACE('hello123world456', '[0-9]+', 'X');
SELECT REGEXP_REPLACE('hello123world456', '[0-9]+', 'X', 'g'); -- Global
SELECT REGEXP_REPLACE('Hello World', '(\w+)\s+(\w+)', '\2 \1'); -- Swap words

-- Split
SELECT REGEXP_SPLIT_TO_ARRAY('one,two,,three', ',');
SELECT REGEXP_SPLIT_TO_ARRAY('one  two   three', '\s+');
SELECT REGEXP_SPLIT_TO_TABLE('one,two,three', ',');

-- Match Array
SELECT REGEXP_MATCH('hello123world', '([a-z]+)([0-9]+)');
SELECT REGEXP_MATCHES('hello123world456', '[0-9]+', 'g');

-- Common Patterns
SELECT email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,} as valid_email
FROM employees;

SELECT phone ~ '^\d{3}-\d{3}-\d{4} as valid_phone FROM employees;

SELECT url ~ '^https?://[^\s/$.?#].[^\s]* as valid_url FROM websites;

-- Extract parts
SELECT 
    SUBSTRING(email FROM '^([^@]+)@') as username,
    SUBSTRING(email FROM '@(.+)) as domain
FROM employees;

-- =====================================================
-- 17. INDEXES
-- =====================================================

-- B-tree Index (default)
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_employees_dept_salary ON employees(dept_id, salary);

-- Unique Index
CREATE UNIQUE INDEX idx_employees_email ON employees(email);

-- Partial Index
CREATE INDEX idx_active_employees ON employees(name) WHERE is_active = TRUE;
CREATE INDEX idx_high_earners ON employees(salary) WHERE salary > 100000;

-- Expression Index
CREATE INDEX idx_lower_email ON employees(LOWER(email));
CREATE INDEX idx_full_name ON employees((first_name || ' ' || last_name));

-- Hash Index
CREATE INDEX idx_employees_id ON employees USING HASH(id);

-- GiST Index (for full-text search, geometric types)
CREATE INDEX idx_employees_name_gist ON employees USING GIST(name);

-- GIN Index (for arrays, JSONB, full-text)
CREATE INDEX idx_tags ON posts USING GIN(tags);
CREATE INDEX idx_data ON documents USING GIN(data);
CREATE INDEX idx_tsvector ON articles USING GIN(to_tsvector('english', content));

-- BRIN Index (for very large tables with natural ordering)
CREATE INDEX idx_created_brin ON logs USING BRIN(created_at);

-- Covering Index (INCLUDE clause)
CREATE INDEX idx_employees_dept_include ON employees(dept_id) INCLUDE (name, salary);

-- Concurrent Index Creation (doesn't block writes)
CREATE INDEX CONCURRENTLY idx_employees_name ON employees(name);

-- Drop Index
DROP INDEX idx_employees_name;
DROP INDEX IF EXISTS idx_employees_name;
DROP INDEX CONCURRENTLY idx_employees_name;

-- Reindex
REINDEX INDEX idx_employees_name;
REINDEX TABLE employees;
REINDEX DATABASE mydb;

-- List Indexes
SELECT * FROM pg_indexes WHERE tablename = 'employees';

-- =====================================================
-- 18. CONSTRAINTS
-- =====================================================

-- Primary Key
ALTER TABLE employees ADD PRIMARY KEY (id);
ALTER TABLE employees ADD CONSTRAINT pk_employees PRIMARY KEY (id);

-- Foreign Key
ALTER TABLE employees ADD FOREIGN KEY (dept_id) REFERENCES departments(id);
ALTER TABLE employees ADD CONSTRAINT fk_dept 
    FOREIGN KEY (dept_id) REFERENCES departments(id) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique Constraint
ALTER TABLE employees ADD UNIQUE (email);
ALTER TABLE employees ADD CONSTRAINT uk_email UNIQUE (email);

-- Check Constraint
ALTER TABLE employees ADD CHECK (salary > 0);
ALTER TABLE employees ADD CONSTRAINT chk_salary CHECK (salary BETWEEN 30000 AND 500000);
ALTER TABLE employees ADD CONSTRAINT chk_email CHECK (email LIKE '%@%');

-- Not Null Constraint
ALTER TABLE employees ALTER COLUMN name SET NOT NULL;
ALTER TABLE employees ALTER COLUMN name DROP NOT NULL;

-- Default Constraint
ALTER TABLE employees ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE employees ALTER COLUMN created_at SET DEFAULT NOW();

-- Drop Constraints
ALTER TABLE employees DROP CONSTRAINT fk_dept;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS uk_email;

-- Exclusion Constraint (prevent overlapping ranges)
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INT,
    during TSRANGE,
    EXCLUDE USING GIST (room_id WITH =, during WITH &&)
);

-- =====================================================
-- 19. VIEWS
-- =====================================================

-- Create View
CREATE VIEW high_earners AS
SELECT name, salary FROM employees WHERE salary > 100000;

-- Create or Replace View
CREATE OR REPLACE VIEW dept_summary AS
SELECT 
    dept_id,
    COUNT(*) as emp_count,
    AVG(salary) as avg_salary
FROM employees
GROUP BY dept_id;

-- Materialized View
CREATE MATERIALIZED VIEW mv_dept_summary AS
SELECT 
    dept_id,
    COUNT(*) as emp_count,
    AVG(salary) as avg_salary
FROM employees
GROUP BY dept_id;

-- Refresh Materialized View
REFRESH MATERIALIZED VIEW mv_dept_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dept_summary;

-- Drop View
DROP VIEW high_earners;
DROP MATERIALIZED VIEW mv_dept_summary;

-- Updatable Views
CREATE VIEW active_employees AS
SELECT * FROM employees WHERE is_active = TRUE;

-- Can INSERT/UPDATE/DELETE through this view
UPDATE active_employees SET salary = salary * 1.1 WHERE dept_id = 1;

-- =====================================================
-- 20. TRANSACTIONS
-- =====================================================

-- Begin Transaction
BEGIN;
START TRANSACTION;

-- Commit
COMMIT;

-- Rollback
ROLLBACK;

-- Savepoint
BEGIN;
INSERT INTO employees (name) VALUES ('John');
SAVEPOINT sp1;
INSERT INTO employees (name) VALUES ('Jane');
ROLLBACK TO sp1; -- Rolls back Jane insert only
COMMIT; -- Commits John insert

-- Transaction Isolation Levels
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Set Session Isolation Level
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- =====================================================
-- 21. EXPLAIN & QUERY OPTIMIZATION
-- =====================================================

-- Explain
EXPLAIN SELECT * FROM employees WHERE salary > 70000;

-- Explain Analyze (actually executes)
EXPLAIN ANALYZE SELECT * FROM employees WHERE salary > 70000;

-- Explain with details
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
SELECT * FROM employees e 
JOIN departments d ON e.dept_id = d.id;

-- Explain Formats
EXPLAIN (FORMAT JSON) SELECT * FROM employees;
EXPLAIN (FORMAT YAML) SELECT * FROM employees;
EXPLAIN (FORMAT XML) SELECT * FROM employees;

-- =====================================================
-- 22. PERFORMANCE & STATISTICS
-- =====================================================

-- Analyze Table (update statistics)
ANALYZE employees;
ANALYZE; -- All tables

-- Vacuum (reclaim storage)
VACUUM employees;
VACUUM FULL employees;
VACUUM ANALYZE employees;

-- Auto Vacuum settings
SHOW autovacuum;

-- Table Statistics
SELECT * FROM pg_stat_user_tables WHERE relname = 'employees';

-- Index Statistics
SELECT * FROM pg_stat_user_indexes WHERE relname = 'employees';

-- Query Statistics (pg_stat_statements extension)
CREATE EXTENSION pg_stat_statements;
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Table Size
SELECT pg_size_pretty(pg_total_relation_size('employees'));
SELECT pg_size_pretty(pg_table_size('employees'));
SELECT pg_size_pretty(pg_indexes_size('employees'));

-- Database Size
SELECT pg_size_pretty(pg_database_size('mydb'));

-- =====================================================
-- 23. SET OPERATIONS
-- =====================================================

-- UNION (removes duplicates)
SELECT name FROM employees WHERE dept_id = 1
UNION
SELECT name FROM employees WHERE salary > 80000;

-- UNION ALL (keeps duplicates)
SELECT name FROM employees WHERE dept_id = 1
UNION ALL
SELECT name FROM employees WHERE salary > 80000;

-- INTERSECT (common rows)
SELECT name FROM employees WHERE dept_id = 1
INTERSECT
SELECT name FROM employees WHERE salary > 80000;

-- EXCEPT (in first but not in second)
SELECT name FROM employees WHERE dept_id = 1
EXCEPT
SELECT name FROM employees WHERE salary > 80000;

-- =====================================================
-- 24. DATA TYPES
-- =====================================================

-- Numeric Types
SELECT 123::SMALLINT;           -- 2 bytes
SELECT 123456::INTEGER;         -- 4 bytes
SELECT 123456789::BIGINT;       -- 8 bytes
SELECT 123.45::DECIMAL(10,2);   -- Variable
SELECT 123.45::NUMERIC(10,2);   -- Variable
SELECT 123.45::REAL;            -- 4 bytes
SELECT 123.45::DOUBLE PRECISION;-- 8 bytes
SELECT 123::SERIAL;             -- Auto-increment integer
SELECT 123::BIGSERIAL;          -- Auto-increment bigint

-- Character Types
SELECT 'text'::CHAR(10);        -- Fixed length
SELECT 'text'::VARCHAR(100);    -- Variable length
SELECT 'text'::TEXT;            -- Unlimited

-- Date/Time Types
SELECT '2024-01-15'::DATE;
SELECT '14:30:00'::TIME;
SELECT '14:30:00-05'::TIME WITH TIME ZONE;
SELECT '2024-01-15 14:30:00'::TIMESTAMP;
SELECT '2024-01-15 14:30:00-05'::TIMESTAMP WITH TIME ZONE;
SELECT '1 year 2 months 3 days'::INTERVAL;

-- Boolean
SELECT TRUE::BOOLEAN;
SELECT FALSE::BOOLEAN;

-- Binary
SELECT '\x48656c6c6f'::BYTEA;   -- Binary string

-- UUID
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID;
SELECT GEN_RANDOM_UUID();

-- JSON
SELECT '{"a":1}'::JSON;
SELECT '{"a":1}'::JSONB;

-- Array
SELECT ARRAY[1,2,3]::INT[];
SELECT '{1,2,3}'::INTEGER[];

-- Range Types
SELECT '[1,10)'::INT4RANGE;     -- Integer range
SELECT '[1,10]'::INT8RANGE;     -- Bigint range
SELECT '[0,1)'::NUMRANGE;       -- Numeric range
SELECT '[2024-01-01,2024-12-31]'::DATERANGE;
SELECT '[14:00,15:00)'::TSRANGE;

-- Geometric Types
SELECT '(1,2)'::POINT;
SELECT '((0,0),(1,1))'::LINE;
SELECT '((0,0),(1,1))'::LSEG;   -- Line segment
SELECT '((0,0),1)'::CIRCLE;
SELECT '<(0,0),1>'::CIRCLE;
SELECT '((0,0),(1,0),(1,1),(0,1))'::POLYGON;
SELECT '((0,0),(2,2))'::BOX;
SELECT '[(0,0),(1,1),(2,0)]'::PATH;

-- Network Types
SELECT '192.168.1.1'::INET;
SELECT '192.168.1.0/24'::CIDR;
SELECT '08:00:2b:01:02:03'::MACADDR;

-- Bit String
SELECT B'101010'::BIT(6);
SELECT B'101010'::VARBIT;

-- Money
SELECT 123.45::MONEY;

-- XML
SELECT '<root><item>value</item></root>'::XML;

-- =====================================================
-- 25. TYPE CASTING
-- =====================================================

-- CAST function
SELECT CAST('123' AS INTEGER);
SELECT CAST(123.45 AS INTEGER);
SELECT CAST('2024-01-15' AS DATE);

-- :: Operator (PostgreSQL specific)
SELECT '123'::INTEGER;
SELECT 123.45::INTEGER;
SELECT '2024-01-15'::DATE;

-- Safe Casting (returns NULL on error - PostgreSQL 16+)
-- For older versions, use try-catch or validation

-- =====================================================
-- 26. SEQUENCE OPERATIONS
-- =====================================================

-- Create Sequence
CREATE SEQUENCE emp_id_seq START 1000 INCREMENT 1;

-- Next Value
SELECT NEXTVAL('emp_id_seq');

-- Current Value
SELECT CURRVAL('emp_id_seq');

-- Set Value
SELECT SETVAL('emp_id_seq', 2000);
SELECT SETVAL('emp_id_seq', 2000, FALSE); -- Next will be 2000

-- Last Value
SELECT LAST_VALUE FROM emp_id_seq;

-- Alter Sequence
ALTER SEQUENCE emp_id_seq RESTART WITH 1;
ALTER SEQUENCE emp_id_seq INCREMENT BY 5;

-- Drop Sequence
DROP SEQUENCE emp_id_seq;

-- Associate with Column
ALTER TABLE employees ALTER COLUMN id SET DEFAULT NEXTVAL('emp_id_seq');
ALTER SEQUENCE emp_id_seq OWNED BY employees.id;

-- =====================================================
-- 27. FULL TEXT SEARCH
-- =====================================================

-- Create tsvector
SELECT TO_TSVECTOR('english', 'The quick brown fox jumps over the lazy dog');

-- Create tsquery
SELECT TO_TSQUERY('english', 'quick & fox');
SELECT PLAINTO_TSQUERY('english', 'quick fox');
SELECT PHRASETO_TSQUERY('english', 'quick brown fox');

-- Match
SELECT TO_TSVECTOR('english', 'The quick brown fox') @@ 
       TO_TSQUERY('english', 'quick & fox');

-- Search in table
SELECT * FROM articles
WHERE TO_TSVECTOR('english', content) @@ TO_TSQUERY('english', 'postgresql');

-- Rank results
SELECT 
    title,
    TS_RANK(TO_TSVECTOR('english', content), query) as rank
FROM articles, TO_TSQUERY('english', 'postgresql') query
WHERE TO_TSVECTOR('english', content) @@ query
ORDER BY rank DESC;

-- Create GIN index for full-text
CREATE INDEX idx_articles_content ON articles 
USING GIN(TO_TSVECTOR('english', content));

-- Store tsvector in column
ALTER TABLE articles ADD COLUMN content_tsv TSVECTOR;
UPDATE articles SET content_tsv = TO_TSVECTOR('english', content);
CREATE INDEX idx_content_tsv ON articles USING GIN(content_tsv);

-- Trigger to auto-update tsvector
CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION
TSVECTOR_UPDATE_TRIGGER(content_tsv, 'pg_catalog.english', content);

-- Highlight matches
SELECT TS_HEADLINE('english', content, TO_TSQUERY('english', 'postgresql'))
FROM articles
WHERE TO_TSVECTOR('english', content) @@ TO_TSQUERY('english', 'postgresql');

-- =====================================================
-- 28. PIVOT & CROSSTAB
-- =====================================================

-- Install tablefunc extension
CREATE EXTENSION tablefunc;

-- Basic Crosstab
SELECT * FROM CROSSTAB(
    'SELECT dept_id, EXTRACT(YEAR FROM hire_date), COUNT(*) 
     FROM employees 
     GROUP BY dept_id, EXTRACT(YEAR FROM hire_date) 
     ORDER BY 1,2',
    'SELECT DISTINCT EXTRACT(YEAR FROM hire_date) FROM employees ORDER BY 1'
) AS ct(dept_id INT, "2020" BIGINT, "2021" BIGINT, "2022" BIGINT);

-- Pivot with CASE (manual pivot)
SELECT 
    dept_id,
    SUM(CASE WHEN EXTRACT(YEAR FROM hire_date) = 2020 THEN 1 ELSE 0 END) as "2020",
    SUM(CASE WHEN EXTRACT(YEAR FROM hire_date) = 2021 THEN 1 ELSE 0 END) as "2021",
    SUM(CASE WHEN EXTRACT(YEAR FROM hire_date) = 2022 THEN 1 ELSE 0 END) as "2022"
FROM employees
GROUP BY dept_id;

-- FILTER for pivot (PostgreSQL 9.4+)
SELECT 
    dept_id,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM hire_date) = 2020) as "2020",
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM hire_date) = 2021) as "2021",
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM hire_date) = 2022) as "2022"
FROM employees
GROUP BY dept_id;

-- =====================================================
-- 29. GENERATE SERIES & SAMPLE DATA
-- =====================================================

-- Number Series
SELECT * FROM GENERATE_SERIES(1, 10);
SELECT * FROM GENERATE_SERIES(1, 10, 2);
SELECT * FROM GENERATE_SERIES(10, 1, -1);

-- Date Series
SELECT * FROM GENERATE_SERIES(
    '2024-01-01'::DATE,
    '2024-01-31'::DATE,
    '1 day'::INTERVAL
);

-- Timestamp Series
SELECT * FROM GENERATE_SERIES(
    '2024-01-01 00:00:00'::TIMESTAMP,
    '2024-01-01 23:00:00'::TIMESTAMP,
    '1 hour'::INTERVAL
);

-- Generate Sample Data
INSERT INTO employees (name, dept_id, salary)
SELECT 
    'Employee ' || i,
    (RANDOM() * 5 + 1)::INT,
    (RANDOM() * 50000 + 40000)::NUMERIC(10,2)
FROM GENERATE_SERIES(1, 1000) i;

-- Generate Test Email Addresses
SELECT 'user' || i || '@example.com'
FROM GENERATE_SERIES(1, 100) i;

-- Create Calendar Table
CREATE TABLE calendar AS
SELECT 
    date::DATE,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    EXTRACT(DAY FROM date) as day,
    TO_CHAR(date, 'Day') as day_name,
    EXTRACT(DOW FROM date) as day_of_week,
    EXTRACT(WEEK FROM date) as week_num
FROM GENERATE_SERIES(
    '2024-01-01'::DATE,
    '2024-12-31'::DATE,
    '1 day'::INTERVAL
) date;

-- =====================================================
-- 30. IMPORT/EXPORT DATA
-- =====================================================

-- Export to CSV
COPY employees TO '/path/to/employees.csv' CSV HEADER;
COPY (SELECT * FROM employees WHERE dept_id = 1) TO '/path/to/dept1.csv' CSV HEADER;

-- Import from CSV
COPY employees FROM '/path/to/employees.csv' CSV HEADER;
COPY employees(name, email, salary) FROM '/path/to/data.csv' CSV HEADER;

-- Export with custom delimiter
COPY employees TO '/path/to/employees.txt' DELIMITER '|' CSV HEADER;

-- Export specific columns
COPY employees(name, email) TO '/path/to/contacts.csv' CSV HEADER;

-- =====================================================
-- 31. COMMON PATTERNS & INTERVIEW QUESTIONS
-- =====================================================

-- Find Duplicates
SELECT email, COUNT(*) 
FROM employees 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Remove Duplicates (keep one)
DELETE FROM employees a USING employees b
WHERE a.id > b.id AND a.email = b.email;

-- Nth Highest Salary
SELECT DISTINCT salary 
FROM employees 
ORDER BY salary DESC 
LIMIT 1 OFFSET 2; -- 3rd highest

-- Nth Highest per Department
SELECT * FROM (
    SELECT 
        dept_id,
        name,
        salary,
        DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rank
    FROM employees
) sub
WHERE rank = 2;

-- Find Gaps in Sequence
SELECT id + 1 as gap_start
FROM employees e1
WHERE NOT EXISTS (
    SELECT 1 FROM employees e2 WHERE e2.id = e1.id + 1
)
AND id < (SELECT MAX(id) FROM employees);

-- Running Total
SELECT 
    hire_date,
    salary,
    SUM(salary) OVER (ORDER BY hire_date) as running_total
FROM employees;

-- Percentage of Total
SELECT 
    dept_id,
    COUNT(*) as emp_count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM employees
GROUP BY dept_id;

-- Year over Year Growth
SELECT 
    year,
    revenue,
    LAG(revenue) OVER (ORDER BY year) as prev_year,
    revenue - LAG(revenue) OVER (ORDER BY year) as growth,
    ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY year)) / 
          LAG(revenue) OVER (ORDER BY year), 2) as growth_pct
FROM yearly_sales;

-- Find Consecutive Days
WITH consecutive AS (
    SELECT 
        date,
        date - (ROW_NUMBER() OVER (ORDER BY date))::INT as grp
    FROM attendance
)
SELECT 
    MIN(date) as start_date,
    MAX(date) as end_date,
    COUNT(*) as consecutive_days
FROM consecutive
GROUP BY grp
HAVING COUNT(*) >= 3;

-- Median (using percentile)
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) as median_salary
FROM employees;

-- Mode (most frequent value)
SELECT MODE() WITHIN GROUP (ORDER BY dept_id) as most_common_dept
FROM employees;

-- Self-Join to find pairs
SELECT e1.name as employee1, e2.name as employee2
FROM employees e1
JOIN employees e2 ON e1.dept_id = e2.dept_id AND e1.id < e2.id;

-- Hierarchical Query (Manager Chain)
WITH RECURSIVE manager_chain AS (
    SELECT id, name, manager_id, 1 as level, name as chain
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, mc.level + 1, mc.chain || ' -> ' || e.name
    FROM employees e
    JOIN manager_chain mc ON e.manager_id = mc.id
)
SELECT * FROM manager_chain;

-- Dense Rank vs Rank vs Row Number
SELECT 
    name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as row_num,
    RANK() OVER (ORDER BY salary DESC) as rank,
    DENSE_RANK() OVER (ORDER BY salary DESC) as dense_rank
FROM employees;

-- Top N per Group
SELECT * FROM (
    SELECT 
        dept_id,
        name,
        salary,
        ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rn
    FROM employees
) sub
WHERE rn <= 3;

-- Islands and Gaps
WITH numbered AS (
    SELECT 
        id,
        id - ROW_NUMBER() OVER (ORDER BY id) as grp
    FROM employees
)
SELECT 
    MIN(id) as island_start,
    MAX(id) as island_end,
    COUNT(*) as island_size
FROM numbered
GROUP BY grp;

-- =====================================================
-- 32. USEFUL SYSTEM QUERIES
-- =====================================================

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Table structure
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'employees';

-- List all indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'employees';

-- List all constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'employees';

-- Active connections
SELECT * FROM pg_stat_activity;

-- Kill connection
SELECT PG_TERMINATE_BACKEND(pid) FROM pg_stat_activity WHERE pid = 12345;

-- Current user and database
SELECT CURRENT_USER, CURRENT_DATABASE();

-- PostgreSQL version
SELECT VERSION();

-- =====================================================
-- 33. ADVANCED TOPICS
-- =====================================================

-- Listen/Notify (pub/sub)
LISTEN channel_name;
NOTIFY channel_name, 'message payload';

-- Advisory Locks
SELECT PG_ADVISORY_LOCK(123);
SELECT PG_TRY_ADVISORY_LOCK(123);
SELECT PG_ADVISORY_UNLOCK(123);

-- Custom Aggregates
CREATE AGGREGATE custom_avg (NUMERIC) (
    SFUNC = numeric_avg_accum,
    STYPE = internal,
    FINALFUNC = numeric_avg
);

-- Custom Functions
CREATE OR REPLACE FUNCTION get_full_name(first TEXT, last TEXT)
RETURNS TEXT AS $
BEGIN
    RETURN first || ' ' || last;
END;
$ LANGUAGE plpgsql;

-- Custom Function with OUT parameters
CREATE OR REPLACE FUNCTION get_emp_stats(OUT total INT, OUT avg_sal NUMERIC)
AS $
BEGIN
    SELECT COUNT(*), AVG(salary) INTO total, avg_sal FROM employees;
END;
$ LANGUAGE plpgsql;

-- Trigger Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_modtime
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- =====================================================
-- END OF CHEAT SHEET
-- =====================================================