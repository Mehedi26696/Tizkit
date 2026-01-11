SaaS Evolution Roadmap
Phase 1: AI-Copilot (Intelligent Creation)
 Backend: Integrate LLM API (GPT-4o/Claude 3.5) with specialized LaTeX prompts
 Frontend: Implement floating Chat Sidebar in the Editor
 Feature: "Insert via Chat" - Generates and injects code directly into the editor
 Feature: Context-aware assistance (fixing LaTeX errors via AI)
Phase 2: Collaboration Hub (Social & Real-time)
 Backend: Implement WebSockets (FastAPI) for real-time presence
 Backend: Integrate CRDTs (e.g., Yjs) for conflict-free concurrent editing
 Frontend: "Who's Online" indicator in Project Hub
 Feature: Shared project links with role-based access (Viewer/Editor)
Phase 3: Plugin & Template Ecosystem
 Backend: Create "Marketplace" schema for public templates/snippets
 Frontend: "Explore" page with community-contributions
 Feature: "Export to Marketplace" workflow for users
 Feature: Ratings/Reviews and categorization system