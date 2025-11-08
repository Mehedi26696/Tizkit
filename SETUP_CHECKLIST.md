# TizKit Setup Checklist

Use this checklist to ensure you have everything set up correctly for both backend and frontend development.

---

## 🎯 Backend Setup Checklist

### ✅ Prerequisites Installation

- [ ] **Python 3.10+** installed
  ```bash
  python --version
  ```

- [ ] **PostgreSQL** or **Supabase** account created
  - [ ] Database created
  - [ ] Connection string obtained

- [ ] **LaTeX Distribution** installed (choose one)
  - [ ] Tectonic (Recommended)
  - [ ] MiKTeX
  - [ ] TeX Live

- [ ] **Poppler** for PDF processing
  - [ ] Downloaded and extracted
  - [ ] Path noted

### ✅ API Keys Obtained

- [ ] **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] **OCR.space API Key** from [OCR.space](https://ocr.space/ocrapi)

### ✅ Project Setup

- [ ] Repository cloned
  ```bash
  git clone <repository-url>
  cd backend
  ```

- [ ] Virtual environment created
  ```bash
  python -m venv venv
  ```

- [ ] Virtual environment activated
  ```bash
  # Windows PowerShell
  .\venv\Scripts\Activate.ps1
  
  # Linux/Mac
  source venv/bin/activate
  ```

- [ ] Dependencies installed
  ```bash
  pip install -r requirements.txt
  ```

### ✅ Environment Configuration

- [ ] `.env` file created in backend root
- [ ] All required variables added:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
SECRET_KEY=your-super-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Application
DEBUG=False
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# External APIs
GEMINI_API_KEY=your-gemini-api-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
OCR_SPACE_API_KEY=your-ocr-space-api-key
OCR_SPACE_BASE_URL=https://api.ocr.space/parse/image

# LaTeX
TECTONIC_PATH=C:\tectonic\tectonic.exe
POPPLER_PATH=C:\poppler-23.01.0\Library\bin
LATEX_TIMEOUT=60

# File Uploads
MAX_FILE_SIZE=10485760
```

### ✅ Database Migration

- [ ] Alembic initialized (should already be done)
- [ ] Database migrations run
  ```bash
  alembic upgrade head
  ```

- [ ] Database connection tested
  ```bash
  python -c "from src.utils.database import test_database_connection; test_database_connection()"
  ```

### ✅ Application Launch

- [ ] Backend server started
  ```bash
  python main.py
  ```

- [ ] Server running on http://localhost:8000
- [ ] Health check endpoint working
  ```bash
  curl http://localhost:8000/health
  ```

- [ ] Swagger UI accessible at http://localhost:8000/docs
- [ ] ReDoc accessible at http://localhost:8000/redoc

### ✅ API Testing

- [ ] **Health Check** - GET /health
- [ ] **Register User** - POST /auth/register
- [ ] **Login User** - POST /auth/login
- [ ] **Get User Info** - GET /auth/me (with token)
- [ ] **Generate Diagram** - POST /diagram/generate
- [ ] **Generate Table** - POST /table/generate
- [ ] **Upload Image (Pix2Tex)** - POST /image-to-latex/pix2tex-formula
- [ ] **Compile LaTeX** - POST /diagram/compile or /table/compile

---

## 🎨 Frontend Setup Checklist

### ✅ Prerequisites Installation

- [ ] **Node.js 18+** installed
  ```bash
  node --version
  ```

- [ ] **npm** or **yarn** installed
  ```bash
  npm --version
  ```

### ✅ Project Setup

- [ ] Next.js project created
  ```bash
  npx create-next-app@latest frontend --typescript --tailwind --app
  cd frontend
  ```

- [ ] Required dependencies installed
  ```bash
  npm install axios zustand react-hook-form zod @radix-ui/react-dialog lucide-react
  ```

- [ ] shadcn/ui initialized
  ```bash
  npx shadcn-ui@latest init
  ```

- [ ] UI components added
  ```bash
  npx shadcn-ui@latest add button input card dialog dropdown-menu toast
  ```

### ✅ Environment Configuration

- [ ] `.env.local` file created
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

### ✅ Folder Structure Created

- [ ] **app/** directory structure
  - [ ] `(auth)/` route group
    - [ ] `login/page.tsx`
    - [ ] `register/page.tsx`
  - [ ] `(protected)/` route group
    - [ ] `dashboard/page.tsx`
    - [ ] `profile/page.tsx`
    - [ ] `diagram/create/page.tsx`
    - [ ] `table/create/page.tsx`
    - [ ] `image-to-latex/formula/page.tsx`
    - [ ] `image-to-latex/ocr/page.tsx`
    - [ ] `image-to-latex/gemini/page.tsx`

- [ ] **components/** directory structure
  - [ ] `auth/` folder
  - [ ] `diagram/` folder
  - [ ] `table/` folder
  - [ ] `image-to-latex/` folder
  - [ ] `latex/` folder
  - [ ] `common/` folder
  - [ ] `ui/` folder (shadcn)

- [ ] **lib/** directory structure
  - [ ] `api/` folder
    - [ ] `client.ts`
    - [ ] `auth.ts`
    - [ ] `diagram.ts`
    - [ ] `table.ts`
    - [ ] `imageToLatex.ts`
  - [ ] `hooks/` folder
    - [ ] `useAuth.ts`
    - [ ] `useLatexCompiler.ts`
  - [ ] `context/` folder
    - [ ] `AuthContext.tsx`
  - [ ] `utils/` folder

- [ ] **types/** directory structure
  - [ ] `auth.ts`
  - [ ] `diagram.ts`
  - [ ] `table.ts`
  - [ ] `imageToLatex.ts`

### ✅ Core Implementation

#### Authentication
- [ ] API client with interceptors created (`lib/utils/apiClient.ts`)
- [ ] Auth API functions created (`lib/api/auth.ts`)
- [ ] Auth context created (`lib/context/AuthContext.tsx`)
- [ ] Auth hook created (`lib/hooks/useAuth.ts`)
- [ ] Login form component (`components/auth/LoginForm.tsx`)
- [ ] Register form component (`components/auth/RegisterForm.tsx`)
- [ ] Auth guard component (`components/auth/AuthGuard.tsx`)
- [ ] Login page (`app/(auth)/login/page.tsx`)
- [ ] Register page (`app/(auth)/register/page.tsx`)
- [ ] Profile page (`app/(protected)/profile/page.tsx`)

#### Diagram Module
- [ ] Diagram types defined (`types/diagram.ts`)
- [ ] Diagram API functions (`lib/api/diagram.ts`)
- [ ] Diagram canvas component (`components/diagram/DiagramCanvas.tsx`)
- [ ] Diagram toolbar component (`components/diagram/DiagramToolbar.tsx`)
- [ ] Node editor component (`components/diagram/NodeEditor.tsx`)
- [ ] Connection editor component (`components/diagram/ConnectionEditor.tsx`)
- [ ] Diagram preview component (`components/diagram/DiagramPreview.tsx`)
- [ ] Diagram create page (`app/(protected)/diagram/create/page.tsx`)

#### Table Module
- [ ] Table types defined (`types/table.ts`)
- [ ] Table API functions (`lib/api/table.ts`)
- [ ] Table editor component (`components/table/TableEditor.tsx`)
- [ ] Cell editor component (`components/table/CellEditor.tsx`)
- [ ] Cell style panel component (`components/table/CellStylePanel.tsx`)
- [ ] Table toolbar component (`components/table/TableToolbar.tsx`)
- [ ] Table preview component (`components/table/TablePreview.tsx`)
- [ ] Table create page (`app/(protected)/table/create/page.tsx`)

#### Image-to-LaTeX Module
- [ ] Image-to-LaTeX types defined (`types/imageToLatex.ts`)
- [ ] Image-to-LaTeX API functions (`lib/api/imageToLatex.ts`)
- [ ] Image uploader component (`components/image-to-latex/ImageUploader.tsx`)
- [ ] Image preview component (`components/image-to-latex/ImagePreview.tsx`)
- [ ] LaTeX code editor component (`components/image-to-latex/LatexCodeEditor.tsx`)
- [ ] Comparison view component (`components/image-to-latex/ComparisonView.tsx`)
- [ ] Formula page (`app/(protected)/image-to-latex/formula/page.tsx`)
- [ ] OCR page (`app/(protected)/image-to-latex/ocr/page.tsx`)
- [ ] Gemini page (`app/(protected)/image-to-latex/gemini/page.tsx`)

#### Common Components
- [ ] LaTeX compiler component (`components/latex/LatexCompiler.tsx`)
- [ ] PDF viewer component (`components/latex/PdfViewer.tsx`)
- [ ] LaTeX editor component (`components/latex/LatexEditor.tsx`)
- [ ] Navbar component (`components/common/Navbar.tsx`)
- [ ] Sidebar component (`components/common/Sidebar.tsx`)
- [ ] Loading spinner component (`components/common/LoadingSpinner.tsx`)
- [ ] Error boundary component (`components/common/ErrorBoundary.tsx`)

### ✅ Application Launch

- [ ] Development server started
  ```bash
  npm run dev
  ```

- [ ] Application running on http://localhost:3000
- [ ] Backend connection working
- [ ] Authentication flow working
- [ ] All modules accessible

### ✅ Feature Testing

#### Authentication
- [ ] User can register
- [ ] User can login
- [ ] JWT token stored correctly
- [ ] Protected routes work
- [ ] User can view profile
- [ ] User can logout

#### Diagram Module
- [ ] Can create nodes on canvas
- [ ] Can connect nodes
- [ ] Can edit node properties
- [ ] Can generate LaTeX code
- [ ] Can preview diagram
- [ ] Can compile to PDF
- [ ] Can download PDF/PNG

#### Table Module
- [ ] Can create table cells
- [ ] Can edit cell content
- [ ] Can style cells (colors, bold, italic)
- [ ] Can add/remove rows/columns
- [ ] Can generate LaTeX code
- [ ] Can preview table
- [ ] Can compile to PDF
- [ ] Can download PDF/PNG

#### Image-to-LaTeX
- [ ] Can upload images
- [ ] Pix2Tex extraction works
- [ ] OCR extraction works
- [ ] Gemini extraction works
- [ ] Can edit extracted LaTeX
- [ ] Can compile to PDF
- [ ] Can download PDF/PNG

---

## 🔍 Verification Commands

### Backend Verification

```bash
# Check Python version
python --version

# Check virtual environment
which python  # Linux/Mac
where python  # Windows

# Test database connection
python -c "from src.utils.database import test_database_connection; test_database_connection()"

# Check if server is running
curl http://localhost:8000/health

# Check Tectonic
tectonic --version  # or check path

# Test API endpoints
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"testpass123","full_name":"Test User"}'
```

### Frontend Verification

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check if dependencies installed
npm list axios zustand

# Check if server is running
curl http://localhost:3000

# Build production version
npm run build

# Run linter
npm run lint
```

