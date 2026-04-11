# Module 19 — Relationships Between Tables

## What this does
Links tables together using foreign keys and SQLAlchemy relationships. Load related data (e.g., a post with its author) without writing complex SQL.

---

## Required Imports

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
```

| Import | Why |
|---|---|
| `ForeignKey` | Links a column to another table's primary key |
| `relationship` | ORM shortcut to access related records |

---

## Types of Relationships

| Type | Example |
|---|---|
| One-to-Many | One user → many posts |
| Many-to-One | Many posts → one user |
| Many-to-Many | Posts ↔ Tags (needs junction table) |
| One-to-One | User ↔ Profile |

---

## One-to-Many: User → Posts

```python
# models.py

class User(Base):
    __tablename__ = "users"
    id    = Column(Integer, primary_key=True)
    name  = Column(String)
    email = Column(String, unique=True)

    # One user has MANY posts
    posts = relationship("Post", back_populates="owner")


class Post(Base):
    __tablename__ = "posts"
    id       = Column(Integer, primary_key=True)
    title    = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Many posts belong to ONE user
    owner = relationship("User", back_populates="posts")
```

---

## How `relationship` Works

```python
user = db.query(models.User).filter(models.User.id == 1).first()
user.posts          # → list of Post objects (SQL SELECT auto-ran!)

post = db.query(models.Post).filter(models.Post.id == 1).first()
post.owner          # → User object
post.owner.name     # → "Alice"
```

---

## Many-to-Many: Posts ↔ Tags

Needs a junction (association) table:

```python
class PostTag(Base):                         # Junction table
    __tablename__ = "post_tags"
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)
    tag_id  = Column(Integer, ForeignKey("tags.id"),  primary_key=True)


class Tag(Base):
    __tablename__ = "tags"
    id   = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    posts = relationship("Post", secondary="post_tags", back_populates="tags")


class Post(Base):
    __tablename__ = "posts"
    id    = Column(Integer, primary_key=True)
    title = Column(String)
    tags  = relationship("Tag", secondary="post_tags", back_populates="posts")
```

---

## Nested Schemas — Include Related Data in Response

```python
# schemas.py

class UserBasic(BaseModel):       # Minimal user info (avoids circular ref)
    id: int
    name: str
    email: str
    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    id: int
    title: str
    published: bool
    owner: UserBasic              # ← nested user object in post response!

    class Config:
        from_attributes = True
```

**Response will look like:**
```json
{
    "id": 1,
    "title": "Hello World",
    "published": true,
    "owner": {
        "id": 2,
        "name": "Alice",
        "email": "alice@mail.com"
    }
}
```

---

## Eager Loading — Avoid N+1 Problem

By default, relationships are **lazy loaded** (separate SQL query per access).  
Use `joinedload` to load in one query:

```python
from sqlalchemy.orm import joinedload

# Lazy (N+1 problem — bad for lists)
posts = db.query(models.Post).all()
# For each post, accessing post.owner runs a new query!

# Eager loading (1 query with JOIN — good)
posts = (
    db.query(models.Post)
    .options(joinedload(models.Post.owner))
    .all()
)
```

---

## Loading Posts for a Specific User

```python
@app.get("/users/{user_id}/posts", response_model=List[schemas.PostResponse])
def get_user_posts(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.posts   # SQLAlchemy auto-fetches related posts
```

---

## Cascade Delete — Delete Posts When User Deleted

```python
class User(Base):
    __tablename__ = "users"
    ...
    posts = relationship(
        "Post",
        back_populates="owner",
        cascade="all, delete-orphan"   # deletes posts when user deleted
    )
```

---

## Key Points
- `ForeignKey("users.id")` in the "many" table — links to parent
- `relationship("Model", back_populates="field")` — on both sides
- Access related data via attribute: `user.posts`, `post.owner`
- Use nested Pydantic schemas to include related data in response
- Use `joinedload()` to avoid N+1 query problem
- Use `cascade="all, delete-orphan"` to auto-delete children

---
**Next → Module 20: Migrations with Alembic**
