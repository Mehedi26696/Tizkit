# Frontend Integration Guide for TizKit Backend

This guide maps backend API endpoints to required frontend pages, components, and folder structure.

---

## 🗂️ Required Frontend Folder Structure

```
frontend/
├── app/
│   ├── page.tsx                     # Home/Landing page
│   ├── layout.tsx                   # Root layout with auth context
│   ├── globals.css                  # Global styles
│   │
│   ├── (auth)/                      # Auth route group (no auth required)
│   │   ├── login/
│   │   │   └── page.tsx            # POST /auth/login
│   │   ├── register/
│   │   │   └── page.tsx            # POST /auth/register
│   │   └── layout.tsx              # Auth pages layout
│   │
│   ├── (protected)/                 # Protected routes (auth required)
│   │   ├── layout.tsx              # Auth guard wrapper
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main dashboard with GET /auth/me
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx            # User profile (GET /auth/me)
│   │   │
│   │   ├── diagram/
│   │   │   ├── page.tsx            # Diagram list/overview
│   │   │   ├── create/
│   │   │   │   └── page.tsx        # Diagram editor
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx    # Edit existing diagram
│   │   │   │   └── view/
│   │   │   │       └── page.tsx    # View diagram preview
│   │   │   └── layout.tsx
│   │   │
│   │   ├── table/
│   │   │   ├── page.tsx            # Table list/overview
│   │   │   ├── create/
│   │   │   │   └── page.tsx        # Table editor
│   │   │   ├── [id]/
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx    # Edit existing table
│   │   │   │   └── view/
│   │   │   │       └── page.tsx    # View table preview
│   │   │   └── layout.tsx
│   │   │
│   │   └── image-to-latex/
│   │       ├── page.tsx            # Image converter dashboard
│   │       ├── formula/
│   │       │   └── page.tsx        # Formula extraction (Pix2Tex)
│   │       ├── ocr/
│   │       │   └── page.tsx        # OCR text extraction
│   │       ├── gemini/
│   │       │   └── page.tsx        # AI content extraction
│   │       └── layout.tsx
│   │
│   └── api/                         # Optional: Next.js API routes
│       └── ...
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx           # Login form component
│   │   ├── RegisterForm.tsx        # Registration form
│   │   ├── AuthGuard.tsx           # Protected route wrapper
│   │   └── UserMenu.tsx            # User dropdown menu
│   │
│   ├── diagram/
│   │   ├── DiagramCanvas.tsx       # Canvas for drawing diagrams
│   │   ├── DiagramToolbar.tsx      # Tools (shapes, connections)
│   │   ├── NodeEditor.tsx          # Edit node properties panel
│   │   ├── ConnectionEditor.tsx    # Edit connection properties
│   │   ├── DiagramPreview.tsx      # Preview generated diagram
│   │   └── DiagramExport.tsx       # Export/compile options
│   │
│   ├── table/
│   │   ├── TableEditor.tsx         # Spreadsheet-like table editor
│   │   ├── CellEditor.tsx          # Edit individual cell
│   │   ├── CellStylePanel.tsx      # Cell styling options
│   │   ├── TableToolbar.tsx        # Add/remove rows/columns
│   │   ├── TablePreview.tsx        # Preview generated table
│   │   └── TableExport.tsx         # Export/compile options
│   │
│   ├── image-to-latex/
│   │   ├── ImageUploader.tsx       # Drag-drop image upload
│   │   ├── ImagePreview.tsx        # Show uploaded image
│   │   ├── LatexCodeEditor.tsx     # Edit extracted LaTeX
│   │   ├── ExtractionMethod.tsx    # Choose method (Pix2Tex/OCR/Gemini)
│   │   └── ComparisonView.tsx      # Compare original vs improved
│   │
│   ├── latex/
│   │   ├── LatexEditor.tsx         # Code editor with syntax highlight
│   │   ├── LatexCompiler.tsx       # Compile button & options
│   │   ├── PdfViewer.tsx           # Display compiled PDF
│   │   ├── CompilationError.tsx    # Show compilation errors
│   │   └── DownloadButton.tsx      # Download PDF/PNG
│   │
│   ├── common/
│   │   ├── Navbar.tsx              # Main navigation
│   │   ├── Sidebar.tsx             # Side navigation
│   │   ├── Footer.tsx              # Footer
│   │   ├── LoadingSpinner.tsx      # Loading indicator
│   │   └── ErrorBoundary.tsx       # Error handling
│   │
│   └── ui/                          # shadcn/ui or custom UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── toast.tsx
│       └── ...
│
├── lib/
│   ├── api/
│   │   ├── client.ts               # Axios/fetch instance with interceptors
│   │   ├── auth.ts                 # Auth API functions
│   │   ├── diagram.ts              # Diagram API functions
│   │   ├── table.ts                # Table API functions
│   │   └── imageToLatex.ts         # Image-to-LaTeX API functions
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useUser.ts              # Current user data
│   │   ├── useDiagram.ts           # Diagram operations
│   │   ├── useTable.ts             # Table operations
│   │   ├── useImageToLatex.ts      # Image conversion
│   │   ├── useLatexCompiler.ts     # LaTeX compilation
│   │   └── useToast.ts             # Toast notifications
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state management
│   │   ├── DiagramContext.tsx      # Diagram editor state
│   │   └── TableContext.tsx        # Table editor state
│   │
│   └── utils/
│       ├── auth.ts                 # Token management
│       ├── validation.ts           # Form validation
│       ├── formatters.ts           # Data formatting
│       └── constants.ts            # App constants
│
├── types/
│   ├── index.ts                    # Main type exports
│   ├── auth.ts                     # Auth types
│   ├── diagram.ts                  # Diagram types
│   ├── table.ts                    # Table types
│   ├── imageToLatex.ts             # Image-to-LaTeX types
│   └── api.ts                      # Common API types
│
└── public/
    ├── images/
    ├── icons/
    └── ...
```

