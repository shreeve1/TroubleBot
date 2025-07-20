# High Level Architecture

## Technical Summary

The application will be built using a Jamstack architecture. The frontend, built with Next.js, will be statically generated and served globally from an edge network for maximum performance. All dynamic functionality, including communication with the Gemini API, will be handled by a backend built with Serverless Functions. This approach creates a highly scalable, secure, and cost-effective system that is perfectly suited for a high-performance, stateless web application. The entire project will be managed within a single Monorepo to streamline development.