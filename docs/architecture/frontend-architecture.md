# Frontend Architecture

Organization: A standard Next.js src directory structure will be used (components, context, hooks, pages, services).

State Management: React's built-in Context API and hooks will be used.

Routing: Next.js's file-based router will be used. No protected routes are needed.

Services: A dedicated apiClient.ts service will encapsulate all fetch calls.