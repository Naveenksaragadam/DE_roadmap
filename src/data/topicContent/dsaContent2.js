// DSA for DE — Topics 6-11
export const dsaContent2 = {
  'dsa-6': {
    tutorial: {
      explanation: [
        'Bloom filters are space-efficient probabilistic data structures that test set membership. They can say "definitely not in set" (no false negatives) or "probably in set" (possible false positives). Used in databases, caches, and data pipelines to avoid expensive lookups.',
      ],
      codeExamples: [
        { description: 'Implementing a simple Bloom filter', code: `import hashlib, math

class BloomFilter:
    def __init__(self, capacity, error_rate=0.01):
        self.size = int(-capacity * math.log(error_rate) / (math.log(2) ** 2))
        self.num_hashes = int(self.size / capacity * math.log(2))
        self.bits = [False] * self.size

    def _hashes(self, item):
        for i in range(self.num_hashes):
            h = int(hashlib.md5(f"{item}{i}".encode()).hexdigest(), 16)
            yield h % self.size

    def add(self, item):
        for pos in self._hashes(item):
            self.bits[pos] = True

    def __contains__(self, item):
        return all(self.bits[pos] for pos in self._hashes(item))

# Use case: skip records already processed
processed = BloomFilter(1_000_000)
for record in new_batch:
    if record['id'] not in processed:  # fast check, no DB query
        process(record)
        processed.add(record['id'])` },
      ],
      keyTakeaways: [
        'Bloom filter: "definitely not" or "maybe yes" — no false negatives',
        'Space efficient: a few MB can represent millions of items',
        'Use in DE: deduplication, cache lookups, pre-filtering before expensive joins',
        'Libraries: pybloom_live, bitarray — don\'t implement from scratch in production',
      ],
    },
    crashCourse: {
      summary: 'Bloom filters test set membership probabilistically: no false negatives, possible false positives. Space-efficient for millions of items.',
      quickFacts: ['No false negatives: if Bloom says "no", it\'s definitely no', 'Possible false positives: if Bloom says "yes", it might be wrong', 'Space: much smaller than a set/dict', 'Use: dedup, cache checks, pre-filtering'],
      tips: ['Cassandra, HBase, and Spark use Bloom filters internally for partition pruning'],
    },
  },
  'dsa-7': {
    tutorial: {
      explanation: [
        'Consistent hashing distributes data across nodes so that adding/removing a node only redistributes ~1/N of the keys. Traditional modulo hashing (key % N) redistributes nearly everything when N changes. This is used in distributed caches, Kafka partitioning, and data sharding.',
      ],
      codeExamples: [
        { description: 'Consistent hashing for data partitioning', code: `import hashlib
from bisect import bisect_right

class ConsistentHash:
    def __init__(self, nodes, virtual_nodes=100):
        self.ring = []
        self.node_map = {}
        for node in nodes:
            for i in range(virtual_nodes):
                h = self._hash(f"{node}:{i}")
                self.ring.append(h)
                self.node_map[h] = node
        self.ring.sort()

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def get_node(self, key):
        h = self._hash(key)
        idx = bisect_right(self.ring, h) % len(self.ring)
        return self.node_map[self.ring[idx]]

# Adding a node only moves ~1/N of keys
ch = ConsistentHash(["node1", "node2", "node3"])
target = ch.get_node("user_12345")` },
      ],
      keyTakeaways: [
        'Modulo hashing: key % N — adding a node reshuffles almost everything',
        'Consistent hashing: only ~1/N keys move when adding/removing nodes',
        'Virtual nodes: prevent uneven distribution — each physical node has ~100 virtual points',
        'Used by: Kafka, Cassandra, Redis Cluster, DynamoDB for partitioning',
      ],
    },
    crashCourse: {
      summary: 'Consistent hashing distributes keys across nodes on a virtual ring. Adding/removing a node only moves ~1/N keys instead of reshuffling everything.',
      quickFacts: ['Modulo hash: key%N — almost all keys move on resize', 'Consistent hash: ~1/N keys move on resize', 'Virtual nodes: 100+ per physical node for balance', 'Ring-based: keys assigned to nearest clockwise node'],
      tips: ['Always mention consistent hashing in system design for distributed data stores'],
    },
  },
  'dsa-8': {
    tutorial: {
      explanation: [
        'Encoding and serialization convert data between formats. Serialization: Python objects → bytes (for storage/transmission). Encoding: text → specific byte representation. In DE, you serialize data for Kafka, caches, and inter-process communication.',
        'Common formats: JSON (human-readable, slow), Protobuf/Avro (binary, schema, fast), Pickle (Python-specific, insecure), MessagePack (binary JSON, fast). For production DE: Avro or Protobuf.',
      ],
      codeExamples: [
        { description: 'Serialization formats compared', code: `import json, pickle, msgpack

data = {"user_id": 12345, "event": "purchase", "amount": 99.99}

# JSON: human-readable, universal, slow
json_bytes = json.dumps(data).encode()  # 60 bytes

# MessagePack: binary JSON, 2-5x faster
msgpack_bytes = msgpack.packb(data)  # 40 bytes

# Pickle: Python-only, NEVER use for untrusted data
pickle_bytes = pickle.dumps(data)  # 80 bytes

# Avro: schema-aware, compact, Kafka standard
import fastavro
from io import BytesIO
schema = {"type": "record", "name": "Event", "fields": [
    {"name": "user_id", "type": "int"},
    {"name": "event", "type": "string"},
    {"name": "amount", "type": "double"},
]}
buf = BytesIO()
fastavro.schemaless_writer(buf, schema, data)  # ~15 bytes` },
      ],
      keyTakeaways: [
        'JSON: universal, human-readable, but slow and verbose — fine for APIs and config',
        'Avro/Protobuf: binary, schema-enforced, compact — use for Kafka and data pipelines',
        'MessagePack: binary JSON without schema — fast, simple, good for caching',
        'NEVER use Pickle with untrusted data — it can execute arbitrary code on deserialization',
      ],
    },
    crashCourse: {
      summary: 'Avro/Protobuf for production pipelines (schema, compact, fast). JSON for APIs. MessagePack for caching. Never Pickle with untrusted data.',
      quickFacts: ['JSON: ~60B, human-readable', 'MessagePack: ~40B, binary JSON', 'Avro: ~15B, schema-required', 'Protobuf: ~12B, schema-required, fastest'],
      tips: ['Kafka + Avro + Schema Registry is the gold standard for event streaming'],
    },
  },
  'dsa-9': {
    tutorial: {
      explanation: [
        'Partitioning and sharding distribute data across nodes for parallelism. Hash partitioning distributes evenly but doesn\'t support range queries. Range partitioning enables range scans but can create hotspots. List partitioning groups by category.',
      ],
      codeExamples: [
        { description: 'Partitioning strategies', code: `# Hash partitioning: even distribution
def hash_partition(key, num_partitions):
    return hash(key) % num_partitions

# Range partitioning: good for time-series
def range_partition(date, boundaries):
    for i, boundary in enumerate(boundaries):
        if date < boundary:
            return i
    return len(boundaries)

# Composite partitioning (Spark-style)
# Partition by date THEN hash within each date partition
def composite_partition(record, num_buckets):
    date_part = record['date'].strftime('%Y-%m-%d')
    hash_part = hash(record['user_id']) % num_buckets
    return f"{date_part}/bucket_{hash_part}"` },
      ],
      keyTakeaways: [
        'Hash: even distribution, no range queries — good for OLTP, Kafka',
        'Range: supports range scans, risk of hotspots — good for time-series data',
        'List: group by category — good for geographic or categorical data',
        'Composite: combine strategies (date range + hash) — best of both worlds',
      ],
    },
    crashCourse: {
      summary: 'Hash for even distribution, range for time-series and range scans, list for categories. Composite (date + hash) gives best balance.',
      quickFacts: ['Hash: key % N partitions — even, no range support', 'Range: date boundaries — range scans, risk of hotspots', 'List: explicit category → partition mapping', 'Spark: hashpartitioning by default, repartition to control'],
      tips: ['Partition by date for time-series data, then cluster by frequently filtered columns'],
    },
  },
  'dsa-10': {
    tutorial: {
      explanation: [
        'Sliding window algorithms process a stream of data maintaining a fixed-size or condition-based window. Sessionization groups events into sessions based on idle time gaps. Both are fundamental for user behavior analysis in DE.',
      ],
      codeExamples: [
        { description: 'Sliding window and sessionization', code: `from collections import deque
from datetime import timedelta

# Sliding window: count events in last 5 minutes
class SlidingWindowCounter:
    def __init__(self, window_size_seconds=300):
        self.window = deque()
        self.window_size = timedelta(seconds=window_size_seconds)

    def add_event(self, timestamp):
        self.window.append(timestamp)
        self._evict(timestamp)

    def _evict(self, current_time):
        while self.window and current_time - self.window[0] > self.window_size:
            self.window.popleft()

    def count(self):
        return len(self.window)

# Sessionization: group events into sessions with 30-min idle gap
def sessionize(events, gap_minutes=30):
    sessions = []
    current_session = [events[0]]
    for event in events[1:]:
        if (event['ts'] - current_session[-1]['ts']).total_seconds() > gap_minutes * 60:
            sessions.append(current_session)
            current_session = [event]
        else:
            current_session.append(event)
    sessions.append(current_session)
    return sessions` },
      ],
      keyTakeaways: [
        'Sliding window: fixed-size view over a stream — count, sum, average in window',
        'Tumbling window: non-overlapping fixed intervals (e.g., every 5 minutes)',
        'Session window: variable length, closed by inactivity gap',
        'deque: perfect for implementing sliding windows — O(1) append and popleft',
      ],
    },
    crashCourse: {
      summary: 'Sliding windows process streams with fixed-size views. Session windows group by idle gaps. Tumbling windows are non-overlapping intervals.',
      quickFacts: ['Sliding: overlapping (e.g., last 5 min, updated every 1 min)', 'Tumbling: non-overlapping (e.g., every 5 min)', 'Session: variable length, gap-based', 'deque: O(1) operations for window management'],
      tips: ['SQL equivalent: SUM(x) OVER (ORDER BY ts ROWS BETWEEN 5 PRECEDING AND CURRENT ROW)'],
    },
  },
  'dsa-11': {
    tutorial: {
      explanation: [
        'HyperLogLog (HLL) estimates cardinality (count distinct) using logarithmic space. Count-Min Sketch estimates frequency counts. Both are probabilistic — trading exact answers for massive memory savings on huge datasets.',
      ],
      codeExamples: [
        { description: 'Probabilistic data structures in practice', code: `# HyperLogLog — estimate unique visitors
# Redis: PFADD, PFCOUNT (built-in HLL)
# Python simulation:
import hashlib

class SimpleHLL:
    def __init__(self, precision=14):
        self.m = 2 ** precision
        self.registers = [0] * self.m

    def add(self, item):
        h = int(hashlib.sha256(item.encode()).hexdigest(), 16)
        idx = h & (self.m - 1)
        remaining = h >> 14
        self.registers[idx] = max(self.registers[idx], self._trailing_zeros(remaining) + 1)

    def _trailing_zeros(self, n):
        if n == 0: return 64
        count = 0
        while (n & 1) == 0: count += 1; n >>= 1
        return count

    def count(self):
        alpha = 0.7213 / (1 + 1.079 / self.m)
        raw = alpha * self.m ** 2 / sum(2 ** -r for r in self.registers)
        return int(raw)

# Typical error: ~1.6% with 16KB memory — vs exact set needing GBs for billions of items` },
      ],
      keyTakeaways: [
        'HyperLogLog: estimate unique count with ~2% error using 12KB memory',
        'Count-Min Sketch: estimate frequency with bounded over-count error',
        'Redis has built-in HLL: PFADD key "item", PFCOUNT key → approximate distinct count',
        'BigQuery approx_count_distinct() uses HLL internally — 10x faster than exact COUNT(DISTINCT)',
      ],
    },
    crashCourse: {
      summary: 'HyperLogLog estimates distinct counts (12KB for billions of items, ~2% error). Count-Min Sketch estimates frequencies. Use for analytics at scale.',
      quickFacts: ['HLL: ~2% error, 12KB memory for any dataset size', 'CMS: bounded frequency over-estimates', 'Redis PFCOUNT: built-in HLL', 'BigQuery APPROX_COUNT_DISTINCT: HLL under the hood'],
      tips: ['When an interviewer says "count unique users across billions of events," say HyperLogLog'],
    },
  },
};
