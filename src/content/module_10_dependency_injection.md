# Module 10 — Dependency Injection

## What this does
Shares reusable logic across multiple routes — like DB sessions, authentication, pagination, and common parameters — without repeating code.

---

## Required Imports

```python
from fastapi import FastAPI, Depends, HTTPException
from typing import Optional
```

| Import | Why |
|---|---|
| `Depends` | Injects a dependency into a route |
| `HTTPException` | Raise errors inside dependencies |

---

## Basic Concept

A "dependency" is just a function that runs before your route. FastAPI calls it automatically and passes its return value.

```python
# Normal function = dependency
def get_current_user():
    return {"user_id": 1, "name": "Alice"}

@app.get("/me")
def my_profile(user = Depends(get_current_user)):
    return {"profile": user}
```

---

## Reusable Pagination

```python
from fastapi import FastAPI, Depends

app = FastAPI()

# Dependency function
def pagination(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items")
def get_items(page: dict = Depends(pagination)):
    return page

@app.get("/users")
def get_users(page: dict = Depends(pagination)):
    return page
```

Both routes now share the same pagination logic!

**Test:**
```
GET /items?skip=5&limit=3 → {"skip": 5, "limit": 3}
GET /users?skip=0&limit=5 → {"skip": 0, "limit": 5}
```

---

## Dependency with HTTPException

```python
API_KEYS = ["key-abc", "key-xyz"]

def verify_api_key(x_api_key: str = Header()):
    if x_api_key not in API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return x_api_key

@app.get("/data")
def get_data(api_key: str = Depends(verify_api_key)):
    return {"data": "secret stuff"}
```

---

## Class-Based Dependencies

```python
class Pagination:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

@app.get("/posts")
def get_posts(p: Pagination = Depends(Pagination)):
    return {"skip": p.skip, "limit": p.limit}
```

---

## Sub-dependencies

Dependencies can depend on other dependencies:

```python
def get_user_id(token: str = Header()):
    return 42  # decode token → return user_id

def get_current_user(user_id: int = Depends(get_user_id)):
    return {"id": user_id, "name": "Alice"}

@app.get("/profile")
def profile(user: dict = Depends(get_current_user)):
    return user
```

FastAPI calls:
1. `get_user_id()` first
2. Passes result to `get_current_user()`
3. Passes result to `profile()`

---

## Database Session Dependency (Preview)

```python
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()         # open session
    try:
        yield db                # give to route
    finally:
        db.close()              # always close after request

@app.get("/items")
def get_items(db: Session = Depends(get_db)):
    return db.query(Item).all()
```

- `yield` creates a generator dependency
- Code after `yield` runs after the request completes (cleanup)
- Session is always closed — no leaks

---

## Global Dependencies (Apply to All Routes)

```python
def verify_token(token: str = Header()):
    if token != "valid-token":
        raise HTTPException(status_code=401, detail="Invalid token")

app = FastAPI(dependencies=[Depends(verify_token)])  # applies to ALL routes
```

Or apply to a group:
```python
router = APIRouter(dependencies=[Depends(verify_token)])
```

---

## Key Points
- `Depends(fn)` — calls `fn` before your route
- Dependencies can have their own query/path/body params
- Dependencies can call other dependencies (sub-deps)
- Use `yield` in dependencies that need cleanup (DB sessions)
- Global deps apply to all routes automatically

---
**Next → Module 11: Background Tasks & Middleware**
