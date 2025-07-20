# Data Models

## ChatMessage

Purpose: Represents a single message in the conversation between the user and the AI.

Key Attributes:

sender: ('user' | 'ai') - Identifies the message originator.

content: string - The text content of the message.

timestamp: string - An ISO 8601 timestamp.

### TypeScript Interface

```typescript
export interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}
```

Relationships: None. A conversation is an array of ChatMessage objects.