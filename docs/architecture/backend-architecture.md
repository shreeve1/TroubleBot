# Backend Architecture

Organization: Serverless functions will be implemented as Next.js API Routes in pages/api/. Core logic will be abstracted into service modules (e.g., geminiService.ts).

Patterns: API routes will be thin controllers, with logic handled by services. try...catch blocks are mandatory for error handling.