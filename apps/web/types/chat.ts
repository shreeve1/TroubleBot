export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

export interface ChatHistory {
  messages: ChatMessage[]
  sessionId: string
  escalationReason?: string
}

export interface TranscriptRequest {
  chatHistory: ChatHistory
}

export interface TranscriptResponse {
  summary: string
  generatedAt: string
  wordCount: number
  sessionId: string
  success: boolean
}

export interface TranscriptError {
  error: string
  timestamp: string
  sessionId?: string
  success: false
}