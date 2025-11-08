# TizKit API Quick Reference

Quick reference for all API endpoints with example requests and responses.

---

## 🔗 Base URL

```
http://localhost:8000
```

---

## 📝 Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepass123",
  "full_name": "John Doe"
}

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2025-11-08T10:30:00"
}
```

### Login
```http
POST /auth/login
Content-Type: multipart/form-data

username=johndoe
password=securepass123

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2025-11-08T10:30:00"
}
```

---

## 📊 Diagrams

### Generate Diagram LaTeX
```http
POST /diagram/generate
Content-Type: application/json

{
  "data": {
    "nodes": [
      {
        "id": "node1",
        "x": 0,
        "y": 0,
        "text": "Start",
        "type": "rectangle",
        "fillColor": "#ffffff",
        "strokeColor": "#000000",
        "textColor": "#000000",
        "strokeWidth": 2
      },
      {
        "id": "node2",
        "x": 5,
        "y": 0,
        "text": "End",
        "type": "circle",
        "fillColor": "#f0f0f0",
        "strokeColor": "#000000",
        "textColor": "#000000",
        "strokeWidth": 2
      }
    ],
    "connections": [
      {
        "from": "node1",
        "to": "node2",
        "type": "arrow",
        "color": "#000000",
        "strokeWidth": 2
      }
    ]
  }
}

Response: 200 OK
{
  "success": true,
  "latex_code": "\\begin{tikzpicture}\n  \\node[rectangle, draw, fill=white] at (0,0) {Start};\n  ...",
  "message": "Diagram LaTeX generated successfully"
}
```

### Preview Diagram
```http
POST /diagram/preview
Content-Type: application/json

{
  "data": {
    "nodes": [...],
    "connections": [...]
  }
}

Response: 200 OK
{
  "success": true,
  "latex_code": "\\begin{tikzpicture}...",
  "preview": "Diagram preview generated"
}
```

### Compile Diagram
```http
POST /diagram/compile
Content-Type: application/json

{
  "latex_code": "\\begin{tikzpicture}...",
  "output_format": "pdf"
}

Response: 200 OK
Content-Type: application/pdf
[Binary PDF Data]

For PNG:
{
  "output_format": "png"
}

Response: 200 OK
Content-Type: image/png
[Binary PNG Data]
```

---

## 📋 Tables

### Generate Table LaTeX
```http
POST /table/generate
Content-Type: application/json

{
  "data": {
    "cells": [
      [
        {
          "content": "Name",
          "backgroundColor": "#f0f0f0",
          "textColor": "#000000",
          "bold": true,
          "italic": false
        },
        {
          "content": "Age",
          "backgroundColor": "#f0f0f0",
          "textColor": "#000000",
          "bold": true,
          "italic": false
        }
      ],
      [
        {
          "content": "John",
          "backgroundColor": "#ffffff",
          "textColor": "#000000",
          "bold": false,
          "italic": false
        },
        {
          "content": "25",
          "backgroundColor": "#ffffff",
          "textColor": "#000000",
          "bold": false,
          "italic": false
        }
      ]
    ]
  }
}

Response: 200 OK
{
  "success": true,
  "latex_code": "\\begin{tabular}{|c|c|}\n\\hline\n\\textbf{Name} & \\textbf{Age} \\\\\n...",
  "message": "Table LaTeX generated successfully"
}
```

### Preview Table
```http
POST /table/preview
Content-Type: application/json

{
  "data": {
    "cells": [[...]]
  }
}

Response: 200 OK
{
  "success": true,
  "latex_code": "\\begin{tabular}...",
  "preview": "Table preview generated"
}
```

### Compile Table
```http
POST /table/compile
Content-Type: application/json

{
  "latex_code": "\\begin{tabular}...",
  "output_format": "pdf"
}

Response: 200 OK
Content-Type: application/pdf
[Binary PDF Data]
```

---

## 🖼️ Image to LaTeX

### Extract Formula (Pix2Tex)
```http
POST /image-to-latex/pix2tex-formula
Content-Type: multipart/form-data

image=<binary image file>

Response: 200 OK
{
  "success": true,
  "error": null,
  "data": {
    "latex_code": "\\documentclass{article}\n\\usepackage{amsmath}\n\\begin{document}\n$E = mc^2$\n\\end{document}",
    "original_text": "E = mc^2"
  }
}

Error Response:
{
  "success": false,
  "error": "Error message",
  "data": {
    "original_text": "Partial extraction..."
  }
}
```

### Extract Content (Gemini AI)
```http
POST /image-to-latex/gemini-extract
Content-Type: multipart/form-data

image=<binary image file>

Response: 200 OK
{
  "success": true,
  "error": null,
  "data": {
    "content": "Extracted mathematical content or text...",
    "summary": "Brief description of the image content..."
  }
}
```

### Extract Text (OCR)
```http
POST /image-to-latex/ocr-text
Content-Type: multipart/form-data

image=<binary image file>

