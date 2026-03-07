import { useState, useEffect } from "react";

const roadmap = [
  {
    tier: "TIER 1",
    label: "Absolute Must-Haves",
    subtitle: "Non-negotiable for any FAANG DE interview",
    color: "#ff4d4d",
    accent: "#ff9999",
    bg: "rgba(255, 77, 77, 0.05)",
    sections: [
      {
        title: "SQL (Advanced)",
        icon: "🗄️",
        priority: "Critical",
        timeEstimate: "4–6 weeks",
        topics: [
          "Window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, NTILE",
          "CTEs (recursive & non-recursive), subqueries, correlated subqueries",
          "Set operations: UNION, INTERSECT, EXCEPT",
          "Query optimization: EXPLAIN plans, index types (B-Tree, Hash, Bitmap), partitioning",
          "Aggregations: GROUP BY, HAVING, GROUPING SETS, ROLLUP, CUBE",
          "Slowly Changing Dimensions (SCD Type 1/2/3) via SQL",
          "Data skew, broadcast joins vs shuffle joins",
          "Analytical SQL on Spark SQL / BigQuery / Presto / Trino",
        ],
        resources: ["LeetCode SQL (Hard)", "Mode Analytics SQL Tutorial", "Stratascratch"],
      },
      {
        title: "Python for Data Engineering",
        icon: "🐍",
        priority: "Critical",
        timeEstimate: "4–6 weeks",
        topics: [
          "Pandas & Polars for data manipulation at scale",
          "File I/O: Parquet, Avro, ORC, JSON, CSV — reading & writing efficiently",
          "Python OOP: classes, decorators, context managers, generators",
          "Async Python: asyncio, aiohttp for concurrent data pipelines",
          "Unit testing: pytest, mock, fixtures — DE pipelines must be testable",
          "Data classes, type hints, Pydantic for schema enforcement",
          "Performance: vectorization, memory profiling, multiprocessing vs threading",
          "Packaging: pyproject.toml, virtual environments, Poetry/pip",
        ],
        resources: ["Fluent Python (book)", "Real Python", "Python Cookbook"],
      },
      {
        title: "Data Structures & Algorithms",
        icon: "🧮",
        priority: "Critical",
        timeEstimate: "8–12 weeks",
        topics: [
          "Arrays, hashmaps, sets — most frequent in DE interviews",
          "Heaps: Top-K problems, merge K sorted lists (common in DE)",
          "Two pointers, sliding window for stream processing patterns",
          "Graphs: BFS/DFS, topological sort (DAG scheduling!), Dijkstra",
          "Binary search — used in range partitioning, indexing",
          "Dynamic programming (medium frequency — mainly for L5+)",
          "Recursion & backtracking",
          "Time/space complexity analysis (Big-O) for every solution",
        ],
        resources: ["LeetCode (100–150 problems)", "NeetCode 150", "AlgoExpert"],
      },
    ],
  },
  {
    tier: "TIER 2",
    label: "Core Data Engineering Stack",
    subtitle: "The actual day-to-day work at scale",
    color: "#ff9933",
    accent: "#ffcc99",
    bg: "rgba(255, 153, 51, 0.05)",
    sections: [
      {
        title: "Apache Spark",
        icon: "⚡",
        priority: "High",
        timeEstimate: "6–8 weeks",
        topics: [
          "Spark architecture: Driver, Executors, DAG scheduler, Stage vs Task",
          "RDDs vs DataFrames vs Datasets — when to use what",
          "Transformations (lazy) vs Actions (eager) — execution model",
          "Spark SQL: catalyst optimizer, predicate pushdown, column pruning",
          "Joins: sort-merge join, broadcast join, skew join optimization",
          "Partitioning strategies: repartition vs coalesce, custom partitioners",
          "Caching & persistence levels",
          "Spark Streaming / Structured Streaming: watermarks, triggers, stateful ops",
          "PySpark + Delta Lake / Iceberg integration",
          "Spark on Kubernetes vs YARN vs Databricks",
        ],
        resources: ["Learning Spark (O'Reilly)", "Databricks Academy", "Spark docs"],
      },
      {
        title: "Data Warehousing & Modeling",
        icon: "🏗️",
        priority: "High",
        timeEstimate: "4–5 weeks",
        topics: [
          "Star schema, snowflake schema, galaxy schema — tradeoffs",
          "Kimball methodology vs Inmon methodology",
          "Fact tables (transactional, snapshot, accumulating) vs dimension tables",
          "Slowly Changing Dimensions (SCD): Type 1, 2, 3, 6",
          "Data Vault 2.0: Hubs, Links, Satellites",
          "OLAP vs OLTP: architectural differences and query patterns",
          "Column-store vs row-store (why Redshift/BigQuery are fast)",
          "Materialized views, query result caching",
          "Practical: BigQuery / Snowflake / Redshift — query cost optimization",
        ],
        resources: ["The Data Warehouse Toolkit (Kimball)", "dbt docs", "Snowflake docs"],
      },
      {
        title: "Apache Kafka & Streaming",
        icon: "🌊",
        priority: "High",
        timeEstimate: "4–6 weeks",
        topics: [
          "Kafka architecture: Brokers, Topics, Partitions, Offsets, Consumer Groups",
          "Producers: batching, compression (LZ4, Snappy, Gzip), acks, idempotence",
          "Consumers: poll loop, offset management, rebalancing strategies",
          "Kafka Streams vs Flink vs Spark Streaming — when to use each",
          "Exactly-once semantics (EOS) — critical concept for FAANG",
          "Schema Registry: Avro, Protobuf schema evolution",
          "Compacted topics for CDC (Change Data Capture)",
          "Kafka Connect: source & sink connectors, Debezium for CDC",
          "Consumer lag monitoring, partition leadership, ISR",
        ],
        resources: ["Kafka: The Definitive Guide", "Confluent docs", "conduktor.io"],
      },
      {
        title: "Pipeline Orchestration",
        icon: "🔄",
        priority: "High",
        timeEstimate: "3–4 weeks",
        topics: [
          "Apache Airflow: DAGs, operators, sensors, XComs, task dependencies",
          "Airflow internals: scheduler, executor types (Local, Celery, K8s)",
          "DAG design patterns: dynamic DAGs, TaskFlow API, branching",
          "Error handling: retries, SLAs, alerting, dead letter queues",
          "Alternatives: Prefect, Dagster, Metaflow — know the tradeoffs",
          "Idempotency in pipelines — critical for reliability",
          "Backfilling strategies",
          "dbt for transformation orchestration inside the warehouse",
        ],
        resources: ["Airflow docs", "Astronomer guides", "dbt Learn"],
      },
    ],
  },
  {
    tier: "TIER 3",
    label: "Infrastructure & Cloud",
    subtitle: "Modern DE is cloud-native",
    color: "#e6b800",
    accent: "#ffeb33",
    bg: "rgba(230, 184, 0, 0.05)",
    sections: [
      {
        title: "Cloud Platforms",
        icon: "☁️",
        priority: "High",
        timeEstimate: "5–7 weeks",
        topics: [
          "AWS: S3, Glue, EMR, Redshift, Kinesis, Lambda, Step Functions, Athena",
          "GCP: BigQuery, Dataflow (Apache Beam), Pub/Sub, Dataproc, Cloud Composer",
          "Azure: Synapse, Data Factory, Event Hubs, ADLS Gen2, Databricks",
          "IAM roles, VPCs, security groups — data security fundamentals",
          "Cost optimization: spot instances, reserved capacity, storage tiers",
          "Cloud storage formats: S3 as data lake, lifecycle policies",
          "Serverless data processing: Lambda/Cloud Functions for event-driven ETL",
        ],
        resources: ["AWS/GCP official docs", "A Cloud Guru", "Cloud certification"],
      },
      {
        title: "Docker & Kubernetes",
        icon: "🐳",
        priority: "Medium-High",
        timeEstimate: "3–4 weeks",
        topics: [
          "Docker: images, containers, Dockerfile best practices, multi-stage builds",
          "Docker Compose for local DE stack (Postgres + Airflow + Kafka)",
          "Kubernetes basics: Pods, Deployments, Services, ConfigMaps, Secrets",
          "Helm charts for deploying Spark/Airflow on K8s",
          "Spark on Kubernetes: driver pod, executor pods, dynamic allocation",
          "Resource requests & limits for data workloads",
          "PersistentVolumes for stateful data services",
        ],
        resources: ["Docker docs", "Kubernetes in Action (book)", "KodeKloud"],
      },
      {
        title: "Infrastructure as Code",
        icon: "🔧",
        priority: "Medium",
        timeEstimate: "2–3 weeks",
        topics: [
          "Terraform: providers, resources, state management, modules",
          "Provisioning data infrastructure: S3 buckets, Glue jobs, Redshift clusters",
          "CI/CD for data pipelines: GitHub Actions, Jenkins, GitLab CI",
          "Secrets management: AWS Secrets Manager, HashiCorp Vault",
          "Environment promotion: dev → staging → prod for pipelines",
        ],
        resources: ["Terraform docs", "HashiCorp Learn", "GitHub Actions docs"],
      },
    ],
  },
  {
    tier: "TIER 4",
    label: "Advanced & Differentiating Skills",
    subtitle: "What separates L5 from L6 candidates",
    color: "#2eb85c",
    accent: "#a3cfbb",
    bg: "rgba(46, 184, 92, 0.05)",
    sections: [
      {
        title: "Data Lake Architecture",
        icon: "🏔️",
        priority: "Medium-High",
        timeEstimate: "3–4 weeks",
        topics: [
          "Lakehouse architecture: Delta Lake, Apache Iceberg, Apache Hudi — tradeoffs",
          "ACID transactions on data lakes — how they work under the hood",
          "Time travel / data versioning — use cases and implementation",
          "Schema evolution strategies: add, rename, delete columns safely",
          "Partition evolution and hidden partitioning (Iceberg)",
          "Compaction, vacuuming, Z-ordering / clustering for performance",
          "Medallion architecture: Bronze → Silver → Gold layers",
          "Table formats vs file formats — key distinction",
        ],
        resources: ["Delta Lake docs", "Iceberg docs", "Databricks blogs"],
      },
      {
        title: "System Design",
        icon: "🏛️",
        priority: "High",
        timeEstimate: "4–6 weeks",
        topics: [
          "Design a real-time analytics pipeline (clickstream, fraud detection)",
          "Design a data warehouse from scratch for a ride-sharing company",
          "Design a feature store for ML (Feast, Tecton patterns)",
          "CAP theorem applied to data systems — consistency vs availability",
          "Lambda vs Kappa architecture — and when each makes sense",
          "Designing for idempotency, exactly-once, at-least-once",
          "Backpressure handling in streaming systems",
          "Data catalog design: lineage, metadata management",
          "Multi-tenancy in data platforms — isolation, quotas, security",
        ],
        resources: ["Designing Data-Intensive Applications (DDIA)", "ByteByteGo"],
      },
      {
        title: "Observability",
        icon: "🔍",
        priority: "Medium-High",
        timeEstimate: "2–3 weeks",
        topics: [
          "Great Expectations / Soda Core: defining data contracts",
          "Anomaly detection in data pipelines (volume, freshness, schema drift)",
          "Data lineage: column-level & table-level (OpenLineage, Marquez)",
          "Monitoring pipeline SLAs: alerting strategies, PagerDuty integration",
          "dbt tests: singular, generic, custom tests",
          "Monte Carlo / Bigeye patterns for observability",
          "Data contracts as code — emerging best practice",
        ],
        resources: ["Great Expectations docs", "dbt testing guide"],
      },
      {
        title: "Distributed Systems",
        icon: "🌐",
        priority: "High",
        timeEstimate: "4–5 weeks",
        topics: [
          "Replication: leader-follower, multi-leader, leaderless (Dynamo-style)",
          "Consensus algorithms: Raft, Paxos — how Kafka uses ZooKeeper/KRaft",
          "Consistent hashing — used in partitioning (Cassandra, Kafka)",
          "Bloom filters, HyperLogLog, Count-Min Sketch",
          "LSM trees vs B-trees (Cassandra vs Postgres storage engines)",
          "Vector clocks, event ordering in distributed logs",
          "Exactly-once delivery — why it's hard",
        ],
        resources: ["DDIA (chapters 5–9)", "Martin Kleppmann talks"],
      },
    ],
  },
];

