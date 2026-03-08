// Git & Version Control — Topic Deep-Dive Content
export const gitContent = {
  'git-vcs-0': {
    tutorial: {
      explanation: [
        'Git tracks changes as snapshots, not diffs. The three areas: working directory (your files), staging area (git add), and repository (git commit). Understanding this flow is fundamental to everything in Git.',
        'Key concepts: commits are immutable snapshots with SHA-1 hashes. HEAD points to your current commit. Branches are just pointers to commits — creating a branch is O(1), not a copy.',
      ],
      codeExamples: [
        { description: 'Git fundamentals', code: `# Initialize and configure
git init
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# The core workflow
git status                    # see what changed
git diff                      # see exact changes (unstaged)
git diff --staged             # see staged changes
git add -p                    # stage interactively (hunk by hunk)
git commit -m "feat: add data validation step"

# View history
git log --oneline --graph -20  # compact visual history
git show abc1234               # see specific commit details
git blame file.py              # who changed each line and when` },
      ],
      keyTakeaways: [
        'Working directory → git add → staging → git commit → repository',
        'git add -p: stage specific changes — keep commits focused and atomic',
        'git log --oneline --graph: visual branch history in terminal',
        'git blame: find who wrote/changed each line — essential for debugging',
        'Conventional commits: feat:, fix:, docs:, refactor: — for clear history',
      ],
    },
    crashCourse: {
      summary: 'Git has 3 areas: working dir → staging (add) → repo (commit). Commits are snapshots. Branches are pointers. Use git add -p for precise staging.',
      quickFacts: ['git status: what changed', 'git diff: unstaged changes', 'git diff --staged: staged changes', 'git log --oneline: compact history', 'HEAD: current commit pointer'],
      tips: ['Write commit messages as imperative: "add feature" not "added feature"'],
    },
  },
  'git-vcs-1': {
    tutorial: {
      explanation: [
        'Branching strategies organize team development. Git Flow: main + develop + feature/release/hotfix branches. GitHub Flow: main + short-lived feature branches + PRs. Trunk-based: commit to main frequently with feature flags.',
        'For DE teams: GitHub Flow is most common — feature branches for pipeline changes, PRs for review, CI/CD runs tests before merge.',
      ],
      codeExamples: [
        { description: 'Branching workflows', code: `# GitHub Flow (most common for DE)
git checkout -b feature/add-kafka-consumer
# ... make changes ...
git add -A && git commit -m "feat: add Kafka consumer for user events"
git push origin feature/add-kafka-consumer
# → Create PR on GitHub → Review → Merge → Delete branch

# Trunk-based (for small teams)
git checkout main
git pull origin main
# ... small change ...
git commit -m "fix: handle null user_id in transform"
git push origin main

# Release branches (for versioned deployments)
git checkout -b release/v2.1 main
# ... stabilize, bug fixes only ...
git tag v2.1.0
git merge release/v2.1 main` },
      ],
      keyTakeaways: [
        'GitHub Flow: simple, PR-based — best for most DE teams',
        'Git Flow: complex, multiple long-lived branches — for versioned releases',
        'Trunk-based: commit to main often — requires strong CI/CD and feature flags',
        'Feature branches should be short-lived (<1 week) to minimize merge conflicts',
      ],
    },
    crashCourse: {
      summary: 'GitHub Flow: feature branches + PRs + merge to main. Short-lived branches. CI/CD tests before merge. Most common for DE teams.',
      quickFacts: ['Feature branch: feature/description', 'PR: code review before merge', 'Delete branch after merge', 'Keep branches short-lived (<1 week)'],
      tips: ['Name branches consistently: feature/, fix/, chore/ — makes history scannable'],
    },
  },
  'git-vcs-2': {
    tutorial: {
      explanation: [
        'Merge combines branches. Fast-forward: linear history (no merge commit). 3-way merge: creates a merge commit (preserves branch history). Rebase replays your commits on top of another branch — creates linear history but rewrites commits.',
        'Conflict resolution: Git marks conflicts with <<<<< / ===== / >>>>> markers. You must manually resolve, then git add and continue.',
      ],
      codeExamples: [
        { description: 'Merge, rebase, and conflict resolution', code: `# Merge (preserves history)
git checkout main
git merge feature/new-pipeline
# Creates a merge commit if branches diverged

# Rebase (linear history)
git checkout feature/new-pipeline
git rebase main
# Replays your commits ON TOP of main
# WARNING: never rebase shared/pushed branches!

# Interactive rebase (clean up before PR)
git rebase -i HEAD~5
# pick: keep commit
# squash: merge into previous
# reword: change commit message
# drop: remove commit

# Resolve conflicts
# 1. Edit files, remove conflict markers
# 2. git add resolved_file.py
# 3. git rebase --continue  (or git merge --continue)` },
      ],
      keyTakeaways: [
        'Merge: safe, preserves history, creates merge commits',
        'Rebase: cleaner linear history, but NEVER rebase pushed/shared branches',
        'Interactive rebase (rebase -i): squash, reorder, edit commits before PR',
        'Conflict resolution: edit → add → continue — never panic, conflicts are normal',
      ],
    },
    crashCourse: {
      summary: 'Merge preserves branch history. Rebase creates linear history but rewrites commits. Never rebase pushed branches. Use interactive rebase to clean up before PRs.',
      quickFacts: ['git merge: safe, merge commit', 'git rebase: linear, rewrites history', 'rebase -i: squash/edit/reorder commits', 'Golden rule: never rebase shared branches'],
      tips: ['Squash your 15 small commits into 1-3 meaningful commits before merging a PR'],
    },
  },
  'git-vcs-3': {
    tutorial: {
      explanation: [
        'Stash temporarily shelves changes without committing. Cherry-pick applies a specific commit from another branch. Bisect helps find the exact commit that introduced a bug using binary search.',
      ],
      codeExamples: [
        { description: 'Advanced Git operations', code: `# Stash: save work temporarily
git stash                      # shelve all changes
git stash list                 # see all stashes
git stash pop                  # restore most recent stash
git stash apply stash@{2}      # apply specific stash

# Cherry-pick: grab a specific commit
git cherry-pick abc1234        # apply commit abc1234 to current branch

# Bisect: find the bug-introducing commit
git bisect start
git bisect bad                 # current version has the bug
git bisect good v1.0.0         # this version was fine
# Git checks out middle commit, you test:
git bisect good                # or git bisect bad
# Repeat until found, then:
git bisect reset` },
      ],
      keyTakeaways: [
        'git stash: quick save without committing — great for context switching',
        'git cherry-pick: apply specific commits — useful for hotfixes',
        'git bisect: binary search for bug introduction — O(log n) commits to check',
        'git reflog: safety net — shows ALL recent HEAD movements, even "deleted" commits',
      ],
    },
    crashCourse: {
      summary: 'Stash for temporary saves, cherry-pick for specific commits, bisect for finding bugs. reflog is your safety net for recovering "lost" work.',
      quickFacts: ['git stash: save/restore work', 'git cherry-pick SHA: apply one commit', 'git bisect: binary search for bugs', 'git reflog: recover from mistakes'],
      tips: ['Learn git reflog — it has saved countless engineers from "I lost my work" panic'],
    },
  },
  'git-vcs-4': {
    tutorial: {
      explanation: [
        'Pre-commit hooks run checks before each commit: linting, formatting, type checking, secret detection. This catches issues locally before they reach CI. The pre-commit framework manages hooks declaratively.',
      ],
      codeExamples: [
        { description: 'Pre-commit hook setup', code: `# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: detect-private-key        # catch accidental secret commits

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff                       # Python linting
      - id: ruff-format               # Python formatting

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets             # prevent secret leaks

# Install: pip install pre-commit && pre-commit install
# Now hooks run automatically on every git commit` },
      ],
      keyTakeaways: [
        'pre-commit hooks catch issues before commit — faster than waiting for CI',
        'detect-secrets: prevents accidental credential commits — essential for DE',
        'ruff: fast Python linter + formatter — replaces flake8, black, isort',
        'CI should also run the same checks — hooks are a first line of defense',
      ],
    },
    crashCourse: {
      summary: 'Pre-commit hooks run automatically before each commit: linting, formatting, secret detection. Catches issues locally, long before CI.',
      quickFacts: ['pre-commit install: enable hooks', '.pre-commit-config.yaml: declare hooks', 'detect-secrets: prevent credential leaks', 'ruff: fast Python lint + format'],
      tips: ['Always include detect-secrets and detect-private-key hooks — one leaked credential can be catastrophic'],
    },
  },
  'git-vcs-5': {
    tutorial: {
      explanation: [
        'Tags mark specific commits as releases (v1.0.0). .gitignore prevents committing unwanted files. git lfs handles large files. .gitattributes controls merge and diff behavior for specific file types.',
      ],
      codeExamples: [
        { description: 'Tags, ignore, and large files', code: `# Semantic versioning tags
git tag -a v2.1.0 -m "Release: new Kafka consumer pipeline"
git push origin v2.1.0

# .gitignore for DE projects
*.pyc
__pycache__/
.env
*.parquet
*.csv
.venv/
.ipynb_checkpoints/
dist/
*.log

# Git LFS for large files
git lfs install
git lfs track "*.parquet"
git lfs track "*.model"
cat .gitattributes
# *.parquet filter=lfs diff=lfs merge=lfs -text` },
      ],
      keyTakeaways: [
        'Annotated tags (-a): include message, author, date — use for releases',
        '.gitignore: prevent data files, secrets, and artifacts from being committed',
        'Git LFS: track large binary files without bloating the repo',
        'Semantic versioning: MAJOR.MINOR.PATCH — breaking.feature.fix',
      ],
    },
    crashCourse: {
      summary: 'Tags for releases (v1.0.0). .gitignore for data/secrets/artifacts. Git LFS for large files. Follow semantic versioning.',
      quickFacts: ['git tag -a v1.0.0 -m "msg": annotated tag', '.gitignore: *.parquet, .env, __pycache__/', 'git lfs track "*.parquet": large file support', 'v1.0.0: major.minor.patch'],
      tips: ['Always .gitignore data files and .env — accidentally committing a 2GB parquet file is painful to fix'],
    },
  },
  'git-vcs-6': {
    tutorial: {
      explanation: [
        'GitHub Actions and CI/CD pipelines automate testing and deployment on every push/PR. For DE, CI runs: linting, unit tests, dbt build, integration tests, and then deploys pipeline code to production.',
      ],
      codeExamples: [
        { description: 'GitHub Actions for DE pipeline', code: `# .github/workflows/pipeline-ci.yml
name: Pipeline CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -e ".[dev]"
      - run: ruff check .              # lint
      - run: pytest tests/ -v          # unit tests
      - run: python -m mypy src/       # type check

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy pipeline to production"` },
      ],
      keyTakeaways: [
        'CI runs on every PR: lint → test → type check — catch issues before merge',
        'CD deploys on merge to main: only after all tests pass',
        'needs: job1: ensures jobs run in order — test before deploy',
        'Use secrets for credentials: ${{ secrets.AWS_ACCESS_KEY }}',
      ],
    },
    crashCourse: {
      summary: 'CI/CD automates testing and deployment. Run lint + test on PRs, deploy on merge to main. GitHub Actions is the standard.',
      quickFacts: ['on: pull_request: trigger on PR', 'on: push: trigger on merge', 'needs: depends on another job', 'secrets: encrypted env vars in GitHub'],
      tips: ['Keep CI fast (<5 min) — slow CI kills developer productivity'],
    },
  },
  'git-vcs-7': {
    tutorial: {
      explanation: [
        'Collaboration best practices: meaningful commit messages, small focused PRs, code review etiquette, and maintaining a clean git history. These practices multiply team productivity.',
      ],
      codeExamples: [
        { description: 'Git collaboration patterns', code: `# Conventional commit messages
git commit -m "feat: add partition pruning to sales pipeline"
git commit -m "fix: handle null timestamps in event stream"
git commit -m "refactor: extract validation into shared module"
git commit -m "docs: update README with setup instructions"
git commit -m "perf: optimize join by broadcasting small table"

# PR template (.github/pull_request_template.md)
# ## What changed
# - Added Kafka consumer for user events
#
# ## Why
# - Need real-time user activity for fraud detection
#
# ## Testing
# - [x] Unit tests pass
# - [x] Integration test with local Kafka
# - [ ] Staging deployment tested
#
# ## Rollback plan
# - Revert this PR, no schema changes needed` },
      ],
      keyTakeaways: [
        'Small PRs (<300 lines): easier to review, faster to merge, fewer bugs',
        'Conventional commits: feat/fix/refactor — enables automated changelogs',
        'PR templates: what/why/testing/rollback — forces thorough descriptions',
        'Review code daily — blocking PRs slows the entire team',
        'git log --oneline should tell the project story — invest in good messages',
      ],
    },
    crashCourse: {
      summary: 'Small PRs, conventional commits, templates, daily reviews. Good git hygiene multiplies team productivity.',
      quickFacts: ['feat: new feature', 'fix: bug fix', 'refactor: code change, no behavior change', 'docs: documentation only', 'chore: maintenance, deps, CI'],
      tips: ['The best commit messages explain WHY, not WHAT — the diff shows what changed'],
    },
  },
};
