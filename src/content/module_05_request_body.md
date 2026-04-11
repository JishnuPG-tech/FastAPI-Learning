# Module 05 — Request Body with Pydantic

## What this does
Receives JSON data sent by the client (in POST/PUT requests). Pydantic validates the data automatically and converts it to a Python object.

---

## Required Imports

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
```

| Import | Why |
|---|---|
| `FastAPI` | App instance |
| `BaseModel` | Base class for request/response schemas |
| `Optional` | Mark fields as not required |

---

## Functions & Classes Used

| Name | What it does |
|---|---|
| `BaseModel` | Defines a data model with types and validation |
| `class Item(BaseModel)` | Schema for request body |
| `Optional[type]` | Field is not required (defaults to None) |

---

## Code

### Define a Model (Schema)
```python
from pydantic import BaseModel
from typing import Optional

class Item(BaseModel):
    name: str               # required
    price: float            # required
    description: Optional[str] = None  # optional
    on_sale: bool = False   # optional with default
```

---

### Use It in a Route
```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/items")
def create_item(item: Item):         # FastAPI reads body and validates
    return {"created": item}
```

**Request (JSON body):**
```json
{
    "name": "Laptop",
    "price": 999.99
}
```

**Response:**
```json
{
    "created": {
        "name": "Laptop",
        "price": 999.99,
        "description": null,
        "on_sale": false
    }
}
```

---

### Access Fields from the Body
```python
@app.post("/items")
def create_item(item: Item):
    total = item.price
    if item.on_sale:
        total = item.price * 0.9
    return {"name": item.name, "final_price": total}
```

---

### Body + Path + Query together
```python
@app.put("/items/{item_id}")
def update_item(
    item_id: int,          # path parameter
    q: Optional[str] = None,  # query parameter
    item: Optional[Item] = None  # body (optional)
):
    result = {"item_id": item_id}
    if q:
        result["query"] = q
    if item:
        result["item"] = item
    return result
```

FastAPI figures out automatically:
- In the path `{item_id}` → path param
- Not in path with simple type → query param
- Not in path with Pydantic model → request body

---

### Validation is Automatic
```json
// Missing required field "name":
{"price": 9.99}

// Response: 422 Unprocessable Entity
{
    "detail": [
        {
            "loc": ["body", "name"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

---

### Nested Models
```python
class Image(BaseModel):
    url: str
    name: str

class Product(BaseModel):
    name: str
    price: float
    image: Optional[Image] = None   # nested model
```

**Request:**
```json
{
    "name": "Phone",
    "price": 299.99,
    "image": {
        "url": "https://example.com/phone.jpg",
        "name": "phone_image"
    }
}
```

---

## Key Points
- Inherit from `BaseModel` to create a schema
- Required fields: no default value
- Optional fields: `Optional[type] = None` or `type = default_value`
- FastAPI auto-validates all incoming data
- Invalid data → 422 error with details (automatic)
- Access model fields with dot notation: `item.name`, `item.price`

---
**Next → Module 06: Validation & Data Types**