const priorityColor = {
  "Critical": "#ff4d4d",
  "High": "#ff9933",
  "Medium-High": "#e6p800",
  "Medium": "#2eb85c",
};

export default function Roadmap() {
  const [expanded, setExpanded] = useState({ "0-0": true });
  const [completed, setCompleted] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add global body styles
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#050508";
    document.body.style.color = "#e2e8f0";
    document.body.style.fontFamily = "'DM Sans', sans-serif";
  }, []);

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleComplete = (key) => setCompleted(prev => ({ ...prev, [key]: !prev[key] }));

  const totalSections = roadmap.reduce((acc, t) => acc + t.sections.length, 0);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / totalSections) * 100);

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
      padding: "60px 20px",
    }}>
      {/* Background Orbs */}
      <div style={{
        position: "fixed",
        top: "-10%",
        right: "-10%",
        width: "50%",
        height: "50%",
        background: "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "fixed",
        bottom: "-10%",
        left: "-10%",
        width: "50%",
        height: "50%",
        background: "radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.5s ease out forwards;
        }
        .roadmap-card {
          backdrop-filter: blur(12px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .roadmap-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.5);
          border-color: rgba(255,255,255,0.15) !important;
        }
        .topic-pill {
          transition: background 0.2s ease;
        }
        .topic-pill:hover {
          background: rgba(255,255,255,0.08) !important;
        }
        @media (max-width: 768px) {
          .sections-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Header Section */}
        <header style={{ 
          marginBottom: 60, 
          textAlign: "center",
          background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.02))",
          padding: "40px",
          borderRadius: "32px",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <span style={{ fontSize: 48, filter: "drop-shadow(0 0 20px rgba(124, 58, 237, 0.3))" }}>🚀</span>
            <h1 style={{ 
              margin: 0, 
              fontSize: "clamp(2rem, 5vw, 3.5rem)", 
              fontWeight: 900, 
              letterSpacing: "-2px",
              background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Master Data Engineering
            </h1>
          </div>
          <p style={{ margin: "0 auto 32px", color: "#94a3b8", fontSize: "1.1rem", maxWidth: 600, lineHeight: 1.6 }}>
            The ultimate path for FAANG interviews. 
            Structured from fundamentals to architectural excellence.
          </p>

          {/* Progress Overview Section */}
          <div style={{ 
            maxWidth: 600, 
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.03)", 
            borderRadius: "20px", 
            padding: "24px", 
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", letterSpacing: "1px", textTransform: "uppercase" }}>Progress Tracking</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#a78bfa" }}>{completedCount} <span style={{ color: "#475569", fontSize: 14 }}>/ {totalSections} Tasks</span></span>
            </div>
            <div style={{ background: "#0d0d1a", borderRadius: 999, height: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                borderRadius: 999,
                transition: "width 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)"
              }} />
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#64748b", fontWeight: 500 }}>
               {progress}% of the roadmap conquered
            </div>
          </div>
        </header>

        {/* Roadmap Tiers */}
        {roadmap.map((tier, ti) => (
          <section key={ti} style={{ marginBottom: 80 }}>
            {/* Tier Header */}
            <div style={{
              display: "flex", 
              alignItems: "flex-end", 
              gap: 20, 
              marginBottom: 32,
              paddingLeft: 10
            }}>
              <div style={{
                background: tier.color,
                color: "#000",
                fontSize: 12,
                fontWeight: 900,
                padding: "6px 14px",
                borderRadius: "8px",
                boxShadow: `0 0 20px ${tier.color}33`
              }}>{tier.tier}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "#f1f5f9" }}>{tier.label}</h2>
                <div style={{ fontSize: "1rem", color: "#64748b", marginTop: 4 }}>{tier.subtitle}</div>
              </div>
            </div>

            {/* Sections Grid */}
            <div className="sections-grid" style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", 
              gap: 24 
            }}>
              {tier.sections.map((sec, si) => {
                const key = `${ti}-${si}`;
                const isOpen = expanded[key];
                const isDone = completed[key];

                return (
                  <div key={si} className="roadmap-card" style={{
                    background: isDone ? "rgba(46, 184, 92, 0.04)" : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${isDone ? "rgba(46, 184, 92, 0.2)" : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: 24,
                    overflow: "hidden",
                    opacity: isDone ? 0.8 : 1,
                  }}>
                    {/* Card Header */}
                    <div style={{
                      padding: "24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 18,
                    }} onClick={() => toggle(key)}>
                      <div style={{ 
                        fontSize: 32, 
                        background: "rgba(255,255,255,0.03)", 
                        padding: 12, 
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}>{sec.icon}</div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                           <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                            background: `${priorityColor[sec.priority]}22`,
                            color: priorityColor[sec.priority],
                            border: `1px solid ${priorityColor[sec.priority]}33`,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}>{sec.priority}</span>
                          <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>⏱ {sec.timeEstimate}</span>
                        </div>
                        <h3 style={{
                          margin: 0,
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: isDone ? "#a3cfbb" : "#f1f5f9",
                          textDecoration: isDone ? "line-through" : "none",
                        }}>{sec.title}</h3>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleComplete(key); }}
                        style={{
                          background: isDone ? "#2eb85c" : "rgba(255,255,255,0.03)",
                          border: `2px solid ${isDone ? "#2eb85c" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: "12px", width: 32, height: 32,
                          cursor: "pointer", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                        }}
                      >{isDone ? "✓" : ""}</button>
                    </div>

                    {/* Card Body */}
                    {isOpen && (
                      <div style={{ 
                        padding: "0 24px 24px", 
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        background: "rgba(0,0,0,0.2)"
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
                          {sec.topics.map((topic, idx) => (
                            <div key={idx} className="topic-pill" style={{
                              display: "flex", alignItems: "flex-start", gap: 12,
                              fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.5,
                              padding: "10px 14px",
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: "12px",
                              border: "1px solid rgba(255,255,255,0.03)"
                            }}>
                              <span style={{ color: tier.color, opacity: 0.6, marginTop: 2 }}>✦</span>
                              {topic}
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ 
                          marginTop: 20, 
                          paddingTop: 16, 
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          display: "flex", 
                          alignItems: "center", 
                          gap: 8, 
                          flexWrap: "wrap" 
                        }}>
                          <span style={{ fontSize: 10, color: "#475569", fontWeight: 800, letterSpacing: "1px" }}>RESOURCES:</span>
                          {sec.resources.map((r, i) => (
                            <span key={i} style={{
                              fontSize: 11, background: "rgba(124, 58, 237, 0.1)", color: "#a78bfa",
                              padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(124, 58, 237, 0.2)"
                            }}>{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Footer Advice */}
        <footer style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.05))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 32, 
          padding: "40px",
          textAlign: "center"
        }}>
          <h4 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: 16, color: "#fff" }}>💡 Study Strategy</h4>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: 24,
            textAlign: "left"
          }}>
            {[
              { phase: "Months 1–2", task: "SQL Mastery + Python + Start DSA" },
              { phase: "Months 3–4", task: "Spark + Kafka + Airflow + Cloud" },
              { phase: "Months 5–6", task: "Modeling + Lakehouse + Systems" },
              { phase: "Phase 7+", task: "Mock Interviews & Portfolio" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ color: "#a78bfa", fontWeight: 900, fontSize: 12, marginBottom: 8, textTransform: "uppercase" }}>{p.phase}</div>
                <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500, lineHeight: 1.4 }}>{p.task}</div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
