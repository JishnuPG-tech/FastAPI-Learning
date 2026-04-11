# Module 02 — Your First API

## What this does
Creates the simplest working FastAPI application. You will understand how routes work, what decorators do, and how to run the server.

---

## Required Imports

```python
from fastapi import FastAPI
```

| Import | Why |
|---|---|
| `FastAPI` | The main class — creates your app instance |

---

## Functions & Decorators Used

| Name | What it does |
|---|---|
| `FastAPI()` | Creates the application instance |
| `@app.get("/")` | Registers a GET route at path `/` |
| `async def` | Defines an async function (FastAPI supports both async and normal def) |

---

## Code — `main.py`

```python
from fastapi import FastAPI

app = FastAPI()                     # Create the app

@app.get("/")                       # Register GET route at "/"
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/about")                  # Another route
def about():
    return {"info": "This is my first FastAPI app"}
```

---

## Understanding the Anatomy

```
@app.get("/")        ← decorator: HTTP method + path
def read_root():     ← your function (route handler)
    return {...}     ← return dict → auto-converted to JSON
```

### HTTP Method Decorators
```python
@app.get("/")        # GET  — read data
@app.post("/")       # POST — create data
@app.put("/")        # PUT  — update data (full replace)
@app.patch("/")      # PATCH — update data (partial)
@app.delete("/")     # DELETE — remove data
```

---

## Run It
```bash
uvicorn main:app --reload
```

### Test It
```bash
# Browser or Postman
GET http://localhost:8000/
# Response: {"message": "Hello, FastAPI!"}

GET http://localhost:8000/about
# Response: {"info": "This is my first FastAPI app"}
```

---

## OpenAPI Docs (auto-generated)
Visit `http://localhost:8000/docs`  
You'll see both routes listed — **for free**, no setup needed.

---

## File Structure
```
my_fastapi_project/
├── venv/
└── main.py          ← everything is here (for now)
```

---

## Key Points
- `app = FastAPI()` — one instance, used everywhere
- Return a Python dict → FastAPI auto-converts it to JSON
- Use `async def` for performance (especially with DB/HTTP calls)
- Use regular `def` when no async work is done

---
**Next → Module 03: Path Parameters**
