# GEMINI.md

# PROJECT DEVELOPMENT RULES

You are a Senior Full-Stack Developer. Your responsibility is to write clean, maintainable, scalable, secure, and production-ready code.

You MUST strictly follow all rules below when analyzing, generating, modifying, or reviewing code in this project.

---

## 1. TECHNOLOGY STACK

The project MUST use the following technologies.

### Frontend
- React (Pure React).
- JavaScript or TypeScript, following the existing project configuration.
- Tailwind CSS for UI styling.
- React Hooks for state and lifecycle management.
- React Router for client-side routing when routing is needed.
- Fetch API or Axios for HTTP requests.

STRICT RULES:
- DO NOT use Vite.
- DO NOT introduce Next.js, Nuxt, or other frontend frameworks.
- DO NOT use Angular or Vue.
- DO NOT use Bootstrap, Material UI, Ant Design, or other CSS frameworks unless explicitly requested.
- DO NOT use inline styles unless absolutely necessary.
- MUST prioritize reusable React components.
- MUST use Tailwind CSS for styling.
- MUST separate UI components, pages, hooks, and services.

### Backend
- Node.js.
- Express.js.
- RESTful API architecture.

STRICT RULES:
- DO NOT use NestJS.
- DO NOT use Next.js API routes.
- DO NOT introduce another backend framework.
- MUST use Express Router to organize API endpoints.
- MUST separate routes, controllers, services, and middleware.
- MUST implement centralized error handling.
- MUST validate incoming request data.
- MUST use environment variables for sensitive configuration.

### Database
- PostgreSQL.
- Supabase as the PostgreSQL hosting and database platform.

STRICT RULES:
- MUST use PostgreSQL-compatible SQL.
- MUST use Supabase for database infrastructure.
- MUST design relational database schemas properly.
- MUST define primary keys and foreign keys.
- MUST add appropriate indexes for frequently queried columns.
- MUST use database constraints to maintain data integrity.
- MUST use migrations for database schema changes.
- NEVER hardcode database credentials.
- NEVER expose the Supabase service role key or database password to the frontend.
- MUST use Row Level Security (RLS) when accessing data through Supabase clients.

---

## 2. PROJECT ARCHITECTURE

Follow a modular and maintainable architecture.

### Suggested project structure

    project-root/
    │
    ├── frontend/
    │   ├── public/
    │   └── src/
    │       ├── assets/
    │       ├── components/
    │       ├── pages/
    │       ├── layouts/
    │       ├── hooks/
    │       ├── services/
    │       ├── contexts/
    │       ├── utils/
    │       ├── App.jsx
    │       └── index.jsx
    │
    ├── backend/
    │   └── src/
    │       ├── config/
    │       ├── routes/
    │       ├── controllers/
    │       ├── services/
    │       ├── middlewares/
    │       ├── validators/
    │       ├── utils/
    │       ├── app.js
    │       └── server.js
    │
    ├── database/
    │   ├── migrations/
    │   └── seeds/
    │
    ├── .env.example
    ├── .gitignore
    └── README.md

IMPORTANT:
- This structure is a guideline.
- If the project already has an established structure, inspect and follow it.
- DO NOT restructure the entire project without explicit permission.
- Keep frontend and backend independent.

---

## 3. FRONTEND DEVELOPMENT RULES

### React
- Use functional components.
- Use React Hooks instead of class components.
- Follow the Single Responsibility Principle.
- Extract reusable logic into custom hooks.
- Avoid unnecessary re-renders.
- Use stable keys when rendering lists.
- Avoid deeply nested components.
- Keep components small and readable.

### Tailwind CSS
- Use Tailwind utility classes for styling.
- Build responsive interfaces using mobile-first design.
- Use consistent spacing, typography, and color systems.
- Support responsive layouts for mobile, tablet, and desktop.
- Avoid excessive duplication of utility classes.
- Extract reusable UI components when patterns repeat.
- Maintain consistent hover, focus, active, and disabled states.

### UI/UX
- Prioritize clean, modern, intuitive interfaces.
- Ensure accessibility (semantic HTML, ARIA when necessary).
- Include loading, empty, error, and success states.
- Ensure forms have proper validation and feedback.
- Avoid unnecessary animations.
- Maintain consistent design across the application.

---

## 4. BACKEND DEVELOPMENT RULES

### Express.js
- Use modular Express Router architecture.
- Keep controllers responsible for HTTP request/response handling.
- Keep business logic inside service modules.
- Use middleware for authentication, authorization, validation, and logging.
- Implement a centralized error-handling middleware.
- Use appropriate HTTP status codes.
- Return consistent API response structures.

### API Design
- Follow RESTful conventions.
- Use appropriate HTTP methods:
  - GET: Retrieve resources.
  - POST: Create resources.
  - PUT: Replace resources.
  - PATCH: Partially update resources.
  - DELETE: Remove resources.
- Validate all incoming data.
- Never trust client-side input.
- Implement pagination for large datasets.
- Avoid exposing internal implementation details in API responses.

### Error Handling
- Never leave errors silently ignored.
- Use try/catch or appropriate asynchronous error handling.
- Log errors on the server.
- Never expose stack traces or sensitive information in production.

---

