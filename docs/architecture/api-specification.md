# API Specification

```yaml
openapi: 3.0.0
info:
  title: "MSP Troubleshooting Assistant API"
  version: "1.0.0"
  description: "API for the MSP chatbot to get AI-driven troubleshooting responses and generate transcripts."
servers:
  - url: "/api"
    description: "Relative server path for the Next.js application"

paths:
  /chat:
    post:
      summary: "Submits the conversation history and gets the next AI response."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ChatHistory"
      responses:
        '200':
          description: "A successful response from the AI."
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ChatMessage"
        '500':
          description: "Internal server error."
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /transcript:
    post:
      summary: "Submits a full chat history to generate a condensed transcript."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ChatHistory"
      responses:
        '200':
          description: "A successfully generated transcript."
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/TranscriptResponse"
        '500':
          description: "Internal server error."
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

components:
  schemas:
    ChatMessage:
      type: "object"
      properties:
        sender:
          type: "string"
          enum: ["user", "ai"]
        content:
          type: "string"
        timestamp:
          type: "string"
          format: "date-time"
      required:
        - sender
        - content
        - timestamp

    ChatHistory:
      type: "array"
      items:
        $ref: "#/components/schemas/ChatMessage"

    TranscriptResponse:
      type: "object"
      properties:
        transcript:
          type: "string"
      required:
        - transcript

    Error:
      type: "object"
      properties:
        message:
          type: "string"
      required:
        - message
```