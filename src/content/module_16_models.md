# Module 16 — Models & Tables

## What this does
Defines Python classes that map to database tables. Each class = one table. Each attribute = one column. SQLAlchemy creates the actual tables from these.

---

## Required Imports

```python
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey
from sqlalchemy import DateTime, func
from sqlalchemy.orm import relationship
from database import Base
```

| Import | Why |
|---|---|
| `Column` | Defines a table column |
| `Integer`, `String`, etc. | Column data types |
| `ForeignKey` | Links to another table's column |
| `relationship` | ORM shortcut to access related records |
| `Base` | All models must inherit this |
| `func` | SQL functions (e.g. `NOW()` for timestamps) |

---

## File: `models.py`

### User Model

```python
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"          # actual table name in DB

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String, nullable=False)
    email    = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    posts = relationship("Post", back_populates="owner")  # one-to-many
```

### Post Model

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func

class Post(Base):
    __tablename__ = "posts"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String, nullable=False)
    content    = Column(Text)
    published  = Column(Boolean, default=True)
    owner_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="posts")  # many-to-one
```

---

## Column Types Reference

| SQLAlchemy Type | Python Type | SQL Type |
|---|---|---|
| `Integer` | `int` | INT |
| `String(50)` | `str` | VARCHAR(50) |
| `String` | `str` | TEXT |
| `Text` | `str` | TEXT (long) |
| `Float` | `float` | FLOAT |
| `Boolean` | `bool` | BOOLEAN |
| `DateTime` | `datetime` | TIMESTAMP |

---

## Column Options Reference

| Option | Meaning |
|---|---|
| `primary_key=True` | This is the PK (auto-increment) |
| `index=True` | Creates DB index (faster lookups) |
| `unique=True` | No duplicate values allowed |
| `nullable=False` | Column cannot be NULL |
| `default=True` | Default value in Python |
| `server_default=func.now()` | Default set by DB server |

---

## Timestamps (Auto-Created & Updated)

```python
from sqlalchemy import DateTime
from sqlalchemy.sql import func

class Post(Base):
    __tablename__ = "posts"
    id         = Column(Integer, primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

- `server_default=func.now()` — DB sets this when row is inserted
- `onupdate=func.now()` — DB sets this whenever row is updated

---

## Create Tables in `main.py`

```python
from fastapi import FastAPI
from database import engine, Base
import models  # This registers models with Base!

app = FastAPI()

Base.metadata.create_all(bind=engine)  # Create all tables
```

---

## File Connections

```
database.py
    └── exports: Base

models.py
    ├── imports: Base from database.py
    ├── defines: class User(Base)
    └── defines: class Post(Base)

main.py
    ├── imports: engine, Base from database.py
    ├── imports: models (triggers class registration)
    └── calls: Base.metadata.create_all(bind=engine)
```

---

## Verify Tables Are Created

```bash
# Run the app once
uvicorn main:app --reload

# Check the SQLite file
ls *.db      → app.db created!

# Or view in VS Code: install "SQLite Viewer" extension
```

---

## Full `models.py`

```python
from sqlalchemy import (
    Column, Integer, String, Text,
    Boolean, ForeignKey, DateTime
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"
    id        = Column(Integer, primary_key=True, index=True)
    name      = Column(String, nullable=False)
    email     = Column(String, unique=True, nullable=False, index=True)
    password  = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="owner")


class Post(Base):
    __tablename__ = "posts"
    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String, nullable=False)
    content    = Column(Text)
    published  = Column(Boolean, default=True)
    owner_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="posts")
```

---

## Key Points
- Each class inherits `Base` and has `__tablename__`
- `primary_key=True` → auto-incrementing integer ID
- `ForeignKey("users.id")` → references another table
- `relationship()` → lazy-loads related records (ORM-level, not SQL-level)
- Run `Base.metadata.create_all()` to create tables on startup
- Models must be imported BEFORE `create_all()` is called

---
**Next → Module 17: Schemas**
