# TizKit Documentation Index

Welcome to TizKit - A comprehensive LaTeX helper backend with diagram generation, table creation, and image-to-LaTeX conversion capabilities.

---

## 📚 Documentation Files

This backend comes with comprehensive documentation to help you set up, understand, and integrate with the API:

### 1. **README.md** - Main Setup Guide
**Purpose**: Complete backend setup instructions, environment configuration, and architecture overview.

**Contents**:
- ✅ Tech stack and dependencies
- ✅ Project structure explanation
- ✅ Installation instructions
- ✅ Database setup (PostgreSQL/Supabase)
- ✅ Environment variables configuration
- ✅ External dependencies setup (Tectonic, Poppler)
- ✅ Running the application
- ✅ API endpoints overview
- ✅ Troubleshooting guide

**When to use**: Start here for initial setup and understanding the backend architecture.

---

### 2. **FRONTEND_GUIDE.md** - Frontend Integration
**Purpose**: Detailed guide for frontend developers to understand what pages, components, and features need to be built.

**Contents**:
- ✅ Complete frontend folder structure
- ✅ API endpoint to page mapping
- ✅ Required components for each module
- ✅ Data flow diagrams
- ✅ Type definitions (TypeScript)
- ✅ API service function examples
- ✅ Authentication implementation
- ✅ Sample page implementations
- ✅ Recommended libraries
- ✅ Implementation checklist

**When to use**: Essential for frontend developers building the UI and integrating with the backend.

---

### 3. **API_REFERENCE.md** - Quick API Reference
**Purpose**: Quick lookup reference for all API endpoints with example requests and responses.

**Contents**:
- ✅ All endpoint URLs and methods
- ✅ Request body examples
- ✅ Response body examples
- ✅ Error response formats
- ✅ Authentication headers
- ✅ cURL examples for testing
- ✅ Node types and connection types
- ✅ Color and coordinate systems
- ✅ Complete workflow examples

**When to use**: Quick reference during development, testing, and debugging.

---

## 🎯 Quick Start Paths

### For Backend Developers
1. Read **README.md** for setup
2. Follow installation instructions
3. Set up environment variables
4. Run database migrations
5. Test API with interactive docs at `/docs`

### For Frontend Developers
1. Skim **README.md** for API overview
2. Deep dive into **FRONTEND_GUIDE.md**
3. Follow the folder structure
4. Implement authentication first
5. Use **API_REFERENCE.md** for endpoint details
6. Build features module by module

### For Project Managers
1. **README.md** - Understand tech stack and requirements
2. **FRONTEND_GUIDE.md** - See implementation checklist
3. **API_REFERENCE.md** - Understand API capabilities

---

## 🏗️ Project Architecture

```
TizKit Backend
│
├── Authentication Module
│   ├── User Registration
│   ├── User Login (JWT)
│   └── User Profile
│
├── Diagram Module
│   ├── Generate TikZ Diagram LaTeX
│   ├── Preview Diagram
│   └── Compile to PDF/PNG
│
├── Table Module
│   ├── Generate Table LaTeX
│   ├── Preview Table
│   └── Compile to PDF/PNG
│
└── Image to LaTeX Module
    ├── Pix2Tex Formula Extraction
    ├── OCR Text Extraction
    ├── Gemini AI Extraction
    └── Compile to PDF/PNG
```

---

## 🔗 API Endpoints Summary

| Module | Endpoints | Auth Required |
|--------|-----------|---------------|
| **Health** | `GET /health` | ❌ |
| **Auth** | `POST /auth/register`<br>`POST /auth/login`<br>`GET /auth/me` | ❌<br>❌<br>✅ |
| **Diagram** | `POST /diagram/generate`<br>`POST /diagram/preview`<br>`POST /diagram/compile` | ❌<br>❌<br>❌ |
| **Table** | `POST /table/generate`<br>`POST /table/preview`<br>`POST /table/compile` | ❌<br>❌<br>❌ |
| **Image-to-LaTeX** | `POST /image-to-latex/pix2tex-formula`<br>`POST /image-to-latex/ocr-text`<br>`POST /image-to-latex/gemini-extract`<br>`POST /image-to-latex/compile` | ❌<br>❌<br>❌<br>❌ |

