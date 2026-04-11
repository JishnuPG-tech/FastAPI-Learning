# Module 22 — Final Full Project: Blog API

## What this does
Combines EVERYTHING from all modules into one complete, working project: User auth with JWT, full CRUD blog posts, PostgreSQL/SQLite database, proper folder structure, and role-based access.

---

## Project: Blog API

**Features:**
- Register & Login (JWT)
- Create, Read, Update, Delete blog posts
- Only post owners can edit/delete their posts
- Pagination & search
- Full Swagger docs

---

## Final Folder Structure

```
blog_api/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── crud.py
├── .env
├── requirements.txt
│
├── auth/
│   ├── __init__.py
│   ├── hashing.py
│   ├── token.py
│   └── oauth2.py
│
└── routers/
    ├── __init__.py
    ├── auth.py
    ├── users.py
    └── posts.py
```

---

## `requirements.txt`

```
fastapi[all]
sqlalchemy
python-jose[cryptography]
passlib[bcrypt]
python-dotenv
```

```bash
pip install -r requirements.txt
```

---

## `.env`

```env
DATABASE_URL=sqlite:///./blog.db
SECRET_KEY=your-very-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## `database.py`

```python
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blog.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## `models.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, unique=True, nullable=False, index=True)
    password   = Column(String, nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    posts      = relationship("Post", back_populates="owner", cascade="all, delete-orphan")

class Post(Base):
    __tablename__ = "posts"
    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String, nullable=False)
    content    = Column(Text)
    published  = Column(Boolean, default=True)
    owner_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner      = relationship("User", back_populates="posts")
```

---

## `schemas.py`

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
    owner: UserResponse
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
```

---

## `auth/hashing.py`

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

---

## `auth/token.py`

```python
import os
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
```

---

## `auth/oauth2.py`

```python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from auth.token import verify_token
import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    email = verify_token(token)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

---

## `crud.py`

```python
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from auth.hashing import hash_password
import models, schemas

def create_user(db: Session, user: schemas.UserCreate):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(name=user.name, email=user.email, password=hash_password(user.password))
    db.add(new_user); db.commit(); db.refresh(new_user)
    return new_user

def get_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return user

def get_posts(db: Session, skip=0, limit=10, search=""):
    return db.query(models.Post).filter(models.Post.title.contains(search)).offset(skip).limit(limit).all()

def create_post(db: Session, post: schemas.PostCreate, owner_id: int):
    new_post = models.Post(**post.dict(), owner_id=owner_id)
    db.add(new_post); db.commit(); db.refresh(new_post)
    return new_post

def get_post(db: Session, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post: raise HTTPException(status_code=404, detail="Post not found")
    return post

def update_post(db: Session, post_id: int, data: schemas.PostUpdate, owner_id: int):
    post = get_post(db, post_id)
    if post.owner_id != owner_id: raise HTTPException(status_code=403, detail="Not your post")
    for k, v in data.dict(exclude_unset=True).items(): setattr(post, k, v)
    db.commit(); db.refresh(post)
    return post

def delete_post(db: Session, post_id: int, owner_id: int):
    post = get_post(db, post_id)
    if post.owner_id != owner_id: raise HTTPException(status_code=403, detail="Not your post")
    db.delete(post); db.commit()
```

---

## `routers/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from auth import hashing, token
import models, schemas

router = APIRouter(tags=["Auth"])

@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    import crud
    return crud.create_user(db, user)

@router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not hashing.verify_password(form.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials",
                            headers={"WWW-Authenticate": "Bearer"})
    return {"access_token": token.create_access_token({"sub": user.email}), "token_type": "bearer"}
```

---

## `routers/users.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas, crud

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db, user_id)
```

---

## `routers/posts.py`

```python
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth.oauth2 import get_current_user
import schemas, crud, models

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(skip: int = 0, limit: int = 10, search: str = "", db: Session = Depends(get_db)):
    return crud.get_posts(db, skip, limit, search)

@router.post("/", response_model=schemas.PostResponse, status_code=201)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    return crud.create_post(db, post, user.id)

@router.get("/{post_id}", response_model=schemas.PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    return crud.get_post(db, post_id)

@router.patch("/{post_id}", response_model=schemas.PostResponse)
def update_post(
    post_id: int,
    data: schemas.PostUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    return crud.update_post(db, post_id, data, user.id)

@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    crud.delete_post(db, post_id, user.id)
```

---

## `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, users, posts
import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blog API", version="1.0.0", description="Full blog API with auth")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)

@app.get("/", tags=["Root"])
def root():
    return {"message": "Blog API is live! Visit /docs"}
```

---

## Run the Project

```bash
# Start server
uvicorn main:app --reload

# Swagger UI
http://localhost:8000/docs
```

---

## API Endpoints Summary

| Method | URL | Auth Required | Description |
|---|---|---|---|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Get JWT token |
| GET | `/users/{id}` | No | Get user info |
| GET | `/posts` | No | List posts (search/paginate) |
| POST | `/posts` | Yes | Create post |
| GET | `/posts/{id}` | No | Get one post |
| PATCH | `/posts/{id}` | Yes (owner) | Update post |
| DELETE | `/posts/{id}` | Yes (owner) | Delete post |

---

## Testing Flow in Swagger

```
1. POST /register → create account
2. POST /login    → copy access_token
3. Click "Authorize" → paste: Bearer <token>
4. POST /posts    → create a post (auth required)
5. GET  /posts    → see all posts
6. PATCH /posts/1 → update your post
7. DELETE /posts/1 → delete your post
```

---

## 🎉 You're Done!

You now know:
- ✅ FastAPI routing and parameters
- ✅ Pydantic validation and schemas
- ✅ SQLAlchemy ORM with relationships
- ✅ JWT authentication with bcrypt
- ✅ Dependency injection
- ✅ CORS, middleware, background tasks
- ✅ Clean project structure with routers
- ✅ Alembic migrations (for production)

**Next steps:**
- Add `pytest` tests using `TestClient`
- Deploy to Railway/Render/Heroku with Docker
- Add Redis for rate limiting or caching
- Add Celery for heavy background jobs
