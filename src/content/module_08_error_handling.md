# Module 08 — Error Handling

## What this does
Returns proper error responses when something goes wrong — item not found, unauthorized access, bad input, etc.

---

## Required Imports

```python
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
```

| Import | Why |
|---|---|
| `HTTPException` | Raise HTTP errors with status codes |
| `status` | Status code constants |
| `Request` | Used in custom exception handlers |
| `JSONResponse` | Custom JSON error response |
| `RequestValidationError` | Override default 422 error format |

---

## HTTPException — Basic Usage

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

fake_items = {1: "apple", 2: "banana", 3: "cherry"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in fake_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_id} not found"
        )
    return {"item": fake_items[item_id]}
```

**Tests:**
```
GET /items/1  → {"item": "apple"}
GET /items/99 → 404 {"detail": "Item with id 99 not found"}
```

---

## Common Error Patterns

```python
# 404 — Not Found
raise HTTPException(status_code=404, detail="User not found")

# 400 — Bad Request
raise HTTPException(status_code=400, detail="Email already registered")

# 401 — Unauthorized
raise HTTPException(status_code=401, detail="Not authenticated")

# 403 — Forbidden
raise HTTPException(status_code=403, detail="Not enough permissions")

# 409 — Conflict
raise HTTPException(status_code=409, detail="Username already taken")
```

---

## Custom Headers in Errors

```python
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"}   # adds headers to error response
)
```

---

## Custom Exception Handler

Override FastAPI's default error format globally:

```python
from fastapi import Request
from fastapi.responses import JSONResponse

# Define a custom exception
class ItemNotFoundException(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id

# Register the handler
@app.exception_handler(ItemNotFoundException)
async def item_not_found_handler(request: Request, exc: ItemNotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Item {exc.item_id} does not exist"},
    )

# Use it in a route
@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in fake_items:
        raise ItemNotFoundException(item_id=item_id)
    return fake_items[item_id]
```

---

## Override Default 422 Validation Error

```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation failed",
            "details": exc.errors()
        }
    )
```

---

## Full Example

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

users = {
    1: {"name": "Alice", "email": "alice@mail.com"},
    2: {"name": "Bob",   "email": "bob@mail.com"},
}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    return users[user_id]

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int):
    if user_id not in users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    del users[user_id]

@app.post("/users")
def create_user(name: str, email: str):
    # Check for duplicate email
    for u in users.values():
        if u["email"] == email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    new_id = max(users.keys()) + 1
    users[new_id] = {"name": name, "email": email}
    return users[new_id]
```

---

## Key Points
- `raise HTTPException(status_code=..., detail=...)` — the standard way
- Always use `raise`, not `return`
- Use `@app.exception_handler()` for global custom handling
- `detail` can be a string, dict, or list

---
**Next → Module 09: Headers, Cookies, Forms & File Uploads**