---

## 🐛 Common Issues & Quick Fixes

### Backend Issues

**Issue: ModuleNotFoundError**
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Issue: Database connection failed**
```bash
# Solution: Check DATABASE_URL in .env
# Verify PostgreSQL is running
# Test connection manually
```

**Issue: Tectonic not found**
```bash
# Solution: Check TECTONIC_PATH in .env
# Ensure Tectonic is installed
# Add to system PATH
```

**Issue: 500 Internal Server Error**
```bash
# Solution: Check logs in terminal
# Verify all environment variables set
# Check external API keys are valid
```

### Frontend Issues

**Issue: Cannot connect to backend**
```bash
# Solution: Verify backend is running on port 8000
# Check NEXT_PUBLIC_API_URL in .env.local
# Check CORS settings in backend
```

**Issue: Authentication not working**
```bash
# Solution: Check JWT token storage
# Verify token format in requests
# Check backend /auth/login endpoint
```

**Issue: Components not found**
```bash
# Solution: Check import paths
# Ensure files created in correct locations
# Restart development server
```

---

## 📚 Next Steps After Setup

### For Backend Developers
1. ✅ Review API endpoints in Swagger UI
2. ✅ Read code in `src/` directory
3. ✅ Understand service layer architecture
4. ✅ Test each endpoint manually
5. ✅ Add new features or fix bugs

