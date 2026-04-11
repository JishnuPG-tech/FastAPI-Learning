# Module 17 — Schemas (Pydantic Models for API)

## What this does
Schemas are Pydantic models used to validate API input and shape API output. They are separate from SQLAlchemy models. This separation keeps your API clean and secure.

---

## Required Imports

```python
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
```

| Import | Why |
|---|---|
| `BaseModel` | Base class for all schemas |
| `EmailStr` | Validates email format |
| `Optional` | Optional fields |
| `datetime` | For timestamp fields |

---

## Why Separate Schemas From Models?

```
SQLAlchemy Model (models.py)
    → Talks to the DATABASE
    → Has all columns including sensitive ones (password)
    → Knows about relationships (lazy loading)

Pydantic Schema (schemas.py)
    → Talks to the API client
    → Only exposes what you want
    → Validates incoming data
    → Shapes outgoing data
```

---

## Pattern: Create / Response Schemas

Always make at least 2 schemas per entity:
1. **Create schema** — what client sends IN
2. **Response schema** — what server sends OUT

```python
# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ─── USER SCHEMAS ───────────────────────────────────────────────

class UserCreate(BaseModel):        # Client sends this
    name: str
    email: EmailStr
    password: str                   # plain password → we hash it

class UserResponse(BaseModel):      # Server sends this
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime
    # password is NOT here — never returned!

    class Config:
        from_attributes = True      # allows reading from SQLAlchemy model
        # In older Pydantic v1: orm_mode = True

# ─── POST SCHEMAS ───────────────────────────────────────────────

class PostCreate(BaseModel):        # Client sends this
    title: str
    content: Optional[str] = None
    published: bool = True

class PostUpdate(BaseModel):        # PATCH — all fields optional
    title: Optional[str] = None
    content: Optional[str] = None
    published: Optional[bool] = None

class PostResponse(BaseModel):      # Server sends this
    id: int
    title: str
    content: Optional[str]
    published: bool
    owner_id: int
    created_at: datetime
    owner: UserResponse             # nested — includes owner info

    class Config:
        from_attributes = True
```

---

## `from_attributes = True` — Why It's Important

```python
# Without it: works with dicts only
# With it: works with SQLAlchemy objects too

class UserResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True      # ← Read from ORM model attributes

# In route:
user = db.query(models.User).first()   # SQLAlchemy object
return UserResponse.from_orm(user)     # converts to schema ✅
# FastAPI also does this automatically when response_model is set
```

---

## Using Schemas in Routes

```python
from fastapi import FastAPI
from database import get_db
import schemas, models

app = FastAPI()

@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db=Depends(get_db)):
    # user is validated by UserCreate schema
    hashed_pw = hash_password(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user   # filtered by UserResponse schema → no password!

@app.get("/users", response_model=List[schemas.UserResponse])
def get_users(db=Depends(get_db)):
    return db.query(models.User).all()
```

---

## File Structure

```
my_fastapi_project/
├── main.py          ← imports and uses schemas
├── database.py      ← DB setup
├── models.py        ← SQLAlchemy table classes
└── schemas.py       ← Pydantic validation classes
```

---

## Full `schemas.py`

```python
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    content: Optional[str] = None
    published: bool = True


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    published: Optional[bool] = None


class PostResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    published: bool
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
```

---

## Key Points
- Schemas (`schemas.py`) ≠ Models (`models.py`) — they serve different purposes
- `UserCreate` → validates incoming data
- `UserResponse` → controls what goes out (no passwords!)
- `class Config: from_attributes = True` → lets Pydantic read ORM objects
- Use `Optional` for PATCH endpoints where all fields are optional
- Nest schemas to include related entity data in response

---
**Next → Module 18: CRUD Operations**