Response: 200 OK
{
  "success": true,
  "error": null,
  "data": {
    "text": "Extracted and improved text",
    "latex_code": "\\documentclass{article}\n\\begin{document}\nExtracted text\n\\end{document}",
    "original_text": "Original OCR output",
    "improved": true,
    "improvement_error": null
  }
}

With Improvement Error:
{
  "success": true,
  "error": null,
  "data": {
    "text": "Original OCR output",
    "latex_code": "\\documentclass{article}...",
    "original_text": "Original OCR output",
    "improved": false,
    "improvement_error": "Gemini API error message"
  }
}
```

### Compile LaTeX
```http
POST /image-to-latex/compile
Content-Type: application/json

{
  "latex_code": "\\documentclass{article}...",
  "output_format": "pdf"
}

Response: 200 OK
Content-Type: application/pdf
[Binary PDF Data]

For PNG:
{
  "output_format": "png"
}

Response: 200 OK
Content-Type: image/png
[Binary PNG Data]
```

---

## 🏥 Health Check

```http
GET /health

Response: 200 OK
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## 🔑 Authentication Headers

For all protected endpoints, include:

```http
Authorization: Bearer <access_token>
```

Example:
```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ❌ Error Responses

### Standard Error Format
```json
{
  "detail": "Error message"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |

### Validation Error Example
```http
POST /auth/register
{
  "email": "invalid-email",
  "username": "a",
  "password": "123"
}

Response: 422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### Compilation Error Example
```http
POST /diagram/compile
{
  "latex_code": "\\invalid{code}",
  "output_format": "pdf"
}

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": "LaTeX compilation failed: undefined control sequence",
  "message": "Compilation failed"
}
```

---

## 📊 Node Types (Diagrams)

| Type | Description | Visual |
|------|-------------|--------|
| `rectangle` | Rectangular node | ▭ |
| `circle` | Circular node | ◯ |
| `diamond` | Diamond-shaped node | ◇ |

---

## 🔗 Connection Types (Diagrams)

| Type | Description | Visual |
|------|-------------|--------|
| `arrow` | Directional arrow | → |
| `line` | Simple line | — |

---

## 🎨 Color Format

Colors should be in hexadecimal format:
```
#RRGGBB

Examples:
#ffffff - White
#000000 - Black
#ff0000 - Red
#00ff00 - Green
#0000ff - Blue
#f0f0f0 - Light Gray
```

---

## 📏 Coordinate System (Diagrams)

- Origin: (0, 0)
- X-axis: Horizontal (left to right)
- Y-axis: Vertical (bottom to top)
- Units: Arbitrary (scaled in LaTeX)

Example positions:
```
(0, 0)    - Center
(5, 0)    - 5 units right
(-5, 0)   - 5 units left
(0, 5)    - 5 units up
(0, -5)   - 5 units down
```

---

## 📦 Output Formats

Both modules support two output formats:

| Format | MIME Type | Use Case |
|--------|-----------|----------|
| `pdf` | `application/pdf` | Document export, printing |
| `png` | `image/png` | Web display, embedding |

---

## 🔄 Complete Workflow Examples

### Workflow 1: Create Diagram
1. User draws diagram on canvas
2. POST `/diagram/generate` → Get LaTeX code
3. POST `/diagram/preview` → Preview result
4. POST `/diagram/compile` with `output_format=pdf` → Download PDF

### Workflow 2: Create Table
1. User edits table cells
2. POST `/table/generate` → Get LaTeX code
3. POST `/table/preview` → Preview result
4. POST `/table/compile` with `output_format=png` → Download PNG

### Workflow 3: Formula from Image
1. User uploads formula image
2. POST `/image-to-latex/pix2tex-formula` → Get LaTeX code
3. User edits LaTeX code if needed
4. POST `/image-to-latex/compile` → Download PDF

### Workflow 4: Text from Image
1. User uploads text image
2. POST `/image-to-latex/ocr-text` → Get extracted text + LaTeX
3. User reviews improved text
4. POST `/image-to-latex/compile` → Download result

---

## 🧪 Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:8000/auth/login \
  -F "username=johndoe" \
  -F "password=securepass123"
```

### Generate Diagram Example
```bash
curl -X POST http://localhost:8000/diagram/generate \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "nodes": [{"id":"n1","x":0,"y":0,"text":"Test","type":"rectangle","fillColor":"#ffffff","strokeColor":"#000000","textColor":"#000000","strokeWidth":2}],
      "connections": []
    }
  }'
```

### Upload Image Example
```bash
curl -X POST http://localhost:8000/image-to-latex/pix2tex-formula \
  -F "image=@/path/to/image.png"
```

### Compile with Auth Example
```bash
curl -X POST http://localhost:8000/diagram/compile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"latex_code":"\\begin{tikzpicture}...","output_format":"pdf"}' \
  --output diagram.pdf
```

---

## 📚 Interactive Documentation

For interactive API testing, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 💡 Tips

1. **Always store JWT token** after login for authenticated requests
2. **Use preview endpoints** before compilation to save resources
3. **Handle binary responses** properly when downloading PDF/PNG
4. **Check success field** in JSON responses for operation status
5. **Validate input** on frontend before sending to avoid validation errors

---

**Happy API Integration! 🚀**