### For Frontend Developers
1. ✅ Study FRONTEND_GUIDE.md
2. ✅ Implement authentication first
3. ✅ Build one module at a time
4. ✅ Test integration with backend
5. ✅ Add styling and polish

### For Full-Stack Developers
1. ✅ Set up both backend and frontend
2. ✅ Test end-to-end flows
3. ✅ Implement new features
4. ✅ Optimize performance
5. ✅ Deploy to production

---

## 📊 Progress Tracking

Use this section to track your setup progress:

**Backend Progress: [ ] / 100%**
- Prerequisites: [ ]
- Project Setup: [ ]
- Environment Config: [ ]
- Database: [ ]
- API Testing: [ ]

**Frontend Progress: [ ] / 100%**
- Prerequisites: [ ]
- Project Setup: [ ]
- Authentication: [ ]
- Diagram Module: [ ]
- Table Module: [ ]
- Image-to-LaTeX: [ ]

---

## 🎉 Setup Complete!

Once all items are checked:
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ All API endpoints working
- ✅ Authentication working
- ✅ All modules functional

**You're ready to start development!**

---

## 📞 Need Help?

If you encounter issues:
1. Check this checklist for missed steps
2. Review README.md troubleshooting section
3. Check API_REFERENCE.md for endpoint details
4. Review FRONTEND_GUIDE.md for implementation help
5. Create a GitHub issue with detailed error information

---

**Good luck with your setup! 🚀**
