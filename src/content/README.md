# 🚀 FastAPI Crash Course — Complete Index

> **Based on:** Official FastAPI Documentation + Bitfumes YouTube Course
> **Approach:** Practical, hands-on, step-by-step

---

## 📚 All Modules

| # | Module | Topics Covered |
|---|---|---|
| 01 | [Installation & Setup](module_01_installation.md) | venv, pip, uvicorn, /docs |
| 02 | [First API](module_02_first_api.md) | FastAPI(), decorators, JSON response |
| 03 | [Path Parameters](module_03_path_params.md) | `{id}`, type hints, Enum |
| 04 | [Query Parameters](module_04_query_params.md) | `?skip=0`, optional, bool |
| 05 | [Request Body](module_05_request_body.md) | Pydantic BaseModel, nested models |
| 06 | [Validation](module_06_validation.md) | Query(), Path(), Field(), EmailStr |
| 07 | [Response Models & Status Codes](module_07_response_models.md) | response_model, HTTP 201/204 |
| 08 | [Error Handling](module_08_error_handling.md) | HTTPException, custom handlers |
| 09 | [Headers, Cookies, Forms, Files](module_09_headers_cookies_forms_files.md) | Header(), Cookie(), Form(), UploadFile |
| 10 | [Dependency Injection](module_10_dependency_injection.md) | Depends(), yield, sub-deps |
| 11 | [Background Tasks & Middleware](module_11_background_middleware.md) | BackgroundTasks, BaseHTTPMiddleware |
| 12 | [CORS](module_12_cors.md) | CORSMiddleware, allow_origins |
| 13 | [Security & OAuth2](module_13_security_oauth2.md) | OAuth2PasswordBearer, login flow |
| 14 | [JWT Authentication](module_14_jwt_auth.md) | python-jose, bcrypt, protected routes |
| 15 | [Database Connection](module_15_database.md) | SQLAlchemy, engine, get_db() |
| 16 | [Models & Tables](module_16_models.md) | Column, ForeignKey, relationships |
| 17 | [Schemas](module_17_schemas.md) | Pydantic schemas, from_attributes |
| 18 | [CRUD Operations](module_18_crud.md) | db.add, commit, query, filter |
| 19 | [Relationships](module_19_relationships.md) | One-to-many, many-to-many, eager load |
| 20 | [Migrations with Alembic](module_20_migrations.md) | alembic init, upgrade, downgrade |
| 21 | [Project Structure & Routers](module_21_project_structure.md) | APIRouter, prefix, tags, include_router |
| 22 | [Final Full Project](module_22_final_project.md) | Full Blog API — auth + CRUD + DB |

---

## ⚡ Quick Start Path

```
1.  Install       → Module 01
2.  First API     → Module 02
3.  Params        → Module 03, 04
4.  Body & Valid  → Module 05, 06
5.  Response/Err  → Module 07, 08
6.  DB Setup      → Module 15, 16, 17
7.  CRUD          → Module 18, 19
8.  Auth          → Module 13, 14
9.  Structure     → Module 21
10. Full Project  → Module 22
```

---

## 🛠️ Tech Stack

| Tool | Version | Use |
|---|---|---|
| FastAPI | latest | Web framework |
| Uvicorn | latest | ASGI server |
| Pydantic | v2 | Data validation |
| SQLAlchemy | 2.x | ORM |
| Alembic | latest | DB migrations |
| python-jose | latest | JWT tokens |
| passlib + bcrypt | latest | Password hashing |
| python-dotenv | latest | Env variables |

```bash
# Install everything
pip install "fastapi[all]" sqlalchemy alembic \
            "python-jose[cryptography]" "passlib[bcrypt]" \
            python-dotenv
```

---

## 📋 Format Used in Every Module

1. **Title** — what the module covers
2. **What this does** — plain English summary
3. **Required imports** — every import explained
4. **Functions/Classes used** — what each one does
5. **Code** — clean, working examples
6. **File structure** — how files connect
7. **Key Points** — quick recap bullets
