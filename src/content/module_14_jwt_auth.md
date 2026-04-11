# Module 14 — JWT Authentication

## What this does
Issues real cryptographic JWT (JSON Web Tokens) on login. Tokens are signed, expire, and carry user data — no server-side session storage needed.

---

## Required Imports

```python
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
```

| Import | Why |
|---|---|
| `jose.jwt` | Create and verify JWT tokens |
| `JWTError` | Exception when token is invalid |
| `CryptContext` | Hash and verify passwords with bcrypt |
| `datetime`, `timedelta` | Set token expiry time |

---

## Install Dependencies

```bash
pip install "python-jose[cryptography]" passlib bcrypt
```

---

## Setup

```python
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

SECRET_KEY = "your-super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

---

## Password Hashing

```python
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**Example:**
```python
hashed = hash_password("secret123")
# → "$2b$12$..."   (bcrypt hash)

verify_password("secret123", hashed)   # → True
verify_password("wrong",     hashed)   # → False
```

---

## Create JWT Token

```python
def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token
```

**Example:**
```python
token = create_access_token({"sub": "alice@mail.com"})
# → "eyJhbGciOiJIUzI1NiIs..."
```

---

## Verify JWT Token

```python
def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

---

## Schemas

```python
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str
```

---

## Full Auth Flow

```python
from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Fake DB
fake_users_db = {
    "alice@mail.com": {
        "email": "alice@mail.com",
        "name": "Alice",
        "hashed_password": hash_password("secret123")
    }
}

# Login endpoint
@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

# Dependency — get current user from token
def get_current_user(token: str = Depends(oauth2_scheme)):
    email = verify_token(token)
    user = fake_users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Protected route
@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"email": user["email"], "name": user["name"]}
```

---

## Test Flow

```
1. POST /login
   Body (form-data): username=alice@mail.com  password=secret123
   → {"access_token": "eyJhbGci...", "token_type": "bearer"}

2. GET /me
   Header: Authorization: Bearer eyJhbGci...
   → {"email": "alice@mail.com", "name": "Alice"}

3. GET /me
   Header: Authorization: Bearer wrong-token
   → 401 Invalid or expired token
```

---

## File Structure for Auth (Recommended)

```
app/
├── main.py
├── auth/
│   ├── __init__.py
│   ├── hashing.py      ← hash_password, verify_password
│   ├── token.py        ← create_access_token, verify_token
│   └── oauth2.py       ← oauth2_scheme, get_current_user
└── routers/
    └── auth.py         ← login endpoint
```

---

## Key Points
- JWT = 3 parts: header.payload.signature — all base64 encoded
- `SECRET_KEY` must be secret and long — change default!
- Never store plain passwords — always hash with bcrypt
- `sub` field in JWT = subject (usually email or user_id)
- Token has expiry (`exp`) — verify handles expiry automatically
- `python-jose` encodes/decodes JWT
- `passlib` handles bcrypt hashing

---
**Next → Module 15: Database Connection with SQLAlchemy**