---

## 🔗 API Endpoint to Frontend Page Mapping

### Authentication Module

| Backend Endpoint | Method | Frontend Page | Component | Purpose |
|-----------------|--------|---------------|-----------|---------|
| `/auth/register` | POST | `app/(auth)/register/page.tsx` | `RegisterForm.tsx` | User registration |
| `/auth/login` | POST | `app/(auth)/login/page.tsx` | `LoginForm.tsx` | User login |
| `/auth/me` | GET | `app/(protected)/profile/page.tsx` | `UserMenu.tsx`, `AuthGuard.tsx` | Get current user |

**Required Pages:**
- ✅ `app/(auth)/login/page.tsx`
- ✅ `app/(auth)/register/page.tsx`
- ✅ `app/(protected)/profile/page.tsx`

**Required Components:**
- ✅ `components/auth/LoginForm.tsx`
- ✅ `components/auth/RegisterForm.tsx`
- ✅ `components/auth/AuthGuard.tsx`
- ✅ `components/auth/UserMenu.tsx`

---

### Diagram Module

| Backend Endpoint | Method | Frontend Page | Component | Purpose |
|-----------------|--------|---------------|-----------|---------|
| `/diagram/generate` | POST | `app/(protected)/diagram/create/page.tsx` | `DiagramCanvas.tsx` | Generate TikZ code |
| `/diagram/preview` | POST | `app/(protected)/diagram/create/page.tsx` | `DiagramPreview.tsx` | Preview diagram |
| `/diagram/compile` | POST | `app/(protected)/diagram/create/page.tsx` | `LatexCompiler.tsx` | Compile to PDF/PNG |

**Required Pages:**
- ✅ `app/(protected)/diagram/page.tsx` - List all diagrams
- ✅ `app/(protected)/diagram/create/page.tsx` - Create new diagram
- ✅ `app/(protected)/diagram/[id]/edit/page.tsx` - Edit diagram
- ✅ `app/(protected)/diagram/[id]/view/page.tsx` - View/preview diagram

**Required Components:**
- ✅ `components/diagram/DiagramCanvas.tsx` - Main drawing canvas
- ✅ `components/diagram/DiagramToolbar.tsx` - Shape tools
- ✅ `components/diagram/NodeEditor.tsx` - Edit node properties
- ✅ `components/diagram/ConnectionEditor.tsx` - Edit connections
- ✅ `components/diagram/DiagramPreview.tsx` - Show LaTeX preview
- ✅ `components/diagram/DiagramExport.tsx` - Export options

**Data Flow:**
1. User creates nodes/connections on canvas → `DiagramCanvas.tsx`
2. State stored as `DiagramData` (nodes + connections)
3. Click "Generate LaTeX" → POST `/diagram/generate` → Get LaTeX code
4. Click "Preview" → POST `/diagram/preview` → Show LaTeX code
5. Click "Compile" → POST `/diagram/compile` → Download PDF/PNG

---

### Table Module

| Backend Endpoint | Method | Frontend Page | Component | Purpose |
|-----------------|--------|---------------|-----------|---------|
| `/table/generate` | POST | `app/(protected)/table/create/page.tsx` | `TableEditor.tsx` | Generate table LaTeX |
| `/table/preview` | POST | `app/(protected)/table/create/page.tsx` | `TablePreview.tsx` | Preview table |
| `/table/compile` | POST | `app/(protected)/table/create/page.tsx` | `LatexCompiler.tsx` | Compile to PDF/PNG |

