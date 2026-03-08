// Linux & Shell Scripting — Topic Deep-Dive Content
export const linuxContent = {
  'linux-shell-0': {
    tutorial: {
      explanation: [
        'Core Linux commands are the bread and butter of navigating systems and quickly filtering data without lifting it into Python.',
        'Tools like ls, grep, awk, sed, cut, sort, uniq, wc, head, and tail are essential. By understanding them, you can often solve simple data processing challenges directly from the terminal with extreme efficiency.',
      ],
      codeExamples: [
        {
          description: 'Navigating & Core utilities',
          code: `# ls: List contents
ls -lh                   # Long format + human-readable sizes (K, M, G)
ls -lS                   # Sort by size (largest first)

# head, tail, wc
head -n 20 file.csv      # First 20 lines
tail -f app.log          # Follow log real-time
wc -l data.csv           # Count total number of lines (helpful for quickly checking row count)

# Data extracting and sorting (cut, sort, uniq)
cut -d',' -f1,3 data.csv # Extract columns 1 and 3 (delimiter: comma)
sort -k2 -t',' data.csv  # Sort by column 2 (-k2) using comma separator (-t',')
uniq -c                  # Count frequencies of sorted duplicate lines

# xargs: Pass stdout as arguments to next command
find . -name "*.log" | xargs rm -f  # Find and delete log files efficiently`
        },
      ],
      keyTakeaways: [
        'Use ls -lh to quickly check file sizes in human readable formats.',
        'tail -f is critical for monitoring live logs or watching file growth.',
        'wc -l quickly gets line (row) counts for flat files.',
        'cut, sort, and uniq together provide primitive, fast SQL-like GROUP BY operations.',
        'xargs converts standard input into command-line arguments.',
      ],
    },
    crashCourse: {
      summary: 'Essential file navigation and basic text utilities. Use head/tail to preview data, wc for row counts, cut/sort/uniq for quick frequency counts.',
      quickFacts: [
        'ls -lh: file sizes readable',
        'wc -l: row counts',
        'sort | uniq -c: equivalent to GROUP BY COUNT()',
        'cut -d"," -fN: extract Nth column of CSV'
      ],
      tips: ['Combine commands: cut -d, -f1 data.csv | sort | uniq -c | sort -rn gets the most frequent values in column 1.'],
    },
  },
  'linux-shell-1': {
    tutorial: {
      explanation: [
        'File permissions and ownership ensure secure data operations. Permissions consist of read (r/4), write (w/2), and execute (x/1) applied to User (u), Group (g), and Other (o).',
        'In data pipelines, incorrect permissions will halt scripts. Keys like secret credentials need to be locked down (e.g. 600 or 400), while execution scripts need the +x bit.',
      ],
      codeExamples: [
        {
          description: 'Permissions and Ownership (chmod & chown)',
          code: `# chmod: Change permissions
chmod +x pipeline.sh       # Make script executable
chmod 755 script.sh        # Owner: rwx (7), Group: rx (5), Others: rx (5)
chmod 644 data.csv         # Owner: rw (6), Group: r (4), Others: r (4)
chmod 600 secrets.json     # Owner: rw (6), Group/Others: none (0) - Highly secure!

# Recursive permission changes
chmod -R 755 my_app_dir/   # Apply to directory and all contents

# chown: Change Ownership
chown user:group file.txt  # Assign file to 'user' and 'group'
chown -R etl_user:etl_grp /data/processed/`
        },
      ],
      keyTakeaways: [
        'r = 4 (Read), w = 2 (Write), x = 1 (Execute). Total sum dictates permission level (e.g., 4+2+1 = 7 for rwx).',
        '755 is standard for executable scripts. 644 is standard for data files.',
        '600 is required for sensitive files like SSH keys or credentials.',
        'Use -R flag carefully for recursive changes to avoid locking out critical systems.',
      ],
    },
    crashCourse: {
      summary: 'chmod manages permissions (rwx) via numbers (4,2,1). chown manages who owns a file or folder.',
      quickFacts: [
        'chmod +x: Make script executable',
        'chmod 600: Restrict completely to owner',
        'chown user:group: Reassign ownership'
      ],
      tips: ['If a bash script is giving "Permission denied", double-check if you forgot to run chmod +x script.sh.'],
    },
  },
  'linux-shell-2': {
    tutorial: {
      explanation: [
        'Understanding how to track, suspend, and kill processes is crucial.',
        'ps provides snapshots, while top and htop provide interactive real-time views of what resource each process uses. kill stops rogue processes politely (-15) or forcefully (-9).',
        'nohup and running in background ensure long pipeline scripts finish even if your SSH session disconnects.',
      ],
      codeExamples: [
        {
          description: 'Top, ps, kill, and nohup',
          code: `# Monitor processes
ps aux | grep python         # Search for python jobs
htop                         # Interactive process viewer (often better than top)
top -u username              # Show only user's processes

# Running jobs in background
python etl.py &              # Run in background (will stop if connection drops)
nohup python etl.py > run.log 2>&1 &  # Persistent background run

# Managing jobs
jobs                         # List jobs
fg %1                        # Bring job 1 to foreground
bg %1                        # Send job 1 to background

# Terminating tasks
kill -15 1234                # SIGTERM: Polite request to shut down PID 1234
kill -9 1234                 # SIGKILL: Immediate force kill (can corrupt data!)
pgrep -f "etl"               # Find PIDs matching "etl"
pkill -f "etl"               # Kill processes matching "etl"`
        },
      ],
      keyTakeaways: [
        'Always try kill -15 (SIGTERM) before kill -9 (SIGKILL) so the app can clean up safely.',
        'Use nohup or tmux to ensure a script survives if your SSH connection times out.',
        'ps aux gives a complete snapshot of all running processes.',
        'pgrep/pkill are convenient for affecting processes by name instead of looking up the PID manually.',
      ],
    },
    crashCourse: {
      summary: 'ps/top monitor jobs. nohup/& runs processes in background securely. kill sends signals to stop tasks.',
      quickFacts: [
        'ps aux: See everything running',
        'kill -15: Graceful stop',
        'kill -9: Force stop',
        'nohup cmd &: Run immune to hangups'
      ],
      tips: ['tmux or screen are excellent alternatives to nohup for long-running scripts where you want to check back on the terminal output.'],
    },
  },
  'linux-shell-3': {
    tutorial: {
      explanation: [
        'A strong shell script binds pieces of a data platform together. Essential concepts: variables, iterative loops, conditional if/then logs, custom functions, and robust error handling.',
        'Always start scripts with #!/bin/bash (shebang) and utilize set defaults like "set -euo pipefail" to catch errors immediately rather than propagating them.',
      ],
      codeExamples: [
        {
          description: 'Data Engineering Bash Script',
          code: `#!/bin/bash
# Enable strict error handling
set -euo pipefail

# Variables
DATE=$(date +%Y%m%d)
INPUT_DIR="/incoming_data"
PROCESSED_DIR="/processed/$DATE"

# Conditionals: Creating output dir if missing
if [ ! -d "$PROCESSED_DIR" ]; then
    echo "Creating directory: $PROCESSED_DIR"
    mkdir -p "$PROCESSED_DIR"
fi

# Functions
validate_file() {
    local file="$1"
    if [ ! -s "$file" ]; then
        echo "Error: $file is empty!"
        return 1
    fi
    echo "Validation passed for $file"
    return 0
}

# Loops & Exit Codes
for file in "$INPUT_DIR"/*.csv; do
    [ -e "$file" ] || continue
    
    # Check exit code of function ($?)
    if validate_file "$file"; then
        mv "$file" "$PROCESSED_DIR/"
    else
        echo "Validation failed."
        exit 1
    fi
done`
        },
      ],
      keyTakeaways: [
        'set -euo pipefail prevents silent failures (exits on bad commands, unset variables, and failure in pipe chains).',
        'Variables don\'t use spaces around the equals sign: NAME="value".',
        'Functions should use the "local" keyword to avoid polluting the global variable namespace.',
        'Check exit statuses ($?) explicitly. Success is always 0. Failure is anything non-zero.',
      ],
    },
    crashCourse: {
      summary: 'Automate tasks with conditionals, loops, and functions. Strict execution (set -euo pipefail) is a best practice.',
      quickFacts: [
        'set -e: stop on error',
        'set -u: stop on undefined variable',
        '$?: Last command exit code (0=success)',
        '$(): Command substitution'
      ],
      tips: ['Use shellcheck to analyze your bash scripts and catch common syntax issues before deployment.'],
    },
  },
  'linux-shell-4': {
    tutorial: {
      explanation: [
        'Pipes (|) route the standard output (stdout) of one command into the standard input (stdin) of another.',
        'Redirection (> and >>) routes output directly into files instead of the terminal. We also separate error logs (stderr) from regular logs (stdout) to keep pipelines observable.',
      ],
      codeExamples: [
        {
          description: 'Managing Pipes and Redirections',
          code: `# Pipes
# Feed cat output into grep, then into wc to count
cat raw_app.log | grep "ERROR" | wc -l

# Redirection: Overwriting (>) and Appending (>>)
echo "Starting job..." > job.log       # Overwrite/create file
echo "Step 1 done." >> job.log         # Append to file

# Stderr and Stdout
# 1 = stdout (regular output), 2 = stderr (errors)
python process.py > success.log 2> errors.log

# Merge stderr into stdout (2>&1)
python process.py > all_output.log 2>&1

# tee: Split output to console AND file simultaneously
cat sales.csv | awk -F',' '$3 > 100' | tee high_value.csv

# Process Substitution: Feed command output as if it were a file
diff <(sort current.csv) <(sort previous.csv)`
        },
      ],
      keyTakeaways: [
        '> overwrites a file. >> appends to an existing file.',
        '2> redirects error streams. 2>&1 merges the error stream with standard output so they go to the same place.',
        'Piping connects commands linearly, enabling modular stream processing architecture on the command line.',
        'tee is ideal when you want to write intermediate data out to disk but continue the pipe downstream.',
      ],
    },
    crashCourse: {
      summary: 'Chain command inputs and outputs with | (pipe). Redirect standard output and errors sequentially using > and 2>.',
      quickFacts: [
        '|: Send stdout to next command stdin',
        '>/path: Overwrite',
        '>>/path: Append',
        '2>&1: Combine stderr and stdout',
        'tee: Output to screen AND file'
      ],
      tips: ['Use Process Substitution like <(cmd) when a tool expects a file path but you want to pass it a command stream without creating temp files.'],
    },
  },
  'linux-shell-5': {
    tutorial: {
      explanation: [
        'Cron is the traditional Linux task scheduler. Used heavily for recurring data jobs. Understanding cron syntax is practically a required skill.',
        'It allows running scripts periodically (e.g., every minute, daily at midnight, every Tuesday). You manage jobs via the crontab.',
      ],
      codeExamples: [
        {
          description: 'Scheduling with Cron',
          code: `# Open crontab for editing
crontab -e

# View scheduled jobs
crontab -l

# Syntax Structure:
# MIN HOUR DOM MON DOW  /path/to/command

# Examples:
0 5 * * * /scripts/daily_extract.sh          # Daily at 5:00 AM
*/15 * * * * /scripts/ingest_stream.sh       # Every 15 minutes
0 0 1 * * /scripts/monthly_rollup.sh         # Run at midnight on 1st of month
0 2 * * 1-5 /scripts/weekday_job.sh          # Weekdays at 2:00 AM

# Good Practices: Always capture logs and use absolute paths
0 5 * * * /usr/bin/python3 /scripts/main.py >> /var/log/my_job.log 2>&1`
        },
      ],
      keyTakeaways: [
        'The syntax is five fields: Minute, Hour, Day of Month, Month, Day of Week.',
        'Cron has a minimal PATH environment. Always use absolute paths for both the command (e.g., /usr/bin/python3) and the targets.',
        'Always redirect outputs (>> log 2>&1) because otherwise errors are silently lost or sent to local mail spools.',
      ],
    },
    crashCourse: {
      summary: 'Cron schedules recurring commands. Defined by 5 time fields + command path. Always use absolute paths.',
      quickFacts: [
        'crontab -e: Edit scheduler file',
        '* * * * *: Minute, Hour, Day of Month, Month, Day of Week',
        '*/x: Run every "x" increments'
      ],
      tips: ['Use websites like crontab.guru to validate and translate your cron syntax to ensure you scheduled it correctly.'],
    },
  },
  'linux-shell-6': {
    tutorial: {
      explanation: [
        'Data doesn\'t live on just your laptop. Securely accessing remote servers and copying files back and forth is a frequent requirement.',
        'Tools like ssh (Secure Shell) let you log in to remotes, while scp (Secure Copy) and rsync facilitate transferring large datasets safely.',
      ],
      codeExamples: [
        {
          description: 'SSH, SCP, and rsync',
          code: `# SSH: Basic connection and Port Forwarding
ssh user@data-server.internal
ssh -i ~/.ssh/prod_key.pem user@host    # Key authentication

# Port forwarding: Access a remote database securely through an SSH tunnel
# Maps local port 5432 out to db.internal:5432
ssh -L 5432:db.internal:5432 user@bastion-server

# SCP: Secure Copy
scp local_file.csv user@host:/remote/dir/       # Local to remote
scp user@host:/remote/file.csv ./local_dir/     # Remote to local
scp -r ./data_folder/ user@host:/backup/        # Recursive folder copy

# Rsync: Smart incremental sync (faster than SCP for large sets/retries)
rsync -avz --progress ./data/ user@host:/dest/  # -a(archive), -v(verbose), -z(compress)
rsync -avz --delete local/ remote/              # Synced mirror (deletes missing)`
        },
      ],
      keyTakeaways: [
        'Always prefer using SSH Keys (like ed25519) instead of passwords whenever possible.',
        'SSH Port Forwarding (-L) is critical for securely connecting GUI database tools (like DBeaver or pgAdmin) to an internal DB that shouldn\'t be exposed to the public internet.',
        'rsync is vastly superior to scp for large directories. It supports delta-transfer (only copying what changed) and compression.',
      ],
    },
    crashCourse: {
      summary: 'ssh manages remote connections. Port forwarding (-L) enables secure DB connections. scp is for simple copy, rsync for massive datasets.',
      quickFacts: [
        'ssh user@ip: Login',
        'ssh -L localPort:target:remotePort',
        'scp local remote: Secure remote copy',
        'rsync -avz: Efficient, incremental sync'
      ],
      tips: ['Use ~/.ssh/config to establish quick aliases for servers so you don\'t have to remember IPs and users.'],
    },
  },
  'linux-shell-7': {
    tutorial: {
      explanation: [
        'Logs in data engineering can swell to Gigabytes within hours. Downloading logs or opening them in IDEs is impossible. Command line parsers like grep, awk, and jq are required to investigate them efficiently.',
      ],
      codeExamples: [
        {
          description: 'Advanced Log Parsing Strategy',
          code: `# grep for immediate string isolation
grep "Exception" pipeline.log            # Find all exceptions
grep -A 5 "Exception" pipeline.log       # Provide 5 lines of trailing context

# awk for structured logs (ex: IP | DATE | STATUS | URL)
awk '$3 == 500 {print $0}' web.log       # Find 500 Server Errors (assuming column 3 is status)
awk '{print $1}' web.log | sort | uniq -c | sort -nr | head -5  # Top 5 most active IPs

# jq for JSON structured logs
cat metrics.json | jq '.'                # Pretty print JSON log file
cat event.json | jq '.records[].user_id' # Extract a deeply nested JSON attribute
curl -s api/health | jq '.status'        # Instantly parse API response`
        },
      ],
      keyTakeaways: [
        'Combine tools: Use grep to isolate rows first, preventing awk or jq from spending CPU on irrelevant records.',
        'grep -A (After) and -B (Before) are lifesavers for capturing multi-line Python traceback errors in logs.',
        'jq is an absolute necessity because highly structured log outputs (JSON) are standard in the modern data stack.',
      ],
    },
    crashCourse: {
      summary: 'Do not download huge log files. Use grep to isolate strings, awk to parse delimited columns, and jq to parse JSON logs natively.',
      quickFacts: [
        'grep -A/B: Contextual log searching',
        'awk: Isolate columns',
        'jq: Query and pretty-print JSON',
        'sort | uniq -c: Identify frequent spam log events'
      ],
      tips: ['If a log file is compressed, use zgrep or zcat to read the contents without having to manually extract it first.'],
    },
  },
  'linux-shell-8': {
    tutorial: {
      explanation: [
        'Environment variables configure how pipelines and CLI tools behave without hardcoding constants (like database passwords, API hosts). Environment configuration is vital for 12-Factor App methodology.',
      ],
      codeExamples: [
        {
          description: 'Setting and Persisting Variables',
          code: `# Setting a local terminal variable (dies when session ends)
DATABASE_URI="postgres://db:5432"

# Exporting so child processes (like Python) inherit it
export DB_PASS="s3cr3t"

# .bashrc / .zshrc setup for persistent config
# Automatically triggers every time you log in
echo 'export SPARK_HOME="/opt/spark"' >> ~/.bashrc
echo 'export PATH="$SPARK_HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc   # Apply immediately without restarting

# Using .env files securely
# (Often loaded by python-dotenv or docker-compose)
# DO NOT commit to git
cat .env
> AWS_ACCESS_KEY=AKIA...
> DB_HOST=prod.db.internal`
        },
      ],
      keyTakeaways: [
        'Use export when running a script that depends on variables in your current shell session.',
        'Append changes to PATH via ~/.bashrc or ~/.zshrc so custom binaries (like dbt or airflow plugins) can be executed from anywhere.',
        '.env files are the standard for managing project-specific configs. Put them in your .gitignore.',
      ],
    },
    crashCourse: {
      summary: 'Store configs and secrets safely via variables. Define in .bashrc for global persistence or .env files for project boundaries.',
      quickFacts: [
        'export KEY=value: Publish to child processes',
        'env / printenv: List all active variables',
        'source ~/.bashrc: Reload configuration',
        'PATH=\$PATH:/new/dir: Add executable path'
      ],
      tips: ['To see exactly what variables your Python script is inheriting from the current shell, run the command `env`. '],
    },
  },
  'linux-shell-9': {
    tutorial: {
      explanation: [
        'Regex (Regular Expressions) takes command line grep and sed to the next level. Data cleaning often begins directly on the filesystem before moving into Python pipelines, especially when scrubbing malformed raw files.',
      ],
      codeExamples: [
        {
          description: 'Text Processing and Cleaning with Regex',
          code: `# grep with basic and extended regex
grep "^ERROR" app.log                # Line starts (^) with ERROR
grep "timeout$" app.log              # Line ends ($) with timeout
grep -E "ERROR|WARN" app.log         # Extended flag: Match ERROR OR WARN
grep -P '\\d{4}-\\d{2}-\\d{2}' data  # Perl flag: Match YYYY-MM-DD dates

# sed with regex for data scrubbing
# Scrub entire lines mapping a pattern
sed '/^$/d' dirty.csv                # Delete empty lines
sed '/#.*$/d' config.ini             # Remove lines that are just comments

# Replace sensitive strings directly in pipeline
cat dirty_data.csv | sed -E 's/[0-9]{3}-[0-9]{2}-[0-9]{4}/XXX-XX-XXXX/g' > scrubbed.csv
# Uses extended regex to find SSNs and replace them with Xs globally (g)`
        },
      ],
      keyTakeaways: [
        '^ means start, $ means end. Use these boundary markers to vastly speed up regex processing.',
        'grep -E (or egrep) permits modern features like OR (|) patterns.',
        'sed is phenomenal for injecting minor string manipulation or scrubbing PII data from flat distributions before loading to a data warehouse.',
      ],
    },
    crashCourse: {
      summary: 'Regex provides incredibly flexible string detection. Use grep with regex flags to identify anomalies, and sed to substitute data formats.',
      quickFacts: [
        '^term: starts with',
        'term$: ends with',
        'grep -E: Extended Regex',
        'sed "s/match/replace/g": Bulk string replace'
      ],
      tips: ['If standard Regex in grep feels too limited, toss in the -P flag to enable Perl-Compatible Regular Expressions (PCRE), which supports advanced shortcuts like \\d.'],
    },
  },
};
