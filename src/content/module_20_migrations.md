# Module 20 — Database Migrations with Alembic

## What this does
Manages database schema changes over time — add columns, rename tables, create indexes — without deleting your data. Alembic tracks every change as a versioned file.

---

## Required Imports (in Alembic config files)

```python
from alembic import op
import sqlalchemy as sa
```

| Import | Why |
|---|---|
| `op` | Alembic operations — add table, add column, etc. |
| `sa` | SQLAlchemy for column type definitions |

---

## Install Alembic

```bash
pip install alembic
```

---

## Step 1 — Initialize Alembic

```bash
alembic init alembic
```

Creates this structure:
```
my_fastapi_project/
├── alembic/
│   ├── env.py          ← Alembic config (edit this)
│   └── versions/       ← migration files go here
├── alembic.ini         ← DB URL config
└── ...
```

---

## Step 2 — Configure `alembic.ini`

Edit the DB URL:
```ini
# alembic.ini
sqlalchemy.url = sqlite:///./app.db

# For PostgreSQL:
# sqlalchemy.url = postgresql://user:password@localhost/dbname
```

---

## Step 3 — Configure `alembic/env.py`

Tell Alembic about your models so it can auto-detect changes:

```python
# alembic/env.py — find the `target_metadata` line and change it

from database import Base   # import your Base
import models               # import all your models!

# Change this line:
# target_metadata = None
target_metadata = Base.metadata   # ← point to your models
```

---

## Step 4 — Create a Migration

```bash
# Auto-detect changes from models
alembic revision --autogenerate -m "create users and posts tables"
```

This creates a file in `alembic/versions/` like:
```
alembic/versions/a1b2c3d4_create_users_and_posts_tables.py
```

---

## Migration File Structure

```python
# alembic/versions/a1b2c3d4_create_users_tables.py

from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4'
down_revision = None    # previous migration (None = first)
branch_labels = None

def upgrade():          # applied when running migration
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), unique=True, nullable=False),
    )

def downgrade():        # applied when rolling back
    op.drop_table('users')
```

---

## Step 5 — Run Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply specific version
alembic upgrade a1b2c3d4

# Rollback one step
alembic downgrade -1

# Rollback all
alembic downgrade base
```

---

## Adding a New Column (E.g., `bio` to Users)

1. Add to `models.py`:
```python
class User(Base):
    ...
    bio = Column(String, nullable=True)   # NEW column
```

2. Generate migration:
```bash
alembic revision --autogenerate -m "add bio to users"
```

3. Apply:
```bash
alembic upgrade head
```

No data lost! Only the new column is added.

---

## Common Alembic Commands

```bash
alembic init alembic                    # Initialize
alembic revision --autogenerate -m ""  # Auto-generate migration
alembic revision -m "custom name"      # Empty migration (write manually)
alembic upgrade head                   # Apply all migrations
alembic downgrade -1                   # Rollback last migration
alembic current                        # Show current version
alembic history                        # List all migrations
```

---

## Using Env Var for DB URL

```python
# alembic/env.py
import os
from dotenv import load_dotenv

load_dotenv()

config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))
```

---

## Updated File Structure

```
my_fastapi_project/
├── alembic/
│   ├── env.py               ← configured with Base.metadata
│   └── versions/
│       ├── a1b2c3_initial.py
│       └── b2c3d4_add_bio.py
├── alembic.ini              ← DB URL
├── main.py
├── database.py
├── models.py
└── schemas.py
```

---

## Key Points
- `alembic init` → creates config once
- Always edit `env.py` to point to `Base.metadata`
- `--autogenerate` detects model changes automatically
- `upgrade head` applies all pending migrations
- `downgrade -1` rolls back one migration
- Never use `Base.metadata.create_all()` in production — use Alembic instead
- Check generated migration files — autogenerate is not always perfect

---
**Next → Module 21: Project Structure & Routers**
