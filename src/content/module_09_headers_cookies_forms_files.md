# Module 09 — Headers, Cookies, Forms & File Uploads

## What this does
Reads data from different parts of the HTTP request: headers, cookies, HTML form fields, and uploaded files.

---

## Required Imports

```python
from fastapi import FastAPI, Header, Cookie, Form, File, UploadFile
from typing import Optional, List
```

| Import | Why |
|---|---|
| `Header` | Read HTTP request headers |
| `Cookie` | Read HTTP cookies |
| `Form` | Read HTML form fields (not JSON) |
| `File` | Read uploaded file as bytes |
| `UploadFile` | Read uploaded file with metadata |

---

## Headers

```python
from fastapi import Header

@app.get("/items")
def get_items(user_agent: Optional[str] = Header(default=None)):
    return {"User-Agent": user_agent}
```

**Note:** FastAPI auto-converts `user_agent` → `User-Agent` (underscore to hyphen).

### Custom Header
```python
@app.get("/protected")
def protected_route(x_api_key: str = Header()):   # X-Api-Key header required
    if x_api_key != "secret123":
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return {"message": "Access granted"}
```

**Request:**
```
GET /protected
X-Api-Key: secret123
```

---

## Cookies

```python
from fastapi import Cookie

@app.get("/read-cookie")
def read_cookie(session_id: Optional[str] = Cookie(default=None)):
    return {"session_id": session_id}
```

**Note:** Requires a cookie named `session_id` to be set by the browser.

---

## Forms

> ⚠️ Forms send data as `application/x-www-form-urlencoded` — NOT JSON.  
> You need `pip install python-multipart` (already included in `fastapi[all]`)

```python
from fastapi import Form

@app.post("/login")
def login(
    username: str = Form(),   # from form field
    password: str = Form()    # from form field
):
    return {"logged_in_as": username}
```

**HTML Form:**
```html
<form action="/login" method="POST">
    <input name="username" />
    <input name="password" type="password" />
    <button type="submit">Login</button>
</form>
```

**Postman:** Use `Body → form-data` tab.

---

## File Uploads

### Using `bytes` — Small Files
```python
from fastapi import File

@app.post("/upload")
def upload_file(file: bytes = File()):
    return {"file_size": len(file)}
```

### Using `UploadFile` — Recommended
```python
from fastapi import UploadFile

@app.post("/upload")
async def upload_file(file: UploadFile):
    contents = await file.read()   # async read
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }
```

`UploadFile` is better because:
- Has `.filename` and `.content_type`
- Works with large files (uses temp storage)
- Supports `async` read

---

### Multiple File Uploads
```python
from typing import List

@app.post("/upload-multiple")
async def upload_multiple(files: List[UploadFile]):
    return [
        {"filename": f.filename, "type": f.content_type}
        for f in files
    ]
```

---

### Save Uploaded File to Disk

```python
import shutil

@app.post("/upload")
async def upload_file(file: UploadFile):
    with open(f"uploads/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"saved": file.filename}
```

---

### Form + File Together

```python
@app.post("/create-profile")
async def create_profile(
    name: str = Form(),
    email: str = Form(),
    avatar: UploadFile = File(default=None)
):
    return {
        "name": name,
        "email": email,
        "avatar": avatar.filename if avatar else None
    }
```

---

## Key Points
- `Header()` — reads HTTP headers (auto `_` → `-` conversion)
- `Cookie()` — reads cookies from the request
- `Form()` — reads HTML form data (NOT JSON)
- `File()` — uploads as raw bytes (small files)
- `UploadFile` — uploads as file object (preferred, large files ok)
- You can mix `Form` + `File` in one endpoint
- Cannot mix `Form` + JSON `Body` in the same endpoint

---
**Next → Module 10: Dependency Injection**
