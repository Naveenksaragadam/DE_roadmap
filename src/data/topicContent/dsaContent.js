// Data Structures & Algorithms for DE — Topic Deep-Dive Content
export const dsaContent = {
  'dsa-0': {
    tutorial: {
      explanation: [
        'Hash maps (dictionaries in Python) are the most used data structure in DE. They provide O(1) average lookup, insert, and delete. Use cases: deduplication, counting, grouping, caching, and building lookup tables.',
        'Sets are hash maps without values — O(1) membership testing. Critical for: deduplication, finding intersections/differences between datasets, and bloom filter approximations.',
      ],
      codeExamples: [
        { description: 'Hash maps and sets in DE pipelines', code: `# Deduplication with set
seen_ids = set()
unique_records = []
for record in stream:
    if record['id'] not in seen_ids:
        seen_ids.add(record['id'])
        unique_records.append(record)

# Building a lookup table (dimension → fact enrichment)
dim_customers = {c['id']: c for c in customer_records}
enriched = [{**order, 'customer_name': dim_customers.get(order['cust_id'], {}).get('name', 'Unknown')}
            for order in orders]

# Counter for frequency analysis
from collections import Counter
event_counts = Counter(e['type'] for e in events)
top_10 = event_counts.most_common(10)` },
      ],
      keyTakeaways: [
        'dict: O(1) lookup — use for enrichment joins, deduplication, caching',
        'set: O(1) membership — use for filtering, dedup, set operations',
        'collections.Counter: frequency counting in one line',
        'defaultdict: auto-initializes missing keys — great for grouping',
        'Hash collisions degrade to O(n) — rare in practice but know it exists',
      ],
    },
    crashCourse: {
      summary: 'Hash maps (dict) for O(1) lookups and enrichment. Sets for deduplication and membership testing. Counter for frequencies. defaultdict for grouping.',
      quickFacts: ['dict: O(1) avg lookup/insert/delete', 'set: O(1) membership test, O(n) union/intersection', 'Counter.most_common(n): top-N in one call', 'defaultdict(list): auto-creates empty list for new keys'],
      tips: ['When joining small datasets in Python, build a dict from the smaller side — mimics a hash join'],
    },
  },
  'dsa-1': {
    tutorial: {
      explanation: [
        'Sorting is fundamental to DE: merge-sort for external sorting (data larger than memory), partition-based sorting for distributed systems, and understanding sort stability matters when deterministic output is required.',
        'External sort: split file into chunks that fit in memory, sort each chunk, merge sorted chunks. This is how Spark performs shuffles internally.',
      ],
      codeExamples: [
        { description: 'Sorting patterns for DE', code: `# Key-based sorting with stability
records = [{'name': 'Alice', 'dept': 'Eng'}, {'name': 'Bob', 'dept': 'Eng'}, {'name': 'Charlie', 'dept': 'Sales'}]
# Stable sort: equal elements keep original order
sorted_recs = sorted(records, key=lambda r: r['dept'])

# Multi-key sort
sorted_recs = sorted(records, key=lambda r: (r['dept'], r['name']))

# Merge K sorted streams (merge step of external sort)
import heapq
def merge_sorted_files(file_paths):
    streams = [open(f) for f in file_paths]
    for line in heapq.merge(*[iter_sorted(s) for s in streams]):
        yield line  # produces globally sorted output` },
      ],
      keyTakeaways: [
        'Python sorted() is Timsort — O(n log n), stable, great for nearly-sorted data',
        'External sort: split → sort chunks → merge — used by every distributed system',
        'heapq.merge(): merges pre-sorted iterables efficiently — perfect for merge step',
        'Sort stability matters: stable sorts preserve original order for equal elements',
      ],
    },
    crashCourse: {
      summary: 'Timsort (Python default) is O(n log n) and stable. External sort splits, sorts chunks, merges — this is how Spark shuffles work. heapq.merge for merging sorted streams.',
      quickFacts: ['sorted(): stable, O(n log n) Timsort', 'heapq.merge(): merge K sorted iterables', 'key=lambda: custom sort criteria', 'External sort: when data > memory'],
      tips: ['Use operator.itemgetter() instead of lambda for slightly faster key functions'],
    },
  },
  'dsa-2': {
    tutorial: {
      explanation: [
        'Trees in DE: B-Trees power database indexes (balanced, sorted, logarithmic lookup). Tries (prefix trees) are used for autocomplete and string matching. Binary trees appear in expression evaluation and query plan optimization.',
        'Understanding B-Tree structure helps you reason about index performance: each node holds multiple keys, keeping the tree shallow even for millions of records.',
      ],
      codeExamples: [
        { description: 'Trie for efficient string operations', code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
        self.count = 0

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
        node.count += 1

    def search_prefix(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        return self._collect(node, prefix)

# Use case: autocomplete for search queries in analytics` },
      ],
      keyTakeaways: [
        'B-Tree: database indexes, O(log n) lookup, wide nodes keep tree shallow',
        'Trie: O(k) lookup where k is key length — autocomplete, IP routing',
        'Binary heaps: priority queues for Top-K problems — O(log n) insert/extract',
        'Expression trees: how SQL engines parse and optimize queries internally',
      ],
    },
    crashCourse: {
      summary: 'B-Trees power database indexes (balanced, multi-key nodes). Tries for prefix matching. Heaps for priority queues and Top-K. Expression trees for query parsing.',
      quickFacts: ['B-Tree: O(log n) lookup, wide nodes, used in all RDBMS indexes', 'Trie: O(key_length) lookup, autocomplete', 'Heap: O(1) min/max, O(log n) insert/extract', 'heapq module: Python min-heap implementation'],
      tips: ['When an interviewer asks about index internals, explain B-Tree structure and why depth matters'],
    },
  },
  'dsa-3': {
    tutorial: {
      explanation: [
        'Graphs are everywhere in DE: DAGs (Directed Acyclic Graphs) model pipeline dependencies, topological sort determines execution order, and BFS/DFS traverse data lineage. Understanding graph algorithms helps you build and debug orchestration systems.',
      ],
      codeExamples: [
        { description: 'Topological sort for DAG dependencies', code: `from collections import defaultdict, deque

def topological_sort(tasks):
    """Determine execution order for dependent tasks."""
    graph = defaultdict(list)
    in_degree = defaultdict(int)
    all_nodes = set()

    for task, deps in tasks.items():
        all_nodes.add(task)
        for dep in deps:
            graph[dep].append(task)
            in_degree[task] += 1
            all_nodes.add(dep)

    queue = deque(n for n in all_nodes if in_degree[n] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(all_nodes):
        raise ValueError("Cycle detected!")
    return order

# Pipeline DAG
tasks = {'transform': ['extract'], 'load': ['transform'], 'extract': [], 'report': ['load']}
print(topological_sort(tasks))  # ['extract', 'transform', 'load', 'report']` },
      ],
      keyTakeaways: [
        'DAG: directed graph with no cycles — every pipeline orchestrator uses this',
        'Topological sort: O(V+E), determines valid execution order',
        'BFS (queue): level-order traversal, shortest path in unweighted graphs',
        'DFS (stack/recursion): explore deeply first, cycle detection, connected components',
        'Cycle detection in DAGs: if topological sort doesn\'t include all nodes, there\'s a cycle',
      ],
    },
    crashCourse: {
      summary: 'DAGs model pipeline dependencies. Topological sort determines execution order. BFS/DFS traverse data lineage. Cycle detection prevents infinite loops.',
      quickFacts: ['DAG: Directed Acyclic Graph — no cycles allowed', 'Topological sort: O(V+E) using Kahn\'s algorithm (BFS + in-degree)', 'BFS: use deque, level-order', 'DFS: use recursion or explicit stack'],
      tips: ['Airflow, dbt, and Spark all use topological sort internally — understanding it helps debug dependency issues'],
    },
  },
  'dsa-4': {
    tutorial: {
      explanation: [
        'Queues and stacks are fundamental for pipeline processing patterns. Queues (FIFO) model message processing, task scheduling, and BFS. Stacks (LIFO) model undo operations, expression parsing, and DFS. Priority queues (heaps) process items by priority.',
      ],
      codeExamples: [
        { description: 'Queue patterns in data pipelines', code: `from collections import deque
import heapq

# FIFO Queue for processing events in order
event_queue = deque()
event_queue.append(event)     # enqueue O(1)
next_event = event_queue.popleft()  # dequeue O(1)

# Priority Queue for processing high-priority events first
priority_queue = []
heapq.heappush(priority_queue, (1, 'critical_alert'))  # lower = higher priority
heapq.heappush(priority_queue, (5, 'info_log'))
_, item = heapq.heappop(priority_queue)  # returns 'critical_alert'

# Stack for bracket matching in schema validation
def validate_json_brackets(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in '([{':
            stack.append(char)
        elif char in ')]}':
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    return len(stack) == 0` },
      ],
      keyTakeaways: [
        'deque: O(1) append/popleft — use for FIFO queues (not list!)',
        'heapq: min-heap for priority queues — O(log n) push/pop',
        'Stack (list): append/pop from end — LIFO for DFS, parsing, undo',
        'list.pop(0) is O(n) — always use deque for queue operations',
      ],
    },
    crashCourse: {
      summary: 'deque for FIFO queues (O(1) both ends). heapq for priority queues. list as stack (append/pop). Never use list.pop(0) — it\'s O(n).',
      quickFacts: ['deque: O(1) appendleft/popleft', 'heapq: min-heap, negate for max-heap', 'Stack: list.append() + list.pop()', 'Queue.Queue: thread-safe for concurrent pipelines'],
      tips: ['For Top-K problems: maintain a heap of size K — O(n log k) total'],
    },
  },
  'dsa-5': {
    tutorial: {
      explanation: [
        'Big-O notation describes algorithm scalability. In DE, it matters because you process millions/billions of records. An O(n²) algorithm that works on 1K records will take 1000x longer on 1M records — potentially going from 1 second to 11 days.',
      ],
      codeExamples: [
        { description: 'Common complexity examples in DE', code: `# O(1) — constant: dict lookup, hash check
is_bot = ip in bot_ip_set

# O(log n) — logarithmic: binary search, B-tree index lookup
import bisect
pos = bisect.bisect_left(sorted_list, target)

# O(n) — linear: single pass through data
total = sum(r['amount'] for r in records)

# O(n log n) — sort, most efficient comparison sort
sorted_records = sorted(records, key=lambda r: r['date'])

# O(n²) — AVOID: nested loops for joins
# BAD: for a in big_table: for b in small_table: if a.key == b.key: ...
# GOOD: build dict from small table, single pass through big table` },
      ],
      keyTakeaways: [
        'O(1): hash lookups, array index → always the goal for hot paths',
        'O(log n): binary search, tree lookups → 20 steps for 1 million items',
        'O(n): single pass → acceptable for most DE workloads',
        'O(n log n): sorting → usually necessary, rarely a bottleneck',
        'O(n²): nested loops → AVOID at all costs on large datasets',
        'Space complexity matters too: generators use O(1) memory vs lists using O(n)',
      ],
    },
    crashCourse: {
      summary: 'Big-O describes how runtime grows with input size. In DE: O(1) for lookups, O(n) for processing, avoid O(n²) at all costs. Space complexity matters for large datasets.',
      quickFacts: ['O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)', 'n=1M: O(n²) = 1 trillion operations', 'Hash join: O(n+m) vs nested loop join: O(n*m)', 'Generators: O(1) space, lists: O(n) space'],
      tips: ['If an interviewer asks for optimization, look for nested loops first — converting to hash-based is the most common fix'],
    },
  },
};