**Required Pages:**
- ✅ `app/(protected)/table/page.tsx` - List all tables
- ✅ `app/(protected)/table/create/page.tsx` - Create new table
- ✅ `app/(protected)/table/[id]/edit/page.tsx` - Edit table
- ✅ `app/(protected)/table/[id]/view/page.tsx` - View/preview table

**Required Components:**
- ✅ `components/table/TableEditor.tsx` - Spreadsheet editor
- ✅ `components/table/CellEditor.tsx` - Edit cell content
- ✅ `components/table/CellStylePanel.tsx` - Cell styling (colors, bold, italic)
- ✅ `components/table/TableToolbar.tsx` - Add/remove rows/cols
- ✅ `components/table/TablePreview.tsx` - Show LaTeX preview
- ✅ `components/table/TableExport.tsx` - Export options

**Data Flow:**
1. User edits table cells → `TableEditor.tsx`
2. State stored as `TableData` (cells with styling)
3. Click "Generate LaTeX" → POST `/table/generate` → Get LaTeX code
4. Click "Preview" → POST `/table/preview` → Show LaTeX code
5. Click "Compile" → POST `/table/compile` → Download PDF/PNG

---

### Image to LaTeX Module

| Backend Endpoint | Method | Frontend Page | Component | Purpose |
|-----------------|--------|---------------|-----------|---------|
| `/image-to-latex/pix2tex-formula` | POST | `app/(protected)/image-to-latex/formula/page.tsx` | `ImageUploader.tsx` | Extract formula |
| `/image-to-latex/gemini-extract` | POST | `app/(protected)/image-to-latex/gemini/page.tsx` | `ImageUploader.tsx` | AI extraction |
| `/image-to-latex/ocr-text` | POST | `app/(protected)/image-to-latex/ocr/page.tsx` | `ImageUploader.tsx` | OCR text |
| `/image-to-latex/compile` | POST | All above pages | `LatexCompiler.tsx` | Compile result |

**Required Pages:**
- ✅ `app/(protected)/image-to-latex/page.tsx` - Choose method
- ✅ `app/(protected)/image-to-latex/formula/page.tsx` - Pix2Tex formula extraction
- ✅ `app/(protected)/image-to-latex/ocr/page.tsx` - OCR text extraction
- ✅ `app/(protected)/image-to-latex/gemini/page.tsx` - Gemini AI extraction

**Required Components:**
- ✅ `components/image-to-latex/ImageUploader.tsx` - Upload images
- ✅ `components/image-to-latex/ImagePreview.tsx` - Show uploaded image
- ✅ `components/image-to-latex/LatexCodeEditor.tsx` - Edit extracted code
- ✅ `components/image-to-latex/ExtractionMethod.tsx` - Method selector
- ✅ `components/image-to-latex/ComparisonView.tsx` - Original vs improved

**Data Flow:**
1. User uploads image → `ImageUploader.tsx`
2. Choose method (Pix2Tex/OCR/Gemini) → `ExtractionMethod.tsx`
3. POST to respective endpoint → Get LaTeX code + original text
4. Show in `LatexCodeEditor.tsx` (editable)
5. Click "Compile" → POST `/image-to-latex/compile` → Download PDF/PNG

---

## 🎯 Core Features to Implement

### 1. Authentication System
- **Login/Register pages** with form validation
- **JWT token storage** in localStorage/cookies
- **Auth context** for global state
- **Protected routes** with AuthGuard
- **Auto logout** on 401 errors

### 2. Diagram Editor
- **Canvas-based editor** (use libraries like React Flow, Konva, or Fabric.js)
- **Drag-drop nodes** (rectangle, circle, diamond)
- **Draw connections** between nodes
- **Node properties panel** (color, text, stroke)
- **Real-time preview** of LaTeX code
- **Export to PDF/PNG**

### 3. Table Editor
- **Spreadsheet-like interface** (use libraries like react-datasheet or AG Grid)
- **Cell editing** with inline editor
- **Cell styling** (background color, text color, bold, italic)
- **Add/remove rows and columns**
- **Real-time LaTeX generation**
- **Export to PDF/PNG**

### 4. Image to LaTeX Converter
- **Multiple extraction methods** (Pix2Tex, OCR, Gemini)
- **Image upload** with drag-drop
- **Side-by-side comparison** (original vs improved)
- **LaTeX code editor** with syntax highlighting
- **Compilation and preview**
- **Download results**

---

## 📦 Recommended Libraries

