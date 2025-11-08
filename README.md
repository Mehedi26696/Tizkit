# TizKit Backend - LaTeX Helper API

A FastAPI-based backend service for LaTeX document generation, diagram creation, table generation, and image-to-LaTeX conversion.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Integration Guide](#frontend-integration-guide)
- [External Dependencies](#external-dependencies)

---

## 🎯 Overview

TizKit is a comprehensive LaTeX helper backend that provides:

- **Authentication**: User registration, login, and JWT-based authentication
- **Diagram Generation**: TikZ diagram creation from structured data
- **Table Generation**: LaTeX table creation with styling
- **Image to LaTeX**: OCR and AI-powered conversion of images to LaTeX
- **LaTeX Compilation**: PDF and PNG generation from LaTeX code

---

## 🛠 Tech Stack

- **Framework**: FastAPI 0.121.0
- **Database**: PostgreSQL (Supabase)
- **ORM**: SQLModel 0.0.27 / SQLAlchemy 2.0.44
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **AI/ML Services**:
  - Pix2Tex 0.1.4 (Formula extraction)
  - Gemini API (AI-powered LaTeX generation)
  - OCR.space API (Text extraction)
- **LaTeX Compilation**: Tectonic / PDFLaTeX
- **PDF Processing**: pdf2image 1.17.0
- **Image Processing**: OpenCV, Pillow, Albumentations

---

## 📁 Project Structure

```
backend/
├── main.py                          # Application entry point
├── requirements.txt                 # Python dependencies
├── alembic.ini                      # Database migration config
├── alembic/
│   ├── env.py                       # Alembic environment
│   └── versions/                    # Migration files
│       └── 928946a7bd93_create_users_table.py
└── src/
    ├── __init__.py                  # FastAPI app initialization
    ├── config.py                    # Configuration and settings
    ├── utils/
    │   └── database.py              # Database connection & session
    ├── auth/                        # Authentication module
    │   ├── models/
    │   │   └── user.py             # User database model
    │   ├── routes/
    │   │   └── auth_routes.py      # Auth endpoints
    │   ├── schemas/
    │   │   └── user_schemas.py     # Pydantic schemas
    │   └── services/
    │       ├── auth_service.py     # JWT token handling
    │       └── user_service.py     # User CRUD operations
    ├── Diagram/                     # Diagram generation module
    │   ├── routes/
    │   │   └── diagram_routes.py   # Diagram endpoints
    │   ├── schemas/
    │   │   └── diagram_schemas.py  # Diagram data models
    │   └── services/
    │       ├── compiler.py         # LaTeX compilation
    │       ├── diagram_service.py  # Diagram logic
    │       └── latex_generator.py  # TikZ code generation
    ├── Table/                       # Table generation module
    │   ├── routes/
    │   │   └── table_routes.py     # Table endpoints
    │   ├── schemas/
    │   │   └── table_schemas.py    # Table data models
    │   └── services/
    │       ├── compiler.py         # LaTeX compilation
    │       ├── table_service.py    # Table logic
    │       └── latex_generator.py  # Table LaTeX generation
    └── ImageToLatex/                # Image to LaTeX module
        ├── routes/
        │   ├── __init__.py         # Router aggregation
        │   ├── formula.py          # Formula extraction
        │   ├── ocr_text.py         # OCR text extraction
        │   └── compile.py          # LaTeX compilation
        ├── schemas/
        │   └── imageTolatex_schemas.py  # Request/response models
        └── services/
            ├── compiler.py         # LaTeX compilation
            ├── imageTolatex_services.py  # AI services (Pix2Tex, Gemini, OCR)
            └── latex_reconstruct.py      # LaTeX code wrapping
```

---

## 📦 Prerequisites

### Required Software

1. **Python 3.10+**
2. **PostgreSQL** (or Supabase account)
3. **LaTeX Distribution** (one of the following):
   - Tectonic (recommended) - [Download](https://tectonic-typesetting.github.io/)
   - MiKTeX or TeX Live
4. **Poppler** (for PDF to image conversion) - [Download](https://github.com/oschwartz10612/poppler-windows/releases/)

### External API Keys

- **Gemini API Key** (Google AI)
- **OCR.space API Key** (for OCR functionality)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install LaTeX Distribution

**Option A: Tectonic (Recommended)**
- Download from [Tectonic website](https://tectonic-typesetting.github.io/)
- Extract to a folder (e.g., `C:\tectonic`)
- Add path to `.env` file

**Option B: MiKTeX/TeX Live**
- Install from respective websites
- Ensure `pdflatex` is in system PATH

### 5. Install Poppler

- Download Poppler for Windows
- Extract to a folder (e.g., `C:\poppler-23.01.0`)
- Add path to `.env` file

---

## 🔐 Environment Variables

Create a `.env` file in the backend root directory:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Authentication
SECRET_KEY=your-super-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Application Settings
DEBUG=False
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# External APIs
GEMINI_API_KEY=your-gemini-api-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
OCR_SPACE_API_KEY=your-ocr-space-api-key
OCR_SPACE_BASE_URL=https://api.ocr.space/parse/image

# LaTeX Configuration
TECTONIC_PATH=C:\tectonic\tectonic.exe
POPPLER_PATH=C:\poppler-23.01.0\Library\bin
LATEX_TIMEOUT=60

# File Upload Limits
MAX_FILE_SIZE=10485760

# Email (Optional - for future use)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 💾 Database Setup

### 1. Create Database on Supabase

1. Sign up at [Supabase](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings → Database
4. Update `DATABASE_URL` in `.env`

### 2. Run Database Migrations

```bash
# Initialize Alembic (if not already initialized)
alembic init alembic

# Run migrations to create tables
alembic upgrade head
```

### 3. Verify Database Connection

The application will test the database connection on startup.

---

## ▶️ Running the Application

### Development Mode (with auto-reload)

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn src:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
uvicorn src:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔌 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user (OAuth2) | ❌ |
| GET | `/auth/me` | Get current user info | ✅ |

#### POST `/auth/register`
**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2025-11-08T10:30:00",
  "updated_at": null
}
```

#### POST `/auth/login`
**Request Body (form-data):**
```
username: johndoe
password: securepassword
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

#### GET `/auth/me`
**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
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

### Diagram Generation (`/diagram`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/diagram/generate` | Generate TikZ diagram LaTeX | ❌ |
| POST | `/diagram/preview` | Preview diagram LaTeX | ❌ |
| POST | `/diagram/compile` | Compile diagram to PDF/PNG | ❌ |

#### POST `/diagram/generate`
**Request Body:**
```json
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
```

**Response:**
```json
{
  "success": true,
  "latex_code": "\\begin{tikzpicture}...",
  "message": "Diagram LaTeX generated successfully"
}
```

#### POST `/diagram/compile`
**Request Body:**
```json
{
  "latex_code": "\\begin{tikzpicture}...",
  "output_format": "pdf"
}
```

**Response:** Binary stream (PDF or PNG)

---

### Table Generation (`/table`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/table/generate` | Generate table LaTeX | ❌ |
| POST | `/table/preview` | Preview table LaTeX | ❌ |
| POST | `/table/compile` | Compile table to PDF/PNG | ❌ |

#### POST `/table/generate`
**Request Body:**
```json
{
  "data": {
    "cells": [
      [
        {
          "content": "Header 1",
          "backgroundColor": "#f0f0f0",
          "textColor": "#000000",
          "bold": true,
          "italic": false
        }
      ]
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "latex_code": "\\begin{tabular}...",
  "message": "Table LaTeX generated successfully"
}
```

#### POST `/table/compile`
**Request Body:**
```json
{
  "latex_code": "\\begin{tabular}...",
  "output_format": "pdf"
}
```

**Response:** Binary stream (PDF or PNG)

---

### Image to LaTeX (`/image-to-latex`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/image-to-latex/pix2tex-formula` | Extract formula from image | ❌ |
| POST | `/image-to-latex/gemini-extract` | Extract content using Gemini | ❌ |
| POST | `/image-to-latex/ocr-text` | Extract text using OCR | ❌ |
| POST | `/image-to-latex/compile` | Compile LaTeX to PDF/PNG | ❌ |

#### POST `/image-to-latex/pix2tex-formula`
**Request:** multipart/form-data
```
image: <file>
```

**Response:**
```json
{
  "success": true,
  "error": null,
  "data": {
    "latex_code": "\\documentclass{article}...",
    "original_text": "E = mc^2"
  }
}
```

#### POST `/image-to-latex/gemini-extract`
**Request:** multipart/form-data
```
image: <file>
```

**Response:**
```json
{
  "success": true,
  "error": null,
  "data": {
    "content": "Extracted content...",
    "summary": "Brief summary..."
  }
}
```

#### POST `/image-to-latex/ocr-text`
**Request:** multipart/form-data
```
image: <file>
```

**Response:**
```json
{
  "success": true,
  "error": null,
  "data": {
    "text": "Extracted text",
    "latex_code": "\\documentclass{article}...",
    "original_text": "Extracted text",
    "improved": true
  }
}
```

#### POST `/image-to-latex/compile`
**Request Body:**
```json
{
  "latex_code": "\\documentclass{article}...",
  "output_format": "pdf"
}
```

**Response:** Binary stream (PDF or PNG)

---

## 🎨 Frontend Integration Guide

### Required Frontend Structure

Based on the API endpoints, your frontend should have the following structure:

```
frontend/
├── app/
│   ├── (auth)/                      # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── register/
│   │   │   └── page.tsx            # Registration page
│   │   └── profile/
│   │       └── page.tsx            # User profile page
│   ├── diagram/                     # Diagram features
│   │   ├── create/
│   │   │   └── page.tsx            # Diagram editor
│   │   ├── preview/
│   │   │   └── page.tsx            # Diagram preview
│   │   └── compile/
│   │       └── page.tsx            # Diagram compilation
│   ├── table/                       # Table features
│   │   ├── create/
│   │   │   └── page.tsx            # Table editor
│   │   ├── preview/
│   │   │   └── page.tsx            # Table preview
│   │   └── compile/
│   │       └── page.tsx            # Table compilation
│   ├── image-to-latex/              # Image conversion features
│   │   ├── formula/
│   │   │   └── page.tsx            # Formula extraction
│   │   ├── ocr/
│   │   │   └── page.tsx            # OCR text extraction
│   │   └── gemini/
│   │       └── page.tsx            # AI-powered extraction
│   └── dashboard/
│       └── page.tsx                 # Main dashboard
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── diagram/
│   │   ├── DiagramEditor.tsx       # Canvas for creating diagrams
│   │   ├── NodeEditor.tsx          # Edit node properties
│   │   └── ConnectionEditor.tsx    # Edit connections
│   ├── table/
│   │   ├── TableEditor.tsx         # Table cell editing
│   │   └── CellStyleEditor.tsx     # Style individual cells
│   ├── image-to-latex/
│   │   ├── ImageUploader.tsx       # Upload images
│   │   └── LatexPreview.tsx        # Preview LaTeX code
│   ├── common/
│   │   ├── LatexCompiler.tsx       # Compile LaTeX
│   │   └── PdfViewer.tsx           # Display compiled PDF
│   └── ui/
│       └── ...                      # UI components (shadcn/ui, etc.)
├── lib/
│   ├── api/
│   │   ├── auth.ts                  # Auth API calls
│   │   ├── diagram.ts               # Diagram API calls
│   │   ├── table.ts                 # Table API calls
│   │   └── imageToLatex.ts          # Image to LaTeX API calls
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication hook
│   │   └── useLatexCompiler.ts      # LaTeX compilation hook
│   └── utils/
│       ├── apiClient.ts             # Axios/Fetch wrapper
│       └── auth.ts                  # Token management
└── types/
    ├── auth.ts                      # Auth type definitions
    ├── diagram.ts                   # Diagram type definitions
    ├── table.ts                     # Table type definitions
    └── imageToLatex.ts              # Image to LaTeX types
```

### API Client Setup

Create an API client with authentication support:

**`lib/utils/apiClient.ts`:**
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Type Definitions

**`types/diagram.ts`:**
```typescript
export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  text: string;
  type: 'rectangle' | 'circle' | 'diamond';
  fillColor: string;
  strokeColor: string;
  textColor: string;
  strokeWidth: number;
}

export interface DiagramConnection {
  from: string;
  to: string;
  type: 'arrow' | 'line';
  color: string;
  strokeWidth: number;
}

export interface DiagramData {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

export interface DiagramGenerateResponse {
  success: boolean;
  latex_code: string;
  message?: string;
}
```

**`types/table.ts`:**
```typescript
export interface TableCell {
  content: string;
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface TableData {
  cells: TableCell[][];
}

export interface TableGenerateResponse {
  success: boolean;
  latex_code: string;
  message?: string;
}
```

**`types/auth.ts`:**
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
```

### API Service Functions

**`lib/api/auth.ts`:**
```typescript
import { apiClient } from '../utils/apiClient';
import { LoginCredentials, RegisterData, User, TokenResponse } from '@/types/auth';

export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
```

**`lib/api/diagram.ts`:**
```typescript
import { apiClient } from '../utils/apiClient';
import { DiagramData, DiagramGenerateResponse } from '@/types/diagram';

export const diagramApi = {
  generate: async (data: DiagramData): Promise<DiagramGenerateResponse> => {
    const response = await apiClient.post('/diagram/generate', { data });
    return response.data;
  },

  compile: async (latexCode: string, outputFormat: 'pdf' | 'png'): Promise<Blob> => {
    const response = await apiClient.post('/diagram/compile', 
      { latex_code: latexCode, output_format: outputFormat },
      { responseType: 'blob' }
    );
    return response.data;
  },

  preview: async (data: DiagramData): Promise<any> => {
    const response = await apiClient.post('/diagram/preview', { data });
    return response.data;
  },
};
```

**`lib/api/imageToLatex.ts`:**
```typescript
import { apiClient } from '../utils/apiClient';

export const imageToLatexApi = {
  pix2texFormula: async (imageFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/image-to-latex/pix2tex-formula', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  ocrText: async (imageFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/image-to-latex/ocr-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  geminiExtract: async (imageFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/image-to-latex/gemini-extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  compile: async (latexCode: string, outputFormat: 'pdf' | 'png'): Promise<Blob> => {
    const response = await apiClient.post('/image-to-latex/compile', 
      { latex_code: latexCode, output_format: outputFormat },
      { responseType: 'blob' }
    );
    return response.data;
  },
};
```

### Environment Variables for Frontend

Create `.env.local` in frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🔧 External Dependencies

### 1. Tectonic (LaTeX Compiler)
- **Purpose**: Compile LaTeX code to PDF
- **Installation**: Download from [Tectonic website](https://tectonic-typesetting.github.io/)
- **Configuration**: Set `TECTONIC_PATH` in `.env`

### 2. Poppler (PDF to Image)
- **Purpose**: Convert PDF to PNG
- **Installation**: Download from [Poppler releases](https://github.com/oschwartz10612/poppler-windows/releases/)
- **Configuration**: Set `POPPLER_PATH` in `.env`

### 3. Gemini API
- **Purpose**: AI-powered LaTeX generation and improvement
- **Setup**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Configuration**: Set `GEMINI_API_KEY` in `.env`

### 4. OCR.space API
- **Purpose**: Text extraction from images
- **Setup**: Get API key from [OCR.space](https://ocr.space/ocrapi)
- **Configuration**: Set `OCR_SPACE_API_KEY` in `.env`

---

## 📝 Notes

### Authentication Flow
1. User registers via `/auth/register`
2. User logs in via `/auth/login` to receive JWT token
3. Include token in `Authorization: Bearer <token>` header for protected endpoints
4. Refresh user data via `/auth/me`

### LaTeX Compilation
- The backend supports both PDF and PNG output formats
- PDF generation is faster and recommended for documents
- PNG generation is useful for previews and embedding

### Error Handling
All endpoints return structured error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly message"
}
```

### CORS Configuration
- The backend allows all origins by default in development
- Update `ALLOWED_ORIGINS` in `.env` for production

---

## 🚨 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Test connection with: `python -c "from src.utils.database import test_database_connection; test_database_connection()"`

### LaTeX Compilation Errors
- Ensure Tectonic/PDFLaTeX is installed and accessible
- Verify `TECTONIC_PATH` or system PATH includes the compiler
- Check LaTeX code syntax

### API Key Issues
- Verify API keys are valid and active
- Check API rate limits
- Ensure environment variables are loaded correctly

---

## 📄 License

[Your License Here]

---

## 👥 Contributors

[Your Team Information]

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Your Repo Issues]
- Email: [Your Email]

---

**Happy Coding! 🚀**