---

## 🚀 Development Workflow

### Backend Development
1. Set up Python environment
2. Install dependencies from `requirements.txt`
3. Configure `.env` file
4. Set up PostgreSQL database
5. Run Alembic migrations
6. Install LaTeX compiler (Tectonic)
7. Run development server
8. Test with Swagger UI at `/docs`

### Frontend Development
1. Set up Next.js project
2. Install required packages
3. Create API client with interceptors
4. Implement authentication flow
5. Build diagram editor
6. Build table editor
7. Build image-to-LaTeX converter
8. Test integration with backend
9. Deploy frontend

---

## 📦 Key Dependencies

### Backend
- **FastAPI** - Web framework
- **SQLModel** - Database ORM
- **Pix2Tex** - Formula extraction
- **Tectonic** - LaTeX compilation
- **Gemini API** - AI features
- **OCR.space** - Text extraction

### Frontend (Recommended)
- **Next.js** - React framework
- **Axios** - HTTP client
- **shadcn/ui** - UI components
- **React Flow** - Diagram editor
- **Monaco Editor** - Code editor
- **react-pdf** - PDF viewer

---

## 🔐 Environment Variables Needed

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL=postgresql://...

# JWT
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60

# External APIs
GEMINI_API_KEY=your-key
OCR_SPACE_API_KEY=your-key

# LaTeX
TECTONIC_PATH=/path/to/tectonic
POPPLER_PATH=/path/to/poppler

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

See **README.md** for complete list and detailed explanations.

---

## 🎨 Frontend Structure Overview

```
frontend/
├── app/
│   ├── (auth)/          # Login, Register
│   └── (protected)/     # Dashboard, Diagram, Table, Image-to-LaTeX
│
├── components/
│   ├── auth/           # Auth components
│   ├── diagram/        # Diagram editor
│   ├── table/          # Table editor
│   ├── image-to-latex/ # Image converter
│   └── latex/          # LaTeX compiler, viewer
│
├── lib/
│   ├── api/            # API functions
│   ├── hooks/          # Custom hooks
│   └── utils/          # Utilities
│
└── types/              # TypeScript types
```

See **FRONTEND_GUIDE.md** for complete structure and implementation details.

---

## 🧪 Testing the API

### Using Swagger UI (Recommended)
1. Start the backend: `python main.py`
2. Open browser: `http://localhost:8000/docs`
3. Test endpoints interactively

### Using cURL
See **API_REFERENCE.md** for cURL examples.

### Using Postman
Import endpoints from Swagger JSON: `http://localhost:8000/openapi.json`

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Failed
**Solution**: Check `DATABASE_URL` in `.env` and ensure PostgreSQL is running.

### Issue: LaTeX Compilation Failed
**Solution**: Verify `TECTONIC_PATH` points to valid executable.

### Issue: 401 Unauthorized
**Solution**: Include `Authorization: Bearer <token>` header in protected requests.

### Issue: Import Errors
**Solution**: Ensure all dependencies installed: `pip install -r requirements.txt`

See **README.md** troubleshooting section for more solutions.

---

## 📖 Learning Path

### Day 1: Setup & Understanding
- [ ] Read README.md
- [ ] Set up backend environment
- [ ] Run the application
- [ ] Test with Swagger UI
- [ ] Understand API structure

### Day 2: Authentication
- [ ] Test auth endpoints
- [ ] Understand JWT flow
- [ ] Implement frontend login
- [ ] Implement protected routes

### Day 3-4: Diagram Module
- [ ] Study diagram endpoints
- [ ] Build diagram editor UI
- [ ] Integrate with API
- [ ] Test compilation