### UI Components
- **shadcn/ui** - Modern UI components
- **Radix UI** - Accessible primitives
- **Lucide Icons** - Icon library

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### HTTP Client
- **Axios** - HTTP requests with interceptors
- **TanStack Query (React Query)** - Server state management

### Canvas/Drawing
- **React Flow** - Node-based diagrams
- **Konva.js + react-konva** - Canvas manipulation
- **Fabric.js** - Advanced canvas

### Table Editor
- **React Data Grid** - Spreadsheet-like tables
- **TanStack Table** - Headless table library

### Code Editor
- **Monaco Editor** - VS Code editor (for LaTeX)
- **CodeMirror** - Lightweight code editor

### PDF Viewer
- **react-pdf** - PDF rendering
- **pdfjs-dist** - PDF.js wrapper

### State Management
- **Zustand** - Lightweight state management
- **Context API** - Built-in React context

---

## 🔐 Authentication Implementation

### Login Flow

```typescript
// lib/api/auth.ts
export const login = async (username: string, password: string) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await apiClient.post('/auth/login', formData);
  const { access_token } = response.data;
  
  // Store token
  localStorage.setItem('access_token', access_token);
  
  return response.data;
};

// lib/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUser = async () => {
    try {
      const userData = await apiClient.get('/auth/me');
      setUser(userData.data);
    } catch (error) {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };
  
  return { user, loading, logout, refetch: fetchUser };
};
```

### Protected Route Component

```typescript
// components/auth/AuthGuard.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
}
```

---

## 🎨 Sample Page Implementation

### Diagram Create Page

```typescript
// app/(protected)/diagram/create/page.tsx
'use client';

import { useState } from 'react';
import DiagramCanvas from '@/components/diagram/DiagramCanvas';
import DiagramToolbar from '@/components/diagram/DiagramToolbar';
import DiagramPreview from '@/components/diagram/DiagramPreview';
import { diagramApi } from '@/lib/api/diagram';
import { DiagramData } from '@/types/diagram';

export default function CreateDiagramPage() {
  const [diagramData, setDiagramData] = useState<DiagramData>({
    nodes: [],
    connections: []
  });
  const [latexCode, setLatexCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await diagramApi.generate(diagramData);
      setLatexCode(response.latex_code);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCompile = async (format: 'pdf' | 'png') => {
    try {
      const blob = await diagramApi.compile(latexCode, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram.${format}`;
      a.click();
    } catch (error) {
      console.error('Compilation failed:', error);
    }
  };
  
  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r">
        <DiagramToolbar />
        <DiagramCanvas 
          data={diagramData} 
          onChange={setDiagramData} 
        />
      </div>
      <div className="w-1/2 p-4">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {isGenerating ? 'Generating...' : 'Generate LaTeX'}
        </button>
        
        {latexCode && (
          <>
            <DiagramPreview code={latexCode} />
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => handleCompile('pdf')}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Download PDF
              </button>
              <button 
                onClick={() => handleCompile('png')}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Download PNG
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## ✅ Implementation Checklist

### Phase 1: Setup & Authentication
- [ ] Setup Next.js project
- [ ] Install required dependencies
- [ ] Create API client with interceptors
- [ ] Implement auth context
- [ ] Create login/register pages
- [ ] Implement protected routes

### Phase 2: Diagram Module
- [ ] Create diagram editor UI
- [ ] Implement canvas with nodes/connections
- [ ] Add node/connection editing
- [ ] Integrate with `/diagram/generate`
- [ ] Add LaTeX preview
- [ ] Implement compilation & download

### Phase 3: Table Module
- [ ] Create table editor UI
- [ ] Implement cell editing
- [ ] Add styling options
- [ ] Integrate with `/table/generate`
- [ ] Add LaTeX preview
- [ ] Implement compilation & download

### Phase 4: Image to LaTeX
- [ ] Create image uploader
- [ ] Implement Pix2Tex integration
- [ ] Implement OCR integration
- [ ] Implement Gemini integration
- [ ] Add LaTeX code editor
- [ ] Add comparison view
- [ ] Implement compilation & download

### Phase 5: Polish & Deploy
- [ ] Add error handling
- [ ] Add loading states
- [ ] Implement toast notifications
- [ ] Add responsive design
- [ ] Test all features
- [ ] Deploy frontend

---

## 🚀 Quick Start Commands

```bash
# Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app

# Install dependencies
cd frontend
npm install axios zustand react-hook-form zod @radix-ui/react-dialog lucide-react

# Install shadcn/ui
npx shadcn-ui@latest init

# Add specific components
npx shadcn-ui@latest add button input card dialog dropdown-menu toast

# Run development server
npm run dev
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Flow](https://reactflow.dev/)

---

**Good luck with your frontend development! 🎉**
