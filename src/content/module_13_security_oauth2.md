# Module 13 — Security & OAuth2

## What this does
Protects routes so only logged-in users can access them. Uses OAuth2 Password Flow — user sends username + password → gets a token → uses token to access protected routes.

---

## Required Imports

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
```

| Import | Why |
|---|---|
| `OAuth2PasswordBearer` | Reads `Bearer` token from `Authorization` header |
| `OAuth2PasswordRequestForm` | Parses `username` + `password` from form data |

---

## How OAuth2 Password Flow Works

```
1. User sends POST /token with username + password
2. Server verifies, returns: {"access_token": "abc123", "token_type": "bearer"}
3. User sends requests with header: Authorization: Bearer abc123
4. Server reads token → identifies user → allows or denies
```

---

## Step 1 — Define Token URL

```python
from fastapi.security import OAuth2PasswordBearer

# tokenUrl = the login endpoint that issues tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
```

---

## Step 2 — Login Endpoint

```python
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

# Fake user database
fake_users = {
    "alice": {"username": "alice", "password": "secret123"},
    "bob":   {"username": "bob",   "password": "password456"},
}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users.get(form_data.username)

    if not user or user["password"] != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Return a token (just the username for now — real JWT in Module 14)
    return {"access_token": form_data.username, "token_type": "bearer"}
```

---

## Step 3 — Get Current User from Token

```python
def get_current_user(token: str = Depends(oauth2_scheme)):
    user = fake_users.get(token)   # decode token → get user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user
```

---

## Step 4 — Protect Routes

```python
@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user["username"]}

@app.get("/dashboard")
def dashboard(current_user: dict = Depends(get_current_user)):
    return {"dashboard": f"Welcome, {current_user['username']}!"}
```

---

## Full Working Example (No Real JWT Yet)

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

fake_users = {
    "alice": {"username": "alice", "email": "alice@mail.com", "password": "secret"},
}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(status_code=401, detail="Bad credentials")
    return {"access_token": form_data.username, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = fake_users.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@app.get("/me")
def read_me(user: dict = Depends(get_current_user)):
    return user
```

**Test Flow:**
```
1. POST /token  body: username=alice&password=secret (form-data)
   → {"access_token": "alice", "token_type": "bearer"}

2. GET /me  header: Authorization: Bearer alice
   → {"username": "alice", "email": "alice@mail.com", ...}

3. GET /me  header: Authorization: Bearer wrongtoken
   → 401 Not authenticated
```

---

## How Swagger UI Handles This

Open `/docs` → click "Authorize" button → enter username + password.  
Swagger will automatically include the token in all future requests!

---

## Key Points
- `OAuth2PasswordBearer(tokenUrl="token")` — tells Swagger where login is
- `OAuth2PasswordRequestForm` — automatically reads form fields `username` + `password`
- `Depends(get_current_user)` — protects any route
- Token sent as: `Authorization: Bearer <token>`
- Real apps use JWT tokens (see Module 14)

---
**Next → Module 14: JWT Authentication**
