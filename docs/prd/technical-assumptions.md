# Technical Assumptions

## Repository Structure: Monorepo

A monorepo is recommended to simplify development and dependency management between the frontend web application and the backend service.

## Service Architecture: Serverless

A serverless architecture (e.g., using a single cloud function) for the backend is ideal for scalability and cost-effectiveness.

## Testing Requirements: Unit + Integration

The project will require both unit tests (for individual components/functions) and integration tests (to verify that the frontend and backend work together correctly).

## Additional Technical Assumptions and Requests

The application must be containerized using Docker.

The core AI logic must be powered by the Gemini model.