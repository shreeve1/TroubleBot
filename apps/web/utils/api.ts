export interface ChatRequest {
  message: string
  image?: {
    data: string
    type: string
  }
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

  private async handleResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      const textContent = await response.text()
      console.error('Non-JSON response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        url: response.url,
        content: textContent.substring(0, 500) // Log first 500 chars
      })
      throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}. This usually indicates a routing or load balancer issue.`)
    }

    try {
      return await response.json()
    } catch (error) {
      console.error('JSON parsing failed:', error)
      const textContent = await response.text()
      console.error('Response content:', textContent.substring(0, 500))
      throw new Error('Failed to parse JSON response. The server may have returned an HTML error page instead of JSON.')
    }
  }

  async sendMessage(message: string, image?: {data: string, type: string} | null): Promise<ChatResponse> {
    const requestBody: ChatRequest = { message }
    if (image) {
      requestBody.image = image
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await this.handleResponse(response)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      return data as ChatResponse
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  async generateTranscript(chatHistory: ChatHistory): Promise<TranscriptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatHistory }),
      })

      const data = await this.handleResponse(response)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate transcript')
      }

      return data as TranscriptResponse
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }
}

// Environment-aware base URL configuration
function getApiBaseUrl(): string {
  // In browser environment, use relative URLs for same-origin requests
  if (typeof window !== 'undefined') {
    return ''
  }
  
  // For server-side rendering, use environment variable if available
  return process.env.NEXT_PUBLIC_API_BASE_URL || ''
}

export const apiClient = new ApiClient(getApiBaseUrl())