# Deployment Architecture

A continuous deployment strategy using Vercel's native Git integration will be used. Pushes to branches create preview deployments; merges to main deploy to production. A CI pipeline will run tests and linting.