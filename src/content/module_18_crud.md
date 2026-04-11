# Module 18 — CRUD Operations

## What this does
Implements Create, Read, Update, Delete using SQLAlchemy ORM queries. These are the four basic operations any API performs on a database.

---

## Required Imports

```python
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas
```

---

## The 4 CRUD Operations

| Operation | HTTP Method | SQL |
|---|---|---|
| Create | POST | INSERT |
| Read (all) | GET | SELECT * |
| Read (one) | GET `/{id}` | SELECT WHERE id=? |
| Update | PUT / PATCH | UPDATE |
| Delete | DELETE `/{id}` | DELETE WHERE id=? |

---

## Create

```python
def create_post(db: Session, post: schemas.PostCreate, user_id: int):
    new_post = models.Post(
        title=post.title,
        content=post.content,
        published=post.published,
        owner_id=user_id
    )
    db.add(new_post)        # stage the insert
    db.commit()             # write to DB
    db.refresh(new_post)    # reload from DB (get auto-set fields like id, created_at)
    return new_post
```

---

## Read All (with optional filter)

```python
def get_posts(db: Session, skip: int = 0, limit: int = 10, search: str = ""):
    return (
        db.query(models.Post)
        .filter(models.Post.title.contains(search))
        .offset(skip)
        .limit(limit)
        .all()
    )
```

---

## Read One by ID

```python
def get_post(db: Session, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post {post_id} not found"
        )
    return post
```

---

## Update (Full Replace — PUT)

```python
def update_post(db: Session, post_id: int, post_data: schemas.PostCreate, user_id: int):
    post = get_post(db, post_id)   # raises 404 if not found

    if post.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not your post")

    post.title     = post_data.title
    post.content   = post_data.content
    post.published = post_data.published
    db.commit()
    db.refresh(post)
    return post
```

---

## Partial Update (PATCH)

```python
def patch_post(db: Session, post_id: int, post_data: schemas.PostUpdate, user_id: int):
    post = get_post(db, post_id)

    if post.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not your post")

    # Only update fields that were actually sent
    update_data = post_data.dict(exclude_unset=True)  # only non-None fields
    for key, value in update_data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return post
```

---

## Delete

```python
def delete_post(db: Session, post_id: int, user_id: int):
    post = get_post(db, post_id)

    if post.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not your post")

    db.delete(post)
    db.commit()
    return None                    # 204 No Content
```

---

## Routes Using CRUD Functions

```python
from fastapi import FastAPI, Depends, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, crud

app = FastAPI()

@app.post("/posts", response_model=schemas.PostResponse, status_code=201)
def create(post: schemas.PostCreate, db: Session = Depends(get_db)):
    return crud.create_post(db, post, user_id=1)   # hardcoded for now

@app.get("/posts", response_model=List[schemas.PostResponse])
def read_all(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_posts(db, skip, limit)

@app.get("/posts/{post_id}", response_model=schemas.PostResponse)
def read_one(post_id: int, db: Session = Depends(get_db)):
    return crud.get_post(db, post_id)

@app.put("/posts/{post_id}", response_model=schemas.PostResponse)
def update(post_id: int, post: schemas.PostCreate, db: Session = Depends(get_db)):
    return crud.update_post(db, post_id, post, user_id=1)

@app.delete("/posts/{post_id}", status_code=204)
def delete(post_id: int, db: Session = Depends(get_db)):
    crud.delete_post(db, post_id, user_id=1)
```

---

## Key SQLAlchemy Query Methods

| Method | What it does |
|---|---|
| `db.query(Model)` | Start a query on that table |
| `.filter(condition)` | WHERE clause |
| `.all()` | Returns list of all matching |
| `.first()` | Returns first match or None |
| `.offset(n)` | Skip n rows |
| `.limit(n)` | Return max n rows |
| `db.add(obj)` | Stage for insert |
| `db.commit()` | Save changes to DB |
| `db.refresh(obj)` | Reload from DB (get new id, etc.) |
| `db.delete(obj)` | Stage for deletion |

---

## File: `crud.py` (Recommended Pattern)

Separate DB logic from route logic:

```
my_fastapi_project/
├── main.py      ← routes only
├── crud.py      ← all DB query functions
├── models.py    ← table classes
├── schemas.py   ← Pydantic models
└── database.py  ← DB setup
```

---

## Key Points
- `db.add()` → `db.commit()` → `db.refresh()` for create
- Always call `db.refresh(obj)` after commit to get server-set fields
- Use `exclude_unset=True` in PATCH to only update sent fields
- Put DB logic in `crud.py`, route logic in route files
- Always check ownership before update/delete

---
**Next → Module 19: Relationships Between Tables**
