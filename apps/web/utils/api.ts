export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  message: string
  timestamp: string
  status: string
  response: string
}

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

export interface ApiError {
  error: string
  timestamp: string
  status: string
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message')
    }

    return data as ChatResponse
  }

  async generateTranscript(chatHistory: ChatHistory): Promise<TranscriptResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatHistory }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate transcript')
    }

    return data as TranscriptResponse
  }
}

export const apiClient = new ApiClient()