# High Level Architecture Diagram

```mermaid
graph TD
    A[User/MSP Technician] -->|Browser| B(Vercel Edge Network);
    B --> C[Next.js Static Frontend];
    C -->|API Call| D[Vercel Serverless Function];
    D -->|w/ System Prompt| E[Google Gemini API];
    E -->> D;
    D -->> C;
    C -->> A;

    subgraph "Our Application on Vercel"
        B
        C
        D
    end

    subgraph "External Service"
        E
    end
```