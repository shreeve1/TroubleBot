# Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | ~5.4.5 | Main language for type safety and scalability | Industry standard for modern React development; enhances code quality. |
| Frontend Framework | Next.js | ~14.2.3 | React framework for the frontend application | Provides the best performance (static generation) and developer experience. |
| UI Component Library | Headless UI | ~2.0.4 | Unstyled, accessible UI components | Works perfectly with Tailwind CSS for fully custom, accessible designs. |
| State Management | React Hooks & Context | ~18.3.1 | For managing local and simple global state | Avoids adding external libraries for our simple state needs; keeps the app lean. |
| Backend Language | TypeScript | ~5.4.5 | For type-safe serverless functions | Maintains language consistency across the monorepo. |
| Backend Framework | Next.js API Routes | ~14.2.3 | Integrated framework for serverless functions | The most seamless way to build a backend within a Next.js/Vercel project. |
| API Style | REST / RPC-like | N/A | API communication style between frontend and backend | Simple, well-understood pattern for our straightforward API needs. |
| Database | None | N/A | No persistent data storage required for the application | The application is stateless, eliminating the need for a database. |
| Authentication | None | N/A | No user login or authentication is required | Simplifies the application significantly, as per PRD requirements. |
| Frontend Testing | Jest & React Testing Library | ~29.7.0 | For unit and component testing of the frontend | The standard, recommended testing stack for Next.js applications. |
| Backend Testing | Jest | ~29.7.0 | For unit testing of the API routes/serverless functions | Keeps the testing framework consistent across the stack. |
| E2E Testing | Playwright | ~1.44.1 | For end-to-end testing of critical user flows | Modern, powerful, and reliable for ensuring the full application works. |
| Build Tool | Turborepo | ~2.0.1 | High-performance build system for the monorepo | Vercel's own tool, designed for speed and efficiency in monorepos. |
| CI/CD | Vercel CI/CD | N/A | Continuous integration and deployment platform | Natively integrated with our hosting platform and Git provider. |
| Monitoring | Vercel Analytics | N/A | For performance and usage monitoring | Built-in, easy to use, and provides Core Web Vitals out of the box. |
| Logging | Vercel Log Drains | N/A | For capturing and managing serverless function logs | The native solution for logging on the Vercel platform. |
| CSS Framework | Tailwind CSS | ~3.4.3 | For all application styling | A utility-first framework that allows for rapid, custom UI development. |