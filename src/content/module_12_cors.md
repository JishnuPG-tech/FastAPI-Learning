# Module 12 — CORS

## What this does
Allows your frontend (running on a different domain/port) to call your FastAPI backend. Without CORS, browsers block those requests.

---

## Required Imports

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
```

| Import | Why |
|---|---|
| `CORSMiddleware` | Built-in middleware that handles CORS headers |

---

## Why CORS Matters

```
Frontend:  http://localhost:3000   (React app)
Backend:   http://localhost:8000   (FastAPI)

Without CORS → Browser blocks all API calls!
With CORS    → Browser allows them ✅
```

---

## Setup — Allow Specific Origins (Recommended)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",        # React dev server
    "http://localhost:5173",        # Vite dev server
    "https://myapp.com",            # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # which origins can call
    allow_credentials=True,          # allow cookies
    allow_methods=["*"],             # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],             # Authorization, Content-Type, etc.
)
```

---

## Setup — Allow All Origins (Dev Only)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],             # ⚠️ Allow EVERYONE — unsafe in production!
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Restrict Methods and Headers

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com"],
    allow_methods=["GET", "POST"],   # only allow GET and POST
    allow_headers=["Authorization", "Content-Type"],  # only specific headers
    allow_credentials=False,         # no cookies
    max_age=3600,                    # cache preflight for 1 hour
)
```

---

## CORS Options Explained

| Option | What it does |
|---|---|
| `allow_origins` | List of allowed frontend URLs |
| `allow_credentials` | Allow cookies/auth headers |
| `allow_methods` | Which HTTP methods are allowed |
| `allow_headers` | Which request headers are allowed |
| `expose_headers` | Which response headers the browser can read |
| `max_age` | How long to cache preflight response (seconds) |

---

## Full Working Example

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/data")
def get_data():
    return {"message": "This works from your frontend!"}
```

Now your React/Vue/Next.js app at `localhost:3000` can call this API.

---

## Key Points
- CORS is blocked by **browsers** only — Postman/curl never has this issue
- Add CORSMiddleware BEFORE adding routes
- Use specific `allow_origins` in production — never `"*"` with credentials
- `allow_credentials=True` required if you use cookies or `Authorization` header

---
**Next → Module 13: Security & OAuth2**
