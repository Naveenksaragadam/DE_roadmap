# Linux & Shell Scripting Reference for Data Engineers

## Table of Contents
1. [File System Navigation & Management](#file-system-navigation--management)
2. [File Operations](#file-operations)
3. [Text Processing & Data Manipulation](#text-processing--data-manipulation)
4. [Process & System Management](#process--system-management)
5. [Networking & Remote Operations](#networking--remote-operations)
6. [Archive & Compression](#archive--compression)
7. [Shell Scripting Fundamentals](#shell-scripting-fundamentals)
8. [Data Engineering Specific Scripts](#data-engineering-specific-scripts)
9. [Performance Monitoring](#performance-monitoring)
10. [Useful One-Liners](#useful-one-liners)

---

## File System Navigation & Management

### Basic Navigation

#### `pwd` - Print Working Directory
Shows the full path of your current directory.
```bash
pwd                      # Shows current directory path
```

#### `ls` - List Directory Contents
**Most Used Options:**
- `-l` = Long format (detailed info)
- `-a` = Show all files (including hidden files starting with .)
- `-h` = Human-readable file sizes (K, M, G instead of bytes)
- `-t` = Sort by modification time (newest first)
- `-r` = Reverse order
- `-S` = Sort by file size (largest first)
- `-d` = Show directory itself, not its contents

```bash
ls                       # Basic listing
ls -l                    # Long format: permissions, owner, size, date
ls -la                   # Long format + hidden files
ls -lh                   # Long format + human-readable sizes
ls -lt                   # Sort by modification time (newest first)
ls -ltr                  # Sort by time, reverse (oldest first)
ls -lS                   # Sort by size (largest first)
ls -d */                 # List only directories
ls *.csv                 # List only CSV files
```

#### `cd` - Change Directory
**Special Directory References:**
- `.` = Current directory
- `..` = Parent directory
- `~` = Home directory
- `-` = Previous directory
- `/` = Root directory

```bash
cd /path/to/directory    # Go to specific path
cd ~                     # Go to home directory
cd                       # Also goes to home (shortcut)
cd ..                    # Go up one directory
cd ../..                 # Go up two directories
cd -                     # Go to previous directory
cd ./data                # Go to data subdirectory (. means current dir)
```

#### `mkdir` - Make Directory
**Most Used Options:**
- `-p` = Create parent directories if they don't exist
- `-v` = Verbose (show what's being created)
- `-m` = Set permissions while creating

```bash
mkdir data                           # Create single directory
mkdir -p data/raw/2023/january      # Create nested path (-p creates parents)
mkdir -v logs                       # Verbose output (-v shows creation)
mkdir data/{raw,processed,clean}    # Create multiple directories using brace expansion
mkdir -p project/{data,scripts,logs,config}  # Create project structure
```

#### `find` - Search for Files and Directories
**Path Operators:**
- `/` = Search entire system (root)
- `.` = Search current directory and subdirectories
- `~` = Search home directory and subdirectories
- `./dirname` = Search specific directory

**Most Used Options:**
- `-name` = Search by filename pattern
- `-type` = Search by type (f=file, d=directory, l=link)
- `-size` = Search by file size
- `-mtime` = Search by modification time
- `-exec` = Execute command on found files
- `-delete` = Delete found files

```bash
find . -name "*.csv"                 # Find CSV files in current directory (.)
find /data -name "*.csv"             # Find CSV files in /data directory
find ~ -name "config.txt"            # Find in home directory (~)
find . -type f                       # Find only files (-type f)
find . -type d                       # Find only directories (-type d)
find . -size +100M                   # Files larger than 100MB (+100M)
find . -size -1M                     # Files smaller than 1MB (-1M)
find . -mtime -7                     # Files modified in last 7 days (-7)
find . -mtime +30                    # Files older than 30 days (+30)
find . -name "*.log" -delete         # Find and delete log files
find . -name "*.csv" -exec ls -l {} \; # Execute ls -l on each found file
```

**Size Operators:**
- `+100M` = Larger than 100MB
- `-100M` = Smaller than 100MB
- `100M` = Exactly 100MB
- `c` = bytes, `k` = kilobytes, `M` = megabytes, `G` = gigabytes

---

### File Permissions & Ownership

#### `chmod` - Change File Permissions
**Permission Numbers:**
- `4` = Read (r)
- `2` = Write (w)  
- `1` = Execute (x)
- Add them together: `7` = rwx, `6` = rw-, `5` = r-x, `4` = r--

**Most Used Options:**
- `-R` = Recursive (apply to all files/directories inside)
- `+x` = Add execute permission
- `-x` = Remove execute permission

```bash
chmod 755 script.sh              # rwxr-xr-x (owner: rwx, group: r-x, others: r-x)
chmod 644 data.csv               # rw-r--r-- (owner: rw-, group: r--, others: r--)
chmod +x script.sh               # Add execute permission for all
chmod -x script.sh               # Remove execute permission for all
chmod u+x script.sh              # Add execute for user (owner) only
chmod g-w file.txt               # Remove write for group
chmod o-r file.txt               # Remove read for others
chmod -R 755 directory/          # Apply 755 to directory and all contents
```

**Permission Letters:**
- `u` = user (owner), `g` = group, `o` = others, `a` = all
- `+` = add permission, `-` = remove permission, `=` = set exact permission

#### `chown` - Change Ownership
```bash
chown user file.txt              # Change owner to 'user'
chown user:group file.txt        # Change owner to 'user' and group to 'group'
chown :group file.txt            # Change only group
chown -R user:group directory/   # Recursive ownership change
```

---

## File Operations

### Basic File Operations

#### `cp` - Copy Files
**Most Used Options:**
- `-r` or `-R` = Recursive (copy directories)
- `-i` = Interactive (ask before overwriting)
- `-v` = Verbose (show what's being copied)
- `-p` = Preserve permissions and timestamps
- `-u` = Update (copy only if source is newer)

```bash
cp file1.txt file2.txt           # Copy file1 to file2
cp -r source_dir/ dest_dir/      # Copy directory recursively (-r)
cp -i file.txt backup.txt        # Ask before overwriting (-i)
cp -v *.csv backup/              # Verbose copy of all CSV files
cp -p script.sh backup_script.sh # Preserve permissions (-p)
cp -u new_data.csv old_data.csv  # Copy only if newer (-u)
```

#### `mv` - Move/Rename Files
**Most Used Options:**
- `-i` = Interactive (ask before overwriting)
- `-v` = Verbose (show what's being moved)
- `-u` = Update (move only if source is newer)

```bash
mv old_name.txt new_name.txt     # Rename file
mv file.txt directory/           # Move file to directory
mv *.log logs/                   # Move all log files to logs directory
mv -i file.txt existing.txt      # Ask before overwriting (-i)
mv -v data/ backup/              # Verbose move (-v)
```

#### `rm` - Remove Files
**Most Used Options:**
- `-r` or `-R` = Recursive (remove directories)
- `-f` = Force (don't ask for confirmation)
- `-i` = Interactive (ask before each removal)
- `-v` = Verbose (show what's being removed)

```bash
rm file.txt                      # Remove single file
rm -r directory/                 # Remove directory recursively (-r)
rm -rf directory/                # Force remove without asking (-f)
rm -i *.tmp                      # Ask before removing each temp file (-i)
rm -v old_data.csv               # Verbose removal (-v)
```

**⚠️ Warning:** `rm -rf` is very dangerous - it will delete everything without asking!

#### `touch` - Create Empty Files or Update Timestamps
```bash
touch filename.txt               # Create empty file or update timestamp
touch data_{1..10}.csv           # Create files data_1.csv to data_10.csv
touch -t 202312251200 file.txt   # Set specific timestamp (YYYYMMDDhhmm)
```

#### `ln` - Create Links
**Link Types:**
- Symbolic link (`-s`): Points to another file (like a shortcut)
- Hard link: Another name for the same file

```bash
ln -s /path/to/file symlink_name    # Create symbolic link (-s)
ln file.txt hardlink_name           # Create hard link
ln -sf new_target existing_link     # Force update symbolic link (-f)
```

---

### File Content Operations

#### `cat` - Display File Contents
**Most Used Options:**
- `-n` = Number all lines
- `-b` = Number non-empty lines only
- `-A` = Show all characters (including hidden ones)

```bash
cat file.txt                     # Display entire file
cat -n file.txt                  # Display with line numbers (-n)
cat file1.txt file2.txt          # Display multiple files
cat > newfile.txt                # Create file and type content (Ctrl+D to finish)
cat file1.txt file2.txt > combined.txt  # Combine files
```

#### `less` - View Files Page by Page
**Navigation Keys in less:**
- `Space` or `f` = Next page
- `b` = Previous page
- `/pattern` = Search forward
- `?pattern` = Search backward
- `q` = Quit

```bash
less file.txt                    # View file page by page
less +50 file.txt                # Start at line 50
less +/ERROR logfile.txt         # Start at first occurrence of "ERROR"
```

#### `head` - Show First Lines
**Most Used Options:**
- `-n` = Number of lines to show
- `-c` = Number of characters to show

```bash
head file.txt                    # First 10 lines (default)
head -n 20 file.csv              # First 20 lines (-n 20)
head -5 file.txt                 # First 5 lines (shortcut for -n 5)
head -c 100 file.txt             # First 100 characters (-c)
head -n -5 file.txt              # All except last 5 lines
```

#### `tail` - Show Last Lines  
**Most Used Options:**
- `-n` = Number of lines to show
- `-f` = Follow (keep showing new lines as they're added)
- `-c` = Number of characters to show

```bash
tail file.txt                    # Last 10 lines (default)
tail -n 50 file.log              # Last 50 lines (-n 50)
tail -20 file.txt                # Last 20 lines (shortcut)
tail -f application.log          # Follow log file in real-time (-f)
tail -f -n 100 app.log           # Follow last 100 lines
tail +10 file.txt                # From line 10 to end
```

#### File Information Commands

#### `wc` - Word Count
**Most Used Options:**
- `-l` = Count lines
- `-w` = Count words  
- `-c` = Count characters
- `-m` = Count characters (multibyte aware)

```bash
wc file.txt                      # Lines, words, characters
wc -l file.txt                   # Count lines only (-l)
wc -w file.txt                   # Count words only (-w)
wc -c file.txt                   # Count characters only (-c)
wc -l *.csv                      # Line count for all CSV files
```

#### `file` - Determine File Type
```bash
file data.csv                    # Shows file type and encoding
file *                          # Show file type for all files
file -b script.sh               # Brief output (no filename)
```

#### `du` - Disk Usage
**Most Used Options:**
- `-h` = Human-readable sizes
- `-s` = Summary (total size only)
- `-a` = Show all files, not just directories
- `-d` = Depth limit

```bash
du -h file.txt                   # File size in human-readable format
du -sh directory/                # Total directory size (-s for summary)
du -h --max-depth=1              # Size of immediate subdirectories only
du -ah directory/                # All files with sizes (-a)
```

---

## Text Processing & Data Manipulation

### `grep` - Pattern Matching and Searching

**Most Used Options:**
- `-i` = Case insensitive
- `-v` = Invert match (show non-matching lines)
- `-n` = Show line numbers
- `-r` = Recursive search in directories
- `-c` = Count matches
- `-l` = Show only filenames with matches
- `-A` = Show lines after match
- `-B` = Show lines before match
- `-C` = Show lines before and after match

```bash
# Basic search
grep "pattern" file.txt              # Find lines containing "pattern"
grep -i "error" log.txt              # Case insensitive search (-i)
grep -v "DEBUG" log.txt              # Show lines NOT containing "DEBUG" (-v)
grep -n "TODO" script.py             # Show line numbers (-n)
grep -c "ERROR" log.txt              # Count matching lines (-c)

# Context searches
grep -A 3 "ERROR" log.txt            # Show 3 lines after match (-A 3)
grep -B 2 "ERROR" log.txt            # Show 2 lines before match (-B 2)
grep -C 2 "ERROR" log.txt            # Show 2 lines before and after (-C 2)

# File operations
grep -r "pattern" directory/         # Search recursively in all files (-r)
grep -l "pattern" *.txt              # Show only filenames with matches (-l)
grep -L "pattern" *.txt              # Show filenames WITHOUT matches (-L)

# Advanced patterns (regex)
grep "^ERROR" logfile.txt            # Lines starting with ERROR (^)
grep "ERROR$" logfile.txt            # Lines ending with ERROR ($)
grep "^$" file.txt                   # Empty lines
grep -E "pattern1|pattern2" file.txt # Multiple patterns (-E enables extended regex)
grep -P "\d{4}-\d{2}-\d{2}" file.txt # Perl regex for dates (YYYY-MM-DD)
```

**Pattern Operators:**
- `^` = Start of line
- `$` = End of line  
- `.` = Any single character
- `*` = Zero or more of previous character
- `+` = One or more of previous character (with -E)
- `|` = OR operator (with -E)
- `[]` = Character class (e.g., `[0-9]` for digits)

### `sed` - Stream Editor (Find and Replace)

**Most Used Options:**
- `-i` = Edit files in-place
- `-n` = Suppress default output (use with p command)
- `-e` = Multiple editing commands
- `g` = Global flag (replace all occurrences in line)
- `i` = Case insensitive flag

```bash
# Basic substitution (s = substitute)
sed 's/old/new/' file.txt              # Replace first occurrence per line
sed 's/old/new/g' file.txt             # Replace all occurrences in each line (g = global)
sed 's/old/new/gi' file.txt            # Case insensitive replacement (i = ignore case)
sed -i 's/old/new/g' file.txt          # Edit file in-place (-i)

# Line operations
sed -n '10p' file.txt                  # Print only line 10 (-n suppresses other output, p = print)
sed -n '10,20p' file.txt               # Print lines 10-20
sed '5d' file.txt                      # Delete line 5 (d = delete)
sed '/pattern/d' file.txt              # Delete lines matching pattern
sed '/^$/d' file.txt                   # Delete empty lines

# Insert and append
sed '1i\Header line' file.csv          # Insert line before line 1 (i = insert)
sed '$a\Footer line' file.txt          # Append line after last line (a = append, $ = last line)

# Advanced sed
sed 's/\([0-9]\{4\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)/\3\/\2\/\1/' file.txt  # Change date format
sed -e 's/old1/new1/g' -e 's/old2/new2/g' file.txt  # Multiple replacements (-e)
```

**Address Operators:**
- `5` = Line 5
- `$` = Last line
- `1,10` = Lines 1 to 10
- `/pattern/` = Lines matching pattern

### `awk` - Text Processing and Data Extraction

**Built-in Variables:**
- `$0` = Entire line
- `$1, $2, $3...` = First field, second field, third field, etc.
- `$NF` = Last field (NF = Number of Fields)
- `NR` = Number of Records (line number)
- `NF` = Number of Fields in current line
- `FS` = Field Separator (default is space/tab)

**Most Used Options:**
- `-F` = Set field separator
- `-v` = Set variables

```bash
# Basic field extraction
awk '{print $1}' file.txt              # Print first column/field
awk '{print $2, $4}' file.txt          # Print columns 2 and 4
awk '{print $NF}' file.txt             # Print last column ($NF = last field)
awk '{print NR, $0}' file.txt          # Add line numbers (NR = record number)

# Field separators
awk -F',' '{print $2}' data.csv        # Use comma as separator for CSV (-F',')
awk -F'\t' '{print $1, $3}' data.tsv   # Use tab as separator for TSV
awk 'BEGIN{FS=","} {print $1, $3}'     # Set separator in BEGIN block

# Conditional processing
awk '$3 > 100' data.txt                # Print lines where column 3 > 100
awk '$1 == "ERROR"' log.txt            # Print lines where first column equals "ERROR"
awk '/pattern/ {print $1, $2}' file    # Print columns 1,2 for lines matching pattern
awk 'NR > 1 {print $0}' data.csv       # Skip header row (NR > 1)

# Calculations
awk '{sum += $3} END {print sum}' data.txt        # Sum column 3
awk '{sum += $2; count++} END {print sum/count}' data.txt  # Average of column 2
awk '{if($3 > max) max=$3} END {print max}' data.txt      # Find maximum in column 3

# String operations
awk '{print length($0)}' file.txt      # Print length of each line
awk '{print tolower($1)}' file.txt     # Convert first field to lowercase
awk '{print substr($1,1,5)}' file.txt  # Print first 5 characters of field 1
```

**Comparison Operators:**
- `==` = Equal to
- `!=` = Not equal to
- `>` = Greater than
- `<` = Less than
- `>=` = Greater than or equal
- `<=` = Less than or equal
- `~` = Matches regex pattern
- `!~` = Doesn't match regex pattern

### `sort` - Sort Lines

**Most Used Options:**
- `-n` = Numerical sort
- `-r` = Reverse order
- `-k` = Sort by specific field/column
- `-t` = Field separator
- `-u` = Unique (remove duplicates)
- `-f` = Ignore case

```bash
sort file.txt                          # Alphabetical sort
sort -n numbers.txt                     # Numerical sort (-n)
sort -r file.txt                        # Reverse order (-r)
sort -u file.txt                        # Remove duplicates (-u)
sort -f file.txt                        # Case insensitive (-f)

# Field-based sorting
sort -k2 file.txt                       # Sort by column 2 (-k2)
sort -k2,2 file.txt                     # Sort by column 2 only (not beyond)
sort -k2n file.txt                      # Sort by column 2 numerically
sort -t',' -k3 data.csv                 # Sort CSV by column 3 (-t',' sets comma separator)
sort -t',' -k3nr data.csv               # Sort CSV by column 3, numeric, reverse
```

### `uniq` - Remove Duplicate Lines

**Important:** `uniq` only removes consecutive duplicates, so usually used with `sort` first.

**Most Used Options:**
- `-c` = Count occurrences
- `-d` = Show only duplicates
- `-u` = Show only unique lines (no duplicates)
- `-i` = Ignore case

```bash
uniq file.txt                          # Remove consecutive duplicates
sort file.txt | uniq                   # Remove all duplicates (sort first)
sort file.txt | uniq -c                # Count occurrences (-c)
sort file.txt | uniq -d                # Show only duplicated lines (-d)
sort file.txt | uniq -u                # Show only unique lines (-u)
uniq -c -i file.txt                    # Count ignoring case (-i)
```

### `cut` - Extract Columns

**Most Used Options:**
- `-d` = Delimiter/separator
- `-f` = Fields to extract
- `-c` = Characters to extract

```bash
cut -d',' -f1 data.csv                 # Extract column 1 from CSV (-d',' sets delimiter)
cut -d',' -f1,3,5 data.csv             # Extract columns 1, 3, and 5
cut -d',' -f2- data.csv                # Extract from column 2 to end (f2-)
cut -c1-10 file.txt                    # Extract characters 1-10 (-c1-10)
cut -d' ' -f1 /etc/passwd              # Extract first field (username) from passwd
```

**Field Operators:**
- `1` = Field 1
- `1,3,5` = Fields 1, 3, and 5
- `2-5` = Fields 2 through 5
- `2-` = Field 2 to end of line
- `-3` = Fields 1 through 3

### `paste` - Combine Files Side by Side

**Most Used Options:**
- `-d` = Delimiter between merged fields
- `-s` = Serial mode (one file at a time)

```bash
paste file1.txt file2.txt              # Merge files side by side (tab-separated)
paste -d',' file1.txt file2.txt        # Use comma as delimiter (-d',')
paste -s file.txt                      # Merge all lines into one line (-s)
```

---

## Process & System Management

### Process Management

#### `ps` - Process Status

**Most Used Options:**
- `a` = Show processes from all users
- `u` = Show user-oriented format
- `x` = Show processes not attached to terminal
- `aux` = Comprehensive process list (most common)
- `-e` = Show all processes
- `-f` = Full format

```bash
ps                                     # Show processes for current user
ps aux                                 # Show all processes with detailed info (a=all users, u=user format, x=all processes)
ps aux | grep python                  # Find Python processes
ps -ef                                 # All processes in full format (-e=all, -f=full)
ps -u username                        # Show processes for specific user
ps -p PID                             # Show specific process by PID
```

#### `pgrep` - Process Grep
```bash
pgrep python                          # Find PIDs of Python processes
pgrep -f "data_pipeline"              # Find processes by full command line (-f)
pgrep -u username                     # Find processes by user (-u)
```

#### `kill` - Terminate Processes

**Signal Numbers:**
- `15` or `TERM` = Terminate gracefully (default)
- `9` or `KILL` = Force kill immediately
- `1` or `HUP` = Hangup (reload config)

```bash
kill PID                              # Terminate process gracefully (SIGTERM)
kill -9 PID                           # Force kill process immediately (-9 = SIGKILL)
kill -15 PID                          # Graceful termination (-15 = SIGTERM)
killall python                       # Kill all Python processes
killall -9 python                    # Force kill all Python processes
```

#### Background Processing

**Job Control Operators:**
- `&` = Run in background
- `Ctrl+Z` = Suspend current process
- `bg` = Put suspended job in background
- `fg` = Bring background job to foreground

```bash
python script.py &                    # Run in background (&)
nohup python script.py &              # Run in background, ignore hangup
python script.py > output.log 2>&1 &  # Background with output redirection

jobs                                   # List background jobs
fg                                     # Bring last job to foreground
fg %1                                  # Bring job 1 to foreground
bg %2                                  # Put job 2 in background
```

#### `top` and `htop` - System Monitor

**Navigation Keys in top:**
- `q` = Quit
- `k` = Kill process
- `M` = Sort by memory usage
- `P` = Sort by CPU usage
- `1` = Show individual CPU cores

```bash
top                                    # Real-time process monitor
top -u username                       # Show processes for specific user only
htop                                   # Enhanced process monitor (if installed)
```

---

### System Information

#### `df` - Disk Free Space

**Most Used Options:**
- `-h` = Human-readable sizes
- `-T` = Show filesystem type
- `-i` = Show inode usage

```bash
df                                     # Show disk usage in blocks
df -h                                  # Human-readable sizes (-h)
df -h /                               # Show usage for root filesystem only
df -T                                 # Show filesystem types (-T)
df -i                                 # Show inode usage (-i)
```

#### `free` - Memory Usage

**Most Used Options:**
- `-h` = Human-readable sizes
- `-m` = Show in megabytes
- `-g` = Show in gigabytes

```bash
free                                   # Memory usage in kilobytes
free -h                               # Human-readable memory usage (-h)
free -m                               # Memory usage in megabytes (-m)
free -g                               # Memory usage in gigabytes (-g)
```

---

## Networking & Remote Operations

### SSH & Remote Operations

#### `ssh` - Secure Shell

**Most Used Options:**
- `-i` = Identity file (private key)
- `-p` = Port number
- `-L` = Local port forwarding
- `-v` = Verbose output

```bash
ssh user@hostname                     # Basic SSH connection
ssh -i key.pem user@hostname         # Use specific private key (-i)
ssh -p 2222 user@hostname            # Use specific port (-p 2222)
ssh -L 8080:localhost:80 user@host   # Local port forwarding (-L local:remote)
ssh user@host 'command'              # Execute command on remote host
ssh user@host 'cd /data && ls -la'   # Execute multiple commands
```

#### `scp` - Secure Copy

**Direction Operators:**
- `local remote` = Copy from local to remote
- `remote local` = Copy from remote to local
- `-r` = Recursive (for directories)
- `-P` = Port number (capital P for scp)

```bash
scp file.txt user@host:/path/         # Copy file to remote
scp user@host:/path/file.txt .        # Copy file from remote to current dir (.)
scp -r directory/ user@host:/path/    # Copy directory recursively (-r)
scp -P 2222 file.txt user@host:/path/ # Use specific port (-P 2222)
```

#### `rsync` - Remote Sync

**Most Used Options:**
- `-a` = Archive mode (preserves permissions, times, etc.)
- `-v` = Verbose
- `-z` = Compress during transfer
- `-r` = Recursive
- `--delete` = Delete files that don't exist in source

```bash
rsync -avz source/ user@host:dest/    # Sync directories (-a=archive, -v=verbose, -z=compress)
rsync -avz --delete local/ remote/    # Sync and delete extra files in destination
rsync -avz user@host:remote/ local/   # Sync from remote to local
```

### Network Tools

#### `curl` - Transfer Data from Servers

**Most Used Options:**
- `-O` = Save with original filename
- `-o` = Save with specified filename
- `-L` = Follow redirects
- `-I` = Show headers only
- `-X` = HTTP method (GET, POST, PUT, DELETE)
- `-d` = Data for POST requests
- `-H` = Add headers

```bash
curl https://api.example.com           # GET request
curl -I https://api.example.com        # Show headers only (-I)
curl -L -O https://example.com/file.csv # Follow redirects and save file (-L -O)
curl -o data.csv https://example.com/data # Save with specific filename (-o)
curl -X POST -d '{"key":"value"}' url   # POST request with data (-X POST, -d)
curl -H "Content-Type: application/json" url # Add custom header (-H)
```

#### `wget` - Download Files

**Most Used Options:**
- `-O` = Save with specified filename
- `-c` = Continue partial download
- `-r` = Recursive download
- `-q` = Quiet mode

```bash
wget https://example.com/data.csv      # Download file
wget -O data.csv https://example.com/file # Save with specific name (-O)
wget -c https://example.com/big_file.zip # Continue interrupted download (-c)
wget -q https://example.com/file       # Quiet download (-q)
```

---

## Archive & Compression

### `tar` - Archive Files

**Mode Operators:**
- `c` = Create archive
- `x` = Extract archive
- `t` = List contents
- `f` = Specify filename
- `v` = Verbose
- `z` = Gzip compression
- `j` = Bzip2 compression

```bash
# Create archives
tar -cf archive.tar directory/        # Create archive (-c=create, -f=file)
tar -czf archive.tar.gz directory/    # Create compressed archive (-z=gzip)
tar -cjf archive.tar.bz2 directory/   # Create bzip2 compressed archive (-j)
tar -cvf archive.tar dir/              # Create with verbose output (-v)

# Extract archives
tar -xf archive.tar                   # Extract archive (-x=extract)
tar -xzf archive.tar.gz               # Extract gzip compressed archive
tar -xjf archive.tar.bz2              # Extract bzip2 compressed archive
tar -xvf archive.tar                  # Extract with verbose output

# List contents
tar -tf archive.tar                   # List contents (-t=list)
tar -tzf archive.tar.gz               # List contents of compressed archive
```

### `gzip` and `gunzip` - Compression

**Most Used Options:**
- `-d` = Decompress (same as gunzip)
- `-k` = Keep original file
- `-r` = Recursive compression
- `-v` = Verbose output
- `-1` to `-9` = Compression level (1=fast, 9=best compression)

```bash
gzip file.txt                         # Compress file (creates file.txt.gz, removes original)
gzip -k file.txt                      # Keep original file (-k)
gzip -v file.txt                      # Verbose compression (-v)
gzip -9 file.txt                      # Maximum compression (-9)
gunzip file.txt.gz                    # Decompress file
gzip -d file.txt.gz                   # Decompress using gzip -d
zcat file.txt.gz                      # View compressed file without extracting
zcat file.txt.gz | head -10           # View first 10 lines of compressed file
```

### `zip` and `unzip` - Zip Archives

**Most Used Options for zip:**
- `-r` = Recursive (include directories)
- `-v` = Verbose
- `-e` = Encrypt with password
- `-x` = Exclude files

**Most Used Options for unzip:**
- `-l` = List contents without extracting
- `-d` = Extract to specific directory
- `-q` = Quiet mode

```bash
zip archive.zip file1.txt file2.txt   # Create zip archive
zip -r backup.zip directory/          # Create zip with directory (-r=recursive)
zip -v -r backup.zip directory/       # Verbose zip creation (-v)
zip -e secure.zip sensitive_data.txt  # Create password-protected zip (-e)

unzip archive.zip                     # Extract zip archive
unzip -l archive.zip                  # List contents without extracting (-l)
unzip archive.zip -d /path/to/extract # Extract to specific directory (-d)
unzip -q archive.zip                  # Quiet extraction (-q)
```

---

## Shell Scripting Fundamentals

### Script Structure and Execution

#### Shebang (First Line)
**Common Shebangs:**
- `#!/bin/bash` = Use bash shell
- `#!/bin/sh` = Use system shell (more portable)
- `#!/usr/bin/env bash` = Find bash in PATH (more portable)

```bash
#!/bin/bash
# This is a comment
# Script: data_processor.sh
# Purpose: Process daily data files

echo "Script started at $(date)"
```

#### Making Scripts Executable
```bash
chmod +x script.sh                    # Make script executable
./script.sh                          # Run script from current directory
bash script.sh                       # Run script with bash (doesn't need +x)
sh script.sh                         # Run script with sh
```

### Variables and Parameter Handling

#### Variable Assignment and Usage
**Rules:**
- No spaces around `=` sign
- Use `# Linux & Shell Scripting Reference for Data Engineers

## Table of Contents
1. [File System Navigation & Management](#file-system-navigation--management)
2. [File Operations](#file-operations)
3. [Text Processing & Data Manipulation](#text-processing--data-manipulation)
4. [Process & System Management](#process--system-management)
5. [Networking & Remote Operations](#networking--remote-operations)
6. [Archive & Compression](#archive--compression)
7. [Shell Scripting Fundamentals](#shell-scripting-fundamentals)
8. [Data Engineering Specific Scripts](#data-engineering-specific-scripts)
9. [Performance Monitoring](#performance-monitoring)
10. [Useful One-Liners](#useful-one-liners)

---

## File System Navigation & Management

### Basic Navigation

#### `pwd` - Print Working Directory
Shows the full path of your current directory.
```bash
pwd                      # Shows current directory path
```

#### `ls` - List Directory Contents
**Most Used Options:**
- `-l` = Long format (detailed info)
- `-a` = Show all files (including hidden files starting with .)
- `-h` = Human-readable file sizes (K, M, G instead of bytes)
- `-t` = Sort by modification time (newest first)
- `-r` = Reverse order
- `-S` = Sort by file size (largest first)
- `-d` = Show directory itself, not its contents

```bash
ls                       # Basic listing
ls -l                    # Long format: permissions, owner, size, date
ls -la                   # Long format + hidden files
ls -lh                   # Long format + human-readable sizes
ls -lt                   # Sort by modification time (newest first)
ls -ltr                  # Sort by time, reverse (oldest first)
ls -lS                   # Sort by size (largest first)
ls -d */                 # List only directories
ls *.csv                 # List only CSV files
```

#### `cd` - Change Directory
**Special Directory References:**
- `.` = Current directory
- `..` = Parent directory
- `~` = Home directory
- `-` = Previous directory
- `/` = Root directory

```bash
cd /path/to/directory    # Go to specific path
cd ~                     # Go to home directory
cd                       # Also goes to home (shortcut)
cd ..                    # Go up one directory
cd ../..                 # Go up two directories
cd -                     # Go to previous directory
cd ./data                # Go to data subdirectory (. means current dir)
```

#### `mkdir` - Make Directory
**Most Used Options:**
- `-p` = Create parent directories if they don't exist
- `-v` = Verbose (show what's being created)
- `-m` = Set permissions while creating

```bash
mkdir data                           # Create single directory
mkdir -p data/raw/2023/january      # Create nested path (-p creates parents)
mkdir -v logs                       # Verbose output (-v shows creation)
mkdir data/{raw,processed,clean}    # Create multiple directories using brace expansion
mkdir -p project/{data,scripts,logs,config}  # Create project structure
```

#### `find` - Search for Files and Directories
**Path Operators:**
- `/` = Search entire system (root)
- `.` = Search current directory and subdirectories
- `~` = Search home directory and subdirectories
- `./dirname` = Search specific directory

**Most Used Options:**
- `-name` = Search by filename pattern
- `-type` = Search by type (f=file, d=directory, l=link)
- `-size` = Search by file size
- `-mtime` = Search by modification time
- `-exec` = Execute command on found files
- `-delete` = Delete found files

```bash
find . -name "*.csv"                 # Find CSV files in current directory (.)
find /data -name "*.csv"             # Find CSV files in /data directory
find ~ -name "config.txt"            # Find in home directory (~)
find . -type f                       # Find only files (-type f)
find . -type d                       # Find only directories (-type d)
find . -size +100M                   # Files larger than 100MB (+100M)
find . -size -1M                     # Files smaller than 1MB (-1M)
find . -mtime -7                     # Files modified in last 7 days (-7)
find . -mtime +30                    # Files older than 30 days (+30)
find . -name "*.log" -delete         # Find and delete log files
find . -name "*.csv" -exec ls -l {} \; # Execute ls -l on each found file
```

**Size Operators:**
- `+100M` = Larger than 100MB
- `-100M` = Smaller than 100MB
- `100M` = Exactly 100MB
- `c` = bytes, `k` = kilobytes, `M` = megabytes, `G` = gigabytes

---

### File Permissions & Ownership

#### `chmod` - Change File Permissions
**Permission Numbers:**
- `4` = Read (r)
- `2` = Write (w)  
- `1` = Execute (x)
- Add them together: `7` = rwx, `6` = rw-, `5` = r-x, `4` = r--

**Most Used Options:**
- `-R` = Recursive (apply to all files/directories inside)
- `+x` = Add execute permission
- `-x` = Remove execute permission

```bash
chmod 755 script.sh              # rwxr-xr-x (owner: rwx, group: r-x, others: r-x)
chmod 644 data.csv               # rw-r--r-- (owner: rw-, group: r--, others: r--)
chmod +x script.sh               # Add execute permission for all
chmod -x script.sh               # Remove execute permission for all
chmod u+x script.sh              # Add execute for user (owner) only
chmod g-w file.txt               # Remove write for group
chmod o-r file.txt               # Remove read for others
chmod -R 755 directory/          # Apply 755 to directory and all contents
```

**Permission Letters:**
- `u` = user (owner), `g` = group, `o` = others, `a` = all
- `+` = add permission, `-` = remove permission, `=` = set exact permission

#### `chown` - Change Ownership
```bash
chown user file.txt              # Change owner to 'user'
chown user:group file.txt        # Change owner to 'user' and group to 'group'
chown :group file.txt            # Change only group
chown -R user:group directory/   # Recursive ownership change
```

---

## File Operations

### Basic File Operations

#### `cp` - Copy Files
**Most Used Options:**
- `-r` or `-R` = Recursive (copy directories)
- `-i` = Interactive (ask before overwriting)
- `-v` = Verbose (show what's being copied)
- `-p` = Preserve permissions and timestamps
- `-u` = Update (copy only if source is newer)

```bash
cp file1.txt file2.txt           # Copy file1 to file2
cp -r source_dir/ dest_dir/      # Copy directory recursively (-r)
cp -i file.txt backup.txt        # Ask before overwriting (-i)
cp -v *.csv backup/              # Verbose copy of all CSV files
cp -p script.sh backup_script.sh # Preserve permissions (-p)
cp -u new_data.csv old_data.csv  # Copy only if newer (-u)
```

#### `mv` - Move/Rename Files
**Most Used Options:**
- `-i` = Interactive (ask before overwriting)
- `-v` = Verbose (show what's being moved)
- `-u` = Update (move only if source is newer)

```bash
mv old_name.txt new_name.txt     # Rename file
mv file.txt directory/           # Move file to directory
mv *.log logs/                   # Move all log files to logs directory
mv -i file.txt existing.txt      # Ask before overwriting (-i)
mv -v data/ backup/              # Verbose move (-v)
```

#### `rm` - Remove Files
**Most Used Options:**
- `-r` or `-R` = Recursive (remove directories)
- `-f` = Force (don't ask for confirmation)
- `-i` = Interactive (ask before each removal)
- `-v` = Verbose (show what's being removed)

```bash
rm file.txt                      # Remove single file
rm -r directory/                 # Remove directory recursively (-r)
rm -rf directory/                # Force remove without asking (-f)
rm -i *.tmp                      # Ask before removing each temp file (-i)
rm -v old_data.csv               # Verbose removal (-v)
```

**⚠️ Warning:** `rm -rf` is very dangerous - it will delete everything without asking!

#### `touch` - Create Empty Files or Update Timestamps
```bash
touch filename.txt               # Create empty file or update timestamp
touch data_{1..10}.csv           # Create files data_1.csv to data_10.csv
touch -t 202312251200 file.txt   # Set specific timestamp (YYYYMMDDhhmm)
```

#### `ln` - Create Links
**Link Types:**
- Symbolic link (`-s`): Points to another file (like a shortcut)
- Hard link: Another name for the same file

```bash
ln -s /path/to/file symlink_name    # Create symbolic link (-s)
ln file.txt hardlink_name           # Create hard link
ln -sf new_target existing_link     # Force update symbolic link (-f)
```

---

### File Content Operations

#### `cat` - Display File Contents
**Most Used Options:**
- `-n` = Number all lines
- `-b` = Number non-empty lines only
- `-A` = Show all characters (including hidden ones)

```bash
cat file.txt                     # Display entire file
cat -n file.txt                  # Display with line numbers (-n)
cat file1.txt file2.txt          # Display multiple files
cat > newfile.txt                # Create file and type content (Ctrl+D to finish)
cat file1.txt file2.txt > combined.txt  # Combine files
```

#### `less` - View Files Page by Page
**Navigation Keys in less:**
- `Space` or `f` = Next page
- `b` = Previous page
- `/pattern` = Search forward
- `?pattern` = Search backward
- `q` = Quit

```bash
less file.txt                    # View file page by page
less +50 file.txt                # Start at line 50
less +/ERROR logfile.txt         # Start at first occurrence of "ERROR"
```

#### `head` - Show First Lines
**Most Used Options:**
- `-n` = Number of lines to show
- `-c` = Number of characters to show

```bash
head file.txt                    # First 10 lines (default)
head -n 20 file.csv              # First 20 lines (-n 20)
head -5 file.txt                 # First 5 lines (shortcut for -n 5)
head -c 100 file.txt             # First 100 characters (-c)
head -n -5 file.txt              # All except last 5 lines
```

#### `tail` - Show Last Lines  
**Most Used Options:**
- `-n` = Number of lines to show
- `-f` = Follow (keep showing new lines as they're added)
- `-c` = Number of characters to show

```bash
tail file.txt                    # Last 10 lines (default)
tail -n 50 file.log              # Last 50 lines (-n 50)
tail -20 file.txt                # Last 20 lines (shortcut)
tail -f application.log          # Follow log file in real-time (-f)
tail -f -n 100 app.log           # Follow last 100 lines
tail +10 file.txt                # From line 10 to end
```

#### File Information Commands

#### `wc` - Word Count
**Most Used Options:**
- `-l` = Count lines
- `-w` = Count words  
- `-c` = Count characters
- `-m` = Count characters (multibyte aware)

```bash
wc file.txt                      # Lines, words, characters
wc -l file.txt                   # Count lines only (-l)
wc -w file.txt                   # Count words only (-w)
wc -c file.txt                   # Count characters only (-c)
wc -l *.csv                      # Line count for all CSV files
```

#### `file` - Determine File Type
```bash
file data.csv                    # Shows file type and encoding
file *                          # Show file type for all files
file -b script.sh               # Brief output (no filename)
```

#### `du` - Disk Usage
**Most Used Options:**
- `-h` = Human-readable sizes
- `-s` = Summary (total size only)
- `-a` = Show all files, not just directories
- `-d` = Depth limit

```bash
du -h file.txt                   # File size in human-readable format
du -sh directory/                # Total directory size (-s for summary)
du -h --max-depth=1              # Size of immediate subdirectories only
du -ah directory/                # All files with sizes (-a)
```

---

## Text Processing & Data Manipulation

### `grep` - Pattern Matching and Searching

**Most Used Options:**
- `-i` = Case insensitive
- `-v` = Invert match (show non-matching lines)
- `-n` = Show line numbers
- `-r` = Recursive search in directories
- `-c` = Count matches
- `-l` = Show only filenames with matches
- `-A` = Show lines after match
- `-B` = Show lines before match
- `-C` = Show lines before and after match

```bash
# Basic search
grep "pattern" file.txt              # Find lines containing "pattern"
grep -i "error" log.txt              # Case insensitive search (-i)
grep -v "DEBUG" log.txt              # Show lines NOT containing "DEBUG" (-v)
grep -n "TODO" script.py             # Show line numbers (-n)
grep -c "ERROR" log.txt              # Count matching lines (-c)

# Context searches
grep -A 3 "ERROR" log.txt            # Show 3 lines after match (-A 3)
grep -B 2 "ERROR" log.txt            # Show 2 lines before match (-B 2)
grep -C 2 "ERROR" log.txt            # Show 2 lines before and after (-C 2)

# File operations
grep -r "pattern" directory/         # Search recursively in all files (-r)
grep -l "pattern" *.txt              # Show only filenames with matches (-l)
grep -L "pattern" *.txt              # Show filenames WITHOUT matches (-L)

# Advanced patterns (regex)
grep "^ERROR" logfile.txt            # Lines starting with ERROR (^)
grep "ERROR$" logfile.txt            # Lines ending with ERROR ($)
grep "^$" file.txt                   # Empty lines
grep -E "pattern1|pattern2" file.txt # Multiple patterns (-E enables extended regex)
grep -P "\d{4}-\d{2}-\d{2}" file.txt # Perl regex for dates (YYYY-MM-DD)
```

**Pattern Operators:**
- `^` = Start of line
- `$` = End of line  
- `.` = Any single character
- `*` = Zero or more of previous character
- `+` = One or more of previous character (with -E)
- `|` = OR operator (with -E)
- `[]` = Character class (e.g., `[0-9]` for digits)

### `sed` - Stream Editor (Find and Replace)

**Most Used Options:**
- `-i` = Edit files in-place
- `-n` = Suppress default output (use with p command)
- `-e` = Multiple editing commands
- `g` = Global flag (replace all occurrences in line)
- `i` = Case insensitive flag

```bash
# Basic substitution (s = substitute)
sed 's/old/new/' file.txt              # Replace first occurrence per line
sed 's/old/new/g' file.txt             # Replace all occurrences in each line (g = global)
sed 's/old/new/gi' file.txt            # Case insensitive replacement (i = ignore case)
sed -i 's/old/new/g' file.txt          # Edit file in-place (-i)

# Line operations
sed -n '10p' file.txt                  # Print only line 10 (-n suppresses other output, p = print)
sed -n '10,20p' file.txt               # Print lines 10-20
sed '5d' file.txt                      # Delete line 5 (d = delete)
sed '/pattern/d' file.txt              # Delete lines matching pattern
sed '/^$/d' file.txt                   # Delete empty lines

# Insert and append
sed '1i\Header line' file.csv          # Insert line before line 1 (i = insert)
sed '$a\Footer line' file.txt          # Append line after last line (a = append, $ = last line)

# Advanced sed
sed 's/\([0-9]\{4\}\)-\([0-9]\{2\}\)-\([0-9]\{2\}\)/\3\/\2\/\1/' file.txt  # Change date format
sed -e 's/old1/new1/g' -e 's/old2/new2/g' file.txt  # Multiple replacements (-e)
```

**Address Operators:**
- `5` = Line 5
- `$` = Last line
- `1,10` = Lines 1 to 10
- `/pattern/` = Lines matching pattern

### `awk` - Text Processing and Data Extraction

**Built-in Variables:**
- `$0` = Entire line
- `$1, $2, $3...` = First field, second field, third field, etc.
- `$NF` = Last field (NF = Number of Fields)
- `NR` = Number of Records (line number)
- `NF` = Number of Fields in current line
- `FS` = Field Separator (default is space/tab)

**Most Used Options:**
- `-F` = Set field separator
- `-v` = Set variables

```bash
# Basic field extraction
awk '{print $1}' file.txt              # Print first column/field
awk '{print $2, $4}' file.txt          # Print columns 2 and 4
awk '{print $NF}' file.txt             # Print last column ($NF = last field)
awk '{print NR, $0}' file.txt          # Add line numbers (NR = record number)

# Field separators
awk -F',' '{print $2}' data.csv        # Use comma as separator for CSV (-F',')
awk -F'\t' '{print $1, $3}' data.tsv   # Use tab as separator for TSV
awk 'BEGIN{FS=","} {print $1, $3}'     # Set separator in BEGIN block

# Conditional processing
awk '$3 > 100' data.txt                # Print lines where column 3 > 100
awk '$1 == "ERROR"' log.txt            # Print lines where first column equals "ERROR"
awk '/pattern/ {print $1, $2}' file    # Print columns 1,2 for lines matching pattern
awk 'NR > 1 {print $0}' data.csv       # Skip header row (NR > 1)

# Calculations
awk '{sum += $3} END {print sum}' data.txt        # Sum column 3
awk '{sum += $2; count++} END {print sum/count}' data.txt  # Average of column 2
awk '{if($3 > max) max=$3} END {print max}' data.txt      # Find maximum in column 3

# String operations
awk '{print length($0)}' file.txt      # Print length of each line
awk '{print tolower($1)}' file.txt     # Convert first field to lowercase
awk '{print substr($1,1,5)}' file.txt  # Print first 5 characters of field 1
```

**Comparison Operators:**
- `==` = Equal to
- `!=` = Not equal to
- `>` = Greater than
- `<` = Less than
- `>=` = Greater than or equal
- `<=` = Less than or equal
- `~` = Matches regex pattern
- `!~` = Doesn't match regex pattern

### `sort` - Sort Lines

**Most Used Options:**
- `-n` = Numerical sort
- `-r` = Reverse order
- `-k` = Sort by specific field/column
- `-t` = Field separator
- `-u` = Unique (remove duplicates)
- `-f` = Ignore case

```bash
sort file.txt                          # Alphabetical sort
sort -n numbers.txt                     # Numerical sort (-n)
sort -r file.txt                        # Reverse order (-r)
sort -u file.txt                        # Remove duplicates (-u)
sort -f file.txt                        # Case insensitive (-f)

# Field-based sorting
sort -k2 file.txt                       # Sort by column 2 (-k2)
sort -k2,2 file.txt                     # Sort by column 2 only (not beyond)
sort -k2n file.txt                      # Sort by column 2 numerically
sort -t',' -k3 data.csv                 # Sort CSV by column 3 (-t',' sets comma separator)
sort -t',' -k3nr data.csv               # Sort CSV by column 3, numeric, reverse
```

### `uniq` - Remove Duplicate Lines

**Important:** `uniq` only removes consecutive duplicates, so usually used with `sort` first.

**Most Used Options:**
- `-c` = Count occurrences
- `-d` = Show only duplicates
- `-u` = Show only unique lines (no duplicates)
- `-i` = Ignore case

```bash
uniq file.txt                          # Remove consecutive duplicates
sort file.txt | uniq                   # Remove all duplicates (sort first)
sort file.txt | uniq -c                # Count occurrences (-c)
sort file.txt | uniq -d                # Show only duplicated lines (-d)
sort file.txt | uniq -u                # Show only unique lines (-u)
uniq -c -i file.txt                    # Count ignoring case (-i)
```

### `cut` - Extract Columns

**Most Used Options:**
- `-d` = Delimiter/separator
- `-f` = Fields to extract
- `-c` = Characters to extract

```bash
cut -d',' -f1 data.csv                 # Extract column 1 from CSV (-d',' sets delimiter)
cut -d',' -f1,3,5 data.csv             # Extract columns 1, 3, and 5
cut -d',' -f2- data.csv                # Extract from column 2 to end (f2-)
cut -c1-10 file.txt                    # Extract characters 1-10 (-c1-10)
cut -d' ' -f1 /etc/passwd              # Extract first field (username) from passwd
```

**Field Operators:**
- `1` = Field 1
- `1,3,5` = Fields 1, 3, and 5
- `2-5` = Fields 2 through 5
- `2-` = Field 2 to end of line
- `-3` = Fields 1 through 3

### `paste` - Combine Files Side by Side

**Most Used Options:**
- `-d` = Delimiter between merged fields
- `-s` = Serial mode (one file at a time)

```bash
paste file1.txt file2.txt              # Merge files side by side (tab-separated)
paste -d',' file1.txt file2.txt        # Use comma as delimiter (-d',')
paste -s file.txt                      # Merge all lines into one line (-s)
```

---

## Process & System Management

### Process Management

#### `ps` - Process Status

**Most Used Options:**
- `a` = Show processes from all users
- `u` = Show user-oriented format
- `x` = Show processes not attached to terminal
- `aux` = Comprehensive process list (most common)
- `-e` = Show all processes
- `-f` = Full format

```bash
ps                                     # Show processes for current user
ps aux                                 # Show all processes with detailed info (a=all users, u=user format, x=all processes)
ps aux | grep python                  # Find Python processes
ps -ef                                 # All processes in full format (-e=all, -f=full)
ps -u username                        # Show processes for specific user
ps -p PID                             # Show specific process by PID
```

#### `pgrep` - Process Grep
```bash
pgrep python                          # Find PIDs of Python processes
pgrep -f "data_pipeline"              # Find processes by full command line (-f)
pgrep -u username                     # Find processes by user (-u)
```

#### `kill` - Terminate Processes

**Signal Numbers:**
- `15` or `TERM` = Terminate gracefully (default)
- `9` or `KILL` = Force kill immediately
- `1` or `HUP` = Hangup (reload config)

```bash
kill PID                              # Terminate process gracefully (SIGTERM)
kill -9 PID                           # Force kill process immediately (-9 = SIGKILL)
kill -15 PID                          # Graceful termination (-15 = SIGTERM)
killall python                       # Kill all Python processes
killall -9 python                    # Force kill all Python processes
```

#### Background Processing

**Job Control Operators:**
- `&` = Run in background
- `Ctrl+Z` = Suspend current process
- `bg` = Put suspended job in background
- `fg` = Bring background job to foreground

```bash
python script.py &                    # Run in background (&)
nohup python script.py &              # Run in background, ignore hangup
python script.py > output.log 2>&1 &  # Background with output redirection

jobs                                   # List background jobs
fg                                     # Bring last job to foreground
fg %1                                  # Bring job 1 to foreground
bg %2                                  # Put job 2 in background
```

#### `top` and `htop` - System Monitor

**Navigation Keys in top:**
- `q` = Quit
- `k` = Kill process
- `M` = Sort by memory usage
- `P` = Sort by CPU usage
- `1` = Show individual CPU cores

```bash
top                                    # Real-time process monitor
top -u username                       # Show processes for specific user only
htop                                   # Enhanced process monitor (if installed)
```

---

### System Information

#### `df` - Disk Free Space

**Most Used Options:**
- `-h` = Human-readable sizes
- `-T` = Show filesystem type
- `-i` = Show inode usage

```bash
df                                     # Show disk usage in blocks
df -h                                  # Human-readable sizes (-h)
df -h /                               # Show usage for root filesystem only
df -T                                 # Show filesystem types (-T)
df -i                                 # Show inode usage (-i)
```

#### `free` - Memory Usage

**Most Used Options:**
- `-h` = Human-readable sizes
- `-m` = Show in megabytes
- `-g` = Show in gigabytes

```bash
free                                   # Memory usage in kilobytes
free -h                               # Human-readable memory usage (-h)
free -m                               # Memory usage in megabytes (-m)
free -g                               # Memory usage in gigabytes (-g)
```

---

## Networking & Remote Operations

### SSH & Remote Operations

#### `ssh` - Secure Shell

**Most Used Options:**
- `-i` = Identity file (private key)
- `-p` = Port number
- `-L` = Local port forwarding
- `-v` = Verbose output

```bash
ssh user@hostname                     # Basic SSH connection
ssh -i key.pem user@hostname         # Use specific private key (-i)
ssh -p 2222 user@hostname            # Use specific port (-p 2222)
ssh -L 8080:localhost:80 user@host   # Local port forwarding (-L local:remote)
ssh user@host 'command'              # Execute command on remote host
ssh user@host 'cd /data && ls -la'   # Execute multiple commands
```

#### `scp` - Secure Copy

**Direction Operators:**
- `local remote` = Copy from local to remote
- `remote local` = Copy from remote to local
- `-r` = Recursive (for directories)
- `-P` = Port number (capital P for scp)

```bash
scp file.txt user@host:/path/         # Copy file to remote
scp user@host:/path/file.txt .        # Copy file from remote to current dir (.)
scp -r directory/ user@host:/path/    # Copy directory recursively (-r)
scp -P 2222 file.txt user@host:/path/ # Use specific port (-P 2222)
```

#### `rsync` - Remote Sync

**Most Used Options:**
- `-a` = Archive mode (preserves permissions, times, etc.)
- `-v` = Verbose
- `-z` = Compress during transfer
- `-r` = Recursive
- `--delete` = Delete files that don't exist in source

```bash
rsync -avz source/ user@host:dest/    # Sync directories (-a=archive, -v=verbose, -z=compress)
rsync -avz --delete local/ remote/    # Sync and delete extra files in destination
rsync -avz user@host:remote/ local/   # Sync from remote to local
```

### Network Tools

#### `curl` - Transfer Data from Servers

**Most Used Options:**
- `-O` = Save with original filename
- `-o` = Save with specified filename
- `-L` = Follow redirects
- `-I` = Show headers only
- `-X` = HTTP method (GET, POST, PUT, DELETE)
- `-d` = Data for POST requests
- `-H` = Add headers

```bash
curl https://api.example.com           # GET request
curl -I https://api.example.com        # Show headers only (-I)
curl -L -O https://example.com/file.csv # Follow redirects and save file (-L -O)
curl -o data.csv https://example.com/data # Save with specific filename (-o)
curl -X POST -d '{"key":"value"}' url   # POST request with data (-X POST, -d)
curl -H "Content-Type: application/json" url # Add custom header (-H)
```

#### `wget` - Download Files

**Most Used Options:**
- `-O` = Save with specified filename
- `-c` = Continue partial download
- `-r` = Recursive download
- `-q` = Quiet mode

```bash
wget https://example.com/data.csv      # Download file
wget -O data.csv https://example.com/file # Save with specific name (-O)
wget -c https://example.com/big_file.zip # Continue interrupted download (-c)
wget -q https://example.com/file       # Quiet download (-q)
```

---

## Archive & Compression

### `tar` - Archive Files

**Mode Operators:**
- `c` = Create archive
- `x` = Extract archive
- `t` = List contents
- `f` = Specify filename
- `v` = Verbose
- `z` = Gzip compression
- `j` = Bzip2 compression

```bash
# Create archives
tar -cf archive.tar directory/        # Create archive (-c=create, -f=file)
tar -czf archive.tar.gz directory/    # Create compressed archive (-z=gzip)
tar -cjf archive.tar.bz2 directory/   # Create bzip2 compressed archive (-j)
tar -cvf archive.tar dir/              # Create with verbose output (-v)

# Extract archives
tar -xf archive.tar                   # Extract archive (-x=extract)
tar -xzf archive.tar.gz               # Extract gzip compressed archive
tar -xjf archive.tar.bz2              # Extract bzip2 compressed archive
tar -xvf archive.tar                  # Extract with verbose output

# List contents
tar -tf archive.tar                   # List contents (-t=list)
tar -tzf archive.tar.gz               # List contents of compressed archive
```

### `gzip` and `gunzip` - Compression

**Most Used Options:**
- `-d` = Decompress (same as gunzip)
- `-k` = Keep original file
- `-r` = Recursive compression
- `-v` = Verbose output
- `-1` to `-9` = Compression level (1=fast, 9=best compression)

```bash
gzip file.txt                         # Compress file (creates file.txt.gz, removes original)
gzip -k file.txt                      # Keep original file (-k)
gzip -v file.txt                      # Verbose compression (-v)
gzip -9 file.txt                      # Maximum compression (-9)
gunzip file.txt.gz                    # Decompress file
gzip -d file.txt.gz                   # Decompress using gzip -d
zcat file.txt.gz                      # View compressed file without extracting
 to access variable value
- Use `${var}` for clarity or when adjacent to other text

```bash
# Variable assignment (no spaces around =)
name="John Doe"
count=42
current_date=$(date +%Y%m%d)          # Command substitution with $()
current_date=`date +%Y%m%d`           # Alternative command substitution with backticks

# Variable usage
echo $name                           # Simple usage
echo ${name}                         # Clear boundaries
echo "Hello, $name!"                 # Inside double quotes (variables expand)
echo 'Hello, $name!'                 # Inside single quotes (literal text)
echo "File_${date}.csv"              # Clear variable boundaries

# Special variables for arithmetic
result=$((5 + 3))                    # Arithmetic expansion
result=$(( count * 2 ))              # Spaces are OK inside $(())
```

#### Environment Variables
**Most Important Environment Variables:**
- `$HOME` = User's home directory
- `$USER` = Current username  
- `$PATH` = Directories searched for commands
- `$PWD` = Current working directory
- `$SHELL` = Current shell

```bash
# Setting environment variables
export DATA_DIR="/opt/data"          # Available to child processes
export PATH="/opt/spark/bin:$PATH"   # Add to existing PATH

# Common data engineering environment variables
export SPARK_HOME="/opt/spark"
export HADOOP_HOME="/opt/hadoop"
export JAVA_HOME="/usr/lib/jvm/java-8-openjdk"
export PYTHONPATH="$PYTHONPATH:/custom/modules"
```

#### Command Line Parameters
**Special Parameter Variables:**
- `$0` = Script name
- `$1, $2, $3...` = First, second, third parameters
- `$@` = All parameters as separate words
- `$*` = All parameters as single word
- `$#` = Number of parameters
- `$` = Process ID of script
- `$?` = Exit status of last command

```bash
#!/bin/bash
# Script: process_data.sh
# Usage: ./process_data.sh input.csv output.csv

script_name=$0                       # Script name
input_file=$1                        # First parameter
output_file=$2                       # Second parameter
all_params="$@"                      # All parameters
param_count=$#                       # Number of parameters

echo "Script: $script_name"
echo "Input: $input_file"
echo "Output: $output_file"  
echo "Total parameters: $param_count"

# Check if enough parameters provided
if [ $# -lt 2 ]; then
    echo "Usage: $0 input_file output_file"
    exit 1
fi
```

#### Arrays
**Array Operations:**
- `array[index]` = Set element
- `${array[index]}` = Get element
- `${array[@]}` = All elements
- `${#array[@]}` = Array length

```bash
# Array creation
files=("data1.csv" "data2.csv" "data3.csv")
files[3]="data4.csv"                 # Add element

# Array access
echo ${files[0]}                     # First element (index 0)
echo ${files[@]}                     # All elements
echo ${#files[@]}                    # Array length

# Loop through array
for file in "${files[@]}"; do
    echo "Processing $file"
done
```

### Control Structures

#### Conditional Statements (if/then/else)

**File Test Operators:**
- `-f file` = File exists and is regular file
- `-d dir` = Directory exists
- `-r file` = File is readable
- `-w file` = File is writable  
- `-x file` = File is executable
- `-s file` = File exists and is not empty
- `-e file` = File exists (any type)

**String Comparison Operators:**
- `=` = Equal (use with [ ])
- `==` = Equal (use with [[ ]])
- `!=` = Not equal
- `-z string` = String is empty
- `-n string` = String is not empty

**Numeric Comparison Operators:**
- `-eq` = Equal
- `-ne` = Not equal
- `-gt` = Greater than
- `-lt` = Less than
- `-ge` = Greater than or equal
- `-le` = Less than or equal

```bash
# File tests
if [ -f "$input_file" ]; then
    echo "Input file exists"
elif [ -d "$input_file" ]; then
    echo "Input is a directory"
else
    echo "Input file not found"
    exit 1
fi

# Multiple conditions
if [ -f "$file" ] && [ -r "$file" ]; then    # AND condition
    echo "File exists and is readable"
fi

if [ "$status" = "success" ] || [ "$status" = "completed" ]; then  # OR condition
    echo "Process finished successfully"
fi

# String tests
if [ -z "$variable" ]; then          # Check if empty
    echo "Variable is empty"
fi

if [ -n "$variable" ]; then          # Check if not empty
    echo "Variable has value: $variable"
fi

# Numeric comparisons
if [ "$count" -gt 100 ]; then       # Greater than
    echo "Count is greater than 100"
fi

if [ "$age" -ge 18 ] && [ "$age" -lt 65 ]; then
    echo "Working age"
fi

# Modern bash syntax [[ ]] (more features)
if [[ "$filename" == *.csv ]]; then  # Pattern matching
    echo "CSV file detected"
fi

if [[ "$text" =~ [0-9]+ ]]; then    # Regex matching
    echo "Contains numbers"
fi
```

#### Loops

**For Loop Types:**
- `for item in list` = Iterate over list
- `for ((init; condition; increment))` = C-style loop
- `for file in *.csv` = Iterate over matching files

```bash
# For loop with list
for file in file1.txt file2.txt file3.txt; do
    echo "Processing $file"
done

# For loop with glob pattern
for csv_file in *.csv; do
    echo "Found CSV: $csv_file"
    # Process each CSV file
done

# For loop with array
files=("data1.csv" "data2.csv" "data3.csv")
for file in "${files[@]}"; do
    echo "Processing $file"
done

# For loop with range
for i in {1..10}; do                 # Numbers 1 to 10
    echo "Iteration $i"
done

for i in {01..12}; do                # Zero-padded: 01, 02, ..., 12
    echo "Month: $i"
done

# C-style for loop
for ((i=1; i<=10; i++)); do
    echo "Counter: $i"
done

# While loop
counter=1
while [ $counter -le 5 ]; do
    echo "While loop iteration: $counter"
    counter=$((counter + 1))         # Increment counter
done

# Read file line by line
while read -r line; do
    echo "Line: $line"
done < input.txt

# Until loop (opposite of while)
counter=1
until [ $counter -gt 5 ]; do
    echo "Until loop iteration: $counter"
    counter=$((counter + 1))
done
```

#### Case Statement
**Pattern Matching:**
- `*` = Match anything
- `*.csv` = Match files ending in .csv
- `[0-9]` = Match single digit
- `pattern1|pattern2` = Match either pattern

```bash
case "$file_extension" in
    "csv")
        echo "Comma-separated values file"
        process_csv "$filename"
        ;;
    "json")
        echo "JSON file"
        process_json "$filename"
        ;;
    "xml")
        echo "XML file"
        process_xml "$filename"
        ;;
    "txt"|"log")                     # Multiple patterns
        echo "Text or log file"
        ;;
    *)                               # Default case
        echo "Unknown file type: $file_extension"
        ;;
esac

# Case with patterns
case "$filename" in
    *.csv)
        echo "CSV file detected"
        ;;
    data_[0-9][0-9][0-9][0-9]*)     # Pattern: data_YYYY*
        echo "Year-based data file"
        ;;
    backup_*)
        echo "Backup file"
        ;;
esac
```

### Functions

**Function Definition Syntax:**
- `function name() { ... }` = Function with function keyword
- `name() { ... }` = Function without function keyword

```bash
# Function definition
log_message() {
    local message="$1"               # Local variable (only exists in function)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" >> "$LOG_FILE"
}

# Function with multiple parameters
process_data() {
    local input_file="$1"
    local output_file="$2"
    local format="$3"
    
    # Check parameters
    if [ $# -lt 3 ]; then
        echo "Error: process_data requires 3 parameters"
        return 1                     # Return error code
    fi
    
    echo "Processing $input_file -> $output_file (format: $format)"
    # Processing logic here
    
    return 0                         # Return success code
}

# Function with return value (via echo)
get_file_size() {
    local file="$1"
    if [ -f "$file" ]; then
        stat -c%s "$file"            # Output file size
    else
        echo "0"
    fi
}

# Using functions
log_message "Starting data processing"
process_data "input.csv" "output.csv" "json"

if [ $? -eq 0 ]; then               # Check return code of last command
    log_message "Processing completed successfully"
else
    log_message "Processing failed"
    exit 1
fi

# Capture function output
file_size=$(get_file_size "data.csv")
echo "File size: $file_size bytes"
```

### Error Handling and Debugging

#### Set Options for Error Handling
```bash
#!/bin/bash
set -e                              # Exit immediately if command fails
set -u                              # Exit if undefined variable is used
set -o pipefail                     # Exit if any command in pipeline fails

# Alternative: combine all three
set -euo pipefail
```

#### Error Checking Patterns
```bash
# Check if command exists
if ! command -v python3 >/dev/null 2>&1; then
    echo "Error: python3 not found"
    exit 1
fi

# Check command success
if ! mysql -u user -p database < script.sql; then
    echo "Database script failed"
    exit 1
fi

# Try-catch equivalent using { } and ||
{
    risky_command
    another_risky_command
} || {
    echo "One of the commands failed"
    cleanup_function
    exit 1
}

# Check file operations
if ! cp "$source" "$destination"; then
    echo "Failed to copy $source to $destination"
    exit 1
fi
```

#### Debugging Options
```bash
#!/bin/bash -x                      # Enable debug mode (shows each command)

# Or enable/disable debugging in script
set -x                              # Enable debugging
some_commands_here
set +x                              # Disable debugging

# Debug only specific sections
debug_function() {
    set -x
    complex_command
    another_command
    set +x
}
```

---

## Data Engineering Specific Scripts

### CSV Processing Pipeline Script
```bash
#!/bin/bash
# CSV Data Processing Pipeline
# Usage: ./process_csv_pipeline.sh input_directory output_directory

set -euo pipefail                   # Exit on any error

# Configuration
INPUT_DIR="${1:-data/raw}"          # Default to data/raw if not provided
OUTPUT_DIR="${2:-data/processed}"   # Default to data/processed if not provided
LOG_FILE="pipeline_$(date +%Y%m%d_%H%M%S).log"
TEMP_DIR="/tmp/csv_processing_$"   # Unique temp directory using process ID

# Function to log messages
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to clean up on exit
cleanup() {
    log_message "INFO" "Cleaning up temporary files"
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT                   # Run cleanup on script exit

# Validate CSV file
validate_csv() {
    local file="$1"
    local line_count=$(wc -l < "$file")
    local field_count=$(head -1 "$file" | tr ',' '\n' | wc -l)
    
    if [ $line_count -lt 2 ]; then
        log_message "ERROR" "File $file has less than 2 lines"
        return 1
    fi
    
    log_message "INFO" "File $file: $line_count lines, $field_count fields"
    return 0
}

# Process individual CSV file
process_csv_file() {
    local input_file="$1"
    local output_file="$2"
    
    log_message "INFO" "Processing $input_file"
    
    # Validate input
    if ! validate_csv "$input_file"; then
        return 1
    fi
    
    # Processing steps:
    # 1. Remove empty lines
    # 2. Remove rows with NULL values in critical columns
    # 3. Sort by first column
    # 4. Remove duplicates based on first column
    
    {
        head -1 "$input_file"        # Keep header
        tail -n +2 "$input_file" | \ # Skip header
        grep -v '^ | \             # Remove empty lines
        awk -F',' '$1 != "" && $1 != "NULL"' | \  # Remove rows with empty/NULL first column
        sort -t',' -k1,1 | \         # Sort by first column
        awk -F',' '!seen[$1]++' \    # Remove duplicates based on first column
    } > "$output_file"
    
    local output_lines=$(wc -l < "$output_file")
    log_message "INFO" "Output file $output_file created with $output_lines lines"
}

# Main processing function
main() {
    log_message "INFO" "Starting CSV processing pipeline"
    log_message "INFO" "Input directory: $INPUT_DIR"
    log_message "INFO" "Output directory: $OUTPUT_DIR"
    
    # Create directories
    mkdir -p "$OUTPUT_DIR" "$TEMP_DIR"
    
    # Check if input directory exists
    if [ ! -d "$INPUT_DIR" ]; then
        log_message "ERROR" "Input directory $INPUT_DIR does not exist"
        exit 1
    fi
    
    # Process all CSV files
    local processed_count=0
    local failed_count=0
    
    for csv_file in "$INPUT_DIR"/*.csv; do
        # Check if glob matched any files
        [ -f "$csv_file" ] || continue
        
        local filename=$(basename "$csv_file")
        local output_file="$OUTPUT_DIR/processed_$filename"
        
        if process_csv_file "$csv_file" "$output_file"; then
            processed_count=$((processed_count + 1))
        else
            failed_count=$((failed_count + 1))
            log_message "ERROR" "Failed to process $csv_file"
        fi
    done
    
    log_message "INFO" "Pipeline completed: $processed_count processed, $failed_count failed"
    
    if [ $failed_count -gt 0 ]; then
        exit 1
    fi
}

# Execute main function with all parameters
main "$@"
```

### Log Analysis Script
```bash
#!/bin/bash
# Advanced Log Analysis Script
# Analyzes application logs and generates comprehensive report

set -euo pipefail

# Configuration
LOG_FILE="${1:-/var/log/application.log}"
REPORT_DIR="log_reports"
REPORT_FILE="$REPORT_DIR/log_analysis_$(date +%Y%m%d_%H%M%S).txt"
ERROR_THRESHOLD=100

# Create report directory
mkdir -p "$REPORT_DIR"

# Function to analyze log patterns
analyze_errors() {
    local logfile="$1"
    
    echo "=== ERROR ANALYSIS ==="
    echo "Error count by type:"
    grep -i "error\|exception\|failed" "$logfile" 2>/dev/null | \
    awk '{
        # Extract error type from log line
        if (match($0, /ERROR|Exception|Failed/)) {
            error_type = substr($0, RSTART, RLENGTH)
            gsub(/[^a-zA-Z]/, "", error_type)  # Clean error type
            errors[error_type]++
        }
    }
    END {
        for (error in errors) {
            printf "%-20s: %d\n", error, errors[error]
        }
    }' | sort -k2 -nr
    
    echo -e "\nTotal errors: $(grep -ci "error\|exception\|failed" "$logfile" 2>/dev/null || echo 0)"
}

# Function to analyze access patterns
analyze_access() {
    local logfile="$1"
    
    echo -e "\n=== ACCESS ANALYSIS ==="
    
    # Top IP addresses
    echo "Top 10 IP addresses:"
    awk '{print $1}' "$logfile" 2>/dev/null | \
    grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3} | \
    sort | uniq -c | sort -rn | head -10 | \
    awk '{printf "%-15s: %d requests\n", $2, $1}'
    
    # Hourly distribution
    echo -e "\nHourly request distribution:"
    awk '{
        # Extract hour from timestamp (assuming format like [DD/Mon/YYYY:HH:MM:SS])
        if (match($0, /\[[0-9]{2}\/[A-Za-z]{3}\/[0-9]{4}:([0-9]{2})/, arr)) {
            hours[arr[1]]++
        }
    }
    END {
        for (hour=0; hour<24; hour++) {
            printf "%02d:00 - %02d:59: %d requests\n", hour, hour, hours[sprintf("%02d", hour)]+0
        }
    }' "$logfile" 2>/dev/null
}

# Function to analyze response codes
analyze_response_codes() {
    local logfile="$1"
    
    echo -e "\n=== HTTP RESPONSE CODE ANALYSIS ==="
    awk '{
        # Look for HTTP response codes (3-digit numbers)
        for (i=1; i<=NF; i++) {
            if ($i ~ /^[1-5][0-9][0-9]$/) {
                codes[$i]++
                break
            }
        }
    }
    END {
        for (code in codes) {
            status = ""
            if (code < 300) status = "(Success)"
            else if (code < 400) status = "(Redirection)"
            else if (code < 500) status = "(Client Error)"
            else status = "(Server Error)"
            
            printf "%-3s %s: %d\n", code, status, codes[code]
        }
    }' "$logfile" 2>/dev/null | sort
}

# Function to find slow requests
analyze_performance() {
    local logfile="$1"
    
    echo -e "\n=== PERFORMANCE ANALYSIS ==="
    
    # Look for response times (assuming they're in milliseconds or seconds)
    echo "Slow requests (>1000ms):"
    awk '{
        for (i=1; i<=NF; i++) {
            if ($i ~ /^[0-9]+ms$/ && substr($i, 1, length($i)-2) > 1000) {
                printf "Line %d: %s (Response time: %s)\n", NR, $0, $i
            }
        }
    }' "$logfile" 2>/dev/null | head -20
}

# Function to generate summary statistics  
generate_summary() {
    local logfile="$1"
    
    echo -e "\n=== SUMMARY STATISTICS ==="
    
    local total_lines=$(wc -l < "$logfile" 2>/dev/null || echo 0)
    local error_count=$(grep -ci "error\|exception\|failed" "$logfile" 2>/dev/null || echo 0)
    local unique_ips=$(awk '{print $1}' "$logfile" 2>/dev/null | grep -E '^[0-9.]+ | sort -u | wc -l || echo 0)
    
    echo "Total log entries: $total_lines"
    echo "Total errors: $error_count"
    echo "Unique IP addresses: $unique_ips"
    
    if [ $total_lines -gt 0 ]; then
        local error_rate=$(echo "scale=2; $error_count * 100 / $total_lines" | bc -l 2>/dev/null || echo "0")
        echo "Error rate: ${error_rate}%"
        
        if [ $(echo "$error_count > $ERROR_THRESHOLD" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
            echo "⚠️  WARNING: Error count exceeds threshold of $ERROR_THRESHOLD"
        fi
    fi
}

# Main analysis function
main() {
    echo "Log Analysis Report - $(date)"
    echo "Log file: $LOG_FILE"
    echo "========================================"
    
    # Check if log file exists
    if [ ! -f "$LOG_FILE" ]; then
        echo "Error: Log file $LOG_FILE not found"
        exit 1
    fi
    
    # Run analysis functions
    {
        generate_summary "$LOG_FILE"
        analyze_errors "$LOG_FILE"
        analyze_access "$LOG_FILE"
        analyze_response_codes "$LOG_FILE"
        analyze_performance "$LOG_FILE"
        
        echo -e "\n========================================"
        echo "Report generated: $(date)"
        echo "Report file: $REPORT_FILE"
    } | tee "$REPORT_FILE"
    
    echo "Analysis complete. Full report saved to: $REPORT_FILE"
}

# Execute main function
main
```

---

## Useful One-Liners

### Data Processing One-Liners

#### CSV and Data File Operations
```bash
# Count unique values in CSV column 2
cut -d',' -f2 data.csv | sort | uniq -c | sort -rn

# Convert CSV to TSV (comma to tab)
sed 's/,/\t/g' input.csv > output.tsv

# Remove header from CSV
tail -n +2 data.csv > data_no_header.csv

# Add line numbers to CSV (preserving header)
awk 'NR==1{print "line_num," $0; next} {print NR-1 "," $0}' data.csv

# Extract specific columns from CSV (1st, 3rd, 5th)
awk -F',' '{print $1","$3","$5}' data.csv

# Find CSV files with specific column count
find . -name "*.csv" -exec sh -c 'echo "$1: $(head -1 "$1" | tr "," "\n" | wc -l) columns"' _ {} \;

# Remove empty lines from file
grep -v '^
```

### Data Backup and Sync Script
```bash
#!/bin/bash
# Automated Data Backup and Synchronization Script
# Supports local and remote backups with rotation

set -euo pipefail

# Configuration (can be overridden by config file)
SOURCE_DIR="${SOURCE_DIR:-/data/warehouse}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-/backup/local}"
REMOTE_BACKUP_HOST="${REMOTE_BACKUP_HOST:-backup.company.com}"
REMOTE_BACKUP_DIR="${REMOTE_BACKUP_DIR:-/backup/remote}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
CONFIG_FILE="${HOME}/.backup_config"

# Load configuration file if it exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Logging
LOG_DIR="/var/log/backup"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/backup_$(date +%Y%m%d).log"

log() {
    local level="$1"
    shift
    local message="$*"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to calculate directory size
get_dir_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

# Function to create local backup
create_local_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="data_backup_$timestamp"
    local backup_path="$LOCAL_BACKUP_DIR/$backup_name.tar.gz"
    
    log "INFO" "Starting local backup"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Destination: $backup_path"
    
    # Create backup directory
    mkdir -p "$LOCAL_BACKUP_DIR"
    
    # Get source size
    local source_size=$(get_dir_size "$SOURCE_DIR")
    log "INFO" "Source directory size: $source_size"
    
    # Create compressed backup
    if tar -czf "$backup_path" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")" 2>>"$LOG_FILE"; then
        local backup_size=$(get_dir_size "$backup_path")
        log "INFO" "Local backup completed successfully"
        log "INFO" "Backup size: $backup_size"
        
        # Verify backup
        if tar -tzf "$backup_path" >/dev/null 2>&1; then
            log "INFO" "Backup verification successful"
        else
            log "ERROR" "Backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Local backup failed"
        return 1
    fi
    
    echo "$backup_path"  # Return backup path
}

# Function to sync to remote backup
sync_remote_backup() {
    local local_backup="$1"
    
    log "INFO" "Starting remote sync"
    log "INFO" "Syncing $local_backup to $REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR"
    
    # Create remote directory
    if ssh "$REMOTE_BACKUP_HOST" "mkdir -p '$REMOTE_BACKUP_DIR'"; then
        log "INFO" "Remote directory created/verified"
    else
        log "ERROR" "Failed to create remote directory"
        return 1
    fi
    
    # Sync backup file
    if rsync -avz --progress "$local_backup" "$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR/" 2>>"$LOG_FILE"; then
        log "INFO" "Remote sync completed successfully"
        
        # Verify remote file
        local remote_filename=$(basename "$local_backup")
        if ssh "$REMOTE_BACKUP_HOST" "[ -f '$REMOTE_BACKUP_DIR/$remote_filename' ]"; then
            log "INFO" "Remote backup verification successful"
        else
            log "ERROR" "Remote backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Remote sync failed"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    local backup_dir="$1"
    local is_remote="$2"
    
    log "INFO" "Cleaning up backups older than $RETENTION_DAYS days in $backup_dir"
    
    if [ "$is_remote" = "true" ]; then
        # Remote cleanup
        local old_files=$(ssh "$REMOTE_BACKUP_HOST" "find '$backup_dir' -name 'data_backup_*.tar.gz' -mtime +$RETENTION_DAYS -type f" 2>/dev/null || echo "")
        if [ -n "$old_files" ]; then
            echo "$old_files" | while read -r file; do
                if ssh "$REMOTE_BACKUP_HOST" "rm -f '$file'"; then
                    log "INFO" "Removed old remote backup: $file"
                else
                    log "ERROR" "Failed to remove remote backup: $file"
                fi
            done
        fi
    else
        # Local cleanup
        local removed_count=0
        find "$backup_dir" -name "data_backup_*.tar.gz" -mtime +$RETENTION_DAYS -type f -print0 2>/dev/null | \
        while IFS= read -r -d '' file; do
            if rm -f "$file"; then
                log "INFO" "Removed old local backup: $file"
                removed_count=$((removed_count + 1))
            else
                log "ERROR" "Failed to remove local backup: $file"
            fi
        done
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites"
    
    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        log "ERROR" "Source directory $SOURCE_DIR does not exist"
        return 1
    fi
    
    # Check available disk space (need at least 110% of source size)
    local source_size_kb=$(du -sk "$SOURCE_DIR" | cut -f1)
    local required_space_kb=$((source_size_kb * 11 / 10))  # 110% of source
    local available_space_kb=$(df "$LOCAL_BACKUP_DIR" 2>/dev/null | tail -1 | awk '{print $4}' || echo 0)
    
    if [ $available_space_kb -lt $required_space_kb ]; then
        log "ERROR" "Insufficient disk space. Required: ${required_space_kb}KB, Available: ${available_space_kb}KB"
        return 1
    fi
    
    # Check if remote host is reachable (if remote backup enabled)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if ! ssh -o ConnectTimeout=10 "$REMOTE_BACKUP_HOST" "echo 'Connection test'" >/dev/null 2>&1; then
            log "WARN" "Remote host $REMOTE_BACKUP_HOST not reachable. Skipping remote backup."
            REMOTE_BACKUP_HOST=""  # Disable remote backup
        else
            log "INFO" "Remote host $REMOTE_BACKUP_HOST is reachable"
        fi
    fi
    
    log "INFO" "Prerequisites check completed"
}

# Function to send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification (if mail command available)
    if command -v mail >/dev/null 2>&1 && [ -n "${BACKUP_EMAIL:-}" ]; then
        echo "$message" | mail -s "Backup $status: $(hostname)" "$BACKUP_EMAIL"
    fi
    
    # Webhook notification (if configured)
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"Backup $status on $(hostname): $message\"}" \
             "$WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
}

# Main backup function
main() {
    local start_time=$(date +%s)
    
    log "INFO" "=== Starting backup process ==="
    log "INFO" "Timestamp: $(date)"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Local backup: $LOCAL_BACKUP_DIR"
    log "INFO" "Remote backup: ${REMOTE_BACKUP_HOST:+$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR}"
    log "INFO" "Retention: $RETENTION_DAYS days"
    
    # Check prerequisites
    if ! check_prerequisites; then
        log "ERROR" "Prerequisites check failed"
        send_notification "FAILED" "Prerequisites check failed"
        exit 1
    fi
    
    # Create local backup
    local backup_file
    if backup_file=$(create_local_backup); then
        log "INFO" "Local backup created: $backup_file"
    else
        log "ERROR" "Local backup failed"
        send_notification "FAILED" "Local backup creation failed"
        exit 1
    fi
    
    # Remote sync (if configured)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if sync_remote_backup "$backup_file"; then
            log "INFO" "Remote sync completed"
        else
            log "ERROR" "Remote sync failed"
            send_notification "FAILED" "Remote sync failed"
            exit 1
        fi
    fi
    
    # Cleanup old backups
    cleanup_old_backups "$LOCAL_BACKUP_DIR" "false"
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        cleanup_old_backups "$REMOTE_BACKUP_DIR" "true"
    fi
    
    # Calculate total time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $(((duration%3600)/60)) $((duration%60)))
    
    log "INFO" "=== Backup process completed successfully ==="
    log "INFO" "Total duration: $duration_formatted"
    log "INFO" "Backup file: $backup_file"
    
    send_notification "SUCCESS" "Backup completed in $duration_formatted"
}

# Script usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Data Backup Script with Local and Remote Support

OPTIONS:
    -s, --source DIR        Source directory to backup (default: $SOURCE_DIR)
    -l, --local DIR         Local backup directory (default: $LOCAL_BACKUP_DIR)
    -r, --remote HOST       Remote backup host (default: $REMOTE_BACKUP_HOST)
    -d, --remote-dir DIR    Remote backup directory (default: $REMOTE_BACKUP_DIR)
    -k, --keep DAYS         Retention period in days (default: $RETENTION_DAYS)
    -c, --config FILE       Configuration file (default: $CONFIG_FILE)
    -h, --help              Show this help message

EXAMPLES:
    $0                                          # Run with default settings
    $0 -s /data/warehouse -l /backup/local     # Custom source and local backup
    $0 -r backup.example.com -k 7              # Remote backup with 7-day retention

CONFIGURATION FILE:
    Create $CONFIG_FILE with variables:
    SOURCE_DIR="/data/warehouse"
    LOCAL_BACKUP_DIR="/backup/local"
    REMOTE_BACKUP_HOST="backup.company.com"
    REMOTE_BACKUP_DIR="/backup/remote"
    RETENTION_DAYS=30
    BACKUP_EMAIL="admin@company.com"
    WEBHOOK_URL="https://hooks.slack.com/..."

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_DIR="$2"
            shift 2
            ;;
        -l|--local)
            LOCAL_BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--remote)
            REMOTE_BACKUP_HOST="$2"
            shift 2
            ;;
        -d|--remote-dir)
            REMOTE_BACKUP_DIR="$2"
            shift 2
            ;;
        -k|--keep)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            if [ -f "$CONFIG_FILE" ]; then
                source "$CONFIG_FILE"
            fi
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Execute main function
main
```

---

## Performance Monitoring

### System Resource Monitoring

#### `sar` - System Activity Reporter
**Most Used Options:**
- `-u` = CPU utilization
- `-r` = Memory utilization
- `-b` = I/O and transfer rate statistics
- `-d` = Block device activity
- `interval count` = Sample every interval seconds for count times

```bash
sar -u 1 5                            # CPU usage every 1 second, 5 times
sar -r 1 10                           # Memory usage every 1 second, 10 times
sar -d 2 5                            # Disk I/O every 2 seconds, 5 times
sar -b 1 0                            # I/O stats every 1 second continuously (0 = infinite)
```

#### `iostat` - I/O Statistics
**Most Used Options:**
- `-x` = Extended statistics
- `-k` = Display in kilobytes
- `-m` = Display in megabytes
- `-d` = Display device statistics only

```bash
iostat                                 # Basic I/O stats
iostat -x                             # Extended I/O statistics (-x)
iostat -x 1                           # Extended stats every 1 second
iostat -xk 2 5                        # Extended stats in KB, every 2 sec, 5 times
iostat -d                             # Device statistics only (-d)
```

#### `vmstat` - Virtual Memory Statistics
**Most Used Options:**
- `interval count` = Sample timing
- `-S` = Unit specification (k, K, m, M)

```bash
vmstat                                 # One-time memory/CPU/I/O stats
vmstat 1                              # Update every 1 second
vmstat 1 10                           # Update every 1 second, 10 times
vmstat -S M 2                         # Stats in megabytes (-S M), every 2 seconds
```

#### Network Monitoring

#### `netstat` - Network Statistics
**Most Used Options:**
- `-t` = TCP connections
- `-u` = UDP connections
- `-l` = Listening ports only
- `-n` = Show numerical addresses (don't resolve hostnames)
- `-p` = Show process ID and name
- `-r` = Show routing table

```bash
netstat -tuln                         # TCP/UDP listening ports (-t -u -l -n)
netstat -tupln                        # Include process info (-p)
netstat -rn                           # Routing table with numerical addresses
netstat -i                            # Network interfaces
netstat -s                            # Network statistics summary
```

#### `ss` - Socket Statistics (modern netstat replacement)
**Most Used Options:**
- `-t` = TCP sockets
- `-u` = UDP sockets
- `-l` = Listening sockets
- `-n` = Numerical addresses
- `-p` = Show processes
- `-s` = Summary statistics

```bash
ss -tuln                              # TCP/UDP listening ports
ss -tupln                             # Include process information
ss -s                                 # Socket statistics summary
ss -t state established               # Show established TCP connections
ss -o state established               # Show with timer information
```

### Database and Application Monitoring Scripts

#### Database Connection Monitor
```bash
#!/bin/bash
# Database Connection Monitoring Script

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
MAX_CONNECTIONS="${MAX_CONNECTIONS:-100}"
WARNING_THRESHOLD="${WARNING_THRESHOLD:-80}"
LOG_FILE="/var/log/db_monitor.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Function to count current connections
count_connections() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            # PostgreSQL connection count
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' '
            ;;
        "mysql")
            # MySQL connection count
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | awk 'NR==2 {print $2}'
            ;;
        *)
            # Generic approach using netstat
            netstat -an | grep ":$DB_PORT" | grep ESTABLISHED | wc -l
            ;;
    esac
}

# Function to get database version
get_db_version() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT version();" 2>/dev/null | head -1 | tr -d ' \n'
            ;;
        "mysql")
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SELECT VERSION();" 2>/dev/null | tail -1
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

# Function to check database health
check_db_health() {
    local connection_count=$1
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    
    log "INFO: Current connections: $connection_count"
    log "INFO: CPU usage: $cpu_usage%"
    log "INFO: Memory usage: $memory_usage%"
    
    # Connection threshold checks
    local warning_limit=$((MAX_CONNECTIONS * WARNING_THRESHOLD / 100))
    
    if [ "$connection_count" -gt "$MAX_CONNECTIONS" ]; then
        log "CRITICAL: Connection count ($connection_count) exceeds maximum ($MAX_CONNECTIONS)"
        return 2
    elif [ "$connection_count" -gt "$warning_limit" ]; then
        log "WARNING: Connection count ($connection_count) exceeds warning threshold ($warning_limit)"
        return 1
    else
        log "INFO: Connection count is within normal limits"
        return 0
    fi
}

# Function to get slow queries (PostgreSQL)
check_slow_queries() {
    if [ "$DB_TYPE" = "postgresql" ] || [ "$DB_TYPE" = "postgres" ]; then
        log "INFO: Checking for slow queries"
        psql -h "$DB_HOST" -p "$DB_PORT" -t -c "
        SELECT 
            pid,
            now() - pg_stat_activity.query_start AS duration,
            query 
        FROM pg_stat_activity 
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
        ORDER BY duration DESC;
        " 2>/dev/null | head -5
    fi
}

# Main monitoring function
main() {
    log "=== Database Connection Monitor Started ==="
    log "INFO: Monitoring $DB_HOST:$DB_PORT"
    
    # Get database info
    if [ -n "${DB_TYPE:-}" ]; then
        local db_version=$(get_db_version)
        log "INFO: Database version: $db_version"
    fi
    
    # Count current connections
    local current_connections
    if current_connections=$(count_connections); then
        log "INFO: Successfully retrieved connection count"
    else
        log "ERROR: Failed to retrieve connection count"
        exit 1
    fi
    
    # Check database health
    check_db_health "$current_connections"
    local health_status=$?
    
    # Check for slow queries
    check_slow_queries
    
    # Generate summary
    case $health_status in
        0)
            log "INFO: Database health check PASSED"
            ;;
        1)
            log "WARNING: Database health check WARNING"
            # Could send alert here
            ;;
        2)
            log "CRITICAL: Database health check FAILED"
            # Could send critical alert here
            ;;
    esac
    
    log "=== Database Connection Monitor Completed ==="
    return $health_status
}

# Parse command line options
DB_TYPE="generic"
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            DB_HOST="$2"
            shift 2
            ;;
        --port)
            DB_PORT="$2"
            shift 2
            ;;
        --type)
            DB_TYPE="$2"
            shift 2
            ;;
        --max-connections)
            MAX_CONNECTIONS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Execute main function
main file.txt
# Alternative: sed '/^$/d' file.txt

# Replace multiple spaces with single space
tr -s ' ' < input.txt > output.txt
# Alternative: sed 's/ \+/ /g' input.txt

# Extract email addresses from text
grep -Eo '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' file.txt

# Extract phone numbers (US format)
grep -Eo '\(?\b[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b' file.txt

# Convert text to lowercase
tr '[:upper:]' '[:lower:]' < input.txt > output.txt

# Convert text to uppercase  
tr '[:lower:]' '[:upper:]' < input.txt > output.txt

# Remove carriage returns (Windows to Unix)
tr -d '\r' < windows_file.txt > unix_file.txt
# Alternative: sed 's/\r$//' windows_file.txt > unix_file.txt
```

#### JSON Processing (using command line tools)
```bash
# Pretty print JSON (if jq is available)
cat data.json | python -m json.tool

# Extract specific field from JSON lines
grep '"username"' data.json | awk -F'"' '{print $4}'

# Count JSON objects in file
grep -c '^{' data.json

# Extract error logs from JSON
grep '"level":"error"' app.log | sed 's/.*"message":"\([^"]*\)".*/\1/'
```

### File System and Directory Operations
```bash
# Find large files (>100MB)
find . -size +100M -ls | sort -k7 -rn

# Find files modified in last hour
find /data -mmin -60 -type f

# Find files modified today
find /data -mtime 0 -type f

# Find and count files by extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Find directories consuming most space
du -h --max-depth=1 | sort -hr

# Find duplicate files by size
find . -type f -exec ls -la {} \; | sort -k5 -rn | awk '$5==size{print prev; print} {size=$5; prev=$0}'

# Monitor directory for changes
watch -n 1 'ls -la /data/ | tail'

# Find files not accessed in 30 days
find /data -type f -atime +30

# Find broken symbolic links
find . -type l ! -exec test -e {} \; -print

# Count files in each subdirectory
find . -maxdepth 1 -type d -exec sh -c 'echo -n "{}: "; find "{}" -type f | wc -l' \;
```

### Text Analysis and Statistics
```bash
# Count word frequency in text file
tr '[:space:]' '\n' < file.txt | grep -v '^
```

### Data Backup and Sync Script
```bash
#!/bin/bash
# Automated Data Backup and Synchronization Script
# Supports local and remote backups with rotation

set -euo pipefail

# Configuration (can be overridden by config file)
SOURCE_DIR="${SOURCE_DIR:-/data/warehouse}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-/backup/local}"
REMOTE_BACKUP_HOST="${REMOTE_BACKUP_HOST:-backup.company.com}"
REMOTE_BACKUP_DIR="${REMOTE_BACKUP_DIR:-/backup/remote}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
CONFIG_FILE="${HOME}/.backup_config"

# Load configuration file if it exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Logging
LOG_DIR="/var/log/backup"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/backup_$(date +%Y%m%d).log"

log() {
    local level="$1"
    shift
    local message="$*"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to calculate directory size
get_dir_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

# Function to create local backup
create_local_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="data_backup_$timestamp"
    local backup_path="$LOCAL_BACKUP_DIR/$backup_name.tar.gz"
    
    log "INFO" "Starting local backup"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Destination: $backup_path"
    
    # Create backup directory
    mkdir -p "$LOCAL_BACKUP_DIR"
    
    # Get source size
    local source_size=$(get_dir_size "$SOURCE_DIR")
    log "INFO" "Source directory size: $source_size"
    
    # Create compressed backup
    if tar -czf "$backup_path" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")" 2>>"$LOG_FILE"; then
        local backup_size=$(get_dir_size "$backup_path")
        log "INFO" "Local backup completed successfully"
        log "INFO" "Backup size: $backup_size"
        
        # Verify backup
        if tar -tzf "$backup_path" >/dev/null 2>&1; then
            log "INFO" "Backup verification successful"
        else
            log "ERROR" "Backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Local backup failed"
        return 1
    fi
    
    echo "$backup_path"  # Return backup path
}

# Function to sync to remote backup
sync_remote_backup() {
    local local_backup="$1"
    
    log "INFO" "Starting remote sync"
    log "INFO" "Syncing $local_backup to $REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR"
    
    # Create remote directory
    if ssh "$REMOTE_BACKUP_HOST" "mkdir -p '$REMOTE_BACKUP_DIR'"; then
        log "INFO" "Remote directory created/verified"
    else
        log "ERROR" "Failed to create remote directory"
        return 1
    fi
    
    # Sync backup file
    if rsync -avz --progress "$local_backup" "$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR/" 2>>"$LOG_FILE"; then
        log "INFO" "Remote sync completed successfully"
        
        # Verify remote file
        local remote_filename=$(basename "$local_backup")
        if ssh "$REMOTE_BACKUP_HOST" "[ -f '$REMOTE_BACKUP_DIR/$remote_filename' ]"; then
            log "INFO" "Remote backup verification successful"
        else
            log "ERROR" "Remote backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Remote sync failed"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    local backup_dir="$1"
    local is_remote="$2"
    
    log "INFO" "Cleaning up backups older than $RETENTION_DAYS days in $backup_dir"
    
    if [ "$is_remote" = "true" ]; then
        # Remote cleanup
        local old_files=$(ssh "$REMOTE_BACKUP_HOST" "find '$backup_dir' -name 'data_backup_*.tar.gz' -mtime +$RETENTION_DAYS -type f" 2>/dev/null || echo "")
        if [ -n "$old_files" ]; then
            echo "$old_files" | while read -r file; do
                if ssh "$REMOTE_BACKUP_HOST" "rm -f '$file'"; then
                    log "INFO" "Removed old remote backup: $file"
                else
                    log "ERROR" "Failed to remove remote backup: $file"
                fi
            done
        fi
    else
        # Local cleanup
        local removed_count=0
        find "$backup_dir" -name "data_backup_*.tar.gz" -mtime +$RETENTION_DAYS -type f -print0 2>/dev/null | \
        while IFS= read -r -d '' file; do
            if rm -f "$file"; then
                log "INFO" "Removed old local backup: $file"
                removed_count=$((removed_count + 1))
            else
                log "ERROR" "Failed to remove local backup: $file"
            fi
        done
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites"
    
    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        log "ERROR" "Source directory $SOURCE_DIR does not exist"
        return 1
    fi
    
    # Check available disk space (need at least 110% of source size)
    local source_size_kb=$(du -sk "$SOURCE_DIR" | cut -f1)
    local required_space_kb=$((source_size_kb * 11 / 10))  # 110% of source
    local available_space_kb=$(df "$LOCAL_BACKUP_DIR" 2>/dev/null | tail -1 | awk '{print $4}' || echo 0)
    
    if [ $available_space_kb -lt $required_space_kb ]; then
        log "ERROR" "Insufficient disk space. Required: ${required_space_kb}KB, Available: ${available_space_kb}KB"
        return 1
    fi
    
    # Check if remote host is reachable (if remote backup enabled)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if ! ssh -o ConnectTimeout=10 "$REMOTE_BACKUP_HOST" "echo 'Connection test'" >/dev/null 2>&1; then
            log "WARN" "Remote host $REMOTE_BACKUP_HOST not reachable. Skipping remote backup."
            REMOTE_BACKUP_HOST=""  # Disable remote backup
        else
            log "INFO" "Remote host $REMOTE_BACKUP_HOST is reachable"
        fi
    fi
    
    log "INFO" "Prerequisites check completed"
}

# Function to send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification (if mail command available)
    if command -v mail >/dev/null 2>&1 && [ -n "${BACKUP_EMAIL:-}" ]; then
        echo "$message" | mail -s "Backup $status: $(hostname)" "$BACKUP_EMAIL"
    fi
    
    # Webhook notification (if configured)
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"Backup $status on $(hostname): $message\"}" \
             "$WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
}

# Main backup function
main() {
    local start_time=$(date +%s)
    
    log "INFO" "=== Starting backup process ==="
    log "INFO" "Timestamp: $(date)"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Local backup: $LOCAL_BACKUP_DIR"
    log "INFO" "Remote backup: ${REMOTE_BACKUP_HOST:+$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR}"
    log "INFO" "Retention: $RETENTION_DAYS days"
    
    # Check prerequisites
    if ! check_prerequisites; then
        log "ERROR" "Prerequisites check failed"
        send_notification "FAILED" "Prerequisites check failed"
        exit 1
    fi
    
    # Create local backup
    local backup_file
    if backup_file=$(create_local_backup); then
        log "INFO" "Local backup created: $backup_file"
    else
        log "ERROR" "Local backup failed"
        send_notification "FAILED" "Local backup creation failed"
        exit 1
    fi
    
    # Remote sync (if configured)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if sync_remote_backup "$backup_file"; then
            log "INFO" "Remote sync completed"
        else
            log "ERROR" "Remote sync failed"
            send_notification "FAILED" "Remote sync failed"
            exit 1
        fi
    fi
    
    # Cleanup old backups
    cleanup_old_backups "$LOCAL_BACKUP_DIR" "false"
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        cleanup_old_backups "$REMOTE_BACKUP_DIR" "true"
    fi
    
    # Calculate total time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $(((duration%3600)/60)) $((duration%60)))
    
    log "INFO" "=== Backup process completed successfully ==="
    log "INFO" "Total duration: $duration_formatted"
    log "INFO" "Backup file: $backup_file"
    
    send_notification "SUCCESS" "Backup completed in $duration_formatted"
}

# Script usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Data Backup Script with Local and Remote Support

OPTIONS:
    -s, --source DIR        Source directory to backup (default: $SOURCE_DIR)
    -l, --local DIR         Local backup directory (default: $LOCAL_BACKUP_DIR)
    -r, --remote HOST       Remote backup host (default: $REMOTE_BACKUP_HOST)
    -d, --remote-dir DIR    Remote backup directory (default: $REMOTE_BACKUP_DIR)
    -k, --keep DAYS         Retention period in days (default: $RETENTION_DAYS)
    -c, --config FILE       Configuration file (default: $CONFIG_FILE)
    -h, --help              Show this help message

EXAMPLES:
    $0                                          # Run with default settings
    $0 -s /data/warehouse -l /backup/local     # Custom source and local backup
    $0 -r backup.example.com -k 7              # Remote backup with 7-day retention

CONFIGURATION FILE:
    Create $CONFIG_FILE with variables:
    SOURCE_DIR="/data/warehouse"
    LOCAL_BACKUP_DIR="/backup/local"
    REMOTE_BACKUP_HOST="backup.company.com"
    REMOTE_BACKUP_DIR="/backup/remote"
    RETENTION_DAYS=30
    BACKUP_EMAIL="admin@company.com"
    WEBHOOK_URL="https://hooks.slack.com/..."

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_DIR="$2"
            shift 2
            ;;
        -l|--local)
            LOCAL_BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--remote)
            REMOTE_BACKUP_HOST="$2"
            shift 2
            ;;
        -d|--remote-dir)
            REMOTE_BACKUP_DIR="$2"
            shift 2
            ;;
        -k|--keep)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            if [ -f "$CONFIG_FILE" ]; then
                source "$CONFIG_FILE"
            fi
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Execute main function
main
```

---

## Performance Monitoring

### System Resource Monitoring

#### `sar` - System Activity Reporter
**Most Used Options:**
- `-u` = CPU utilization
- `-r` = Memory utilization
- `-b` = I/O and transfer rate statistics
- `-d` = Block device activity
- `interval count` = Sample every interval seconds for count times

```bash
sar -u 1 5                            # CPU usage every 1 second, 5 times
sar -r 1 10                           # Memory usage every 1 second, 10 times
sar -d 2 5                            # Disk I/O every 2 seconds, 5 times
sar -b 1 0                            # I/O stats every 1 second continuously (0 = infinite)
```

#### `iostat` - I/O Statistics
**Most Used Options:**
- `-x` = Extended statistics
- `-k` = Display in kilobytes
- `-m` = Display in megabytes
- `-d` = Display device statistics only

```bash
iostat                                 # Basic I/O stats
iostat -x                             # Extended I/O statistics (-x)
iostat -x 1                           # Extended stats every 1 second
iostat -xk 2 5                        # Extended stats in KB, every 2 sec, 5 times
iostat -d                             # Device statistics only (-d)
```

#### `vmstat` - Virtual Memory Statistics
**Most Used Options:**
- `interval count` = Sample timing
- `-S` = Unit specification (k, K, m, M)

```bash
vmstat                                 # One-time memory/CPU/I/O stats
vmstat 1                              # Update every 1 second
vmstat 1 10                           # Update every 1 second, 10 times
vmstat -S M 2                         # Stats in megabytes (-S M), every 2 seconds
```

#### Network Monitoring

#### `netstat` - Network Statistics
**Most Used Options:**
- `-t` = TCP connections
- `-u` = UDP connections
- `-l` = Listening ports only
- `-n` = Show numerical addresses (don't resolve hostnames)
- `-p` = Show process ID and name
- `-r` = Show routing table

```bash
netstat -tuln                         # TCP/UDP listening ports (-t -u -l -n)
netstat -tupln                        # Include process info (-p)
netstat -rn                           # Routing table with numerical addresses
netstat -i                            # Network interfaces
netstat -s                            # Network statistics summary
```

#### `ss` - Socket Statistics (modern netstat replacement)
**Most Used Options:**
- `-t` = TCP sockets
- `-u` = UDP sockets
- `-l` = Listening sockets
- `-n` = Numerical addresses
- `-p` = Show processes
- `-s` = Summary statistics

```bash
ss -tuln                              # TCP/UDP listening ports
ss -tupln                             # Include process information
ss -s                                 # Socket statistics summary
ss -t state established               # Show established TCP connections
ss -o state established               # Show with timer information
```

### Database and Application Monitoring Scripts

#### Database Connection Monitor
```bash
#!/bin/bash
# Database Connection Monitoring Script

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
MAX_CONNECTIONS="${MAX_CONNECTIONS:-100}"
WARNING_THRESHOLD="${WARNING_THRESHOLD:-80}"
LOG_FILE="/var/log/db_monitor.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Function to count current connections
count_connections() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            # PostgreSQL connection count
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' '
            ;;
        "mysql")
            # MySQL connection count
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | awk 'NR==2 {print $2}'
            ;;
        *)
            # Generic approach using netstat
            netstat -an | grep ":$DB_PORT" | grep ESTABLISHED | wc -l
            ;;
    esac
}

# Function to get database version
get_db_version() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT version();" 2>/dev/null | head -1 | tr -d ' \n'
            ;;
        "mysql")
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SELECT VERSION();" 2>/dev/null | tail -1
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

# Function to check database health
check_db_health() {
    local connection_count=$1
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    
    log "INFO: Current connections: $connection_count"
    log "INFO: CPU usage: $cpu_usage%"
    log "INFO: Memory usage: $memory_usage%"
    
    # Connection threshold checks
    local warning_limit=$((MAX_CONNECTIONS * WARNING_THRESHOLD / 100))
    
    if [ "$connection_count" -gt "$MAX_CONNECTIONS" ]; then
        log "CRITICAL: Connection count ($connection_count) exceeds maximum ($MAX_CONNECTIONS)"
        return 2
    elif [ "$connection_count" -gt "$warning_limit" ]; then
        log "WARNING: Connection count ($connection_count) exceeds warning threshold ($warning_limit)"
        return 1
    else
        log "INFO: Connection count is within normal limits"
        return 0
    fi
}

# Function to get slow queries (PostgreSQL)
check_slow_queries() {
    if [ "$DB_TYPE" = "postgresql" ] || [ "$DB_TYPE" = "postgres" ]; then
        log "INFO: Checking for slow queries"
        psql -h "$DB_HOST" -p "$DB_PORT" -t -c "
        SELECT 
            pid,
            now() - pg_stat_activity.query_start AS duration,
            query 
        FROM pg_stat_activity 
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
        ORDER BY duration DESC;
        " 2>/dev/null | head -5
    fi
}

# Main monitoring function
main() {
    log "=== Database Connection Monitor Started ==="
    log "INFO: Monitoring $DB_HOST:$DB_PORT"
    
    # Get database info
    if [ -n "${DB_TYPE:-}" ]; then
        local db_version=$(get_db_version)
        log "INFO: Database version: $db_version"
    fi
    
    # Count current connections
    local current_connections
    if current_connections=$(count_connections); then
        log "INFO: Successfully retrieved connection count"
    else
        log "ERROR: Failed to retrieve connection count"
        exit 1
    fi
    
    # Check database health
    check_db_health "$current_connections"
    local health_status=$?
    
    # Check for slow queries
    check_slow_queries
    
    # Generate summary
    case $health_status in
        0)
            log "INFO: Database health check PASSED"
            ;;
        1)
            log "WARNING: Database health check WARNING"
            # Could send alert here
            ;;
        2)
            log "CRITICAL: Database health check FAILED"
            # Could send critical alert here
            ;;
    esac
    
    log "=== Database Connection Monitor Completed ==="
    return $health_status
}

# Parse command line options
DB_TYPE="generic"
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            DB_HOST="$2"
            shift 2
            ;;
        --port)
            DB_PORT="$2"
            shift 2
            ;;
        --type)
            DB_TYPE="$2"
            shift 2
            ;;
        --max-connections)
            MAX_CONNECTIONS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Execute main function
main | sort | uniq -c | sort -rn | head -20

# Find most common lines in log file
sort file.log | uniq -c | sort -rn | head -10

# Get file statistics (lines, words, characters)
wc file.txt

# Count non-empty lines
grep -c '^.' file.txt

# Count blank lines
grep -c '^
```

### Data Backup and Sync Script
```bash
#!/bin/bash
# Automated Data Backup and Synchronization Script
# Supports local and remote backups with rotation

set -euo pipefail

# Configuration (can be overridden by config file)
SOURCE_DIR="${SOURCE_DIR:-/data/warehouse}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-/backup/local}"
REMOTE_BACKUP_HOST="${REMOTE_BACKUP_HOST:-backup.company.com}"
REMOTE_BACKUP_DIR="${REMOTE_BACKUP_DIR:-/backup/remote}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
CONFIG_FILE="${HOME}/.backup_config"

# Load configuration file if it exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Logging
LOG_DIR="/var/log/backup"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/backup_$(date +%Y%m%d).log"

log() {
    local level="$1"
    shift
    local message="$*"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to calculate directory size
get_dir_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

# Function to create local backup
create_local_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="data_backup_$timestamp"
    local backup_path="$LOCAL_BACKUP_DIR/$backup_name.tar.gz"
    
    log "INFO" "Starting local backup"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Destination: $backup_path"
    
    # Create backup directory
    mkdir -p "$LOCAL_BACKUP_DIR"
    
    # Get source size
    local source_size=$(get_dir_size "$SOURCE_DIR")
    log "INFO" "Source directory size: $source_size"
    
    # Create compressed backup
    if tar -czf "$backup_path" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")" 2>>"$LOG_FILE"; then
        local backup_size=$(get_dir_size "$backup_path")
        log "INFO" "Local backup completed successfully"
        log "INFO" "Backup size: $backup_size"
        
        # Verify backup
        if tar -tzf "$backup_path" >/dev/null 2>&1; then
            log "INFO" "Backup verification successful"
        else
            log "ERROR" "Backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Local backup failed"
        return 1
    fi
    
    echo "$backup_path"  # Return backup path
}

# Function to sync to remote backup
sync_remote_backup() {
    local local_backup="$1"
    
    log "INFO" "Starting remote sync"
    log "INFO" "Syncing $local_backup to $REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR"
    
    # Create remote directory
    if ssh "$REMOTE_BACKUP_HOST" "mkdir -p '$REMOTE_BACKUP_DIR'"; then
        log "INFO" "Remote directory created/verified"
    else
        log "ERROR" "Failed to create remote directory"
        return 1
    fi
    
    # Sync backup file
    if rsync -avz --progress "$local_backup" "$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR/" 2>>"$LOG_FILE"; then
        log "INFO" "Remote sync completed successfully"
        
        # Verify remote file
        local remote_filename=$(basename "$local_backup")
        if ssh "$REMOTE_BACKUP_HOST" "[ -f '$REMOTE_BACKUP_DIR/$remote_filename' ]"; then
            log "INFO" "Remote backup verification successful"
        else
            log "ERROR" "Remote backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Remote sync failed"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    local backup_dir="$1"
    local is_remote="$2"
    
    log "INFO" "Cleaning up backups older than $RETENTION_DAYS days in $backup_dir"
    
    if [ "$is_remote" = "true" ]; then
        # Remote cleanup
        local old_files=$(ssh "$REMOTE_BACKUP_HOST" "find '$backup_dir' -name 'data_backup_*.tar.gz' -mtime +$RETENTION_DAYS -type f" 2>/dev/null || echo "")
        if [ -n "$old_files" ]; then
            echo "$old_files" | while read -r file; do
                if ssh "$REMOTE_BACKUP_HOST" "rm -f '$file'"; then
                    log "INFO" "Removed old remote backup: $file"
                else
                    log "ERROR" "Failed to remove remote backup: $file"
                fi
            done
        fi
    else
        # Local cleanup
        local removed_count=0
        find "$backup_dir" -name "data_backup_*.tar.gz" -mtime +$RETENTION_DAYS -type f -print0 2>/dev/null | \
        while IFS= read -r -d '' file; do
            if rm -f "$file"; then
                log "INFO" "Removed old local backup: $file"
                removed_count=$((removed_count + 1))
            else
                log "ERROR" "Failed to remove local backup: $file"
            fi
        done
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites"
    
    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        log "ERROR" "Source directory $SOURCE_DIR does not exist"
        return 1
    fi
    
    # Check available disk space (need at least 110% of source size)
    local source_size_kb=$(du -sk "$SOURCE_DIR" | cut -f1)
    local required_space_kb=$((source_size_kb * 11 / 10))  # 110% of source
    local available_space_kb=$(df "$LOCAL_BACKUP_DIR" 2>/dev/null | tail -1 | awk '{print $4}' || echo 0)
    
    if [ $available_space_kb -lt $required_space_kb ]; then
        log "ERROR" "Insufficient disk space. Required: ${required_space_kb}KB, Available: ${available_space_kb}KB"
        return 1
    fi
    
    # Check if remote host is reachable (if remote backup enabled)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if ! ssh -o ConnectTimeout=10 "$REMOTE_BACKUP_HOST" "echo 'Connection test'" >/dev/null 2>&1; then
            log "WARN" "Remote host $REMOTE_BACKUP_HOST not reachable. Skipping remote backup."
            REMOTE_BACKUP_HOST=""  # Disable remote backup
        else
            log "INFO" "Remote host $REMOTE_BACKUP_HOST is reachable"
        fi
    fi
    
    log "INFO" "Prerequisites check completed"
}

# Function to send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification (if mail command available)
    if command -v mail >/dev/null 2>&1 && [ -n "${BACKUP_EMAIL:-}" ]; then
        echo "$message" | mail -s "Backup $status: $(hostname)" "$BACKUP_EMAIL"
    fi
    
    # Webhook notification (if configured)
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"Backup $status on $(hostname): $message\"}" \
             "$WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
}

# Main backup function
main() {
    local start_time=$(date +%s)
    
    log "INFO" "=== Starting backup process ==="
    log "INFO" "Timestamp: $(date)"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Local backup: $LOCAL_BACKUP_DIR"
    log "INFO" "Remote backup: ${REMOTE_BACKUP_HOST:+$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR}"
    log "INFO" "Retention: $RETENTION_DAYS days"
    
    # Check prerequisites
    if ! check_prerequisites; then
        log "ERROR" "Prerequisites check failed"
        send_notification "FAILED" "Prerequisites check failed"
        exit 1
    fi
    
    # Create local backup
    local backup_file
    if backup_file=$(create_local_backup); then
        log "INFO" "Local backup created: $backup_file"
    else
        log "ERROR" "Local backup failed"
        send_notification "FAILED" "Local backup creation failed"
        exit 1
    fi
    
    # Remote sync (if configured)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if sync_remote_backup "$backup_file"; then
            log "INFO" "Remote sync completed"
        else
            log "ERROR" "Remote sync failed"
            send_notification "FAILED" "Remote sync failed"
            exit 1
        fi
    fi
    
    # Cleanup old backups
    cleanup_old_backups "$LOCAL_BACKUP_DIR" "false"
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        cleanup_old_backups "$REMOTE_BACKUP_DIR" "true"
    fi
    
    # Calculate total time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $(((duration%3600)/60)) $((duration%60)))
    
    log "INFO" "=== Backup process completed successfully ==="
    log "INFO" "Total duration: $duration_formatted"
    log "INFO" "Backup file: $backup_file"
    
    send_notification "SUCCESS" "Backup completed in $duration_formatted"
}

# Script usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Data Backup Script with Local and Remote Support

OPTIONS:
    -s, --source DIR        Source directory to backup (default: $SOURCE_DIR)
    -l, --local DIR         Local backup directory (default: $LOCAL_BACKUP_DIR)
    -r, --remote HOST       Remote backup host (default: $REMOTE_BACKUP_HOST)
    -d, --remote-dir DIR    Remote backup directory (default: $REMOTE_BACKUP_DIR)
    -k, --keep DAYS         Retention period in days (default: $RETENTION_DAYS)
    -c, --config FILE       Configuration file (default: $CONFIG_FILE)
    -h, --help              Show this help message

EXAMPLES:
    $0                                          # Run with default settings
    $0 -s /data/warehouse -l /backup/local     # Custom source and local backup
    $0 -r backup.example.com -k 7              # Remote backup with 7-day retention

CONFIGURATION FILE:
    Create $CONFIG_FILE with variables:
    SOURCE_DIR="/data/warehouse"
    LOCAL_BACKUP_DIR="/backup/local"
    REMOTE_BACKUP_HOST="backup.company.com"
    REMOTE_BACKUP_DIR="/backup/remote"
    RETENTION_DAYS=30
    BACKUP_EMAIL="admin@company.com"
    WEBHOOK_URL="https://hooks.slack.com/..."

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_DIR="$2"
            shift 2
            ;;
        -l|--local)
            LOCAL_BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--remote)
            REMOTE_BACKUP_HOST="$2"
            shift 2
            ;;
        -d|--remote-dir)
            REMOTE_BACKUP_DIR="$2"
            shift 2
            ;;
        -k|--keep)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            if [ -f "$CONFIG_FILE" ]; then
                source "$CONFIG_FILE"
            fi
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Execute main function
main
```

---

## Performance Monitoring

### System Resource Monitoring

#### `sar` - System Activity Reporter
**Most Used Options:**
- `-u` = CPU utilization
- `-r` = Memory utilization
- `-b` = I/O and transfer rate statistics
- `-d` = Block device activity
- `interval count` = Sample every interval seconds for count times

```bash
sar -u 1 5                            # CPU usage every 1 second, 5 times
sar -r 1 10                           # Memory usage every 1 second, 10 times
sar -d 2 5                            # Disk I/O every 2 seconds, 5 times
sar -b 1 0                            # I/O stats every 1 second continuously (0 = infinite)
```

#### `iostat` - I/O Statistics
**Most Used Options:**
- `-x` = Extended statistics
- `-k` = Display in kilobytes
- `-m` = Display in megabytes
- `-d` = Display device statistics only

```bash
iostat                                 # Basic I/O stats
iostat -x                             # Extended I/O statistics (-x)
iostat -x 1                           # Extended stats every 1 second
iostat -xk 2 5                        # Extended stats in KB, every 2 sec, 5 times
iostat -d                             # Device statistics only (-d)
```

#### `vmstat` - Virtual Memory Statistics
**Most Used Options:**
- `interval count` = Sample timing
- `-S` = Unit specification (k, K, m, M)

```bash
vmstat                                 # One-time memory/CPU/I/O stats
vmstat 1                              # Update every 1 second
vmstat 1 10                           # Update every 1 second, 10 times
vmstat -S M 2                         # Stats in megabytes (-S M), every 2 seconds
```

#### Network Monitoring

#### `netstat` - Network Statistics
**Most Used Options:**
- `-t` = TCP connections
- `-u` = UDP connections
- `-l` = Listening ports only
- `-n` = Show numerical addresses (don't resolve hostnames)
- `-p` = Show process ID and name
- `-r` = Show routing table

```bash
netstat -tuln                         # TCP/UDP listening ports (-t -u -l -n)
netstat -tupln                        # Include process info (-p)
netstat -rn                           # Routing table with numerical addresses
netstat -i                            # Network interfaces
netstat -s                            # Network statistics summary
```

#### `ss` - Socket Statistics (modern netstat replacement)
**Most Used Options:**
- `-t` = TCP sockets
- `-u` = UDP sockets
- `-l` = Listening sockets
- `-n` = Numerical addresses
- `-p` = Show processes
- `-s` = Summary statistics

```bash
ss -tuln                              # TCP/UDP listening ports
ss -tupln                             # Include process information
ss -s                                 # Socket statistics summary
ss -t state established               # Show established TCP connections
ss -o state established               # Show with timer information
```

### Database and Application Monitoring Scripts

#### Database Connection Monitor
```bash
#!/bin/bash
# Database Connection Monitoring Script

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
MAX_CONNECTIONS="${MAX_CONNECTIONS:-100}"
WARNING_THRESHOLD="${WARNING_THRESHOLD:-80}"
LOG_FILE="/var/log/db_monitor.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Function to count current connections
count_connections() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            # PostgreSQL connection count
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' '
            ;;
        "mysql")
            # MySQL connection count
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | awk 'NR==2 {print $2}'
            ;;
        *)
            # Generic approach using netstat
            netstat -an | grep ":$DB_PORT" | grep ESTABLISHED | wc -l
            ;;
    esac
}

# Function to get database version
get_db_version() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT version();" 2>/dev/null | head -1 | tr -d ' \n'
            ;;
        "mysql")
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SELECT VERSION();" 2>/dev/null | tail -1
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

# Function to check database health
check_db_health() {
    local connection_count=$1
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    
    log "INFO: Current connections: $connection_count"
    log "INFO: CPU usage: $cpu_usage%"
    log "INFO: Memory usage: $memory_usage%"
    
    # Connection threshold checks
    local warning_limit=$((MAX_CONNECTIONS * WARNING_THRESHOLD / 100))
    
    if [ "$connection_count" -gt "$MAX_CONNECTIONS" ]; then
        log "CRITICAL: Connection count ($connection_count) exceeds maximum ($MAX_CONNECTIONS)"
        return 2
    elif [ "$connection_count" -gt "$warning_limit" ]; then
        log "WARNING: Connection count ($connection_count) exceeds warning threshold ($warning_limit)"
        return 1
    else
        log "INFO: Connection count is within normal limits"
        return 0
    fi
}

# Function to get slow queries (PostgreSQL)
check_slow_queries() {
    if [ "$DB_TYPE" = "postgresql" ] || [ "$DB_TYPE" = "postgres" ]; then
        log "INFO: Checking for slow queries"
        psql -h "$DB_HOST" -p "$DB_PORT" -t -c "
        SELECT 
            pid,
            now() - pg_stat_activity.query_start AS duration,
            query 
        FROM pg_stat_activity 
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
        ORDER BY duration DESC;
        " 2>/dev/null | head -5
    fi
}

# Main monitoring function
main() {
    log "=== Database Connection Monitor Started ==="
    log "INFO: Monitoring $DB_HOST:$DB_PORT"
    
    # Get database info
    if [ -n "${DB_TYPE:-}" ]; then
        local db_version=$(get_db_version)
        log "INFO: Database version: $db_version"
    fi
    
    # Count current connections
    local current_connections
    if current_connections=$(count_connections); then
        log "INFO: Successfully retrieved connection count"
    else
        log "ERROR: Failed to retrieve connection count"
        exit 1
    fi
    
    # Check database health
    check_db_health "$current_connections"
    local health_status=$?
    
    # Check for slow queries
    check_slow_queries
    
    # Generate summary
    case $health_status in
        0)
            log "INFO: Database health check PASSED"
            ;;
        1)
            log "WARNING: Database health check WARNING"
            # Could send alert here
            ;;
        2)
            log "CRITICAL: Database health check FAILED"
            # Could send critical alert here
            ;;
    esac
    
    log "=== Database Connection Monitor Completed ==="
    return $health_status
}

# Parse command line options
DB_TYPE="generic"
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            DB_HOST="$2"
            shift 2
            ;;
        --port)
            DB_PORT="$2"
            shift 2
            ;;
        --type)
            DB_TYPE="$2"
            shift 2
            ;;
        --max-connections)
            MAX_CONNECTIONS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Execute main function
main file.txt

# Find lines longer than 100 characters
awk 'length($0) > 100' file.txt

# Calculate average line length
awk '{sum += length($0); count++} END {print sum/count}' file.txt
```

### System Monitoring One-Liners
```bash
# Find processes using most CPU
ps aux --sort=-%cpu | head -10

# Find processes using most memory
ps aux --sort=-%mem | head -10

# Monitor disk usage and alert if >80%
df -h | awk '$5+0 > 80 {print "Warning: " $0}'

# Find which process is using specific port
lsof -i :8080
# Alternative: netstat -tulpn | grep :8080

# Monitor network connections by state
ss -s
# Alternative: netstat -an | awk '{print $6}' | sort | uniq -c

# Find files opened by specific process
lsof -p PID

# Monitor real-time disk I/O
watch -n 1 'iostat -x 1 1 | tail -n +4'

# Check system load average
uptime

# Monitor memory usage in real-time
watch -n 1 'free -h'

# Find zombie processes  
ps aux | awk '{if($8=="Z") print}'

# Show top 10 memory consuming processes with percentage
ps aux | awk '{print $11, $4}' | sort -k2 -rn | head -10
```

### Network and Connectivity
```bash
# Test network connectivity to multiple hosts
for host in google.com github.com stackoverflow.com; do echo -n "$host: "; ping -c 1 $host >/dev/null && echo "OK" || echo "FAIL"; done

# Check if port is open
nc -zv hostname 22
# Alternative: telnet hostname 22

# Download file with progress
wget --progress=bar https://example.com/largefile.zip

# Test HTTP response time
curl -o /dev/null -s -w "Connect: %{time_connect}s, Transfer: %{time_total}s\n" https://example.com

# Find your public IP address
curl -s https://ipecho.net/plain; echo
# Alternative: curl -s https://icanhazip.com

# Monitor bandwidth usage
watch -n 1 'cat /proc/net/dev'

# List open network connections
lsof -i

# Check DNS resolution time
dig example.com | grep "Query time"
```

### Log Analysis One-Liners
```bash
# Find unique IP addresses in access log
awk '{print $1}' access.log | sort -u

# Count requests per IP address
awk '{print $1}' access.log | sort | uniq -c | sort -rn

# Find most requested URLs
awk '{print $7}' access.log | sort | uniq -c | sort -rn | head -20

# Count HTTP status codes
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# Find 404 errors with URLs
awk '$9==404 {print $7}' access.log | sort | uniq -c | sort -rn

# Extract requests from specific time period (assuming common log format)
awk '/01\/Jan\/2024:1[0-1]:/ {print}' access.log  # 10-11 AM on Jan 1, 2024

# Find large response sizes (>1MB)
awk '$10 > 1048576 {print $7, $10}' access.log

# Monitor log file in real-time for errors
tail -f /var/log/application.log | grep --color=always -E "(ERROR|WARN|FAIL)"

# Count log entries by hour
awk '{print substr($4,2,11)}' access.log | sort | uniq -c

# Find slowest database queries in log
grep -oP 'Query took \K[0-9.]+(?=s)' database.log | sort -rn | head -10
```

### Data Quality and Validation
```bash
# Check for duplicate rows in CSV (excluding header)
tail -n +2 data.csv | sort | uniq -d

# Validate CSV structure (check for consistent column count)
awk -F',' 'NR==1{cols=NF} NF!=cols{print "Line " NR " has " NF " columns, expected " cols}' data.csv

# Count null/empty values in each CSV column
awk -F',' '{for(i=1;i<=NF;i++) if($i=="" || $i=="NULL" || $i=="null") null[i]++} END {for(i=1;i<=NF;i++) print "Column " i ": " null[i]+0 " nulls"}' data.csv

# Find non-ASCII characters in file
grep --color='never' -P '[^\x00-\x7F]' file.txt

# Validate date format in CSV column (YYYY-MM-DD)
awk -F',' '$3 !~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/ && NR > 1 {print "Line " NR ": Invalid date format in column 3: " $3}' data.csv

# Check for email format validation
awk '{for(i=1;i<=NF;i++) if($i !~ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) print "Line " NR ": Invalid email: " $i}' emails.txt

# Find rows with missing required fields (assuming CSV)
awk -F',' 'NR>1 && ($1=="" || $2=="" || $3=="") {print "Line " NR " has missing required fields"}' data.csv

# Detect encoding of file
file -bi filename.txt | cut -d'=' -f2
```

### Performance and Benchmarking
```bash
# Time command execution
time command_to_test

# Benchmark disk write speed
dd if=/dev/zero of=testfile bs=1M count=1000 oflag=direct

# Benchmark disk read speed  
dd if=testfile of=/dev/null bs=1M iflag=direct

# Test memory speed
dd if=/dev/zero of=/dev/null bs=1M count=1000

# Monitor command resource usage
/usr/bin/time -v command_to_monitor

# Measure directory synchronization time
time rsync -av source/ destination/

# Benchmark compression algorithms
time gzip -c largefile > /dev/null
time bzip2 -c largefile > /dev/null
time xz -c largefile > /dev/null
```

---

## Tips and Best Practices for Data Engineers

### Script Development Best Practices

1. **Always Use Strict Error Handling**
   ```bash
   #!/bin/bash
   set -euo pipefail  # Exit on error, undefined vars, pipe failures
   ```

2. **Log Everything with Timestamps**
   ```bash
   log() {
       echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
   }
   ```

3. **Validate Input Parameters**
   ```bash
   if [ $# -lt 2 ]; then
       echo "Usage: $0 input_file output_file"
       exit 1
   fi
   ```

4. **Use Configuration Files**
   ```bash
   # Load configuration
   CONFIG_FILE="${HOME}/.data_pipeline_config"
   [ -f "$CONFIG_FILE" ] && source "$CONFIG_FILE"
   ```

5. **Implement Cleanup on Exit**
   ```bash
   cleanup() {
       rm -rf "$TEMP_DIR"
       log "Cleanup completed"
   }
   trap cleanup EXIT
   ```

### Performance Optimization

1. **Use Appropriate Tools for Data Size**
   - Small files (<100MB): `awk`, `sed`, standard tools
   - Medium files (100MB-1GB): `sort`, `uniq` with temp files
   - Large files (>1GB): Split processing, parallel tools

2. **Optimize Pipeline Commands**
   ```bash
   # Inefficient: multiple passes
   cat file.txt | grep pattern | sort | uniq
   
   # Better: fewer processes
   grep pattern file.txt | sort -u
   ```

3. **Use Memory-Efficient Processing**
   ```bash
   # Process large files without loading into memory
   while IFS= read -r line; do
       process_line "$line"
   done < large_file.txt
   ```

### Data Pipeline Guidelines

1. **Implement Idempotency** - Scripts should produce same result when run multiple times
2. **Add Data Validation** - Check data quality at each stage
3. **Use Atomic Operations** - Write to temp files, then move to final location
4. **Monitor Resource Usage** - Track CPU, memory, disk I/O
5. **Implement Retry Logic** - Handle transient failures gracefully

### Security Considerations

1. **Protect Sensitive Data**
   ```bash
   # Set restrictive permissions on log files
   chmod 640 "$LOG_FILE"
   
   # Don't log sensitive information
   log "Processing user data for user_id: ${USER_ID}" # Good
   log "Password: ${PASSWORD}"  # Bad - never do this
   ```

2. **Validate File Paths**
   ```bash
   # Prevent directory traversal
   case "$filename" in
       *../*)
           echo "Error: Invalid filename"
           exit 1
           ;;
   esac
   ```

3. **Use Environment Variables for Secrets**
   ```bash
   DB_PASSWORD="${DB_PASSWORD:-$(cat /etc/db_password)}"
   ```

This comprehensive guide provides you with the essential Linux commands, operators, and shell scripting techniques needed for data engineering work. Each command includes explanations of the most commonly used options and practical examples relevant to data processing tasks.
```

### Data Backup and Sync Script
```bash
#!/bin/bash
# Automated Data Backup and Synchronization Script
# Supports local and remote backups with rotation

set -euo pipefail

# Configuration (can be overridden by config file)
SOURCE_DIR="${SOURCE_DIR:-/data/warehouse}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-/backup/local}"
REMOTE_BACKUP_HOST="${REMOTE_BACKUP_HOST:-backup.company.com}"
REMOTE_BACKUP_DIR="${REMOTE_BACKUP_DIR:-/backup/remote}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
CONFIG_FILE="${HOME}/.backup_config"

# Load configuration file if it exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Logging
LOG_DIR="/var/log/backup"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/backup_$(date +%Y%m%d).log"

log() {
    local level="$1"
    shift
    local message="$*"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to calculate directory size
get_dir_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

# Function to create local backup
create_local_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="data_backup_$timestamp"
    local backup_path="$LOCAL_BACKUP_DIR/$backup_name.tar.gz"
    
    log "INFO" "Starting local backup"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Destination: $backup_path"
    
    # Create backup directory
    mkdir -p "$LOCAL_BACKUP_DIR"
    
    # Get source size
    local source_size=$(get_dir_size "$SOURCE_DIR")
    log "INFO" "Source directory size: $source_size"
    
    # Create compressed backup
    if tar -czf "$backup_path" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")" 2>>"$LOG_FILE"; then
        local backup_size=$(get_dir_size "$backup_path")
        log "INFO" "Local backup completed successfully"
        log "INFO" "Backup size: $backup_size"
        
        # Verify backup
        if tar -tzf "$backup_path" >/dev/null 2>&1; then
            log "INFO" "Backup verification successful"
        else
            log "ERROR" "Backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Local backup failed"
        return 1
    fi
    
    echo "$backup_path"  # Return backup path
}

# Function to sync to remote backup
sync_remote_backup() {
    local local_backup="$1"
    
    log "INFO" "Starting remote sync"
    log "INFO" "Syncing $local_backup to $REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR"
    
    # Create remote directory
    if ssh "$REMOTE_BACKUP_HOST" "mkdir -p '$REMOTE_BACKUP_DIR'"; then
        log "INFO" "Remote directory created/verified"
    else
        log "ERROR" "Failed to create remote directory"
        return 1
    fi
    
    # Sync backup file
    if rsync -avz --progress "$local_backup" "$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR/" 2>>"$LOG_FILE"; then
        log "INFO" "Remote sync completed successfully"
        
        # Verify remote file
        local remote_filename=$(basename "$local_backup")
        if ssh "$REMOTE_BACKUP_HOST" "[ -f '$REMOTE_BACKUP_DIR/$remote_filename' ]"; then
            log "INFO" "Remote backup verification successful"
        else
            log "ERROR" "Remote backup verification failed"
            return 1
        fi
    else
        log "ERROR" "Remote sync failed"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    local backup_dir="$1"
    local is_remote="$2"
    
    log "INFO" "Cleaning up backups older than $RETENTION_DAYS days in $backup_dir"
    
    if [ "$is_remote" = "true" ]; then
        # Remote cleanup
        local old_files=$(ssh "$REMOTE_BACKUP_HOST" "find '$backup_dir' -name 'data_backup_*.tar.gz' -mtime +$RETENTION_DAYS -type f" 2>/dev/null || echo "")
        if [ -n "$old_files" ]; then
            echo "$old_files" | while read -r file; do
                if ssh "$REMOTE_BACKUP_HOST" "rm -f '$file'"; then
                    log "INFO" "Removed old remote backup: $file"
                else
                    log "ERROR" "Failed to remove remote backup: $file"
                fi
            done
        fi
    else
        # Local cleanup
        local removed_count=0
        find "$backup_dir" -name "data_backup_*.tar.gz" -mtime +$RETENTION_DAYS -type f -print0 2>/dev/null | \
        while IFS= read -r -d '' file; do
            if rm -f "$file"; then
                log "INFO" "Removed old local backup: $file"
                removed_count=$((removed_count + 1))
            else
                log "ERROR" "Failed to remove local backup: $file"
            fi
        done
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites"
    
    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        log "ERROR" "Source directory $SOURCE_DIR does not exist"
        return 1
    fi
    
    # Check available disk space (need at least 110% of source size)
    local source_size_kb=$(du -sk "$SOURCE_DIR" | cut -f1)
    local required_space_kb=$((source_size_kb * 11 / 10))  # 110% of source
    local available_space_kb=$(df "$LOCAL_BACKUP_DIR" 2>/dev/null | tail -1 | awk '{print $4}' || echo 0)
    
    if [ $available_space_kb -lt $required_space_kb ]; then
        log "ERROR" "Insufficient disk space. Required: ${required_space_kb}KB, Available: ${available_space_kb}KB"
        return 1
    fi
    
    # Check if remote host is reachable (if remote backup enabled)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if ! ssh -o ConnectTimeout=10 "$REMOTE_BACKUP_HOST" "echo 'Connection test'" >/dev/null 2>&1; then
            log "WARN" "Remote host $REMOTE_BACKUP_HOST not reachable. Skipping remote backup."
            REMOTE_BACKUP_HOST=""  # Disable remote backup
        else
            log "INFO" "Remote host $REMOTE_BACKUP_HOST is reachable"
        fi
    fi
    
    log "INFO" "Prerequisites check completed"
}

# Function to send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification (if mail command available)
    if command -v mail >/dev/null 2>&1 && [ -n "${BACKUP_EMAIL:-}" ]; then
        echo "$message" | mail -s "Backup $status: $(hostname)" "$BACKUP_EMAIL"
    fi
    
    # Webhook notification (if configured)
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"Backup $status on $(hostname): $message\"}" \
             "$WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
}

# Main backup function
main() {
    local start_time=$(date +%s)
    
    log "INFO" "=== Starting backup process ==="
    log "INFO" "Timestamp: $(date)"
    log "INFO" "Source: $SOURCE_DIR"
    log "INFO" "Local backup: $LOCAL_BACKUP_DIR"
    log "INFO" "Remote backup: ${REMOTE_BACKUP_HOST:+$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_DIR}"
    log "INFO" "Retention: $RETENTION_DAYS days"
    
    # Check prerequisites
    if ! check_prerequisites; then
        log "ERROR" "Prerequisites check failed"
        send_notification "FAILED" "Prerequisites check failed"
        exit 1
    fi
    
    # Create local backup
    local backup_file
    if backup_file=$(create_local_backup); then
        log "INFO" "Local backup created: $backup_file"
    else
        log "ERROR" "Local backup failed"
        send_notification "FAILED" "Local backup creation failed"
        exit 1
    fi
    
    # Remote sync (if configured)
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        if sync_remote_backup "$backup_file"; then
            log "INFO" "Remote sync completed"
        else
            log "ERROR" "Remote sync failed"
            send_notification "FAILED" "Remote sync failed"
            exit 1
        fi
    fi
    
    # Cleanup old backups
    cleanup_old_backups "$LOCAL_BACKUP_DIR" "false"
    if [ -n "$REMOTE_BACKUP_HOST" ]; then
        cleanup_old_backups "$REMOTE_BACKUP_DIR" "true"
    fi
    
    # Calculate total time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $(((duration%3600)/60)) $((duration%60)))
    
    log "INFO" "=== Backup process completed successfully ==="
    log "INFO" "Total duration: $duration_formatted"
    log "INFO" "Backup file: $backup_file"
    
    send_notification "SUCCESS" "Backup completed in $duration_formatted"
}

# Script usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Data Backup Script with Local and Remote Support

OPTIONS:
    -s, --source DIR        Source directory to backup (default: $SOURCE_DIR)
    -l, --local DIR         Local backup directory (default: $LOCAL_BACKUP_DIR)
    -r, --remote HOST       Remote backup host (default: $REMOTE_BACKUP_HOST)
    -d, --remote-dir DIR    Remote backup directory (default: $REMOTE_BACKUP_DIR)
    -k, --keep DAYS         Retention period in days (default: $RETENTION_DAYS)
    -c, --config FILE       Configuration file (default: $CONFIG_FILE)
    -h, --help              Show this help message

EXAMPLES:
    $0                                          # Run with default settings
    $0 -s /data/warehouse -l /backup/local     # Custom source and local backup
    $0 -r backup.example.com -k 7              # Remote backup with 7-day retention

CONFIGURATION FILE:
    Create $CONFIG_FILE with variables:
    SOURCE_DIR="/data/warehouse"
    LOCAL_BACKUP_DIR="/backup/local"
    REMOTE_BACKUP_HOST="backup.company.com"
    REMOTE_BACKUP_DIR="/backup/remote"
    RETENTION_DAYS=30
    BACKUP_EMAIL="admin@company.com"
    WEBHOOK_URL="https://hooks.slack.com/..."

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_DIR="$2"
            shift 2
            ;;
        -l|--local)
            LOCAL_BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--remote)
            REMOTE_BACKUP_HOST="$2"
            shift 2
            ;;
        -d|--remote-dir)
            REMOTE_BACKUP_DIR="$2"
            shift 2
            ;;
        -k|--keep)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            if [ -f "$CONFIG_FILE" ]; then
                source "$CONFIG_FILE"
            fi
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Execute main function
main
```

---

## Performance Monitoring

### System Resource Monitoring

#### `sar` - System Activity Reporter
**Most Used Options:**
- `-u` = CPU utilization
- `-r` = Memory utilization
- `-b` = I/O and transfer rate statistics
- `-d` = Block device activity
- `interval count` = Sample every interval seconds for count times

```bash
sar -u 1 5                            # CPU usage every 1 second, 5 times
sar -r 1 10                           # Memory usage every 1 second, 10 times
sar -d 2 5                            # Disk I/O every 2 seconds, 5 times
sar -b 1 0                            # I/O stats every 1 second continuously (0 = infinite)
```

#### `iostat` - I/O Statistics
**Most Used Options:**
- `-x` = Extended statistics
- `-k` = Display in kilobytes
- `-m` = Display in megabytes
- `-d` = Display device statistics only

```bash
iostat                                 # Basic I/O stats
iostat -x                             # Extended I/O statistics (-x)
iostat -x 1                           # Extended stats every 1 second
iostat -xk 2 5                        # Extended stats in KB, every 2 sec, 5 times
iostat -d                             # Device statistics only (-d)
```

#### `vmstat` - Virtual Memory Statistics
**Most Used Options:**
- `interval count` = Sample timing
- `-S` = Unit specification (k, K, m, M)

```bash
vmstat                                 # One-time memory/CPU/I/O stats
vmstat 1                              # Update every 1 second
vmstat 1 10                           # Update every 1 second, 10 times
vmstat -S M 2                         # Stats in megabytes (-S M), every 2 seconds
```

#### Network Monitoring

#### `netstat` - Network Statistics
**Most Used Options:**
- `-t` = TCP connections
- `-u` = UDP connections
- `-l` = Listening ports only
- `-n` = Show numerical addresses (don't resolve hostnames)
- `-p` = Show process ID and name
- `-r` = Show routing table

```bash
netstat -tuln                         # TCP/UDP listening ports (-t -u -l -n)
netstat -tupln                        # Include process info (-p)
netstat -rn                           # Routing table with numerical addresses
netstat -i                            # Network interfaces
netstat -s                            # Network statistics summary
```

#### `ss` - Socket Statistics (modern netstat replacement)
**Most Used Options:**
- `-t` = TCP sockets
- `-u` = UDP sockets
- `-l` = Listening sockets
- `-n` = Numerical addresses
- `-p` = Show processes
- `-s` = Summary statistics

```bash
ss -tuln                              # TCP/UDP listening ports
ss -tupln                             # Include process information
ss -s                                 # Socket statistics summary
ss -t state established               # Show established TCP connections
ss -o state established               # Show with timer information
```

### Database and Application Monitoring Scripts

#### Database Connection Monitor
```bash
#!/bin/bash
# Database Connection Monitoring Script

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
MAX_CONNECTIONS="${MAX_CONNECTIONS:-100}"
WARNING_THRESHOLD="${WARNING_THRESHOLD:-80}"
LOG_FILE="/var/log/db_monitor.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Function to count current connections
count_connections() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            # PostgreSQL connection count
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' '
            ;;
        "mysql")
            # MySQL connection count
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | awk 'NR==2 {print $2}'
            ;;
        *)
            # Generic approach using netstat
            netstat -an | grep ":$DB_PORT" | grep ESTABLISHED | wc -l
            ;;
    esac
}

# Function to get database version
get_db_version() {
    case "$DB_TYPE" in
        "postgresql"|"postgres")
            psql -h "$DB_HOST" -p "$DB_PORT" -t -c "SELECT version();" 2>/dev/null | head -1 | tr -d ' \n'
            ;;
        "mysql")
            mysql -h "$DB_HOST" -P "$DB_PORT" -e "SELECT VERSION();" 2>/dev/null | tail -1
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

# Function to check database health
check_db_health() {
    local connection_count=$1
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    
    log "INFO: Current connections: $connection_count"
    log "INFO: CPU usage: $cpu_usage%"
    log "INFO: Memory usage: $memory_usage%"
    
    # Connection threshold checks
    local warning_limit=$((MAX_CONNECTIONS * WARNING_THRESHOLD / 100))
    
    if [ "$connection_count" -gt "$MAX_CONNECTIONS" ]; then
        log "CRITICAL: Connection count ($connection_count) exceeds maximum ($MAX_CONNECTIONS)"
        return 2
    elif [ "$connection_count" -gt "$warning_limit" ]; then
        log "WARNING: Connection count ($connection_count) exceeds warning threshold ($warning_limit)"
        return 1
    else
        log "INFO: Connection count is within normal limits"
        return 0
    fi
}

# Function to get slow queries (PostgreSQL)
check_slow_queries() {
    if [ "$DB_TYPE" = "postgresql" ] || [ "$DB_TYPE" = "postgres" ]; then
        log "INFO: Checking for slow queries"
        psql -h "$DB_HOST" -p "$DB_PORT" -t -c "
        SELECT 
            pid,
            now() - pg_stat_activity.query_start AS duration,
            query 
        FROM pg_stat_activity 
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
        ORDER BY duration DESC;
        " 2>/dev/null | head -5
    fi
}

# Main monitoring function
main() {
    log "=== Database Connection Monitor Started ==="
    log "INFO: Monitoring $DB_HOST:$DB_PORT"
    
    # Get database info
    if [ -n "${DB_TYPE:-}" ]; then
        local db_version=$(get_db_version)
        log "INFO: Database version: $db_version"
    fi
    
    # Count current connections
    local current_connections
    if current_connections=$(count_connections); then
        log "INFO: Successfully retrieved connection count"
    else
        log "ERROR: Failed to retrieve connection count"
        exit 1
    fi
    
    # Check database health
    check_db_health "$current_connections"
    local health_status=$?
    
    # Check for slow queries
    check_slow_queries
    
    # Generate summary
    case $health_status in
        0)
            log "INFO: Database health check PASSED"
            ;;
        1)
            log "WARNING: Database health check WARNING"
            # Could send alert here
            ;;
        2)
            log "CRITICAL: Database health check FAILED"
            # Could send critical alert here
            ;;
    esac
    
    log "=== Database Connection Monitor Completed ==="
    return $health_status
}

# Parse command line options
DB_TYPE="generic"
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            DB_HOST="$2"
            shift 2
            ;;
        --port)
            DB_PORT="$2"
            shift 2
            ;;
        --type)
            DB_TYPE="$2"
            shift 2
            ;;
        --max-connections)
            MAX_CONNECTIONS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Execute main function
main