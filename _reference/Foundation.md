# Linux Application Development — Master Foundation Guide

> **Purpose:** This is the canonical reference document for all development sessions between the human lead and any AI collaborator. Read this before writing a single line of application code. Nothing in this document changes without a deliberate, documented decision.

---

## 1. Team Roles & Division of Labor

### Antigravity IDE — Local Lead Developer

- **Focus:** Core logic, UI/UX creation, rapid prototyping, and interactive debugging.
    
- **Actions:** Writing Python code, live UI testing by running `python src/main.py` directly in the local terminal, and immediate debugging tasks within the IDE.
    
- **Boundary:** Does not manage CI/CD pipelines, infrastructure provisioning, or packaging manifests. Those belong to Jules.
    

### Google Jules — Cloud DevOps / SRE

- **Focus:** Infrastructure, stability, automated testing, and distribution.
    
- **Actions:** Autonomous unit test generation, database schema creation (Supabase), authentication integration (Supabase Auth), CI/CD pipeline management (GitHub Actions), and final packaging (Flatpak / AppImage).
    
- **Dependency:** Jules operates asynchronously against the **remote GitHub repository**. Jules cannot act on code that has not been pushed. The repo must exist on GitHub before assigning Jules any task.
    
- **Boundary:** Does not make decisions about application logic or UI design. Those belong to the local lead.
    

### Clarification on AI Collaborator Role

Any AI assistant working in-session acts as a **pair programmer under the human lead's direction**. The AI follows this document, does not override architectural decisions unilaterally, and flags disagreements explicitly rather than silently substituting alternatives.

---

## 2. The Tech Stack

|Layer|Choice|Rationale|
|---|---|---|
|Language|Python 3.11+|Rapid iteration, broad library support, excellent cross-distro packaging|
|UI Framework|PySide6 / Qt6|Native Linux styling, robust Flatpak/AppImage support, active upstream|
|Database|Supabase (PostgreSQL)|Managed backend, built-in auth, real-time support|
|Authentication|Supabase Auth|Native to the Supabase stack|
|Environment|Python `venv`|Clean dependency isolation essential for reproducible packaging|
|Linter / Formatter|Ruff|Replaces Black, Flake8, and isort in a single fast tool|
|Testing|pytest|Industry standard, integrates cleanly with GitHub Actions|
|CI/CD|GitHub Actions|Native to GitHub, runs on push and PR, can build and attach Flatpak or AppImage artifacts to releases|
|Env Vars|python-dotenv|Loads `.env` locally; never commits secrets|

> **Removed from original draft:** Stitch and Render have been dropped and replaced with correct tools.

---

## 3. Core Design Philosophy

These are non-negotiable constraints. Every module written must comply with all three.

### 3.1 XDG Base Directory Standard

All user-facing and mutable data is written to the correct XDG paths, resolved dynamically at runtime. No hardcoded absolute paths anywhere in application code.

```python
import os

XDG_CONFIG_HOME = os.environ.get("XDG_CONFIG_HOME", os.path.expanduser("~/.config"))
XDG_DATA_HOME   = os.environ.get("XDG_DATA_HOME",   os.path.expanduser("~/.local/share"))
XDG_CACHE_HOME  = os.environ.get("XDG_CACHE_HOME",  os.path.expanduser("~/.cache"))

APP_NAME = "MyAppName"

CONFIG_DIR = os.path.join(XDG_CONFIG_HOME, APP_NAME)
DATA_DIR   = os.path.join(XDG_DATA_HOME,   APP_NAME)
CACHE_DIR  = os.path.join(XDG_CACHE_HOME,  APP_NAME)
LOG_DIR    = os.path.join(DATA_DIR, "logs")

for d in [CONFIG_DIR, DATA_DIR, CACHE_DIR, LOG_DIR]:
    os.makedirs(d, exist_ok=True)
```

### 3.2 The Agnostic Core

Application code must not contain packaging-specific branching or checks such as `APPIMAGE` or `FLATPAK_ID`. Packaging layers adapt to the application. The application core remains independent and portable.

