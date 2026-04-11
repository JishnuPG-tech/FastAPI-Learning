# Module 07 — Response Models & Status Codes

## What this does
Controls exactly what data is returned to the client. Filters out sensitive fields (like passwords). Sets the correct HTTP status code for each operation.

---

## Required Imports

```python
from fastapi import FastAPI, status
from pydantic import BaseModel
from typing import Optional, List
```

| Import | Why |
|---|---|
| `status` | Provides HTTP status code constants |
| `List` | Return a list of items |

---

## Response Models

### The Problem Without Response Models
```python
class UserInDB(BaseModel):
    username: str
    email: str
    hashed_password: str   # ← We DON'T want this in response!

@app.get("/users/{id}")
def get_user(id: int):
    user = get_from_db(id)
    return user            # hashed_password gets exposed! 😱
```

### The Solution — `response_model`
```python
from pydantic import BaseModel
from typing import Optional

# Input model — what we store
class UserCreate(BaseModel):
    username: str
    email: str
    password: str          # plain password comes in

# Output model — what we return
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    # password is NOT here — never returned!

app = FastAPI()

@app.post("/users", response_model=UserResponse)   # ← controls output
def create_user(user: UserCreate):
    # ... save to DB, hash password ...
    return {"id": 1, "username": user.username, "email": user.email,
            "password": "hashed..."}  # password filtered out automatically!
```

---

### Return a List
```python
@app.get("/users", response_model=List[UserResponse])
def get_all_users():
    return [
        {"id": 1, "username": "alice", "email": "alice@mail.com"},
        {"id": 2, "username": "bob",   "email": "bob@mail.com"},
    ]
```

---

## Status Codes

### Default Status Codes
```python
@app.get("/items")          # 200 OK (default)
@app.post("/items")         # 200 OK (default, but should be 201)
@app.delete("/items/{id}")  # 200 OK (default, but 204 is better)
```

### Setting Status Codes
```python
from fastapi import status

@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    return item

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(id: int):
    return None  # 204 means "no content"
```

### Common Status Codes

| Code | Constant | Meaning |
|---|---|---|
| 200 | `HTTP_200_OK` | Success, returns data |
| 201 | `HTTP_201_CREATED` | Resource created |
| 204 | `HTTP_204_NO_CONTENT` | Success, no data to return |
| 400 | `HTTP_400_BAD_REQUEST` | Client sent bad data |
| 401 | `HTTP_401_UNAUTHORIZED` | Not logged in |
| 403 | `HTTP_403_FORBIDDEN` | Logged in but no permission |
| 404 | `HTTP_404_NOT_FOUND` | Resource not found |
| 422 | `HTTP_422_UNPROCESSABLE_ENTITY` | Validation failed (auto) |
| 500 | `HTTP_500_INTERNAL_SERVER_ERROR` | Server crashed |

---

## response_model_exclude Options

```python
# Exclude specific fields from response
@app.get("/users/{id}", response_model=UserResponse,
         response_model_exclude={"email"})
def get_user(id: int):
    ...

# Only include specific fields
@app.get("/users/{id}", response_model=UserResponse,
         response_model_include={"username"})
def get_user_name(id: int):
    ...

# Include fields even if they are None
@app.get("/users/{id}", response_model=UserResponse,
         response_model_exclude_none=True)
def get_user(id: int):
    ...
```

---

## Full Example

```python
from fastapi import FastAPI, status
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class ItemCreate(BaseModel):
    name: str
    price: float
    secret_code: str       # won't show in response

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float

fake_db = []

@app.post("/items",
          response_model=ItemResponse,
          status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate):
    new_item = {"id": len(fake_db) + 1, **item.dict()}
    fake_db.append(new_item)
    return new_item         # secret_code filtered automatically

@app.get("/items",
         response_model=List[ItemResponse],
         status_code=status.HTTP_200_OK)
def get_items():
    return fake_db

@app.delete("/items/{id}",
            status_code=status.HTTP_204_NO_CONTENT)
def delete_item(id: int):
    fake_db[:] = [i for i in fake_db if i["id"] != id]
```

---

## Key Points
- `response_model` filters output — never expose passwords
- Use constants from `status` module for readability
- POST → 201, DELETE → 204, GET/PUT/PATCH → 200
- `response_model_exclude_none=True` removes null fields

---
**Next → Module 08: Error Handling**
