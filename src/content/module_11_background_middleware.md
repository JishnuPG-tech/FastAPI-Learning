# Module 11 — Background Tasks & Middleware

## What this does
**Background Tasks** run code AFTER returning the response — for emails, logging, etc.  
**Middleware** wraps every request/response — for timing, logging, modifying headers.

---

## Required Imports

```python
from fastapi import FastAPI, BackgroundTasks
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import time
```

| Import | Why |
|---|---|
| `BackgroundTasks` | Queue tasks that run after response is sent |
| `BaseHTTPMiddleware` | Base class for custom middleware |

---

## Background Tasks

### Basic Example
```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

def send_welcome_email(email: str):
    # Simulate sending email (slow task)
    print(f"Sending welcome email to {email}...")
    time.sleep(2)   # won't block the response!
    print(f"Email sent to {email}")

@app.post("/register")
def register_user(email: str, tasks: BackgroundTasks):
    # Add task — runs AFTER response is sent
    tasks.add_task(send_welcome_email, email)
    return {"message": "Registered! Welcome email on its way."}
```

**Flow:**
1. Client sends POST `/register`
2. FastAPI returns `{"message": ...}` immediately
3. Background task runs (send email)
4. Client already got the response — no waiting!

---

### Background Tasks with Arguments

```python
def write_log(message: str, level: str = "INFO"):
    with open("app.log", "a") as f:
        f.write(f"[{level}] {message}\n")

@app.post("/items")
def create_item(item: Item, tasks: BackgroundTasks):
    # ... save item ...
    tasks.add_task(write_log, f"Created item: {item.name}", "INFO")
    return {"created": item}
```

---

### Multiple Background Tasks

```python
@app.post("/purchase")
def purchase(user_id: int, item_id: int, tasks: BackgroundTasks):
    tasks.add_task(send_receipt_email, user_id)
    tasks.add_task(update_inventory, item_id)
    tasks.add_task(write_log, f"Purchase by user {user_id}")
    return {"status": "Purchase complete"}
```

---

## Middleware

Middleware runs for EVERY request before and/or after the route handler.

### Timing Middleware (Add Response Time Header)

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)     # run the route
        duration = time.time() - start
        response.headers["X-Process-Time"] = str(duration)
        return response

app.add_middleware(TimingMiddleware)
```

Every response now includes header: `X-Process-Time: 0.0023`

---

### Logging Middleware

```python
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print(f"→ {request.method} {request.url}")
        response = await call_next(request)
        print(f"← Status: {response.status_code}")
        return response

app.add_middleware(LoggingMiddleware)
```

---

### Built-in Middleware — GZip Compression

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

Compresses large responses automatically.

---

### Built-in Middleware — Trusted Hosts

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com", "localhost"]
)
```

Blocks requests from untrusted hostnames.

---

## Middleware vs Background Tasks — When to Use

| | Middleware | Background Tasks |
|---|---|---|
| Runs | Every request | After specific responses |
| Use for | Logging, auth, headers | Emails, notifications, cleanup |
| Blocks response? | No (wraps) | No (after) |
| Access to request | Yes | No (just function + args) |

---

## Full Example

```python
from fastapi import FastAPI, BackgroundTasks
from starlette.middleware.base import BaseHTTPMiddleware
import time

app = FastAPI()

# Middleware — runs on every request
class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        t = time.time()
        response = await call_next(request)
        response.headers["X-Time"] = f"{time.time()-t:.4f}s"
        return response

app.add_middleware(TimingMiddleware)

# Background task
def notify_admin(message: str):
    print(f"ADMIN NOTIFIED: {message}")

@app.post("/items")
def create_item(name: str, tasks: BackgroundTasks):
    tasks.add_task(notify_admin, f"New item created: {name}")
    return {"created": name}
```

---

## Key Points
- `tasks.add_task(fn, arg1, arg2)` — schedule background work
- Background tasks don't block the response
- Middleware wraps all requests — use `await call_next(request)` to run the route
- Add middleware with `app.add_middleware(ClassName)`
- Order of middleware matters — last added = first executed

---
**Next → Module 12: CORS**
