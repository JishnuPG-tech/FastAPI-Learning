# Module 03 — Path Parameters

## What this does
Captures dynamic segments from the URL. For example: `/users/42` → captures `42` as a parameter.

---

## Required Imports

```python
from fastapi import FastAPI
from enum import Enum
```

| Import | Why |
|---|---|
| `FastAPI` | App instance |
| `Enum` | Restrict path param to fixed set of values |

---

## Functions & Concepts Used

| Name | What it does |
|---|---|
| `{item_id}` in path | Declares a path parameter |
| Type hint `int` | Automatically validates and converts the value |
| `Enum` class | Restricts allowed values for a parameter |

---

## Code

### Basic Path Parameter
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def get_item(item_id: int):          # int → auto-validated
    return {"item_id": item_id}
```

**Test:**
```
GET /items/5     → {"item_id": 5}
GET /items/abc   → 422 Validation Error (not an int)
```

---

### Multiple Path Parameters
```python
@app.get("/users/{user_id}/posts/{post_id}")
def get_user_post(user_id: int, post_id: int):
    return {"user_id": user_id, "post_id": post_id}
```

**Test:**
```
GET /users/1/posts/10 → {"user_id": 1, "post_id": 10}
```

---

### String Path Parameter
```python
@app.get("/greet/{name}")
def greet(name: str):
    return {"message": f"Hello, {name}!"}
```

---

### Enum — Restrict Allowed Values
```python
from enum import Enum

class ModelName(str, Enum):
    resnet  = "resnet"
    alexnet = "alexnet"
    lenet   = "lenet"

@app.get("/models/{model_name}")
def get_model(model_name: ModelName):
    return {"model": model_name, "value": model_name.value}
```

**Test:**
```
GET /models/resnet   → {"model": "resnet", "value": "resnet"}
GET /models/unknown  → 422 Validation Error
```

---

## ⚠️ Order Matters!
```python
# WRONG — /items/me would match {item_id} first
@app.get("/items/{item_id}")
def get_item(item_id: int): ...

@app.get("/items/me")       # Never reached!
def get_me(): ...


# CORRECT — fixed routes BEFORE dynamic ones
@app.get("/items/me")       # Matched first ✅
def get_me(): ...

@app.get("/items/{item_id}")
def get_item(item_id: int): ...
```

---

## Path Types Supported

| Type | Example | Validates |
|---|---|---|
| `int` | `/items/42` | Must be integer |
| `float` | `/items/3.14` | Must be float |
| `str` | `/items/abc` | Any string |
| `bool` | `/items/true` | true/false/1/0 |

---

## Key Points
- Use `{}` in the path to declare parameters
- Type hints do automatic validation — no manual checking
- Fixed routes must come BEFORE dynamic routes
- Use `Enum` to restrict path values to a valid set

---
**Next → Module 04: Query Parameters**
