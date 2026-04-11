# Module 21 — Project Structure & Routers

## What this does
Organizes a growing FastAPI project into a clean, modular structure using `APIRouter`. Each feature (users, posts, auth) gets its own file. `main.py` just ties everything together.

---

## Required Imports

```python
from fastapi import APIRouter
```

| Import | Why |
|---|---|
| `APIRouter` | Creates a mini-router for a specific feature |

---

## The Problem with One File

```python
# main.py gets huge and unmanageable:
@app.get("/users")
@app.post("/users")
@app.get("/users/{id}")
@app.put("/users/{id}")
@app.delete("/users/{id}")
@app.get("/posts")
@app.post("/posts")
...  # 50+ routes in one file 😱
```

---

## Solution — APIRouter

Each feature = its own router file:

```python
# routers/users.py
from fastapi import APIRouter

router = APIRouter(
    prefix="/users",       # all routes start with /users
    tags=["Users"],        # group in Swagger docs
)

@router.get("/")           # actual path: GET /users/
def get_users():
    return []

@router.get("/{user_id}") # actual path: GET /users/{user_id}
def get_user(user_id: int):
    return {"id": user_id}

@router.post("/")          # actual path: POST /users/
def create_user():
    return {}
```

---

## Including Routers in `main.py`

```python
# main.py
from fastapi import FastAPI
from routers import users, posts, auth

app = FastAPI()

app.include_router(users.router)
app.include_router(posts.router)
app.include_router(auth.router)
```

That's it — `main.py` stays clean!

---

## Recommended Project Structure (Production Ready)

```
my_fastapi_project/
│
├── main.py                    ← Entry point
├── database.py                ← DB engine, session, Base
├── models.py                  ← SQLAlchemy table classes
├── schemas.py                 ← Pydantic schemas
├── crud.py                    ← DB query functions
│
├── routers/
│   ├── __init__.py
│   ├── auth.py                ← POST /login, POST /register
│   ├── users.py               ← GET/POST/PUT/DELETE /users
│   └── posts.py               ← GET/POST/PUT/DELETE /posts
│
├── auth/
│   ├── __init__.py
│   ├── hashing.py             ← bcrypt password functions
│   ├── token.py               ← JWT create/verify
│   └── oauth2.py              ← get_current_user dependency
│
├── .env                       ← Environment variables
├── requirements.txt
└── alembic/                   ← DB migrations
```

---

## Router with Dependencies

Apply auth protection to an entire router:

```python
# routers/posts.py
from fastapi import APIRouter, Depends
from auth.oauth2 import get_current_user

router = APIRouter(
    prefix="/posts",
    tags=["Posts"],
    dependencies=[Depends(get_current_user)]  # ← ALL routes require auth
)

@router.get("/")
def get_posts():
    return []

@router.post("/")
def create_post():
    return {}
```

---

## Full Router Files

### `routers/auth.py`
```python
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
import schemas, crud
from auth import hashing, token

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, form.username)
    if not user or not hashing.verify(form.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = token.create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
```

### `routers/users.py`
```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import schemas, crud

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=schemas.UserResponse, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db, user_id)
```

### `routers/posts.py`
```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth.oauth2 import get_current_user
import schemas, crud, models

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(db: Session = Depends(get_db)):
    return crud.get_posts(db)

@router.post("/", response_model=schemas.PostResponse, status_code=201)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_post(db, post, current_user.id)

@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    crud.delete_post(db, post_id, current_user.id)
```

### `main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, users, posts
import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="My Blog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)

@app.get("/", tags=["Root"])
def root():
    return {"message": "Blog API is running"}
```

---

## Key Points
- `APIRouter(prefix="/users", tags=["Users"])` — creates a mini-app for one feature
- `app.include_router(router)` — plugs it into the main app
- `dependencies=[Depends(...)]` on router — applies to all routes in it
- `tags` groups routes in Swagger `/docs`
- Use `__init__.py` in folders to make them Python packages

---
**Next → Module 22: Final Full Project**