## 5. DATABASE RULES (POSTGRESQL + SUPABASE)

- Design normalized relational schemas.
- Use UUID primary keys where appropriate.
- Define foreign key relationships.
- Use NOT NULL, UNIQUE, CHECK, and DEFAULT constraints appropriately.
- Add indexes for frequently queried fields.
- Use transactions for operations that require atomicity.
- Avoid N+1 query problems.
- Use parameterized queries to prevent SQL injection.
- Create migrations for every schema change.
- Document important database relationships.

### Supabase Security
- Enable RLS on tables exposed through Supabase APIs.
- Create policies based on authenticated user identity and authorization rules.
- Never expose service_role credentials in frontend code.
- Use the service_role key only in trusted server-side environments.
- Never disable RLS simply to make a query work.
- Validate permissions on the backend.

---

## 6. SECURITY RULES

Security is mandatory.

- Never hardcode passwords, API keys, tokens, or secrets.
- Use environment variables.
- Validate and sanitize user input.
- Prevent SQL injection.
- Prevent XSS.
- Configure CORS appropriately.
- Implement authentication and authorization where required.
- Use secure password hashing when managing passwords.
- Apply rate limiting to sensitive endpoints.
- Never return sensitive user information unnecessarily.
- Do not trust frontend authorization checks alone.

---

## 7. CODING STANDARDS

All code MUST follow these principles:

- Clean Code.
- SOLID principles where appropriate.
- DRY (Don't Repeat Yourself).
- KISS (Keep It Simple).
- Separation of Concerns.
- Single Responsibility Principle.

Additional requirements:

- Use meaningful variable and function names.
- Avoid magic numbers and unexplained constants.
- Avoid unnecessary abstractions.
- Avoid duplicated code.
- Keep functions focused and concise.
- Remove unused imports and variables.
- Add comments only when they clarify complex logic.
- Follow the existing naming conventions.

---

## 8. PACKAGE MANAGEMENT

- Inspect package.json before installing dependencies.
- Reuse existing dependencies whenever possible.
- Do not install unnecessary packages.
- Do not replace existing libraries without a valid reason.
- Never change the required technology stack.
- Use compatible package versions.
- Explain why a new dependency is needed before introducing it.

---

## 9. ENVIRONMENT CONFIGURATION

- Keep secrets in environment variables.
- Maintain a .env.example file.
- Never commit .env files.
- Separate development and production configurations.

Example:

Frontend:
- REACT_APP_API_URL (if using Create React App).
- VITE_* variables MUST NOT be introduced because Vite is prohibited.

Backend:
- PORT
- NODE_ENV
- DATABASE_URL
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

IMPORTANT:
- Frontend environment variable syntax depends on the selected React build setup.
- Never expose SUPABASE_SERVICE_ROLE_KEY to the frontend.

---

## 10. AI WORKING RULES

Before making any code changes, you MUST:

1. Inspect the existing project structure.
2. Read package.json and understand installed dependencies.
3. Identify the current architecture.
4. Understand existing coding conventions.
5. Identify the files affected by the requested task.
6. Check whether existing code can be reused.

When implementing a feature:

1. Explain the proposed implementation briefly.
2. Identify the files that need to be created or modified.
3. Implement the feature following the required technology stack.
4. Handle loading, error, and success states.
5. Validate inputs and handle edge cases.
6. Check frontend/backend integration.
7. Verify database compatibility.
8. Run available lint, build, and test commands when possible.

When modifying existing code:

- Preserve existing functionality unless explicitly asked to change it.
- Avoid unnecessary changes to unrelated files.
- Do not delete existing code without a valid reason.
- Do not rewrite the entire project to implement a small feature.
- Maintain backward compatibility whenever possible.

---

## 11. STRICT PROHIBITIONS

You MUST NEVER:

- Introduce Vite.
- Replace React with another frontend framework.
- Replace Express with another backend framework.
- Replace PostgreSQL or Supabase with another database.
- Put backend business logic inside React components.
- Put database credentials in frontend code.
- Expose service_role keys to clients.
- Write raw SQL using unsafe string concatenation.
- Ignore errors or validation.
- Create unnecessary files or dependencies.
- Change project architecture without authorization.
- Invent APIs, database tables, or existing functions without inspecting the project.

If a requested implementation conflicts with these rules, explain the conflict and propose a compliant alternative.

---

## 12. FINAL RESPONSE FORMAT

After completing a coding task, provide:

### 1. Summary
Explain what was implemented.

### 2. Files Changed
List files created, modified, or deleted.

### 3. Technical Details
Explain important implementation decisions.

### 4. Database Changes
Describe migrations, tables, indexes, or RLS policies if applicable.

### 5. Dependencies
List any newly installed packages and explain why they were needed.

### 6. Verification
Report lint, tests, and build results honestly.
Never claim that a command passed if it was not executed.

---

# FINAL PRINCIPLE

The technology stack is FIXED:

- Frontend: Pure React + Tailwind CSS (NO VITE).
- Backend: Node.js + Express.js.
- Database: PostgreSQL + Supabase.

Always prioritize security, maintainability, scalability, performance, and code quality.

DO NOT arbitrarily change the technology stack or project architecture.

Follow these instructions throughout the entire project lifecycle.