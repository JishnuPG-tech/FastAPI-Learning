# Module 15 — Database Connection with SQLAlchemy

## What this does
Connects FastAPI to a real database (SQLite or PostgreSQL) using SQLAlchemy ORM. Sets up a reusable database session for every request.

---

## Required Imports

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends
```

| Import | Why |
|---|---|
| `create_engine` | Creates DB connection with the URL |
| `declarative_base` | Base class all ORM models inherit from |
| `sessionmaker` | Factory that creates DB sessions |
| `Session` | Type hint for DB session parameter |
| `Depends` | Inject DB session into routes |

---

## Install SQLAlchemy

```bash
pip install sqlalchemy
pip install psycopg2-binary   # for PostgreSQL
# SQLite is built-in — no extra install needed
```

---

## File: `database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ─── Choose your database ────────────────────────────────────────
# SQLite (file-based, great for development)
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

# PostgreSQL (for production)
# SQLALCHEMY_DATABASE_URL = "postgresql://username:password@localhost/dbname"
# ──────────────────────────────────────────────────────────────────

# Create the engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Only needed for SQLite
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all models
Base = declarative_base()
```

---

## What Each Part Does

| Part | What it does |
|---|---|
| `create_engine` | Opens connection to the database |
| `check_same_thread: False` | SQLite safety — allows multiple threads |
| `SessionLocal` | Factory to create DB sessions |
| `autocommit=False` | You control when to commit changes |
| `autoflush=False` | You control when to flush |
| `Base` | All your models will inherit this |

---

## Dependency — Get DB Session

```python
from database import SessionLocal

def get_db():
    db = SessionLocal()      # Open session
    try:
        yield db             # Inject into route
    finally:
        db.close()           # Always close after request
```

---

## Using the DB in Routes

```python
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "DB connected!"}
```

---

## File: `main.py` — Create Tables on Start

```python
from fastapi import FastAPI
from database import engine, Base
import models   # must import models so Base knows about them

app = FastAPI()

# Create all tables when app starts
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "API running with DB"}
```

---

## Full File Structure After This Module

```
my_fastapi_project/
├── venv/
├── main.py              ← app entry point, creates tables
├── database.py          ← engine, SessionLocal, Base, get_db
└── models.py            ← table definitions (next module)
```

---

## File Connections

```
database.py
    ├── creates: engine, SessionLocal, Base
    └── provides: get_db() dependency

models.py
    ├── imports Base from database.py
    └── defines table classes

main.py
    ├── imports Base, engine from database.py
    ├── imports models (triggers model registration)
    └── calls Base.metadata.create_all(bind=engine)
```

---

## Environment Variables (Best Practice)

Don't hardcode credentials! Use a `.env` file:

```bash
# .env
DATABASE_URL=postgresql://postgres:password@localhost/mydb
```

```python
# database.py
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
engine = create_engine(DATABASE_URL)
```

```bash
pip install python-dotenv
```

---

## Key Points
- `database.py` is the single source of truth for DB config
- `get_db()` uses `yield` — always closes session after request
- Import all models in `main.py` before calling `create_all()`
- Use SQLite for development, PostgreSQL for production
- Use `.env` file for DB credentials — never hardcode

---
**Next → Module 16: Models & Tables**
