// Linux & Shell Scripting — Topic Deep-Dive Content
export const linuxContent = {
  'linux-shell-0': {
    tutorial: {
      explanation: [
        'Bash is the default shell on most Linux systems. Core concepts: variables, conditionals, loops, and functions. Shebang (#!/bin/bash) tells the OS which interpreter to use. Exit codes: 0 = success, non-zero = error.',
        'For DE, shell scripts automate: cron-based data pulls, file processing, log rotation, environment setup, and deployment tasks. Every DE should be comfortable writing bash scripts.',
      ],
      codeExamples: [
        { description: 'Bash scripting essentials', code: `#!/bin/bash
set -euo pipefail  # exit on error, undefined vars, pipe failures

# Variables and conditionals
DATE=$(date +%Y-%m-%d)
DATA_DIR="/data/raw/$DATE"

if [ ! -d "$DATA_DIR" ]; then
    mkdir -p "$DATA_DIR"
    echo "Created: $DATA_DIR"
fi

# Functions with return values
process_file() {
    local file="$1"
    local count=$(wc -l < "$file")
    echo "Processed $file: $count lines"
    return 0
}

# Loop over files
for file in "$DATA_DIR"/*.csv; do
    [ -e "$file" ] || continue  # skip if no matches
    process_file "$file"
done

echo "Pipeline completed for $DATE"` },
      ],
      keyTakeaways: [
        'set -euo pipefail: always use this — catches errors immediately',
        '$() for command substitution, ${VAR} for variable expansion',
        'Quote variables: "$VAR" prevents word splitting and glob expansion',
        'Exit codes: check with $?, success = 0, error = non-zero',
        'Functions: local keyword scopes variables, $1/$2 are arguments',
      ],
    },
    crashCourse: {
      summary: 'Bash automates DE tasks: data pulls, file processing, cron jobs. Always use set -euo pipefail. Quote variables. Check exit codes.',
      quickFacts: ['set -e: exit on error', 'set -u: error on undefined vars', 'set -o pipefail: fail if any pipe command fails', '$?: last exit code', '$(cmd): command substitution'],
      tips: ['Use shellcheck (linter) on every bash script before deploying — catches common bugs'],
    },
  },
  'linux-shell-1': {
    tutorial: {
      explanation: [
        'The text processing trinity: grep (search), sed (transform), awk (process). These tools process files line-by-line with O(1) memory — perfect for multi-GB files where loading into Python would be impractical.',
      ],
      codeExamples: [
        { description: 'grep, sed, awk for data processing', code: `# grep: search patterns in files
grep -r "ERROR" /var/log/pipeline/  # recursive search
grep -c "ERROR" app.log             # count matches
grep -P '\\d{4}-\\d{2}-\\d{2}' data.csv  # Perl regex for dates

# sed: stream editor for transforms
sed 's/old/new/g' file.txt           # replace all occurrences
sed -n '10,20p' file.txt             # print lines 10-20
sed '/^$/d' file.txt                 # delete empty lines

# awk: column-based processing
awk -F',' '{print $1, $3}' data.csv  # extract columns 1 and 3
awk -F',' '{sum+=$3} END {print sum}' data.csv  # sum column 3
awk -F',' '$3 > 1000 {print}' data.csv  # filter rows` },
      ],
      keyTakeaways: [
        'grep -r: recursive search, -i: case insensitive, -c: count, -P: Perl regex',
        'sed s/old/new/g: global replace, -i: in-place edit, -n: suppress auto-print',
        'awk -F: set delimiter, $1/$2: column access, NR: line number, END: final summary',
        'Chain them: grep "ERROR" log.txt | awk \'{print $4}\' | sort | uniq -c | sort -rn',
      ],
    },
    crashCourse: {
      summary: 'grep for searching, sed for transforming, awk for column-based processing. All stream O(1) memory — handle multi-GB files easily.',
      quickFacts: ['grep: search | sed: transform | awk: process columns', 'awk -F"," \'{print $1}\': CSV column extraction', 'sort | uniq -c | sort -rn: frequency analysis', 'xargs: convert stdin to arguments for other commands'],
      tips: ['Learn awk well — it\'s incredibly powerful for quick data analysis on the command line'],
    },
  },
  'linux-shell-2': {
    tutorial: {
      explanation: [
        'Pipes (|) connect stdout of one command to stdin of the next, creating processing pipelines. Redirections send output to files (> creates, >> appends, 2> for stderr). Process substitution <() feeds command output as a file.',
      ],
      codeExamples: [
        { description: 'Pipes and redirections for data pipelines', code: `# Multi-step pipe: extract, transform, aggregate
cat raw_data.csv | \\
    grep -v "^#" |           # remove comments
    awk -F',' '$5 > 100' |   # filter by column 5
    sort -t',' -k3 |         # sort by column 3
    cut -d',' -f1,3,5 > cleaned.csv  # select columns

# Redirect stderr separately
python etl.py 2>errors.log 1>output.log

# Process substitution: compare two command outputs
diff <(sort file1.txt) <(sort file2.txt)

# tee: split output to file AND stdout
cat data.csv | tee raw_backup.csv | python transform.py` },
      ],
      keyTakeaways: [
        '|: pipe stdout → stdin — the core of Unix philosophy',
        '>: redirect to file (overwrite), >>: append, 2>: stderr',
        '<(): process substitution — treat command output as a file',
        'tee: duplicate output to file and pipe — great for logging and backup',
      ],
    },
    crashCourse: {
      summary: 'Pipes (|) chain commands. > overwrites, >> appends, 2> for stderr. tee splits to file and stdout. Process substitution <() for treating output as files.',
      quickFacts: ['cmd1 | cmd2: pipe stdout to stdin', '> file: overwrite, >> file: append', '2>&1: merge stderr into stdout', '<(cmd): treat command output as file path'],
      tips: ['Use set -o pipefail to catch errors in any pipe stage, not just the last'],
    },
  },
  'linux-shell-3': {
    tutorial: {
      explanation: [
        'File system navigation and management: ls, find, du, df for discovery; chmod, chown for permissions; ln for links; lsof for open files. Understanding file permissions (rwx user/group/other) is essential for securing data pipelines.',
      ],
      codeExamples: [
        { description: 'File system operations for DE', code: `# Find large files (data cleanup)
find /data -name "*.parquet" -size +1G -mtime +30 -ls

# Disk usage by directory
du -sh /data/*/  | sort -rh | head -10

# File permissions (rwx = read/write/execute)
chmod 750 pipeline.sh    # owner: rwx, group: rx, others: none
chmod -R 644 /data/raw/  # recursive: files readable by all

# Monitor what's using a file
lsof /data/pipeline.lock

# Watch a file grow in real-time (useful for monitoring logs)
tail -f /var/log/pipeline.log

# Create directory structure for a data lake
mkdir -p /data/{raw,staging,curated}/{2024,2025}/{01..12}` },
      ],
      keyTakeaways: [
        'find: powerful file discovery — filter by name, size, date, type',
        'du -sh: human-readable directory sizes, df -h: filesystem disk usage',
        'chmod: change permissions (755 for scripts, 644 for data, 600 for secrets)',
        'tail -f: follow log files in real-time — essential for monitoring pipelines',
      ],
    },
    crashCourse: {
      summary: 'find for file discovery, du/df for disk, chmod for permissions, tail -f for monitoring. Use brace expansion for creating directory structures.',
      quickFacts: ['find . -name "*.py" -mtime -7: Python files modified in last week', 'du -sh */: size of each subdirectory', 'chmod 755: rwx for owner, rx for others', 'tail -f: follow file, tail -n 100: last 100 lines'],
      tips: ['Use ncdu for interactive disk usage analysis — much better than du for exploring'],
    },
  },
  'linux-shell-4': {
    tutorial: {
      explanation: [
        'Cron and systemd automate recurring pipeline runs. Cron expressions define schedules (minute, hour, day, month, weekday). systemd timers are the modern alternative with better logging and dependency management.',
      ],
      codeExamples: [
        { description: 'Cron scheduling', code: `# Cron expression format:
# MIN HOUR DOM MON DOW command
# *   *    *   *   *

# Examples:
# 0 5 * * *     — daily at 5:00 AM
# */15 * * * *  — every 15 minutes
# 0 0 1 * *    — first day of each month at midnight
# 0 2 * * 1-5  — weekdays at 2:00 AM

# Edit crontab
crontab -e

# Add a pipeline job
0 5 * * * /opt/pipelines/daily_etl.sh >> /var/log/etl.log 2>&1

# Always:
# 1. Use full paths (cron has minimal PATH)
# 2. Redirect output to log files
# 3. Set MAILTO for failure notifications
# 4. Use flock to prevent overlapping runs
0 5 * * * flock -n /tmp/etl.lock /opt/pipelines/daily_etl.sh` },
      ],
      keyTakeaways: [
        'Cron format: minute hour day-of-month month day-of-week',
        'Use flock to prevent overlapping runs of the same job',
        'Always redirect both stdout and stderr: >> log 2>&1',
        'Use full absolute paths — cron has a minimal environment',
        'Modern alternative: Airflow for complex orchestration, cron for simple scripts',
      ],
    },
    crashCourse: {
      summary: 'Cron automates recurring tasks with 5-field schedule expressions. Use flock for locking, full paths, and redirect output. Airflow replaces cron for complex pipelines.',
      quickFacts: ['*/5 * * * *: every 5 minutes', '0 5 * * *: daily at 5 AM', 'crontab -l: list jobs', 'flock -n lockfile cmd: prevent overlapping runs'],
      tips: ['Use crontab.guru to verify cron expressions before deploying'],
    },
  },
  'linux-shell-5': {
    tutorial: {
      explanation: [
        'Process management is critical for monitoring and controlling pipeline jobs. ps/top show running processes, kill sends signals, nohup/screen/tmux keep processes running after disconnection.',
      ],
      codeExamples: [
        { description: 'Process management commands', code: `# View processes
ps aux | grep python           # find Python processes
top -o %MEM                    # sort by memory usage
htop                           # interactive process viewer

# Background and foreground
python long_job.py &           # run in background
jobs                           # list background jobs
fg %1                          # bring job 1 to foreground

# Keep running after disconnect
nohup python etl.py > output.log 2>&1 &
# Or use tmux (better)
tmux new -s pipeline
python etl.py  # Ctrl+B, D to detach, tmux attach -t pipeline to reconnect

# Kill processes
kill -SIGTERM 12345            # graceful shutdown
kill -SIGKILL 12345            # force kill (last resort)
pkill -f "python etl.py"      # kill by command pattern` },
      ],
      keyTakeaways: [
        'ps aux: snapshot of all processes, top/htop: real-time monitoring',
        'nohup or tmux: keep jobs running after SSH disconnection',
        'SIGTERM (15): graceful shutdown, SIGKILL (9): force kill',
        'pkill -f: kill by command pattern — more precise than kill by PID',
        'lsof -i :8080: find what process is using a port',
      ],
    },
    crashCourse: {
      summary: 'ps/top for monitoring, nohup/tmux for persistence, kill for signals. Use SIGTERM first (graceful), SIGKILL as last resort.',
      quickFacts: ['ps aux: all processes', 'kill -15: graceful (SIGTERM)', 'kill -9: force (SIGKILL)', 'nohup cmd &: survive logout', 'tmux: terminal multiplexer'],
      tips: ['Always use tmux for long-running SSH jobs — if your connection drops, the job survives'],
    },
  },
  'linux-shell-6': {
    tutorial: {
      explanation: [
        'Networking tools help debug data pipeline connectivity: curl/wget for HTTP requests, netstat/ss for connections, nc (netcat) for testing ports, and tcpdump/ngrep for packet inspection.',
      ],
      codeExamples: [
        { description: 'Network debugging', code: `# Test API endpoints
curl -s https://api.example.com/health | jq '.'
curl -X POST -H "Content-Type: application/json" -d '{"key":"val"}' url

# Check what's listening on ports
ss -tlnp                       # TCP listening sockets with PIDs
lsof -i :5432                  # what process uses port 5432

# Test connectivity
nc -zv hostname 5432           # test if Postgres port is open
ping -c 3 database.internal    # network reachability

# DNS resolution
dig +short api.example.com
nslookup database.internal` },
      ],
      keyTakeaways: [
        'curl -s | jq: API testing and JSON parsing from command line',
        'ss -tlnp: see all listening TCP ports and their processes',
        'nc -zv host port: quick connectivity test to remote services',
        'dig/nslookup: DNS resolution debugging',
      ],
    },
    crashCourse: {
      summary: 'curl for HTTP, ss/lsof for ports, nc for connectivity tests, dig for DNS. Essential for debugging pipeline connection issues.',
      quickFacts: ['curl -s: silent mode (no progress bar)', 'jq .: pretty-print JSON', 'ss -tlnp: TCP listeners', 'nc -zv host port: port connectivity test'],
      tips: ['When a pipeline can\'t connect, check in order: DNS → port → firewall → auth'],
    },
  },
  'linux-shell-7': {
    tutorial: {
      explanation: [
        'Environment variables configure pipelines without hardcoding values. .env files store project-specific vars. export makes vars available to child processes. ~/.bashrc and ~/.zshrc set persistent vars.',
      ],
      codeExamples: [
        { description: 'Environment variable management', code: `# Setting variables
export DB_HOST="prod-db.internal"
export DB_PASSWORD=$(cat /run/secrets/db_pass)

# .env file (loaded by python-dotenv or direnv)
# DB_HOST=prod-db.internal
# WAREHOUSE=snowflake
# LOG_LEVEL=INFO

# In Python
import os
from dotenv import load_dotenv
load_dotenv()
db_host = os.getenv("DB_HOST", "localhost")  # with default

# Secure secrets: never commit to git
echo "*.env" >> .gitignore
# Use: AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager` },
      ],
      keyTakeaways: [
        'export VAR=value: make available to child processes',
        '.env files: project-specific vars, NEVER commit to git',
        'python-dotenv or direnv: auto-load .env files',
        'Secrets: use Vault/AWS Secrets Manager, not env vars in production',
      ],
    },
    crashCourse: {
      summary: 'export for child processes, .env for project config, Vault/Secrets Manager for production secrets. Never hardcode credentials.',
      quickFacts: ['export: available to child processes', 'env: list all environment variables', '.env + python-dotenv: local development', 'direnv: auto-load .env when entering directory'],
      tips: ['Use dotenv-linter to validate .env files before deployment'],
    },
  },
  'linux-shell-8': {
    tutorial: {
      explanation: [
        'SSH enables secure remote access to servers and data infrastructure. Key-based auth is more secure than passwords. SSH tunnels forward ports for secure access to remote databases and APIs.',
      ],
      codeExamples: [
        { description: 'SSH for remote data access', code: `# Generate SSH key pair
ssh-keygen -t ed25519 -C "your@email.com"

# SSH config for multiple servers (~/.ssh/config)
Host data-server
    HostName 10.0.1.50
    User dataeng
    IdentityFile ~/.ssh/id_ed25519
    ForwardAgent yes

# Port forwarding: access remote DB locally
ssh -L 5432:db.internal:5432 bastion-server
# Now connect to localhost:5432 → reaches remote Postgres

# SCP: copy files to/from servers
scp local_file.csv data-server:/data/incoming/
scp -r data-server:/data/output/ ./local_output/

# rsync: efficient incremental sync
rsync -avz --progress ./data/ data-server:/data/backup/` },
      ],
      keyTakeaways: [
        'ssh-keygen -t ed25519: modern, secure key generation',
        '~/.ssh/config: save connection settings, avoid typing long commands',
        'SSH -L: local port forwarding — secure access to remote DBs through bastion',
        'rsync > scp: incremental transfers, only copies changed data',
      ],
    },
    crashCourse: {
      summary: 'SSH key auth for secure access, config for convenience, -L for port forwarding to remote DBs, rsync for efficient file sync.',
      quickFacts: ['ed25519: modern, fast, secure key type', '-L 5432:db:5432: forward local port to remote', 'scp: copy files, rsync: sync directories', 'ssh-agent: cache key passphrase'],
      tips: ['Always use bastion hosts (jump servers) for accessing production databases — never expose DB ports directly'],
    },
  },
  'linux-shell-9': {
    tutorial: {
      explanation: [
        'System monitoring tracks CPU, memory, disk, and I/O — critical for capacity planning and debugging slow pipelines. Tools: top/htop (CPU/mem), iostat (disk I/O), vmstat (memory), sar (historical).',
      ],
      codeExamples: [
        { description: 'Monitoring system resources', code: `# Real-time monitoring
htop                          # interactive, color-coded
top -bn1 | head -20           # batch mode, one snapshot

# Memory analysis
free -h                       # RAM usage (human readable)
vmstat 1 5                    # 5 snapshots, 1 sec apart

# Disk I/O
iostat -xz 1                  # extended disk stats every second
iotop                         # I/O usage by process

# Combined health check script
#!/bin/bash
echo "=== CPU ===" && uptime
echo "=== MEM ===" && free -h
echo "=== DISK ===" && df -h /data
echo "=== TOP 5 CPU ===" && ps aux --sort=-%cpu | head -6
echo "=== TOP 5 MEM ===" && ps aux --sort=-%mem | head -6` },
      ],
      keyTakeaways: [
        'htop: interactive process viewer with CPU/memory bars',
        'free -h: RAM usage, look at "available" column (not "free")',
        'iostat -xz: disk I/O — high %util means disk bottleneck',
        'df -h: filesystem usage, du -sh: directory sizes',
        'Create monitoring scripts for pipeline health dashboards',
      ],
    },
    crashCourse: {
      summary: 'htop for CPU/mem, iostat for disk I/O, free -h for RAM, df -h for disk. Create health check scripts for pipeline monitoring.',
      quickFacts: ['htop: interactive, color, filterable', 'free -h: "available" is the real free memory', 'iostat %util: >80% means disk bottleneck', 'vmstat: system-wide mem/cpu/io snapshot'],
      tips: ['Set up Prometheus + Grafana for production monitoring — CLI tools are for ad-hoc debugging'],
    },
  },
};
