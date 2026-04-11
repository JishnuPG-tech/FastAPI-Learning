# Module 01 — Installation & Setup

## What this does
Sets up your Python environment and installs FastAPI with all dependencies. Gets you ready to run your first API.

---

## Required Imports
_(No imports yet — this is setup only)_

---

## Tools Installed

| Tool | Purpose |
|---|---|
| `fastapi` | The web framework itself |
| `uvicorn` | ASGI server that runs FastAPI |
| `fastapi[all]` | FastAPI + uvicorn + extras in one command |

---

## Step-by-Step Setup

### 1. Create project folder
```bash
mkdir my_fastapi_project
cd my_fastapi_project
```

### 2. Create a virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install FastAPI (all extras)
```bash
pip install "fastapi[all]"
```
This installs:
- `fastapi` — the framework
- `uvicorn` — the server
- `pydantic` — data validation
- `python-multipart` — form/file support
- `email-validator` — email validation

### 4. Verify installation
```bash
python -c "import fastapi; print(fastapi.__version__)"
```

---

## File Structure After Setup
```
my_fastapi_project/
├── venv/               ← virtual environment (don't touch)
└── main.py             ← your app file (you create this)
```

---

## Running the Server
```bash
# Development (auto-reload on file save)
uvicorn main:app --reload

# What this means:
# main     → the file name (main.py)
# app      → the FastAPI instance inside main.py
# --reload → restart when you save changes
```

### Server Output
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
```

### Auto-Generated Docs (FREE!)
| URL | What it is |
|---|---|
| `http://localhost:8000/docs` | Swagger UI — interactive API tester |
| `http://localhost:8000/redoc` | ReDoc — clean documentation |
| `http://localhost:8000/openapi.json` | Raw schema |

---

## Key Points
- Always activate virtual environment before working
- Use `--reload` during development
- FastAPI auto-generates docs — no extra work needed

---
**Next → Module 02: First API**
