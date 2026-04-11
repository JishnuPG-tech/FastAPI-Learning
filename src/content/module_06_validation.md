# Module 06 — Validation & Data Types

## What this does
Adds strict validation rules to parameters and body fields — min/max length, value ranges, regex patterns, and special data types like Email, UUID, datetime.

---

## Required Imports

```python
from fastapi import FastAPI, Query, Path, Body
from pydantic import BaseModel, Field, EmailStr, HttpUrl
from typing import Optional
```

| Import | Why |
|---|---|
| `Query` | Adds validation to query parameters |
| `Path` | Adds validation to path parameters |
| `Body` | Adds validation to body fields inline |
| `Field` | Adds validation inside Pydantic models |
| `EmailStr` | Validates email format |
| `HttpUrl` | Validates URL format |

---

## Query Parameter Validation

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
def get_items(
    q: Optional[str] = Query(
        default=None,
        min_length=3,        # minimum 3 characters
        max_length=50,       # maximum 50 characters
        pattern="^[a-z]+$"  # only lowercase letters
    )
):
    return {"query": q}
```

**Tests:**
```
GET /items?q=ab       → 422 (too short)
GET /items?q=Hello    → 422 (has uppercase)
GET /items?q=hello    → {"query": "hello"} ✅
```

### Required Query Param with Validation
```python
@app.get("/search")
def search(q: str = Query(min_length=3)):   # required + validated
    return {"q": q}
```

---

## Path Parameter Validation

```python
from fastapi import Path

@app.get("/items/{item_id}")
def get_item(
    item_id: int = Path(
        gt=0,    # greater than 0
        le=1000  # less than or equal to 1000
    )
):
    return {"item_id": item_id}
```

**Tests:**
```
GET /items/0    → 422 (not > 0)
GET /items/5    → {"item_id": 5} ✅
GET /items/1001 → 422 (not ≤ 1000)
```

---

## Field Validation Inside Models

```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    price: float = Field(gt=0, description="Must be positive")
    quantity: int = Field(default=1, ge=1, le=100)
    # ge = greater than or equal
    # le = less than or equal
    # gt = greater than
    # lt = less than
```

---

## Special Data Types

```python
from pydantic import BaseModel, EmailStr, HttpUrl
from uuid import UUID
from datetime import datetime

class User(BaseModel):
    email: EmailStr                  # validates email format
    website: Optional[HttpUrl] = None  # validates URL

class Event(BaseModel):
    id: UUID                         # auto validates UUID format
    start_time: datetime             # parses ISO date strings
    end_time: datetime
```

**Request:**
```json
{
    "email": "user@example.com",
    "website": "https://mysite.com"
}
```

---

## Numeric Validation Summary

| Constraint | Meaning |
|---|---|
| `gt=5` | greater than 5 |
| `ge=5` | greater than or equal to 5 |
| `lt=5` | less than 5 |
| `le=5` | less than or equal to 5 |
| `multiple_of=5` | must be divisible by 5 |

## String Validation Summary

| Constraint | Meaning |
|---|---|
| `min_length=3` | at least 3 characters |
| `max_length=50` | at most 50 characters |
| `pattern="regex"` | must match regex |

---

## Full Example Combining All

```python
from fastapi import FastAPI, Query, Path
from pydantic import BaseModel, Field, EmailStr

app = FastAPI()

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    email: EmailStr
    age: int = Field(ge=13, le=120)

@app.post("/users")
def create_user(user: UserCreate):
    return {"created": user}

@app.get("/users/{user_id}")
def get_user(
    user_id: int = Path(gt=0),
    include_posts: bool = Query(default=False)
):
    return {"user_id": user_id, "include_posts": include_posts}
```

---

## Key Points
- `Query()` → validates query params
- `Path()` → validates path params
- `Field()` → validates model fields
- All invalid data → automatic 422 response with details
- `EmailStr` needs `pip install pydantic[email]`

---
**Next → Module 07: Response Models & Status Codes**