### Day 5-6: Table Module
- [ ] Study table endpoints
- [ ] Build table editor UI
- [ ] Integrate with API
- [ ] Test compilation

### Day 7-8: Image to LaTeX
- [ ] Study image endpoints
- [ ] Build upload interface
- [ ] Implement all extraction methods
- [ ] Test compilation

### Day 9: Polish & Testing
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] End-to-end testing

### Day 10: Deployment
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Configure production settings
- [ ] Final testing

---

## 💡 Best Practices

### Backend
- ✅ Always use environment variables for secrets
- ✅ Validate input data with Pydantic schemas
- ✅ Handle errors gracefully
- ✅ Log important events
- ✅ Use type hints
- ✅ Keep services modular

### Frontend
- ✅ Store JWT tokens securely
- ✅ Handle loading and error states
- ✅ Validate forms before submission
- ✅ Use TypeScript for type safety
- ✅ Implement proper error boundaries
- ✅ Make responsive designs

### API Integration
- ✅ Use interceptors for auth headers
- ✅ Handle 401 errors globally
- ✅ Cache responses when appropriate
- ✅ Show user-friendly error messages
- ✅ Implement retry logic for network errors

---

## 🎓 Additional Resources

### Documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [SQLModel Docs](https://sqlmodel.tiangolo.com/)
- [TikZ Manual](https://tikz.dev/)

### Tools
- [Swagger Editor](https://editor.swagger.io/)
- [Postman](https://www.postman.com/)
- [DB Browser for SQLite](https://sqlitebrowser.org/)

### Libraries
- [shadcn/ui](https://ui.shadcn.com/)
- [React Flow](https://reactflow.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

## 🤝 Contributing

### Backend Changes
1. Create feature branch
2. Make changes
3. Test with pytest
4. Create pull request
5. Update documentation

### Frontend Changes
1. Follow frontend structure in FRONTEND_GUIDE.md
2. Use TypeScript
3. Match existing code style
4. Test all features
5. Create pull request

---

## 📞 Support

Need help? Here's where to look:

1. **Setup Issues** → README.md Troubleshooting section
2. **API Questions** → API_REFERENCE.md
3. **Frontend Integration** → FRONTEND_GUIDE.md
4. **Code Examples** → Check each guide for examples
5. **Still Stuck?** → Create GitHub issue

---

## 📊 Project Status

### Completed Features
- ✅ Authentication system
- ✅ Diagram generation
- ✅ Table generation
- ✅ Image to LaTeX conversion
- ✅ LaTeX compilation
- ✅ API documentation

### Frontend Todo
- [ ] Authentication UI
- [ ] Diagram editor
- [ ] Table editor
- [ ] Image converter UI
- [ ] PDF viewer
- [ ] Deployment

See **FRONTEND_GUIDE.md** for complete checklist.

---

## 🎯 Next Steps

### For New Developers
1. ✅ Read this INDEX.md (you are here!)
2. → Go to **README.md** for backend setup
3. → Check **FRONTEND_GUIDE.md** for frontend requirements
4. → Use **API_REFERENCE.md** as needed during development

### For API Testing
1. → Start with **API_REFERENCE.md**
2. → Use Swagger UI at `/docs`
3. → Test with Postman or cURL

### For Frontend Development
1. → Deep dive **FRONTEND_GUIDE.md**
2. → Implement features step by step
3. → Refer to **API_REFERENCE.md** for endpoint details

---

## 📝 Summary

| Document | Purpose | Audience |
|----------|---------|----------|
| **INDEX.md** | Overview & navigation | Everyone |
| **README.md** | Setup & architecture | Backend developers |
| **FRONTEND_GUIDE.md** | Frontend integration | Frontend developers |
| **API_REFERENCE.md** | API quick reference | All developers |

---

**Welcome to TizKit! Start with README.md and let's build something amazing! 🚀**
