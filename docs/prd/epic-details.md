# Epic Details

## Epic 1: Foundation & Core Chat Functionality

### Story 1.1: Project Scaffolding

As a developer, I want a configured monorepo with separate packages for the web app and the API, so that I can begin development with a clean, organized structure.

Acceptance Criteria: 1. A new Git repository is initialized. 2. A monorepo structure is created. 3. Basic package.json files exist. 4. Top-level scripts are functional. 5. The initial structure is committed.

### Story 1.2: "Hello World" Serverless Deployment

As a developer, I want a basic serverless API endpoint deployed and accessible via a public URL, so that I can confirm the backend deployment pipeline is working.

Acceptance Criteria: 1. A "hello world" serverless function is created. 2. Configuration files for deployment exist. 3. A script can deploy the function. 4. The deployed endpoint returns a 200 OK JSON response.

### Story 1.3: Basic Frontend Page

As a user, I want a basic web page with a text input, a submit button, and a message display area, so that I can send a message and see responses.

Acceptance Criteria: 1. The web package serves a local webpage. 2. The page renders an input, a button, and a display area. 3. Components are functional but unstyled.

### Story 1.4: End-to-End "Echo" Connection

As a user, I want to type a message, click "Send", and see the response from the live backend displayed on the page, so that I can have a basic, confirmed conversation.

Acceptance Criteria: 1. On "Send", the frontend sends input to the deployed endpoint. 2. The backend response is received. 3. The response is displayed. 4. The input is cleared.

### Story 1.5: Core AI Integration

As a user, I want the backend to process my message using the pre-loaded Gemini instruction set and return the AI's actual response, so that I can interact with the specialized troubleshooting assistant.

Acceptance Criteria: 1. The serverless function integrates with the Gemini API. 2. The function is configured with the static instruction prompt. 3. The user's message is passed to the Gemini API. 4. The AI's response is returned and displayed.

## Epic 2: UI Implementation & Smart Transcript Feature

### Story 2.1: Implement Styled UI Component Library

As a developer, I want to create a library of styled UI components that are a pixel-perfect match to the Figma design, so that they can be used to build the main application interface.

Acceptance Criteria: 1. All core UI components from Figma are created as reusable components. 2. Styling is pixel-perfect. 3. Components are responsive.

### Story 2.2: Apply Full UI Design to Main Screen

As a user, I want to see the chat application with the full, polished UI layout and styling applied, so that the experience is professional and visually appealing.

Acceptance Criteria: 1. The main screen is rebuilt using the styled components. 2. The layout matches Figma. 3. All functionality from Epic 1 remains operational.

### Story 2.3: Session-End Escalation Prompt

As a technician, at the end of my session, I want to be prompted to confirm if the issue needs to be escalated, so that I can trigger the transcript generation process.

Acceptance Criteria: 1. An "End Session" button is added. 2. Clicking it triggers a modal. 3. The modal asks about escalation with "Yes" and "No" buttons.

### Story 2.4: Backend Transcript Generation Logic

As a developer, I want the backend to receive the full chat history and use the Gemini model to condense it into a summary of key troubleshooting steps, so that a smart transcript can be created.

Acceptance Criteria: 1. A new /generate-transcript endpoint is created. 2. It accepts a chat history payload. 3. It uses a summarization prompt with the Gemini API. 4. It returns a condensed text summary.

### Story 2.5: Display and Copy Transcript

As a technician who has confirmed an escalation, I want to see the generated smart transcript and be able to easily copy it to my clipboard, so that I can paste it into my ticketing system.

Acceptance Criteria: 1. After clicking "Yes", the frontend calls the transcript endpoint. 2. The summary is displayed in a read-only view. 3. A "Copy to Clipboard" button is present and functional. 4. A confirmation message is shown on copy.