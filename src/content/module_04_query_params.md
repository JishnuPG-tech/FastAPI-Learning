# Module 04 — Query Parameters

## What this does
Reads parameters from the URL query string: `?skip=0&limit=10`. These are optional or required filters, not part of the path.

---

## Required Imports

```python
from fastapi import FastAPI
from typing import Optional
```

| Import | Why |
|---|---|
| `FastAPI` | App instance |
| `Optional` | Marks a parameter as optional (can be `None`) |

---

## How Query Params Work

Any function parameter **not in the path** becomes a **query parameter** automatically.

```
URL: /items?skip=0&limit=10
          ↑ query string starts here
```

---

## Code

### Basic Query Parameters
```python
from fastapi import FastAPI

app = FastAPI()

fake_items = ["apple", "banana", "cherry", "date", "elderberry"]

@app.get("/items")
def get_items(skip: int = 0, limit: int = 10):
    return fake_items[skip : skip + limit]
```

**Tests:**
```
GET /items             → all items (skip=0, limit=10 defaults)
GET /items?skip=2      → ["cherry", "date", "elderberry"]
GET /items?limit=2     → ["apple", "banana"]
GET /items?skip=1&limit=2 → ["banana", "cherry"]
```

---

### Optional Query Parameters
```python
from typing import Optional

@app.get("/items/{item_id}")
def get_item(item_id: int, q: Optional[str] = None):
    if q:
        return {"item_id": item_id, "query": q}
    return {"item_id": item_id}
```

**Tests:**
```
GET /items/5          → {"item_id": 5}
GET /items/5?q=hello  → {"item_id": 5, "query": "hello"}
```

---

### Required Query Parameters
```python
@app.get("/search")
def search(keyword: str):          # No default = REQUIRED
    return {"searching for": keyword}
```

**Tests:**
```
GET /search             → 422 Error: keyword is required
GET /search?keyword=cat → {"searching for": "cat"}
```

---

### Boolean Query Parameter
```python
@app.get("/items/{item_id}")
def get_item(item_id: int, published: bool = True):
    return {"item_id": item_id, "published": published}
```

FastAPI auto-converts these to `True`:
- `?published=true`
- `?published=1`
- `?published=yes`
- `?published=on`

And these to `False`:
- `?published=false`
- `?published=0`
- `?published=no`
- `?published=off`

---

### Path + Query Together
```python
@app.get("/users/{user_id}/items")
def get_user_items(
    user_id: int,
    skip: int = 0,
    limit: int = 5,
    active: Optional[bool] = None
):
    return {
        "user_id": user_id,
        "skip": skip,
        "limit": limit,
        "active": active
    }
```

**Test:**
```
GET /users/1/items?skip=0&limit=3&active=true
→ {"user_id": 1, "skip": 0, "limit": 3, "active": true}
```

---

## Query vs Path — Quick Comparison

| | Path Param | Query Param |
|---|---|---|
| URL position | `/items/{id}` | `/items?id=1` |
| Required? | Always | Optional or required |
| Good for | Resource IDs | Filters, pagination |

---

## Key Points
- Parameters **NOT in the path** → automatically become query params
- Add `= None` to make a query param optional
- No default value = required query param
- Booleans are smart-converted from strings
- Combine path + query params freely

---
**Next → Module 05: Request Body with Pydantic**