### 3.3 Asset and Data Separation

Bundled static assets such as icons, fonts, and UI resources are loaded relative to the application directory or via Qt resource systems.

Mutable data such as user databases, caches, logs, and generated files must never be stored inside the application directory. They must use XDG paths defined above.

```python
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def asset_path(*parts: str) -> str:
    return os.path.join(BASE_DIR, "..", "assets", *parts)
```

### 3.4 Structured Logging

Logs write to `LOG_DIR` with daily rotation. Logging must be initialized before any other subsystem.

```python
import logging
from logging.handlers import TimedRotatingFileHandler

def setup_logging():
    log_file = os.path.join(LOG_DIR, "app.log")
    handler = TimedRotatingFileHandler(log_file, when="midnight", backupCount=7)
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
    logging.basicConfig(level=logging.INFO, handlers=[handler, logging.StreamHandler()])
```

### 3.5 Secrets Management

No credentials, API keys, or connection strings live in source code or in committed files.

```python
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
```

**Critical rule for Supabase:**

- Only public or anon keys are allowed in the client application
    
- Service role keys or privileged credentials must never be shipped in a desktop app
    
- Any privileged operation must be handled through a secure backend, not directly from the client
    

---

## 4. Project Architecture

```
my-linux-app/
├── src/
│   ├── ui/
│   ├── core/
│   └── main.py
│
├── assets/
│   ├── icons/
│   └── org.myname.MyApp.desktop
│
├── tests/
│   ├── test_core.py
│   └── conftest.py
│
├── packaging/
│   ├── flatpak/
│   │   └── org.myname.MyApp.yml
│   └── appimage/
│       ├── AppRun
│       └── AppDir/
│
├── scripts/
│   ├── build.sh
│   └── run_tests.sh
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .pre-commit-config.yaml
├── pyproject.toml
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

> **Dependency management clarification:**

- `pyproject.toml` is the source of truth for dependencies and build configuration
    
- `requirements.txt` is a generated, pinned dependency snapshot used for deterministic installs in CI
    
- The file should be regenerated in a clean virtual environment when dependencies change
    

---

## 5. `.gitignore` — Required Exclusions

```gitignore
# Python
venv/
.venv/
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/

# Environment & Secrets
.env

# Packaging Artifacts
*.flatpak
*.AppImage
packaging/appimage/AppDir/

# IDE
.idea/
.vscode/
*.swp

# Logs and runtime data
*.log
.pytest_cache/
.ruff_cache/
.coverage
```

---

## 6. GitHub Actions CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt
      - name: Lint with Ruff
        run: venv/bin/ruff check src/
      - name: Run tests
        run: venv/bin/pytest tests/ --tb=short
```

> This pipeline installs dependencies from a pinned requirements file or equivalent lock source to ensure reproducibility.

---

## 7. Error Handling and Reliability Policy

- No silent failures are allowed
    
- All critical failures must be logged with context
    
- Application startup must fail loudly if required configuration is missing
    
- Config and schema migrations must be explicit and testable
    
- External service failures must degrade gracefully where possible
    

---

## 8. Pre-Flight Configuration Checklist

Complete every item before writing the first line of application code.

### Local Environment

-  Install python3.11 and python3-venv
    
-  Install flatpak-builder
    
-  Download appimagetool and place in scripts/
    
-  Install Ruff
    
-  Install pre-commit
    

### Repository Setup

-  git init
    
-  Create repo on GitHub
    
-  Add remote origin
    
-  Create main and dev branches
    
-  Commit initial structure
    
-  Push to GitHub
    
-  Verify Jules access
    

### Python Environment

-  Create virtual environment
    
-  Activate it
    
-  Install dependencies
    
-  Generate requirements.txt from clean environment
    
-  Create pyproject.toml
    
-  Setup .env locally
    

### Pre-commit Hooks

-  Create config file
    
-  Install hooks
    
-  Verify execution
    

---

## 9. Decision Log

|Date|Decision|Reason|Owner|
|---|---|---|---|
|—|—|—|—|

---

Foundation locked.